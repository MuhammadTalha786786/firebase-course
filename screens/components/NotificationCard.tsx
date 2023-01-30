import {View, Text, Image, StyleSheet} from 'react-native';
import React from 'react';
import {Avatar} from 'native-base';
import {StyleGuide} from '../../Utils/StyleGuide';
import {widthPercentageToDP} from 'react-native-responsive-screen';
import moment from 'moment';

const NotificationCard = ({item, mode}) => {
  console.log(mode, 'user item');
  let likedTime = item.timeLiked.toDate();
  return (
    <View style={{padding: 10}}>
      <View
        style={[
          styles.listItem,
          {backgroundColor: mode ? 'rgb(40, 42, 54)' : '#f6f8fa'},
        ]}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={{flexDirection: 'row'}}>
            <Avatar
              size={'md'}
              style={{marginVertical: 3, marginHorizontal: 3}}
              source={{uri: item.userProfileImaege}}>
              {/* <Avatar.Badge bg={item.isLogin ? 'green.500' : 'red.500'} /> */}
            </Avatar>
            <Text
              style={[
                styles.title,
                {color: mode ? StyleGuide.color.light : StyleGuide.color.dark},
              ]}>
              {item.userName.charAt(0).toUpperCase() + item.userName.slice(1)}{' '}
            </Text>
          </View>
          <View style={{marginVertical: 10}}>
            <Text
              style={{
                color: mode ? StyleGuide.color.light : StyleGuide.color.dark,
                fontFamily: StyleGuide.fontFamily.medium,
              }}>
              {moment(likedTime).fromNow(false)}
            </Text>
          </View>
        </View>
        <View style={styles.metaInfo}>
          <Text
            style={[
              styles.postDetail,
              {color: mode ? StyleGuide.color.light : StyleGuide.color.dark},
            ]}>
            Liked Your Post {item.postDetail}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    color: '#101010',
    marginTop: 60,
    fontWeight: '700',
  },
  listItem: {
    padding: 30,
    marginTop: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 5,
    color: 'rgb(57, 58, 52)',
    shadowColor: 'grey',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
    height: 120,
  },
  coverImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  metaInfo: {
    marginVertical: 0,
    marginHorizontal: 50,
  },
  title: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: widthPercentageToDP('4%'),
    // width: 200,
    padding: 10,
  },
  postDetail: {
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: widthPercentageToDP('3%'),
    // width: 200,
    padding: 10,
  },
});

export default NotificationCard;
