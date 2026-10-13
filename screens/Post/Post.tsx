import 'react-native-get-random-values';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import ImagePicker from 'react-native-image-crop-picker';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StyleGuide} from '../../Utils/StyleGuide';
import {TextInput} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import uuid from 'react-native-uuid';
import {reducerType} from '../../Utils/types';
import {ScrollView} from 'react-native-gesture-handler';
import ImagePickerModal from '../components/ImagePickerModal';
import LocationPickerModal, {
  SelectedLocationData,
} from '../components/LocationPickerModal';
import ApiCall from '../../services/services';
import {Avatar} from 'native-base';
import {uploadFileToSupabase} from '../../services/supabaseStorage';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const Post = ({navigation}: {navigation: any}) => {
  const dispatch = useDispatch();
  const authState = useSelector((state: reducerType) => state);
  const userData = authState.userAuthReducer.userData?.user;
  const mode = authState.darkModeReducer.mode;

  const [image, setImage] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [postImage, setPostImage] = useState<string>('');
  const [imagePickerModal, setImagePickerModal] = useState<boolean>(false);

  // Location state
  const [locationModalVisible, setLocationModalVisible] =
    useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocationData | null>(null);

  const isDarkMode = Boolean(mode);
  const bgColor = isDarkMode ? StyleGuide.color.dark : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : StyleGuide.color.textPrimary;
  const subtextColor = isDarkMode ? '#94A3B8' : StyleGuide.color.textSecondary;
  const borderColor = isDarkMode ? '#334155' : StyleGuide.color.border;

  // Supabase storage upload using profile_images bucket/folder just like register screen
  const selectImage = (action: 'Gallery' | 'Camera') => {
    setImagePickerModal(false);

    const pickerMethod =
      action === 'Gallery' ? ImagePicker.openPicker : ImagePicker.openCamera;

    pickerMethod({
      width: 800,
      height: 800,
      cropping: true,
      cropperCircleOverlay: false,
      compressImageQuality: 0.75,
      includeBase64: true,
    })
      .then(async selected => {
        setImage(selected.path);
        setUploadingImage(true);

        try {
          console.log('Uploading post image to Supabase...');
          const url = await uploadFileToSupabase(selected.path, {
            bucket: 'social-bea',
            folder: 'profile_images', // Uses same verified folder & RLS policy as register
            base64Data: selected.data,
          });
          console.log('Post image uploaded successfully to Supabase:', url);
          setPostImage(url);
        } catch (error: any) {
          console.error('Supabase upload error:', error);
          Alert.alert(
            'Upload Error',
            error?.message ||
              'Failed to upload image. Please check Supabase Storage connection.',
          );
        } finally {
          setUploadingImage(false);
        }
      })
      .catch(error => {
        setUploadingImage(false);
        if (error.code !== 'E_PICKER_CANCELLED') {
          Alert.alert('Error', 'Failed to select image');
        }
      });
  };

  const uploadPost = async () => {
    if (!image && !postImage && !caption.trim()) {
      Alert.alert(
        'Post Content Required',
        'Please select a photo or write a message to share.',
      );
      return;
    }

    setUploading(true);

    try {
      let finalImageUrl = postImage;

      // If image was selected but not uploaded yet (or failed earlier), upload to Supabase now
      if (!finalImageUrl && image) {
        setUploadingImage(true);
        try {
          finalImageUrl = await uploadFileToSupabase(image, {
            bucket: 'social-bea',
            folder: 'profile_images',
          });
          setPostImage(finalImageUrl);
        } catch (uploadErr: any) {
          console.error('Supabase upload on submit error:', uploadErr);
          Alert.alert(
            'Upload Failed',
            uploadErr?.message || 'Failed to upload photo to Supabase.',
          );
          setUploading(false);
          setUploadingImage(false);
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      const id = uuid.v4();
      const body = {
        userID: userData?._id,
        userImage: userData?.image || '',
        userName: userData?.name || 'User',
        postImage: finalImageUrl || '',
        postDetail: caption.trim() || '',
        location: selectedLocation ? selectedLocation.name : '',
        coordinates: selectedLocation
          ? {
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }
          : null,
        postID: id,
        likes: [],
        comments: [],
      };

      const response = await ApiCall(
        'post',
        'api/posts',
        body,
        dispatch,
        false,
      );

      if (response?.success) {
        Alert.alert('Success', 'Post created successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setImage('');
              setPostImage('');
              setCaption('');
              setSelectedLocation(null);
              navigation.goBack();
            },
          },
        ]);
      } else {
        Alert.alert('Error', response?.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Upload post error:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImage('');
    setPostImage('');
  };

  // Can post if an image is chosen (even with no caption) or caption is entered
  const canPost = Boolean(
    (image || postImage || caption.trim()) && !uploading && !uploadingImage,
  );

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={bgColor}
      />
      <SafeAreaView style={[styles.container, {backgroundColor: bgColor}]}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
          {/* Header */}
          <View style={[styles.header, {borderBottomColor: borderColor}]}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerButton}>
              <Ionicons name="arrow-back" size={24} color={textColor} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, {color: textColor}]}>
              Create Post
            </Text>
            <TouchableOpacity
              onPress={uploadPost}
              disabled={!canPost}
              style={[
                styles.shareBadge,
                {
                  backgroundColor: canPost
                    ? StyleGuide.color.primary
                    : isDarkMode
                    ? '#334155'
                    : '#E2E8F0',
                },
              ]}>
              {uploading || uploadingImage ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text
                  style={[
                    styles.shareBadgeText,
                    {
                      color: canPost
                        ? '#FFFFFF'
                        : isDarkMode
                        ? '#64748B'
                        : '#94A3B8',
                    },
                  ]}>
                  Share
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {/* Image Preview or Selector */}
            {image ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{uri: image}} style={styles.imagePreview} />
                {uploadingImage && (
                  <View style={styles.imageUploadOverlay}>
                    <ActivityIndicator
                      size="large"
                      color={StyleGuide.color.primary}
                    />
                    <Text style={styles.uploadingText}>
                      Uploading to Supabase...
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={removeImage}>
                  <Ionicons name="close" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{padding: 16}}>
                <TouchableOpacity
                  style={[
                    styles.imagePlaceholder,
                    {
                      backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC',
                      borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                    },
                  ]}
                  onPress={() => setImagePickerModal(true)}>
                  <View
                    style={[
                      styles.iconCircle,
                      {backgroundColor: StyleGuide.color.primaryLight},
                    ]}>
                    <Feather
                      name="image"
                      size={28}
                      color={StyleGuide.color.primaryDark}
                    />
                  </View>
                  <Text
                    style={[styles.imagePlaceholderTitle, {color: textColor}]}>
                    Upload Photo
                  </Text>
                  <Text
                    style={[
                      styles.imagePlaceholderSubtitle,
                      {color: subtextColor},
                    ]}>
                    JPG, PNG or GIF up to 10MB
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Caption Input Section */}
            <View style={styles.captionSection}>
              <Avatar
                size="sm"
                source={{uri: userData?.image}}
                style={styles.userAvatar}
              />
              <View style={styles.captionInputContainer}>
                <TextInput
                  style={[
                    styles.captionInput,
                    {
                      backgroundColor: 'transparent',
                      color: textColor,
                    },
                  ]}
                  placeholder="What's on your mind?..."
                  placeholderTextColor={subtextColor}
                  value={caption}
                  onChangeText={setCaption}
                  multiline
                  maxLength={2200}
                  mode="flat"
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                />
                <Text
                  style={[styles.characterCount, {color: subtextColor}]}>
                  {caption.length}/2200
                </Text>
              </View>
            </View>

            {/* Additional Options List */}
            <View
              style={[styles.optionsSection, {borderTopColor: borderColor}]}>
              {/* Photo option */}
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => setImagePickerModal(true)}>
                <View style={styles.optionIconWrap}>
                  <MaterialIcons
                    name="add-photo-alternate"
                    size={22}
                    color={StyleGuide.color.primary}
                  />
                </View>
                <Text style={[styles.optionText, {color: textColor}]}>
                  {image ? 'Change Photo' : 'Attach Photo'}
                </Text>
                <Feather
                  name="chevron-right"
                  size={18}
                  color={subtextColor}
                  style={{marginLeft: 'auto'}}
                />
              </TouchableOpacity>

              {/* Add Location Option */}
              <TouchableOpacity
                style={styles.optionItem}
                activeOpacity={0.7}
                onPress={() => setLocationModalVisible(true)}>
                <View
                  style={[
                    styles.optionIconWrap,
                    selectedLocation
                      ? {backgroundColor: StyleGuide.color.primaryLight}
                      : null,
                  ]}>
                  <Feather
                    name="map-pin"
                    size={20}
                    color={
                      selectedLocation
                        ? StyleGuide.color.primaryDark
                        : StyleGuide.color.primary
                    }
                  />
                </View>
                <View style={{flex: 1}}>
                  {selectedLocation ? (
                    <>
                      <Text style={[styles.locationLabel, {color: subtextColor}]}>
                        Location
                      </Text>
                      <Text
                        style={[
                          styles.locationSelectedText,
                          {
                            color: isDarkMode
                              ? '#34D399'
                              : StyleGuide.color.primaryDark,
                          },
                        ]}
                        numberOfLines={1}>
                        📍 {selectedLocation.name}
                      </Text>
                    </>
                  ) : (
                    <Text style={[styles.optionText, {color: textColor}]}>
                      Add Location
                    </Text>
                  )}
                </View>
                {selectedLocation ? (
                  <TouchableOpacity
                    onPress={() => setSelectedLocation(null)}
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                    style={{padding: 4}}>
                    <Ionicons
                      name="close-circle"
                      size={22}
                      color={subtextColor}
                    />
                  </TouchableOpacity>
                ) : (
                  <Feather
                    name="chevron-right"
                    size={18}
                    color={subtextColor}
                    style={{marginLeft: 'auto'}}
                  />
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Photo Selection Modal */}
        <ImagePickerModal
          modalVisible={imagePickerModal}
          setModalVisible={setImagePickerModal}
          imagePicker={selectImage}
        />

        {/* Location Picker Map Modal */}
        <LocationPickerModal
          visible={locationModalVisible}
          onClose={() => setLocationModalVisible(false)}
          onSelectLocation={loc => setSelectedLocation(loc)}
          initialLocation={selectedLocation}
          darkMode={isDarkMode}
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 18,
  },
  shareBadge: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  shareBadgeText: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  imagePreviewContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    position: 'relative',
    backgroundColor: '#000000',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageUploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 15,
  },
  removeImageButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    height: 200,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePlaceholderTitle: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 16,
    marginBottom: 4,
  },
  imagePlaceholderSubtitle: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 13,
  },
  captionSection: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  userAvatar: {
    marginRight: 12,
    marginTop: 4,
  },
  captionInputContainer: {
    flex: 1,
  },
  captionInput: {
    maxHeight: 140,
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  characterCount: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 12,
    marginTop: 6,
    textAlign: 'right',
  },
  optionsSection: {
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: StyleGuide.color.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionText: {
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 15,
  },
  locationLabel: {
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationSelectedText: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 14,
    marginTop: 2,
  },
  locationBadge: {
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 12,
    marginTop: 2,
  },
});

export default Post;