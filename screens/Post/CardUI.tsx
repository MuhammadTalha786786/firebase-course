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
  Animated,
} from 'react-native';
import React, {useState, useCallback, useRef} from 'react';
import {StyleGuide} from '../../Utils/StyleGuide';
import {Avatar} from 'native-base';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import moment from 'moment';
import {StackParamList} from '../../Utils/routes';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {reducerType} from '../../Utils/types';
import ApiCall from '../../services/services';
import FastImage from 'react-native-fast-image';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface CardUIProps {
  item: any;
  mode?: any;
  setGetData?: any;
  postData?: any;
  setIsPostLiked?: any;
  isPostLiked?: any;
  PostedUser?: any;
  getDataofUserPost?: any;
}

const CardUI: React.FC<CardUIProps> = ({
  item,
  mode,
  setGetData,
  postData,
}) => {
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
  const [isSaved, setIsSaved] = useState(false);
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);

  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const heartButtonScale = useRef(new Animated.Value(1)).current;

  const navigation =
    useNavigation<NativeStackNavigationProp<StackParamList>>();

  const isDarkMode = Boolean(mode);
  const cardBg = isDarkMode ? '#000000' : '#FFFFFF';
  const textColor = isDarkMode ? '#F5F5F5' : '#262626';
  const subtextColor = isDarkMode ? '#A8A8A8' : '#737373';
  const borderColor = isDarkMode ? '#262626' : '#EFEFEF';

  // Format posted time in Instagram uppercase style (e.g., "2 HOURS AGO")
  const getFormattedTime = (dateStr: string) => {
    if (!dateStr) return 'JUST NOW';
    const date = moment(dateStr);
    const now = moment();
    const diffHours = now.diff(date, 'hours');
    const diffDays = now.diff(date, 'days');

    if (diffHours < 1) {
      const diffMinutes = Math.max(1, now.diff(date, 'minutes'));
      return `${diffMinutes} ${diffMinutes === 1 ? 'MINUTE' : 'MINUTES'} AGO`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'HOUR' : 'HOURS'} AGO`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'DAY' : 'DAYS'} AGO`;
    } else {
      return date.format('MMMM D, YYYY').toUpperCase();
    }
  };

  // Helper to trigger parent refresh
  const triggerRefresh = () => {
    if (typeof setGetData === 'function') {
      setGetData((prev: any) => !prev);
    }
    if (typeof postData === 'function') {
      postData();
    }
  };

  // Check if current user has liked the post
  useFocusEffect(
    useCallback(() => {
      checkLikeStatus();
      if (item?.comments) {
        setCommentsCount(item.comments.length);
      }
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

  // Trigger floating heart pop animation
  const animateHeartPop = () => {
    setShowLikeAnimation(true);
    heartScale.setValue(0);
    heartOpacity.setValue(1);

    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.2,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(heartScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(heartOpacity, {
        toValue: 0,
        duration: 350,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowLikeAnimation(false);
    });
  };

  // Heart button bounce animation (Instagram like pop)
  const animateHeartButton = () => {
    heartButtonScale.setValue(0.7);
    Animated.spring(heartButtonScale, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  // Toggle like/unlike (Instagram instant optimistic update, zero spinners)
  const handleToggleLike = async () => {
    animateHeartButton();

    const previousLiked = isLiked;
    const previousCount = likesCount;
    const newLiked = !isLiked;

    // Instant optimistic update
    setIsLiked(newLiked);
    setLikesCount(newLiked ? likesCount + 1 : Math.max(0, likesCount - 1));

    if (newLiked) {
      animateHeartPop();
    }

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
        // Revert silently on failure
        setIsLiked(previousLiked);
        setLikesCount(previousCount);
      }
    } catch (error) {
      // Revert silently on error
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
      console.error('Toggle like error:', error);
    }
  };

  // Double tap to like on post image (Instagram behavior)
  const lastTapRef = useRef<number>(0);
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      animateHeartPop();
      if (!isLiked) {
        handleToggleLike();
      }
    }
    lastTapRef.current = now;
  };

  // Post a comment
  const postComment = async () => {
    if (!comment.trim()) {
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
        triggerRefresh();
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

  // Instagram More Options Menu (...)
  const handleMoreOptions = () => {
    const isAuthor = item?.userID === userID;

    if (isAuthor) {
      Alert.alert(
        'Post Options',
        'Choose an action for this post',
        [
          {
            text: 'Delete Post',
            style: 'destructive',
            onPress: confirmDeletePost,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
        {cancelable: true},
      );
    } else {
      Alert.alert(
        'Post Options',
        'Choose an action',
        [
          {
            text: 'Share Post',
            onPress: () => Alert.alert('Share', 'Link copied to clipboard!'),
          },
          {
            text: 'Report Inappropriate',
            style: 'destructive',
            onPress: () =>
              Alert.alert('Reported', 'Thank you. We have received your report.'),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
        {cancelable: true},
      );
    }
  };

  const confirmDeletePost = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to permanently delete this post?',
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
        triggerRefresh();
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
      postAuthor: {
        userName: item.userName,
        userImage: item.userImage,
        postDetail: item.postDetail,
        dateCreated: item.dateCreated,
      },
    });
  };

  const navigateToProfile = () => {
    navigation.navigate('UserProfile', {id: item.userID});
  };

  const PostedDate = item.dateCreated;
  const userProfileImage = userData?.image;
  const captionText = item.postDetail || '';
  const shouldShowMore = captionText.length > 90;
  const displayCaption = showFullCaption
    ? captionText
    : captionText.slice(0, 90);

  const hasImage = Boolean(item.postImage && item.postImage.trim() !== '');
  const authorName = item.userName
    ? item.userName.charAt(0).toUpperCase() + item.userName.slice(1)
    : 'User';
  const authorInitial = item.userName
    ? item.userName.charAt(0).toUpperCase()
    : 'U';

  const hasLocation = Boolean(
    item?.location &&
      typeof item.location === 'string' &&
      item.location.trim() !== '',
  );

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: cardBg,
          borderBottomColor: borderColor,
        },
      ]}>
      {/* 1. Instagram Post Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userInfoContainer}
          activeOpacity={0.8}
          onPress={navigateToProfile}>
          {item.userImage && item.userImage.startsWith('http') ? (
            <Avatar
              size="36px"
              source={{uri: item.userImage}}
              style={styles.avatarImage}
            />
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
            <Text style={[styles.userName, {color: textColor}]} numberOfLines={1}>
              {authorName}
            </Text>
            {hasLocation && (
              <Text
                style={[styles.locationText, {color: subtextColor}]}
                numberOfLines={1}>
                {item.location.trim()}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Instagram More Options Button (...) */}
        <TouchableOpacity
          style={styles.moreButton}
          activeOpacity={0.6}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          onPress={handleMoreOptions}>
          <Feather name="more-horizontal" color={textColor} size={20} />
        </TouchableOpacity>
      </View>

      {/* 2. Instagram Post Media (Edge-to-Edge) */}
      {hasImage ? (
        <Pressable onPress={handleDoubleTap} style={styles.imageWrapper}>
          <FastImage
            source={{uri: item.postImage}}
            style={styles.postImage}
            resizeMode={FastImage.resizeMode.cover}
          />
          {showLikeAnimation && (
            <Animated.View
              style={[
                styles.likeAnimationOverlay,
                {
                  opacity: heartOpacity,
                  transform: [{scale: heartScale}],
                },
              ]}
              pointerEvents="none">
              <AntDesign name="heart" size={96} color="#FFFFFF" />
            </Animated.View>
          )}
        </Pressable>
      ) : (
        /* Text Status Post */
        <View
          style={[
            styles.textPostCard,
            {backgroundColor: isDarkMode ? '#121212' : '#F8FAFC'},
          ]}>
          <Text style={[styles.textPostContent, {color: textColor}]}>
            {captionText}
          </Text>
        </View>
      )}

      {/* 3. Instagram Action Bar (Like, Comment, Share, Save) */}
      <View style={styles.actionBar}>
        <View style={styles.leftActionGroup}>
          {/* Like Heart */}
          <TouchableOpacity
            onPress={handleToggleLike}
            style={styles.actionIconButton}
            activeOpacity={0.7}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Animated.View style={{transform: [{scale: heartButtonScale}]}}>
              <AntDesign
                name={isLiked ? 'heart' : 'hearto'}
                color={isLiked ? '#ED4956' : textColor}
                size={24}
              />
            </Animated.View>
          </TouchableOpacity>

          {/* Comment Bubble */}
          <TouchableOpacity
            onPress={navigateToComments}
            style={styles.actionIconButton}
            activeOpacity={0.7}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Feather name="message-circle" color={textColor} size={24} />
          </TouchableOpacity>

          {/* Share Paper Plane */}
          <TouchableOpacity
            onPress={() =>
              Alert.alert('Share', 'Share options will open here.')
            }
            style={styles.actionIconButton}
            activeOpacity={0.7}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Feather name="send" color={textColor} size={22} />
          </TouchableOpacity>
        </View>

        {/* Bookmark Save Button */}
        <TouchableOpacity
          onPress={() => setIsSaved(!isSaved)}
          style={styles.actionIconButton}
          activeOpacity={0.7}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <Feather
            name="bookmark"
            color={isSaved ? StyleGuide.color.primary : textColor}
            size={24}
          />
        </TouchableOpacity>
      </View>

      {/* 4. Instagram Likes Count */}
      {likesCount > 0 ? (
        <View style={styles.likesContainer}>
          <Text style={[styles.likesText, {color: textColor}]}>
            {likesCount.toLocaleString()}{' '}
            {likesCount === 1 ? 'like' : 'likes'}
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          onPress={handleToggleLike}
          activeOpacity={0.7}
          style={styles.likesContainer}>
          <Text style={[styles.beFirstLikeText, {color: subtextColor}]}>
            Be the first to like this
          </Text>
        </TouchableOpacity>
      )}

      {/* 5. Instagram Caption (Username + Caption + more) */}
      {hasImage && captionText.trim().length > 0 && (
        <View style={styles.captionContainer}>
          <Text style={[styles.captionText, {color: textColor}]}>
            <Text style={[styles.captionUsername, {color: textColor}]}>
              {authorName}{' '}
            </Text>
            {displayCaption}
            {shouldShowMore && (
              <Text
                style={[styles.moreText, {color: subtextColor}]}
                onPress={() => setShowFullCaption(!showFullCaption)}>
                {showFullCaption ? ' less' : ' ... more'}
              </Text>
            )}
          </Text>
        </View>
      )}

      {/* 6. Instagram View All Comments */}
      {commentsCount > 0 && (
        <TouchableOpacity
          style={styles.viewCommentsContainer}
          activeOpacity={0.7}
          onPress={navigateToComments}>
          <Text style={[styles.viewCommentsText, {color: subtextColor}]}>
            View all {commentsCount}{' '}
            {commentsCount === 1 ? 'comment' : 'comments'}
          </Text>
        </TouchableOpacity>
      )}

      {/* 7. Instagram Clean Inline Quick Comment Input */}
      <View style={styles.inlineCommentContainer}>
        <View style={styles.inlineCommentInputRow}>
          {userProfileImage && userProfileImage.startsWith('http') ? (
            <Avatar
              size="24px"
              source={{uri: userProfileImage}}
              style={styles.miniAvatar}
            />
          ) : (
            <View
              style={[
                styles.miniAvatarFallback,
                {backgroundColor: StyleGuide.color.primaryLight},
              ]}>
              <Text style={styles.miniAvatarFallbackText}>
                {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          )}

          <TextInput
            style={[styles.inlineCommentInput, {color: textColor}]}
            placeholder="Add a comment..."
            placeholderTextColor={subtextColor}
            value={comment}
            onChangeText={setComment}
            editable={!isCommentLoading}
            returnKeyType="send"
            onSubmitEditing={postComment}
          />

          {comment.trim().length > 0 && (
            <TouchableOpacity
              onPress={postComment}
              disabled={isCommentLoading}
              style={styles.postInlineButton}
              activeOpacity={0.7}>
              {isCommentLoading ? (
                <ActivityIndicator
                  size="small"
                  color={StyleGuide.color.primary}
                />
              ) : (
                <Text style={styles.postInlineButtonText}>Post</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 8. Instagram Uppercase Relative Timestamp */}
      <View style={styles.timestampContainer}>
        <Text style={[styles.timestampText, {color: subtextColor}]}>
          {getFormattedTime(PostedDate)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: SCREEN_WIDTH,
    marginHorizontal: 0,
    marginBottom: 8,
    borderBottomWidth: 0.5,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  userDetails: {
    marginLeft: 10,
    justifyContent: 'center',
    flex: 1,
  },
  userName: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 13.5,
    letterSpacing: 0.1,
  },
  locationText: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 11.5,
    marginTop: 1,
  },
  moreButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH, // Pure 1:1 Instagram Square Feed standard
    backgroundColor: '#0F172A',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  likeAnimationOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  textPostCard: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 20,
    paddingVertical: 28,
    minHeight: 120,
    justifyContent: 'center',
  },
  textPostContent: {
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 16,
    lineHeight: 24,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },
  leftActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likesContainer: {
    paddingHorizontal: 14,
    paddingVertical: 2,
    marginBottom: 4,
  },
  likesText: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 13.5,
    letterSpacing: 0.1,
  },
  beFirstLikeText: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 13,
  },
  captionContainer: {
    paddingHorizontal: 14,
    paddingBottom: 4,
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
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 13.5,
  },
  viewCommentsContainer: {
    paddingHorizontal: 14,
    paddingVertical: 2,
    marginBottom: 4,
  },
  viewCommentsText: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 13.5,
  },
  inlineCommentContainer: {
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  inlineCommentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  miniAvatarFallback: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAvatarFallbackText: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 11,
    color: StyleGuide.color.primaryDark,
  },
  inlineCommentInput: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 4,
    paddingHorizontal: 0,
    fontSize: 13,
    fontFamily: StyleGuide.fontFamily.regular,
  },
  postInlineButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  postInlineButtonText: {
    color: StyleGuide.color.primary,
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 13,
  },
  timestampContainer: {
    paddingHorizontal: 14,
    paddingTop: 2,
    paddingBottom: 8,
  },
  timestampText: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 10,
    letterSpacing: 0.3,
  },
});

export default CardUI;