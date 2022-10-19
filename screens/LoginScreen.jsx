import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import React, {useState} from 'react';
import {TextInput, Button} from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import {useDispatch} from 'react-redux';
import {setSignIn} from '../Redux/Auth/AuthReducer';
import database from '@react-native-firebase/database';

GoogleSignin.configure({
  webClientId:
    '135769240823-mn9m7kkm0o3mnb7rn5iap1omctn0tl99.apps.googleusercontent.com',
});
const LoginScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const [email, setEmail] = React.useState('mt3933110@gmail.com');
  const [Password, setPassword] = React.useState('123456');
  const [userLoginName, setUserLoginName] = useState();

  // If null, no SMS has been sent
  const [confirm, setConfirm] = useState(null);

  const [code, setCode] = useState('');

  console.warn(code, 'code');

  // Handle the button press
  async function signInWithPhoneNumber(phoneNumber) {
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    setConfirm(confirmation);
  }

  console.warn(confirm, 'confirm the messaging');

  const confirmingCode = async () => {
    console.log('verifying the code');
    try {
      const codeVerify = await confirm.confirm(code);
      console.warn(codeVerify, 'verify ');
      if (codeVerify) {
        navigation.navigate('Home');
      }
    } catch (error) {
      console.log('Invalid code.');
    }
  };

  async function onGoogleButtonPress() {
    // Get the users ID token
    const {idToken} = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    auth()
      .signInWithCredential(googleCredential)
      .then(user => {
        const LoginUser = {
          isLoggedIn: true,
          email: user.user._user.email,
          userName: user.user._user.displayName,
          uid: user.user._user.uid,
        };
        console.warn(user);
        console.log(user, 'user uuid');

        if (user) {
          navigation.navigate('Home', {
            email: user.user._user.email,
            userName: user.user._user?.displayName,
            uid: user.user._user.uid,
          });
          dispatch(setSignIn(LoginUser));
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
        database()
          .ref('users')
          .orderByChild('email')
          .equalTo(email)
          .once('value')
          .then(results => {
            results.forEach(snapshot => {
              console.log(snapshot.val().name, 'snapshot....');

              setUserLoginName(snapshot.val().name);
            });
          });
        console.log(userLoginName, 'val().name');
        const LoginUser = {
          isLoggedIn: true,
          email: loggedInUser.user._user.email,
          userName: userLoginName,
          uid: loggedInUser.user._user.uid,
        };

        if (loggedInUser) {
          dispatch(setSignIn(LoginUser));
          navigation.navigate('Home');
        }
      })
      .catch(eror => {
        console.warn('Login fail!!', eror);
      });
  };

  async function confirmCode() {
    try {
      await confirm.confirm(code);
    } catch (error) {
      console.log('Invalid code.');
    }
  }
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <View
        style={{
          padding: 0,
          marginVertical: 100,
          textAlign: 'center',
          justifyContent: 'center',
          alignContent: 'center',
        }}>
        <Text>Login Here </Text>
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
            onPress={login}>
            Login
          </Button>

          <Text
            style={{color: '#6A0DAD', padding: 10, marginLeft: 265}}
            onPress={() => navigation.navigate('RegisterScreen')}>
            Register Here?
          </Text>
        </View>

        <View style={{justifyContent: 'center', alignItems: 'center'}}>
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

        <View style={{justifyContent: 'center', alignItems: 'center'}}>
          <TouchableOpacity
            onPress={() => signInWithPhoneNumber('+92 3156028415')}
            style={[styles.buttonContainer, {backgroundColor: '#4169e1'}]}>
            <View style={styles.iconWrapper}>
              <Entypo
                name="message"
                style={styles.icon}
                size={22}
                color="white"
              />
            </View>
            <View style={styles.btnTxtWrapper}>
              <Text style={[styles.buttonText, {color: 'white'}]}>
                Sign in with Phone Number
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 10,
          }}>
          <TextInput
            placeholder="Please Enter the Code"
            value={code}
            onChangeText={text => setCode(text)}
            style={{width: '95%'}}
          />
          <Button
            style={{
              marginTop: 10,
              height: 50,
              borderRadius: 4,
              textAlign: 'center',
              width: '95%',
            }}
            mode="contained"
            onPress={confirmingCode}>
            Verify
          </Button>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 10,
    width: '95%',
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
