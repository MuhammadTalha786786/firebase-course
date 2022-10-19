import {View, Text, Image, StyleSheet, Button} from 'react-native';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {setSignOut} from '../Redux/Auth/AuthReducer';

const Home = ({route}) => {
  const dispatch = useDispatch();
  const authState = useSelector((state: AppState) => state);
  const logout = () => {
    dispatch(setSignOut());
  };

  console.log(authState, 'authState...');
  return (
    <View>
      <Text
        onPress={() => logout}
        style={{
          color: 'black',
        }}>
        Welcome to the app!.....
      </Text>

      <Button
        onPress={logout}
        title="Sign Out"
        color="#841584"
        accessibilityLabel="Learn more about this purple button"
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
