import React from 'react';
import { Text, TextInput, StyleSheet, View } from 'react-native';
import Formsy from 'formsy-react-native';

class TextField extends React.Component {
  handleChange = (text) => this.props.setValue(text);

  maybeRenderErrorMessage = () => {
    let errorMessage = this.props.getErrorMessage();

    if (!this.props.isPristine() && errorMessage) {
      return (<Text style={{ color: 'red' }}>{errorMessage}</Text>);
    }
    return null;
  }

  render() {
    const localStyles = this.props.isFormInvalid() ? styles.error : undefined;

    return (
      <View style={styles.container}>
        <Text>{this.props.title}</Text>
        <TextInput
          onChangeText={this.handleChange}
          value={this.props.getValue()}
          {...this.props}
        />
        {this.maybeRenderErrorMessage()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 10
  },
  input: {
    backgroundColor: 'white'
  },
  error: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'red'
  },
});

export default Formsy.withFormsy(TextField);
