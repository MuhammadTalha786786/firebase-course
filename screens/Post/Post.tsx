import {
  View,
  Text,
  Image,
  StyleSheet,
  Button,
  Alert,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useLayoutEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleGuide } from '../../Utils/StyleGuide';
import { Box, TextArea } from 'native-base';
import { widthPercentageToDP } from 'react-native-responsive-screen';
import Entypo from 'react-native-vector-icons/Entypo';
import ButtonComponent from '../components/ButtonComponent';
import { setSignOut } from '../../Redux/Auth/AuthReducer';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import uuid from 'react-native-uuid';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { windowHeight, windowWidth } from '../../Utils/Dimesnions';
import { reducerType } from '../../Utils/types';
import { ScrollView } from 'react-native-gesture-handler';
import ImagePickerModal from '../components/ImagePickerModal';
import CameraComponent from '../components/CameraComponent';
import Video from 'react-native-video';

const Post = ({ navigation }) => {
  const [image, setImage] = useState<string>('');
  const [textAreaValue, setTextAreaValue] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [imageError, setImageError] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [postImage, setPostImage] = useState<string>('');
  const [loginState, setLoginState] = useState<boolean>(false);
  const [imageText, selectImageText] = useState('');
  const [imagePickerModal, setImagePickerModal] = useState<boolean>(false)
  const [isCameraPost, setIsCameraPost] = useState<boolean>(false)
  const authState = useSelector((state: reducerType) => state);
  const [recordedVideoURL, setRecordedVideoURL] = useState<string>('');
  const [fetchRecordedURL, setFetchRecordedURL] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [isVideoPost, setIsVideoPost] = useState(false)
  let uid = authState.userAuthReducer.uid;
  const videoPlayer = useRef()


  const selectImage = (action: 'Gallery' | 'Camera') => {
    selectImageText('Please Wait While your Image is Uploading');

    if (action == 'Gallery') {
      ImagePicker.openPicker({
        width: 300,
        height: 400,
      }).then(image => {
        setImage(image.path);
        setImagePickerModal(false)
        let fileName = `${uuidv4()}${image.path.substr(
          image.path.lastIndexOf('.'),
        )}`;
        const ref = storage().ref(fileName);
        ref.putFile(image.path).then(s => {
          ref.getDownloadURL().then(x => {
            console.log(x, 'x url');
            setPostImage(x);
          });
        }).catch((error) => {
          setImagePickerModal(false)
          console.log(error, "error....")
        });
      });
    }
    else {
      ImagePicker.openCamera({
        width: 300,
        height: 400,
      }).then(image => {
        setImage(image.path);
        setImagePickerModal(false)
        let fileName = `${uuidv4()}${image.path.substr(
          image.path.lastIndexOf('.'),
        )}`;
        const ref = storage().ref(fileName);
        ref.putFile(image.path).then(s => {
          ref.getDownloadURL().then(x => {
            console.log(x, 'x url');
            setPostImage(x);
          });
        }).catch((error) => {
          setImagePickerModal(false)
          console.log(error, "error....")
        });
      });
    }


  };

  console.log(postImage === '', 'postImage');

 

  useEffect(() => {
    auth().onAuthStateChanged(function (user) {
      if (user) {
        firestore()
          .collection('users')
          .doc(user.uid)
          .get()
          .then((documentSnapshot: FirebaseFirestoreTypes.DocumentData) => {
            console.log(documentSnapshot.data().isLogin, 'mdfdas');

            setLoginState(documentSnapshot.data().isLogin);
          });
      } else {
        console.log('not login');
      }
    });
  }, [navigation]);


  // const videoRecording = () => {
 
  //   camera.current.startRecording({
  //     flash: 'on',
  //     onRecordingFinished: video => {
  //      setRecordedVideoURL(video.path)
  //       // UploadVideo()
  //     },
  //     onRecordingError: error => console.error(error),
  //   });




  // };

  // const stopRecording = async () => {
  //   setIsRecording(false);
  //   await camera.current.stopRecording();
  //   props?.setIsCameraPost(false);
  //   props?.UploadVideo()



  // };

  const postUploaded = (id, postData) => {
    firestore()
      .collection('posts')
      .doc(id)
      .set(postData)
      .then(() => {
        console.warn('post added!');
        // Alert.alert('uploaded');
        setUploading(false);
        setImage(''); // uploadImage()
        setPostImage('');
        setTextAreaValue('');
        setRecordedVideoURL('')
      })
      .catch(error => {
        console.log(error);
      });
  };

  const uploadPost = (x:string) => {

    console.warn("uploaded")
    
    if (textAreaValue === '') {
      setError('please Add a detail');
    } else {
      setUploading(true);
      let id = uuid.v4();

      if(isVideoPost){
        console.warn("video post")

        const videoData = {
          userID: authState.userAuthReducer.uid,
          userImage: authState.userAuthReducer.photoURL,
          userName: authState.userAuthReducer.userName,
          isVideo:true,
          postDetail: textAreaValue,
          postedVideo:x,
          dateCreated: new Date(),
          postID: id,
          likes: [],
          comments: [],
          isLogin: loginState,
  
        };
        postUploaded(id, videoData);

      }
      else{
        const postData = {
          userID: authState.userAuthReducer.uid,
          userImage: authState.userAuthReducer.photoURL,
          userName: authState.userAuthReducer.userName,
          postImage: postImage,
          postDetail: textAreaValue,
          dateCreated: new Date(),
          postID: id,
          likes: [],
          comments: [],
          isLogin: loginState,
  
        };
        postUploaded(id, postData);
      }     
    }
  };


    //  console.warn(isCameraPost,'is camera post')

     


    const UploadVideo = () => {
      setUploading(true)
     console.warn("upload video")
     let fileName = `${uuidv4()}${recordedVideoURL.substr(
       recordedVideoURL.lastIndexOf('.'),
     )}`;
     const ref = storage().ref(fileName);
     var metadata = {
       contentType: 'video/mp4'
     };
     ref.putFile(recordedVideoURL, metadata).then(s => {
       console.log(s)
       ref.getDownloadURL().then(x => {
 
      //  props?.setLoading(false)
         console.warn(x, 'x url');
         console.warn('Your Video Has Been Uploaded')
         setFetchRecordedURL(x);
         setUploading(false)
         uploadPost(x)
        // setIsCameraPost(false);
       });
     });

     
   }


  let disabled = isVideoPost ? recordedVideoURL ==  ''   || textAreaValue == ''  :     postImage === '' || textAreaValue === '';
  let mode = authState.darkModeReducer.mode;
  console.log(disabled, 'disabled');

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      {
        isCameraPost ?

          // <View style={{ flex: 1, }}>
            <CameraComponent

              recordedVideoURL={recordedVideoURL}
              setRecordedVideoURL={setRecordedVideoURL}
              fetchRecordedURL={fetchRecordedURL}
              setFetchRecordedURL={setFetchRecordedURL}
              setIsCameraPost={setIsCameraPost}
              loading={loading}
              setLoading={setLoading}
              // UploadVideo={UploadVideo}
              


            />

          // </View>


          :


          <SafeAreaView
            style={[
              styles.SafeAreaView,
              {
                backgroundColor: mode
                  ? StyleGuide.color.dark
                  : StyleGuide.color.light,
              },
            ]}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior='height' >
              <ScrollView>


                <>
                  <View style={styles.heading}>
                    <Text style={styles.headingText}>Create Post</Text>
                  </View>
                  {
                    loading ? <ActivityIndicator color={'red'} size={100} /> :


                      <View style={styles.mainBox}>
                        {
                          recordedVideoURL ?
                            <Video source={{ uri: recordedVideoURL }}   // Can be a URL or a local file.
                              ref={(ref) => {
                                videoPlayer
                              }}
                              fullscreen={false}
                              controls={true}


                              // Store reference
                              //  onBuffer={this.onBuffer}                // Callback when remote video is buffering
                              //  onError={this.videoError}               // Callback when video cannot be loaded
                              style={styles.backgroundVideo}
                            />
                            :


                            <View style={styles.ImageBox}>
                              {
                                undefined || image === '' ? (
                                  <Text style={styles.selectImageText}>Select Image</Text>
                                ) : (
                                  <Image source={{ uri: image }} style={styles.PostImage} />
                                )}

                            </View>
                        }


                      </View>
                  }
                  <View style={styles.ImageSelectView}>
                    <Entypo
                      onPress={() => { setImagePickerModal(true) }}
                      style={styles.imageIconSelect}
                      color={StyleGuide.color.primary}
                      size={30}
                      name="images"
                    />
                    <Entypo
                      onPress={() => { setIsCameraPost(true), setFetchRecordedURL(''), setRecordedVideoURL(''), setIsVideoPost(true) }}
                      style={[styles.imageIconSelect, { marginLeft: 10 }]}
                      color={StyleGuide.color.primary}
                      size={30}
                      name="video"
                    />
                  </View>

                  <View style={{ padding: 10 }}>
                    <TextArea
                      autoCompleteType={true}
                      style={{
                        fontFamily: StyleGuide.fontFamily.regular,
                        fontSize: widthPercentageToDP('3.7'),
                        color: mode ? StyleGuide.color.light : StyleGuide.color.dark
                      }}
                      h={40}
                      placeholder="What's in your mind?"
                      value={textAreaValue}
                      // for web
                      onChangeText={text => { setTextAreaValue(text) }} // for android and ios
                      w="100%"
                      maxW="400"
                    />
                  </View>

                  <View style={{ padding: 10 }}>
                    {image === '' && <Text style={styles.errorText}>{imageError}</Text>}
                    <Text style={styles.errorText}>{error}</Text>
                    {postImage === '' && (
                      <Text style={styles.errorText}>{imageText}</Text>
                    )}

                    <View style={{ marginVertical: 50 }}>
                      <ButtonComponent

                        buttonTitle="Post"
                        btnType="check-square"
                        color="#f5e7ea"
                        backgroundColor={disabled ? 'grey' : StyleGuide.color.primary}
                        onPress={isVideoPost ? UploadVideo : uploadPost}
                        disabled={disabled}
                        uploading={uploading}
                      />
                    </View>
                  </View>
                </>
              </ScrollView>



            </KeyboardAvoidingView>

            <ImagePickerModal
              modalVisible={imagePickerModal}
              setModalVisible={setImagePickerModal}
              imagePicker={selectImage}
            />


          </SafeAreaView>
      }
    </>
  );
};
const styles = StyleSheet.create({
  heading: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  headingText: {
    color: StyleGuide.color.primary,
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: widthPercentageToDP('5%'),
  },

  SafeAreaView: {
    flex: 1,
    marginVertical: 10,
  },
  mainBox: {
    // flex:1,
    alignItems: 'center',
    marginBottom: 15,
  },
  ImageBox: {
    width: windowWidth * 0.95,
    height: windowHeight / 4,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#c2c2c2',
    borderWidth: 1,
    // backgroundColor: 'red',
    borderRadius: 3.3,
  },
  selectImageText: {
    textAlign: 'center',
    color: 'gray',
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: widthPercentageToDP('3.7%'),
  },
  imageIconSelect: {
    marginTop: -15,
    // marginHorizontal: 10,
  },
  ImageSelectView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  PostImage: {
    width: windowWidth * 0.95,
    height: windowHeight / 4,
  },
  inputs: {
    marginVertical: 10,
    // padding: 10
  },
  errorText: {
    color: 'blue',
    fontSize: widthPercentageToDP('2.5%'),
    fontFamily: StyleGuide.fontFamily.medium,
  },
  backgroundVideo: {
    flex: 1,
    height: 300,
    width: "100%"
  },
});
export default Post;
