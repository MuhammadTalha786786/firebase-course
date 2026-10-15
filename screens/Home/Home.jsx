import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StyleGuide} from '../../Utils/StyleGuide';
import Feather from 'react-native-vector-icons/Feather';
import CardUI from '../Post/CardUI';
import {useNavigation} from '@react-navigation/native';
import {PostFeedShimmer} from '../components/AppShimmers';
import {useHome} from './useHome';

const Home = () => {
  const {
    isPostLiked,
    data,
    setIsPostLiked,
    getData,
    mode,
    getPostData,
    getDataofUserPost,
  } = useHome();

  const navigation = useNavigation();
  const isDarkMode = Boolean(mode);
  const bgColor = isDarkMode ? '#000000' : '#FFFFFF';
  const textColor = isDarkMode ? '#F5F5F5' : '#262626';
  const subtextColor = isDarkMode ? '#A8A8A8' : '#737373';

  const renderEmptyState = () => {
    if (getData) return null;
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Feather name="feather" size={32} color={StyleGuide.color.primary} />
        </View>
        <Text style={[styles.emptyTitle, {color: textColor}]}>
          Your Feed is Quiet
        </Text>
        <Text style={[styles.emptySubtitle, {color: subtextColor}]}>
          Be the first to share a photo or update with your friends!
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate(' ')}>
          <Feather name="plus" size={18} color="#FFFFFF" style={{marginRight: 6}} />
          <Text style={styles.emptyButtonText}>Create a Post</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#0F172A' : '#FFFFFF'}
      />
      <SafeAreaView
        style={[styles.safeArea, {backgroundColor: bgColor}]}
        edges={['left', 'right']}>
        {getData && (!data || data.length === 0) ? (
          <PostFeedShimmer isDarkMode={isDarkMode} count={3} />
        ) : (
          <FlatList
            data={data}
            contentContainerStyle={styles.listContent}
            renderItem={({item}) => (
              <CardUI
                item={item}
                mode={mode}
                setIsPostLiked={setIsPostLiked}
                isPostLiked={isPostLiked}
                postData={getPostData}
                PostedUser={item.userID}
                getDataofUserPost={getDataofUserPost}
              />
            )}
            onRefresh={getPostData}
            refreshing={getData}
            colors={[StyleGuide.color.primary]}
            tintColor={StyleGuide.color.primary}
            keyExtractor={item => item.postID || Math.random().toString()}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
          />
        )}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingTop: 0,
    paddingBottom: 24,
    paddingHorizontal: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: StyleGuide.color.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 20,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: StyleGuide.color.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: StyleGuide.color.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 14,
  },
});

export default Home;
