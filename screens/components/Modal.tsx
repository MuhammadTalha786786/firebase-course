/** @format */

import React from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ViewStyle,
} from 'react-native';

type IModalProps = {
  isVisible: boolean;
  animationType?: 'slide' | 'fade' | 'none';
  setVisibility?: (val: boolean) => void;
  isPicker?: boolean;
  showTerminalButton?: boolean;
  onPress?: () => void;
  component?: React.ReactNode;
  title?: string;
  applyMask?: (val: boolean) => void;
  disableButton?: boolean;
  styleModal?: ViewStyle;
  forMaps?: boolean;
  callBack?: () => void;
};

const ModalComponent = (props: IModalProps) => {
  const style = styles(props);
  return (
    <Modal
      accessibilityViewIsModal={false}
      animationType={props.animationType ? props.animationType : 'slide'}
      transparent={true}
      visible={props.isVisible}
      onRequestClose={() => {
        if (props?.setVisibility) {
          props.setVisibility(false);
        }
      }}>
      <TouchableOpacity
        style={stylesRaw.backdrop}
        activeOpacity={1}
        onPress={() => {
          if (props?.forMaps) {
            if (props?.callBack) props?.callBack();
          } else {
            if (props?.setVisibility) props?.setVisibility(false);
          }
        }}
      />
      <View style={[style.centeredView, props?.styleModal]}>
        {props.component}
      </View>
    </Modal>
  );
};

export default ModalComponent;

const stylesRaw = StyleSheet.create({
  backdrop: {
    flex: 1,
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    height: '100%',
    left: 0,
    width: '100%',
  },
});

const styles = (props: IModalProps) =>
  StyleSheet.create({
    centeredView: {
      backgroundColor: '#fff',
      width: '100%',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      position: 'absolute',
      zIndex: 99999999,
      paddingVertical: 20,
      bottom: props.isPicker ? Dimensions.get('screen').height - 600 : 0,
      paddingHorizontal: 15,
    },
  });
