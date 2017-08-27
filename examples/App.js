import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import Formsy from 'formsy-react-native';
import TextField from './components/TextField';

export default class App extends React.Component {
  handleSubmit = (data) => {
    alert(`Data is:\n${JSON.stringify(data, null, 2)}`);
  }

  render() {
    return (
      <View style={styles.container}>
        <Formsy.Form ref="form" onValidSubmit={this.handleSubmit}>
          <Text style={styles.header}>Formsy Demo</Text>
          <TextField
            style={styles.input}
            placeholder="Bobby"
            name="name"
            title="Name (required)"
            validationErrors={{
              "isDefaultRequiredValue": "This is a required field."
            }}
            required />
          <TextField
            style={styles.input}
            placeholder="bobby@bob.com"
            name="email"
            title="Email (required)"
            validations="isEmail"
            validationErrors={{
              "isDefaultRequiredValue": "This is a required field.",
              "isEmail": "Your must provide a valid email."
            }}
            required />
          <TextField
            style={styles.input}
            placeholder="42"
            name="age"
            title="Age"
            validations="minLength:2"
            validationErrors={{
              "isDefaultRequiredValue": "This is a required field.",
              "minLength": "Field must have a length gte 2."
            }} />
          <View style={styles.buttonWrapper}>
            <Formsy.Button style={styles.button} title="Reset" type="reset" />
            <Formsy.Button style={styles.button} title="Submit" type="submit" />
          </View>
        </Formsy.Form>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingTop: 40,
    backgroundColor: '#eee'
  },
  header: {
    fontSize: 24,
    paddingBottom: 10,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    backgroundColor: 'white',
    padding: 10,
  },
  buttonWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    width: 100
  }
});
