import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import {TextInput, Button} from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

GoogleSignin.configure({
  webClientId:
    '135769240823-mn9m7kkm0o3mnb7rn5iap1omctn0tl99.apps.googleusercontent.com',
});
const LoginScreen = ({navigation}) => {
  const [email, setEmail] = React.useState('');
  const [Password, setPassword] = React.useState('');

  // If null, no SMS has been sent
  const [confirm, setConfirm] = useState(null);

  const [code, setCode] = useState('');

  // Handle the button press
  async function signInWithPhoneNumber(phoneNumber) {
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    setConfirm(confirmation);
  }

  console.warn(confirm, 'confirm the messaging');

  async function confirmCode() {
    try {
      await confirm.confirm(code);
    } catch (error) {
      console.log('Invalid code.');
    }
  }
  async function onGoogleButtonPress() {
    // Get the users ID token
    const {idToken} = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    auth()
      .signInWithCredential(googleCredential)
      .then(user => {
        console.warn(user);

        if (user) {
          navigation.navigate('Home', {
            email: user.additionalUserInfo.profile.email,
            pic: user.additionalUserInfo.profile.picture,
          });
        }
      })
      .catch(eror => {
        console.warn('Login fail!!', eror);
      });
  }
  const login = () => {
    auth()
      .signInWithEmailAndPassword(email, Password)
      .then(loggedInUser => {
        //console.log("Login Successful!");
        if (loggedInUser) {
          console.warn('the user logged in ....');
          navigation.navigate('Home');
        }
      })
      .catch(eror => {
        console.warn('Login fail!!', eror);
      });
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
          onPress={onGoogleButtonPress}>
          Login
        </Button>

        <Text
          style={{color: '#6A0DAD', padding: 10, marginLeft: 225}}
          onPress={() => navigation.navigate('RegisterScreen')}>
          Register Here?
        </Text>
      </View>

      <View>
        <TouchableOpacity
          onPress={onGoogleButtonPress}
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
              Sign in with Google
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View>
        <TouchableOpacity
          onPress={() => signInWithPhoneNumber('+92 3068628187')}
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
              Sign in with Phone Number
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
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Lato-Regular',
  },
});

export default LoginScreen;
