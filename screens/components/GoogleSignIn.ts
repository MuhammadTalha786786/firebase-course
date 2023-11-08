import {GoogleSignin, statusCodes} from '@react-native-google-signin/google-signin';
import {useDispatch} from 'react-redux';
import {setSignIn} from '../../Redux/Auth/AuthReducer';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useState } from 'react';


GoogleSignin.configure({
  webClientId:
    '135769240823-mn9m7kkm0o3mnb7rn5iap1omctn0tl99.apps.googleusercontent.com',
});
const writeUserData = user => {
  firestore()
    .collection('users')
    .doc(user.uid)
    .set(user)
    .then(() => {
      console.log('user added!');
    });

 
};


interface _userI {
  user:{
  email: string | null;
  displayName: string | null;
  uid: string | null;
  photoURL?: string |null;
}
}


console.warn(statusCodes)


const useGoogleSignIn = () => {
  const [loading, setLoader] = useState<boolean>(false)
  const dispatch = useDispatch();
  async function onGoogleButtonPress() {
    setLoader(true)
    const {idToken} = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    console.log(googleCredential)

    
    try {
      auth()
        .signInWithCredential(googleCredential)
        .then((response:_userI) => {
          console.log(response.user.displayName)
          
          const LoginUser = {
            isLogin: true,
            email: response.user.email,
            userName: response.user.displayName,
            uid: response.user.uid,
            photoURL: response.user.photoURL,
            isLoggedIn:true
          };
  
          const userData ={
            isLogin: true,
            email: response.user.email,
            name: response.user.displayName,
            uid: response.user.uid,
            image: response.user.photoURL,
          }
  
          if (response) {
            setLoader(false)
            writeUserData(userData);
           dispatch(setSignIn(LoginUser));
          }
        })
        .catch(error => {
          console.warn(error?.code)
          if (error.message === statusCodes.SIGN_IN_CANCELLED) {
            // User closed the Google login pop-up.
            setLoader(false);
          } else if (error.code === statusCodes.IN_PROGRESS) {
            // A sign-in process is already in progress.
            setLoader(false);
          } else {
            // Handle other errors.
            console.error(error);
          }
        
          setLoader(false)
          // console.warn('Login ssfail!!', error);
        });
      
    } catch (error) {
          if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
            // User closed the Google login pop-up.
            setLoader(false);
          } else if (error.code === statusCodes.IN_PROGRESS) {
            // A sign-in process is already in progress.
            setLoader(false);
          } else {
            // Handle other errors.
            console.error(error);
          }
        
          setLoader(false)
          // console.warn('Login ssfail!!', error);
    }            
  }
  return {
    onGoogleButtonPress,
    loading
  };
};
export default useGoogleSignIn;
