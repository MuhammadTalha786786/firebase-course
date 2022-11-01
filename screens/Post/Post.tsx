import {
    View,
    Text,
    Image,
    StyleSheet,
    Button,
    Alert,
    StatusBar,
    Platform
} from 'react-native';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import database from '@react-native-firebase/database';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleGuide } from '../../Utils/StyleGuide';;
import { Box, TextArea } from 'native-base';
import { widthPercentageToDP } from 'react-native-responsive-screen';
import Entypo from 'react-native-vector-icons/Entypo';
import TextInputComponent from '../components/TextInputComponent';
import ButtonComponent from '../components/ButtonComponent';
import * as Progress from 'react-native-progress';
import { setSignOut } from '../../Redux/Auth/AuthReducer';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import uuid from 'react-native-uuid';
import firestore from '@react-native-firebase/firestore';








const Post = () => {
    const [image, setImage] = useState('');
    const [title, setTitle] = useState('');
    const [textAreaValue, setTextAreaValue] = useState('');
    const [error, setError] = useState('');
    const [imageError, setImageError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [transferred, setTransferred] = useState(0);
    const [postImage, setPostImage] = useState('')
    const authState = useSelector((state: AppState) => state);

    const dispatch = useDispatch();
    const logout = () => {
        dispatch(setSignOut());
    };

    console.log(authState.userAuthReducer.uid)



    // const uploadImage = async () => {
    //     console.log(image, 'uri....');
    //     const filename = image.substring(image.lastIndexOf('/') + 1);
    //     const uploadUri =
    //         Platform.OS === 'ios' ? image.replace('file://', '') : image;

    //     setTransferred(0);


    //     console.log('filenmae', filename)
    //     console.log('upload uri', uploadUri)

    //     const task = storage().ref(filename).putFile(uploadUri)
    //     console.log(uploadUri.slice(70), "url")
    //     // set progress state
    //     task.on('state_changed', snapshot => {
    //         setTransferred(
    //             Math.round(snapshot.bytesTransferred / snapshot.totalBytes) * 10000,
    //         );
    //         setPostImage(filename)
    //         // storage().ref().child(filename).getDownloadURL().then((url) => {
    //         //     setPostImage(url)
    //         //     console.log(url, "url new ")
    //         // })
    //     });
    //     try {
    //         await task;
    //     } catch (e) {
    //         console.error(e);
    //     }
    //     Alert.alert('Your data has been uploaded');
    //     uploadPost();
    //     setUploading(false);

    // };



    const selectImage = async () => {
        ImagePicker.openPicker({
            width: 300,
            height: 400,
            cropping: true,
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
            });
            // console.log(image.path);
        });
    };


    const uploadPost = () => {
        setUploading(true);




        if (postImage === '' || postImage === undefined) {
            setImageError("please Select an image")
        }
        else if (title === '') {
            setError("please Add a title")
        }
        else if (textAreaValue === '') {
            setError("please Add a detail")
        }
        else {
            let id = uuid.v4()
            const postData = {
                userID: authState.userAuthReducer.uid,
                userImage: authState.userAuthReducer.photoURL,
                userName: authState.userAuthReducer.userName,
                postImage: postImage,
                postTitle: title,
                postDetail: textAreaValue,
                dateCreated: new Date(),
                postID: id,
                likes: [],
                comments: [""],
            }
            var newPostKey = database().ref('userPosts').push().key;

            console.log(newPostKey);
            firestore()
                .collection('posts')
                .doc(id)
                .set(postData)
                .then(() => {
                    console.log('post added!');
                });
            Alert.alert("uploaded")
            setUploading(false)

            setImage('');                  // uploadImage()
            setPostImage('')
            setTitle('')
            setTextAreaValue('')
        }
    }


    let disabled = image === '' || image === undefined || title === '' || textAreaValue === ''
    console.log(disabled)
    return (
        <>
            <StatusBar
                barStyle="dark-content"
                translucent
                backgroundColor="transparent"
            />
            <SafeAreaView style={styles.SafeAreaView}>
                <>
                    <View style={styles.heading}>
                        <Text style={styles.headingText}>Create Post</Text>
                    </View>
                    <View style={styles.mainBox}>
                        <View style={styles.ImageBox}>
                            {image === undefined || image === '' ? (
                                <Text style={styles.selectImageText}>Select Image</Text>
                            ) : (
                                <Image source={{ uri: image }} style={styles.PostImage} />
                            )}
                        </View>
                    </View>
                    <View style={styles.ImageSelectView}>
                        <Entypo
                            onPress={selectImage}
                            style={styles.imageIconSelect}
                            color="#6A0DAD"
                            size={30}
                            name="images"
                        />
                    </View>
                    <View style={styles.inputs}>
                        <TextInputComponent
                            value={title}
                            setValue={setTitle}
                            placeholder="Enter Title"
                            mode="outlined"
                            label="Title"
                            name={'title'}
                            multiline={true}
                            numberOfLines={4}
                            setError={setError}
                        />
                    </View>
                    <View style={{ padding: 10 }}>
                        <TextArea
                            style={{

                                fontFamily: 'Poppins-Regular',
                                fontSize: widthPercentageToDP('3.7'),
                            }}
                            h={40}
                            placeholder="Text Area Placeholder"
                            value={textAreaValue}
                            // for web
                            onChangeText={text => setTextAreaValue(text)} // for android and ios
                            w="100%"
                            maxW="400"
                        />
                    </View>

                    <View style={{ padding: 10 }}>


                        {image === '' && (<Text style={styles.errorText} >{imageError}</Text>)}
                        <Text style={styles.errorText} >{error}</Text>
                        < ButtonComponent
                            buttonTitle="Post"
                            btnType="check-square"
                            color="#f5e7ea"
                            backgroundColor={disabled ? 'grey' : '#6A0DAD'}
                            onPress={uploadPost}
                            disabled={disabled}
                            uploading={uploading}
                            setUploading={setUploading}
                        />

                        < ButtonComponent
                            buttonTitle="logout"
                            btnType="check-square"
                            color="#f5e7ea"
                            backgroundColor={'#6A0DAD'}
                            onPress={logout}

                        />
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
        color: 'black',
        fontFamily: StyleGuide.fontFamily.medium,
        fontSize: widthPercentageToDP('5%'),
    },

    SafeAreaView: {
        flex: 1,
        backgroundColor: '#F5F5DC',
    },
    mainBox: {
        alignItems: 'center',
        marginBottom: 15,
    },
    ImageBox: {
        width: 380,
        height: 200,
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
        marginTop: -15
        // marginHorizontal: 10,
    },
    ImageSelectView: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    PostImage: {
        height: 200,
        width: 380,
    },
    inputs: {
        marginVertical: 10,
        // padding: 10
    },
    errorText: {
        color: 'red',
        fontSize: StyleGuide.fontSize.small,
        fontFamily: StyleGuide.fontFamily.medium,
    }
});
export default Post;
