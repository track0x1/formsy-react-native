import React from 'react';
import PropTypes from 'prop-types';
import { utils, componentUtils } from '../utils';

function withFormsy(Component) {
  class WrappedComponent extends React.Component {
    static displayName = `withFormsy(${componentUtils.getDisplayName(Component)})`;

    static propTypes = {
      value: PropTypes.string,
      validations: PropTypes,
      required: PropTypes,
      name: PropTypes,
      innerRef: PropTypes,
    };

    static contextTypes = {
      formsy: PropTypes.object,
    }

    static defaultProps = {
      validationError: '',
      validationErrors: {},
      validations: Component.defaultProps ? Component.defaultProps.validations : undefined,
    }

    state = {
      value: componentUtils.getTruthyValue(this.props, Component.defaultProps, 'value'),
      isRequired: false,
      isValid: true,
      isPristine: true,
      pristineValue: componentUtils.getTruthyValue(this.props, Component.defaultProps, 'value'),
      validationError: [],
      externalError: null,
      formSubmitted: false,
    }

    componentWillMount() {
      const configure = () => {
        this.setValidations(this.props.validations, this.props.required);
        this.context.formsy.attachToForm(this);
      };

      if (!this.props.name) {
        throw new Error('Form Input requires a name property when used');
      }

      configure();
    }

    // We have to make the validate method is kept when new props are added
    componentWillReceiveProps(nextProps) {
      if (nextProps.validations && !utils.isSame(this.props.validations, nextProps.validations)) {
        // Only call setValidations when the validations prop has changed.
        // This allows `defaultProps.validations` to stay intact.
        this.setValidations(nextProps.validations, nextProps.required);
      }
    }

    componentDidUpdate(prevProps) {
      // If the value passed has changed, set it. If value is not passed it will
      // internally update, and this will never run
      if (!utils.isSame(this.props.value, prevProps.value)) {
        this.setValue(this.props.value);
      }

      // If validations or required is changed, run a new validation
      if (!utils.isSame(this.props.validations, prevProps.validations) || !utils.isSame(this.props.required, prevProps.required)) {
        this.context.formsy.validate(this);
      }
    }

    // Detach it when component unmounts
    componentWillUnmount() {
      this.context.formsy.detachFromForm(this);
    }

    setValidations = (validations, required) => {
      // Add validations to the store itself as the props object can not be modified
      this.validations = componentUtils.convertValidationsToObject(validations) || {};
      this.requiredValidations = required === true ? { isDefaultRequiredValue: true } : componentUtils.convertValidationsToObject(required);
    }

    // By default, we validate after the value has been set.
    // A user can override this and pass a second parameter of `false` to skip validation.
    setValue = (value, validate = true) => {
      if (!validate) {
        this.setState({
          value,
        });
      } else {
        this.setState({
          value,
          isPristine: false,
        }, () => {
          this.context.formsy.validate(this);
        });
      }
    }

    getValue = () => this.state.value;

    getErrorMessage = () => {
      const messages = this.getErrorMessages();
      return messages.length ? messages[0] : null;
    }

    getErrorMessages = () => (!this.isValid() || this.showRequired() ? (this.state.externalError || this.state.validationError || []) : []);

    hasValue = () => this.state.value !== '';

    resetValue = () => {
      this.setState({
        value: this.state.pristineValue,
        isPristine: true,
      }, () => {
        this.context.formsy.validate(this);
      });
    }

    isFormDisabled = () => this.context.formsy.isFormDisabled();

    isValid = () => this.state.isValid;

    isPristine = () => this.state.isPristine;

    isFormSubmitted = () => this.state.formSubmitted;

    isRequired = () => !!this.props.required;

    showRequired = () => this.state.isRequired;

    showError = () => !this.showRequired() && !this.isValid();

    isFormInvalid = () => !this.isValid() && !this.isPristine();

    isValidValue = value => this.context.formsy.isValidValue.call(null, this, value);

    render() {
      const { innerRef } = this.props;
      const propsForElement = {
        setValidations: this.setValidations,
        setValue: this.setValue,
        resetValue: this.resetValue,
        getValue: this.getValue,
        hasValue: this.hasValue,
        getErrorMessage: this.getErrorMessage,
        getErrorMessages: this.getErrorMessages,
        isFormDisabled: this.isFormDisabled,
        isValid: this.isValid,
        isPristine: this.isPristine,
        isFormSubmitted: this.isFormSubmitted,
        isRequired: this.isRequired,
        showRequired: this.showRequired,
        showError: this.showError,
        isValidValue: this.isValidValue,
        ...this.props,
      };

      if (innerRef) {
        propsForElement.ref = innerRef;
      }

      return <Component {...propsForElement} />;
    }
  }
  return WrappedComponent;
}

export default withFormsy;
