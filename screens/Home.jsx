import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  FlatList,
  TouchableHighlight,
} from 'react-native';
import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {setSignOut} from '../Redux/Auth/AuthReducer';
import {useEffect} from 'react';
import auth from '@react-native-firebase/auth';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import database from '@react-native-firebase/database';

import TextInputComponent from './components/TextInputComponent';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StyleGuide} from '../Utils/StyleGuide';
import FeatherIcon from 'react-native-vector-icons/Feather';
import {Box, TextArea} from 'native-base';
import {widthPercentageToDP} from 'react-native-responsive-screen';
import {Avatar} from 'native-base';
import {Button, Card, Title, Paragraph} from 'react-native-paper';
import CardUI from './Post/CardUI';
import firestore from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native';
import {async} from '@firebase/util';

const Home = () => {
  const [post, setPost] = useState();
  const authState = useSelector((state: AppState) => state);
  const [image, setImage] = useState();
  const [data, setData] = useState();
  const [getData, setGetData] = useState(false);
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [loginState, setLoginState] = useState();
  const navigation = useNavigation();

  function getPostData() {
    setGetData(true);
    firestore()
      .collection('posts')
      .get()
      .then(snapshot => {
        setGetData(false);
        let postData = [];
        snapshot.forEach(post => {
          const data = post.data();
          postData.unshift(data);
        });
        setData(postData);
      });
  }

  useFocusEffect(
    React.useCallback(() => {
      getPostData();
    }, [isPostLiked, navigation]),
  );

  let uid = authState.userAuthReducer.uid;

  const getDataofUserPost = async () => {
    await firestore()
      .collection('posts')
      .where('userID', '==', uid)
      .get()
      .then(res => {
        console.log(res, 'post data!');
        res.forEach(documentSnapshot => {
          documentSnapshot.ref.update({isLogin: true});
        });
      });
  };

  useFocusEffect(
    React.useCallback(() => {
      getDataofUserPost();
    }, [isPostLiked, navigation]),
  );

  // useEffect(() => {
  //   firestore()
  //     .collection('users')
  //     .doc(uid)
  //     .update({
  //       isLogin: true,
  //     })
  //     .then(() => {
  //       console.log('User updated!');
  //     });
  // }, []);
  console.log(data, 'data console');
  let userProfileName = authState.userAuthReducer.userName;
  let userProfileImaege = authState.userAuthReducer.photoURL;
  let isLoggedIn = authState.userAuthReducer.isLoggedIn;

  return (
    <>
      <SafeAreaView style={styles.SafeAreaView}>
        <View
          style={{
            justifyContent: 'space-between',
            flexDirection: 'row',
            backgroundColor: '#ffff',
          }}>
          <View>
            <Avatar
              style={{
                marginVertical: 10,
                marginHorizontal: 10,
              }}
              size="md"
              source={require('./../images/logo.jpg')}></Avatar>
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
        </View>
        <FlatList
          data={data}
          renderItem={({item}) => (
            <CardUI
              userName={item.userName}
              userImage={{uri: item.userImage}}
              postImage={{uri: item.postImage}}
              title={item.postTitle}
              subtitle={item.postDetail}
              postID={item.postID}
              arrayLikes={item.likes}
              date={item.dateCreated}
              post={item}
              comments={item.comments}
              setIsPostLiked={setIsPostLiked}
              isPostLiked={isPostLiked}
              getPostData={getPostData}
              postData={getPostData}
              setGetData={getData}
              PostedUser={item.userID}
              loginState={item.isLogin}
            />
          )}
          onRefresh={getPostData}
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
    backgroundColor: '#F5F5DC',
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
  mainView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
});
export default Home;
