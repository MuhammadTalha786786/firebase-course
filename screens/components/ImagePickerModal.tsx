/** @format */

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ViewStyle,
} from 'react-native';
import ButtonComponent from './ButtonComponent';
import { StyleGuide } from '../../Utils/StyleGuide';
import Svg from './Svg';
 import {close, closeBlack} from '../../Utils/SvgAssests'
import { ImagePicker } from 'react-native-image-crop-picker';
import ModalComponent from './Modal';




type IModalProps = {
  modalVisible: boolean;
  animationType?: 'slide' | 'fade' | 'none';
  setModalVisible?: (val: boolean) => void;
  imagePicker:(e:'Gallery' | 'Camera') => void
  onPress?: () => void;
  component?: React.ReactNode;
  title?: string;
  styleModal?: ViewStyle;
  
};

const ImagePickerModal = (props: IModalProps) => {
  const style = styles(props);
  return (
    <ModalComponent
    // styleModal={{bottom: 60}}
    isVisible={props?.modalVisible}
    setVisibility={props?.setModalVisible}
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
            <Text  style={{fontFamily:StyleGuide.fontFamily.medium, color:StyleGuide.color.light}} >Choose Profile Image</Text>
          </View>
          <TouchableOpacity
            onPress={() => props?.setModalVisible(false)}
            style={{ alignItems: 'flex-end', marginRight: '3%' }}>
            <Svg xml={close} rest={{ height: 16, width: 16 }} />
          </TouchableOpacity>
        </View>
        <View style={{ padding: 10 }} >
          <ButtonComponent btnType='file-image-o' buttonTitle='Choose from Gallery' backgroundColor='#FFFAEF' color='black' onPress={() => { props?.imagePicker('Gallery') }} />

          <ButtonComponent btnType='camera' buttonTitle='Open Camera' color={'#fff'}
            backgroundColor={StyleGuide.color.primary} onPress={() => { props?.imagePicker('Camera') }} />

        </View>

      </View>
    }
  />
  );
};

export default ImagePickerModal;

const styles = (props: IModalProps) =>
  StyleSheet.create({
    closeContainer: {
      flexDirection: 'row',
       justifyContent: 'space-between',
    },

    centeredView: {
      backgroundColor: '#fff',
      width: '100%',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      flex: 1,
      position: 'absolute',
      zIndex: 99999999,
      paddingVertical: 20,
      bottom: 0,
      paddingHorizontal: 15,
    },
    button: {
      borderRadius: 20,
      padding: 10,
      elevation: 2,
    },
  });
