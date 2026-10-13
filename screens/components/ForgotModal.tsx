import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TextInputComponent from './TextInputComponent';
import ButtonComponent from './ButtonComponent';
import { StyleGuide } from '../../Utils/StyleGuide';
import { BlurView } from '@react-native-community/blur';

interface IForgotModalProps {
  setModalVisible: (visible: boolean) => void;
  modalVisible: boolean;
  forgotEmail: string;
  setForgotEmail: (email: string) => void;
  forgotPassword: () => void;
  forgotEmailError?: string;
  setForgotEmailError?: (err: string) => void;
  setError?: (err: string) => void;
}

const ForgotModal: React.FC<IForgotModalProps> = ({
  setModalVisible,
  modalVisible,
  forgotEmail,
  setForgotEmail,
  forgotPassword,
  forgotEmailError,
  setError,
}) => {
  return (
    <Modal
      animationType="fade"
      statusBarTranslucent={true}
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}>
        {/* Backdrop overlay */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
          style={styles.backdrop}>
          <BlurView
            style={styles.blurView}
            blurType="dark"
            blurAmount={10}
            reducedTransparencyFallbackColor="rgba(0,0,0,0.5)"
          />
        </TouchableOpacity>

        {/* Modal Card */}
        <View style={styles.cardContainer}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.cardTitle}>Reset Password</Text>
              <Text style={styles.cardSubtitle}>
                Enter your email to receive recovery instructions
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeBtn}>
              <Ionicons
                name="close"
                size={22}
                color={StyleGuide.color.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrap}>
            <TextInputComponent
              value={forgotEmail}
              setValue={setForgotEmail}
              placeholder="Enter your registered email"
              label="email"
              name="mail-outline"
              setError={setError}
            />
          </View>

          {forgotEmailError ? (
            <Text style={styles.errorText}>{forgotEmailError}</Text>
          ) : null}

          <View style={styles.actionWrap}>
            <ButtonComponent
              buttonTitle="Send Recovery Link"
              color="#FFFFFF"
              backgroundColor={StyleGuide.color.primary}
              onPress={forgotPassword}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  cardContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: StyleGuide.fontFamily.bold,
    color: StyleGuide.color.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: StyleGuide.fontFamily.regular,
    color: StyleGuide.color.textSecondary,
    maxWidth: '90%',
  },
  closeBtn: {
    padding: 4,
  },
  inputWrap: {
    marginBottom: 10,
  },
  errorText: {
    color: StyleGuide.color.error,
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 4,
  },
  actionWrap: {
    marginTop: 10,
  },
});

export default ForgotModal;
