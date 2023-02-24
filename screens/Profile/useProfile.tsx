import React, {useEffect, useState, useLayoutEffect} from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import {useSelector, useDispatch} from 'react-redux';
import { Alert, TouchableOpacity } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import {v4 as uuidv4} from 'uuid';
import storage from '@react-native-firebase/storage';
import {setSignIn} from '../../Redux/Auth/AuthReducer';
import auth from '@react-native-firebase/auth';
import { backArrow } from '../../Utils/SvgAssests';
import Svg from '../components/Svg';


export const useProfile = () => {
  const authState:any = useSelector((state) => state);
  console.log(authState, 'auth state profile');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [code, setCode] = useState('');
  const [ishow, setShow] = useState(false);
  const [verified, setVerified] = useState(false);
  const [image, setImage] = useState('');
  const [updateImage, setUpdateImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [newDate, setNewDate] = useState<Date>(new Date());
  const [loader, setLoader] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  let userID = authState.userAuthReducer.uid;
  let isLoggedIn = authState.userAuthReducer.isLoggedIn;
  let userProfileImage = authState.userAuthReducer.photoURL;

  const updateProfile = () => {
    if (name === '') {
      Alert.alert('Please Enter Your name');
    } else if (phoneNumber === '' || phoneNumber === undefined) {
      Alert.alert('Please Enter Your phone number..');
    }

    // else if (dateOfBirth === '') {
    //     Alert.alert('Please Enter Your name');
    // }
    else if (verified === false) {
      Alert.alert('Your Number has not been  Verified');
    } else {
      setLoader(true);

      firestore()
        .collection('users')
        .doc(userID)
        .update({
          dateOfBirth: dateOfBirth,
          name: name,
          phoneNumber: phoneNumber,
          image: updateImage === '' ? userProfileImage : updateImage,
          numberVerified: true,
        })
        .then(() => {
          setLoader(false);
          Alert.alert('Your Data has been updated...');
          console.log('User data has been updated!');
        });
      dispatch(
        setSignIn({
          ...authState.userAuthReducer,
          photoURL: image === '' ? userProfileImage : updateImage,
          userName: name,
        }),
      );
    }
  };

  const selectImage = async () => {
    setUploading(true);
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    })
      .then(image => {
        setImage(image.path);
        console.log(image.path);
        let fileName = `${uuidv4()}${image.path.substr(
          image.path.lastIndexOf('.'),
        )}`;
        const ref = storage().ref(fileName);
        ref.putFile(image.path).then(s => {
          ref.getDownloadURL().then(x => {
            console.log(x, 'x url');
            setUpdateImage(x);
            setUploading(false);
          });
        });
      })
      .catch(error => {
        console.log(error);
        setUploading(false);
      });
  };

  const verifyPhoneNumber = async phoneNumber => {
    // setLoader(true);
    if (phoneNumber === '') {
      setLoader(false);
      Alert.alert('please Enter the Phone Number');
    } else {
      const confirmation:any = await auth().verifyPhoneNumber(phoneNumber);
      console.log(confirmation, 'confirmation');
      if (confirmation) {
        // setLoader(false);
        setConfirm(confirmation);
        setVerified(true);
        setShow(true);
      } else {
        // setLoader(false);
      }
    }
  };

  console.log(name === '', 'confirm');

  // Handle confirm code button press
  const confirmCode = async code => {
    console.log("function called...")
    console.log(code);
    try {
      const credential = auth.PhoneAuthProvider.credential(
        confirm?.verificationId,
        code,
      );
      // let userData = await auth().currentUser.linkWithCredential(credential);

      console.log(credential, 'credential');
      Alert.alert('Your Number Has Been Verified...');
      setShow(false);
    } catch (error) {
      console.log(error);
      if (error.code == 'auth/invalid-verification-code') {
        Alert.alert('Your Code is Wrong...');
      } else {
        console.log('Account linking error');
      }
    }
  };

  useEffect(() => {
    firestore()
      .collection('users')
      .doc(userID)
      .get()
      .then(snapshot => {
        console.log(snapshot.data());
        let data = snapshot.data();
        console.log(data, dateOfBirth);
        setName(data?.name);
        setEmail(data?.email);
        if (data?.phoneNumber !== undefined) {
          setPhoneNumber(data?.phoneNumber);
          setDateOfBirth(data?.dateOfBirth.toDate());
          setNewDate(data?.dateOfBirth.toDate());
          setVerified(data?.numberVerified);
        }
      });
  }, []);

  useLayoutEffect(()=>{
       navigation.setOptions({
         headerLeft: () => (
           <TouchableOpacity>
             <Svg xml={backArrow} rest={{width: 20, height: 20}} />
           </TouchableOpacity>
         ),
       });
  },[])
  const mode = authState.userAuthReducer;
  console.log(mode, 'mode reducer');

  return {
    email,
    setEmail,
    name,
    setName,
    dateOfBirth,
    setDateOfBirth,
    setDatePickerVisibility,
    phoneNumber,
    setPhoneNumber,
    uploading,
    confirmCode,
    isLoggedIn,
    selectImage,
    userProfileImage,
    isDatePickerVisible,
    image,
    mode,
    setError,
    ishow,
    updateProfile,
    verifyPhoneNumber,
    code,
    setCode,
    loader,
    setLoader,
  };
};
