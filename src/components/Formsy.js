import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { utils } from '../utils';
import validationRules from '../validationRules';

class Formsy extends React.Component {
  static displayName = 'Formsy.Form'

  static propTypes = {
    children: PropTypes.node,
    disabled: PropTypes.bool,
    mapping: PropTypes.node,
    reset: PropTypes.func,
    onSuccess: PropTypes.func,
    onError: PropTypes.func,
    onChange: PropTypes.func,
    onSubmit: PropTypes.func,
    onInvalid: PropTypes.func,
    onInvalidSubmit: PropTypes.func,
    onValid: PropTypes.func,
    onValidSubmit: PropTypes.func,
    preventExternalInvalidation: PropTypes.bool,
    validationErrors: PropTypes.node,
  }

  static defaultProps = {
    onSuccess: () => {},
    onError: () => {},
    onSubmit: () => {},
    onValidSubmit: () => {},
    onInvalidSubmit: () => {},
    onValid: () => {},
    onInvalid: () => {},
    onChange: () => {},
    validationErrors: null,
    preventExternalInvalidation: false,
  }

  static childContextTypes = {
    formsy: PropTypes.object,
  }

  state = {
    isValid: true,
    isSubmitting: false,
    canChange: false,
  }

  getChildContext() {
    return {
      formsy: {
        attachToForm: this.attachToForm,
        detachFromForm: this.detachFromForm,
        validate: this.validate,
        isFormDisabled: this.isFormDisabled,
        isValidValue: (component, value) => this.runValidation(component, value).isValid,
        submit: this.submit,
        reset: this.reset,
      },
    };
  }

  // Add a map to store the inputs of the form, a model to store
  // the values of the form and register child inputs
  componentWillMount() {
    this.inputs = [];
  }

  componentDidMount() {
    this.validateForm();
  }

  componentWillUpdate() {
    // Keep a reference to input names before form updates,
    // to check if inputs has changed after render
    this.prevInputNames = this.inputs.map(component => component.props.name);
  }

  componentDidUpdate() {
    if (this.props.validationErrors && typeof this.props.validationErrors === 'object' && Object.keys(this.props.validationErrors).length > 0) {
      this.setInputValidationErrors(this.props.validationErrors);
    }

    const newInputNames = this.inputs.map(component => component.props.name);
    if (utils.arraysDiffer(this.prevInputNames, newInputNames)) {
      this.validateForm();
    }
  }

  getModel = () => {
    const currentValues = this.getCurrentValues();
    return this.mapModel(currentValues);
  }

  setInputValidationErrors = (errors) => {
    this.inputs.forEach((component) => {
      const name = component.props.name;
      const args = [{
        isValid: !(name in errors),
        validationError: typeof errors[name] === 'string' ? [errors[name]] : errors[name],
      }];
      component.setState(...args);
    });
  }

  getPristineValues = () => this.inputs.reduce((data, component) => {
    const name = component.props.name;
    data[name] = component.props.value;
    return data;
  }, {});

  getCurrentValues = () => this.inputs.reduce((data, component) => {
    const name = component.props.name;
    data[name] = component.state.value;
    return data;
  }, {});

  setFormPristine = (isPristine) => {
    this.setState({
      formSubmitted: !isPristine,
    });

    // Iterate through each component and set it as pristine
    // or "dirty".
    this.inputs.forEach((component) => {
      component.setState({
        formSubmitted: !isPristine,
        isPristine,
      });
    });
  }

  isFormDisabled = () => this.props.disabled;

  // Go through errors from server and grab the components
  // stored in the inputs map. Change their state to invalid
  // and set the serverError message
  updateInputsWithError = (errors) => {
    Object.keys(errors).forEach((name) => {
      const component = utils.find(this.inputs, comp => comp.props.name === name);
      if (!component) {
        throw new Error('You are trying to update an input that does not exist. ' +
        `Verify errors object with input names. ${JSON.stringify(errors)}`);
      }
      const args = [{
        isValid: this.props.preventExternalInvalidation || false,
        externalError: typeof errors[name] === 'string' ? [errors[name]] : errors[name],
      }];
      component.setState(...args);
    });
  }

  // Checks if the values have changed from their initial value
  isChanged = () => !utils.isSame(this.getPristineValues(), this.getCurrentValues());

  // Reset each key in the model to the original / initial / specified value
  resetModel = (data) => {
    this.inputs.forEach((component) => {
      const name = component.props.name;
      if (data && Object.prototype.hasOwnProperty.call(data, name)) {
        component.setValue(data[name]);
      } else {
        component.resetValue();
      }
    });
    this.validateForm();
  }

  mapModel = (model) => {
    if (this.props.mapping) {
      return this.props.mapping(model);
    }
    return model;
  }

  // Update model, submit to url prop and send the model
  submit = () => {
    // Trigger form as not pristine.
    // If any inputs have not been touched yet this will make them dirty
    // so validation becomes visible (if based on isPristine)
    this.setFormPristine(false);
    const model = this.getModel();
    this.props.onSubmit(model, this.resetModel, this.updateInputsWithError);
    this.state.isValid ? this.props.onValidSubmit(model, this.resetModel, this.updateInputsWithError)
      : this.props.onInvalidSubmit(model, this.resetModel, this.updateInputsWithError);
  }

  // Allow resetting to specified data
  reset = (data) => {
    this.setFormPristine(true);
    this.resetModel(data);
  }

