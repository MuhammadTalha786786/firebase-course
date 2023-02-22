import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {useDispatch, useSelector} from 'react-redux';
export const useNotification = () => {
  const authState = useSelector((state: AppState) => state);
  const [likedPeople, setLikedPeople] = useState();
  const uid = authState.userAuthReducer.uid;
  const [visible, setVisible] = useState(false);
  const mode = authState.darkModeReducer.mode;
  console.log(uid, 'uid');
  useEffect(() => {
    setVisible(true);
    firestore()
      .collection('posts')
      .where('userID', '==', uid)
      .get()
      .then(res => {
        console.log(res, 'response of posts');
        let peopleWhoLiked = [];

        res.forEach(documentSnapshot => {
          console.log(documentSnapshot.data(), 'data');
          if (documentSnapshot.data().userID === uid) {
          }
          let newLikes = documentSnapshot
            .data()
            .likes.filter(el => el.userID !== uid);
          peopleWhoLiked.push(newLikes);
          setVisible(false);
        });
        peopleWhoLiked.length === 0 ? setVisible(false) : setVisible(false);

        setLikedPeople(peopleWhoLiked);
      })
      .catch(error => {
        setVisible(false);
      });
  }, []);

  let flatArray = [].concat.apply([], likedPeople);

  console.log(likedPeople, 'liked people');
    return {
      flatArray,
      mode,
      visible,
    };
}

