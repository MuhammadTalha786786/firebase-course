import {
    Alert,
    View,
    Text,
    StyleSheet,
    TextInput,
    Button,
    TouchableOpacity,
    TouchableHighlight
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { StyleGuide } from '../../Utils/StyleGuide';
import { Card, Title, Paragraph } from 'react-native-paper';
import { Avatar } from 'native-base';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import database from '@react-native-firebase/database';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { IconButton, MD3Colors } from 'react-native-paper';
import { Item } from 'react-native-paper/lib/typescript/components/List/List';
import { widthPercentageToDP } from 'react-native-responsive-screen';
import moment from 'moment';
import { background } from 'native-base/lib/typescript/theme/styled-system';
import uuid from 'react-native-uuid';

const CardUI = ({
    userName,
    userImage,
    postImage,
    title,
    subtitle,
    postID,
    arrayLikes,
    isPostLiked,
    setIsPostLiked,
    comments,
    date,
    getPostData,
    postData,
    setGetData,
    PostedUser,
    loginState

}) => {
    const authState = useSelector((state: AppState) => state);
    const [showComment, setShowComment] = useState(false);
    const [comment, setComment] = useState('');

    let userID = authState.userAuthReducer.uid;
    console.log(
        postID,
        'userID',
        PostedUser,
        'postedUserid',
        userID === PostedUser,
    );
    const navigation = useNavigation();
    const likeStatus = arrayLikes => {
        if (arrayLikes?.length > 0) {
            let status = false;
            arrayLikes?.map(item => {
                if (item == userID) {
                    status = true;
                } else {
                    status = false;
                }
            });
            return status;
        }
    };

    const addPostLiked = arrayLikes => {
        console.log('arrayLikes', arrayLikes);

        setIsPostLiked(!isPostLiked);
        if (arrayLikes?.length > 0) {
            let findCurrent = arrayLikes.find(item => item === userID);
            console.log(findCurrent);
            if (findCurrent) {
                arrayLikes = arrayLikes.filter(el => userID !== el);
            } else {
                arrayLikes?.push(userID);
            }
        } else {
            arrayLikes?.push(userID);
        }
        console.log('arrayLikes', arrayLikes);
        firestore()
            .collection('posts')
            .doc(postID)
            .update({
                likes: arrayLikes,
            })
            .then(() => {
                console.log('post updated!');
            });
    };

    let PostedDate = date.toDate();


    const postComment = () => {
        let commentID = uuid.v4();
        let userID = authState.userAuthReducer.uid;
        let userProfileName = authState.userAuthReducer.userName;
        let userProfileImaege = authState.userAuthReducer.photoURL;
        let tempComments = comments;
        tempComments.push({
            userID: userID,
            userImage: userProfileImaege,
            userProfileName: userProfileName,
            comment: comment,
            commentCreated: new Date(),
            postID: postID,
            commentID: commentID,
        });
        firestore()
            .collection('posts')
            .doc(postID)
            .update({
                comments: tempComments,
            })
            .then(() => {
                Alert.alert('your comment has been posted...');
                setComment('');
                setShowComment(false);
            })
            .catch(error => {
                console.log(error);
            });
    };

    const DeletePost = postID => {
        Alert.alert(
            'Are you sure to delete?',
            'never recover',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    onPress: () => {
                        UserPostDeleted(postID);
                    },
                    style: 'destructive',
                },
            ],
            { cancelable: false },
        );
    };
    const UserPostDeleted = postID => {
        setIsPostLiked(!isPostLiked);

        firestore()
            .collection('posts')
            .doc(postID)
            .delete()
            .then(() => {
                Alert.alert('Your post has been deleted');
            });
    };
    let userProfileImaege = authState.userAuthReducer.photoURL;
    let isLogin = authState.userAuthReducer.isLoggedIn;
    console.log(loginState, "login state true and false")

    return (
        <View>
            <View style={{ padding: 10 }}>
                <Card style={{ backgroundColor: '#fff' }} mode="elevated">
                    <View
                        style={{
                            justifyContent: 'space-between',
                            flexDirection: 'row',
                        }}>
                        <View style={{ flexDirection: 'row' }} >
                            <TouchableHighlight activeOpacity={0.6}
                                underlayColor="#DDDDDD"
                                onPress={() => { navigation.navigate('Profile', { id: PostedUser }) }}>
                                <Avatar

                                    style={{ marginVertical: 10, marginHorizontal: 10 }}
                                    source={userImage}>

                                    <Avatar.Badge
                                        bg={
                                            loginState ? 'green.500' : 'red.500'
                                        }
                                    />
                                </Avatar>

                            </TouchableHighlight>
                            <Text
                                style={{
                                    color: 'black',
                                    marginVertical: 20,
                                    marginHorizontal: 5,
                                    fontFamily: StyleGuide.fontFamily.medium,
                                }}>
                                {userName?.charAt(0).toUpperCase() + userName?.slice(1)}
                            </Text>

                        </View>
                        <View>
                            {console.log(date)}
                            <Text
                                style={{
                                    color: 'black',
                                    marginVertical: 20,
                                    fontSize: widthPercentageToDP('3%'),
                                    fontFamily: StyleGuide.fontFamily.regular,
                                    marginHorizontal: 10,
                                }}>
                                {moment(PostedDate).fromNow(false)}
                            </Text>
                        </View>
                    </View>

                    <Card.Cover source={postImage} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row' }}>
                            <AntDesign
                                style={{ marginHorizontal: 10, marginVertical: 15 }}
                                name={likeStatus(arrayLikes) ? 'heart' : 'hearto'}
                                color={likeStatus(arrayLikes) ? 'red' : 'black'}
                                size={20}
                                onPress={() => {
                                    addPostLiked(arrayLikes);
                                }}
                            />
                            <View>
                                {arrayLikes.length > 0 && (
                                    <Text
                                        style={{
                                            marginVertical: 15,
                                            marginHorizontal: 5,
                                            color: 'black',
                                            fontSize: widthPercentageToDP('3.5%'),
                                            fontFamily: StyleGuide.fontFamily.medium,
                                        }}>{`${arrayLikes.length} likes`}</Text>
                                )}
                            </View>

                            <FontAwesome5
                                style={{ marginHorizontal: 10, marginVertical: 15 }}
                                name={'comment'}
                                color={'black'}
                                size={20}
                                onPress={() => {
                                    navigation.navigate('Comment', {
                                        postData: postData,
                                        comments: comments,
                                        setGetData: setGetData,
                                        postID: postID,
                                    });
                                }}
                            />
                            <Text
                                style={{
                                    marginVertical: 15,
                                    marginHorizontal: 5,
                                    color: 'black',
                                    fontSize: widthPercentageToDP('3.5%'),
                                    fontFamily: StyleGuide.fontFamily.medium,
                                }}>
                                {comments.length} comments
                            </Text>
                        </View>
                        {PostedUser === userID ? (
                            <View>
                                <MaterialCommunityIcons
                                    style={{ marginHorizontal: 10, marginVertical: 15 }}
                                    name={'delete'}
                                    color={'red'}
                                    size={22}
                                    onPress={() => {
                                        DeletePost(postID);
                                    }}
                                />
                            </View>
                        ) : null}
                    </View>

                    <View
                        style={{
                            flexDirection: 'row',

                            height: 40,
                        }}>
                        <Text
                            style={{
                                marginVertical: 0,
                                marginHorizontal: 10,

                                color: 'black',
                                fontSize: widthPercentageToDP('3%'),
                                fontFamily: StyleGuide.fontFamily.bold,
                            }}>
                            {userName}
                        </Text>
                        <Paragraph
                            style={{
                                width: '70%',
                                marginVertical: 0,

                                color: 'black',
                                fontSize: widthPercentageToDP('3%'),
                                fontFamily: StyleGuide.fontFamily.regular,
                            }}>
                            {subtitle?.charAt(0).toUpperCase() + subtitle?.slice(1)}
                        </Paragraph>
                    </View>
                    {/* {comments.length == 0 ? null : (
                        <View style={{
                            marginVertical: 5, marginHorizontal: 10,
                        }} >
                            <Text
                                onPress={() => {
                                    navigation.navigate("Comment", {
                                        postData: postData,
                                        comments: comments,
                                        setGetData: setGetData
                                    })
                                }}
                                style={{
                                    color: 'black',
                                    fontFamily: StyleGuide.fontFamily.regular,
                                    fontSize: widthPercentageToDP('3%'),
                                    borderBottomColor: 'grey',
                                    borderBottomWidth: 1, width: '40%'


                                }}>
                                View all {comments.length} comments
                            </Text>
                        </View>
                    )} */}

                    <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
                        <View style={{ flexDirection: 'row' }}>
                            <View>
                                <Avatar
                                    size="sm"
                                    style={{ marginVertical: 10, marginHorizontal: 5 }}
                                    source={{ uri: userProfileImaege }}>
                                    {' '}
                                    <Avatar.Badge bg={isLogin ? 'green.500' : 'red.500'} />
                                </Avatar>
                            </View>

                            <View
                                style={{
                                    width: '75%',
                                }}>
                                <TextInput
                                    style={styles.input}
                                    placeholderTextColor="black"
                                    value={comment}
                                    onChangeText={text => setComment(text)}
                                    placeholder="Add a comment..."
                                />
                            </View>
                        </View>
                        <View>
                            <TouchableOpacity style={styles.postButton} onPress={postComment}>
                                <Text style={styles.buttonText}>Post</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Card>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    input: {
        height: 40,
        margin: 12,
        borderBottomColor: 'grey',
        borderBottomWidth: 1,
        padding: 10,
        color: 'black',
        marginVertical: 10,
        marginHorizontal: 5,
        fontFamily: StyleGuide.fontFamily.regular,
        fontSize: widthPercentageToDP('3%'),
    },
    postButton: {
        height: 50,
        width: 50,
        borderRadius: 5.5,
        marginHorizontal: 5,
        marginVertical: 10,
    },
    buttonText: {
        textAlign: 'center',
        marginVertical: 15,
        color: 'blue',
        fontFamily: StyleGuide.fontFamily.regular,
        fontSize: widthPercentageToDP('3%'),
    },
});

export default CardUI;
