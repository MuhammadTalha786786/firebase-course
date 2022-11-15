import { View, Text, SafeAreaView, StyleSheet, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import { useDispatch, useSelector } from 'react-redux';
import FriendListCard from './components/FriendListCard';

const FriendsScreen = () => {
    const authState = useSelector((state: AppState) => state);
    const [friendsList, setFriendsList] = useState([]);
    const userID = authState.userAuthReducer.uid;

    useEffect(() => {
        firestore()
            .collection('users')
            .where('uid', '!=', userID)
            .get()
            .then(res => {
                let userData = []
                res.forEach(documentSnap => {
                    let data = documentSnap.data()
                    userData.push(data)
                });
                setFriendsList(userData)
            });
    }, []);

    console.log(friendsList, 'list of users');
    return (
        <SafeAreaView style={styles.SafeAreaView}>
            <View>
                <FlatList
                    data={friendsList}
                    renderItem={({ item }) => <FriendListCard item={item} />}
                    keyExtractor={item => item.uid}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    SafeAreaView: {
        flex: 1,
        backgroundColor: '#F5F5DC',
    },
});

export default FriendsScreen;
