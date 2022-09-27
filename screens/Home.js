import {View, Text, Image, StyleSheet} from 'react-native';
import React from 'react';

const Home = ({route}) => {
  const {email, pic} = route.params;
  console.warn(pic);
  return (
    <View>
      <Text style={{color: 'red', fontSize: 30}}>{email}</Text>
      <Image
        style={styles.tinyLogo}
        source={{
          uri: pic,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
  },
  tinyLogo: {
    width: 50,
    height: 50,
  },
  logo: {
    width: 66,
    height: 58,
  },
});
export default Home;
