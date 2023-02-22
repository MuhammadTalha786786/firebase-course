import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  FlatList,
  TouchableHighlight,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {setSignOut} from '../../Redux/Auth/AuthReducer';
import {useEffect} from 'react';
import auth from '@react-native-firebase/auth';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import database from '@react-native-firebase/database';

import {SafeAreaView} from 'react-native-safe-area-context';
import {StyleGuide} from '../../Utils/StyleGuide';
import FeatherIcon from 'react-native-vector-icons/Feather';
import {Box, TextArea} from 'native-base';
import {widthPercentageToDP} from 'react-native-responsive-screen';
import {Avatar} from 'native-base';
import {Button, Card, Title, Paragraph} from 'react-native-paper';
import CardUI from '../Post/CardUI';
import firestore from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';
import {async} from '@firebase/util';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import SkeletonPlaceHolder from '../components/SkeletonPlaceHolder';
import { useHome } from './useHome';


const Home = () => {
 const {
   isPostLiked,
   data,
   setIsPostLiked,
   setGetData,
   getData,
   mode,
   getPostData,
 } = useHome();

  return (
    <>
      <SafeAreaView
        style={[
          styles.SafeAreaView,
          {backgroundColor: mode ? 'black' : 'white'},
        ]}>
        {/* <View
          style={{
            justifyContent: 'space-between',
            flexDirection: 'row',
          }}>
          <View>
            <Avatar
              style={{
                marginVertical: 10,
                marginHorizontal: 10,
              }}
              size="md"
              source={require('./../images/logo.png')}></Avatar>
          </View>
          <View>
            <TouchableHighlight activeOpacity={0.6} underlayColor="#DDDDDD">
              <Avatar
                style={{
                  marginVertical: 10,
                  marginHorizontal: 10,
                }}
                size="md"
                source={{uri: userProfileImaege}}>
                <Avatar.Badge bg={isLoggedIn ? 'green.500' : 'red.500'} />
              </Avatar>
            </TouchableHighlight>
          </View>
        </View> */}

        <FlatList
          data={data}
          renderItem={({item}) =>
            getData ? (
              <SkeletonPlaceHolder />
            ) : (
              <CardUI
                item={item}
                mode={mode}
                setIsPostLiked={setIsPostLiked}
                isPostLiked={isPostLiked}
                postData={getPostData}
                setGetData={getData}
                PostedUser={item.userID}
              />
            )
          }
          onRefresh={getPostData}
          colors={["#9Bd35A", "#689F38"]}

           refreshing={getData}
          keyExtractor={item => item.postID}
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  postHeading: {
    textAlign: 'center',
    justifyContent: 'center',
    fontFamily: StyleGuide.fontFamily.medium,
    color: StyleGuide.color.heading,
    fontSize: widthPercentageToDP('3.5%'),
  },
  SafeAreaView: {
    flex: 1,
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
