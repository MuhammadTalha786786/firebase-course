import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Avatar} from 'native-base';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import {StyleGuide} from '../Utils/StyleGuide';
import {StackParamList} from '../Utils/routes';
import {reducerType} from '../Utils/types';
import ApiCall from '../services/services';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

type TabType = 'suggestions' | 'requests' | 'friends';

interface SuggestionUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  uid?: string;
  isLogin?: boolean;
  friendshipStatus: 'none' | 'sent' | 'received' | 'friends';
  friendshipId?: string;
}

interface FriendRequestItem {
  requestId: string;
  createdAt: string;
  user: {
    _id: string;
    name: string;
    email: string;
    image?: string;
    uid?: string;
    isLogin?: boolean;
  };
}

interface ConfirmedFriend {
  _id: string;
  friendshipId: string;
  name: string;
  email: string;
  image?: string;
  uid?: string;
  isLogin?: boolean;
  friendsSince?: string;
}

const FriendsScreen = () => {
  const dispatch = useDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<StackParamList>>();

  const authState = useSelector((state: reducerType) => state);
  const mode = authState.darkModeReducer.mode;
  const isDarkMode = Boolean(mode);
  const currentUser = authState.userAuthReducer.userData?.user;
  const currentUserId = currentUser?._id || authState.userAuthReducer.uid;

  const [activeTab, setActiveTab] = useState<TabType>('suggestions');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Data states
  const [suggestions, setSuggestions] = useState<SuggestionUser[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestItem[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequestItem[]>([]);
  const [friendsList, setFriendsList] = useState<ConfirmedFriend[]>([]);

  // Theme colors
  const bgColor = isDarkMode ? '#0B0F19' : '#F8FAFC';
  const cardBg = isDarkMode ? '#1E293B' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#0F172A';
  const subtextColor = isDarkMode ? '#94A3B8' : '#64748B';
  const borderColor = isDarkMode ? '#334155' : '#E2E8F0';
  const searchBg = isDarkMode ? '#1E293B' : '#F1F5F9';
  const activeTabBg = isDarkMode ? StyleGuide.color.primary : StyleGuide.color.primary;

  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, [currentUserId]),
  );

  const fetchAllData = async (isPullRefresh = false) => {
    if (isPullRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      await Promise.all([
        fetchSuggestions(),
        fetchRequests(),
        fetchFriends(),
      ]);
    } catch (err) {
      console.error('Error fetching friends data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const res = await ApiCall(
        'get',
        `api/friends/suggestions?userID=${currentUserId}`,
        null,
        dispatch,
        false,
      );
      if (res?.success && Array.isArray(res?.data)) {
        setSuggestions(res.data);
      }
    } catch (e) {
      console.error('fetchSuggestions error:', e);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await ApiCall(
        'get',
        `api/friends/requests?userID=${currentUserId}`,
        null,
        dispatch,
        false,
      );
      if (res?.success && res?.data) {
        setIncomingRequests(res.data.received || []);
        setOutgoingRequests(res.data.sent || []);
      }
    } catch (e) {
      console.error('fetchRequests error:', e);
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await ApiCall(
        'get',
        `api/friends?userID=${currentUserId}`,
        null,
        dispatch,
        false,
      );
      if (res?.success && Array.isArray(res?.data)) {
        setFriendsList(res.data);
      }
    } catch (e) {
      console.error('fetchFriends error:', e);
    }
  };

  // 1. Send Friend Request
  const handleSendRequest = async (targetUser: SuggestionUser) => {
    setActionLoadingId(targetUser._id);

    // Optimistic UI update
    setSuggestions(prev =>
      prev.map(u =>
        u._id === targetUser._id
          ? {...u, friendshipStatus: 'sent'}
          : u,
      ),
    );

    try {
      const res = await ApiCall(
        'post',
        'api/friends/request',
        {
          userID: currentUserId,
          recipientID: targetUser._id || targetUser.uid,
        },
        dispatch,
        false,
      );

      if (res?.success) {
        // Sync requests in background
        fetchRequests();
      } else {
        // Revert on failure
        setSuggestions(prev =>
          prev.map(u =>
            u._id === targetUser._id
              ? {...u, friendshipStatus: targetUser.friendshipStatus}
              : u,
          ),
        );
        Alert.alert('Error', res?.message || 'Failed to send friend request');
      }
    } catch (error) {
      setSuggestions(prev =>
        prev.map(u =>
          u._id === targetUser._id
            ? {...u, friendshipStatus: targetUser.friendshipStatus}
            : u,
        ),
      );
      Alert.alert('Error', 'Unable to send request. Please try again.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // 2. Cancel Sent Friend Request
  const handleCancelRequest = async (targetId: string, requestId?: string) => {
    setActionLoadingId(targetId);

    // Optimistic UI update
    setSuggestions(prev =>
      prev.map(u =>
        u._id === targetId ? {...u, friendshipStatus: 'none'} : u,
      ),
    );
    setOutgoingRequests(prev => prev.filter(r => r.user?._id !== targetId));

    try {
      const idToCancel = requestId || targetId;
      const res = await ApiCall(
        'delete',
        `api/friends/request/${idToCancel}/cancel`,
        {userID: currentUserId},
        dispatch,
        false,
      );

      if (!res?.success) {
        fetchSuggestions();
        fetchRequests();
        Alert.alert('Error', res?.message || 'Failed to cancel request');
      }
    } catch (error) {
      fetchSuggestions();
      fetchRequests();
      Alert.alert('Error', 'Unable to cancel request');
    } finally {
      setActionLoadingId(null);
    }
  };

  // 3. Accept Friend Request
  const handleAcceptRequest = async (request: FriendRequestItem) => {
    setActionLoadingId(request.requestId);

    // Optimistic UI update: Remove from requests and add to friends
    setIncomingRequests(prev =>
      prev.filter(r => r.requestId !== request.requestId),
    );
    if (request.user) {
      setFriendsList(prev => [
        {
          _id: request.user._id,
          friendshipId: request.requestId,
          name: request.user.name,
          email: request.user.email,
          image: request.user.image,
          uid: request.user.uid,
          isLogin: request.user.isLogin,
        },
        ...prev,
      ]);
    }

    try {
      const res = await ApiCall(
        'put',
        `api/friends/request/${request.requestId}/accept`,
        {userID: currentUserId},
        dispatch,
        false,
      );

      if (res?.success) {
        Alert.alert(
          'Friend Added! 🎉',
          `You and ${request.user?.name} are now friends! You can now chat directly.`,
          [
            {text: 'Later', style: 'cancel'},
            {
              text: 'Message Now',
              onPress: () => handleStartChat(request.user),
            },
          ],
        );
        fetchSuggestions();
      } else {
        fetchAllData();
        Alert.alert('Error', res?.message || 'Failed to accept request');
      }
    } catch (error) {
      fetchAllData();
      Alert.alert('Error', 'Unable to accept request');
    } finally {
      setActionLoadingId(null);
    }
  };

  // 4. Reject / Delete Friend Request
  const handleRejectRequest = async (request: FriendRequestItem) => {
    setActionLoadingId(request.requestId);

    // Optimistic UI update
    setIncomingRequests(prev =>
      prev.filter(r => r.requestId !== request.requestId),
    );

    try {
      const res = await ApiCall(
        'put',
        `api/friends/request/${request.requestId}/reject`,
        {userID: currentUserId},
        dispatch,
        false,
      );

      if (!res?.success) {
        fetchRequests();
        Alert.alert('Error', res?.message || 'Failed to decline request');
      }
    } catch (error) {
      fetchRequests();
      Alert.alert('Error', 'Unable to decline request');
    } finally {
      setActionLoadingId(null);
    }
  };

  // 5. Remove Friend (Unfriend)
  const handleRemoveFriend = (friend: ConfirmedFriend) => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${friend.name} from your friends list?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setFriendsList(prev => prev.filter(f => f._id !== friend._id));
            try {
              const res = await ApiCall(
                'delete',
                `api/friends/${friend._id}`,
                {userID: currentUserId},
                dispatch,
                false,
              );
              if (res?.success) {
                fetchSuggestions();
              } else {
                fetchFriends();
              }
            } catch (err) {
              fetchFriends();
            }
          },
        },
      ],
    );
  };

  // 6. Navigate to Chat
  const handleStartChat = (targetUser: any) => {
    navigation.navigate('ChatsScreen', {
      receiverName: targetUser.name,
      receiverImage: targetUser.image,
      receiverLogin: targetUser.isLogin,
      receiverID: targetUser.uid || targetUser._id,
    });
  };

  // 7. Filter items by search bar
  const getFilteredItems = () => {
    const q = searchQuery.toLowerCase().trim();
    if (activeTab === 'suggestions') {
      if (!q) return suggestions;
      return suggestions.filter(
        u =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q),
      );
    } else if (activeTab === 'requests') {
      if (!q) return incomingRequests;
      return incomingRequests.filter(
        r =>
          r.user?.name?.toLowerCase().includes(q) ||
          r.user?.email?.toLowerCase().includes(q),
      );
    } else {
      if (!q) return friendsList;
      return friendsList.filter(
        f =>
          f.name?.toLowerCase().includes(q) ||
          f.email?.toLowerCase().includes(q),
      );
    }
  };

  // Reusable avatar renderer
  const renderAvatar = (uri?: string, name?: string, size = 48, isOnline = false) => {
    const initial = name ? name.charAt(0).toUpperCase() : 'U';
    return (
      <View style={{position: 'relative'}}>
        {uri && uri.startsWith('http') ? (
          <Avatar
            size={`${size}px`}
            source={{uri}}
            style={{width: size, height: size, borderRadius: size / 2}}
          />
        ) : (
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
                {fontSize: size * 0.4, color: StyleGuide.color.primaryDark},
              ]}>
              {initial}
            </Text>
          </View>
        )}
        {isOnline && <View style={styles.onlineBadge} />}
      </View>
    );
  };

  // Render Suggested Friend Card
  const renderSuggestionCard = ({item}: {item: SuggestionUser}) => {
    const isSent = item.friendshipStatus === 'sent';
    const isReceived = item.friendshipStatus === 'received';
    const isBusy = actionLoadingId === item._id;

    return (
      <View style={[styles.card, {backgroundColor: cardBg, borderColor}]}>
        <View style={styles.cardHeader}>
          {renderAvatar(item.image, item.name, 50, item.isLogin)}
          <View style={styles.cardInfo}>
            <Text style={[styles.userName, {color: textColor}]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.userSubtitle, {color: subtextColor}]} numberOfLines={1}>
              {item.email}
            </Text>
            <View style={styles.suggestedBadge}>
              <Feather name="users" size={11} color={StyleGuide.color.primary} />
              <Text style={styles.suggestedBadgeText}>Suggested for you</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardActions}>
          {isSent ? (
            <View style={styles.sentRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.requestedBtn, {borderColor}]}
                disabled={true}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={16}
                  color={subtextColor}
                  style={{marginRight: 4}}
                />
                <Text style={[styles.requestedBtnText, {color: subtextColor}]}>
                  Requested
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.cancelBtn]}
                disabled={isBusy}
                onPress={() => handleCancelRequest(item._id, item.friendshipId)}>
                {isBusy ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : isReceived ? (
            <TouchableOpacity
              style={[styles.actionBtn, styles.primaryBtn]}
              onPress={() => setActiveTab('requests')}>
              <Text style={styles.primaryBtnText}>Respond to Request</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionBtn, styles.primaryBtn]}
              disabled={isBusy}
              activeOpacity={0.8}
              onPress={() => handleSendRequest(item)}>
              {isBusy ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather
                    name="user-plus"
                    size={16}
                    color="#FFFFFF"
                    style={{marginRight: 6}}
                  />
                  <Text style={styles.primaryBtnText}>Add Friend</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Render Incoming Request Card
  const renderRequestCard = ({item}: {item: FriendRequestItem}) => {
    const isBusy = actionLoadingId === item.requestId;

    return (
      <View style={[styles.card, {backgroundColor: cardBg, borderColor}]}>
        <View style={styles.cardHeader}>
          {renderAvatar(item.user?.image, item.user?.name, 50, item.user?.isLogin)}
          <View style={styles.cardInfo}>
            <Text style={[styles.userName, {color: textColor}]} numberOfLines={1}>
              {item.user?.name}
            </Text>
            <Text style={[styles.userSubtitle, {color: subtextColor}]} numberOfLines={1}>
              {item.user?.email}
            </Text>
            <Text style={[styles.timeAgoText, {color: subtextColor}]}>
              Sent {moment(item.createdAt).fromNow()}
            </Text>
          </View>
        </View>

        <View style={styles.requestButtonRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.primaryBtn, {flex: 1, marginRight: 8}]}
            disabled={isBusy}
            activeOpacity={0.8}
            onPress={() => handleAcceptRequest(item)}>
            {isBusy ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Feather
                  name="check"
                  size={16}
                  color="#FFFFFF"
                  style={{marginRight: 6}}
                />
                <Text style={styles.primaryBtnText}>Confirm</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.deleteBtn,
              {flex: 1, backgroundColor: isDarkMode ? '#334155' : '#E2E8F0'},
            ]}
            disabled={isBusy}
            activeOpacity={0.7}
            onPress={() => handleRejectRequest(item)}>
            <Text style={[styles.deleteBtnText, {color: textColor}]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render Confirmed Friend Card (With Chat Button)
  const renderFriendCard = ({item}: {item: ConfirmedFriend}) => {
    return (
      <View style={[styles.card, {backgroundColor: cardBg, borderColor}]}>
        <View style={styles.cardHeader}>
          {renderAvatar(item.image, item.name, 50, item.isLogin)}
          <View style={styles.cardInfo}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={[styles.userName, {color: textColor}]} numberOfLines={1}>
                {item.name}
              </Text>
              {item.isLogin && (
                <View style={styles.onlineBadgeTag}>
                  <Text style={styles.onlineBadgeTagText}>Active</Text>
                </View>
              )}
            </View>
            <Text style={[styles.userSubtitle, {color: subtextColor}]} numberOfLines={1}>
              {item.email}
            </Text>
            <Text style={[styles.timeAgoText, {color: subtextColor}]}>
              Friends since {moment(item.friendsSince || new Date()).format('MMM YYYY')}
            </Text>
          </View>
        </View>

        <View style={styles.friendActionRow}>
          {/* Message / Chat Button */}
          <TouchableOpacity
            style={[styles.actionBtn, styles.chatBtn]}
            activeOpacity={0.8}
            onPress={() => handleStartChat(item)}>
            <Ionicons
              name="chatbubble-ellipses"
              size={17}
              color="#FFFFFF"
              style={{marginRight: 6}}
            />
            <Text style={styles.chatBtnText}>Message</Text>
          </TouchableOpacity>

          {/* Remove / Options Button */}
          <TouchableOpacity
            style={[styles.removeIconBtn, {borderColor}]}
            activeOpacity={0.7}
            onPress={() => handleRemoveFriend(item)}>
            <Feather name="user-x" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading) return null;

    let icon = 'users';
    let title = 'No suggestions found';
    let subtitle = 'Check back later for new people to connect with!';

    if (activeTab === 'requests') {
      icon = 'inbox';
      title = 'No pending requests';
      subtitle = 'When people send you friend requests, they will appear here.';
    } else if (activeTab === 'friends') {
      icon = 'user-check';
      title = 'No friends yet';
      subtitle = 'Start adding friends from the Suggestions tab to chat with them!';
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIconCircle, {backgroundColor: isDarkMode ? '#1E293B' : '#EEF2FF'}]}>
          <Feather name={icon as any} size={36} color={StyleGuide.color.primary} />
        </View>
        <Text style={[styles.emptyTitle, {color: textColor}]}>{title}</Text>
        <Text style={[styles.emptySubtitle, {color: subtextColor}]}>{subtitle}</Text>
        {activeTab !== 'suggestions' && (
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => setActiveTab('suggestions')}>
            <Text style={styles.exploreBtnText}>Find Friends</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const pendingRequestCount = incomingRequests.length;
  const filteredData = getFilteredItems();

  return (
    <SafeAreaView style={[styles.safeArea, {backgroundColor: bgColor}]} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={bgColor}
      />

      {/* 1. Header Bar */}
      <View style={styles.topHeader}>
        <View>
          <Text style={[styles.screenTitle, {color: textColor}]}>Friends</Text>
          <Text style={[styles.screenSubtitle, {color: subtextColor}]}>
            Connect and chat with people
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.refreshIconBtn, {backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9'}]}
          activeOpacity={0.7}
          onPress={() => fetchAllData(true)}>
          <Feather name="refresh-cw" size={18} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* 2. Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, {backgroundColor: searchBg, borderColor}]}>
          <Feather name="search" size={18} color={subtextColor} style={styles.searchIcon} />
          <TextInput
            placeholder="Search by name or email..."
            placeholderTextColor={subtextColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, {color: textColor}]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={16} color={subtextColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 3. Segmented Navigation Tabs */}
      <View style={[styles.tabBar, {borderColor}]}>
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'suggestions' && [styles.activeTabItem, {backgroundColor: activeTabBg}],
          ]}
          onPress={() => setActiveTab('suggestions')}
          activeOpacity={0.8}>
          <Text
            style={[
              styles.tabText,
              {color: activeTab === 'suggestions' ? '#FFFFFF' : subtextColor},
            ]}>
            Suggestions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'requests' && [styles.activeTabItem, {backgroundColor: activeTabBg}],
          ]}
          onPress={() => setActiveTab('requests')}
          activeOpacity={0.8}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={[
                styles.tabText,
                {color: activeTab === 'requests' ? '#FFFFFF' : subtextColor},
              ]}>
              Requests
            </Text>
            {pendingRequestCount > 0 && (
              <View
                style={[
                  styles.badgePill,
                  {backgroundColor: activeTab === 'requests' ? '#FFFFFF' : '#EF4444'},
                ]}>
                <Text
                  style={[
                    styles.badgePillText,
                    {color: activeTab === 'requests' ? StyleGuide.color.primary : '#FFFFFF'},
                  ]}>
                  {pendingRequestCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'friends' && [styles.activeTabItem, {backgroundColor: activeTabBg}],
          ]}
          onPress={() => setActiveTab('friends')}
          activeOpacity={0.8}>
          <Text
            style={[
              styles.tabText,
              {color: activeTab === 'friends' ? '#FFFFFF' : subtextColor},
            ]}>
            My Friends ({friendsList.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* 4. Content List */}
      {loading && !refreshing ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={StyleGuide.color.primary} />
          <Text style={[styles.loadingText, {color: subtextColor}]}>Loading friends...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredData as any}
          renderItem={({item}) => {
            if (activeTab === 'suggestions') {
              return renderSuggestionCard({item: item as SuggestionUser});
            } else if (activeTab === 'requests') {
              return renderRequestCard({item: item as FriendRequestItem});
            } else {
              return renderFriendCard({item: item as ConfirmedFriend});
            }
          }}
          keyExtractor={(item: any, idx) =>
            item._id || item.requestId || idx.toString()
          }
          contentContainerStyle={[
            styles.listContent,
            filteredData.length === 0 && {flexGrow: 1, justifyContent: 'center'},
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchAllData(true)}
              colors={[StyleGuide.color.primary]}
              tintColor={StyleGuide.color.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  screenTitle: {
    fontSize: 24,
    fontFamily: StyleGuide.fontFamily.bold,
  },
  screenSubtitle: {
    fontSize: 13,
    fontFamily: StyleGuide.fontFamily.regular,
    marginTop: 2,
  },
  refreshIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: StyleGuide.fontFamily.regular,
    paddingVertical: 0,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    padding: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    marginBottom: 12,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  activeTabItem: {
    shadowColor: StyleGuide.color.primary,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 12.5,
    fontFamily: StyleGuide.fontFamily.bold,
  },
  badgePill: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  badgePillText: {
    fontSize: 10,
    fontFamily: StyleGuide.fontFamily.bold,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontFamily: StyleGuide.fontFamily.bold,
  },
  userSubtitle: {
    fontSize: 12.5,
    fontFamily: StyleGuide.fontFamily.regular,
    marginTop: 2,
  },
  timeAgoText: {
    fontSize: 11,
    fontFamily: StyleGuide.fontFamily.regular,
    marginTop: 3,
  },
  suggestedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  suggestedBadgeText: {
    fontSize: 11,
    fontFamily: StyleGuide.fontFamily.medium,
    color: StyleGuide.color.primary,
    marginLeft: 4,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  onlineBadgeTag: {
    marginLeft: 8,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  onlineBadgeTagText: {
    color: '#15803D',
    fontSize: 10,
    fontFamily: StyleGuide.fontFamily.bold,
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontFamily: StyleGuide.fontFamily.bold,
  },
  cardActions: {
    marginTop: 12,
  },
  sentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  friendActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  primaryBtn: {
    backgroundColor: StyleGuide.color.primary,
    flex: 1,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: StyleGuide.fontFamily.bold,
  },
  requestedBtn: {
    flex: 2,
    borderWidth: 1,
    backgroundColor: 'transparent',
    marginRight: 8,
  },
  requestedBtnText: {
    fontSize: 12.5,
    fontFamily: StyleGuide.fontFamily.medium,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#FEE2E2',
  },
  cancelBtnText: {
    color: '#EF4444',
    fontSize: 12.5,
    fontFamily: StyleGuide.fontFamily.bold,
  },
  deleteBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  deleteBtnText: {
    fontSize: 13,
    fontFamily: StyleGuide.fontFamily.bold,
  },
  chatBtn: {
    backgroundColor: StyleGuide.color.primary,
    flex: 1,
    marginRight: 8,
  },
  chatBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: StyleGuide.fontFamily.bold,
  },
  removeIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontFamily: StyleGuide.fontFamily.regular,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: StyleGuide.fontFamily.bold,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: StyleGuide.fontFamily.regular,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  exploreBtn: {
    backgroundColor: StyleGuide.color.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: StyleGuide.fontFamily.bold,
  },
});

export default FriendsScreen;
