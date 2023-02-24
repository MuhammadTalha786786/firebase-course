import React from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import {StyleGuide} from '../../StyleGuide';
type IModalProps = {
  isVisible: boolean;
  animationType?: 'slide' | 'fade' | 'none';
  setVisibility?: (item: boolean) => void;
  isPicker?: boolean;
  showTerminalButton?: boolean;
  onPress?: () => void;
  component?: React.ReactNode;
  title?: string;
  applyMask?: (val: boolean) => void;
  disableButton?: boolean;
  styleModal?: ViewStyle;
};

const ChatModal = (props: IModalProps) => {
  const style = styles(props);
  return (
    <Modal
      accessibilityViewIsModal={false}
      animationType={props.animationType ? props.animationType : 'slide'}
      transparent={true}
      visible={props.isVisible}
      onRequestClose={() => {
        props?.setVisibility(false);
      }}>
      <TouchableOpacity
        style={{
          // flex: 1,
          position: 'absolute',
          backgroundColor: '#00000055',
          height: '100%',
          left: 0,
          width: '100%',
          ...(props.isPicker ? {padding: 20, right: 20} : {}),
        }}
        activeOpacity={1}
        onPress={() => {
          console.log('pressed');
          props?.setVisibility(false);
        }}
      />
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          // flex: 1,
          paddingHorizontal: 15,
        }}>
        <View style={[style.centeredView, {...props?.styleModal}]}>
          <View style={style.innerView}>{props?.component}</View>
        </View>
      </View>
    </Modal>
  );
};

export default ChatModal;

const styles = (props: IModalProps) =>
  StyleSheet.create({
    centeredView: {
      backgroundColor: '#fff',
      width: '100%',
      borderRadius: 10,

      // alignSelf:'center',
      padding: 15,
    },
    button: {
      borderRadius: 20,
      padding: 10,
      elevation: 2,
    },
    innerView: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 10,
    },
    congratulations: {
      fontSize: 14,
      fontFamily: StyleGuide.fontFamily.regular,
      color: StyleGuide.color.lightGrey,
    },
    statusText: {
      fontSize: 14,
      fontFamily: StyleGuide.fontFamily.semiBold,
      color: StyleGuide.color.heading,
    },
  });
