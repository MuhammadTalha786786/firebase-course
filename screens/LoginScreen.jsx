import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
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
import ForgotModal from './components/ForgotModal';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import {Avatar} from 'native-base';

const LoginScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('user2@gmail.com');
  const [Password, setPassword] = useState('123456');
  const [userLoginName, setUserLoginName] = useState();
  const [confirm, setConfirm] = useState(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState();
  const {onGoogleButtonPress} = useGoogleSignIn();
  const [photoUrl, setPhotoUrl] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState();
  const [forgotEmailError, setForgotEmailError] = useState();

  async function signInWithPhoneNumber(phoneNumber) {
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);

    setConfirm(confirmation);
  }

  const confirmingCode = async () => {
    console.log('verifying the code');
    try {
      const codeVerify = await confirm.confirm(code);
      let userData = await auth().currentUser.linkWithCredential(credential);
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

  const updateLogin = uid => {
    firestore()
      .collection('users')
      .doc(uid)
      .get()
      .then(snapshot => {
        console.log(snapshot.data().image, 'dasdad');
        LoginUser.userName = snapshot.data().name;
        LoginUser.photoURL = snapshot.data().image;
        dispatch(setSignIn(LoginUser));
      });
  };
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
      auth()
        .signInWithEmailAndPassword(email, Password)
        .then(loggedInUser => {
          if (loggedInUser) {
            console.log(loggedInUser, 'user login here');
            updateLogin(loggedInUser.user._user.uid);
            // getUserData(loggedInUser.user._user.uid);

            LoginUser.email = loggedInUser.user._user.email;
            LoginUser.uid = loggedInUser.user._user.uid;
          }
        })
        .catch(eror => {
          console.warn('Login fail!!', eror.message);
        });
    }
  };

  const forgotPassword = () => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (forgotEmail === '') {
      setForgotEmailError('Please Enter the Email');
    } else if (reg.test(forgotEmail) === false) {
      setForgotEmailError('Please Enter the Valid Email');
    } else {
      auth()
        .sendPasswordResetEmail(forgotEmail)
        .then(function (user) {
          console.log(user, 'user');
          alert('Please check your email...');
          setForgotEmailError('');
          setForgotEmail('');
        })
        .catch(function (e) {
          console.log(e);
        });
    }
  };

  // async function confirmCode() {
  //   try {
  //     await confirm.confirm(code);
  //   } catch (error) {
  //     console.log('Invalid code.');
  //   }
  // }

  //push notification using firebase cloud messaging

  useEffect(() => {
    requestUserPermission();
  }, []);

  useEffect(() => {
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {});
  }, []);

  const checkToken = async () => {
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();
    console.log(token, 'fcm token for android device');
  };

  async function requestUserPermission() {
    const authorizationStatus = await messaging().requestPermission();
    if (authorizationStatus) {
      console.log('Permission status:', authorizationStatus);
      checkToken();
    }
  }

  useEffect(() => {
    // Assume a message-notification contains a "type" property in the data payload of the screen to open

    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
    });

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );
        }
      });
  }, []);

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
          <View style={styles.loginTxtView}>
            <Avatar
              bg="indigo.500"
              alignSelf="center"
              size="xl"
              source={require('../images/logo.png')}
            />
            {/* <Text style={styles.loginText}>Login</Text> */}
          </View>
          <View
            style={{
              padding: 0,
              marginVertical: 0,
              textAlign: 'center',
              justifyContent: 'center',
              alignContent: 'center',
            }}>
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
                backgroundColor={StyleGuide.color.primary}
                onPress={login}
              />
              <Text
                style={styles.forgotPassword}
                onPress={() => setModalVisible(true)}>
                Forgot Password?
              </Text>
            </View>

            <View style={styles.GoogleSignInView}>
              <Divider style={styles.DividerStyle} />
              <Text style={styles.SignInText}>or sign in with</Text>
              <Divider style={styles.DividerStyle} />
            </View>

            <ForgotModal
              modalVisible={modalVisible}
              setModalVisible={setModalVisible}
              forgotEmail={forgotEmail}
              setForgotEmail={setForgotEmail}
              forgotPassword={forgotPassword}
              forgotEmailError={forgotEmailError}
              setForgotEmailError={setForgotEmailError}
              setError={setError}
            />

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
                      color: StyleGuide.color.primary,
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
  },

  loginTxtView: {
    marginVertical: 60,
  },
  loginText: {
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: StyleGuide.fontSize.medium,
    textAlign: 'center',
    alignItems: 'center',
    color: StyleGuide.color.primary,
  },

  forgotPassword: {
    textAlign: 'center',
    paddingVertical: 20,
    color: StyleGuide.color.primary,
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
    color: StyleGuide.color.dark,
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
    color: StyleGuide.color.dark,
  },
  accountView: {
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: widthPercentageToDP('5%'),
    flexDirection: 'row',
  },
});

export default LoginScreen;
