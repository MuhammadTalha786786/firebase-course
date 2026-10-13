import {Alert} from 'react-native';
import React, {useState} from 'react';
import useGoogleSignIn from '../components/GoogleSignIn';
import ImagePicker from 'react-native-image-crop-picker';
import 'react-native-get-random-values';
import uuid from 'react-native-uuid';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import ApiCall from '../../services/services';
import {useDispatch} from 'react-redux';
import Toast from 'react-native-toast-message';
import {uploadFileToSupabase} from '../../services/supabaseStorage';

export const useRegister = () => {
  const dispatch = useDispatch();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [Password, setPassword] = useState<string>('');
  const {onGoogleButtonPress} = useGoogleSignIn();
  const [image, setImage] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [userProfieImage, setUserProfileImage] = useState<string>('');
  const [showPickerModal, setShowPickerModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [registerLoading, setRegisterLoading] = useState<boolean>(false);

  const uploadToStorage = async (filePath: string, base64Data?: string) => {
    try {
      setLoading(true);
      const downloadUrl = await uploadFileToSupabase(filePath, {
        bucket: 'social-bea',
        folder: 'profile_images',
        base64Data,
      });
      console.log('Uploaded image URL to Supabase:', downloadUrl);
      setUserProfileImage(downloadUrl);
      Toast.show({
        text2: 'Image uploaded successfully!',
        type: 'success',
        position: 'bottom',
      });
    } catch (uploadErr: any) {
      console.error('Supabase Storage upload error:', uploadErr);
      Toast.show({
        text1: 'Upload Failed',
        text2:
          uploadErr?.message ||
          'Failed to upload image. Please check Supabase Storage settings.',
        type: 'error',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = uploadToStorage;

  const handleCamera = async (action: 'Gallery' | 'Camera') => {
    setShowPickerModal(false);
    try {
      let imageResult;
      if (action === 'Camera') {
        imageResult = await ImagePicker.openCamera({
          width: 300,
          height: 400,
          cropping: true,
          useFrontCamera: true,
          includeBase64: true,
        });
      } else {
        imageResult = await ImagePicker.openPicker({
          width: 300,
          height: 400,
          cropping: true,
          includeBase64: true,
        });
      }

      if (imageResult?.path) {
        setImage(imageResult.path);
        await uploadToStorage(imageResult.path, imageResult.data);
      }
    } catch (err: any) {
      if (err?.code !== 'E_PICKER_CANCELLED') {
        console.error('Picker error:', err);
      }
    }
  };

  const selectImage = async () => {
    try {
      const imageResult = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
        includeBase64: true,
      });
      if (imageResult?.path) {
        setImage(imageResult.path);
        await uploadToStorage(imageResult.path, imageResult.data);
      }
    } catch (err: any) {
      if (err?.code !== 'E_PICKER_CANCELLED') {
        console.error('Picker error:', err);
      }
    }
  };

  const writeUserData = user => {
    firestore()
      .collection('users')
      .doc(user.uid)
      .set(user)
      .then(() => {
        setRegisterLoading(false);
        console.log('user added!');
      });

    Alert.alert('registered');
    setImage('');
    setEmail('');
    setName('');
    setPassword('');
  };

  console.log(userProfieImage, 'ksdfhdajs');

  const clearData = () => {
    setImage('');
    setEmail('');
    setName('');
    setPassword('');
  };

  const createNewAccount = async () => {
    setRegisterLoading(true);
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
        let body = {
          email: email,
          name: name,
          uid: uuid.v4() as string,
          image: userProfieImage,
          password: Password,
          isLogin: false,
        };
        console.log(body);
        const response = await ApiCall(
          'post',
          'api/users',
          body,
          dispatch,
          false,
        );
        console.log(response);
        setRegisterLoading(false);
        if (response?.data) {
          Toast.show({
            text2: response?.message,
            type: 'success',
            position: 'bottom',
          });
          clearData()
        } else {
          Toast.show({
            text2: 'Something Went Wrong',
            type: 'error',
            position: 'bottom',
          });
        }
      } catch (error) {
        setRegisterLoading(false);
        console.log(error.message);
        Toast.show({
          text2: error?.message,
          type: 'error',
          position: 'bottom',
        });
      }
    }
  };
  return {
    userProfieImage,
    name,
    setImage,
    setName,
    image,
    email,
    setEmail,
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
    registerLoading,
  };
};
