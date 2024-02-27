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
import React, { useState, useEffect, useRef } from 'react';
import { StyleGuide } from '../../Utils/StyleGuide';
import { Card, Paragraph } from 'react-native-paper';
import { Avatar } from 'native-base';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { widthPercentageToDP } from 'react-native-responsive-screen';
import moment from 'moment';
import uuid from 'react-native-uuid';
import Share from 'react-native-share';
import ImgToBase64 from 'react-native-image-base64';
import ProgressiveImage from '../components/ProgressiveImage';
import { StackParamList } from '../../Utils/routes';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { reducerType } from '../../Utils/types';
import Svg from '../components/Svg';
import { commentIcon, sendIcon } from '../../Utils/SvgAssests';
import Video from 'react-native-video';


const CardUI = ({
  item,
  mode,
  isPostLiked,
  setIsPostLiked,
  postData,
  setGetData,
  getDataofUserPost,
}) => {
  const authState = useSelector((state: reducerType) => state);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [imageBase64URL, setImageBase64URL] = useState('');
  const [tempLikes, setTempLikes] = useState(item.likes);
  // console.warn(tempLikes,"temp likes")

  let userID = authState.userAuthReducer.uid;

  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();

  useFocusEffect(
    React.useCallback(() => {
      setTempLikes(item.likes),
        likeStatus(item.likes);

    }, []),
  );




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
        //  tempLikes = tempLikes.filter(el => userID !== el.userID);
        const upd_obj = tempLikes.map(obj => {

          if (obj.userID == userID) {
            obj.isLike = !obj.isLike;
          }
          return obj;
        })


        setTempLikes(upd_obj);
        // console.warn(tempLikes.length, "filterArray");
        // likeStatus([...tempLikes]);
        firestore()
          .collection('posts')
          .doc(item.postID)
          .update({
            likes: tempLikes,
          })
          .then(() => {
            likeStatus(tempLikes);
            console.log('post updated!, called');
          });
      } else {
        setIsPostLiked(!isPostLiked);
        tempLikes?.push({
          userID: userID,
          postDetail: item.postDetail,
          userName: item.userName,
          userProfileImaege: userProfileImage,
          timeLiked: new Date(),
          isLike: true
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
        isLike: true
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
      { cancelable: false },
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

  const progressiveImageURL = require('../../images/default-img.jpeg')
  const likesLength = tempLikes.filter(x => x.isLike === true)
  const result = tempLikes.find(x => x.userID === userID)
  // const isliked  = result.includes(x => x.isLike ==  true)
  console.warn(result, "value")

  const videoPlayer = useRef
    ()




  return (
    <View>
      <View style={{ padding: 10 }}>
        <Card
          style={{ backgroundColor: mode ? 'rgb(40, 42, 54)' : '#fff' }}
          mode="contained">
          <View
            style={{
              justifyContent: 'space-between',
              flexDirection: 'row',
            }}>
            <View style={{ flexDirection: 'row' }}>
              <TouchableHighlight
                activeOpacity={0.6}
                underlayColor="#DDDDDD"
                onPress={() => {
                  navigation.navigate('UserProfile', { id: item.userID });
                }}>
                <Avatar
                  style={{ marginVertical: 10, marginHorizontal: 10 }}
                  source={{ uri: item.userImage }}>
                  <Avatar.Badge bg={item.isLogin ? 'green.500' : 'red.500'} />
                </Avatar>
              </TouchableHighlight>
              <View style={{ marginVertical: 15 }}>
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
                  style={{ marginHorizontal: 10, marginVertical: 15 }}
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
          {
            item?.isVideo ? item?.postedVideo ?
              <Video source={{ uri: item?.postedVideo }}   // Can be a URL or a local file.
                ref={(ref) => {
                  videoPlayer
                }}
                fullscreen={false}
                controls={true}


                // Store reference
                //  onBuffer={this.onBuffer}                // Callback when remote video is buffering
                //  onError={this.videoError}               // Callback when video cannot be loaded
                style={styles.backgroundVideo}
              /> : null :



              item.postImage == undefined ||
                item.postImage == null ||
                item.postImage == '' ? (
                <ProgressiveImage
                  source={progressiveImageURL}
                  style={{ width: '100%', height: 250 }}
                />
              ) : (
                <Card.Cover source={{ uri: item.postImage }} />
              )}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row' }}>
              <Pressable
                onPress={() => {
                  addPostLiked(tempLikes), setIsPostLiked(!isPostLiked);
                }}
                android_ripple={{ color: 'red', borderless: false }}
              // style={({pressed}) => [
              //   {
              //     backgroundColor: pressed ? 'rgb(210, 230, 255)' : '',
              //   },
              // ]}>
              >
                <AntDesign
                  style={{ marginHorizontal: 10, marginVertical: 15 }}
                  name={result?.isLike ? 'heart' : 'hearto'}
                  color={
                    result?.isLike ? 'red' : mode ? '#ffff' : 'black'
                  }
                  size={20}
                />
              </Pressable>
              <View>
                {likesLength.length > 0 && (
                  <Text
                    style={{
                      marginVertical: 15,
                      marginHorizontal: 5,
                      color: mode ? '#ffff' : 'black',
                      fontSize: widthPercentageToDP('3.5%'),
                      fontFamily: StyleGuide.fontFamily.medium,
                    }}>{`${likesLength.length} likes`}</Text>
                )}
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                marginHorizontal: 10,
                marginVertical: 15,
              }}>

              <Pressable android_ripple={{ color: StyleGuide.color.primary, borderless: false }}

                onPress={() => {
                  navigation.navigate('Comment', {
                    postData: postData,
                    comments: item.comments,
                    setGetData: setGetData,
                    postID: item.postID,
                    mode: mode,
                  });
                }}
              >
                <Svg xml={commentIcon} rest={{ width: 22, height: 22, color: '#fff' }} />

              </Pressable>

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

            <Paragraph
              style={{
                width: '70%',
                marginVertical: 0,
                paddingHorizontal: 10,


                color: mode ? '#ffff' : 'black',
                fontSize: widthPercentageToDP('3%'),
                fontFamily: StyleGuide.fontFamily.medium,
              }}>
              {item.postDetail?.charAt(0).toUpperCase() +
                item?.postDetail?.slice(1)}
            </Paragraph>
          </View>

          <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
            <View style={{ flexDirection: 'row' }}>
              <View>
                <Avatar
                  size="sm"
                  style={{ marginVertical: 10, marginHorizontal: 5 }}
                  source={{ uri: userProfileImage }}>
                  <Avatar.Badge bg={isLogin ? 'green.500' : 'red.500'} />
                </Avatar>
              </View>

              <View
                style={{
                  width: '75%',
                }}>
                <TextInput
                  style={[styles.input, { color: mode ? 'white' : 'black' }]}
                  placeholderTextColor={mode ? 'white' : 'black'}
                  value={comment}
                  onChangeText={text => setComment(text)}
                  placeholder="Add a comment..."
                />
              </View>
            </View>
            <View>
              <TouchableOpacity style={styles.postButton} onPress={postComment}>
                <Svg xml={sendIcon} rest={{ width: 20, height: 20 }} />
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
    margin: 20,
    borderBottomColor: 'grey',
    borderBottomWidth: 0.5,
    // padding: 10,
    marginVertical: 10,
    marginHorizontal: 5,
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: widthPercentageToDP('3%'),
  },
  postButton: {

    marginHorizontal: 20,
    marginVertical: 25,
  },
  buttonText: {
    textAlign: 'center',
    marginVertical: 15,
    color: 'blue',
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: widthPercentageToDP('3%'),
  },
  backgroundVideo: {
    flex: 1,
    height: 300,
    width: "100%"
  },
});

export default CardUI;