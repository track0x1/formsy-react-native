import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-native';

function FormsyButton(props) {
  if (!props.type || (props.type !== 'submit' && props.type !== 'reset')) {
    throw new Error('You must provide a valid type prop to Formsy.Button (submit, reset).');
  }

  const onPressHandler = props.type === 'submit' ? this.context.formsy.submit : this.context.formsy.reset;
  const injectedProps = {
    ...props,
    onPress: () => onPressHandler(),
  };

  return React.createElement(Button, injectedProps);
}

FormsyButton.displayName = 'Formsy.Button';
FormsyButton.propTypes = {
  type: PropTypes.string,
};
FormsyButton.contextTypes = {
  formsy: PropTypes.object,
};

export default FormsyButton;
