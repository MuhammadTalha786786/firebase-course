import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import React, {useEffect, useState, useLayoutEffect} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StyleGuide} from '../../Utils/StyleGuide';
import {TextInput} from 'react-native-paper';
import ButtonComponent from '../components/ButtonComponent';
import {useDispatch, useSelector} from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import {Avatar} from 'native-base';
import moment from 'moment';
import {widthPercentageToDP} from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Comment = () => {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [isFetchingComments, setIsFetchingComments] = useState(false);
  const authState = useSelector((state: AppState) => state);
  const route = useRoute();
  const navigation = useNavigation();
  let id = authState.userAuthReducer.uid;
  let postId = route.params.postID;
  console.log(postId, 'post id is here');
  let mode = route.params?.mode;

  console.log(mode, 'comments');
  useEffect(() => {
    getComments();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTintColor: StyleGuide.color.light,
      headerStyle: {backgroundColor: StyleGuide.color.primary},
      headerTitleStyle: {
        fontWeight: 'bold',
        fontFamily: StyleGuide.fontFamily.medium,
      },
    });
  }, [navigation]);

  const getComments = () => {
    firestore()
      .collection('posts')
      .doc(postId)

      .get()
      .then(querySnapshot => {
        console.log(querySnapshot.data().comments);
        setComments(querySnapshot.data().comments);
        /* ... */
      });
  };
  console.log(comments, 'comemnts');
  const DeleteComment = (commentID, postID) => {
    Alert.alert(
      'Are you sure to delete?',
      'never recover',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            userCommentDeleted(commentID, postID);
          },
          style: 'destructive',
        },
      ],
      {cancelable: false},
    );
  };

  const userCommentDeleted = (commentID, postID) => {
    console.log(commentID, 'on ');

    firestore()
      .collection('posts')
      .doc(postID)
      .update({
        comments: comments.filter(c => c.commentID !== commentID),
      })
      .then(() => {
        Alert.alert('your comment has been Deleted...');
        getComments();
      })
      .catch(error => {
        console.log(error.message);
      });
  };

  console.log(comments, 'length');
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
        {/* <View style={styles.mainView}>
                    <Text style={styles.mainViewContent}>Comments</Text>
                </View> */}

        <View style={{width: '100%'}}>
          {comments.length === 0 ? (
            <Text
              style={{
                color: mode ? 'white' : 'black',
                textAlign: 'center',
                marginVertical: 15,
                fontFamily: StyleGuide.fontFamily.regular,
              }}>
              No Comments Found!
            </Text>
          ) : (
            <FlatList
              data={comments}
              onRefresh={getComments}
              refreshing={isFetchingComments}
              renderItem={({item}) => {
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
                          <Text style={styles.userProfileName}>
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
                          <Text style={styles.commentStyle}>
                            {item?.comment}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.dateStyle}>
                            {moment(item?.commentCreated.toDate()).fromNow()}
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
    color: 'black',
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
    color: 'black',
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
    color: 'black',
    fontSize: widthPercentageToDP('2.5%'),
    fontFamily: StyleGuide.fontFamily.regular,
    marginVertical: 10,
    marginHorizontal: 10,
  },

  commentStyle: {
    color: 'black',
    fontSize: widthPercentageToDP('3.5%'),
    marginVertical: 5,
    marginHorizontal: 20,
    fontFamily: StyleGuide.fontFamily.regular,
  },
});

export default Comment;
