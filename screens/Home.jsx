import {View, Text, Image, StyleSheet, Button, Alert} from 'react-native';
import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {setSignOut} from '../Redux/Auth/AuthReducer';
import {useEffect} from 'react';
import auth from '@react-native-firebase/auth';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import database from '@react-native-firebase/database';

import TextInputComponent from './components/TextInputComponent';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StyleGuide} from '../Utils/StyleGuide';
import FeatherIcon from 'react-native-vector-icons/Feather';

const Home = () => {

  const [post, setPost] = useState();
  const dispatch = useDispatch();
  const authState = useSelector((state: AppState) => state);
  const [image, setImage] = useState();

  const logout = () => {
    dispatch(setSignOut());
  };

  function getUserData(uid) {
    const LoginUser = {
      isLoggedIn: true,
    };
    database()
      .ref('users/' + uid)
      .once('value', snap => {
        console.log(snap.val().name, 'snaps home');
      });
  }
  useEffect(() => {
    auth().onAuthStateChanged(user => {
      if (user) {
        console.log(user, 'login user');
        getUserData(user.uid);
      }
    });
  }, []);

  console.log(authState.userAuthReducer, 'auth reducer');
  return (
    <SafeAreaView style={styles.SafeAreaView}>
      <View>
        <Text style={styles.postHeading}>Create the Post...</Text>
        <View style={{padding: 10}}>
          <TextInputComponent
            value={post}
            setValue={setPost}
            placeholder="Enter Text for Post"
            mode="outlined"
            label="Post"
            multiline
            numberOfLines={4}
          />
        </View>

        <Text style={{color: 'black', fontSize: 20}}>
          {authState.userAuthReducer.userName}
        </Text>

        <Image
          style={styles.logo}
          source={{
            uri: authState.userAuthReducer.photoURL,
          }}
        />

        <Button
          onPress={()=>{}}
          title="Sign Out"
          color="#841584"
          accessibilityLabel="Learn more about this purple button"
        />

        <Button
          onPress={logout}
          title="Sign Out"
          color="#841584"
          accessibilityLabel="Learn more about this purple button"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  postHeading: {
    textAlign: 'center',
    justifyContent: 'center',
    fontFamily: StyleGuide.fontFamily.medium,
    color: StyleGuide.color.heading,
    fontSize: StyleGuide.fontSize.medium,
  },
  SafeAreaView: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  logo: {
    height: 50,
    width: 50,
  },

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
