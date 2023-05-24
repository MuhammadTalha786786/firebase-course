import {
  View,
  Text,
  Image,
  StyleSheet,
  Button,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import React, { useState, useLayoutEffect } from 'react';
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

const Post = ({ navigation }) => {
  const [image, setImage] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [textAreaValue, setTextAreaValue] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [imageError, setImageError] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [postImage, setPostImage] = useState<string>('');
  const [loginState, setLoginState] = useState<boolean>(false);
  const [imageText, selectImageText] = useState('');

 
  const authState = useSelector((state:reducerType) => state);

  let uid = authState.userAuthReducer.uid;

  const selectImage = () => {
    selectImageText('Please Wait While your Image is Uploading');

    ImagePicker.openPicker({
      width: 300,
      height: 400,
    }).then(image => {
      setImage(image.path);
      let fileName = `${uuidv4()}${image.path.substr(
        image.path.lastIndexOf('.'),
      )}`;
      const ref = storage().ref(fileName);
      ref.putFile(image.path).then(s => {
        ref.getDownloadURL().then(x => {
          console.log(x, 'x url');
          setPostImage(x);
        });
      }).catch((error)=>{
        console.log(error,"error....")
      });
    });
  };

  console.log(postImage === '', 'postImage');

  useEffect(() => {
    auth().onAuthStateChanged(function (user) {
      if (user) {
        firestore()
          .collection('users')
          .doc(user.uid)
          .get()
          .then((documentSnapshot:FirebaseFirestoreTypes.DocumentData) => {
            console.log(documentSnapshot.data().isLogin, 'mdfdas');

            setLoginState(documentSnapshot.data().isLogin);
          });
      } else {
        console.log('not login');
      }
    });
  }, [navigation]);

  const postUploaded = (id, postData) => {
    firestore()
      .collection('posts')
      .doc(id)
      .set(postData)
      .then(() => {
        console.log('post added!');
        // Alert.alert('uploaded');
        setUploading(false);
        setImage(''); // uploadImage()
        setPostImage('');
        setTitle('');
        setTextAreaValue('');
      })
      .catch(error => {
        console.log(error);
      });
  };

  const uploadPost = () => {
    if (postImage === '') {
      setImageError('please Select an image');
    } else if (textAreaValue === '') {
      setError('please Add a detail');
    } else {
      setUploading(true);
      let id = uuid.v4();
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
  };



  let disabled = postImage === '' || textAreaValue === '';
  let mode = authState.darkModeReducer.mode;
  console.log(disabled, 'disabled');

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <SafeAreaView
        style={[
          styles.SafeAreaView,
          {
            backgroundColor: mode
              ? StyleGuide.color.dark
              : StyleGuide.color.light,
          },
        ]}>
        <>
          <View style={styles.heading}>
            <Text style={styles.headingText}>Create Post</Text>
          </View>
          <View style={styles.mainBox}>
            <View style={styles.ImageBox}>
              {image === undefined || image === '' ? (
                <Text style={styles.selectImageText}>Select Image</Text>
              ) : (
                <Image source={{uri: image}} style={styles.PostImage} />
              )}
            </View>
          </View>
          <View style={styles.ImageSelectView}>
            <Entypo
              onPress={selectImage}
              style={styles.imageIconSelect}
              color={StyleGuide.color.primary}
              size={30}
              name="images"
            />
          </View>

          <View style={{padding: 10}}>
            <TextArea
              autoCompleteType={true}
              style={{
                fontFamily: StyleGuide.fontFamily.regular,
                fontSize: widthPercentageToDP('3.7'),
              }}
              h={40}
              placeholder="What's in your mind?"
              value={textAreaValue}
              // for web
              onChangeText={text => setTextAreaValue(text)} // for android and ios
              w="100%"
              maxW="400"
            />
          </View>

          <View style={{padding: 10}}>
            {image === '' && <Text style={styles.errorText}>{imageError}</Text>}
            <Text style={styles.errorText}>{error}</Text>
            {postImage === '' && (
              <Text style={styles.errorText}>{imageText}</Text>
            )}

            <View style={{marginVertical:50}}>
              <ButtonComponent
              
                buttonTitle="Post"
                btnType="check-square"
                color="#f5e7ea"
                backgroundColor={disabled ? 'grey' : StyleGuide.color.primary}
                onPress={uploadPost}
                disabled={disabled}
                uploading={uploading}
              />
            </View>
          </View>
        </>
      </SafeAreaView>
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
    // backgroundColor: '#c2c2c2'
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
});
export default Post;
