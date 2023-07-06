import { Alert } from 'react-native'
import React, { useState } from 'react'
import useGoogleSignIn from '../components/GoogleSignIn';
import ImagePicker from 'react-native-image-crop-picker';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';




export const useRegister = () => {


  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [Password, setPassword] = useState<string>('');
  const { onGoogleButtonPress } = useGoogleSignIn();
  const [image, setImage] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [userProfieImage, setUserProfileImage] = useState<string>('');
  const [showPickerModal, setShowPickerModal] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [registerLoading, setRegisterLoading] = useState<boolean>(false)

  const uploadImage = async () => { };

  const handleCamera = (action: 'Gallery' | 'Camera') => {
    setLoading(true)

    if (action == 'Camera') {
      ImagePicker.openCamera({
        width: 300,
        height: 400,
        cropping: true,
        useFrontCamera: true
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
        setLoading(false)
        setShowPickerModal(false)
      }).catch((err)=>{
        setLoading(false)
      })
    } else {
      ImagePicker.openPicker({
        multiple: false
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
        setShowPickerModal(false)
        setLoading(false)
      }).catch((err)=>{
        setLoading(false)
      })
    }
  }


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

  };

  const writeUserData = user => {
    firestore()
      .collection('users')
      .doc(user.uid)
      .set(user)
      .then(() => {
        setRegisterLoading(false)
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
    setRegisterLoading(true)
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
        setRegisterLoading(false)
        console.log(error.message);
      }
    }
  };
  return {
    name,
    setImage,
    setName,
    image,
    email, setEmail,
    error,
    setError,
    uploadImage,
    uploading,
    setUploading,
    Password,
    setPassword,
    showPassword,
    setShowPassword,
    createNewAccount,
    selectImage,
    onGoogleButtonPress,
    showPickerModal,
    setShowPickerModal,
    handleCamera,
    loading,
     registerLoading



  }
}

