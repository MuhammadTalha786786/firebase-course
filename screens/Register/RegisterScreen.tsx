import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import React, { useState } from 'react';
import ButtonComponent from '../components/ButtonComponent';
import TextInputComponent from '../components/TextInputComponent';
import { widthPercentageToDP } from 'react-native-responsive-screen';
import { StyleGuide } from '../../Utils/StyleGuide';
import { ActivityIndicator, Divider } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { Avatar } from 'native-base';
import { useRegister } from './useRegister';
import ModalComponent from '../components/Modal';
import { close } from '../../Utils/SvgAssests';
import Svg from '../components/Svg';
import TouchID from 'react-native-touch-id';


const RegisterScreen = ({ navigation }) => {
  const {
    name,
    setName,
    image,
    email, setEmail,
    error,
    setError,
    uploading,
    Password,
    setPassword,
    showPassword,
    setShowPassword,
    createNewAccount,
    selectImage,
    onGoogleButtonPress,
    showPickerModal,
    handleCamera,
    setShowPickerModal,
    loading,
    registerLoading
  } = useRegister()


  const fingerPrintAuthentication = () => {
    const optionalConfigObject = {
        title: 'Authentication Required', // Android
        imageColor: '#e00606', // Android
        imageErrorColor: '#ff0000', // Android
        sensorDescription: 'Touch sensor', // Android
        sensorErrorDescription: 'Failed', // Android
        cancelText: 'Cancel', // Android
        fallbackLabel: 'Show Passcode', // iOS (if empty, then label is hidden)
        unifiedErrors: false, // use unified error messages (default false)
        passcodeFallback: false, // iOS - allows the device to fall back to using the passcode, if faceid/touch is not available. this does not mean that if touchid/faceid fails the first few times it will revert to passcode, rather that if the former are not enrolled, then it will use the passcode.
    };
    TouchID.authenticate('to demo this react-native component', optionalConfigObject)
      .then(success => {
        // Success code
        console.warn(success)
      })
      .catch(error => {
        console.warn(error)
        // Failure code
      });
  }


  return (
    <SafeAreaView style={styles.SafeAreaView}>
      <View
        style={{
          padding: 0,
          marginVertical: 100,
          justifyContent: 'center',
          alignContent: 'center',
        }}>
        <Text style={styles.loginText}>Register </Text>

        <View style={styles.cameraStyle}>
          <View>
            {
              loading ? <ActivityIndicator size={100} color={StyleGuide.color.primary} /> :

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
            }
          </View>
          <View style={styles.cameraIcon}>
            <MaterialCommunityIcons
              name="image-edit-outline"
              size={20}
              color="#6A0DAD"
              onPress={() => { setShowPickerModal(true) }}
            />
          </View>
        </View>

        <View style={{ padding: 0, marginVertical: 10, marginTop: 15 }}>
          <TextInputComponent
            setShowPassword={(e: boolean) => { e }}
            value={name}
            setValue={setName}
            placeholder={"Enter Name"}
            mode="outlined"
            label="Name"
            setError={setError}
            name={'person'}
          />
        </View>
        <View style={{ padding: 0, marginVertical: 5 }}>
          <TextInputComponent
            setShowPassword={(e: boolean) => { e }}
            value={email}
            setValue={setEmail}
            placeholder={"Enter Email"}
            mode="outlined"
            label="Email"
            setError={setError}
            name={'email'}
          />
        </View>
        <View style={{ padding: 0, marginVertical: 5 }}>
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

        <View style={{ padding: 10, marginVertical: 5 }}>
          <Text style={styles.errorMessage}>{error}</Text>
          <ButtonComponent
            uploading={registerLoading}
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

        <View style={{ padding: 10 }}>
                   <ButtonComponent
                  buttonTitle="Sign In with Google"
                  btnType="google"
                  color="#f5e7ea"
                  backgroundColor="#de4d41"
                  onPress={onGoogleButtonPress}
                  uploading={loading}
                />
                <ButtonComponent
                  buttonTitle="Sign In with Facebook"
                  btnType="facebook"
                  color="#f5e7ea"
                  backgroundColor="#007FFF"
                  onPress={()=>{}}
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


          <ModalComponent
            // styleModal={{bottom: 60}}
            isVisible={showPickerModal}
            setVisibility={setShowPickerModal}
            styleModal={{
              paddingTop: 0,
              paddingHorizontal: 0,
              paddingBottom: 0,
              flex: 1,
            }}
            component={
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    backgroundColor: StyleGuide.color.primary,
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    paddingTop: 15,
                  }}>
                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text >Choose Profile Image</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowPickerModal(false)}
                    style={{ alignItems: 'flex-end', marginRight: '3%' }}>
                    <Svg xml={close} rest={{ height: 16, width: 16 }} />
                  </TouchableOpacity>
                </View>
                <View style={{ padding: 10 }} >
                  <ButtonComponent btnType='' buttonTitle='Choose from Gallery' backgroundColor='#FFFAEF' color='black' onPress={() => { handleCamera('Gallery') }} />

                  <ButtonComponent btnType='' buttonTitle='Open Camera' color={'#fff'}
                    backgroundColor={StyleGuide.color.primary} onPress={() => { handleCamera('Camera') }} />

                </View>

              </View>
            }
          />

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
