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
import moment from 'moment';
import {StackParamList} from '../../Utils/routes';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {reducerType} from '../../Utils/types';
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

  const isDarkMode = Boolean(mode);
  const cardBg = isDarkMode ? '#1E293B' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#0F172A';
  const subtextColor = isDarkMode ? '#94A3B8' : '#64748B';
  const borderColor = isDarkMode ? '#334155' : '#E2E8F0';
  const inputBg = isDarkMode ? '#0F172A' : '#F8FAFC';

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

    const previousLiked = isLiked;
    const previousCount = likesCount;
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

    setTimeout(() => setLikeAnimation(false), 900);

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
        {text: 'Cancel', style: 'cancel'},
        {text: 'Delete', style: 'destructive', onPress: deletePost},
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

  const PostedDate = item.dateCreated;
  const userProfileImage = userData?.image;
  const captionText = item.postDetail || '';
  const shouldShowMore = captionText.length > 100;
  const displayCaption = showFullCaption
    ? captionText
    : captionText.slice(0, 100);

  const hasImage = Boolean(item.postImage && item.postImage.trim() !== '');
  const authorInitial = item.userName ? item.userName.charAt(0).toUpperCase() : 'U';

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: cardBg,
          borderColor: borderColor,
        },
      ]}>
      {/* Post Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userInfoContainer}
          activeOpacity={0.7}
          onPress={navigateToProfile}>
          {item.userImage && item.userImage.startsWith('http') ? (
            <Avatar size="sm" source={{uri: item.userImage}} />
          ) : (
            <View
              style={[
                styles.avatarFallback,
                {backgroundColor: StyleGuide.color.primaryLight},
              ]}>
              <Text style={styles.avatarFallbackText}>{authorInitial}</Text>
            </View>
          )}

          <View style={styles.userDetails}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={[styles.userName, {color: textColor}]} numberOfLines={1}>
                {item.userName
                  ? item.userName.charAt(0).toUpperCase() + item.userName.slice(1)
                  : 'User'}
              </Text>
              <Text style={[styles.timestampInline, {color: subtextColor}]}>
                • {PostedDate ? moment(PostedDate).fromNow(true) : 'now'}
              </Text>
            </View>
            {Boolean(
              item?.location &&
                typeof item.location === 'string' &&
                item.location.trim() !== '',
            ) && (
              <View style={styles.locationRow}>
                <Feather name="map-pin" size={11} color={StyleGuide.color.primary} />
                <Text
                  style={[styles.locationText, {color: subtextColor}]}
                  numberOfLines={1}>
                  {item.location.trim()}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moreButton}
          activeOpacity={0.7}
          onPress={item?.userID === userID ? handleDeletePost : null}>
          {item?.userID === userID ? (
            <MaterialCommunityIcons name="delete-outline" color="#EF4444" size={22} />
          ) : (
            <Feather
              name="more-horizontal"
              color={subtextColor}
              size={20}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Post Media or Text Post Content */}
      {hasImage ? (
        <Pressable onPress={handleDoubleTap} activeOpacity={1}>
          <View style={styles.imageContainer}>
            <FastImage
              source={{uri: item.postImage}}
              style={styles.postImage}
              resizeMode={FastImage.resizeMode.cover}
            />
            {likeAnimation && (
              <View style={styles.likeAnimationOverlay}>
                <AntDesign name="heart" size={80} color="#FFFFFF" />
              </View>
            )}
          </View>
        </Pressable>
      ) : (
        /* Text Status Post */
        <View
          style={[
            styles.textPostCard,
            {backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC'},
          ]}>
          <Text style={[styles.textPostContent, {color: textColor}]}>
            {captionText}
          </Text>
        </View>
      )}

      {/* Action Buttons Row */}
      <View style={styles.actionsContainer}>
        <View style={styles.leftActions}>
          {/* Like Button */}
          <TouchableOpacity
            onPress={handleToggleLike}
            disabled={isLoading}
            style={styles.actionButton}
            activeOpacity={0.7}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <AntDesign
                name={isLiked ? 'heart' : 'hearto'}
                color={isLiked ? '#EF4444' : textColor}
                size={22}
              />
            )}
            {likesCount > 0 && (
              <Text
                style={[
                  styles.actionCountText,
                  {color: isLiked ? '#EF4444' : textColor},
                ]}>
                {likesCount}
              </Text>
            )}
          </TouchableOpacity>

          {/* Comment Button */}
          <TouchableOpacity
            onPress={navigateToComments}
            style={styles.actionButton}
            activeOpacity={0.7}>
            <Feather
              name="message-circle"
              color={textColor}
              size={22}
            />
            {commentsCount > 0 && (
              <Text style={[styles.actionCountText, {color: textColor}]}>
                {commentsCount}
              </Text>
            )}
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
            <Feather name="send" color={textColor} size={20} />
          </TouchableOpacity>
        </View>

        {/* Bookmark Button */}
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <Feather name="bookmark" color={subtextColor} size={21} />
        </TouchableOpacity>
      </View>

      {/* Caption Section (only for posts with an image) */}
      {hasImage && captionText.length > 0 && (
        <View style={styles.captionContainer}>
          <Text style={[styles.captionText, {color: textColor}]}>
            <Text style={styles.captionUsername}>
              {item.userName
                ? item.userName.charAt(0).toUpperCase() + item.userName.slice(1)
                : 'User'}{' '}
            </Text>
            {displayCaption}
            {shouldShowMore && !showFullCaption && '... '}
            {shouldShowMore && (
              <Text
                style={styles.moreText}
                onPress={() => setShowFullCaption(!showFullCaption)}>
                {showFullCaption ? ' less' : ' more'}
              </Text>
            )}
          </Text>
        </View>
      )}

      {/* View Comments Link */}
      {commentsCount > 0 && (
        <TouchableOpacity
          style={styles.viewCommentsContainer}
          activeOpacity={0.7}
          onPress={navigateToComments}>
          <Text style={[styles.viewCommentsText, {color: subtextColor}]}>
            View all {commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Quick Comment Input */}
      <View style={[styles.addCommentContainer, {borderTopColor: borderColor}]}>
        {userProfileImage && userProfileImage.startsWith('http') ? (
          <Avatar size="xs" source={{uri: userProfileImage}} />
        ) : (
          <View
            style={[
              styles.avatarFallbackMini,
              {backgroundColor: StyleGuide.color.primaryLight},
            ]}>
            <Text style={styles.avatarFallbackMiniText}>
              {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
        )}
        <TextInput
          style={[
            styles.commentInput,
            {
              backgroundColor: inputBg,
              color: textColor,
              borderColor: borderColor,
            },
          ]}
          placeholder="Add a comment..."
          placeholderTextColor={subtextColor}
          value={comment}
          onChangeText={setComment}
          editable={!isCommentLoading}
        />
        {comment.trim().length > 0 && (
          <TouchableOpacity
            onPress={postComment}
            disabled={isCommentLoading}
            style={styles.postCommentButton}
            activeOpacity={0.7}>
            {isCommentLoading ? (
              <ActivityIndicator size="small" color={StyleGuide.color.primary} />
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
  cardContainer: {
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
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
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 14,
  },
  timestampInline: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 12,
    marginLeft: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 11,
    marginLeft: 4,
    maxWidth: SCREEN_WIDTH * 0.6,
  },
  moreButton: {
    padding: 4,
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 15,
    color: StyleGuide.color.primaryDark,
  },
  avatarFallbackMini: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackMiniText: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 12,
    color: StyleGuide.color.primaryDark,
  },
  imageContainer: {
    width: '100%',
    height: SCREEN_WIDTH * 0.9,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  textPostCard: {
    paddingHorizontal: 18,
    paddingVertical: 20,
    minHeight: 100,
    justifyContent: 'center',
  },
  textPostContent: {
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 16,
    lineHeight: 24,
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
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
    paddingVertical: 4,
  },
  actionCountText: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 13,
    marginLeft: 6,
  },
  captionContainer: {
    paddingHorizontal: 14,
    paddingBottom: 6,
  },
  captionText: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 13.5,
    lineHeight: 19,
  },
  captionUsername: {
    fontFamily: StyleGuide.fontFamily.bold,
  },
  moreText: {
    color: StyleGuide.color.primary,
    fontFamily: StyleGuide.fontFamily.medium,
  },
  viewCommentsContainer: {
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  viewCommentsText: {
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 13,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  commentInput: {
    flex: 1,
    marginLeft: 10,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 0,
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 13,
  },
  postCommentButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  postCommentText: {
    color: StyleGuide.color.primary,
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 13,
  },
});

export default CardUI;