import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { StyleGuide } from '../../Utils/StyleGuide';
import ModalComponent from './Modal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

type IModalProps = {
  modalVisible: boolean;
  animationType?: 'slide' | 'fade' | 'none';
  setModalVisible?: (val: boolean) => void;
  imagePicker: (e: 'Gallery' | 'Camera') => void;
  onPress?: () => void;
  component?: React.ReactNode;
  title?: string;
  styleModal?: ViewStyle;
};

const ImagePickerModal = (props: IModalProps) => {
  return (
    <ModalComponent
      isVisible={props?.modalVisible}
      setVisibility={props?.setModalVisible}
      styleModal={{
        paddingVertical: 0,
        paddingHorizontal: 0,
        backgroundColor: 'transparent',
        bottom: 0,
      }}
      component={
        <View style={styles.modalSheet}>
          {/* Top handle bar */}
          <View style={styles.modalHandle} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {props?.title || 'Select Profile Photo'}
            </Text>
            <TouchableOpacity
              onPress={() => props?.setModalVisible?.(false)}
              style={styles.closeBtn}
              activeOpacity={0.7}>
              <Ionicons
                name="close"
                size={22}
                color={StyleGuide.color.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Action Options */}
          <View style={styles.modalOptions}>
            <TouchableOpacity
              style={styles.optionCard}
              activeOpacity={0.7}
              onPress={() => props?.imagePicker('Gallery')}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: StyleGuide.color.primaryLight },
                ]}>
                <MaterialCommunityIcons
                  name="image-multiple"
                  size={24}
                  color={StyleGuide.color.primaryDark}
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Choose from Gallery</Text>
                <Text style={styles.optionSubtitle}>
                  Select an existing photo from library
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionCard, { marginTop: 12 }]}
              activeOpacity={0.7}
              onPress={() => props?.imagePicker('Camera')}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: '#EEF2FF' },
                ]}>
                <MaterialCommunityIcons
                  name="camera"
                  size={24}
                  color="#4F46E5"
                />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Take a Photo</Text>
                <Text style={styles.optionSubtitle}>
                  Use camera to snap a new picture
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    width: '100%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  modalTitle: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 18,
    color: StyleGuide.color.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  modalOptions: {
    width: '100%',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  optionTitle: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 15,
    color: StyleGuide.color.textPrimary,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 12,
    color: StyleGuide.color.textSecondary,
  },
});

export default ImagePickerModal;
