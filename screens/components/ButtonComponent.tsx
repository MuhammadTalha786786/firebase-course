import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {windowHeight} from '../../Utils/Dimesnions';
import {StyleGuide} from '../../Utils/StyleGuide';


interface ButtonProps {
  buttonTitle: string;
  btnType: string;
  color: string;
  disabled?:boolean;
  backgroundColor: string;
  uploading?: boolean;
  // setUploading: () => void;
  onPress: () => void;
}
const ButtonComponent = (props:ButtonProps) => {
  let bgColor = props.backgroundColor;

  return (
    <TouchableOpacity
      style={[styles.buttonContainer, {backgroundColor: bgColor}]}
      disabled={props.disabled || props.uploading}
      onPress={props.onPress}
      
      >
      <View style={styles.iconWrapper}>
        <FontAwesome
          name={props.btnType}
          style={styles.icon}
          size={22}
          color={props.color}
        />
      </View>
      <View style={styles.btnTxtWrapper}>
        {props.uploading ? (
          <ActivityIndicator color="white" size={20} />
        ) : (
          <Text style={[styles.buttonText, {color: props.color}]}>{props.buttonTitle}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginTop: 10,
    width: '100%',
    height: windowHeight / 15,
    padding: 10,
    flexDirection: 'row',
    borderRadius: 3,
  },
  iconWrapper: {
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontWeight: 'bold',
  },
  btnTxtWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: StyleGuide.fontSize.buttonText,
    fontFamily: StyleGuide.fontFamily.medium,
  },
});
export default ButtonComponent;
