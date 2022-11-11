import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {useDispatch} from 'react-redux';
import {setSignIn} from '../../Redux/Auth/AuthReducer';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';


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
const useGoogleSignIn = () => {
  const dispatch = useDispatch();
  async function onGoogleButtonPress() {
    const {idToken} = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    auth()
      .signInWithCredential(googleCredential)
      .then(user => {
        const LoginUser = {
          isLogin: true,
          email: user.user._user.email,
          userName: user.user._user.displayName,
          uid: user.user._user.uid,
          photoURL: user.user._user.photoURL,
          isLoggedIn: true,
        };

        const userData ={
          isLogin: true,
          email: user.user._user.email,
          name: user.user._user.displayName,
          uid: user.user._user.uid,
          image: user.user._user.photoURL,
        }
        console.log(user, 'login user data');

        if (user) {
          writeUserData(userData);
          dispatch(setSignIn(LoginUser));
        }
      })
      .catch(eror => {
        console.warn('Login fail!!', eror);
      });
  }
  return {
    onGoogleButtonPress,
  };
};
export default useGoogleSignIn;
