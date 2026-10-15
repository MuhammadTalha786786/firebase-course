import React, {useState, useEffect, useMemo} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  Dimensions,
  Modal,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  ActivityIndicator,
  Clipboard,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Avatar} from 'native-base';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import {StyleGuide} from '../../Utils/StyleGuide';
import {useChat} from './useChat';
import {ChatMessage} from '../../services/chatSocketService';
import {ChatScreenShimmer} from '../components/AppShimmers';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

export default function ChatScreen() {
  const {
    mode,
    messages,
    inputMessage,
    setInputMessage,
    sendMessage,
    deleteMessage,
    loading,
    isOtherTyping,
    isSocketConnected,
    currentUserId,
    currentUserMongoId,
    currentUserUid,
    receiverName,
    receiverImage,
    receiverLogin,
    receiverID,
    selectedMessage,
    setSelectedMessage,
    deleteModalVisible,
    setDeleteModalVisible,
    getSecondsRemaining,
    navigation,
  } = useChat();

  const isDarkMode = Boolean(mode);

  // Dynamic Theme Colors
  const colors = useMemo(() => {
    return {
      background: isDarkMode ? '#0B0F19' : '#F8FAFC',
      headerBg: isDarkMode ? '#111827' : '#FFFFFF',
      cardBg: isDarkMode ? '#1F2937' : '#FFFFFF',
      textPrimary: isDarkMode ? '#F9FAFB' : '#0F172A',
      textSecondary: isDarkMode ? '#9CA3AF' : '#64748B',
      border: isDarkMode ? '#374151' : '#E5E7EB',
      inputBg: isDarkMode ? '#1F2937' : '#F1F5F9',
      primary: '#0084FF',
      // Sender Bubble (My message on the right: Vibrant Modern Blue)
      senderBubble: '#0084FF',
      senderText: '#FFFFFF',
      senderTime: 'rgba(255, 255, 255, 0.78)',
      // Receiver Bubble (Other person's message on the left: Distinct soft grey in light mode)
      receiverBubble: isDarkMode ? '#1E293B' : '#E2E8F0',
      receiverText: isDarkMode ? '#F9FAFB' : '#0F172A',
      receiverTime: isDarkMode ? '#94A3B8' : '#64748B',
      deletedBubble: isDarkMode ? '#18202F' : '#E2E8F0',
      deletedText: isDarkMode ? '#6B7280' : '#64748B',
      modalOverlay: 'rgba(0, 0, 0, 0.6)',
      danger: '#EF4444',
      badgeBg: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    };
  }, [isDarkMode]);

  // Hide default react-navigation header
  useEffect(() => {
    navigation.setOptions({headerShown: false});
  }, [navigation]);

  // Live timer countdown for the selected message in modal
  const [remainingSec, setRemainingSec] = useState<number>(0);

  useEffect(() => {
    if (!deleteModalVisible || !selectedMessage) return;

    const updateTimer = () => {
      const sec = getSecondsRemaining(selectedMessage.createdAt);
      setRemainingSec(sec);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deleteModalVisible, selectedMessage, getSecondsRemaining]);

  // Helper to reliably check if current user is the sender
  const isSender = (item: ChatMessage) => {
    if (!item) return false;

    const getEntityId = (val: any): string => {
      if (!val) return '';
      if (typeof val === 'string') return String(val);
      return String(val._id || val.uid || '');
    };

    const sId = getEntityId(item.sender) || String(item.senderID || '');
    const rId = getEntityId(item.receiver) || String(item.receiverID || '');

    const myMongoId = currentUserMongoId ? String(currentUserMongoId) : '';
    const myUid = currentUserUid ? String(currentUserUid) : '';
    const myId = currentUserId ? String(currentUserId) : '';

    // 1. Direct matches with any of current user's IDs
    if (myMongoId && sId === myMongoId) return true;
    if (myUid && sId === myUid) return true;
    if (myId && sId === myId) return true;

    // 2. Relational check: If message is addressed to receiverID, I am the sender
    const targetReceiver = receiverID ? String(receiverID) : '';
    if (targetReceiver) {
      if (rId === targetReceiver) return true;
      if (sId === targetReceiver) return false;
    }

    return false;
  };

  // Open long press menu for sender's message
  const handleLongPress = (item: ChatMessage) => {
    if (item.isDeleted) return;
    setSelectedMessage(item);
    setDeleteModalVisible(true);
  };

  // Format date grouping helper
  const renderDateSeparator = (dateStr: string | Date) => {
    const date = moment(dateStr);
    const today = moment().startOf('day');
    const yesterday = moment().subtract(1, 'day').startOf('day');

    let label = date.format('MMMM D, YYYY');
    if (date.isSame(today, 'd')) {
      label = 'Today';
    } else if (date.isSame(yesterday, 'd')) {
      label = 'Yesterday';
    }

    return (
      <View style={styles.dateSeparatorContainer}>
        <View style={[styles.dateSeparatorBadge, {backgroundColor: colors.badgeBg}]}>
          <Text style={[styles.dateSeparatorText, {color: colors.textSecondary}]}>
            {label}
          </Text>
        </View>
      </View>
    );
  };

  // Render individual message bubble
  const renderItem = ({item, index}: {item: ChatMessage; index: number}) => {
    const mine = isSender(item);
    const isDel = !!item.isDeleted;
    const formattedTime = item.timeofsend || moment(item.createdAt).format('LT');

    // Date separator between days
    const currentItemDate = moment(item.createdAt).format('YYYY-MM-DD');
    const nextItem = messages[index + 1];
    const nextItemDate = nextItem
      ? moment(nextItem.createdAt).format('YYYY-MM-DD')
      : null;
    const showDateSeparator = !nextItem || currentItemDate !== nextItemDate;

    return (
      <View>
        {showDateSeparator && renderDateSeparator(item.createdAt)}

        <View
          style={[
            styles.messageRow,
            mine ? styles.messageRowSender : styles.messageRowReceiver,
          ]}>
          {/* Receiver Avatar thumbnail only on receiver's message */}
          {!mine && (
            <Avatar
              size="28px"
              source={{
                uri:
                  receiverImage ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
              }}
              style={styles.messageAvatar}
            />
          )}

          <TouchableOpacity
            activeOpacity={mine && !isDel ? 0.8 : 1}
            onLongPress={() => mine && !isDel && handleLongPress(item)}
            style={[
              styles.bubble,
              mine
                ? [
                    styles.senderBubble,
                    {backgroundColor: isDel ? colors.deletedBubble : colors.senderBubble},
                  ]
                : [
                    styles.receiverBubble,
                    {backgroundColor: isDel ? colors.deletedBubble : colors.receiverBubble},
                  ],
            ]}>
            {/* Deleted message view */}
            {isDel ? (
              <View style={styles.deletedContainer}>
                <Ionicons
                  name="ban-outline"
                  size={15}
                  color={colors.deletedText}
                  style={{marginRight: 6}}
                />
                <Text
                  style={[
                    styles.deletedText,
                    {color: colors.deletedText},
                  ]}>
                  This message was deleted
                </Text>
              </View>
            ) : (
              <Text
                style={[
                  styles.messageText,
                  {color: mine ? colors.senderText : colors.receiverText},
                ]}>
                {item.message}
              </Text>
            )}

            {/* Bubble Footer: Timestamp & status checkmarks */}
            <View style={styles.bubbleFooter}>
              <Text
                style={[
                  styles.timeText,
                  {
                    color: mine
                      ? isDel
                        ? colors.deletedText
                        : colors.senderTime
                      : colors.receiverTime,
                  },
                ]}>
                {formattedTime}
              </Text>

              {mine && !isDel && (
                <View style={styles.statusIcon}>
                  {item.pending ? (
                    <Ionicons
                      name="time-outline"
                      size={12}
                      color="rgba(255, 255, 255, 0.75)"
                    />
                  ) : (
                    <Ionicons
                      name="checkmark-done"
                      size={14}
                      color={item.isRead ? '#93C5FD' : 'rgba(255, 255, 255, 0.85)'}
                    />
                  )}
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Typing indicator bubble
  const renderTypingIndicator = () => {
    if (!isOtherTyping) return null;

    return (
      <View style={[styles.messageRow, styles.messageRowReceiver]}>
        <Avatar
          size="28px"
          source={{
            uri:
              receiverImage ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
          }}
          style={styles.messageAvatar}
        />
        <View style={[styles.typingBubble, {backgroundColor: colors.receiverBubble}]}>
          <View style={styles.typingDot} />
          <View style={[styles.typingDot, styles.typingDotDelay1]} />
          <View style={[styles.typingDot, styles.typingDotDelay2]} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.headerBg}
      />

      {/* Modern Top Header (Clean: back button, avatar, name, and online status) */}
      <View
        style={[
          styles.header,
          {backgroundColor: colors.headerBg, borderBottomColor: colors.border},
        ]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}
          style={styles.backButton}>
          <Ionicons
            name="chevron-back"
            size={26}
            color={colors.textPrimary}
          />
        </TouchableOpacity>

        {/* User Info Header */}
        <View style={styles.headerInfo}>
          <View style={styles.avatarWrapper}>
            <Avatar
              size="40px"
              source={{
                uri:
                  receiverImage ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
              }}
            />
            {receiverLogin ? (
              <View style={styles.onlineBadge} />
            ) : (
              <View style={[styles.onlineBadge, {backgroundColor: '#9CA3AF'}]} />
            )}
          </View>

          <View style={styles.headerTextWrapper}>
            <Text
              numberOfLines={1}
              style={[styles.headerName, {color: colors.textPrimary}]}>
              {receiverName || 'Chat'}
            </Text>
            <Text
              numberOfLines={1}
              style={[
                styles.headerStatus,
                {
                  color: isOtherTyping
                    ? colors.primary
                    : receiverLogin
                    ? '#10B981'
                    : colors.textSecondary,
                },
              ]}>
              {isOtherTyping
                ? 'typing...'
                : receiverLogin
                ? 'Active now'
                : 'Offline'}
            </Text>
          </View>
        </View>
      </View>

      {/* Chat Messages Body */}
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {loading && messages.length === 0 ? (
          <ChatScreenShimmer isDarkMode={isDarkMode} />
        ) : (
          <FlatList
            inverted
            data={messages}
            keyExtractor={item => item.messageID || item._id || String(Math.random())}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={renderTypingIndicator}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={50}
                  color={colors.textSecondary}
                  style={{marginBottom: 12, opacity: 0.6}}
                />
                <Text style={[styles.emptyTitle, {color: colors.textPrimary}]}>
                  No messages yet
                </Text>
                <Text style={[styles.emptySubtitle, {color: colors.textSecondary}]}>
                  Say hello to {receiverName || 'your friend'}!
                </Text>
              </View>
            }
          />
        )}

        {/* Modern Bottom Input Bar */}
        <View
          style={[
            styles.inputContainer,
            {backgroundColor: colors.headerBg, borderTopColor: colors.border},
          ]}>
          <View
            style={[
              styles.inputWrapper,
              {backgroundColor: colors.inputBg, borderColor: colors.border},
            ]}>
            <TouchableOpacity style={styles.attachmentBtn}>
              <Ionicons
                name="add-circle-outline"
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>

            <TextInput
              value={inputMessage}
              onChangeText={setInputMessage}
              placeholder="Message..."
              placeholderTextColor={isDarkMode ? '#6B7280' : '#9CA3AF'}
              multiline
              maxLength={1000}
              style={[styles.textInput, {color: colors.textPrimary}]}
            />

            <TouchableOpacity
              onPress={sendMessage}
              disabled={!inputMessage.trim()}
              style={[
                styles.sendBtn,
                {
                  backgroundColor: inputMessage.trim()
                    ? colors.primary
                    : isDarkMode
                    ? '#374151'
                    : '#E2E8F0',
                },
              ]}>
              <Ionicons
                name="arrow-up"
                size={18}
                color={inputMessage.trim() ? '#FFFFFF' : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Modern 2-Minute Delete / Action Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setDeleteModalVisible(false)}>
          <View
            style={[
              styles.modalOverlay,
              {backgroundColor: colors.modalOverlay},
            ]}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.modalContent,
                  {backgroundColor: colors.cardBg, borderColor: colors.border},
                ]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, {color: colors.textPrimary}]}>
                    Message Options
                  </Text>
                  <TouchableOpacity
                    onPress={() => setDeleteModalVisible(false)}
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                    <Ionicons
                      name="close"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {/* Message preview snippet */}
                <View
                  style={[
                    styles.messagePreview,
                    {backgroundColor: colors.inputBg},
                  ]}>
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.previewText,
                      {color: colors.textPrimary},
                    ]}>
                    "{selectedMessage?.message}"
                  </Text>
                </View>

                {/* ⏱️ 2-Minute Countdown Indicator */}
                {selectedMessage && isSender(selectedMessage) && (
                  <View style={styles.timerBadge}>
                    <Ionicons
                      name="timer-outline"
                      size={18}
                      color={remainingSec > 0 ? colors.primary : colors.danger}
                      style={{marginRight: 6}}
                    />
                    <Text
                      style={[
                        styles.timerText,
                        {
                          color:
                            remainingSec > 0
                              ? colors.primary
                              : colors.danger,
                        },
                      ]}>
                      {remainingSec > 0
                        ? `${Math.floor(remainingSec / 60)}m ${remainingSec % 60}s remaining to delete`
                        : 'Deletion window expired (> 2 mins)'}
                    </Text>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalActionBtn, {backgroundColor: colors.inputBg}]}
                    onPress={() => {
                      if (selectedMessage?.message) {
                        Clipboard.setString(selectedMessage.message);
                      }
                      setDeleteModalVisible(false);
                    }}>
                    <Feather
                      name="copy"
                      size={18}
                      color={colors.textPrimary}
                      style={{marginRight: 8}}
                    />
                    <Text style={[styles.modalActionText, {color: colors.textPrimary}]}>
                      Copy Text
                    </Text>
                  </TouchableOpacity>

                  {/* Delete button (only if within 2 minutes) */}
                  {selectedMessage && isSender(selectedMessage) && remainingSec > 0 && (
                    <TouchableOpacity
                      style={[
                        styles.modalActionBtn,
                        {backgroundColor: 'rgba(239, 68, 68, 0.1)', marginTop: 8},
                      ]}
                      onPress={() => {
                        if (selectedMessage) deleteMessage(selectedMessage);
                      }}>
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={colors.danger}
                        style={{marginRight: 8}}
                      />
                      <Text
                        style={[
                          styles.modalActionText,
                          {color: colors.danger, fontWeight: '600'},
                        ]}>
                        Delete for Everyone
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerTextWrapper: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  headerStatus: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    transform: [{scaleY: -1}], // Inverted list correction
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
  },
  dateSeparatorContainer: {
    alignItems: 'center',
    marginVertical: 14,
  },
  dateSeparatorBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateSeparatorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end',
  },
  messageRowSender: {
    justifyContent: 'flex-end',
  },
  messageRowReceiver: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    marginRight: 8,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: SCREEN_WIDTH * 0.76,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  senderBubble: {
    borderBottomRightRadius: 4,
  },
  receiverBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
    letterSpacing: -0.1,
  },
  deletedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deletedText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  statusIcon: {
    marginLeft: 4,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    width: 60,
    justifyContent: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9CA3AF',
    marginHorizontal: 2,
  },
  typingDotDelay1: {
    opacity: 0.7,
  },
  typingDotDelay2: {
    opacity: 0.4,
  },
  inputContainer: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minHeight: 46,
    borderWidth: 1,
  },
  attachmentBtn: {
    padding: 4,
    marginRight: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  messagePreview: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  previewText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 132, 255, 0.08)',
  },
  timerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalButtons: {
    marginTop: 4,
  },
  modalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalActionText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
