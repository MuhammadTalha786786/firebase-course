import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Platform,
  ViewToken,
} from 'react-native';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {StyleGuide} from '../../Utils/StyleGuide';
import {reducerType} from '../../Utils/types';
import SingleReelItem from './components/SingleReelItem';
import ReelCommentsModal from './components/ReelCommentsModal';
import CreateReelModal from './components/CreateReelModal';
import {
  getReelsApi,
  toggleLikeReelApi,
  incrementReelViewApi,
  ReelItem,
} from '../../services/reelsService';

const {height: WINDOW_HEIGHT, width: SCREEN_WIDTH} = Dimensions.get('window');

const ReelsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const isScreenFocused = useIsFocused();

  const authState = useSelector((state: reducerType) => state);
  const userData = authState.userAuthReducer.userData?.user;
  const currentUserId =
    userData?._id || userData?.uid || authState.userAuthReducer.uid || '';
  const currentUserName = userData?.name || 'User';
  const currentUserImage = userData?.image || '';
  const mode = authState.darkModeReducer.mode;
  const isDarkMode = Boolean(mode);

  // Layout height measured dynamically
  const [containerHeight, setContainerHeight] = useState<number>(WINDOW_HEIGHT);

  // Reels list state
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [networkError, setNetworkError] = useState<boolean>(false);

  // Modals state
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [commentsModalVisible, setCommentsModalVisible] =
    useState<boolean>(false);
  const [selectedReelForComments, setSelectedReelForComments] =
    useState<ReelItem | null>(null);

  const flatListRef = useRef<FlatList>(null);

  // Initial fetch
  useEffect(() => {
    fetchReels(1, true);
  }, []);

  const fetchReels = async (targetPage = 1, isInitial = false) => {
    if (isInitial) {
      setLoading(true);
      setNetworkError(false);
    }

    try {
      const res = await getReelsApi(targetPage, 10, currentUserId);

      if (res?.success && Array.isArray(res?.data)) {
        if (targetPage === 1) {
          setReels(res.data);
        } else {
          setReels(prev => {
            // Deduplicate by reelID
            const existingIds = new Set(prev.map(r => r.reelID));
            const newItems = res.data.filter(
              (r: ReelItem) => !existingIds.has(r.reelID)
            );
            return [...prev, ...newItems];
          });
        }
        setHasMore(Boolean(res.hasMore));
        setPage(targetPage);
        setNetworkError(false);
      } else {
        if (targetPage === 1) {
          setNetworkError(true);
        }
      }
    } catch (e) {
      console.error('Fetch reels failed:', e);
      if (targetPage === 1) {
        setNetworkError(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReels(1, false);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      fetchReels(page + 1, false);
    }
  };

  // Viewability changed handler
  const onViewableItemsChanged = useRef(
    ({viewableItems}: {viewableItems: ViewToken[]}) => {
      if (viewableItems && viewableItems.length > 0) {
        const firstVisible = viewableItems[0];
        if (
          typeof firstVisible.index === 'number' &&
          firstVisible.index !== activeIndex
        ) {
          setActiveIndex(firstVisible.index);

          // Track view count for active reel
          const visibleReel = firstVisible.item as ReelItem;
          if (visibleReel?.reelID) {
            incrementReelViewApi(visibleReel.reelID);
          }
        }
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 75,
  }).current;

  // Toggle Like handler (Optimistic)
  const handleToggleLike = async (reelID: string) => {
    if (!currentUserId) return;

    setReels(prev =>
      prev.map(r => {
        if (r.reelID === reelID) {
          const nextLiked = !r.isLiked;
          const nextCount = nextLiked
            ? (r.likesCount || 0) + 1
            : Math.max(0, (r.likesCount || 0) - 1);
          return {
            ...r,
            isLiked: nextLiked,
            likesCount: nextCount,
          };
        }
        return r;
      })
    );

    // Call API
    await toggleLikeReelApi(reelID, currentUserId);
  };

  // Comments handlers
  const handleOpenComments = (reel: ReelItem) => {
    setSelectedReelForComments(reel);
    setCommentsModalVisible(true);
  };

  const handleCommentsCountChange = (newCount: number) => {
    if (selectedReelForComments) {
      const reelID = selectedReelForComments.reelID;
      setReels(prev =>
        prev.map(r => (r.reelID === reelID ? {...r, commentsCount: newCount} : r))
      );
    }
  };

  // Create Reel success handler
  const handleReelCreated = (newReel: ReelItem) => {
    setReels(prev => [newReel, ...prev]);
    setActiveIndex(0);
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({index: 0, animated: true});
    }, 200);
  };

  const handleNavigateProfile = (userID: string) => {
    if (userID === currentUserId) {
      navigation.navigate('Profile');
    } else {
      navigation.navigate('UserProfile', {id: userID});
    }
  };

  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View style={[styles.emptyContainer, {height: containerHeight}]}>
        <View style={styles.emptyIconCircle}>
          <MaterialCommunityIcons
            name="video-vintage"
            size={48}
            color={StyleGuide.color.primary}
          />
        </View>
        <Text style={styles.emptyTitle}>No Reels Yet</Text>
        <Text style={styles.emptySubtitle}>
          Be the trendsetter! Share your very first short video reel with the community.
        </Text>
        <TouchableOpacity
          style={styles.emptyCreateBtn}
          activeOpacity={0.85}
          onPress={() => setCreateModalVisible(true)}>
          <Feather name="plus" size={18} color="#FFFFFF" style={{marginRight: 6}} />
          <Text style={styles.emptyCreateBtnText}>Create First Reel</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View
      style={styles.container}
      onLayout={e => {
        const {height} = e.nativeEvent.layout;
        if (height > 0) {
          setContainerHeight(height);
        }
      }}>
      <StatusBar
        barStyle="light-content"
        translucent={true}
        backgroundColor="transparent"
      />

      {/* Floating Top Header Bar */}
      <View style={styles.topHeaderBar} pointerEvents="box-none">
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitleText}>Reels</Text>
          <View style={styles.headerDot} />
        </View>

        {/* In-Screen Create Reel CTA Button */}
        <TouchableOpacity
          style={styles.createReelHeaderBtn}
          activeOpacity={0.8}
          onPress={() => setCreateModalVisible(true)}>
          <Feather name="camera" size={16} color="#FFFFFF" />
          <Text style={styles.createReelHeaderBtnText}>+ Create</Text>
        </TouchableOpacity>
      </View>

      {/* Initial Loading State */}
      {loading && reels.length === 0 ? (
        <View style={[styles.centerLoading, {height: containerHeight}]}>
          <ActivityIndicator size="large" color={StyleGuide.color.primary} />
          <Text style={styles.loadingText}>Loading Reels...</Text>
        </View>
      ) : networkError && reels.length === 0 ? (
        /* Network Error State */
        <View style={[styles.centerLoading, {height: containerHeight}]}>
          <Feather name="wifi-off" size={42} color="#EF4444" />
          <Text style={styles.errorStateTitle}>Could not load reels</Text>
          <Text style={styles.errorStateDesc}>
            Please check your internet connection and try again.
          </Text>
          <TouchableOpacity
            style={styles.retryFetchBtn}
            onPress={() => fetchReels(1, true)}>
            <Feather name="refresh-cw" size={16} color="#FFFFFF" />
            <Text style={styles.retryFetchBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Fullscreen Vertical Paging FlatList */
        <FlatList
          ref={flatListRef}
          data={reels}
          keyExtractor={item => item.reelID}
          renderItem={({item, index}) => (
            <SingleReelItem
              item={item}
              isActive={isScreenFocused && index === activeIndex}
              containerHeight={containerHeight}
              currentUserId={currentUserId}
              onToggleLike={handleToggleLike}
              onOpenComments={handleOpenComments}
              onNavigateProfile={handleNavigateProfile}
            />
          )}
          pagingEnabled={true}
          snapToInterval={containerHeight}
          snapToAlignment="start"
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmptyState}
          // Memory and low-bandwidth optimizations
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={3}
          removeClippedSubviews={Platform.OS === 'android'}
          getItemLayout={(_, index) => ({
            length: containerHeight,
            offset: containerHeight * index,
            index,
          })}
        />
      )}

      {/* In-Screen Comments Drawer / Modal */}
      {selectedReelForComments && (
        <ReelCommentsModal
          visible={commentsModalVisible}
          onClose={() => setCommentsModalVisible(false)}
          reelID={selectedReelForComments.reelID}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          currentUserImage={currentUserImage}
          isDarkMode={isDarkMode}
          onCommentsCountChange={handleCommentsCountChange}
        />
      )}

      {/* In-Screen Create Reel Modal */}
      <CreateReelModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onReelCreated={handleReelCreated}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        currentUserImage={currentUserImage}
        isDarkMode={isDarkMode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topHeaderBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 48 : 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 30,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitleText: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 4,
  },
  headerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: StyleGuide.color.primary,
    marginLeft: 4,
    marginTop: 2,
  },
  createReelHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: StyleGuide.color.primary,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  createReelHeaderBtnText: {
    color: '#FFFFFF',
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 13,
    marginLeft: 5,
  },
  centerLoading: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  loadingText: {
    color: '#CBD5E1',
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 14,
    marginTop: 12,
  },
  errorStateTitle: {
    color: '#FFFFFF',
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 18,
    marginTop: 12,
  },
  errorStateDesc: {
    color: '#94A3B8',
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18,
  },
  retryFetchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: StyleGuide.color.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryFetchBtnText: {
    color: '#FFFFFF',
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 13,
    marginLeft: 6,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#000000',
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: StyleGuide.color.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 22,
    shadowColor: StyleGuide.color.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyCreateBtnText: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});

export default ReelsScreen;
