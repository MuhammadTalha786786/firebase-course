import { View, Text, Alert } from 'react-native'
import  {useEffect, useState, useLayoutEffect} from 'react';
import { useSelector } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StyleGuide } from '../../Utils/StyleGuide';
import firestore from '@react-native-firebase/firestore';

export const useComment = () => {
const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [isFetchingComments, setIsFetchingComments] = useState(false);
  const authState: any = useSelector(state => state);
  const route:any = useRoute();
  const navigation = useNavigation();
  let id = authState.userAuthReducer.uid;
  let postId = route?.params?.postID;
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
      .then((querySnapshot: any) => {
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

  const userCommentDeleted = (commentID: string, postID) => {
    console.log(commentID, 'on ');

    firestore()
      .collection('posts')
      .doc(postID)
      .update({
        comments: comments.filter((c: any) => c.commentID !== commentID),
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




  return {
    DeleteComment,
    userCommentDeleted,
    getComments,
    comments, 
     comment,
     setComment,
     isFetchingComments  , 
     mode,
     id

  };


  
}

