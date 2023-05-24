import React, {useState, useEffect} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import {useSelector} from 'react-redux';
import { reducerType } from '../../Utils/types';

export const useHome = () => {
  const [post, setPost] = useState();
  const authState = useSelector((state:reducerType) => state);
  const [image, setImage] = useState();
  const [data, setData] = useState<string []>();
  const [getData, setGetData] = useState(false);
  const [isPostLiked, setIsPostLiked] = useState(false);
  const [loginState, setLoginState] = useState();
  const navigation = useNavigation();

 const  getPostData =  () => {
    
  getDataofUserPost();
  setGetData(true);
    firestore()
      .collection('posts')
      .get()
      .then(async (snapshot:FirebaseFirestoreTypes.DocumentData) => {
        setGetData(false);
        let postData:string[] = [];
         await snapshot.forEach((post:FirebaseFirestoreTypes.DocumentData) => {
          const data   = post.data();
          postData.unshift(data);
        });
        setData(postData);
      });
  }


  useEffect(()=>{
  getPostData();


  },[])

  // useFocusEffect(
  //   React.useCallback(() => {
  //     getPostData();
  //           getDataofUserPost();

  //   }, [ navigation]),
  // );

  let uid = authState.userAuthReducer.uid;

  const getDataofUserPost = async () => {
    await firestore()
      .collection('posts')
      .where('userID', '==', uid)
      .get()
      .then(res => {
        res.forEach(documentSnapshot => {
          documentSnapshot.ref.update({isLogin: true});
        });
      });
  };

  // useFocusEffect(
  //   React.useCallback(() => {
  //     getDataofUserPost();
  //   }, [navigation]),
  // );

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
    getDataofUserPost,
  };
};
