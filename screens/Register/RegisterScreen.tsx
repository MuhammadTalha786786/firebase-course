import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ButtonComponent from '../components/ButtonComponent';
import TextInputComponent from '../components/TextInputComponent';
import { StyleGuide } from '../../Utils/StyleGuide';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRegister } from './useRegister';
import ImagePickerModal from '../components/ImagePickerModal';

const RegisterScreen = ({ navigation }: { navigation: any }) => {
  const {
    name,
    setName,
    image,
    email,
    setEmail,
    error,
    setError,
    Password,
    setPassword,
    showPassword,
    setShowPassword,
    createNewAccount,
    onGoogleButtonPress,
    showPickerModal,
    handleCamera,
    setShowPickerModal,
    loading,
    registerLoading,
    userProfieImage,
  } = useRegister();

  const handleOpenPicker = () => {
    Keyboard.dismiss();
    setShowPickerModal(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Header Section */}
          <View style={styles.headerView}>
            <Image
              source={require('../../images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.titleText}>Create Account 🚀</Text>
            <Text style={styles.subtitleText}>
              Join Social Bea and start sharing moments
            </Text>
          </View>

          {/* Profile Image Avatar Section */}
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleOpenPicker}
              style={styles.avatarWrapper}>
              {loading ? (
                <View style={styles.avatarLoading}>
                  <ActivityIndicator
                    size="large"
                    color={StyleGuide.color.primary}
                  />
                </View>
              ) : image ? (
                <Image source={{ uri: image }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons
                    name="person"
                    size={46}
                    color={StyleGuide.color.textPlaceholder}
                  />
                </View>
              )}

              {/* Edit Camera Badge */}
              <View style={styles.cameraBadge}>
                <MaterialCommunityIcons
                  name="camera-plus"
                  size={16}
                  color="#FFFFFF"
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleOpenPicker}>
              <Text
                style={[
                  styles.avatarHintText,
                  userProfieImage
                    ? { color: StyleGuide.color.primaryDark }
                    : null,
                ]}>
                {userProfieImage ? 'Photo uploaded ✓' : 'Tap to add profile photo'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input Form Section */}
          <View style={styles.formView}>
            <View style={styles.inputWrap}>
              <TextInputComponent
                value={name}
                setValue={setName}
                placeholder="Enter your full name"
                label="name"
                setError={setError}
                name="person-outline"
              />
            </View>

            <View style={styles.inputWrap}>
              <TextInputComponent
                value={email}
                setValue={setEmail}
                placeholder="Enter your email"
                label="email"
                setError={setError}
                name="mail-outline"
              />
            </View>

            <View style={styles.inputWrap}>
              <TextInputComponent
                value={Password}
                setValue={setPassword}
                placeholder="Create a password"
                label="password"
                setError={setError}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                IsPassword={true}
              />
            </View>

            {/* Error Message */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Primary Register Button */}
            <View style={{ marginTop: 6 }}>
              <ButtonComponent
                disabled={registerLoading || loading}
                buttonTitle="Create Account"
                color="#FFFFFF"
                backgroundColor={
                  registerLoading || loading
                    ? '#94A3B8'
                    : StyleGuide.color.primary
                }
                onPress={createNewAccount}
                uploading={registerLoading}
              />
            </View>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Side-by-Side Social Buttons */}
          <View style={styles.socialButtonsRow}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <ButtonComponent
                buttonTitle="Google"
                btnType="google"
                color={StyleGuide.color.textPrimary}
                backgroundColor="#FFFFFF"
                borderColor="#E2E8F0"
                iconColor="#EA4335"
                onPress={onGoogleButtonPress}
                uploading={loading}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <ButtonComponent
                buttonTitle="Facebook"
                btnType="facebook"
                color={StyleGuide.color.textPrimary}
                backgroundColor="#FFFFFF"
                borderColor="#E2E8F0"
                iconColor="#1877F2"
                onPress={() => {}}
              />
            </View>
          </View>

          {/* Footer Sign In Link */}
          <View style={styles.accountView}>
            <Text style={styles.accountText}>Already have an account? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Login')}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Photo Selection Modal placed at root level */}
      <ImagePickerModal
        modalVisible={showPickerModal}
        setModalVisible={setShowPickerModal}
        imagePicker={handleCamera}
        title="Select Profile Photo"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 36,
  },
  headerView: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  titleText: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 22,
    color: StyleGuide.color.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  subtitleText: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 13,
    color: StyleGuide.color.textSecondary,
    textAlign: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2.5,
    borderColor: StyleGuide.color.border,
    padding: 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 42,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 42,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLoading: {
    width: '100%',
    height: '100%',
    borderRadius: 42,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: StyleGuide.color.primary,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  avatarHintText: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: StyleGuide.fontFamily.medium,
    color: StyleGuide.color.textSecondary,
  },
  formView: {
    width: '100%',
    marginBottom: 12,
  },
  inputWrap: {
    marginBottom: 10,
  },
  errorText: {
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 13,
    color: StyleGuide.color.error,
    marginTop: 2,
    marginBottom: 8,
    textAlign: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: StyleGuide.color.border,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 13,
    color: StyleGuide.color.textSecondary,
  },
  socialButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  accountView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  accountText: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 14,
    color: StyleGuide.color.textSecondary,
  },
  signInLink: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 14,
    color: StyleGuide.color.primary,
  },
});

export default RegisterScreen;
