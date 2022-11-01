import { View, Text } from 'react-native';
import React, { useState, useEffect } from 'react';
import { StyleGuide } from '../../Utils/StyleGuide';
import { Button, Card, Title, Paragraph } from 'react-native-paper';
import { Avatar } from 'native-base';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useDispatch, useSelector } from 'react-redux';
import database from '@react-native-firebase/database';
import firestore from '@react-native-firebase/firestore';

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
}) => {
    const authState = useSelector((state: AppState) => state);
    let userID = authState.userAuthReducer.uid;

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
            let findCurrent = arrayLikes.find((item) => item === userID)
            console.log(findCurrent)
            if (findCurrent) {
                arrayLikes = arrayLikes.filter(el => userID !== el);
            }
            else { arrayLikes?.push(userID); }

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
    return (
        <View>
            <View style={{ padding: 10 }}>
                <Card
                    style={{ backgroundColor: '#F5F5DC', borderColor: 'red' }}
                    mode="outlined">
                    <View style={{ flexDirection: 'row' }}>
                        <Avatar
                            style={{ marginVertical: 10, marginHorizontal: 10 }}
                            source={userImage}
                        />
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

                    <Card.Cover source={postImage} />
                    <Card.Content>
                        <Title
                            style={{
                                color: 'black',
                                fontFamily: StyleGuide.fontFamily.medium,
                            }}>
                            {title?.charAt(0).toUpperCase() + title?.slice(1)}
                        </Title>
                        <Paragraph
                            style={{
                                color: 'black',

                                fontFamily: StyleGuide.fontFamily.medium,
                            }}>
                            {subtitle?.charAt(0).toUpperCase() + subtitle?.slice(1)}
                        </Paragraph>
                    </Card.Content>
                    <View style={{ flexDirection: 'row' }}>

                        <AntDesign
                            style={{ marginHorizontal: 10, marginVertical: 5 }}
                            name={likeStatus(arrayLikes) ? 'heart' : 'hearto'}
                            color={likeStatus(arrayLikes) ? 'red' : 'black'}
                            size={20}
                            onPress={() => {
                                addPostLiked(arrayLikes);
                            }}
                        />

                        {arrayLikes.length > 0 && (
                            <Text
                                style={{
                                    marginVertical: 5,
                                }}>{`${arrayLikes.length} people likes`}</Text>
                        )}
                    </View>
                </Card>
            </View>
        </View>
    );
};

export default CardUI;
