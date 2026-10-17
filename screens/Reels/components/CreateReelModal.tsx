import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ImagePicker from 'react-native-image-crop-picker';
import Video from 'react-native-video';
import {StyleGuide} from '../../../Utils/StyleGuide';
import {uploadFileToSupabase} from '../../../services/supabaseStorage';
import {createReelApi, ReelItem} from '../../../services/reelsService';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

interface CreateReelModalProps {
  visible: boolean;
  onClose: () => void;
  onReelCreated: (newReel: ReelItem) => void;
  currentUserId: string;
  currentUserName: string;
  currentUserImage?: string;
  isDarkMode?: boolean;
}

const TRENDING_TAGS = ['viral', 'trending', 'reels', 'fyp', 'comedy', 'music', 'lifestyle'];

const CreateReelModal: React.FC<CreateReelModalProps> = ({
  visible,
  onClose,
  onReelCreated,
  currentUserId,
  currentUserName,
  currentUserImage,
  isDarkMode = true,
}) => {
  const [videoUri, setVideoUri] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [caption, setCaption] = useState<string>('');
  const [audioTitle, setAudioTitle] = useState<string>(
    `Original Audio - ${currentUserName || 'User'}`
  );
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [previewPaused, setPreviewPaused] = useState<boolean>(false);

  const resetForm = () => {
    setVideoUri('');
    setVideoDuration(0);
    setCaption('');
    setAudioTitle(`Original Audio - ${currentUserName || 'User'}`);
    setUploading(false);
    setUploadStatus('');
    setPreviewPaused(false);
  };

  const handleClose = () => {
    if (uploading) {
      Alert.alert(
        'Upload in Progress',
        'Your reel is currently uploading. Are you sure you want to cancel?',
        [
          {text: 'Keep Uploading', style: 'cancel'},
          {
            text: 'Cancel Upload',
            style: 'destructive',
            onPress: () => {
              resetForm();
              onClose();
            },
          },
        ]
      );
      return;
    }
    resetForm();
    onClose();
  };

  const pickVideo = async (source: 'camera' | 'gallery') => {
    try {
      const pickerMethod =
        source === 'camera' ? ImagePicker.openCamera : ImagePicker.openPicker;

      const result: any = await pickerMethod({
        mediaType: 'video',
      });

      if (result && result.path) {
        setVideoUri(result.path);
        if (result.duration) {
          // Duration in seconds or milliseconds
          const durSec =
            result.duration > 1000
              ? Math.round(result.duration / 1000)
              : Math.round(result.duration);
          setVideoDuration(durSec);
        }
      }
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        console.error('Error selecting video:', error);
        Alert.alert(
          'Error',
          error?.message || 'Could not access camera or gallery'
        );
      }
    }
  };

  const appendTag = (tag: string) => {
    const formattedTag = `#${tag}`;
    if (!caption.includes(formattedTag)) {
      setCaption(prev => (prev ? `${prev} ${formattedTag}` : formattedTag));
    }
  };

  const handlePublishReel = async () => {
    if (!videoUri) {
      Alert.alert('Video Required', 'Please record or select a video first.');
      return;
    }

    if (!currentUserId) {
      Alert.alert('Login Required', 'You must be logged in to post reels.');
      return;
    }

    setUploading(true);
    setUploadStatus('Uploading video to cloud...');

    try {
      // 1. Upload video to Supabase Storage
      const uploadedVideoUrl = await uploadFileToSupabase(videoUri, {
        bucket: 'social-bea',
        folder: 'profile_images', // Uses verified public folder
      });

      setUploadStatus('Publishing your reel...');

      // 2. Call backend API to create reel
      const payload = {
        userID: currentUserId,
        userName: currentUserName || 'SocialBea User',
        userImage: currentUserImage || '',
        videoUrl: uploadedVideoUrl,
        thumbnailUrl: '', // Fallback to video frame
        caption: caption.trim(),
        audioTitle: audioTitle.trim() || `Original Audio - ${currentUserName || 'User'}`,
        duration: videoDuration,
      };

      const res = await createReelApi(payload);

      if (res?.success && res?.data) {
        Alert.alert('Success 🎉', 'Your reel is now live!');
        onReelCreated(res.data);
        resetForm();
        onClose();
      } else {
        throw new Error(res?.message || 'Failed to save reel');
      }
    } catch (error: any) {
      console.error('Failed to create reel:', error);
      Alert.alert(
        'Upload Failed',
        error?.message ||
          'Failed to upload reel. Please check your internet connection and try again.'
      );
    } finally {
      setUploading(false);
      setUploadStatus('');
    }
  };

  const bgColor = isDarkMode ? '#0F172A' : '#FFFFFF';
  const cardBg = isDarkMode ? '#1E293B' : '#F8FAFC';
  const textColor = isDarkMode ? '#F8FAFC' : '#0F172A';
  const subtextColor = isDarkMode ? '#94A3B8' : '#64748B';
  const borderColor = isDarkMode ? '#334155' : '#E2E8F0';
  const inputBg = isDarkMode ? '#1E293B' : '#F1F5F9';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}>
      <View style={[styles.container, {backgroundColor: bgColor}]}>
        {/* Top Navigation Bar */}
        <View style={[styles.topBar, {borderBottomColor: borderColor}]}>
          <TouchableOpacity
            onPress={handleClose}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.topBarTitle, {color: textColor}]}>Create Reel</Text>
          <TouchableOpacity
            onPress={handlePublishReel}
            disabled={!videoUri || uploading}
            style={[
              styles.publishBtn,
              {
                backgroundColor:
                  videoUri && !uploading
                    ? StyleGuide.color.primary
                    : isDarkMode
                    ? '#334155'
                    : '#CBD5E1',
              },
            ]}>
            {uploading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.publishBtnText}>Publish</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Video Preview / Selection Section */}
          {videoUri ? (
            <View style={styles.previewContainer}>
              <View style={[styles.videoWrapper, {backgroundColor: '#000000'}]}>
                <Video
                  source={{uri: videoUri}}
                  style={styles.previewVideo}
                  resizeMode="cover"
                  repeat={true}
                  paused={previewPaused}
                  muted={false}
                />

                {/* Play/Pause Overlay Button */}
                <TouchableOpacity
                  style={styles.previewPlayToggle}
                  onPress={() => setPreviewPaused(!previewPaused)}
                  activeOpacity={0.8}>
                  {previewPaused && (
                    <View style={styles.playIconCircle}>
                      <Ionicons name="play" size={28} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Duration Badge */}
                {videoDuration > 0 && (
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationBadgeText}>
                      {videoDuration}s
                    </Text>
                  </View>
                )}

                {/* Change Video Action */}
                <TouchableOpacity
                  style={styles.changeVideoBtn}
                  onPress={() => setVideoUri('')}>
                  <Feather name="refresh-cw" size={14} color="#FFFFFF" />
                  <Text style={styles.changeVideoText}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={[styles.selectPromptCard, {backgroundColor: cardBg, borderColor}]}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons
                  name="video-plus-outline"
                  size={42}
                  color={StyleGuide.color.primary}
                />
              </View>
              <Text style={[styles.selectPromptTitle, {color: textColor}]}>
                Choose your video
              </Text>
              <Text style={[styles.selectPromptDesc, {color: subtextColor}]}>
                Create an engaging vertical short video to share with friends and followers.
              </Text>

              <View style={styles.pickerButtonsRow}>
                <TouchableOpacity
                  style={[styles.pickerActionBtn, {backgroundColor: StyleGuide.color.primary}]}
                  activeOpacity={0.8}
                  onPress={() => pickVideo('camera')}>
                  <Feather name="camera" size={18} color="#FFFFFF" />
                  <Text style={styles.pickerActionBtnText}>Record Camera</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.pickerActionBtn,
                    {
                      backgroundColor: isDarkMode ? '#334155' : '#E2E8F0',
                      marginLeft: 12,
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => pickVideo('gallery')}>
                  <Feather
                    name="image"
                    size={18}
                    color={isDarkMode ? '#FFFFFF' : '#0F172A'}
                  />
                  <Text
                    style={[
                      styles.pickerActionBtnText,
                      {color: isDarkMode ? '#FFFFFF' : '#0F172A'},
                    ]}>
                    Pick Gallery
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* Caption */}
            <Text style={[styles.fieldLabel, {color: textColor}]}>
              Caption & Hashtags
            </Text>
            <View
              style={[
                styles.captionInputWrapper,
                {backgroundColor: inputBg, borderColor},
              ]}>
              <TextInput
                style={[styles.captionInput, {color: textColor}]}
                placeholder="Write a catchy caption... e.g. Amazing dance moves! #viral #fyp"
                placeholderTextColor={subtextColor}
                value={caption}
                onChangeText={setCaption}
                multiline={true}
                numberOfLines={3}
                maxLength={300}
              />
              <Text style={[styles.charCount, {color: subtextColor}]}>
                {caption.length}/300
              </Text>
            </View>

            {/* Trending tags chips */}
            <Text style={[styles.chipsHeading, {color: subtextColor}]}>
              Popular Hashtags:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagChipsRow}>
              {TRENDING_TAGS.map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tagChip,
                    {
                      backgroundColor: caption.includes(`#${tag}`)
                        ? StyleGuide.color.primaryLight
                        : cardBg,
                      borderColor: caption.includes(`#${tag}`)
                        ? StyleGuide.color.primary
                        : borderColor,
                    },
                  ]}
                  onPress={() => appendTag(tag)}>
                  <Text
                    style={[
                      styles.tagChipText,
                      {
                        color: caption.includes(`#${tag}`)
                          ? StyleGuide.color.primaryDark
                          : textColor,
                      },
                    ]}>
                    #{tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Audio Title */}
            <Text style={[styles.fieldLabel, {color: textColor, marginTop: 18}]}>
              Audio Track
            </Text>
            <View
              style={[
                styles.audioInputWrapper,
                {backgroundColor: inputBg, borderColor},
              ]}>
              <Ionicons
                name="musical-notes-outline"
                size={20}
                color={StyleGuide.color.primary}
                style={{marginRight: 10}}
              />
              <TextInput
                style={[styles.audioInput, {color: textColor}]}
                placeholder="Original Audio name"
                placeholderTextColor={subtextColor}
                value={audioTitle}
                onChangeText={setAudioTitle}
                maxLength={80}
              />
            </View>

            {/* Uploading progress notification */}
            {uploading && (
              <View style={[styles.uploadBanner, {backgroundColor: cardBg, borderColor}]}>
                <ActivityIndicator
                  size="small"
                  color={StyleGuide.color.primary}
                  style={{marginRight: 12}}
                />
                <View style={{flex: 1}}>
                  <Text style={[styles.uploadBannerText, {color: textColor}]}>
                    {uploadStatus || 'Processing reel...'}
                  </Text>
                  <Text style={[styles.uploadBannerSub, {color: subtextColor}]}>
                    Please keep the app open while uploading.
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  topBarTitle: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 18,
  },
  publishBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  publishBtnText: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  scrollContent: {
    flex: 1,
  },
  previewContainer: {
    padding: 16,
    alignItems: 'center',
  },
  videoWrapper: {
    width: SCREEN_WIDTH * 0.65,
    height: SCREEN_HEIGHT * 0.42,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  previewVideo: {
    width: '100%',
    height: '100%',
  },
  previewPlayToggle: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationBadgeText: {
    color: '#FFFFFF',
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 12,
  },
  changeVideoBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  changeVideoText: {
    color: '#FFFFFF',
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 12,
    marginLeft: 6,
  },
  selectPromptCard: {
    margin: 16,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectPromptTitle: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 18,
    marginBottom: 6,
  },
  selectPromptDesc: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  pickerButtonsRow: {
    flexDirection: 'row',
    width: '100%',
  },
  pickerActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },
  pickerActionBtnText: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 13,
    color: '#FFFFFF',
    marginLeft: 6,
  },
  formSection: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  fieldLabel: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 14,
    marginBottom: 8,
  },
  captionInputWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    minHeight: 90,
    justifyContent: 'space-between',
  },
  captionInput: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 14,
    textAlignVertical: 'top',
    padding: 0,
  },
  charCount: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 11,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  chipsHeading: {
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 12,
    marginTop: 10,
    marginBottom: 6,
  },
  tagChipsRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  tagChipText: {
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 12,
  },
  audioInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
  },
  audioInput: {
    flex: 1,
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 14,
    padding: 0,
  },
  uploadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  uploadBannerText: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 13,
  },
  uploadBannerSub: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 11,
    marginTop: 2,
  },
});

export default CreateReelModal;
