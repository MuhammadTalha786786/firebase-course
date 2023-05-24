  import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    Image,
    SafeAreaView,
  } from 'react-native';
import React, {useEffect, useState} from 'react';
import ButtonComponent from '../components/ButtonComponent';
import {StyleGuide} from '../../Utils/StyleGuide';
import {Divider} from 'react-native-paper';
import {widthPercentageToDP} from 'react-native-responsive-screen';
import TextInputComponent from '../components/TextInputComponent';
import ForgotModal from '../components/ForgotModal';
import {Avatar} from 'native-base';
import { useLogin } from './useLogin.tsx';
import useGoogleSignIn from '../components/GoogleSignIn';
import SafeArea from '../components/SafeArea';
const LoginScreen = ({navigation}) => {
  const {onGoogleButtonPress} =useGoogleSignIn()

  const {
    login,
    updateLogin,
    email,
    setEmail,
    setPassword,
    error,
    setError,
    forgotEmail,
    forgotEmailError,
    setForgotEmail,
    setForgotEmailError,
    modalVisible,
    setModalVisible,
    Password,
    forgotPassword,
    loader,
    showPassword,
    setShowPassword
  } = useLogin();

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <SafeAreaView style={styles.SafeAreaView}>
        <SafeArea>
          <View>
            <View style={styles.loginTxtView}>
              <Avatar
                bg="indigo.500"
                alignSelf="center"
                size="xl"
                source={require('../../images/logo.png')}
              />
              {/* <Text style={styles.loginText}>Login</Text> */}
            </View>
            <View
              style={{
                padding: 0,
                marginVertical: 0,
                textAlign: 'center',
                justifyContent: 'center',
                alignContent: 'center',
              }}>
              <View style={{padding: 0}}>
                <TextInputComponent
                  value={email}
                  setValue={setEmail}
                  placeholder="Enter Email"
                  mode="outlined"
                  label="email"
                  setError={setError}
                  name={'email'}
                />
              </View>
              <View style={{padding: 0, marginVertical: 10}}>
                <TextInputComponent
                  value={Password}
                  setValue={setPassword}
                  placeholder="Enter Password"
                  mode="outlined"
                  label="password"
                  setError={setError}
                  name={'visibility'}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  IsPassword={true}
                />
              </View>
              <View style={{padding: 10}}>
                <Text style={{color: 'red', fontSize: 12}}>{error}</Text>
                <ButtonComponent
                  buttonTitle="SIGN IN"
                  btnType="sign-in"
                  color="#f5e7ea"
                  backgroundColor={loader ? 'grey' : StyleGuide.color.primary}
                  onPress={login}
                  uploading={loader}
                />
                <Text
                  style={styles.forgotPassword}
                  onPress={() => setModalVisible(true)}>
                  Forgot Password?
                </Text>
              </View>

              <View style={styles.GoogleSignInView}>
                <Divider style={styles.DividerStyle} />
                <Text style={styles.SignInText}>or sign in with</Text>
                <Divider style={styles.DividerStyle} />
              </View>

              <ForgotModal
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                forgotEmail={forgotEmail}
                setForgotEmail={setForgotEmail}
                forgotPassword={forgotPassword}
                forgotEmailError={forgotEmailError}
                setForgotEmailError={setForgotEmailError}
                setError={setError}
              />

              {/* <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <TouchableOpacity
                onPress={() => signInWithPhoneNumber('+92 3156028415')}
                style={[styles.buttonContainer, {backgroundColor: '#4169e1'}]}>
                <View style={styles.iconWrapper}>
                  <Entypo
                    name="message"
                    style={styles.icon}
                    size={22}
                    color="white"
                  />
                </View>
                <View style={styles.btnTxtWrapper}>
                  <Text style={[styles.buttonText, {color: 'white'}]}>
                    Sign in with Phone Number
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 10,
              }}>
              <TextInput
                placeholder="Please Enter the Code"
                value={code}
                onChangeText={text => setCode(text)}
                style={{width: '95%'}}
              />
              <Button
                style={{
                  marginTop: 10,
                  height: 50,
                  borderRadius: 4,
                  textAlign: 'center',
                  width: '95%',
                }}
                mode="contained"
                onPress={confirmingCode}>
                Verify
              </Button>
            </View> */}

              <View style={{padding: 10}}>
                <ButtonComponent
                  buttonTitle="Sign In with Google"
                  btnType="google"
                  color="#f5e7ea"
                  backgroundColor="#de4d41"
                  onPress={onGoogleButtonPress}
                />
                <View style={styles.accountView}>
                  <Text style={styles.accountText}>
                    Don't have an account?{' '}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('RegisterScreen');
                    }}>
                    <Text
                      style={{
                        color: StyleGuide.color.primary,
                        fontFamily: StyleGuide.fontFamily.medium,
                        fontSize: widthPercentageToDP('4%'),
                      }}>
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </SafeArea>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  SafeAreaView: {
    flex: 1,
  },

  loginTxtView: {
    marginVertical: 60,
  },
  loginText: {
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: StyleGuide.fontSize.medium,
    textAlign: 'center',
    alignItems: 'center',
    color: StyleGuide.color.primary,
  },

  forgotPassword: {
    textAlign: 'center',
    paddingVertical: 20,
    color: StyleGuide.color.primary,
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: StyleGuide.fontSize.medium,
  },
  leftBorder: {
    flex: 0.4,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderWidth: 1,
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
  SignInText: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: StyleGuide.fontSize.small,
    textAlign: 'center',
    alignItems: 'center',
    color: StyleGuide.color.dark,
    paddingHorizontal: 6,
  },

  DividerStyle: {
    flex: 1,
    color: StyleGuide.color.light,
    height: widthPercentageToDP('0.5%'),
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
});

export default LoginScreen;
