import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import ButtonComponent from '../components/ButtonComponent';
import { StyleGuide } from '../../Utils/StyleGuide';
import { widthPercentageToDP } from 'react-native-responsive-screen';
import TextInputComponent from '../components/TextInputComponent';
import ForgotModal from '../components/ForgotModal';
import { useLogin } from './useLogin.tsx';
import useGoogleSignIn from '../components/GoogleSignIn';

const LoginScreen = ({ navigation }) => {
  const {
    login,
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
    setShowPassword,
    onFacebookButtonPress,
    phoneLogin,
    otp,
    setOtp,
    setLoader,
    isLoginFormValid,
  } = useLogin();
  const { onGoogleButtonPress, loading } = useGoogleSignIn({ setLoader });

  const handleOpenForgot = () => {
    Keyboard.dismiss();
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.SafeAreaView} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar
        barStyle="dark-content"
        translucent={false}
        backgroundColor="#FFFFFF"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
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
            <Text style={styles.titleText}>Welcome Back 👋</Text>
            <Text style={styles.subtitleText}>
              Sign in to continue to Social Bea
            </Text>
          </View>

          {/* Input Form Section */}
          <View style={styles.formView}>
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

            {email.includes('+92') ? (
              <View style={styles.inputWrap}>
                <TextInputComponent
                  value={otp}
                  setValue={setOtp}
                  placeholder="Enter OTP code"
                  label="otp"
                  setError={setError}
                />
              </View>
            ) : (
              <View style={styles.inputWrap}>
                <TextInputComponent
                  value={Password}
                  setValue={setPassword}
                  placeholder="Enter your password"
                  label="password"
                  setError={setError}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  IsPassword={true}
                />
              </View>
            )}

            {/* Forgot Password Link */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.forgotPasswordWrap}
              onPress={handleOpenForgot}>
              <Text style={styles.forgotPassword}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Error Message */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Primary Action Button */}
            <ButtonComponent
              disabled={!isLoginFormValid || loader || loading}
              buttonTitle="Sign In"
              color="#FFFFFF"
              backgroundColor={
                !isLoginFormValid || loader || loading
                  ? '#CBD5E1'
                  : StyleGuide.color.primary
              }
              onPress={email.includes('+92') ? phoneLogin : login}
              uploading={loader || loading}
            />
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
                onPress={onFacebookButtonPress}
              />
            </View>
          </View>

          {/* Footer Sign Up Link */}
          <View style={styles.accountView}>
            <Text style={styles.accountText}>Don't have an account? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('RegisterScreen')}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal placed at root level */}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  SafeAreaView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 36,
  },
  headerView: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 16,
    marginBottom: 10,
  },
  titleText: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: widthPercentageToDP('6%'),
    color: StyleGuide.color.textPrimary,
    textAlign: 'center',
  },
  subtitleText: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: widthPercentageToDP('3.6%'),
    color: StyleGuide.color.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  formView: {
    width: '100%',
  },
  inputWrap: {
    marginBottom: 10,
  },
  forgotPasswordWrap: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    marginBottom: 14,
  },
  forgotPassword: {
    color: StyleGuide.color.textSecondary,
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: widthPercentageToDP('3.3%'),
  },
  errorText: {
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 13,
    color: StyleGuide.color.error,
    marginBottom: 12,
    textAlign: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
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
    paddingVertical: 12,
  },
  accountText: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 14,
    color: StyleGuide.color.textSecondary,
  },
  signUpText: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 14,
    color: StyleGuide.color.primary,
  },
});

export default LoginScreen;
