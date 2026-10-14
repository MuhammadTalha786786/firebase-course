import {GoogleSignin, statusCodes} from '@react-native-google-signin/google-signin';
import {useDispatch} from 'react-redux';
import {setSignIn} from '../../Redux/Auth/AuthReducer';
import auth from '@react-native-firebase/auth';
import {useState} from 'react';
import ApiCall from '../../services/services';
import {Alert} from 'react-native';

GoogleSignin.configure({
  webClientId:
    '135769240823-mn9m7kkm0o3mnb7rn5iap1omctn0tl99.apps.googleusercontent.com',
});

interface UseGoogleSignInProps {
  setLoader?: (loading: boolean) => void;
}

const useGoogleSignIn = (props?: UseGoogleSignInProps) => {
  const [loading, setInternalLoading] = useState<boolean>(false);
  const dispatch = useDispatch();

  const updateLoading = (val: boolean) => {
    setInternalLoading(val);
    if (props?.setLoader) {
      props.setLoader(val);
    }
  };

  async function onGoogleButtonPress() {
    updateLoading(true);
    try {
      // 1. Ensure Google Play Services are available
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

      // 2. Prompt user with Google Sign-In
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.idToken;
      const googleUser = signInResult.user;

      let email = googleUser?.email;
      let name = googleUser?.name;
      let photo = googleUser?.photo;
      let uid = googleUser?.id;

      // 3. Authenticate with Firebase if idToken is available
      if (idToken) {
        try {
          const googleCredential = auth.GoogleAuthProvider.credential(idToken);
          const firebaseResult = await auth().signInWithCredential(googleCredential);
          if (firebaseResult?.user) {
            email = firebaseResult.user.email || email;
            name = firebaseResult.user.displayName || name;
            photo = firebaseResult.user.photoURL || photo;
            uid = firebaseResult.user.uid || uid;
          }
        } catch (firebaseError) {
          console.log('Firebase credential sign-in note:', firebaseError);
        }
      }

      if (!email) {
        Alert.alert(
          'Google Sign-In Error',
          'Could not retrieve email from your Google account. Please try again.',
        );
        updateLoading(false);
        return;
      }

      // 4. Authenticate / register user with SocialBea backend API
      const body = {
        email: email.trim(),
        name: (name || email.split('@')[0]).trim(),
        image: photo || '',
        uid: uid || '',
      };

      const response = await ApiCall(
        'post',
        'api/auth/google',
        body,
        dispatch,
        false,
      );

      // 5. Store user and JWT token in Redux state
      if (response?.success && response?.data) {
        dispatch(setSignIn(response.data));
      } else {
        Alert.alert(
          'Login Failed',
          response?.message || 'Google Sign-In failed on the server. Please try again.',
        );
      }
    } catch (error: any) {
      if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
        // User voluntarily dismissed the Google picker
      } else if (error?.code === statusCodes.IN_PROGRESS) {
        // Sign-in already running
      } else if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert(
          'Play Services Unavailable',
          'Google Play Services is not available or outdated on this device.',
        );
      } else {
        console.error('Google Sign-In Error:', error);
        Alert.alert(
          'Google Sign-In Error',
          error?.message || 'Failed to sign in with Google. Please try again.',
        );
      }
    } finally {
      updateLoading(false);
    }
  }

  return {
    onGoogleButtonPress,
    loading,
  };
};

export default useGoogleSignIn;
