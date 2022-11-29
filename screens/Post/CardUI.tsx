import {
  Alert,
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  TouchableOpacity,
  TouchableHighlight,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {StyleGuide} from '../../Utils/StyleGuide';
import {Card, Title, Paragraph} from 'react-native-paper';
import {Avatar} from 'native-base';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';
import {IconButton, MD3Colors} from 'react-native-paper';
import {widthPercentageToDP} from 'react-native-responsive-screen';
import moment from 'moment';
import uuid from 'react-native-uuid';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import ImgToBase64 from 'react-native-image-base64';

const CardUI = ({
  mode,
  userName,
  userImage,
  postImage,
  title,
  subtitle,
  postID,
  arrayLikes,
  isPostLiked,
  setIsPostLiked,
  comments,
  date,
  getPostData,
  postData,
  setGetData,
  PostedUser,
  loginState,
}) => {
  const authState = useSelector((state: AppState) => state);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [imageBase64URL, setImageBase64URL] = useState('');

  let userID = authState.userAuthReducer.uid;
  console.log(
    postID,
    'userID',
    PostedUser,
    'postedUserid',
    userID === PostedUser,
  );
  const navigation = useNavigation();
  const likeStatus = arrayLikes => {
    if (arrayLikes?.length > 0) {
      let status = false;
      arrayLikes?.map(item => {
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

  const addPostLiked = arrayLikes => {
    console.log('arrayLikes', arrayLikes);

    setIsPostLiked(!isPostLiked);
    if (arrayLikes?.length > 0) {
      let findCurrent = arrayLikes.find(item => item.userID === userID);
      console.log(findCurrent);
      if (findCurrent) {
        arrayLikes = arrayLikes.filter(el => userID !== el.userID);
      } else {
        arrayLikes?.push({
          userID: userID,
          postDetail: subtitle,
          userName: userName,
          userProfileImaege: userProfileImaege,
          timeLiked: new Date(),
        });
      }
    } else {
      arrayLikes?.push({
        userID: userID,
        postDetail: subtitle,
        userName: userName,
        userProfileImaege: userProfileImaege,
        timeLiked: new Date(),
      });
    }
    console.log('arrayLikes', arrayLikes);
    firestore()
      .collection('posts')
      .doc(postID)
      .update({
        likes: arrayLikes,
      })
      .then(() => {
        console.log('post updated!');
      });
  };

  let PostedDate = date.toDate();

  const postComment = () => {
    let commentID = uuid.v4();
    let userID = authState.userAuthReducer.uid;
    let userProfileName = authState.userAuthReducer.userName;
    let userProfileImaege = authState.userAuthReducer.photoURL;
    let tempComments = comments;
    tempComments.push({
      userID: userID,
      userImage: userProfileImaege,
      userProfileName: userProfileName,
      comment: comment,
      commentCreated: new Date(),
      postID: postID,
      commentID: commentID,
    });
    firestore()
      .collection('posts')
      .doc(postID)
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

  console.log(imageBase64URL, 'image url');

  const convertImage = async (name, image, title) => {
    console.log(image, title, 'share clicked');

    ImgToBase64.getBase64String(image.uri)
      .then(base64String => {
        console.log(base64String, 'base64');
        setImageBase64URL(base64String), sharePost(name, image, title);
      })
      .catch(err => console.log(err));

    // RNFetchBlob.config({

    //     fileCache: true

    // }).fetch("GET", image.uri)       // the file is now downloaded at local storage

    //     .then(resp => {
    //         console.log(resp, "resp")

    //         image = resp.path();                // to get the file path

    //         return resp.readFile("base64");      // to get the base64 string

    //     })

    //     .then(base64 => {

    //         // here base64 encoded file data is returned

    //         setImageBase64URL(base64)
    //         sharePost(name, imageBase64URL, title)
    //         console.log(base64)

    //     });
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
  let userProfileImaege = authState.userAuthReducer.photoURL;
  let isLogin = authState.userAuthReducer.isLoggedIn;

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
                  navigation.navigate('Profile', {id: PostedUser});
                }}>
                <Avatar
                  style={{marginVertical: 10, marginHorizontal: 10}}
                  source={userImage}>
                  <Avatar.Badge bg={loginState ? 'green.500' : 'red.500'} />
                </Avatar>
              </TouchableHighlight>
              <Text
                style={{
                  color: mode ? '#ffff' : 'black',
                  marginVertical: 20,
                  marginHorizontal: 5,
                  fontFamily: StyleGuide.fontFamily.medium,
                }}>
                {userName?.charAt(0).toUpperCase() + userName?.slice(1)}
              </Text>
            </View>
            <View>
              {console.log(date)}
              <Text
                style={{
                  color: mode ? '#ffff' : 'black',
                  marginVertical: 20,
                  fontSize: widthPercentageToDP('3%'),
                  fontFamily: StyleGuide.fontFamily.regular,
                  marginHorizontal: 10,
                }}>
                {moment(PostedDate).fromNow(false)}
              </Text>
            </View>
          </View>

          <Card.Cover source={postImage} />
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{flexDirection: 'row'}}>
              <AntDesign
                style={{marginHorizontal: 10, marginVertical: 15}}
                name={likeStatus(arrayLikes) ? 'heart' : 'hearto'}
                color={
                  likeStatus(arrayLikes) ? 'red' : mode ? '#ffff' : 'black'
                }
                size={20}
                onPress={() => {
                  addPostLiked(arrayLikes);
                }}
              />
              <View>
                {arrayLikes.length > 0 && (
                  <Text
                    style={{
                      marginVertical: 15,
                      marginHorizontal: 5,
                      color: mode ? '#ffff' : 'black',
                      fontSize: widthPercentageToDP('3.5%'),
                      fontFamily: StyleGuide.fontFamily.medium,
                    }}>{`${arrayLikes.length} likes`}</Text>
                )}
              </View>

              <FontAwesome5
                style={{marginHorizontal: 10, marginVertical: 15}}
                name={'comment'}
                color={mode ? '#ffff' : 'black'}
                size={20}
                onPress={() => {
                  navigation.navigate('Comment', {
                    postData: postData,
                    comments: comments,
                    setGetData: setGetData,
                    postID: postID,
                    mode: mode,
                  });
                }}
              />
              <Text
                style={{
                  marginVertical: 15,
                  marginHorizontal: 5,
                  color: mode ? '#ffff' : 'black',
                  fontSize: widthPercentageToDP('3.5%'),
                  fontFamily: StyleGuide.fontFamily.medium,
                }}>
                {comments.length} comments
              </Text>
              <View style={{marginHorizontal: 10, marginVertical: 15}}>
                <MaterialCommunityIcons
                  name="share-variant-outline"
                  size={25}
                  color={mode ? '#ffff' : 'black'}
                  onPress={() => convertImage(userName, postImage, subtitle)}
                />
              </View>
            </View>

            {PostedUser === userID ? (
              <View>
                <MaterialCommunityIcons
                  style={{marginHorizontal: 10, marginVertical: 15}}
                  name={'delete'}
                  color={'red'}
                  size={22}
                  onPress={() => {
                    DeletePost(postID);
                  }}
                />
              </View>
            ) : null}
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
              {userName}
            </Text>
            <Paragraph
              style={{
                width: '70%',
                marginVertical: 0,

                color: mode ? '#ffff' : 'black',
                fontSize: widthPercentageToDP('3%'),
                fontFamily: StyleGuide.fontFamily.regular,
              }}>
              {subtitle?.charAt(0).toUpperCase() + subtitle?.slice(1)}
            </Paragraph>
          </View>
          {/* {comments.length == 0 ? null : (
                        <View style={{
                            marginVertical: 5, marginHorizontal: 10,
                        }} >
                            <Text
                                onPress={() => {
                                    navigation.navigate("Comment", {
                                        postData: postData,
                                        comments: comments,
                                        setGetData: setGetData
                                    })
                                }}
                                style={{
                                    color: 'black',
                                    fontFamily: StyleGuide.fontFamily.regular,
                                    fontSize: widthPercentageToDP('3%'),
                                    borderBottomColor: 'grey',
                                    borderBottomWidth: 1, width: '40%'


                                }}>
                                View all {comments.length} comments
                            </Text>
                        </View>
                    )} */}

          <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
            <View style={{flexDirection: 'row'}}>
              <View>
                <Avatar
                  size="sm"
                  style={{marginVertical: 10, marginHorizontal: 5}}
                  source={{uri: userProfileImaege}}>
                  {' '}
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