  // Use the binded values and the actual input value to
  // validate the input and set its state. Then check the
  // state of the form itself
  validate = (component) => {
    // Trigger onChange
    if (this.state.canChange) {
      this.props.onChange(this.getCurrentValues(), this.isChanged());
    }

    const validation = this.runValidation(component);
    // Run through the validations, split them up and call
    // the validator IF there is a value or it is required
    component.setState({
      isValid: validation.isValid,
      isRequired: validation.isRequired,
      validationError: validation.error,
      externalError: null,
    }, this.validateForm);
  }

  // Checks validation on current value or a passed value
  runValidation = (component, value) => {
    const currentValues = this.getCurrentValues();
    const validationErrors = component.props.validationErrors;
    const validationError = component.props.validationError;
    value = value || component.state.value;

    const validationResults = this.runRules(value, currentValues, component.validations);
    const requiredResults = this.runRules(value, currentValues, component.requiredValidations);

    // the component defines an explicit validate function
    if (typeof component.validate === 'function') {
      validationResults.failed = component.validate() ? [] : ['failed'];
    }

    const isRequired = Object.keys(component.requiredValidations).length ? !!requiredResults.success.length : false;
    const isValid = !validationResults.failed.length && !(this.props.validationErrors && this.props.validationErrors[component.props.name]);

    return {
      isRequired,
      isValid: isRequired ? false : isValid,
      error: (function checkError() {
        if (isValid && !isRequired) {
          return [];
        }

        if (validationResults.errors.length) {
          return validationResults.errors;
        }

        if (this.props.validationErrors && this.props.validationErrors[component.props.name]) {
          return typeof this.props.validationErrors[component.props.name] === 'string' ? [this.props.validationErrors[component.props.name]] : this.props.validationErrors[component.props.name];
        }

        if (isRequired) {
          const error = validationErrors[requiredResults.success[0]];
          return error ? [error] : null;
        }

        if (validationResults.failed.length) {
          return validationResults.failed.map(failed => (validationErrors[failed] ? validationErrors[failed] : validationError)).filter((x, pos, arr) => arr.indexOf(x) === pos);
        }

        return false;
      }.call(this)),
    };
  }

  runRules = (value, currentValues, validations) => {
    const results = {
      errors: [],
      failed: [],
      success: [],
    };

    if (Object.keys(validations).length) {
      Object.keys(validations).forEach((validationMethod) => {
        if (validationRules[validationMethod] && typeof validations[validationMethod] === 'function') {
          throw new Error(`Formsy does not allow you to override default validations: ${validationMethod}`);
        }

        if (!validationRules[validationMethod] && typeof validations[validationMethod] !== 'function') {
          throw new Error(`Formsy does not have the validation rule: ${validationMethod}`);
        }

        if (typeof validations[validationMethod] === 'function') {
          const validation = validations[validationMethod](currentValues, value);
          if (typeof validation === 'string') {
            results.errors.push(validation);
            results.failed.push(validationMethod);
          } else if (!validation) {
            results.failed.push(validationMethod);
          }
          return false;
        } else if (typeof validations[validationMethod] !== 'function') {
          const validation = validationRules[validationMethod](currentValues, value, validations[validationMethod]);
          if (typeof validation === 'string') {
            results.errors.push(validation);
            results.failed.push(validationMethod);
          } else if (!validation) {
            results.failed.push(validationMethod);
          } else {
            results.success.push(validationMethod);
          }
          return false;
        }

        return results.success.push(validationMethod);
      });
    }

    return results;
  }

  // Validate the form by going through all child input components
  // and check their state
  validateForm = () => {
    // We need a callback as we are validating all inputs again. This will
    // run when the last component has set its state
    const onValidationComplete = () => {
      const allIsValid = this.inputs.every(component => component.state.isValid);

      this.setState({
        isValid: allIsValid,
      });

      if (allIsValid) {
        this.props.onValid();
      } else {
        this.props.onInvalid();
      }

      // Tell the form that it can start to trigger change events
      this.setState({
        canChange: true,
      });
    };

    // Run validation again in case affected by other inputs. The
    // last component validated will run the onValidationComplete callback
    this.inputs.forEach((component, index) => {
      const validation = this.runValidation(component);
      if (validation.isValid && component.state.externalError) {
        validation.isValid = false;
      }
      component.setState({
        isValid: validation.isValid,
        isRequired: validation.isRequired,
        validationError: validation.error,
        externalError: !validation.isValid && component.state.externalError ? component.state.externalError : null,
      }, index === this.inputs.length - 1 ? onValidationComplete : null);
    });

    // If there are no inputs, set state where form is ready to trigger
    // change event. New inputs might be added later
    if (!this.inputs.length) {
      this.setState({
        canChange: true,
      });
    }
  }

  // Method put on each input component to register
  // itself to the form
  attachToForm = (component) => {
    if (this.inputs.indexOf(component) === -1) {
      this.inputs.push(component);
    }

    this.validate(component);
  }

  // Method put on each input component to unregister
  // itself from the form
  detachFromForm = (component) => {
    const componentPos = this.inputs.indexOf(component);

    if (componentPos !== -1) {
      this.inputs = this.inputs.slice(0, componentPos).concat(this.inputs.slice(componentPos + 1));
    }

    this.validateForm();
  }

  render() {
    const {
      mapping,
      validationErrors,
      onSubmit,
      onValid,
      onValidSubmit,
      onInvalid,
      onInvalidSubmit,
      onChange,
      reset,
      preventExternalInvalidation,
      onSuccess,
      onError,
      ...nonFormsyProps
    } = this.props;

    return (
      <View {...nonFormsyProps} onSubmit={this.submit}>
        {this.props.children}
      </View>
    );
  }
}

export default Formsy;
