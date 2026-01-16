import {View, Text, Alert} from 'react-native';
import {useEffect, useState, useLayoutEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {StyleGuide} from '../../Utils/StyleGuide';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {reducerType} from '../../Utils/types';
import {StackParamList} from '../../Utils/routes';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import ApiCall from '../../services/services';

interface commentsI {
  comment: string;
  commentCreated: FirebaseFirestoreTypes.Timestamp;
  commentID: string;
  postID: string;
  userID: string;
  userImage: string;
  userProfileName: string;
}
type commentType = commentsI[];
type Props = RouteProp<StackParamList, 'Comment'>;

export const useComment = () => {
  const dispatch = useDispatch();
  const [comments, setComments] = useState<commentType>([]);
  const [comment, setComment] = useState<string>('');
  const [isFetchingComments, setIsFetchingComments] = useState<boolean>(false);
  const authState = useSelector((state: reducerType) => state);

  console.log('false comments');

  const route = useRoute<Props>();
  const navigation = useNavigation();

  let id = authState.userAuthReducer.uid;
  let postId = route?.params?.postID;
  console.log('postId', postId);
  let mode = route.params?.mode;

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

  const getComments = async () => {
    const response = await ApiCall(
      'get',
      `api/posts/${postId}/comments`,
      '',
      dispatch,
      false,
    );
    if(response?.success){
      if(response?.data && response?.data.length > 0){
        setComments(response.data)
      }
    }

    console.log(JSON.stringify(response),"post response")

    // setUploading(false);
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

  const userCommentDeleted = (cid: string, postID) => {
    firestore()
      .collection('posts')
      .doc(postID)
      .update({
        comments: comments.filter(c => c.commentID !== cid),
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
    isFetchingComments,
    mode,
    id,
  };
};
