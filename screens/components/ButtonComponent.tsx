import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {StyleGuide} from '../../Utils/StyleGuide';

interface ButtonProps {
  buttonTitle: string;
  btnType?: string;
  color?: string;
  disabled?: boolean;
  backgroundColor?: string;
  uploading?: boolean;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
  borderColor?: string;
  iconColor?: string;
}

const ButtonComponent = (props: ButtonProps) => {
  const bgColor = props.backgroundColor || StyleGuide.color.primary;
  const textColor = props.color || '#FFFFFF';
  const showIcon =
    props.btnType &&
    props.btnType !== 'sign-in' &&
    props.btnType !== 'none';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.buttonContainer,
        {
          backgroundColor: bgColor,
          borderColor: props.borderColor || 'transparent',
          borderWidth: props.borderColor ? 1 : 0,
        },
        props.style,
      ]}
      disabled={props.disabled || props.uploading}
      onPress={props.onPress}>
      {showIcon && (
        <View style={styles.iconWrapper}>
          <FontAwesome
            name={props.btnType!}
            style={styles.icon}
            size={18}
            color={props.iconColor || textColor}
          />
        </View>
      )}
      <View style={styles.btnTxtWrapper}>
        {props.uploading ? (
          <ActivityIndicator color={textColor} size={20} />
        ) : (
          <Text style={[styles.buttonText, {color: textColor}]}>
            {props.buttonTitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    height: 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
  },
  iconWrapper: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontWeight: 'bold',
  },
  btnTxtWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: StyleGuide.fontSize.buttonText,
    fontFamily: StyleGuide.fontFamily.medium,
    letterSpacing: 0.3,
  },
});

export default ButtonComponent;
