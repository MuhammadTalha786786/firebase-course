import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface ShimmerProps {
  isDarkMode?: boolean;
  count?: number;
}

// 1. Shimmer for Friends / Users list (FriendsScreen)
export const FriendCardShimmer: React.FC<ShimmerProps> = ({
  isDarkMode = false,
  count = 6,
}) => {
  const bg = isDarkMode ? '#1E293B' : '#E2E8F0';
  const highlight = isDarkMode ? '#334155' : '#F1F5F9';
  const cardBg = isDarkMode ? '#111827' : '#FFFFFF';

  return (
    <View style={styles.container}>
      {Array.from({length: count}).map((_, i) => (
        <View
          key={i}
          style={[
            styles.friendCard,
            {
              backgroundColor: cardBg,
              borderColor: isDarkMode ? '#1F2937' : '#F1F5F9',
            },
          ]}>
          <SkeletonPlaceholder backgroundColor={bg} highlightColor={highlight}>
            <View style={styles.friendRow}>
              {/* Avatar circle */}
              <View style={styles.avatarCircle} />

              {/* Name & email lines */}
              <View style={styles.friendInfo}>
                <View style={styles.nameLine} />
                <View style={styles.subLine} />
              </View>

              {/* Action button pill */}
              <View style={styles.actionBtnPill} />
            </View>
          </SkeletonPlaceholder>
        </View>
      ))}
    </View>
  );
};

// 2. Shimmer for Feed Posts (Home Screen)
export const PostFeedShimmer: React.FC<ShimmerProps> = ({
  isDarkMode = false,
  count = 2,
}) => {
  const bg = isDarkMode ? '#1E293B' : '#E2E8F0';
  const highlight = isDarkMode ? '#334155' : '#F1F5F9';
  const cardBg = isDarkMode ? '#111827' : '#FFFFFF';

  return (
    <View style={styles.container}>
      {Array.from({length: count}).map((_, i) => (
        <View
          key={i}
          style={[
            styles.postCard,
            {
              backgroundColor: cardBg,
              borderColor: isDarkMode ? '#1F2937' : '#F1F5F9',
            },
          ]}>
          <SkeletonPlaceholder backgroundColor={bg} highlightColor={highlight}>
            <View>
              {/* Post Header */}
              <View style={styles.postHeader}>
                <View style={styles.postAvatar} />
                <View style={styles.postHeaderText}>
                  <View style={{width: 130, height: 14, borderRadius: 4}} />
                  <View
                    style={{
                      width: 80,
                      height: 10,
                      borderRadius: 4,
                      marginTop: 6,
                    }}
                  />
                </View>
              </View>

              {/* Post Image Placeholder */}
              <View style={styles.postImage} />

              {/* Actions row */}
              <View style={styles.postActions}>
                <View style={styles.actionCircle} />
                <View style={styles.actionCircle} />
                <View style={styles.actionCircle} />
              </View>

              {/* Post Caption lines */}
              <View style={{paddingHorizontal: 12, paddingBottom: 14}}>
                <View style={{width: '75%', height: 12, borderRadius: 4}} />
                <View
                  style={{
                    width: '45%',
                    height: 12,
                    borderRadius: 4,
                    marginTop: 6,
                  }}
                />
              </View>
            </View>
          </SkeletonPlaceholder>
        </View>
      ))}
    </View>
  );
};

// 3. Shimmer for Chat Screen messages
export const ChatScreenShimmer: React.FC<ShimmerProps> = ({
  isDarkMode = false,
}) => {
  const bg = isDarkMode ? '#1E293B' : '#E2E8F0';
  const highlight = isDarkMode ? '#334155' : '#F1F5F9';

  return (
    <View style={[styles.container, {paddingHorizontal: 14, paddingVertical: 10}]}>
      <SkeletonPlaceholder backgroundColor={bg} highlightColor={highlight}>
        <View>
          {/* Receiver Bubble */}
          <View style={{flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12}}>
            <View style={{width: 28, height: 28, borderRadius: 14, marginRight: 8}} />
            <View style={{width: 190, height: 46, borderRadius: 18, borderBottomLeftRadius: 4}} />
          </View>

          {/* Sender Bubble */}
          <View style={{alignItems: 'flex-end', marginBottom: 12}}>
            <View style={{width: 230, height: 52, borderRadius: 18, borderBottomRightRadius: 4}} />
          </View>

          {/* Receiver Bubble */}
          <View style={{flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12}}>
            <View style={{width: 28, height: 28, borderRadius: 14, marginRight: 8}} />
            <View style={{width: 140, height: 38, borderRadius: 18, borderBottomLeftRadius: 4}} />
          </View>

          {/* Sender Bubble */}
          <View style={{alignItems: 'flex-end', marginBottom: 12}}>
            <View style={{width: 180, height: 44, borderRadius: 18, borderBottomRightRadius: 4}} />
          </View>

          {/* Receiver Bubble */}
          <View style={{flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12}}>
            <View style={{width: 28, height: 28, borderRadius: 14, marginRight: 8}} />
            <View style={{width: 220, height: 50, borderRadius: 18, borderBottomLeftRadius: 4}} />
          </View>
        </View>
      </SkeletonPlaceholder>
    </View>
  );
};

// 4. Shimmer for Notifications
export const NotificationShimmer: React.FC<ShimmerProps> = ({
  isDarkMode = false,
  count = 6,
}) => {
  const bg = isDarkMode ? '#1E293B' : '#E2E8F0';
  const highlight = isDarkMode ? '#334155' : '#F1F5F9';

  return (
    <View style={styles.container}>
      {Array.from({length: count}).map((_, i) => (
        <View key={i} style={styles.notifRow}>
          <SkeletonPlaceholder backgroundColor={bg} highlightColor={highlight}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={{width: 44, height: 44, borderRadius: 22}} />
              <View style={{marginLeft: 14, flex: 1}}>
                <View style={{width: '70%', height: 14, borderRadius: 4}} />
                <View style={{width: '40%', height: 11, borderRadius: 4, marginTop: 6}} />
              </View>
              <View style={{width: 45, height: 12, borderRadius: 4}} />
            </View>
          </SkeletonPlaceholder>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
  },
  friendCard: {
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 14,
  },
  nameLine: {
    width: 140,
    height: 15,
    borderRadius: 4,
  },
  subLine: {
    width: 95,
    height: 11,
    borderRadius: 4,
    marginTop: 6,
  },
  actionBtnPill: {
    width: 85,
    height: 34,
    borderRadius: 17,
  },
  postCard: {
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  postHeaderText: {
    marginLeft: 12,
  },
  postImage: {
    width: SCREEN_WIDTH - 24,
    height: 260,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  actionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 14,
  },
  notifRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)',
  },
});
