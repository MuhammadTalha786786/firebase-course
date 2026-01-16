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
import storage from '@react-native-firebase/storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StyleGuide} from '../../Utils/StyleGuide';
import {TextInput} from 'react-native-paper';
import {widthPercentageToDP} from 'react-native-responsive-screen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {v4 as uuidv4} from 'uuid';
import uuid from 'react-native-uuid';
import {reducerType} from '../../Utils/types';
import {ScrollView} from 'react-native-gesture-handler';
import ImagePickerModal from '../components/ImagePickerModal';
import ApiCall from '../../services/services';
import {Avatar} from 'native-base';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const Post = ({navigation}) => {
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

  const selectImage = (action: 'Gallery' | 'Camera') => {
    setUploadingImage(true);

    const pickerMethod =
      action === 'Gallery'
        ? ImagePicker.openPicker
        : ImagePicker.openCamera;

    pickerMethod({
      width: 1080,
      height: 1080,
      cropping: true,
      cropperCircleOverlay: false,
      compressImageQuality: 0.8,
    })
      .then(image => {
        setImage(image.path);
        setImagePickerModal(false);

        // Upload to Firebase Storage
        const fileName = `posts/${uuidv4()}${image.path.substr(
          image.path.lastIndexOf('.'),
        )}`;
        const ref = storage().ref(fileName);

        ref
          .putFile(image.path)
          .then(() => {
            ref.getDownloadURL().then(url => {
              setPostImage(url);
              setUploadingImage(false);
            });
          })
          .catch(error => {
            console.error('Upload error:', error);
            setUploadingImage(false);
            setImagePickerModal(false);
            Alert.alert('Error', 'Failed to upload image');
          });
      })
      .catch(error => {
        setUploadingImage(false);
        setImagePickerModal(false);
        if (error.code !== 'E_PICKER_CANCELLED') {
          Alert.alert('Error', 'Failed to select image');
        }
      });
  };

  const uploadPost = async () => {
    if (!postImage) {
      Alert.alert('Image Required', 'Please select an image for your post');
      return;
    }

    if (!caption.trim()) {
      Alert.alert('Caption Required', 'Please add a caption for your post');
      return;
    }

    setUploading(true);

    try {
      const id = uuid.v4();
      const body = {
        userID: userData?._id,
        userImage: userData?.image,
        userName: userData?.name,
        postImage: postImage,
        postDetail: caption.trim(),
        postID: id,
        likes: [],
        comments: [],
      };

      const response = await ApiCall('post', 'api/posts', body, dispatch, false);

      if (response?.success) {
        Alert.alert('Success', 'Post created successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setImage('');
              setPostImage('');
              setCaption('');
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

  const canPost = postImage && caption.trim() && !uploading && !uploadingImage;

  return (
    <>
      <StatusBar
        barStyle={mode ? 'light-content' : 'dark-content'}
        backgroundColor={mode ? '#000' : '#fff'}
      />
      <SafeAreaView
        style={[
          styles.container,
          {backgroundColor: mode ? '#000' : '#fff'},
        ]}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
          {/* Header */}
          <View
            style={[
              styles.header,
              {borderBottomColor: mode ? '#333' : '#efefef'},
            ]}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerButton}>
              <Ionicons
                name="close"
                size={32}
                color={mode ? '#fff' : '#000'}
              />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, {color: mode ? '#fff' : '#000'}]}>
              New Post
            </Text>
            <TouchableOpacity
              onPress={uploadPost}
              disabled={!canPost}
              style={styles.headerButton}>
              {uploading ? (
                <ActivityIndicator size="small" color="#0095f6" />
              ) : (
                <Text
                  style={[
                    styles.postButtonText,
                    {opacity: canPost ? 1 : 0.3},
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
            {/* Image Section */}
            {image ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{uri: image}} style={styles.imagePreview} />
                {uploadingImage && (
                  <View style={styles.imageUploadOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.uploadingText}>Uploading...</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={removeImage}>
                  <Ionicons name="close-circle" size={32} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.imagePlaceholder,
                  {
                    backgroundColor: mode ? '#1a1a1a' : '#f5f5f5',
                    borderColor: mode ? '#333' : '#e0e0e0',
                  },
                ]}
                onPress={() => setImagePickerModal(true)}>
                <Feather
                  name="image"
                  size={60}
                  color={mode ? '#555' : '#ccc'}
                />
                <Text
                  style={[
                    styles.imagePlaceholderText,
                    {color: mode ? '#999' : '#666'},
                  ]}>
                  Tap to add photo
                </Text>
              </TouchableOpacity>
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
                      backgroundColor: mode ? '#000' : '#fff',
                      color: mode ? '#fff' : '#000',
                    },
                  ]}
                  placeholder="Write a caption..."
                  placeholderTextColor={mode ? '#999' : '#666'}
                  value={caption}
                  onChangeText={setCaption}
                  multiline
                  maxLength={2200}
                  mode="flat"
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                />
                <Text
                  style={[
                    styles.characterCount,
                    {color: mode ? '#666' : '#999'},
                  ]}>
                  {caption.length}/2200
                </Text>
              </View>
            </View>

            {/* Additional Options */}
            <View
              style={[
                styles.optionsSection,
                {borderTopColor: mode ? '#333' : '#efefef'},
              ]}>
              <TouchableOpacity style={styles.optionItem}>
                <Feather
                  name="map-pin"
                  size={24}
                  color={mode ? '#fff' : '#000'}
                />
                <Text
                  style={[
                    styles.optionText,
                    {color: mode ? '#fff' : '#000'},
                  ]}>
                  Add Location
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionItem}>
                <Feather
                  name="user-plus"
                  size={24}
                  color={mode ? '#fff' : '#000'}
                />
                <Text
                  style={[
                    styles.optionText,
                    {color: mode ? '#fff' : '#000'},
                  ]}>
                  Tag People
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => setImagePickerModal(true)}>
                <MaterialIcons
                  name="add-photo-alternate"
                  size={24}
                  color={mode ? '#fff' : '#000'}
                />
                <Text
                  style={[
                    styles.optionText,
                    {color: mode ? '#fff' : '#000'},
                  ]}>
                  {image ? 'Change Photo' : 'Add Photo'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <ImagePickerModal
          modalVisible={imagePickerModal}
          setModalVisible={setImagePickerModal}
          imagePicker={selectImage}
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
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  headerButton: {
    minWidth: 60,
  },
  headerTitle: {
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 18,
    fontWeight: '600',
  },
  postButtonText: {
    color: '#0095f6',
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  imagePreviewContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    position: 'relative',
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    color: '#fff',
    marginTop: 12,
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 16,
  },
  removeImageButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
  },
  imagePlaceholder: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  imagePlaceholderText: {
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 16,
    marginTop: 16,
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
    maxHeight: 150,
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 16,
    lineHeight: 22,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  characterCount: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'right',
  },
  optionsSection: {
    borderTopWidth: 0.5,
    marginTop: 16,
    paddingTop: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  optionText: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 16,
    marginLeft: 16,
  },
});

export default Post;