import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Avatar} from 'native-base';
import {StyleGuide} from '../../../Utils/StyleGuide';
import {
  getReelCommentsApi,
  addReelCommentApi,
  deleteReelCommentApi,
  ReelComment,
} from '../../../services/reelsService';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

interface ReelCommentsModalProps {
  visible: boolean;
  onClose: () => void;
  reelID: string;
  currentUserId: string;
  currentUserName: string;
  currentUserImage?: string;
  isDarkMode?: boolean;
  onCommentsCountChange?: (newCount: number) => void;
}

const formatCommentTime = (dateString?: string) => {
  if (!dateString) return 'Just now';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d`;
};

const ReelCommentsModal: React.FC<ReelCommentsModalProps> = ({
  visible,
  onClose,
  reelID,
  currentUserId,
  currentUserName,
  currentUserImage,
  isDarkMode = true,
  onCommentsCountChange,
}) => {
  const [comments, setComments] = useState<ReelComment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>('');

  useEffect(() => {
    if (visible && reelID) {
      loadComments();
    }
  }, [visible, reelID]);

  const loadComments = async () => {
    setLoading(true);
    const res = await getReelCommentsApi(reelID);
    if (res?.success && Array.isArray(res?.data)) {
      setComments(res.data);
      onCommentsCountChange?.(res.data.length);
    }
    setLoading(false);
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || submitting) return;

    const trimmed = commentText.trim();
    setCommentText('');
    setSubmitting(true);

    // Optimistic comment
    const tempId = `temp_${Date.now()}`;
    const optimisticComment: ReelComment = {
      commentID: tempId,
      reelID,
      userID: currentUserId,
      userName: currentUserName || 'You',
      userImage: currentUserImage || '',
      comment: trimmed,
      commentCreated: new Date().toISOString(),
    };

    const updatedComments = [optimisticComment, ...comments];
    setComments(updatedComments);
    onCommentsCountChange?.(updatedComments.length);

    try {
      const res = await addReelCommentApi(reelID, {
        comment: trimmed,
        userID: currentUserId,
        userName: currentUserName,
        userImage: currentUserImage,
      });

      if (res?.success && res?.data) {
        setComments(prev =>
          prev.map(c => (c.commentID === tempId ? res.data : c))
        );
        if (typeof res?.commentsCount === 'number') {
          onCommentsCountChange?.(res.commentsCount);
        }
      } else {
        // Rollback
        setComments(prev => prev.filter(c => c.commentID !== tempId));
        onCommentsCountChange?.(comments.length);
      }
    } catch (e) {
      setComments(prev => prev.filter(c => c.commentID !== tempId));
      onCommentsCountChange?.(comments.length);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentID: string) => {
    const previous = [...comments];
    const filtered = comments.filter(c => c.commentID !== commentID);
    setComments(filtered);
    onCommentsCountChange?.(filtered.length);

    const res = await deleteReelCommentApi(reelID, commentID, currentUserId);
    if (!res?.success) {
      setComments(previous);
      onCommentsCountChange?.(previous.length);
    }
  };

  const sheetBg = isDarkMode ? '#111827' : '#FFFFFF';
  const textColor = isDarkMode ? '#F9FAFB' : '#111827';
  const subtextColor = isDarkMode ? '#9CA3AF' : '#6B7280';
  const borderColor = isDarkMode ? '#1F2937' : '#E5E7EB';
  const inputBg = isDarkMode ? '#1F2937' : '#F3F4F6';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.sheetContainer, {backgroundColor: sheetBg}]}>
          {/* Header handle & title */}
          <View style={[styles.sheetHeader, {borderBottomColor: borderColor}]}>
            <View style={styles.dragHandle} />
            <View style={styles.headerTitleRow}>
              <Text style={[styles.headerTitle, {color: textColor}]}>
                Comments ({comments.length})
              </Text>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                style={styles.closeBtn}>
                <Feather name="x" size={20} color={subtextColor} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Comments List */}
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator
                size="small"
                color={StyleGuide.color.primary}
              />
              <Text style={[styles.loadingText, {color: subtextColor}]}>
                Loading comments...
              </Text>
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.centerContainer}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={44}
                color={subtextColor}
              />
              <Text style={[styles.emptyTitle, {color: textColor}]}>
                No comments yet
              </Text>
              <Text style={[styles.emptySubtitle, {color: subtextColor}]}>
                Be the first to say something about this reel!
              </Text>
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={item => item.commentID}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({item}) => {
                const isOwnComment = item.userID === currentUserId;
                return (
                  <View style={styles.commentItem}>
                    {item.userImage ? (
                      <Avatar
                        size="sm"
                        source={{uri: item.userImage}}
                        style={styles.commentAvatar}
                      />
                    ) : (
                      <View
                        style={[
                          styles.avatarFallback,
                          {backgroundColor: StyleGuide.color.primaryLight},
                        ]}>
                        <Text style={styles.avatarFallbackText}>
                          {item.userName ? item.userName[0].toUpperCase() : 'U'}
                        </Text>
                      </View>
                    )}

                    <View style={styles.commentContent}>
                      <View style={styles.commentMetaRow}>
                        <Text
                          style={[styles.commentUserName, {color: textColor}]}>
                          @{item.userName}
                        </Text>
                        <Text
                          style={[
                            styles.commentTimestamp,
                            {color: subtextColor},
                          ]}>
                          {formatCommentTime(item.commentCreated)}
                        </Text>
                      </View>
                      <Text style={[styles.commentBody, {color: textColor}]}>
                        {item.comment}
                      </Text>
                    </View>

                    {isOwnComment && (
                      <TouchableOpacity
                        onPress={() => handleDeleteComment(item.commentID)}
                        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                        style={styles.deleteCommentBtn}>
                        <Feather name="trash-2" size={14} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              }}
            />
          )}

          {/* Input Box */}
          <View style={[styles.inputContainer, {borderTopColor: borderColor}]}>
            {currentUserImage ? (
              <Avatar
                size="sm"
                source={{uri: currentUserImage}}
                style={styles.inputAvatar}
              />
            ) : (
              <View
                style={[
                  styles.avatarFallback,
                  styles.inputAvatar,
                  {backgroundColor: StyleGuide.color.primaryLight},
                ]}>
                <Text style={styles.avatarFallbackText}>
                  {currentUserName ? currentUserName[0].toUpperCase() : 'U'}
                </Text>
              </View>
            )}

            <View style={[styles.inputWrapper, {backgroundColor: inputBg}]}>
              <TextInput
                style={[styles.textInput, {color: textColor}]}
                placeholder="Add a comment..."
                placeholderTextColor={subtextColor}
                value={commentText}
                onChangeText={setCommentText}
                multiline={false}
                returnKeyType="send"
                onSubmitEditing={handleAddComment}
              />

              <TouchableOpacity
                onPress={handleAddComment}
                disabled={!commentText.trim() || submitting}
                style={[
                  styles.sendBtn,
                  {
                    backgroundColor: commentText.trim()
                      ? StyleGuide.color.primary
                      : 'transparent',
                  },
                ]}>
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons
                    name="arrow-up"
                    size={18}
                    color={commentText.trim() ? '#FFFFFF' : subtextColor}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
  },
  sheetContainer: {
    height: SCREEN_HEIGHT * 0.65,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  sheetHeader: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6B7280',
    marginBottom: 10,
  },
  headerTitleRow: {
    width: '100%',
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 16,
  },
  closeBtn: {
    padding: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 13,
    marginTop: 8,
  },
  emptyTitle: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 16,
    marginTop: 12,
  },
  emptySubtitle: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  commentAvatar: {
    marginRight: 12,
    marginTop: 2,
  },
  avatarFallback: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarFallbackText: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 14,
    color: StyleGuide.color.primaryDark,
  },
  commentContent: {
    flex: 1,
  },
  commentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  commentUserName: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 13,
    marginRight: 8,
  },
  commentTimestamp: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 11,
  },
  commentBody: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  deleteCommentBtn: {
    padding: 6,
    marginLeft: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
  },
  inputAvatar: {
    marginRight: 10,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    paddingHorizontal: 14,
    height: 44,
  },
  textInput: {
    flex: 1,
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 14,
    paddingVertical: 0,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
});

export default ReelCommentsModal;
