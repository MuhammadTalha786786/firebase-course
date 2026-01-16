import {View, Text, SafeAreaView, FlatList, StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {useDispatch, useSelector} from 'react-redux';
import Lottie from 'lottie-react-native';
import NotificationCard from '../components/NotificationCard';
import {StyleGuide} from '../../Utils/StyleGuide';
import { useNotification } from './useNotification';

const Notifications = () => {
const {flatArray, mode, visible} = useNotification();
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: mode ? StyleGuide.color.dark : StyleGuide.color.light,
      }}>
      <View>
        {visible ? (
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <Lottie
              style={{height: 100}}
              source={require('../../9764-loader.json')}
              autoPlay
              loop
            />
          </View>
        ) : flatArray.length === 0 ? (
          <Text
            style={[
              styles.NotificationExist,
              {color: mode ? StyleGuide.color.light : StyleGuide.color.dark},
            ]}>
            No Notification !
          </Text>
        ) : (
          <FlatList
            data={flatArray}
            renderItem={({item}) => (
              <NotificationCard item={item} mode={mode} />
            )}
            keyExtractor={item => item.uid}
          />
        )}
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  lottie: {
    width: 100,
    height: 100,
  },
  NotificationExist: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 10,
    textAlign: 'center',
    marginVertical: 20,
  },
});
export default Notifications;
