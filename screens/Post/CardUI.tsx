import {
  Alert,
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  TouchableOpacity,
  TouchableHighlight,
  Pressable,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {StyleGuide} from '../../Utils/StyleGuide';
import {Card, Paragraph} from 'react-native-paper';
import {Avatar} from 'native-base';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {widthPercentageToDP} from 'react-native-responsive-screen';
import moment from 'moment';
import uuid from 'react-native-uuid';
import Share from 'react-native-share';
import ImgToBase64 from 'react-native-image-base64';
import ProgressiveImage from '../components/ProgressiveImage';
import { StackParamList } from '../../Utils/routes';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { reducerType } from '../../Utils/types';

const CardUI = ({
  item,
  mode,
  isPostLiked,
  setIsPostLiked,
  postData,
  setGetData,
  getDataofUserPost,
}) => {
  const authState = useSelector((state:reducerType) => state);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [imageBase64URL, setImageBase64URL] = useState('');
  const [tempLikes, setTempLikes] = useState(item.likes);
  // console.warn(tempLikes,"temp likes")

  let userID = authState.userAuthReducer.uid;

  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();
  const likeStatus = tempLikes => {
    let status = false;
    if (tempLikes?.length > 0) {
      tempLikes?.map(item => {
        console.log(item.userID === userID, 'user ID');
        if (item.userID == userID) {
          status = true;
        } else {
          status = false;
        }
      });
      return status;
    }
  };

   useFocusEffect(
   React.useCallback(() => {
    likeStatus(item.likes),
    setTempLikes(item.likes);
    }, []),
   );
  // useEffect(() => {}, []);

  // useEffect(() => {
  // postData()
  // }, [isPostLiked]);

  
  const addPostLiked = tempLikes => {
    // console.warn(tempLikes.length, "initial array")
    // console.log(arrayLikes);
    // likeStatus(arrayLikes);
    // setIsPostLiked(!isPostLiked);
    if (tempLikes?.length > 0) {
      let findCurrent = tempLikes.find(item => item.userID === userID);
      // console.warn(findCurrent != undefined, 'findCurrent');
      if (findCurrent != undefined) {
        setIsPostLiked(!isPostLiked);
        let array = [];
        tempLikes = tempLikes.filter(el => userID !== el.userID);
        console.warn(array);
        setTempLikes(tempLikes);
        // console.warn(tempLikes.length, "filterArray");
        likeStatus(tempLikes);
        firestore()
          .collection('posts')
          .doc(item.postID)
          .update({
            likes: tempLikes,
          })
          .then(() => {
            likeStatus(tempLikes);
            console.log('post updated!');
          });
      } else {
        setIsPostLiked(!isPostLiked);
        tempLikes?.push({
          userID: userID,
          postDetail: item.postDetail,
          userName: item.userName,
          userProfileImaege: userProfileImage,
          timeLiked: new Date(),
        });
        // setIsPostLiked(!isPostLiked);
        firestore()
          .collection('posts')
          .doc(item.postID)
          .update({
            likes: tempLikes,
          })
          .then(() => {
            likeStatus(tempLikes);

            console.log('post updated!');
          });
        likeStatus(tempLikes);
      }
    } else {
      setIsPostLiked(!isPostLiked);

      tempLikes?.push({
        userID: userID,
        postDetail: item.postDetail,
        userName: item.userName,
        userProfileImaege: userProfileImage,
        timeLiked: new Date(),
      });
      likeStatus(tempLikes);
      setIsPostLiked(!isPostLiked);

      firestore()
        .collection('posts')
        .doc(item.postID)
        .update({
          likes: tempLikes,
        })
        .then(() => {
          likeStatus(tempLikes);

          console.log('post updated!');
        });
    }
    // console.log('arrayLikes', arrayLikes);
    // firestore()
    //   .collection('posts')
    //   .doc(item.postID)
    //   .update({
    //     likes: arrayLikes,
    //   })
    //   .then(() => {
    //     likeStatus(arrayLikes);

    //     console.log('post updated!');
    //   });
  };

  // let PostedDate = item.dateCreated.toDate();

  const postComment = () => {
    if (comment !== '') {
      let commentID = uuid.v4();
      let userID = authState.userAuthReducer.uid;
      let userProfileName = authState.userAuthReducer.userName;
      let userProfileImage = authState.userAuthReducer.photoURL;
      let tempComments = item.comments;
      tempComments.push({
        userID: userID,
        userImage: userProfileImage,
        userProfileName: userProfileName,
        comment: comment,
        commentCreated: new Date(),
        postID: item.postID,
        commentID: commentID,
      });
      firestore()
        .collection('posts')
        .doc(item.postID)
        .update({
          comments: tempComments,
        })
        .then(() => {
          Alert.alert('your comment has been posted...');
          setComment('');
          setShowComment(false);
        })
        .catch(error => {
          console.log(error);
        });
    } else {
      Alert.alert('Please Enter the Comment...');
    }
  };

  const DeletePost = postID => {
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
            UserPostDeleted(postID);
          },
          style: 'destructive',
        },
      ],
      {cancelable: false},
    );
  };
  const UserPostDeleted = postID => {
    setIsPostLiked(!isPostLiked);

    firestore()
      .collection('posts')
      .doc(postID)
      .delete()
      .then(() => {
        Alert.alert('Your post has been deleted');
      });
  };

  const convertImage = async (name, image, title) => {
    console.log(image, title, 'share clicked');

    ImgToBase64.getBase64String(image.uri)
      .then(base64String => {
        console.log(base64String, 'base64');
        setImageBase64URL(base64String), sharePost(name, image, title);
      })
      .catch(err => console.log(err));
  };

  const sharePost = (name, image, title) => {
    console.warn(imageBase64URL, 'url of the image in share post');
    const options = {
      message: title,
      url: imageBase64URL,
    };
    Share.open(options)
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        err && console.log(err.message);
      });
  };
  let userProfileImage = authState.userAuthReducer.photoURL;
  let isLogin = authState.userAuthReducer.isLoggedIn;
  let PostedDate = item.dateCreated.toDate();

  console.log(item.postImage, 'post url');

  const progressiveImageURL  = require('../../images/default-img.jpeg')

  return (
    <View>
      <View style={{padding: 10}}>
        <Card
          style={{backgroundColor: mode ? 'rgb(40, 42, 54)' : '#f6f8fa'}}
          mode="elevated">
          <View
            style={{
              justifyContent: 'space-between',
              flexDirection: 'row',
            }}>
            <View style={{flexDirection: 'row'}}>
              <TouchableHighlight
                activeOpacity={0.6}
                underlayColor="#DDDDDD"
                onPress={() => {
                  navigation.navigate('UserProfile', {id: item.userID});
                }}>
                <Avatar
                  style={{marginVertical: 10, marginHorizontal: 10}}
                  source={{uri: item.userImage}}>
                  <Avatar.Badge bg={item.isLogin ? 'green.500' : 'red.500'} />
                </Avatar>
              </TouchableHighlight>
              <View style={{marginVertical: 15}}>
                <Text
                  style={{
                    color: mode ? '#ffff' : 'black',
                    marginHorizontal: 5,
                    fontFamily: StyleGuide.fontFamily.medium,
                  }}>
                  {item.userName?.charAt(0).toUpperCase() +
                    item.userName?.slice(1)}
                </Text>
                <Text
                  style={{
                    color: mode ? '#ffff' : 'black',
                    marginHorizontal: 5,

                    fontFamily: StyleGuide.fontFamily.medium,
                  }}>
                  {moment(PostedDate).fromNow(false)}
                </Text>
              </View>
            </View>

            {item?.userID === userID ? (
              <View>
                <MaterialCommunityIcons
                  style={{marginHorizontal: 10, marginVertical: 15}}
                  name={'delete'}
                  color={'red'}
                  size={22}
                  onPress={() => {
                    DeletePost(item?.postID);
                  }}
                />
              </View>
            ) : null}
          </View>

          {item.postImage == undefined ||
          item.postImage == null ||
          item.postImage == '' ? (
            <ProgressiveImage
              source={progressiveImageURL}
              style={{width: '100%', height: 250}}
            />
          ) : (
            <Card.Cover source={{uri: item.postImage}} />
          )}
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{flexDirection: 'row'}}>
              <Pressable
                onPress={() => {
                  addPostLiked(tempLikes), setIsPostLiked(!isPostLiked);
                }}
                android_ripple={{color: 'red', borderless: false}}
                // style={({pressed}) => [
                //   {
                //     backgroundColor: pressed ? 'rgb(210, 230, 255)' : '',
                //   },
                // ]}>
              >
                <AntDesign
                  style={{marginHorizontal: 10, marginVertical: 15}}
                  name={likeStatus(tempLikes) ? 'heart' : 'hearto'}
                  color={
                    likeStatus(tempLikes) ? 'red' : mode ? '#ffff' : 'black'
                  }
                  size={20}
                />
              </Pressable>
              <View>
                {item?.likes?.length > 0 && (
                  <Text
                    style={{
                      marginVertical: 15,
                      marginHorizontal: 5,
                      color: mode ? '#ffff' : 'black',
                      fontSize: widthPercentageToDP('3.5%'),
                      fontFamily: StyleGuide.fontFamily.medium,
                    }}>{`${tempLikes.length} likes`}</Text>
                )}
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginHorizontal: 10,
                marginVertical: 15,
              }}>
              <FontAwesome5
                name={'comment'}
                color={mode ? '#ffff' : 'black'}
                size={20}
                onPress={() => {
                  navigation.navigate('Comment', {
                    postData: postData,
                    comments: item.comments,
                    setGetData: setGetData,
                    postID: item.postID,
                    mode: mode,
                  });
                }}
              />
              <Text
                style={{
                  marginHorizontal: 5,
                  color: mode ? '#ffff' : 'black',
                  fontSize: widthPercentageToDP('3.5%'),
                  fontFamily: StyleGuide.fontFamily.medium,
                }}>
                {item?.comments?.length} comments
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'row',
              height: 40,
            }}>
            <Text
              style={{
                marginVertical: 0,
                marginHorizontal: 10,
                color: mode ? 'white' : 'black',
                fontSize: widthPercentageToDP('3%'),
                fontFamily: StyleGuide.fontFamily.bold,
              }}>
              {item.userName}
            </Text>
            <Paragraph
              style={{
                width: '70%',
                marginVertical: 0,

                color: mode ? '#ffff' : 'black',
                fontSize: widthPercentageToDP('3%'),
                fontFamily: StyleGuide.fontFamily.regular,
              }}>
              {item.postDetail?.charAt(0).toUpperCase() +
                item?.postDetail?.slice(1)}
            </Paragraph>
          </View>

          <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
            <View style={{flexDirection: 'row'}}>
              <View>
                <Avatar
                  size="sm"
                  style={{marginVertical: 10, marginHorizontal: 5}}
                  source={{uri: userProfileImage}}>
                  <Avatar.Badge bg={isLogin ? 'green.500' : 'red.500'} />
                </Avatar>
              </View>

              <View
                style={{
                  width: '75%',
                }}>
                <TextInput
                  style={[styles.input, {color: mode ? 'white' : 'black'}]}
                  placeholderTextColor={mode ? 'white' : 'black'}
                  value={comment}
                  onChangeText={text => setComment(text)}
                  placeholder="Add a comment..."
                />
              </View>
            </View>
            <View>
              <TouchableOpacity style={styles.postButton} onPress={postComment}>
                <Text style={styles.buttonText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default CardUI;
