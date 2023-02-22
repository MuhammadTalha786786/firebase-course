import React, {useState, useEffect} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import {useSelector} from 'react-redux';

export const useHome = () => {
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

  const mode = authState.darkModeReducer.mode;

  return {
    isPostLiked,
    setIsPostLiked,
    setGetData,
    getData,
    mode,
    getPostData,
    data,
  };
};
