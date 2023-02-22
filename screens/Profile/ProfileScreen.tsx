import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import {Avatar} from 'native-base';
import TextInputComponent from '../components/TextInputComponent';
import {StyleGuide} from '../../Utils/StyleGuide';
import {windowHeight} from '../../Utils/Dimesnions';
import moment from 'moment';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import {widthPercentageToDP} from 'react-native-responsive-screen';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import ButtonComponent from '../components/ButtonComponent';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useProfile} from './useProfile';
import { background } from 'native-base/lib/typescript/theme/styled-system';
import LinearGradient from 'react-native-linear-gradient';

const ProfileScreen = () => {
  const {
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
  } = useProfile();

  return (
    <SafeAreaView style={{flex: 1}}>
      <LinearGradient
        colors={['#FFFFFF', '#E5FFE3', '#4E924A']}
        style={styles.linearGradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : ''}
          style={styles.container}>
          <ScrollView>
            <View style={styles.container}>
              <View style={[styles.header]}>
                <Text style={styles.userText}> User Profile</Text>
              </View>

              <Avatar
                style={styles.avatar}
                source={{uri: image === '' ? userProfileImage : image}}>
                <Avatar.Badge bg={isLoggedIn ? 'green.500' : 'red.500'} />
              </Avatar>

              <View
                style={{
                  marginHorizontal: 190,
                  backgroundColor: 'white',
                  borderRadius: 20,
                  width: 40,
                  height: 40,
                  marginTop: 30,
                }}>
                <MaterialCommunityIcons
                  name="image-edit-outline"
                  size={25}
                  color={StyleGuide.color.primary}
                  onPress={selectImage}
                  style={{marginVertical: 10, marginHorizontal: 7}}
                />
              </View>

              <View style={styles.body}>
                <View style={{marginVertical: 10}}>
                  <TextInputComponent
                    value={email}
                    placeholder="Enter Email"
                    mode="outlined"
                    label="Email"
                    name={'email'}
                    isReadOnly={true}
                    darkMode={mode}
                  />
                </View>
                <View style={{marginVertical: 10}}>
                  <TextInputComponent
                    placeholderTextColor={mode ? 'white' : 'black'}
                    value={name}
                    placeholder="Enter Name"
                    mode="outlined"
                    label="Email"
                    name={'supervised-user-circle'}
                    setValue={setName}
                    setError={setError}
                    darkMode={mode}
                  />
                </View>

                <View style={{marginVertical: 10, padding: 10}}>
                  <TouchableOpacity
                    style={styles.ButtonStyle}
                    onPress={() => setDatePickerVisibility(true)}>
                    <View style={{flexDirection: 'row'}}>
                      <View>
                        <EvilIcons
                          name="calendar"
                          size={20}
                          color={StyleGuide.color.dark}
                          style={{marginVertical: 20, marginHorizontal: 10}}
                        />
                      </View>
                      <View>
                        <Text
                          style={[
                            styles.dateOfBirthText,
                            {
                              color: StyleGuide.color.dark,
                            },
                          ]}>
                          {dateOfBirth === ''
                            ? 'Select Your DOB'
                            : moment(dateOfBirth).format('LL')}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
                <DateTimePickerModal
                  isVisible={isDatePickerVisible}
                  mode="date"
                  onConfirm={date => {
                    setDateOfBirth(date), setDatePickerVisibility(false);
                  }}
                  onCancel={() => {
                    setDatePickerVisibility(false);
                  }}
                  maximumDate={new Date()}
                />
                <View style={{marginVertical: 10}}>
                  <TextInputComponent
                    value={phoneNumber}
                    placeholder="+923151234567"
                    mode="outlined"
                    label="Email"
                    name={'phone'}
                    setValue={setPhoneNumber}
                    setError={setError}
                    keyboardType="phone-pad"
                    darkMode={mode}
                  />

                  {phoneNumber == '' && (
                    <View
                      style={{
                        justifyContent: 'flex-end',
                        flexDirection: 'row',
                        marginVertical: 5,
                        marginHorizontal: 10,
                      }}>
                      <TouchableOpacity
                        style={[
                          styles.otpButton,
                          {
                            backgroundColor: StyleGuide.color.light,
                          },
                        ]}
                        onPress={() => verifyPhoneNumber(phoneNumber)}>
                        <Text style={styles.otpText}>Send OTP</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                {ishow && (
                  <View style={{marginVertical: 10}}>
                    <TextInputComponent
                      value={code}
                      placeholder="123456"
                      mode="outlined"
                      label="Email"
                      name={'phone'}
                      setValue={setCode}
                      setError={setError}
                      keyboardType="phone-pad"
                      darkMode={mode}
                    />
                    <Text
                      onPress={() => confirmCode(code)}
                      style={{
                        color: 'blue',
                        fontSize: widthPercentageToDP('3.3%'),
                        fontFamily: StyleGuide.fontFamily.regular,
                        marginVertical: 10,
                        textAlign: 'right',
                        marginHorizontal: 10,
                      }}>
                      Verify OTP
                    </Text>
                  </View>
                )}

                <View style={{padding: 10}}>
                  {uploading && (
                    <Text style={{color: 'red', fontSize: 10}}>
                      Please Wait While Your Image has been upload....{' '}
                    </Text>
                  )}

                  <ButtonComponent
                    buttonTitle="Update"
                    btnType="upload"
                    color={'#111'}
                    backgroundColor={
                      uploading ? 'grey' : StyleGuide.color.paragraph
                    }
                    onPress={updateProfile}
                    disabled={uploading}
                    //   uploading={loader}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  },
  SafeAreaView: {
    flex: 1,
    // backgroundColor: '#F5F5DC',
  },
  linearGradient: {
    flex: 1, 
    borderRadius: 5,
  },
  userText: {
    fontSize: StyleGuide.fontSize.medium,
    fontFamily: StyleGuide.fontFamily.regular,
    color: 'white',
    textAlign: 'center',
    marginVertical: 60,
  },
  otpButton: {
    borderRadius: 5,
    marginVertical: 5,
    maarginHorizontal: 10,
  },

  otpText: {
    textAlign: 'center',
    color: StyleGuide.color.dark,
    fontSize: widthPercentageToDP('3.3%'),
    fontFamily: StyleGuide.fontFamily.regular,
    marginVertical: 10,
    marginHorizontal: 10,
  },
  header: {
    marginVertical: 10,
    // backgroundColor: ',
    height: 200,
    borderBottomRightRadius: 25,
    borderBottomLeftRadius: 25,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 63,
    borderWidth: 4,
    borderColor: 'white',
    marginBottom: 10,
    alignSelf: 'center',
    position: 'absolute',
    marginTop: 130,
  },
  name: {
    fontSize: 22,
    color: 'black',
    fontWeight: '600',
  },
  // body: {
  //     marginVertical: 100,
  // },
  ButtonStyle: {
    height: windowHeight / 15,
    borderWidth: 0.85,
    borderRadius: 3.5,
    borderColor: 'lightgrey',
  },
  dateOfBirthText: {
    textAlign: 'center',
    marginVertical: 18,
    marginHorizontal: 5,
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: widthPercentageToDP('3.7%'),
  },
});

export default ProfileScreen;
