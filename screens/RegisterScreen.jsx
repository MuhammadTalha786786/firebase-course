import {View, Text, Alert, StyleSheet, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import {TextInput, Button} from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

// import auth from '@react-native-firebase/auth';

const RegisterScreen = ({navigation}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [Password, setPassword] = useState('');

  const RegisterUser = () => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    let userName = /^(?:[A-Za-z]+|\d+)$/;
    if (name === '') {
      Alert.alert('please enter the name');
    } else if (userName.test(name) === false) {
      Alert.alert('Correct the user name');
    } else if (reg.test(email) === false) {
      Alert.alert('please enter correct email');
    } else {
      database()
        .ref('/users/')
        .push()
        .set({
          name: name,
          email: email,
        })
        .then(
          auth()
            .createUserWithEmailAndPassword(email, Password)
            .then(res => {
              if (res) {
                console.warn('User registered successfully!');
                Alert.alert('The user has been registered....');
                setName('');
                setEmail('');
                setPassword('');
              }
            })
            .catch(error => console.warn(error.message)),
        );
    }
  };

  return (
    <View
      style={{
        padding: 0,
        marginVertical: 50,
        textAlign: 'center',
        justifyContent: 'center',
        alignContent: 'center',
      }}>
      <View style={{padding: 10}}>
        <TextInput
          label="User Name"
          value={name}
          onChangeText={text => setName(text)}
          mode="outlined"
          placeholder="abcx`"
        />
      </View>
      <View style={{padding: 10}}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={text => setEmail(text)}
          mode="outlined"
          placeholder="Please Enter the email"
        />
      </View>
      <View style={{padding: 10}}>
        <TextInput
          label="Password"
          value={Password}
          onChangeText={text => setPassword(text)}
          placeholder="Please Enter the Password"
          secureTextEntry={true}
          mode="outlined"
        />
      </View>
      <View style={{padding: 10}}>
        <Button
          style={{
            height: 50,
            borderRadius: 4,
            textAlign: 'center',
          }}
          mode="contained"
          onPress={RegisterUser}>
          Register
        </Button>

        <Text
          style={{color: '#6A0DAD', padding: 10, marginLeft: 296}}
          onPress={() => navigation.navigate('Login')}>
          Login Here?
        </Text>
      </View>
      <View>
        <TouchableOpacity
          style={[styles.buttonContainer, {backgroundColor: '#f5e7ea'}]}>
          <View style={styles.iconWrapper}>
            <FontAwesome
              name="google"
              style={styles.icon}
              size={22}
              color="#de4d41"
            />
          </View>
          <View style={styles.btnTxtWrapper}>
            <Text style={[styles.buttonText, {color: '#de4d41'}]}>
              Sign In with Google
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 10,
    width: '100%',
    height: 50,
    padding: 10,
    flexDirection: 'row',
    borderRadius: 3,
  },
  iconWrapper: {
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontWeight: 'bold',
  },
  btnTxtWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'Lato-Regular',
  },
});

export default RegisterScreen;
