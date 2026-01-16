import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native';
import React, {useEffect, useState, useLayoutEffect} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StyleGuide} from '../../Utils/StyleGuide';
import {TextInput} from 'react-native-paper';
import ButtonComponent from '../components/ButtonComponent';
import {useDispatch, useSelector} from 'react-redux';
import {Avatar} from 'native-base';
import moment from 'moment';
import {widthPercentageToDP} from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useComment} from './useComment';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

interface commentsI {
  comment:string
  commentCreated:FirebaseFirestoreTypes.Timestamp
  commentID:string
  postID:string
  userID:string
  userImage:string
  userProfileName:string
}


const Comment = () => {
  const {
    DeleteComment,
    getComments,
    comments,
    isFetchingComments,
    mode,
    id,
  } = useComment();


  console.warn(mode,"mode")
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
      <View style={{flex: 1}}>
        <View style={styles.mainView}>
                    <Text style={[styles.mainViewContent,{color:mode ? StyleGuide.color.light:StyleGuide.color.dark  }]}>Comments</Text>
                </View>

        <View style={{width: '100%'}}>
          {comments.length === 0 ? (
            <Text
              style={{
                color: mode ? StyleGuide.color.light : StyleGuide.color.dark,
                textAlign: 'center',
                marginVertical: 20,
                fontFamily: StyleGuide.fontFamily.regular,
              }}>
              No Comments Found!
            </Text>
          ) : (
            <FlatList
              data={comments}
              // onRefresh={getComments}
              // refreshing={isFetchingComments}
              renderItem={({item}:{item:commentsI}) => {
                {
                }
                return (
                  <>
                    <View>
                      <View
                        style={{
                          justifyContent: 'space-between',
                          flexDirection: 'row',
                        }}>
                        <View style={styles.userImageView}>
                          <View>
                            <Avatar
                              bg="indigo.500"
                              alignSelf="center"
                              size="md"
                              source={{uri: item.userImage}}
                            />
                          </View>
                          <Text style={[styles.userProfileName,{color:mode ? StyleGuide.color.light:StyleGuide.color.dark  }]}>
                            {item.userProfileName}
                          </Text>
                        </View>
                        {item.userID === id ? (
                          <View>
                            <MaterialCommunityIcons
                              style={{marginHorizontal: 10, marginVertical: 15}}
                              name={'delete'}
                              color={'red'}
                              size={22}
                              onPress={() => {
                                DeleteComment(item.commentID, item.postID);
                              }}
                            />
                          </View>
                        ) : null}
                      </View>

                      <View
                        style={{
                          justifyContent: 'space-between',
                          flexDirection: 'row',
                        }}>
                        <View>
                          <Text style={[styles.commentStyle,{color:mode ? StyleGuide.color.light:StyleGuide.color.dark  }]}>
                            {item?.comment}
                          </Text>
                        </View>
                        <View>
                          <Text style={[styles.dateStyle,{color:mode ? StyleGuide.color.light:StyleGuide.color.dark  }]}>
                            {moment(item?.commentCreated?.toDate()).fromNow()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </>
                );
              }}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  SafeAreaView: {
    flex: 1,
  },

  input: {
    height: 40,
    margin: 12,
    borderBottomColor: 'grey',
    borderBottomWidth: 1,
    padding: 10,
    marginVertical: 10,
    marginHorizontal: 5,
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: widthPercentageToDP('3%'),
  },
  mainView: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#8e8e8e',
    alignItems: 'center',
  },
  mainViewContent: {
    fontFamily: StyleGuide.fontFamily.medium,
    marginLeft: 15,
    fontSize: 18,
    fontWeight: '600',
    // color: 'black',
  },

  userImageView: {
    flex: 1,
    flexDirection: 'row',
    marginVertical: 10,
    marginHorizontal: 15,
  },

  userProfileName: {
    marginVertical: 10,
    marginHorizontal: 10,
    // color: 'black',
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: StyleGuide.fontSize.small,
  },

  commentView: {
    width: '100%',
    height: 60,
    position: 'absolute',
    bottom: 0,
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    padding: 10,
  },
  dateStyle: {
    // color: 'black',
    fontSize: widthPercentageToDP('2.5%'),
    fontFamily: StyleGuide.fontFamily.regular,
    marginVertical: 10,
    marginHorizontal: 10,
  },

  commentStyle: {
    // color: 'black',
    fontSize: widthPercentageToDP('3.5%'),
    marginVertical: 5,
    marginHorizontal: 20,
    fontFamily: StyleGuide.fontFamily.regular,
  },
  postButton: {
    height: 50,
    width: 50,
    borderRadius: 5.5,
    marginHorizontal: 5,
    marginVertical: 10,
  },
  buttonText: {
    textAlign: 'center',
    marginVertical: 15,
    color: 'blue',
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: widthPercentageToDP('3%'),
  },
});

export default Comment;
