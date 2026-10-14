import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {Avatar} from 'native-base';
import moment from 'moment';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import ApiCall from '../../services/services';
import {useSafeAreaInsets, SafeAreaView} from 'react-native-safe-area-context';
import {StyleGuide} from '../../Utils/StyleGuide';

interface ReplyI {
  reply: string;
  replyID: string;
  parentReplyID: string | null;
  userID: string;
  userImage: string;
  userProfileName: string;
  replyCreated: string;
  replies?: ReplyI[];
}

interface CommentI {
  comment: string;
  commentCreated: string;
  commentID: string;
  userID: string;
  userImage: string;
  userProfileName: string;
  replies?: ReplyI[];
}

const QUICK_EMOJIS = ['❤️', '🙌', '🔥', '👏', '😢', '😍', '😮', '😂'];

const Comment = () => {
  const dispatch = useDispatch();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const {postID, mode, postAuthor} = route.params || {};
  const isDarkMode = Boolean(mode);

  const authState = useSelector((state: any) => state);
  const user = authState.userAuthReducer.userData?.user;
  const userID = user?._id;

  const [comments, setComments] = useState<CommentI[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [posting, setPosting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set(),
  );
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set(),
  );
  const [replyingTo, setReplyingTo] = useState<{
    commentID: string;
    userName: string;
    parentReplyID: string | null;
    replyType: 'comment' | 'reply';
  } | null>(null);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  const inputRef = useRef<TextInput>(null);

  // Theme color tokens - Instagram palette
  const bgColor = isDarkMode ? '#000000' : '#FFFFFF';
  const textColor = isDarkMode ? '#F5F5F5' : '#262626';
  const subtextColor = isDarkMode ? '#A8A8A8' : '#737373';
  const borderColor = isDarkMode ? '#262626' : '#EFEFEF';
  const inputBg = isDarkMode ? '#1E1E1E' : '#F2F2F2';

  useEffect(() => {
    fetchComments();
  }, [postID]);

  // Instagram compact timestamp (e.g., 2m, 4h, 3d, 1w)
  const getInstagramTime = (dateStr?: string) => {
    if (!dateStr) return 'now';
    const m = moment(dateStr);
    const now = moment();
    const diffSec = now.diff(m, 'seconds');
    if (diffSec < 60) return `${Math.max(1, diffSec)}s`;
    const diffMin = now.diff(m, 'minutes');
    if (diffMin < 60) return `${diffMin}m`;
    const diffHours = now.diff(m, 'hours');
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = now.diff(m, 'days');
    if (diffDays < 7) return `${diffDays}d`;
    const diffWeeks = now.diff(m, 'weeks');
    if (diffWeeks < 52) return `${diffWeeks}w`;
    return `${now.diff(m, 'years')}y`;
  };

  const fetchComments = async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    try {
      const res = await ApiCall(
        'get',
        `api/posts/${postID}/comments`,
        null,
        dispatch,
        false,
      );
      if (res?.success) {
        setComments(res.data || []);
      }
    } catch (err) {
      console.error('Fetch comments error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const postComment = async () => {
    if (!newComment.trim() || posting) return;
    setPosting(true);
    try {
      if (replyingTo) {
        const body = {
          reply: newComment.trim(),
          userID,
          userImage: user?.image,
          userProfileName: user?.name,
          commentID: replyingTo.commentID,
          parentReplyID: replyingTo.parentReplyID,
        };
        const res = await ApiCall(
          'post',
          `api/posts/${postID}/replies`,
          body,
          dispatch,
          false,
        );
        if (res?.success) {
          await fetchComments();
          setExpandedComments(prev => new Set(prev).add(replyingTo.commentID));
          if (replyingTo.parentReplyID) {
            setExpandedReplies(prev =>
              new Set(prev).add(replyingTo.parentReplyID!),
            );
          }
          setNewComment('');
          setReplyingTo(null);
        } else {
          Alert.alert('Error', res?.message || 'Failed to post reply');
        }
      } else {
        const body = {
          comment: newComment.trim(),
          userID,
          userImage: user?.image,
          userProfileName: user?.name,
        };
        const res = await ApiCall(
          'post',
          `api/posts/${postID}/comments`,
          body,
          dispatch,
          false,
        );
        if (res?.success && res.data) {
          setComments(prev => [...prev, res.data]);
          setNewComment('');
        } else {
          Alert.alert('Error', res?.message || 'Failed to post comment');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to post comment. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const toggleExpanded = (commentID: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      newSet.has(commentID) ? newSet.delete(commentID) : newSet.add(commentID);
      return newSet;
    });
  };

  const toggleReplyExpanded = (replyID: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      newSet.has(replyID) ? newSet.delete(replyID) : newSet.add(replyID);
      return newSet;
    });
  };

  const handleReply = (
    commentID: string,
    userName: string,
    parentReplyID: string | null = null,
    replyType: 'comment' | 'reply' = 'comment',
  ) => {
    setReplyingTo({commentID, userName, parentReplyID, replyType});
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const toggleLike = (id: string) => {
    setLikedComments(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const handleLongPressComment = (commentID: string, isOwner: boolean) => {
    if (!isOwner) return;
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteComment(commentID),
        },
      ],
      {cancelable: true},
    );
  };

  const handleLongPressReply = (
    commentID: string,
    replyID: string,
    isOwner: boolean,
  ) => {
    if (!isOwner) return;
    Alert.alert(
      'Delete Reply',
      'Are you sure you want to delete this reply?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteReply(commentID, replyID),
        },
      ],
      {cancelable: true},
    );
  };

  const deleteComment = async (commentID: string) => {
    try {
      const res = await ApiCall(
        'delete',
        `api/posts/${postID}/comments/${commentID}`,
        null,
        dispatch,
        false,
      );
      if (res?.success) {
        setComments(prev => prev.filter(c => c.commentID !== commentID));
      } else {
        Alert.alert('Error', res?.message || 'Failed to delete comment');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete comment');
    }
  };

  const deleteReply = async (commentID: string, replyID: string) => {
    try {
      const res = await ApiCall(
        'delete',
        `api/posts/${postID}/replies/${replyID}`,
        {commentID},
        dispatch,
        false,
      );
      if (res?.success) {
        await fetchComments();
      } else {
        Alert.alert('Error', res?.message || 'Failed to delete reply');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to delete reply');
    }
  };

  const countNestedReplies = (replies?: ReplyI[]): number => {
    if (!replies || replies.length === 0) return 0;
    let count = replies.length;
    replies.forEach(reply => {
      count += countNestedReplies(reply.replies);
    });
    return count;
  };

  // Reusable avatar with initials fallback
  const renderAvatar = (uri?: string, name?: string, size = 36) => {
    if (uri && uri.startsWith('http')) {
      return (
        <Avatar
          size={`${size}px`}
          source={{uri}}
          style={{width: size, height: size, borderRadius: size / 2}}
        />
      );
    }
    const initial = name ? name.charAt(0).toUpperCase() : 'U';
    return (
      <View
        style={[
          styles.avatarFallback,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: StyleGuide.color.primaryLight,
          },
        ]}>
        <Text
          style={[
            styles.avatarFallbackText,
            {fontSize: size * 0.42, color: StyleGuide.color.primaryDark},
          ]}>
          {initial}
        </Text>
      </View>
    );
  };

  // Render nested reply
  const renderNestedReply = (
    reply: ReplyI,
    commentID: string,
    depth: number = 0,
  ): React.ReactNode => {
    const mine = reply.userID === userID;
    const liked = likedComments.has(reply.replyID);
    const hasReplies = reply.replies && reply.replies.length > 0;
    const isExpanded = expandedReplies.has(reply.replyID);
    const nestedCount = countNestedReplies(reply.replies);

    return (
      <View key={reply.replyID} style={styles.nestedReplyWrap}>
        <TouchableOpacity
          activeOpacity={0.8}
          onLongPress={() =>
            handleLongPressReply(commentID, reply.replyID, mine)
          }
          style={styles.replyRow}>
          {renderAvatar(reply.userImage, reply.userProfileName, 28)}

          <View style={styles.replyBody}>
            <Text style={styles.commentTextWrap}>
              <Text style={[styles.usernameText, {color: textColor}]}>
                {reply.userProfileName}{' '}
              </Text>
              <Text style={[styles.commentBodyText, {color: textColor}]}>
                {reply.reply}
              </Text>
            </Text>

            <View style={styles.metaRow}>
              <Text style={[styles.metaTime, {color: subtextColor}]}>
                {getInstagramTime(reply.replyCreated)}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  handleReply(
                    commentID,
                    reply.userProfileName,
                    reply.replyID,
                    'reply',
                  )
                }
                style={styles.replyActionBtn}>
                <Text style={[styles.replyActionText, {color: subtextColor}]}>
                  Reply
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => toggleLike(reply.replyID)}
            style={styles.likeBtn}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <AntDesign
              name={liked ? 'heart' : 'hearto'}
              size={13}
              color={liked ? '#ED4956' : subtextColor}
            />
          </TouchableOpacity>
        </TouchableOpacity>

        {hasReplies && (
          <TouchableOpacity
            style={styles.viewNestedRepliesBtn}
            onPress={() => toggleReplyExpanded(reply.replyID)}
            activeOpacity={0.7}>
            <View style={[styles.replyDash, {backgroundColor: subtextColor}]} />
            <Text style={[styles.viewRepliesText, {color: subtextColor}]}>
              {isExpanded
                ? `Hide replies`
                : `View ${nestedCount} ${nestedCount === 1 ? 'reply' : 'replies'}`}
            </Text>
          </TouchableOpacity>
        )}

        {isExpanded && hasReplies && (
          <View style={styles.subRepliesList}>
            {reply.replies!.map(nestedReply =>
              renderNestedReply(nestedReply, commentID, depth + 1),
            )}
          </View>
        )}
      </View>
    );
  };

  // Render top-level comment item
  const renderItem = ({item}: {item: CommentI}) => {
    const mine = item.userID === userID;
    const liked = likedComments.has(item.commentID);
    const hasReplies = item.replies && item.replies.length > 0;
    const isExpanded = expandedComments.has(item.commentID);
    const totalReplies = countNestedReplies(item.replies);

    return (
      <View style={styles.commentContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onLongPress={() => handleLongPressComment(item.commentID, mine)}
          style={styles.commentRow}>
          {renderAvatar(item.userImage, item.userProfileName, 36)}

          <View style={styles.commentBody}>
            <Text style={styles.commentTextWrap}>
              <Text style={[styles.usernameText, {color: textColor}]}>
                {item.userProfileName}{' '}
              </Text>
              <Text style={[styles.commentBodyText, {color: textColor}]}>
                {item.comment}
              </Text>
            </Text>

            <View style={styles.metaRow}>
              <Text style={[styles.metaTime, {color: subtextColor}]}>
                {getInstagramTime(item.commentCreated)}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  handleReply(item.commentID, item.userProfileName)
                }
                style={styles.replyActionBtn}>
                <Text style={[styles.replyActionText, {color: subtextColor}]}>
                  Reply
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => toggleLike(item.commentID)}
            style={styles.likeBtn}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <AntDesign
              name={liked ? 'heart' : 'hearto'}
              size={14}
              color={liked ? '#ED4956' : subtextColor}
            />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Instagram "View replies" with horizontal dash line */}
        {hasReplies && (
          <TouchableOpacity
            style={styles.viewRepliesBtn}
            onPress={() => toggleExpanded(item.commentID)}
            activeOpacity={0.7}>
            <View style={[styles.replyDash, {backgroundColor: subtextColor}]} />
            <Text style={[styles.viewRepliesText, {color: subtextColor}]}>
              {isExpanded
                ? `Hide replies`
                : `View ${totalReplies} ${
                    totalReplies === 1 ? 'reply' : 'replies'
                  }`}
            </Text>
          </TouchableOpacity>
        )}

        {/* Expanded nested replies list */}
        {isExpanded && hasReplies && (
          <View style={styles.repliesContainer}>
            {item.replies!.map(reply =>
              renderNestedReply(reply, item.commentID, 1),
            )}
          </View>
        )}
      </View>
    );
  };

  // Header showing post author caption (Instagram format)
  const renderListHeader = () => {
    if (!postAuthor || !postAuthor.postDetail?.trim()) return null;
    return (
      <View style={[styles.postAuthorSection, {borderBottomColor: borderColor}]}>
        <View style={styles.commentRow}>
          {renderAvatar(postAuthor.userImage, postAuthor.userName, 36)}
          <View style={styles.commentBody}>
            <Text style={styles.commentTextWrap}>
              <Text style={[styles.usernameText, {color: textColor}]}>
                {postAuthor.userName}{' '}
              </Text>
              <Text style={[styles.commentBodyText, {color: textColor}]}>
                {postAuthor.postDetail}
              </Text>
            </Text>
            <View style={styles.metaRow}>
              <Text style={[styles.metaTime, {color: subtextColor}]}>
                {getInstagramTime(postAuthor.dateCreated)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, {backgroundColor: bgColor}]}
      edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={bgColor}
      />

      {/* 1. Instagram Top Bar (Back Arrow, "Comments", Share) */}
      <View style={[styles.topBar, {borderBottomColor: borderColor}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>

        <Text style={[styles.topBarTitle, {color: textColor}]}>Comments</Text>

        <TouchableOpacity
          onPress={() => Alert.alert('Share', 'Share options')}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          style={styles.topRightButton}>
          <Feather name="send" size={20} color={textColor} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        {/* 2. Full-Screen Comments List */}
        <FlatList
          data={comments}
          renderItem={renderItem}
          keyExtractor={i => i.commentID}
          ListHeaderComponent={renderListHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchComments(true)}
              colors={[StyleGuide.color.primary]}
              tintColor={StyleGuide.color.primary}
            />
          }
          contentContainerStyle={[
            styles.listContent,
            comments.length === 0 && styles.listContentEmpty,
          ]}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="small"
                  color={StyleGuide.color.primary}
                />
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Feather
                    name="message-circle"
                    size={40}
                    color={textColor}
                  />
                </View>
                <Text style={[styles.emptyTitle, {color: textColor}]}>
                  No comments yet
                </Text>
                <Text style={[styles.emptySubtitle, {color: subtextColor}]}>
                  Start the conversation.
                </Text>
              </View>
            )
          }
        />

        {/* 3. Replying Indicator */}
        {replyingTo && (
          <View
            style={[
              styles.replyingBanner,
              {
                backgroundColor: isDarkMode ? '#1E1E1E' : '#F8FAFC',
                borderTopColor: borderColor,
              },
            ]}>
            <Text style={[styles.replyingBannerText, {color: subtextColor}]}>
              Replying to{' '}
              <Text style={{fontWeight: '700', color: textColor}}>
                @{replyingTo.userName}
              </Text>
            </Text>
            <TouchableOpacity onPress={cancelReply} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Feather name="x" size={18} color={subtextColor} />
            </TouchableOpacity>
          </View>
        )}

        {/* 4. Instagram Quick Emoji Reaction Row */}
        <View style={[styles.quickEmojiBar, {borderTopColor: borderColor}]}>
          {QUICK_EMOJIS.map(emoji => (
            <TouchableOpacity
              key={emoji}
              activeOpacity={0.7}
              onPress={() => setNewComment(prev => prev + emoji)}
              style={styles.emojiButton}>
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 5. Instagram Bottom Comment Input Capsule */}
        <View
          style={[
            styles.inputFooter,
            {
              borderTopColor: borderColor,
              backgroundColor: bgColor,
              paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 10) : 10,
            },
          ]}>
          {renderAvatar(user?.image, user?.name, 34)}

          <View
            style={[
              styles.inputCapsule,
              {
                backgroundColor: inputBg,
              },
            ]}>
            <TextInput
              ref={inputRef}
              value={newComment}
              onChangeText={setNewComment}
              placeholder={
                replyingTo
                  ? `Reply to @${replyingTo.userName}...`
                  : 'Add a comment...'
              }
              placeholderTextColor={subtextColor}
              multiline
              maxLength={500}
              style={[styles.textInputField, {color: textColor}]}
            />

            {newComment.trim().length > 0 && (
              <TouchableOpacity
                onPress={postComment}
                disabled={posting}
                activeOpacity={0.7}
                style={styles.postActionButton}>
                {posting ? (
                  <ActivityIndicator size="small" color="#0095F6" />
                ) : (
                  <Text style={styles.postActionButtonText}>Post</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  topBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  backButton: {
    padding: 4,
  },
  topBarTitle: {
    fontSize: 16,
    fontFamily: StyleGuide.fontFamily.bold,
    letterSpacing: 0.1,
  },
  topRightButton: {
    padding: 4,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  postAuthorSection: {
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 0.5,
  },
  commentContainer: {
    marginBottom: 8,
  },
  commentRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'flex-start',
  },
  commentBody: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  commentTextWrap: {
    fontSize: 13.5,
    lineHeight: 18,
  },
  usernameText: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 13.5,
  },
  commentBodyText: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 13.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaTime: {
    fontSize: 12,
    fontFamily: StyleGuide.fontFamily.regular,
  },
  replyActionBtn: {
    marginLeft: 16,
  },
  replyActionText: {
    fontSize: 12,
    fontFamily: StyleGuide.fontFamily.bold,
  },
  likeBtn: {
    paddingTop: 4,
    paddingLeft: 6,
  },
  viewRepliesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 64,
    marginTop: 4,
    marginBottom: 6,
  },
  replyDash: {
    width: 24,
    height: 1,
    marginRight: 10,
    opacity: 0.6,
  },
  viewRepliesText: {
    fontSize: 12,
    fontFamily: StyleGuide.fontFamily.bold,
  },
  repliesContainer: {
    paddingLeft: 44,
  },
  nestedReplyWrap: {
    marginBottom: 4,
  },
  replyRow: {
    flexDirection: 'row',
    paddingRight: 16,
    paddingVertical: 4,
    alignItems: 'flex-start',
  },
  replyBody: {
    flex: 1,
    marginLeft: 10,
    marginRight: 6,
  },
  viewNestedRepliesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 38,
    marginTop: 2,
    marginBottom: 4,
  },
  subRepliesList: {
    paddingLeft: 20,
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontFamily: StyleGuide.fontFamily.bold,
  },
  loadingContainer: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#737373',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: StyleGuide.fontFamily.bold,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13.5,
    fontFamily: StyleGuide.fontFamily.regular,
  },
  replyingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 0.5,
  },
  replyingBannerText: {
    fontSize: 12.5,
    fontFamily: StyleGuide.fontFamily.regular,
  },
  quickEmojiBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopWidth: 0.5,
  },
  emojiButton: {
    padding: 6,
  },
  emojiText: {
    fontSize: 22,
  },
  inputFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 8,
    borderTopWidth: 0.5,
  },
  inputCapsule: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 7 : 3,
  },
  textInputField: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: StyleGuide.fontFamily.regular,
    paddingVertical: 4,
    maxHeight: 80,
  },
  postActionButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginLeft: 6,
  },
  postActionButtonText: {
    color: '#0095F6',
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 13.5,
  },
});

export default Comment;
