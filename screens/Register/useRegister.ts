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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const isNameValid = name.trim().length >= 2;
  const isEmailValid = emailRegex.test(email.trim());
  const isPasswordValid = Password.length >= 6;

  const isFormValid =
    isNameValid &&
    isEmailValid &&
    isPasswordValid &&
    !loading &&
    !registerLoading;

  // Real-time dynamic helper text
  const validationHint = (() => {
    if (email.length > 0 && !isEmailValid) {
      return 'Please enter a valid email address';
    }
    if (Password.length > 0 && !isPasswordValid) {
      return 'Password must be at least 6 characters';
    }
    if (name.length > 0 && !isNameValid) {
      return 'Name must be at least 2 characters';
    }
    return '';
  })();

  const createNewAccount = async () => {
    if (!isFormValid) {
      if (!isNameValid) {
        setError('Please Enter the Name (at least 2 characters)');
      } else if (!isEmailValid) {
        setError('Please Enter the Valid Email');
      } else if (!isPasswordValid) {
        setError('Password must be at least 6 characters');
      }
      return;
    }

    setRegisterLoading(true);
    setError('');

    try {
      const defaultAvatar =
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80';

      const body = {
        email: email.trim().toLowerCase(),
        name: name.trim(),
        uid: uuid.v4() as string,
        image: userProfieImage || defaultAvatar,
        password: Password,
        isLogin: false,
      };

      const response = await ApiCall(
        'post',
        'api/users',
        body,
        dispatch,
        false,
      );

      if (response?.data) {
        Toast.show({
          text1: 'Account Created!',
          text2: response?.message || 'You can now sign in',
          type: 'success',
          position: 'bottom',
        });
        clearData();
      } else {
        const errorMsg =
          response?.message || 'Registration failed. Please check your details.';
        setError(errorMsg);
        Toast.show({
          text1: 'Registration Failed',
          text2: errorMsg,
          type: 'error',
          position: 'bottom',
        });
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred during registration');
    } finally {
      setRegisterLoading(false);
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
    isFormValid,
    validationHint,
    isNameValid,
    isEmailValid,
    isPasswordValid,
  };
};
