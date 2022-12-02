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
import {Card, Paragraph} from 'react-native-paper';
import {Avatar} from 'native-base';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector} from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';
import {widthPercentageToDP} from 'react-native-responsive-screen';
import moment from 'moment';
import uuid from 'react-native-uuid';
import Share from 'react-native-share';
import ImgToBase64 from 'react-native-image-base64';

const CardUI = ({
  item,
  mode,
  isPostLiked,
  setIsPostLiked,  
  postData,
  setGetData,

}) => {
  const authState = useSelector((state: AppState) => state);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [imageBase64URL, setImageBase64URL] = useState('');

  let userID = authState.userAuthReducer.uid;
 
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

    setIsPostLiked(!isPostLiked);
    if (arrayLikes?.length > 0) {
      let findCurrent = arrayLikes.find(item => item.userID === userID);
      console.log(findCurrent);
      if (findCurrent) {
        arrayLikes = arrayLikes.filter(el => userID !== el.userID);
      } else {
        arrayLikes?.push({
          userID: userID,
          postDetail: item.postDetail,
          userName: item.userName,
          userProfileImaege: userProfileImage,
          timeLiked: new Date(),
        });
      }
    } else {
      arrayLikes?.push({
        userID: userID,
        postDetail: item.postDetail,
        userName: item.userName,
        userProfileImaege: userProfileImage,
        timeLiked: new Date(),
      });
    }
    console.log('arrayLikes', arrayLikes);
    firestore()
      .collection('posts')
      .doc(item.postID)
      .update({
        likes: arrayLikes,
      })
      .then(() => {
        console.log('post updated!');
      });
  };

  console.log(item)

  let PostedDate = item.dateCreated.toDate();

  const postComment = () => {


    if(comment !== ''){
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
        })
    }
    else{
      Alert.alert("Please Enter the Comment...")
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
  let userProfileImage = authState.userAuthReducer.photoURL;
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
                  navigation.navigate('Profile', {id: item.userID});
                }}>
                <Avatar
                  style={{marginVertical: 10, marginHorizontal: 10}}
                  source={{uri: item.userImage}}>
                  <Avatar.Badge bg={item.isLogin ? 'green.500' : 'red.500'} />
                </Avatar>
              </TouchableHighlight>
              <Text
                style={{
                  color: mode ? '#ffff' : 'black',
                  marginVertical: 20,
                  marginHorizontal: 5,
                  fontFamily: StyleGuide.fontFamily.medium,
                }}>
                {item.userName?.charAt(0).toUpperCase() + item.userName?.slice(1)}
              </Text>
            </View>
            <View>
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

          <Card.Cover source={{uri: item.postImage}} />
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <View style={{flexDirection: 'row'}}>
              <AntDesign
                style={{marginHorizontal: 10, marginVertical: 15}}
                name={likeStatus(item.likes) ? 'heart' : 'hearto'}
                color={
                  likeStatus(item.likes) ? 'red' : mode ? '#ffff' : 'black'
                }
                size={20}
                onPress={() => {
                  addPostLiked(item.likes);
                }}
              />
              <View>
                {item.likes.length > 0 && (
                  <Text
                    style={{
                      marginVertical: 15,
                      marginHorizontal: 5,
                      color: mode ? '#ffff' : 'black',
                      fontSize: widthPercentageToDP('3.5%'),
                      fontFamily: StyleGuide.fontFamily.medium,
                    }}>{`${item.likes.length} likes`}</Text>
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
                    comments: item.comments,
                    setGetData: setGetData,
                    postID: item.postID,
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
                {item.comments.length} comments
              </Text>
              <View style={{marginHorizontal: 10, marginVertical: 15}}>
                <MaterialCommunityIcons
                  name="share-variant-outline"
                  size={25}
                  color={mode ? '#ffff' : 'black'}
                  onPress={() => convertImage(item.userName, item.postImage, item.postDetail)}
                />
              </View>
            </View>

            {item.userID === userID ? (
              <View>
                <MaterialCommunityIcons
                  style={{marginHorizontal: 10, marginVertical: 15}}
                  name={'delete'}
                  color={'red'}
                  size={22}
                  onPress={() => {
                    DeletePost(item.postID);
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
              {item.postDetail?.charAt(0).toUpperCase() + item?.postDetail?.slice(1)}
            </Paragraph>
          </View>
       
          <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
            <View style={{flexDirection: 'row'}}>
              <View>
                <Avatar
                  size="sm"
                  style={{marginVertical: 10, marginHorizontal: 5}}
                  source={{uri: userProfileImage}}>
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
