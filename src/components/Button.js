import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-native';

class FormsyButton extends React.Component {
  static displayName = 'Formsy.Button';

  static propTypes = {
    type: PropTypes.string,
  };

  static contextTypes = {
    formsy: PropTypes.object,
  };

  constructor(props) {
    super(props);
    if (!props.type || (props.type !== 'submit' && props.type !== 'reset')) {
      throw new Error('You must provide a valid type prop to Formsy.Button (submit, reset).');
    }
  }

  render() {
    const onPressHandler = this.props.type === 'submit' ? this.context.formsy.submit : this.context.formsy.reset;
    const injectedProps = {
      ...this.props,
      onPress: () => onPressHandler(),
    };
    return React.createElement(Button, injectedProps);
  }
}

export default FormsyButton;
