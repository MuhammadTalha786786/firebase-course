import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
  ActivityIndicator,
  Share,
  Platform,
  Image,
} from 'react-native';
import Video from 'react-native-video';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Avatar} from 'native-base';
import {StyleGuide} from '../../../Utils/StyleGuide';
import {ReelItem} from '../../../services/reelsService';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface SingleReelItemProps {
  item: ReelItem;
  isActive: boolean;
  containerHeight: number;
  currentUserId: string;
  onToggleLike: (reelID: string) => void;
  onOpenComments: (reel: ReelItem) => void;
  onNavigateProfile: (userID: string) => void;
}

const formatNumber = (num?: number): string => {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const SingleReelItem: React.FC<SingleReelItemProps> = ({
  item,
  isActive,
  containerHeight,
  currentUserId,
  onToggleLike,
  onOpenComments,
  onNavigateProfile,
}) => {
  const [paused, setPaused] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [progressRatio, setProgressRatio] = useState<number>(0);
  const [expandedCaption, setExpandedCaption] = useState<boolean>(false);
  const [videoKey, setVideoKey] = useState<number>(0);

  // Double tap detection
  const lastTapRef = useRef<number>(0);

  // Animations
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const playIconOpacity = useRef(new Animated.Value(0)).current;
  const discRotation = useRef(new Animated.Value(0)).current;
  const discAnimation = useRef<Animated.CompositeAnimation | null>(null);

  // Reset states when reel becomes active or inactive
  useEffect(() => {
    if (isActive) {
      setPaused(false);
      startDiscAnimation();
    } else {
      setPaused(true);
      stopDiscAnimation();
    }
  }, [isActive]);

  const startDiscAnimation = () => {
    discRotation.setValue(0);
    discAnimation.current = Animated.loop(
      Animated.timing(discRotation, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    );
    discAnimation.current.start();
  };

  const stopDiscAnimation = () => {
    if (discAnimation.current) {
      discAnimation.current.stop();
    }
  };

  const spin = discRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const triggerHeartBurst = () => {
    heartScale.setValue(0);
    heartOpacity.setValue(1);

    Animated.parallel([
      Animated.spring(heartScale, {
        toValue: 1.3,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(heartOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const triggerPlayIcon = () => {
    playIconOpacity.setValue(1);
    Animated.sequence([
      Animated.delay(400),
      Animated.timing(playIconOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double tap -> Like
      triggerHeartBurst();
      if (!item.isLiked) {
        onToggleLike(item.reelID);
      }
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      setTimeout(() => {
        if (lastTapRef.current === now) {
          // Single tap -> Toggle Play / Pause
          setPaused(prev => {
            const next = !prev;
            if (next) {
              stopDiscAnimation();
            } else {
              startDiscAnimation();
            }
            triggerPlayIcon();
            return next;
          });
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Watch this reel by @${item.userName} on SocialBea: ${item.videoUrl}`,
        url: item.videoUrl,
      });
    } catch (e) {
      console.error('Error sharing:', e);
    }
  };

  const handleRetryVideo = () => {
    setHasError(false);
    setIsBuffering(true);
    setVideoKey(prev => prev + 1);
  };

  // Render caption with highlight for hashtags
  const renderCaption = (text = '') => {
    if (!text) return null;
    const words = text.split(' ');
    return (
      <Text style={styles.captionText} numberOfLines={expandedCaption ? undefined : 2}>
        {words.map((word, idx) => {
          if (word.startsWith('#')) {
            return (
              <Text key={idx} style={styles.hashtagText}>
                {word}{' '}
              </Text>
            );
          }
          return <Text key={idx}>{word} </Text>;
        })}
      </Text>
    );
  };

  return (
    <View style={[styles.container, {height: containerHeight}]}>
      {/* Background / Video Player */}
      <TouchableWithoutFeedback onPress={handleTap}>
        <View style={styles.videoContainer}>
          {isActive ? (
            <Video
              key={videoKey}
              source={{uri: item.videoUrl}}
              style={styles.fullVideo}
              resizeMode="cover"
              repeat={true}
              paused={paused || !isActive}
              playInBackground={false}
              playWhenInactive={false}
              ignoreSilentSwitch="ignore"
              // Optimized buffer config for weak/low internet connections
              bufferConfig={{
                minBufferMs: 2000,
                maxBufferMs: 8000,
                bufferForPlaybackMs: 1000,
                bufferForPlaybackAfterRebufferMs: 1500,
              }}
              onLoadStart={() => {
                setIsBuffering(true);
                setHasError(false);
              }}
              onLoad={() => {
                setIsBuffering(false);
                setHasError(false);
              }}
              onBuffer={({isBuffering: buffering}) => {
                setIsBuffering(buffering);
              }}
              onError={err => {
                console.warn('Video load error:', err);
                setIsBuffering(false);
                setHasError(true);
              }}
              onProgress={data => {
                if (data.seekableDuration > 0) {
                  setProgressRatio(data.currentTime / data.seekableDuration);
                }
              }}
            />
          ) : (
            // Idle placeholder when not active to save battery & network data
            <View style={styles.idlePlaceholder}>
              {item.thumbnailUrl ? (
                <Image
                  source={{uri: item.thumbnailUrl}}
                  style={styles.fullVideo}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.darkGradientBg}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                </View>
              )}
            </View>
          )}

          {/* Buffering Loader for slow internet */}
          {isActive && isBuffering && !hasError && (
            <View style={styles.bufferingOverlay} pointerEvents="none">
              <View style={styles.bufferingCircle}>
                <ActivityIndicator size="large" color={StyleGuide.color.primary} />
                <Text style={styles.bufferingText}>Loading video...</Text>
              </View>
            </View>
          )}

          {/* Error Recovery for connection loss / weak network */}
          {hasError && (
            <View style={styles.errorOverlay}>
              <Feather name="wifi-off" size={36} color="#EF4444" />
              <Text style={styles.errorTitle}>Connection Slow</Text>
              <Text style={styles.errorSubtitle}>
                Could not stream video. Please check your internet.
              </Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={handleRetryVideo}
                activeOpacity={0.8}>
                <Feather name="refresh-cw" size={16} color="#FFFFFF" />
                <Text style={styles.retryBtnText}>Tap to Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Animated Play/Pause Center Indicator */}
          <Animated.View
            style={[
              styles.centerPlayIndicator,
              {opacity: playIconOpacity},
            ]}
            pointerEvents="none">
            <View style={styles.playIconBackdrop}>
              <Ionicons
                name={paused ? 'pause' : 'play'}
                size={40}
                color="#FFFFFF"
              />
            </View>
          </Animated.View>

          {/* Double Tap Heart Burst Animation */}
          <Animated.View
            style={[
              styles.heartBurstContainer,
              {
                opacity: heartOpacity,
                transform: [{scale: heartScale}],
              },
            ]}
            pointerEvents="none">
            <Ionicons name="heart" size={100} color="#EF4444" />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>

      {/* Right Side Action Column (TikTok Style) */}
      <View style={styles.rightActionColumn}>
        {/* Creator Avatar */}
        <TouchableOpacity
          style={styles.avatarActionItem}
          activeOpacity={0.85}
          onPress={() => onNavigateProfile(item.userID)}>
          {item.userImage ? (
            <Avatar
              size="md"
              source={{uri: item.userImage}}
              style={styles.creatorAvatar}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>
                {item.userName ? item.userName[0].toUpperCase() : 'U'}
              </Text>
            </View>
          )}
          {item.userID !== currentUserId && (
            <View style={styles.followBadge}>
              <Ionicons name="add" size={14} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>

        {/* Like Button */}
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.7}
          onPress={() => onToggleLike(item.reelID)}>
          <View style={styles.actionIconCircle}>
            <Ionicons
              name={item.isLiked ? 'heart' : 'heart-outline'}
              size={32}
              color={item.isLiked ? '#EF4444' : '#FFFFFF'}
            />
          </View>
          <Text style={styles.actionCountText}>
            {formatNumber(item.likesCount)}
          </Text>
        </TouchableOpacity>

        {/* Comment Button */}
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.7}
          onPress={() => onOpenComments(item)}>
          <View style={styles.actionIconCircle}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={30}
              color="#FFFFFF"
            />
          </View>
          <Text style={styles.actionCountText}>
            {formatNumber(item.commentsCount)}
          </Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.7}
          onPress={handleShare}>
          <View style={styles.actionIconCircle}>
            <Ionicons name="paper-plane-outline" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.actionCountText}>Share</Text>
        </TouchableOpacity>

        {/* Spinning Vinyl Record Disc */}
        <View style={styles.discContainer}>
          <Animated.View
            style={[
              styles.discOuter,
              {transform: [{rotate: spin}]},
            ]}>
            <View style={styles.discInner}>
              {item.userImage ? (
                <Image
                  source={{uri: item.userImage}}
                  style={styles.discCenterImage}
                />
              ) : (
                <MaterialIcons name="audiotrack" size={16} color="#FFFFFF" />
              )}
            </View>
          </Animated.View>
        </View>
      </View>

      {/* Bottom Info Section (Creator, Caption, Audio Title) */}
      <View style={styles.bottomInfoContainer}>
        {/* Username & Verified Badge */}
        <TouchableOpacity
          style={styles.userNameRow}
          activeOpacity={0.8}
          onPress={() => onNavigateProfile(item.userID)}>
          <Text style={styles.userNameText}>@{item.userName}</Text>
          <MaterialIcons
            name="verified"
            size={16}
            color={StyleGuide.color.primary}
            style={{marginLeft: 4}}
          />
        </TouchableOpacity>

        {/* Caption */}
        {item.caption ? (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setExpandedCaption(!expandedCaption)}
            style={styles.captionWrapper}>
            {renderCaption(item.caption)}
            {item.caption.length > 80 && (
              <Text style={styles.moreToggleText}>
                {expandedCaption ? 'less' : 'more'}
              </Text>
            )}
          </TouchableOpacity>
        ) : null}

        {/* Audio Track Info */}
        <View style={styles.audioRow}>
          <Ionicons
            name="musical-notes"
            size={14}
            color="#FFFFFF"
            style={{marginRight: 6}}
          />
          <Text style={styles.audioText} numberOfLines={1}>
            {item.audioTitle || `Original Audio - ${item.userName}`}
          </Text>
        </View>
      </View>

      {/* Video Playback Progress Bar */}
      <View style={styles.progressBarBackground}>
        <View
          style={[
            styles.progressBarFill,
            {width: `${Math.min(100, Math.max(0, progressRatio * 100))}%`},
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    backgroundColor: '#000000',
    position: 'relative',
    overflow: 'hidden',
  },
  videoContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  fullVideo: {
    ...StyleSheet.absoluteFillObject,
  },
  idlePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkGradientBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bufferingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  bufferingCircle: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
  },
  bufferingText: {
    color: '#FFFFFF',
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 12,
    marginTop: 8,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 18,
    marginTop: 12,
  },
  errorSubtitle: {
    color: '#94A3B8',
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: StyleGuide.color.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 13,
    marginLeft: 8,
  },
  centerPlayIndicator: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconBackdrop: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartBurstContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightActionColumn: {
    position: 'absolute',
    right: 12,
    bottom: 40,
    alignItems: 'center',
    zIndex: 10,
  },
  avatarActionItem: {
    marginBottom: 18,
    alignItems: 'center',
    position: 'relative',
  },
  creatorAvatar: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: StyleGuide.color.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarFallbackText: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  followBadge: {
    position: 'absolute',
    bottom: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: StyleGuide.color.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtn: {
    alignItems: 'center',
    marginBottom: 18,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionCountText: {
    color: '#FFFFFF',
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 12,
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  discContainer: {
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discOuter: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discInner: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  discCenterImage: {
    width: '100%',
    height: '100%',
  },
  bottomInfoContainer: {
    position: 'absolute',
    left: 14,
    bottom: 30,
    right: 80,
    zIndex: 10,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  userNameText: {
    color: '#FFFFFF',
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  captionWrapper: {
    marginBottom: 8,
  },
  captionText: {
    color: '#F3F4F6',
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  hashtagText: {
    color: StyleGuide.color.primaryLight,
    fontFamily: StyleGuide.fontFamily.bold,
  },
  moreToggleText: {
    color: '#CBD5E1',
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 12,
    marginTop: 2,
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioText: {
    color: '#FFFFFF',
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  progressBarBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 20,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: StyleGuide.color.primary,
  },
});

export default SingleReelItem;
