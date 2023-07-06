import { View, Text, Alert } from 'react-native'
import  {useEffect, useState, useLayoutEffect} from 'react';
import { useSelector } from 'react-redux';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StyleGuide } from '../../Utils/StyleGuide';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { reducerType } from '../../Utils/types';
import { StackParamList } from '../../Utils/routes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

interface commentsI {
  comment:string
  commentCreated:FirebaseFirestoreTypes.Timestamp
  commentID:string
  postID:string
  userID:string
  userImage:string
  userProfileName:string
}
type commentType   = commentsI []
type Props = RouteProp<StackParamList, 'Comment'>;



export const useComment = () => {
  const [comments, setComments] = useState<commentType>([]);
  const [comment, setComment] = useState<string>('');
  const [isFetchingComments, setIsFetchingComments] = useState<boolean>(false);
  const authState = useSelector((state:reducerType) => state);
  const route = useRoute<Props>();
  const navigation = useNavigation();
  let id = authState.userAuthReducer.uid;
  let postId = route?.params?.postID;
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
      .then((querySnapshot: FirebaseFirestoreTypes.DocumentData) => {

        setIsFetchingComments(true)
        setComments(querySnapshot.data().comments);
      });
  };
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

  const userCommentDeleted = (cid:string, postID) => {

    firestore()
      .collection('posts')
      .doc(postID)
      .update({
        comments: comments.filter((c) => c.commentID !== cid),
      })
      .then(() => {
        Alert.alert('your comment has been Deleted...');
        getComments();
      })
      .catch(error => {
        console.log(error.message);
      });
  };





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

