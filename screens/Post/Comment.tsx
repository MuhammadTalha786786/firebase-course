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
} from 'react-native';
import React, {useEffect, useState, useRef} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {TextInput} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {Avatar} from 'native-base';
import moment from 'moment';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ApiCall from '../../services/services';
import {KeyboardAvoidingView} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

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
    const maxDepth = 6;

    return (
      <View key={reply.replyID} style={{marginTop: 8}}>
        <View
          style={[
            styles.replyRow,
            {paddingLeft: Math.min(depth, maxDepth) * 12},
          ]}>
          {depth > 0 && (
            <View style={styles.connectionLine}>
              <View
                style={[
                  styles.verticalLine,
                  {backgroundColor: mode ? '#333' : '#e0e0e0'},
                ]}
              />
              <View
                style={[
                  styles.horizontalLine,
                  {backgroundColor: mode ? '#333' : '#e0e0e0'},
                ]}
              />
            </View>
          )}

          <Avatar size="xs" source={{uri: reply.userImage}} />

          <Pressable
            style={styles.replyBody}
            onLongPress={() =>
              handleLongPressReply(commentID, reply.replyID, mine)
            }>
            <View
              style={[
                styles.messageBubble,
                {backgroundColor: mode ? '#1a1a1a' : '#f0f0f0'},
              ]}>
              <Text style={[styles.username, {color: mode ? '#fff' : '#000'}]}>
                {reply.userProfileName}
              </Text>
              <Text
                style={[
                  styles.messageText,
                  {color: mode ? '#e0e0e0' : '#262626'},
                ]}>
                {reply.reply}
              </Text>
            </View>
            <View style={styles.replyMetaRow}>
              <Text style={styles.metaText}>
                {moment(reply.replyCreated).fromNow()}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  handleReply(
                    commentID,
                    reply.userProfileName,
                    reply.replyID,
                    'reply',
                  )
                }>
                <Text style={styles.replyText}>Reply</Text>
              </TouchableOpacity>
            </View>
          </Pressable>

          <TouchableOpacity
            onPress={() => toggleLike(reply.replyID)}
            style={styles.likeBtn}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={14}
              color={liked ? '#ff3b30' : '#8e8e8e'}
            />
          </TouchableOpacity>
        </View>

        {hasReplies && (
          <TouchableOpacity
            style={[
              styles.viewNestedRepliesBtn,
              {paddingLeft: (Math.min(depth, maxDepth) + 1) * 12 + 48},
            ]}
            onPress={() => toggleReplyExpanded(reply.replyID)}>
            <MaterialCommunityIcons
              name={isExpanded ? 'chevron-down' : 'chevron-right'}
              size={18}
              color="#8e8e8e"
            />
            <Text style={styles.viewRepliesText}>
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
          <Avatar size="sm" source={{uri: item.userImage}} />
          <Pressable
            style={styles.commentBody}
            onLongPress={() => handleLongPressComment(item.commentID, mine)}>
            <View
              style={[
                styles.messageBubble,
                {backgroundColor: mode ? '#1a1a1a' : '#f0f0f0'},
              ]}>
              <Text style={[styles.username, {color: mode ? '#fff' : '#000'}]}>
                {item.userProfileName}
              </Text>
              <Text
                style={[
                  styles.messageText,
                  {color: mode ? '#e0e0e0' : '#262626'},
                ]}>
                {item.comment}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                {moment(item.commentCreated).fromNow()}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  handleReply(item.commentID, item.userProfileName)
                }>
                <Text style={styles.replyText}>Reply</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
          <TouchableOpacity
            onPress={() => toggleLike(item.commentID)}
            style={styles.likeBtn}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={16}
              color={liked ? '#ff3b30' : '#8e8e8e'}
            />
          </TouchableOpacity>
        </View>

        {hasReplies && (
          <TouchableOpacity
            style={styles.viewRepliesBtn}
            onPress={() => toggleExpanded(item.commentID)}>
            <View style={styles.replyLineContainer}>
              <View
                style={[
                  styles.replyLine,
                  {backgroundColor: mode ? '#333' : '#e0e0e0'},
                ]}
              />
              <MaterialCommunityIcons
                name={isExpanded ? 'chevron-down' : 'chevron-right'}
                size={18}
                color="#8e8e8e"
                style={{marginLeft: 4}}
              />
            </View>
            <Text style={styles.viewRepliesText}>
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

  const bg = mode ? '#000' : '#fff';
  const border = mode ? '#333' : '#e0e0e0';
  const text = mode ? '#fff' : '#000';

  const InputWrapper = Platform.OS === 'ios' ? KeyboardAvoidingView : View;
  const inputWrapperProps =
    Platform.OS === 'ios' ? {behavior: 'padding' as const} : {};

  return (
    <Modal transparent visible animationType="none">
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={mode ? 'light-content' : 'dark-content'}
      />
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, {opacity: backdropOpacity}]}>
          <TouchableOpacity style={{flex: 1}} onPress={closeSheet} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {backgroundColor: bg, transform: [{translateY}]},
          ]}>
          <View
            {...panResponder.panHandlers}
            style={[
              styles.header,
              {
                backgroundColor: bg,
                borderBottomColor: border,
                paddingTop: insets.top,
              },
            ]}>
            <View style={styles.dragHandle} />
            <Text style={[styles.headerTitle, {color: text}]}>Comments</Text>
            <TouchableOpacity onPress={closeSheet} style={styles.closeBtn}>
              <Ionicons name="close" size={26} color={text} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={comments}
            renderItem={renderItem}
            keyExtractor={i => i.commentID}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchComments(true)}
              />
            }
            contentContainerStyle={{
              paddingTop: HEADER_HEIGHT + insets.top + 8,
              paddingBottom: 110,
            }}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              loading ? (
                <ActivityIndicator
                  style={{marginTop: 80}}
                  color={mode ? '#fff' : '#000'}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={64}
                    color={mode ? '#333' : '#ddd'}
                  />
                  <Text style={[styles.empty, {color: mode ? '#666' : '#999'}]}>
                    No comments yet
                  </Text>
                  <Text
                    style={[
                      styles.emptySubtext,
                      {color: mode ? '#555' : '#aaa'},
                    ]}>
                    Be the first to comment
                  </Text>
                </View>
              )
            }
          />

          {replyingTo && (
            <View
              style={[
                styles.replyIndicator,
                {
                  backgroundColor: mode ? '#1a1a1a' : '#f5f5f5',
                  borderTopColor: border,
                },
              ]}>
              <View
                style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                <MaterialCommunityIcons
                  name="reply"
                  size={16}
                  color={mode ? '#666' : '#999'}
                />
                <Text
                  style={[
                    styles.replyingText,
                    {color: mode ? '#aaa' : '#666'},
                  ]}>
                  Replying to{' '}
                  <Text style={{fontWeight: '600', color: '#0095f6'}}>
                    {replyingTo.userName}
                  </Text>
                </Text>
              </View>
              <TouchableOpacity onPress={cancelReply}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={mode ? '#666' : '#999'}
                />
              </TouchableOpacity>
            </View>
          )}

          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: bg,
                borderTopColor: border,
                paddingBottom: Platform.OS === 'ios' ? insets.bottom + 8 : 12,
              },
            ]}>
            <InputWrapper {...inputWrapperProps}>
              <View style={styles.inputRow}>
                <Avatar size="xs" source={{uri: user?.image}} />
                <TextInput
                  ref={inputRef}
                  value={newComment}
                  onChangeText={setNewComment}
                  placeholder={replyingTo ? 'Add a reply…' : 'Add a comment…'}
                  placeholderTextColor={mode ? '#666' : '#999'}
                  multiline
                  maxLength={500}
                  style={[styles.input, {color: text}]}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  theme={{
                    colors: {
                      background: mode ? '#1a1a1a' : '#f5f5f5',
                    },
                  }}
                />
                {newComment.trim().length > 0 && (
                  <TouchableOpacity onPress={postComment} disabled={posting}>
                    {posting ? (
                      <ActivityIndicator size="small" color="#0095f6" />
                    ) : (
                      <Ionicons name="send" size={24} color="#0095f6" />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </InputWrapper>
          </View>
        </Animated.View>

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
                  {backgroundColor: mode ? '#1c1c1e' : '#fff'},
                ]}>
                <View style={styles.deleteIconContainer}>
                  <Ionicons name="trash-outline" size={48} color="#ff3b30" />
                </View>
                <Text
                  style={[
                    styles.deleteModalTitle,
                    {color: mode ? '#fff' : '#000'},
                  ]}>
                  Delete {deleteModal.type === 'comment' ? 'Comment' : 'Reply'}?
                </Text>
                <Text
                  style={[
                    styles.deleteModalMessage,
                    {color: mode ? '#8e8e93' : '#8e8e8e'},
                  ]}>
                  Are you sure you want to delete this{' '}
                  {deleteModal.type === 'comment' ? 'comment' : 'reply'}? This
                  will also delete all nested replies.
                </Text>

                <View style={styles.deleteModalButtons}>
                  <TouchableOpacity
                    style={[
                      styles.deleteModalButton,
                      styles.cancelButton,
                      {backgroundColor: mode ? '#2c2c2e' : '#f0f0f0'},
                    ]}
                    onPress={() =>
                      setDeleteModal({
                        visible: false,
                        type: 'comment',
                        commentID: '',
                      })
                    }>
                    <Text
                      style={[
                        styles.cancelButtonText,
                        {color: mode ? '#fff' : '#000'},
                      ]}>
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
  overlay: {flex: 1, justifyContent: 'flex-end'},
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  sheet: {
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
    borderBottomWidth: 0.5,
    zIndex: 50,
    elevation: 50,
  },
  dragHandle: {
    position: 'absolute',
    top: 8,
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
  },
  headerTitle: {fontSize: 17, fontWeight: '600', letterSpacing: 0.3},
  closeBtn: {
    position: 'absolute',
    right: 16,
    bottom: 14,
  },
  commentContainer: {
    marginBottom: 12,
  },
  commentRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'flex-start',
  },
  commentBody: {
    flex: 1,
    marginLeft: 12,
  },
  messageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    marginBottom: 4,
  },
  username: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 12,
    marginTop: 2,
  },
  metaText: {fontSize: 12, color: '#8e8e8e', fontWeight: '500'},
  replyText: {fontSize: 12, color: '#8e8e8e', fontWeight: '600'},
  likeBtn: {
    paddingLeft: 8,
    paddingTop: 8,
  },
  viewRepliesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 60,
    marginTop: 4,
    marginBottom: 4,
  },
  replyLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  replyLine: {
    width: 24,
    height: 1.5,
  },
  viewRepliesText: {
    fontSize: 13,
    color: '#8e8e8e',
    fontWeight: '600',
  },
  viewNestedRepliesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  repliesContainer: {
    paddingLeft: 16,
    paddingTop: 4,
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
    marginLeft: 8,
  },
  replyMetaRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 12,
    marginTop: 2,
  },
  connectionLine: {
    position: 'absolute',
    left: -12,
    top: 0,
    bottom: 0,
    width: 24,
  },
  verticalLine: {
    position: 'absolute',
    left: 12,
    top: 0,
    width: 1.5,
    height: '100%',
  },
  horizontalLine: {
    position: 'absolute',
    left: 12,
    top: 20,
    width: 12,
    height: 1.5,
  },
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 0.5,
  },
  replyingText: {
    fontSize: 13,
  },
  inputContainer: {
    borderTopWidth: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    marginHorizontal: 12,
    maxHeight: 100,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  empty: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deleteModalContent: {
    width: '100%',
    maxWidth: 340,
  },
  deleteModalCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  deleteIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 0,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
export default Comment;
