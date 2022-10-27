import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {useDispatch} from 'react-redux';
import {setSignIn} from '../Redux/Auth/AuthReducer';
import database from '@react-native-firebase/database';
import ButtonComponent from './components/ButtonComponent';
import {StyleGuide} from '../Utils/StyleGuide';
import {Divider} from 'react-native-paper';
import {widthPercentageToDP} from 'react-native-responsive-screen';
import TextInputComponent from './components/TextInputComponent';
import useGoogleSignIn from './components/GoogleSignIn';

const LoginScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('mtalha25800@gmail.com');
  const [Password, setPassword] = useState('123456');
  const [userLoginName, setUserLoginName] = useState();
  const [confirm, setConfirm] = useState(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState();
  const {onGoogleButtonPress} = useGoogleSignIn();
  const [photoUrl, setPhotoUrl] = useState();
  const [showPassword, setShowPassword] = useState(false);

  async function signInWithPhoneNumber(phoneNumber) {
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    setConfirm(confirmation);
  }

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

  const LoginUser = {
    isLoggedIn: true,
  };
  async function getUserData(uid) {
    console.log(uid, 'uid');
    database()
      .ref('users/' + uid)
      .once('value', snap => {
        LoginUser.userName = snap.val().name;
        LoginUser.photoURL = snap.val().image;
        dispatch(setSignIn(LoginUser));
      });
  }
  console.log(photoUrl, 'photos....');
  const login = async () => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (email === '') {
      setError('Please Enter the Email');
    } else if (reg.test(email) === false) {
      setError('Please Enter the Valid Email');
    } else if (Password === '') {
      setError('Please Enter the Password');
    } else {
      const a = await auth()
        .signInWithEmailAndPassword(email, Password)
        .then(loggedInUser => {
          if (loggedInUser) {
            console.log(loggedInUser, 'user login here');
            getUserData(loggedInUser.user._user.uid);

            LoginUser.email = loggedInUser.user._user.email;
            LoginUser.uid = loggedInUser.user._user.uid;
          }
        })
        .catch(eror => {
          console.warn('Login fail!!', eror.message);
        });
      return a;
    }
  };

  const forgotPassword = () => {
    auth()
      .sendPasswordResetEmail(email)
      .then(function (user) {
        console.log(user, 'user');
        alert('Please check your email...');
      })
      .catch(function (e) {
        console.log(e);
      });
  };

  async function confirmCode() {
    try {
      await confirm.confirm(code);
    } catch (error) {
      console.log('Invalid code.');
    }
  }

  console.log(photoUrl);
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <SafeAreaView style={styles.SafeAreaView}>
        <View>
          <View
            style={{
              padding: 0,
              marginVertical: 100,

              textAlign: 'center',
              justifyContent: 'center',
              alignContent: 'center',
            }}>
            <Text style={styles.loginText}>Login</Text>
            <View style={{padding: 0}}>
              <TextInputComponent
                value={email}
                setValue={setEmail}
                placeholder="Enter Email"
                mode="outlined"
                label="email"
                setError={setError}
                name={'email'}
              />
            </View>
            <View style={{padding: 0, marginVertical: 10}}>
              <TextInputComponent
                value={Password}
                setValue={setPassword}
                placeholder="Enter Password"
                mode="outlined"
                label="password"
                setError={setError}
                name={'visibility'}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                IsPassword={true}
              />
            </View>
            <View style={{padding: 10}}>
              <Text style={{color: 'red', fontSize: 12}}>{error}</Text>
              <ButtonComponent
                buttonTitle="SIGN IN"
                btnType="sign-in"
                color="#f5e7ea"
                backgroundColor="#6A0DAD"
                onPress={login}
              />
              <Text style={styles.forgotPassword} onPress={forgotPassword}>
                Forgot Password?
              </Text>
            </View>

            <View style={styles.GoogleSignInView}>
              <Divider style={styles.DividerStyle} />
              <Text style={styles.SignInText}>or sign in with</Text>
              <Divider style={styles.DividerStyle} />
            </View>

            {/* <View style={{justifyContent: 'center', alignItems: 'center'}}>
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
            </View> */}

            <View style={{padding: 10}}>
              <ButtonComponent
                buttonTitle="Sign In with Google"
                btnType="google"
                color="#de4d41"
                backgroundColor="#f5e7ea"
                onPress={onGoogleButtonPress}
              />
              <View style={styles.accountView}>
                <Text style={styles.accountText}>Don't have an account? </Text>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('RegisterScreen');
                  }}>
                  <Text
                    style={{
                      color: '#6A0DAD',
                      fontFamily: StyleGuide.fontFamily.medium,
                      fontSize: widthPercentageToDP('4%'),
                    }}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  SafeAreaView: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  loginText: {
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: StyleGuide.fontSize.medium,
    textAlign: 'center',
    alignItems: 'center',
    color: StyleGuide.color.heading,
  },

  forgotPassword: {
    textAlign: 'center',
    paddingVertical: 20,
    color: '#6A0DAD',
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: StyleGuide.fontSize.medium,
  },
  leftBorder: {
    flex: 0.4,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderWidth: 1,
  },

  GoogleSignInView: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    justifyContent: 'center',
    marginTop: widthPercentageToDP('12%'),
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: widthPercentageToDP('5%'),
  },
  SignInText: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: StyleGuide.fontSize.small,
    textAlign: 'center',
    alignItems: 'center',
    color: StyleGuide.color.paragraph,
    paddingHorizontal: 6,
  },

  DividerStyle: {
    flex: 1,
    color: StyleGuide.color.light,
    height: widthPercentageToDP('0.5%'),
  },
  accountText: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: StyleGuide.fontSize.small,
    color: StyleGuide.color.paragraph,
  },
  accountView: {
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: widthPercentageToDP('5%'),
    flexDirection: 'row',
  },
});

export default LoginScreen;
