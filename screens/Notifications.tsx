import { View, Text, SafeAreaView, FlatList, StyleSheet } from 'react-native';
import React, { useEffect, useState, } from 'react';
import firestore from '@react-native-firebase/firestore';
import { useDispatch, useSelector } from 'react-redux';
import Lottie from 'lottie-react-native';
import NotificationCard from './components/NotificationCard';



const Notifications = () => {
    const authState = useSelector((state: AppState) => state);
    const [likedPeople, setLikedPeople] = useState([]);
    const uid = authState.userAuthReducer.uid;
    const [visible, setVisible] = useState(false);
    const mode = authState.darkModeReducer.mode;
    console.log(uid, "uid")
    useEffect(() => {
        setVisible(true)
        firestore()
            .collection('posts')
            .where('userID', '==', uid)
            .get()
            .then(res => {
                console.log(res, "response of posts")
                let peopleWhoLiked = [];

                res.forEach(documentSnapshot => {
                    console.log(documentSnapshot.data(), "data")
                    if (documentSnapshot.data().userID === uid) { }
                    let newLikes = documentSnapshot
                        .data()
                        .likes.filter(el => el.userID !== uid);
                    peopleWhoLiked.push(newLikes)
                    setVisible(false)

                });
                setLikedPeople(peopleWhoLiked);
            });
    }, []);



    console.log(likedPeople, "liked people")
    return (
        <SafeAreaView>
            <View style={{ justifyContent: 'center' }}>

                {visible ? <View >

                    <Lottie style={{ height: 100 }}
                        source={require('../9764-loader.json')} autoPlay loop />

                </View> : <FlatList
                    data={likedPeople}
                    renderItem={({ item }) => <NotificationCard item={item} mode={mode} />}
                    keyExtractor={item => item.uid}
                />}



            </View>
        </SafeAreaView>

    );
};
const styles = StyleSheet.create({
    lottie: {
        width: 100,
        height: 100,
    },
});
export default Notifications;
