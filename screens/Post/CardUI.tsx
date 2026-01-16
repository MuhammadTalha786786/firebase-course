import {
  Alert,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import React, {useState, useCallback} from 'react';
import {StyleGuide} from '../../Utils/StyleGuide';
import {Avatar} from 'native-base';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {widthPercentageToDP} from 'react-native-responsive-screen';
import moment from 'moment';
import ProgressiveImage from '../components/ProgressiveImage';
import {StackParamList} from '../../Utils/routes';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {reducerType} from '../../Utils/types';
import Svg from '../components/Svg';
import {commentIcon, sendIcon} from '../../Utils/SvgAssests';
import ApiCall from '../../services/services';
import FastImage from 'react-native-fast-image';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const CardUI = ({item, mode, setGetData}) => {
  const dispatch = useDispatch();
  const authState = useSelector((state: reducerType) => state);
  const userData = authState.userAuthReducer.userData?.user;
  const userID = userData?._id;

  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(
    item?.comments?.length || 0,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [likeAnimation, setLikeAnimation] = useState(false);

  const navigation =
    useNavigation<NativeStackNavigationProp<StackParamList>>();

  // Check if current user has liked the post
  useFocusEffect(
    useCallback(() => {
      checkLikeStatus();
    }, [item]),
  );

  const checkLikeStatus = () => {
    if (item?.likes && Array.isArray(item.likes)) {
      const userLiked = item.likes.includes(userID);
      setIsLiked(userLiked);
      setLikesCount(item.likes.length);
    } else {
      setIsLiked(false);
      setLikesCount(0);
    }
  };

  // Toggle like/unlike with animation
  const handleToggleLike = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setLikeAnimation(true);

    // Optimistic UI update
    const previousLiked = isLiked;
    const previousCount = likesCount;
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

    setTimeout(() => setLikeAnimation(false), 1000);

    try {
      const body = {userID};
      const response = await ApiCall(
        'post',
        `api/posts/${item?.postID}/like`,
        body,
        dispatch,
        false,
      );

      if (response?.success) {
        setIsLiked(response?.data?.liked);
        setLikesCount(response?.data?.likesCount);
      } else {
        setIsLiked(previousLiked);
        setLikesCount(previousCount);
        Alert.alert('Error', response?.message || 'Failed to update like');
      }
    } catch (error) {
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      Alert.alert('Error', 'Failed to update like. Please try again.');
      console.error('Toggle like error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Double tap to like
  const handleDoubleTap = () => {
    if (!isLiked) {
      handleToggleLike();
    }
  };

  // Post a comment
  const postComment = async () => {
    if (!comment.trim()) {
      Alert.alert('Validation', 'Please enter a comment');
      return;
    }

    if (isCommentLoading) return;

    setIsCommentLoading(true);

    try {
      const body = {
        comment: comment.trim(),
        userID,
        userImage: userData?.image,
        userProfileName: userData?.name,
      };

      const response = await ApiCall(
        'post',
        `api/posts/${item?.postID}/comments`,
        body,
        dispatch,
        false,
      );

      if (response?.success) {
        setComment('');
        setCommentsCount(prev => prev + 1);

        if (setGetData) {
          setGetData(prev => !prev);
        }
      } else {
        Alert.alert('Error', response?.message || 'Failed to post comment');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to post comment. Please try again.');
      console.error('Post comment error:', error);
    } finally {
      setIsCommentLoading(false);
    }
  };

  // Delete post
  const handleDeletePost = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: deletePost,
        },
      ],
      {cancelable: true},
    );
  };

  const deletePost = async () => {
    try {
      const response = await ApiCall(
        'delete',
        `api/posts/${item?.postID}`,
        null,
        dispatch,
        false,
      );

      if (response?.success) {
        Alert.alert('Success', 'Post deleted successfully');
        if (setGetData) {
          setGetData(prev => !prev);
        }
      } else {
        Alert.alert('Error', response?.message || 'Failed to delete post');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete post. Please try again.');
      console.error('Delete post error:', error);
    }
  };

  const navigateToComments = () => {
    navigation.navigate('Comment', {
      postID: item.postID,
      mode,
      setGetData,
    });
  };

  const navigateToProfile = () => {
    navigation.navigate('UserProfile', {id: item.userID});
  };

  const progressiveImageURL = require('../../images/default-img.jpeg');
  const PostedDate = item.dateCreated;
  const userProfileImage = userData?.image;

  const captionText = item.postDetail || '';
  const shouldShowMore = captionText.length > 100;
  const displayCaption = showFullCaption
    ? captionText
    : captionText.slice(0, 100);

  return (
    <View style={[styles.container, {backgroundColor: mode ? '#000' : '#fff'}]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userInfoContainer}
          activeOpacity={0.7}
          onPress={navigateToProfile}>
          <Avatar size="sm" source={{uri: item.userImage}} />
          <View style={styles.userDetails}>
            <Text
              style={[styles.userName, {color: mode ? '#fff' : '#000'}]}
              numberOfLines={1}>
              {item.userName?.charAt(0).toUpperCase() +
                item.userName?.slice(1)}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moreButton}
          onPress={item?.userID === userID ? handleDeletePost : null}>
          {item?.userID === userID ? (
            <MaterialCommunityIcons name="delete" color="red" size={24} />
          ) : (
            <Feather
              name="more-vertical"
              color={mode ? '#fff' : '#000'}
              size={24}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Post Image */}
      <Pressable onPress={handleDoubleTap} activeOpacity={1}>
        <View style={styles.imageContainer}>
          {item.postImage ? (
            <FastImage
              source={{uri: item.postImage}}
              style={styles.postImage}
              resizeMode={FastImage.resizeMode.cover}
            />
          ) : (
            <ProgressiveImage
              source={progressiveImageURL}
              style={styles.postImage}
            />
          )}
          {likeAnimation && (
            <View style={styles.likeAnimationOverlay}>
              <AntDesign name="heart" size={80} color="white" />
            </View>
          )}
        </View>
      </Pressable>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <View style={styles.leftActions}>
          <Pressable
            onPress={handleToggleLike}
            disabled={isLoading}
            style={styles.actionButton}>
            {isLoading ? (
              <ActivityIndicator size="small" color="red" />
            ) : (
              <AntDesign
                name={isLiked ? 'heart' : 'hearto'}
                color={isLiked ? '#ff3b30' : mode ? '#fff' : '#000'}
                size={26}
              />
            )}
          </Pressable>

          <Pressable
            onPress={navigateToComments}
            style={styles.actionButtonWithCount}>
            <Feather
              name="message-circle"
              color={mode ? '#fff' : '#000'}
              size={24}
            />
            {commentsCount > 0 && (
              <Text style={[styles.actionCountText, {color: mode ? '#fff' : '#000'}]}>
                {commentsCount}
              </Text>
            )}
          </Pressable>

          <Pressable style={styles.actionButton}>
            <Feather name="send" color={mode ? '#fff' : '#000'} size={24} />
          </Pressable>
        </View>

        <Pressable style={styles.actionButton}>
          <Feather name="bookmark" color={mode ? '#fff' : '#000'} size={24} />
        </Pressable>
      </View>

      {/* Likes Count */}
      {likesCount > 0 && (
        <View style={styles.likesContainer}>
          <Text style={[styles.likesText, {color: mode ? '#fff' : '#000'}]}>
            {likesCount.toLocaleString()}{' '}
            {likesCount === 1 ? 'like' : 'likes'}
          </Text>
        </View>
      )}

      {/* Caption */}
      {captionText.length > 0 && (
        <View style={styles.captionContainer}>
          <Text style={[styles.captionText, {color: mode ? '#fff' : '#000'}]}>
            <Text style={styles.captionUsername}>
              {item.userName?.charAt(0).toUpperCase() +
                item.userName?.slice(1)}{' '}
            </Text>
            {displayCaption}
            {shouldShowMore && !showFullCaption && '... '}
            {shouldShowMore && (
              <Text
                style={styles.moreText}
                onPress={() => setShowFullCaption(!showFullCaption)}>
                {showFullCaption ? 'less' : 'more'}
              </Text>
            )}
          </Text>
        </View>
      )}

      {/* View All Comments */}
      {commentsCount > 0 && (
        <TouchableOpacity
          style={styles.viewCommentsContainer}
          onPress={navigateToComments}>
          <Text style={[styles.viewCommentsText, {color: mode ? '#999' : '#666'}]}>
            View all {commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Timestamp */}
      <View style={styles.timestampContainer}>
        <Text style={[styles.timestampText, {color: mode ? '#999' : '#666'}]}>
          {moment(PostedDate).fromNow()}
        </Text>
      </View>

      {/* Add Comment Input */}
      <View
        style={[
          styles.addCommentContainer,
          {borderTopColor: mode ? '#333' : '#efefef'},
        ]}>
        <Avatar size="xs" source={{uri: userProfileImage}} />
        <TextInput
          style={[styles.commentInput, {color: mode ? '#fff' : '#000'}]}
          placeholder="Add a comment..."
          placeholderTextColor={mode ? '#999' : '#666'}
          value={comment}
          onChangeText={setComment}
          multiline
          editable={!isCommentLoading}
        />
        {comment.trim().length > 0 && (
          <TouchableOpacity
            onPress={postComment}
            disabled={isCommentLoading}
            style={styles.postCommentButton}>
            {isCommentLoading ? (
              <ActivityIndicator size="small" color="#0095f6" />
            ) : (
              <Text style={styles.postCommentText}>Post</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: 10,
    flex: 1,
  },
  userName: {
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 14,
    fontWeight: '600',
  },
  moreButton: {
    padding: 5,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  likeAnimationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingRight: 16,
    paddingVertical: 4,
  },
  actionButtonWithCount: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
    paddingVertical: 4,
  },
  actionCountText: {
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  likesContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  likesText: {
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 14,
    fontWeight: '600',
  },
  captionContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  captionText: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 14,
    lineHeight: 18,
  },
  captionUsername: {
    fontFamily: StyleGuide.fontFamily.medium,
    fontWeight: '600',
  },
  moreText: {
    color: '#999',
    fontFamily: StyleGuide.fontFamily.regular,
  },
  viewCommentsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  viewCommentsText: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 14,
  },
  timestampContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  timestampText: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 0.5,
    marginTop: 4,
  },
  commentInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 14,
    maxHeight: 80,
  },
  postCommentButton: {
    paddingHorizontal: 8,
  },
  postCommentText: {
    color: '#0095f6',
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CardUI;