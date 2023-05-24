import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';

  interface Props {
    children: React.ReactNode;
    style?: ViewStyle;
  }
const SafeArea = (props:Props) => {


  return (
    <LinearGradient
      colors={['#FFFFFF', '#E5FFE3', '#4E924A']}
      style={styles.linearGradient}>
      {props.children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  linearGradient: {
    flex:1,
    borderRadius: 5,
  },
});

export default SafeArea;
