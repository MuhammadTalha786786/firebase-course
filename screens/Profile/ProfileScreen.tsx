import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import TextInputComponent from '../components/TextInputComponent';
import { StyleGuide } from '../../Utils/StyleGuide';
import moment from 'moment';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import ButtonComponent from '../components/ButtonComponent';
import { useProfile } from './useProfile';

const ProfileScreen = () => {
  const {
    email,
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
  } = useProfile();

  const isDarkMode = Boolean(mode);
  const bgColor = isDarkMode ? StyleGuide.color.dark : '#FFFFFF';
  const cardBg = isDarkMode ? '#1E293B' : '#F8FAFC';
  const textColor = isDarkMode ? '#FFFFFF' : StyleGuide.color.textPrimary;
  const subtextColor = isDarkMode ? '#94A3B8' : StyleGuide.color.textSecondary;
  const borderColor = isDarkMode ? '#334155' : StyleGuide.color.border;

  const currentAvatarUri =
    image && image !== ''
      ? image
      : userProfileImage && userProfileImage !== ''
      ? userProfileImage
      : undefined;

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {/* Header Banner */}
            <View
              style={[
                styles.headerBanner,
                { backgroundColor: StyleGuide.color.primary },
              ]}>
              <View style={styles.headerDecorativeCircle1} />
              <View style={styles.headerDecorativeCircle2} />
              <Text style={styles.headerTitle}>Edit Profile</Text>
              <Text style={styles.headerSubtitle}>
                Manage your public profile & personal details
              </Text>
            </View>

            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarWrapper}>
                {uploading ? (
                  <View style={[styles.avatarBox, { backgroundColor: cardBg }]}>
                    <ActivityIndicator
                      size="large"
                      color={StyleGuide.color.primary}
                    />
                  </View>
                ) : currentAvatarUri ? (
                  <Image
                    source={{ uri: currentAvatarUri }}
                    style={styles.avatarBox}
                  />
                ) : (
                  <View
                    style={[
                      styles.avatarBox,
                      { backgroundColor: isDarkMode ? '#334155' : '#E2E8F0' },
                    ]}>
                    <Ionicons name="person" size={54} color={subtextColor} />
                  </View>
                )}

                {/* Online indicator */}
                <View
                  style={[
                    styles.onlineBadge,
                    {
                      backgroundColor: isLoggedIn ? '#10B981' : '#EF4444',
                    },
                  ]}
                />

                {/* Edit Photo Floating Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={selectImage}
                  style={styles.cameraBadge}>
                  <MaterialCommunityIcons
                    name="camera"
                    size={18}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>

              {uploading && (
                <Text style={styles.uploadingNote}>
                  Uploading new photo, please wait...
                </Text>
              )}
            </View>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              {/* Email (Read-only) */}
              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: subtextColor }]}>
                  Email Address
                </Text>
                <TextInputComponent
                  value={email}
                  placeholder="Your Email"
                  label="email"
                  name="mail-outline"
                  isReadOnly={true}
                  darkMode={mode}
                />
              </View>

              {/* Full Name */}
              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: subtextColor }]}>
                  Full Name
                </Text>
                <TextInputComponent
                  value={name}
                  placeholder="Enter Name"
                  label="name"
                  name="person-outline"
                  setValue={setName}
                  setError={setError}
                  darkMode={mode}
                />
              </View>

              {/* Date of Birth Picker Button */}
              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: subtextColor }]}>
                  Date of Birth
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setDatePickerVisibility(true)}
                  style={[
                    styles.dobButton,
                    {
                      backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC',
                      borderColor: borderColor,
                    },
                  ]}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={StyleGuide.color.primary}
                    style={{ marginRight: 12 }}
                  />
                  <Text
                    style={[
                      styles.dobText,
                      {
                        color: dateOfBirth ? textColor : subtextColor,
                      },
                    ]}>
                    {dateOfBirth
                      ? moment(dateOfBirth).format('MMMM DD, YYYY')
                      : 'Select your birth date'}
                  </Text>
                </TouchableOpacity>
              </View>

              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={date => {
                  setDateOfBirth(date);
                  setDatePickerVisibility(false);
                }}
                onCancel={() => {
                  setDatePickerVisibility(false);
                }}
                date={dateOfBirth !== undefined ? dateOfBirth : new Date()}
                maximumDate={new Date()}
              />

              {/* Phone Number & Send OTP */}
              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: subtextColor }]}>
                  Phone Number
                </Text>
                <View style={styles.phoneInputRow}>
                  <View style={{ flex: 1 }}>
                    <TextInputComponent
                      value={phoneNumber}
                      placeholder="+923151234567"
                      label="phone"
                      name="call-outline"
                      setValue={setPhoneNumber}
                      setError={setError}
                      keyboardType="phone-pad"
                      darkMode={mode}
                    />
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.otpSendBtn,
                      {
                        backgroundColor: StyleGuide.color.primaryLight,
                        borderColor: StyleGuide.color.primary,
                      },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => verifyPhoneNumber(phoneNumber)}>
                    <Text
                      style={[
                        styles.otpSendText,
                        { color: StyleGuide.color.primaryDark },
                      ]}>
                      Send OTP
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* OTP Verification Input */}
              {ishow && (
                <View style={styles.fieldWrap}>
                  <Text style={[styles.fieldLabel, { color: subtextColor }]}>
                    Verification Code
                  </Text>
                  <TextInputComponent
                    value={code}
                    placeholder="Enter 6-digit OTP code"
                    label="otp"
                    name="shield-checkmark-outline"
                    setValue={setCode}
                    setError={setError}
                    keyboardType="phone-pad"
                    darkMode={mode}
                  />
                  <TouchableOpacity
                    onPress={() => confirmCode(code)}
                    activeOpacity={0.7}
                    style={styles.verifyOtpLinkWrap}>
                    <Text style={styles.verifyOtpLink}>Confirm & Verify OTP →</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Update Button */}
              <View style={styles.updateBtnContainer}>
                <ButtonComponent
                  buttonTitle="Save Changes"
                  color="#FFFFFF"
                  backgroundColor={
                    loader ? '#94A3B8' : StyleGuide.color.primary
                  }
                  onPress={updateProfile}
                  disabled={loader}
                  uploading={loader}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 36,
  },
  headerBanner: {
    paddingTop: 36,
    paddingBottom: 64,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  headerDecorativeCircle1: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -40,
    right: -30,
  },
  headerDecorativeCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -20,
    left: -20,
  },
  headerTitle: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 22,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginTop: -50,
    marginBottom: 16,
  },
  avatarWrapper: {
    width: 106,
    height: 106,
    borderRadius: 53,
    backgroundColor: '#FFFFFF',
    padding: 3,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    position: 'relative',
  },
  avatarBox: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: StyleGuide.color.primary,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  uploadingNote: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: StyleGuide.fontFamily.medium,
    color: StyleGuide.color.primary,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  fieldWrap: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 13,
    marginBottom: 6,
    marginLeft: 4,
  },
  dobButton: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  dobText: {
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 14,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  otpSendBtn: {
    height: 52,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  otpSendText: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 13,
  },
  verifyOtpLinkWrap: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 4,
  },
  verifyOtpLink: {
    color: StyleGuide.color.primaryDark,
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 13,
  },
  updateBtnContainer: {
    marginTop: 14,
  },
});

export default ProfileScreen;
