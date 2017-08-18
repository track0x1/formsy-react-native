import PropTypes from 'prop-types';
// import React from 'react';
import Form from './components/Formsy';
import withFormsy from './components/withFormsy';

// const emptyArray = [];
// const options = {};
const Formsy = {};

Formsy.Form = Form;
Formsy.withFormsy = withFormsy;
Formsy.propTypes = {
  setValidations: PropTypes.func,
  setValue: PropTypes.func,
  resetValue: PropTypes.func,
  getValue: PropTypes.func,
  hasValue: PropTypes.func,
  getErrorMessage: PropTypes.func,
  getErrorMessages: PropTypes.func,
  isFormDisabled: PropTypes.func,
  isValid: PropTypes.func,
  isPristine: PropTypes.func,
  isFormSubmitted: PropTypes.func,
  isRequired: PropTypes.func,
  showRequired: PropTypes.func,
  showError: PropTypes.func,
  isValidValue: PropTypes.func,
};
// Formsy.defaults = function defaults(passedOptions) {
//   options = passedOptions;
// };
// Formsy.addValidationRule = function addValidationRule(name, func) {
//   validationRules[name] = func;
// };

export default Formsy;
