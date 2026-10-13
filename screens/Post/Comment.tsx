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
  Modal,
  Dimensions,
  Animated,
  PanResponder,
  StatusBar,
  Pressable,
  TextInput,
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {Avatar} from 'native-base';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ApiCall from '../../services/services';
import {KeyboardAvoidingView} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {StyleGuide} from '../../Utils/StyleGuide';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.9;
const HEADER_HEIGHT = 56;

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

const Comment = () => {
  const dispatch = useDispatch();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const {postID, mode} = route.params;
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
  const [deleteModal, setDeleteModal] = useState<{
    visible: boolean;
    type: 'comment' | 'reply';
    commentID: string;
    replyID?: string;
  }>({visible: false, type: 'comment', commentID: ''});

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<any>(null);

  // Theme color tokens
  const sheetBg = isDarkMode ? '#0F172A' : '#FFFFFF';
  const cardBg = isDarkMode ? '#1E293B' : '#F8FAFC';
  const textColor = isDarkMode ? '#FFFFFF' : '#0F172A';
  const subtextColor = isDarkMode ? '#94A3B8' : '#64748B';
  const borderColor = isDarkMode ? '#334155' : '#E2E8F0';
  const inputBg = isDarkMode ? '#1E293B' : '#F1F5F9';

  useEffect(() => {
    fetchComments();
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 6,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 140 || g.vy > 0.6) closeSheet();
        else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start(() => navigation.goBack());
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
      if (res?.success) setComments(res.data || []);
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
        if (res?.success) {
          setComments(prev => [...prev, res.data]);
          setNewComment('');
        }
      }
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
    setNewComment('');
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
    setDeleteModal({visible: true, type: 'comment', commentID});
  };

  const handleLongPressReply = (
    commentID: string,
    replyID: string,
    isOwner: boolean,
  ) => {
    if (!isOwner) return;
    setDeleteModal({visible: true, type: 'reply', commentID, replyID});
  };

  const confirmDelete = async () => {
    if (deleteModal.type === 'comment') {
      await deleteComment(deleteModal.commentID);
    } else if (deleteModal.type === 'reply' && deleteModal.replyID) {
      await deleteReply(deleteModal.commentID, deleteModal.replyID);
    }
    setDeleteModal({visible: false, type: 'comment', commentID: ''});
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
          size={size <= 30 ? 'xs' : 'sm'}
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
    const maxDepth = 4;

    return (
      <View key={reply.replyID} style={styles.nestedReplyWrap}>
        <View
          style={[
            styles.replyRow,
            {paddingLeft: Math.min(depth, maxDepth) * 14},
          ]}>
          {depth > 0 && (
            <View style={styles.connectionLine}>
              <View
                style={[
                  styles.verticalLine,
                  {backgroundColor: borderColor},
                ]}
              />
              <View
                style={[
                  styles.horizontalLine,
                  {backgroundColor: borderColor},
                ]}
              />
            </View>
          )}

          {renderAvatar(reply.userImage, reply.userProfileName, 28)}

          <Pressable
            style={styles.replyBody}
            onLongPress={() =>
              handleLongPressReply(commentID, reply.replyID, mine)
            }>
            <View
              style={[
                styles.messageBubble,
                {backgroundColor: cardBg, borderColor: borderColor},
              ]}>
              <Text style={[styles.username, {color: textColor}]}>
                {reply.userProfileName}
              </Text>
              <Text style={[styles.messageText, {color: textColor}]}>
                {reply.reply}
              </Text>
            </View>

            <View style={styles.replyMetaRow}>
              <Text style={[styles.metaText, {color: subtextColor}]}>
                {moment(reply.replyCreated).fromNow(true)}
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
                style={{marginLeft: 14}}>
                <Text
                  style={[
                    styles.replyBtnText,
                    {color: StyleGuide.color.primary},
                  ]}>
                  Reply
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>

          <TouchableOpacity
            onPress={() => toggleLike(reply.replyID)}
            style={styles.likeBtn}
            activeOpacity={0.7}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={15}
              color={liked ? '#EF4444' : subtextColor}
            />
          </TouchableOpacity>
        </View>

        {hasReplies && (
          <TouchableOpacity
            style={[
              styles.viewNestedRepliesBtn,
              {paddingLeft: (Math.min(depth, maxDepth) + 1) * 14 + 36},
            ]}
            onPress={() => toggleReplyExpanded(reply.replyID)}
            activeOpacity={0.7}>
            <MaterialCommunityIcons
              name={isExpanded ? 'chevron-down' : 'chevron-right'}
              size={18}
              color={StyleGuide.color.primary}
            />
            <Text
              style={[
                styles.viewRepliesText,
                {color: StyleGuide.color.primary},
              ]}>
              {isExpanded
                ? `Hide ${nestedCount} ${
                    nestedCount === 1 ? 'reply' : 'replies'
                  }`
                : `${nestedCount} ${nestedCount === 1 ? 'reply' : 'replies'}`}
            </Text>
          </TouchableOpacity>
        )}

        {isExpanded && hasReplies && (
          <View>
            {reply.replies!.map(nestedReply =>
              renderNestedReply(nestedReply, commentID, depth + 1),
            )}
          </View>
        )}
      </View>
    );
  };

  const renderItem = ({item}: {item: CommentI}) => {
    const mine = item.userID === userID;
    const liked = likedComments.has(item.commentID);
    const hasReplies = item.replies && item.replies.length > 0;
    const isExpanded = expandedComments.has(item.commentID);
    const totalReplies = countNestedReplies(item.replies);

    return (
      <View style={styles.commentContainer}>
        <View style={styles.commentRow}>
          {renderAvatar(item.userImage, item.userProfileName, 36)}

          <Pressable
            style={styles.commentBody}
            onLongPress={() => handleLongPressComment(item.commentID, mine)}>
            <View
              style={[
                styles.messageBubble,
                {backgroundColor: cardBg, borderColor: borderColor},
              ]}>
              <Text style={[styles.username, {color: textColor}]}>
                {item.userProfileName}
              </Text>
              <Text style={[styles.messageText, {color: textColor}]}>
                {item.comment}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={[styles.metaText, {color: subtextColor}]}>
                {moment(item.commentCreated).fromNow(true)}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  handleReply(item.commentID, item.userProfileName)
                }
                style={{marginLeft: 14}}>
                <Text
                  style={[
                    styles.replyBtnText,
                    {color: StyleGuide.color.primary},
                  ]}>
                  Reply
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>

          <TouchableOpacity
            onPress={() => toggleLike(item.commentID)}
            style={styles.likeBtn}
            activeOpacity={0.7}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={17}
              color={liked ? '#EF4444' : subtextColor}
            />
          </TouchableOpacity>
        </View>

        {/* View Replies Button */}
        {hasReplies && (
          <TouchableOpacity
            style={styles.viewRepliesBtn}
            onPress={() => toggleExpanded(item.commentID)}
            activeOpacity={0.7}>
            <View style={styles.replyLineContainer}>
              <View
                style={[
                  styles.replyLine,
                  {backgroundColor: StyleGuide.color.primary},
                ]}
              />
              <MaterialCommunityIcons
                name={isExpanded ? 'chevron-down' : 'chevron-right'}
                size={18}
                color={StyleGuide.color.primary}
                style={{marginLeft: 4}}
              />
            </View>
            <Text
              style={[
                styles.viewRepliesText,
                {color: StyleGuide.color.primary},
              ]}>
              {isExpanded
                ? `Hide ${totalReplies} ${
                    totalReplies === 1 ? 'reply' : 'replies'
                  }`
                : `View ${totalReplies} ${
                    totalReplies === 1 ? 'reply' : 'replies'
                  }`}
            </Text>
          </TouchableOpacity>
        )}

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

  const InputWrapper = Platform.OS === 'ios' ? KeyboardAvoidingView : View;
  const inputWrapperProps =
    Platform.OS === 'ios' ? {behavior: 'padding' as const} : {};

  return (
    <Modal transparent visible animationType="none">
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />
      <View style={styles.overlay}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, {opacity: backdropOpacity}]}>
          <TouchableOpacity style={{flex: 1}} onPress={closeSheet} />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {backgroundColor: sheetBg, transform: [{translateY}]},
          ]}>
          {/* Sheet Header */}
          <View
            {...panResponder.panHandlers}
            style={[
              styles.header,
              {
                backgroundColor: sheetBg,
                borderBottomColor: borderColor,
                paddingTop: insets.top,
              },
            ]}>
            <View style={styles.dragHandle} />
            <Text style={[styles.headerTitle, {color: textColor}]}>
              Comments
            </Text>
            <TouchableOpacity onPress={closeSheet} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <FlatList
            data={comments}
            renderItem={renderItem}
            keyExtractor={i => i.commentID}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchComments(true)}
                colors={[StyleGuide.color.primary]}
                tintColor={StyleGuide.color.primary}
              />
            }
            contentContainerStyle={{
              paddingTop: HEADER_HEIGHT + insets.top + 8,
              paddingBottom: 120,
            }}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              loading ? (
                <ActivityIndicator
                  style={{marginTop: 80}}
                  color={StyleGuide.color.primary}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconCircle}>
                    <Feather
                      name="message-circle"
                      size={36}
                      color={StyleGuide.color.primary}
                    />
                  </View>
                  <Text style={[styles.empty, {color: textColor}]}>
                    No comments yet
                  </Text>
                  <Text style={[styles.emptySubtext, {color: subtextColor}]}>
                    Be the first to share your thoughts!
                  </Text>
                </View>
              )
            }
          />

          {/* Replying Banner */}
          {replyingTo && (
            <View
              style={[
                styles.replyIndicator,
                {
                  backgroundColor: StyleGuide.color.primaryLight,
                  borderTopColor: borderColor,
                },
              ]}>
              <View style={styles.replyIndicatorLeft}>
                <MaterialCommunityIcons
                  name="reply"
                  size={16}
                  color={StyleGuide.color.primaryDark}
                />
                <Text
                  style={[
                    styles.replyingText,
                    {color: StyleGuide.color.primaryDark},
                  ]}>
                  Replying to{' '}
                  <Text style={{fontWeight: '700'}}>
                    @{replyingTo.userName}
                  </Text>
                </Text>
              </View>
              <TouchableOpacity onPress={cancelReply} activeOpacity={0.7}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={StyleGuide.color.primaryDark}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Input Footer */}
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: sheetBg,
                borderTopColor: borderColor,
                paddingBottom: Platform.OS === 'ios' ? insets.bottom + 8 : 12,
              },
            ]}>
            <InputWrapper {...inputWrapperProps}>
              <View style={styles.inputRow}>
                {renderAvatar(user?.image, user?.name, 36)}

                <View
                  style={[
                    styles.inputFieldContainer,
                    {backgroundColor: inputBg, borderColor: borderColor},
                  ]}>
                  <TextInput
                    ref={inputRef}
                    value={newComment}
                    onChangeText={setNewComment}
                    placeholder={
                      replyingTo ? 'Write a reply…' : 'Add a comment…'
                    }
                    placeholderTextColor={subtextColor}
                    multiline
                    maxLength={500}
                    style={[styles.input, {color: textColor}]}
                  />

                  {newComment.trim().length > 0 && (
                    <TouchableOpacity
                      onPress={postComment}
                      disabled={posting}
                      activeOpacity={0.8}
                      style={styles.sendButtonCircle}>
                      {posting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </InputWrapper>
          </View>
        </Animated.View>

        {/* Delete Confirmation Modal */}
        <Modal
          transparent
          visible={deleteModal.visible}
          animationType="fade"
          onRequestClose={() =>
            setDeleteModal({visible: false, type: 'comment', commentID: ''})
          }>
          <Pressable
            style={styles.deleteModalOverlay}
            onPress={() =>
              setDeleteModal({visible: false, type: 'comment', commentID: ''})
            }>
            <Pressable style={styles.deleteModalContent}>
              <View
                style={[
                  styles.deleteModalCard,
                  {backgroundColor: cardBg, borderColor: borderColor},
                ]}>
                <View style={styles.deleteIconContainer}>
                  <Ionicons name="trash-outline" size={36} color="#EF4444" />
                </View>
                <Text style={[styles.deleteModalTitle, {color: textColor}]}>
                  Delete {deleteModal.type === 'comment' ? 'Comment' : 'Reply'}?
                </Text>
                <Text
                  style={[
                    styles.deleteModalMessage,
                    {color: subtextColor},
                  ]}>
                  Are you sure you want to delete this {deleteModal.type}? This
                  action cannot be undone.
                </Text>

                <View style={styles.deleteModalButtons}>
                  <TouchableOpacity
                    style={[
                      styles.deleteModalButton,
                      {
                        backgroundColor: isDarkMode ? '#334155' : '#F1F5F9',
                        marginRight: 10,
                      },
                    ]}
                    onPress={() =>
                      setDeleteModal({
                        visible: false,
                        type: 'comment',
                        commentID: '',
                      })
                    }>
                    <Text
                      style={[styles.cancelButtonText, {color: textColor}]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.deleteModalButton, styles.deleteButton]}
                    onPress={confirmDelete}>
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  sheet: {
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    zIndex: 50,
    elevation: 50,
  },
  dragHandle: {
    position: 'absolute',
    top: 10,
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: StyleGuide.fontFamily.bold,
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    bottom: 12,
    padding: 4,
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
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 4,
  },
  username: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 13.5,
    marginBottom: 3,
  },
  messageText: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    fontFamily: StyleGuide.fontFamily.regular,
  },
  replyBtnText: {
    fontSize: 12,
    fontFamily: StyleGuide.fontFamily.bold,
  },
  likeBtn: {
    paddingLeft: 10,
    paddingTop: 10,
  },
  viewRepliesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 60,
    marginTop: 2,
    marginBottom: 4,
  },
  replyLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
  },
  replyLine: {
    width: 22,
    height: 2,
    borderRadius: 1,
  },
  viewRepliesText: {
    fontSize: 12.5,
    fontFamily: StyleGuide.fontFamily.bold,
  },
  viewNestedRepliesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 4,
  },
  repliesContainer: {
    paddingLeft: 12,
    paddingTop: 2,
  },
  nestedReplyWrap: {
    marginTop: 6,
  },
  replyRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 4,
    alignItems: 'flex-start',
    position: 'relative',
  },
  replyBody: {
    flex: 1,
    marginLeft: 10,
  },
  replyMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginTop: 2,
  },
  connectionLine: {
    position: 'absolute',
    left: -10,
    top: 0,
    bottom: 0,
    width: 20,
  },
  verticalLine: {
    position: 'absolute',
    left: 10,
    top: 0,
    width: 1.5,
    height: '100%',
  },
  horizontalLine: {
    position: 'absolute',
    left: 10,
    top: 18,
    width: 10,
    height: 1.5,
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontFamily: StyleGuide.fontFamily.bold,
  },
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  replyIndicatorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyingText: {
    fontSize: 13,
    fontFamily: StyleGuide.fontFamily.medium,
    marginLeft: 6,
  },
  inputContainer: {
    borderTopWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  inputFieldContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 14,
    minHeight: 44,
  },
  input: {
    flex: 1,
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 14,
    paddingVertical: 8,
    maxHeight: 90,
  },
  sendButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: StyleGuide.color.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: StyleGuide.color.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  empty: {
    textAlign: 'center',
    fontSize: 18,
    fontFamily: StyleGuide.fontFamily.bold,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: StyleGuide.fontFamily.regular,
    textAlign: 'center',
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deleteModalContent: {
    width: '100%',
    maxWidth: 340,
  },
  deleteModalCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  deleteIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontFamily: StyleGuide.fontFamily.bold,
    marginBottom: 6,
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: 13,
    fontFamily: StyleGuide.fontFamily.regular,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 6,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    width: '100%',
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: StyleGuide.fontFamily.bold,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: StyleGuide.fontFamily.bold,
  },
});

export default Comment;
