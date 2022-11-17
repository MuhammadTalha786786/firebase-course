import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import React, {useState} from 'react';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import ButtonComponent from './components/ButtonComponent';
import TextInputComponent from './components/TextInputComponent';
import useGoogleSignIn from './components/GoogleSignIn';
import {widthPercentageToDP} from 'react-native-responsive-screen';
import {StyleGuide} from '../Utils/StyleGuide';
import {Divider} from 'react-native-paper';
import ImagePicker from 'react-native-image-crop-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import storage from '@react-native-firebase/storage';
import * as Progress from 'react-native-progress';
import {Avatar} from 'native-base';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import uuid from 'react-native-uuid';
import firestore from '@react-native-firebase/firestore';

const RegisterScreen = ({navigation}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [Password, setPassword] = useState('');
  const {onGoogleButtonPress} = useGoogleSignIn();
  const [image, setImage] = useState();
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);
  const [error, setError] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const [userProfieImage, setUserProfileImage] = useState('');

  const uploadImage = async () => {};

  const selectImage = async () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    }).then(image => {
      setImage(image.path);
      console.log(image.path);
      let fileName = `${uuidv4()}${image.path.substr(
        image.path.lastIndexOf('.'),
      )}`;
      const ref = storage().ref(fileName);
      ref.putFile(image.path).then(s => {
        ref.getDownloadURL().then(x => {
          console.log(x, 'x url');
          setUserProfileImage(x);
        });
      });
    });

    console.log(image, 'uri....');
    // const filename = image.substring(image.lastIndexOf('/') + 1);
    // const uploadUri =
    //   Platform.OS === 'ios' ? image.replace('file://', '') : image;
    // setTransferred(0);
    // const task = storage().ref(filename).putFile(uploadUri);

    // set progress state
    // task.on('state_changed', snapshot => {
    //   setUserProfileImage(filename);
    //   setTransferred(
    //     Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 10000,
    //   );
    // });
  };

  const writeUserData = user => {
    firestore()
      .collection('users')
      .doc(user.uid)
      .set(user)
      .then(() => {
        console.log('user added!');
      });

    Alert.alert('registered');
    setImage('');
    setEmail('');
    setName('');
    setPassword('');
  };

  console.log(userProfieImage, 'ksdfhdajs');

  const createNewAccount = async () => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (image === '' || image === undefined) {
      setError('Please Select an Image');
    } else if (email === '') {
      setError('Please Enter the Email');
    } else if (!reg.test(email)) {
      setError('Please Enter the Valid Email');
    } else if (name === '') {
      setError('Please Enter the Name');
    } else if (Password === '') {
      setError('Please Enter the Password');
    } else {
      try {
        const userAuth = await auth().createUserWithEmailAndPassword(
          email,
          Password,
        );
        console.log(userAuth, 'userAuth');
        console.log(userAuth.email);
        if (userAuth) {
          uploadImage();
        }
        var user = {
          name: name,
          image: userProfieImage,
          uid: userAuth.user._user.uid,
          email: userAuth.user._user.email,
          isLogin: false,
        };
        writeUserData(user);
      } catch (error) {
        console.log(error.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.SafeAreaView}>
      <View
        style={{
          padding: 0,
          marginVertical: 100,
          textAlign: 'center',
          justifyContent: 'center',
          alignContent: 'center',
        }}>
        <Text style={styles.loginText}>Register </Text>

        <View style={styles.cameraStyle}>
          <View>
            <Avatar
              bg="indigo.500"
              alignSelf="center"
              size="xl"
              source={{
                uri:
                  image === undefined || image === ''
                    ? 'https://cdn.pixabay.com/photo/2013/07/13/12/07/avatar-159236_1280.png'
                    : image,
              }}
            />
          </View>
          <View style={styles.cameraIcon}>
            <MaterialCommunityIcons
              name="image-edit-outline"
              size={20}
              color="#6A0DAD"
              onPress={selectImage}
            />
          </View>
        </View>

        <View style={{padding: 0, marginVertical: 10, marginTop: 15}}>
          <TextInputComponent
            value={name}
            setValue={setName}
            placeholder="Enter Name"
            mode="outlined"
            label="Name"
            setError={setError}
            name={'person'}
          />
        </View>
        <View style={{padding: 0, marginVertical: 5}}>
          <TextInputComponent
            value={email}
            setValue={setEmail}
            placeholder="Enter Email"
            mode="outlined"
            label="Email"
            setError={setError}
            name={'email'}
          />
        </View>
        <View style={{padding: 0, marginVertical: 5}}>
          <TextInputComponent
            value={Password}
            setValue={setPassword}
            placeholder="Enter Password"
            mode="outlined"
            label="Password"
            secureTextEntry={true}
            setError={setError}
            name={'visibility'}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            IsPassword={true}
          />
        </View>

        <View style={{padding: 10, marginVertical: 5}}>
          <Text style={styles.errorMessage}>{error}</Text>
          <ButtonComponent
            disabled={
              uploading ||
              name === '' ||
              email === '' ||
              Password === '' ||
              image === '' ||
              image === undefined
            }
            buttonTitle="Register"
            btnType="sign-in"
            color="#f5e7ea"
            backgroundColor={
              uploading ||
              name === '' ||
              email === '' ||
              Password === '' ||
              image === '' ||
              image === undefined
                ? 'grey'
                : StyleGuide.color.primary
            }
            onPress={createNewAccount}
          />
        </View>
        <View style={styles.GoogleSignInView}>
          <Divider style={styles.DividerStyle} />
          <Text style={styles.SignInText}>or sign in with</Text>
          <Divider style={styles.DividerStyle} />
        </View>

        <View style={{padding: 10}}>
          <ButtonComponent
            buttonTitle="Sign In with Google"
            btnType="google"
            color="#de4d41"
            backgroundColor="#f5e7ea"
            onPress={onGoogleButtonPress}
          />
          <View style={styles.accountView}>
            <Text style={styles.accountText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Login');
              }}>
              <Text
                style={{
                  color: StyleGuide.color.primary,
                  fontFamily: StyleGuide.fontFamily.medium,
                  fontSize: widthPercentageToDP('4%'),
                }}>
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loginText: {
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: StyleGuide.fontSize.medium,
    textAlign: 'center',
    alignItems: 'center',
    color: StyleGuide.color.primary,
    marginBottom: 15,
  },
  SafeAreaView: {
    flex: 1,
  },

  cameraIcon: {
    borderRadius: 20,
    borderColor: 'red',
    width: 40,
    height: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: -10,
  },
  SignInText: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: StyleGuide.fontSize.small,
    textAlign: 'center',
    alignItems: 'center',
    color: StyleGuide.color.dark,
    paddingHorizontal: 6,
  },
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
  DividerStyle: {
    flex: 1,
    color: StyleGuide.color.light,
    height: widthPercentageToDP('0.5%'),
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
  cameraStyle: {
    marginTop: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorMessage: {
    color: 'red',
    fontSize: StyleGuide.fontSize.small,
    fontFamily: StyleGuide.fontFamily.medium,
  },
  progressBarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RegisterScreen;
