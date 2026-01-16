import {View, Text, SafeAreaView, StyleSheet, FlatList} from 'react-native';
import React, {useEffect, useState} from 'react';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import {useSelector} from 'react-redux';
import FriendListCard from './components/FriendListCard';
import {StyleGuide} from '../Utils/StyleGuide';

type AppState={
  userAuthReducer:{
    uid:string
  }
  darkModeReducer:{
    mode:boolean
  }

}

const FriendsScreen = () => {
  const authState = useSelector((state: AppState) => state);
  const [friendsList, setFriendsList] = useState<string []>([]);
  const userID = authState.userAuthReducer.uid;
  const mode = authState.darkModeReducer.mode;

  useEffect(() => {
    firestore()
      .collection('users')
      .where('uid', '!=', userID)
      .get()
      .then(res => {
        let userData:string[]  = [];
        res.forEach((documentSnap:FirebaseFirestoreTypes.DocumentData) => {
          let data= documentSnap.data();
          userData.push(data);
        });
        setFriendsList(userData);
      });
  }, []);

  console.log(friendsList, 'list of users');
  return (
    <SafeAreaView
      style={[
        styles.SafeAreaView,
        {
          backgroundColor: mode
            ? StyleGuide.color.dark
            : StyleGuide.color.light,
        },
      ]}>
      <View>
        <FlatList
          data={friendsList}
          renderItem={({item}) => <FriendListCard item={item} mode={mode} />}
          keyExtractor={(item:{uid:string}) => item?.uid}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  SafeAreaView: {
    flex: 1,
  },
});

export default FriendsScreen;
