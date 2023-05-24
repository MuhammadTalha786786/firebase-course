import React, {useEffect, useState} from 'react';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import useGoogleSignIn from '../components/GoogleSignIn';
import auth from '@react-native-firebase/auth';
import {useDispatch} from 'react-redux';
import {setSignIn} from '../../Redux/Auth/AuthReducer';

interface loginUser {
  isLogin:boolean
  email:string
  uid:string
  isLoggedIn: boolean;
  userName: string;
  photoURL: string;
}
export const useLogin = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('user2@gmail.com');
  const [Password, setPassword] = useState('123456');
  const [userLoginName, setUserLoginName] = useState();
  const [confirm, setConfirm] = useState(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const {onGoogleButtonPress} = useGoogleSignIn();
  const [photoUrl, setPhotoUrl] = useState();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotEmailError, setForgotEmailError] = useState<string>();
  const [loader, setLoader] = useState<boolean>(false);

//   async function signInWithPhoneNumber(phoneNumber) {
//     const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
//     setConfirm(confirmation);
//   }

//   const confirmingCode = async () => {
//     console.log('verifying the code');
//     try {
//       const codeVerify = await confirm.confirm(code);
//       let userData = await auth().currentUser.linkWithCredential(credential);
//       console.warn(codeVerify, 'verify ');
//       if (codeVerify) {
//         navigation.navigate('Home');
//       }
//     } catch (error) {
//       console.log('Invalid code.');
//     }
//   };

  const LoginUser: loginUser = {
    isLogin:true,
    isLoggedIn: true,
    userName: '',
    photoURL: '',
    email: '',
    uid: '',
  };

  const updateLogin = uid => {
    firestore()
      .collection('users')
      .doc(uid)
      .get()
      .then((snapshot:FirebaseFirestoreTypes.DocumentData) => {
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
      setLoader(true);
      auth()
        .signInWithEmailAndPassword(email, Password)
        .then((loggedInUser:FirebaseFirestoreTypes.DocumentData) => {
          console.warn("user login")
          if (loggedInUser) {
            setLoader(false);
            console.warn(loggedInUser, 'user login here');
            updateLogin(loggedInUser.user._user.uid);
            //  getUserData(loggedInUser.user._user.uid);
            LoginUser.email = loggedInUser.user._user.email;
            LoginUser.uid = loggedInUser.user._user.uid;
          }
        })
        .catch(eror => {
          setLoader(false);
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
  return {
    login,
    updateLogin,
    email,
    setEmail,
    setPassword,
    error,
    setError,
    forgotEmail,
    forgotEmailError,
    setForgotEmail,
    setForgotEmailError,
    modalVisible, 
    setModalVisible,
    Password,
    forgotPassword,
    loader,
    showPassword,
    setShowPassword
  };
};
