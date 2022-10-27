import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {useDispatch} from 'react-redux';
import {setSignIn} from '../../Redux/Auth/AuthReducer';
import auth from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';

GoogleSignin.configure({
  webClientId:
    '135769240823-mn9m7kkm0o3mnb7rn5iap1omctn0tl99.apps.googleusercontent.com',
});

const useGoogleSignIn = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  async function onGoogleButtonPress() {
    const {idToken} = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
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
          // navigation.navigate('Home', {
          //   email: user.user._user.email,
          //   userName: user.user._user?.displayName,
          //   uid: user.user._user.uid,
          // });
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
