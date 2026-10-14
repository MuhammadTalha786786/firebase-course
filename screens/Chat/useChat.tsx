import React, {useState, useEffect, useRef, useCallback} from 'react';
import {Alert} from 'react-native';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import uuid from 'react-native-uuid';
import moment from 'moment';
import {StackParamList} from '../../Utils/routes';
import {reducerType} from '../../Utils/types';
import ApiCall from '../../services/services';
import {chatSocketService, ChatMessage} from '../../services/chatSocketService';

type Props = RouteProp<StackParamList, 'ChatsScreen'>;

export const useChat = () => {
  const route = useRoute<Props>();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const {receiverName, receiverImage, receiverLogin, receiverID} = route?.params || {};

  const authState = useSelector((state: reducerType) => state);
  const mode = authState.darkModeReducer.mode;

  const currentUserId =
    authState.userAuthReducer.userData?.user?._id ||
    authState.userAuthReducer.userData?.user?.uid ||
    authState.userAuthReducer.uid ||
    '';

  const currentUserName =
    authState.userAuthReducer.userData?.user?.name ||
    authState.userAuthReducer.userName ||
    'You';

  const currentUserImage =
    authState.userAuthReducer.userData?.user?.image || '';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isOtherTyping, setIsOtherTyping] = useState<boolean>(false);
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);

  const typingTimeoutRef = useRef<any>(null);
  const pollingIntervalRef = useRef<any>(null);

  // Helper to extract ID string
  const getEntityId = (entity: any): string => {
    if (!entity) return '';
    if (typeof entity === 'string') return entity;
    return entity._id || entity.uid || '';
  };

  // Determine if a message belongs to this current chat thread
  const belongsToThisChat = useCallback(
    (msg: ChatMessage): boolean => {
      const senderKey = getEntityId(msg.sender) || msg.senderID || '';
      const receiverKey = getEntityId(msg.receiver) || msg.receiverID || '';

      const isCurrentSender =
        senderKey === currentUserId ||
        senderKey === authState.userAuthReducer.uid;
      const isCurrentReceiver =
        receiverKey === currentUserId ||
        receiverKey === authState.userAuthReducer.uid;

      const isTargetSender =
        senderKey === receiverID ||
        (msg.sender && typeof msg.sender === 'object' && msg.sender.uid === receiverID);
      const isTargetReceiver =
        receiverKey === receiverID ||
        (msg.receiver && typeof msg.receiver === 'object' && msg.receiver.uid === receiverID);

      return (
        (isCurrentSender && isTargetReceiver) ||
        (isTargetSender && isCurrentReceiver)
      );
    },
    [currentUserId, receiverID, authState.userAuthReducer.uid],
  );

  // 1. Initial Load of Messages via REST API
  const fetchMessages = useCallback(
    async (isBackground = false) => {
      if (!receiverID || !currentUserId) return;
      if (!isBackground) setLoading(true);

      try {
        const res = await ApiCall(
          'get',
          `api/messages/${receiverID}?userID=${currentUserId}`,
          null,
          dispatch,
          false,
        );

        if (res?.success && Array.isArray(res?.data)) {
          // Store sorted descending (newest first) for inverted FlatList
          const sorted = [...res.data].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          setMessages(sorted);
        }
      } catch (err) {
        console.error('Error fetching chat messages:', err);
      } finally {
        if (!isBackground) setLoading(false);
      }
    },
    [receiverID, currentUserId, dispatch],
  );

  // 2. Setup WebSocket and Listeners
  useEffect(() => {
    if (!currentUserId) return;

    chatSocketService.connect(currentUserId);

    // Connection listener
    const unbindConn = chatSocketService.addConnectionListener(connected => {
      setIsSocketConnected(connected);
    });

    // Real-time new message listener
    const unbindMsg = chatSocketService.addMessageListener(newMsg => {
      if (!belongsToThisChat(newMsg)) return;

      setMessages(prev => {
        // If message with this ID already exists, replace it
        const existsIndex = prev.findIndex(
          m =>
            m.messageID === newMsg.messageID ||
            (m._id && newMsg._id && m._id === newMsg._id),
        );

        if (existsIndex !== -1) {
          const updated = [...prev];
          updated[existsIndex] = {...newMsg, pending: false};
          return updated;
        }

        // Otherwise prepend to inverted list
        return [{...newMsg, pending: false}, ...prev];
      });
    });

    // Real-time delete listener
    const unbindDel = chatSocketService.addDeleteListener(delData => {
      setMessages(prev =>
        prev.map(m => {
          if (m.messageID === delData.messageID || (m._id && m._id === delData.messageID)) {
            return {
              ...m,
              isDeleted: true,
              deletedAt: delData.deletedAt || new Date().toISOString(),
              message: 'This message was deleted',
            };
          }
          return m;
        }),
      );
    });

    // Real-time typing listener
    const unbindTyping = chatSocketService.addTypingListener(typingData => {
      if (
        typingData.senderID === receiverID ||
        typingData.senderID === currentUserId
      ) {
        if (typingData.senderID === receiverID) {
          setIsOtherTyping(typingData.isTyping);
        }
      }
    });

    // Initial load
    fetchMessages();

    // 3. Fallback sync polling every 3.5 seconds if socket is disconnected or for safety
    pollingIntervalRef.current = setInterval(() => {
      if (!chatSocketService.isConnected()) {
        fetchMessages(true);
      }
    }, 3500);

    return () => {
      unbindConn();
      unbindMsg();
      unbindDel();
      unbindTyping();
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [currentUserId, receiverID, belongsToThisChat, fetchMessages]);

  // 4. Send Message (Optimistic UI + Socket + REST)
  const sendMessage = async () => {
    const trimmed = inputMessage.trim();
    if (!trimmed || !receiverID || !currentUserId) return;

    const id = uuid.v4() as string;
    const timeofsend = moment().format('LT');
    const nowIso = new Date().toISOString();

    // Optimistic message object
    const optimisticMessage: ChatMessage = {
      messageID: id,
      sender: {
        _id: currentUserId,
        name: currentUserName,
        image: currentUserImage,
        uid: authState.userAuthReducer.uid,
      },
      receiver: {
        _id: receiverID,
        name: receiverName || '',
        image: receiverImage || '',
        uid: receiverID,
      },
      senderID: currentUserId,
      receiverID: receiverID,
      message: trimmed,
      timeofsend,
      createdAt: nowIso,
      isDeleted: false,
      pending: true,
    };

    // Instant UI update (0ms delay)
    setMessages(prev => [optimisticMessage, ...prev]);
    setInputMessage('');

    // Stop typing indicator immediately
    chatSocketService.sendTyping({
      senderID: currentUserId,
      receiverID,
      isTyping: false,
    });

    // Send via WebSocket if open
    chatSocketService.sendMessage({
      senderID: currentUserId,
      receiverID,
      message: trimmed,
      messageID: id,
      timeofsend,
    });

    // Send via REST API for persistence and guaranteed delivery
    try {
      const res = await ApiCall(
        'post',
        'api/messages',
        {
          userID: currentUserId,
          receiverID,
          message: trimmed,
          messageID: id,
          timeofsend,
        },
        dispatch,
        false,
      );

      if (res?.success && res?.data) {
        setMessages(prev =>
          prev.map(m =>
            m.messageID === id
              ? {...res.data, pending: false}
              : m,
          ),
        );
      } else {
        // Even if server returns non-200, mark pending false if already saved
        setMessages(prev =>
          prev.map(m => (m.messageID === id ? {...m, pending: false} : m)),
        );
      }
    } catch (err) {
      console.error('Failed to send message via API:', err);
      setMessages(prev =>
        prev.map(m => (m.messageID === id ? {...m, pending: false} : m)),
      );
    }
  };

  // 5. Delete Message (Strict 2-minute rule)
  const deleteMessage = async (msg: ChatMessage) => {
    if (!msg || !currentUserId) return;

    // Check sender ownership
    const senderKey = getEntityId(msg.sender) || msg.senderID || '';
    const isOwner =
      senderKey === currentUserId ||
      senderKey === authState.userAuthReducer.uid;

    if (!isOwner) {
      Alert.alert('Unauthorized', 'You can only delete your own messages.');
      return;
    }

    // ⏱️ Check 2-Minute Time Window (120 seconds = 120,000 ms)
    const createdTime = new Date(msg.createdAt).getTime();
    const elapsedMs = Date.now() - createdTime;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);

    if (elapsedSeconds > 120) {
      Alert.alert(
        'Time Expired',
        'Messages can only be deleted within 2 minutes of sending.',
      );
      return;
    }

    // Optimistic UI update
    setMessages(prev =>
      prev.map(m =>
        m.messageID === msg.messageID
          ? {
              ...m,
              isDeleted: true,
              deletedAt: new Date().toISOString(),
              message: 'This message was deleted',
            }
          : m,
      ),
    );

    setDeleteModalVisible(false);
    setSelectedMessage(null);

    // Notify via WebSocket
    chatSocketService.deleteMessage({
      messageID: msg.messageID,
      userID: currentUserId,
    });

    // Call REST API
    try {
      const idToDelete = msg.messageID || msg._id;
      const res = await ApiCall(
        'delete',
        `api/messages/${idToDelete}`,
        {userID: currentUserId},
        dispatch,
        false,
      );

      if (!res?.success) {
        Alert.alert(
          'Error',
          res?.message || 'Could not delete message on server.',
        );
      }
    } catch (e: any) {
      console.error('Delete message error:', e);
    }
  };

  // 6. Typing status handler with debounce
  const handleInputChange = (text: string) => {
    setInputMessage(text);

    if (!currentUserId || !receiverID) return;

    chatSocketService.sendTyping({
      senderID: currentUserId,
      receiverID,
      isTyping: text.length > 0,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      chatSocketService.sendTyping({
        senderID: currentUserId,
        receiverID,
        isTyping: false,
      });
    }, 2000);
  };

  // 7. Calculate seconds remaining for 2-minute rule
  const getSecondsRemaining = (createdAt: string | Date): number => {
    const elapsedSeconds = (Date.now() - new Date(createdAt).getTime()) / 1000;
    return Math.max(0, Math.floor(120 - elapsedSeconds));
  };

  return {
    mode,
    messages,
    inputMessage,
    setInputMessage: handleInputChange,
    sendMessage,
    deleteMessage,
    loading,
    isOtherTyping,
    isSocketConnected,
    currentUserId,
    currentUserMongoId: authState.userAuthReducer.userData?.user?._id,
    currentUserUid:
      authState.userAuthReducer.userData?.user?.uid ||
      authState.userAuthReducer.uid,
    receiverName,
    receiverImage,
    receiverLogin,
    receiverID,
    selectedMessage,
    setSelectedMessage,
    deleteModalVisible,
    setDeleteModalVisible,
    getSecondsRemaining,
    refreshMessages: fetchMessages,
    navigation,
  };
};
