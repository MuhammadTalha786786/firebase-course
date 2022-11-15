import React, { Component, useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';
import { Avatar } from 'native-base';
import { StyleGuide } from '../Utils/StyleGuide';



const Profile = () => {
    const route = useRoute();
    const fetchID = route.params.id;
    const [userData, setUserData] = useState({});
    console.log(fetchID, "user id ")


    useEffect(() => {
        firestore()
            .collection('users')
            .doc(fetchID)
            .get()
            .then(snapshot => {
                console.log(snapshot.data())
                setUserData(snapshot.data())

            });
    }, [])
    return (
        <View style={styles.container}>
            <View style={styles.header}></View>
            <Avatar

                style={styles.avatar}
                source={{ uri: userData.image }}>

                <Avatar.Badge
                    bg={
                        userData.isLogin ? 'green.500' : 'red.500'
                    }
                />
            </Avatar>
            <View style={styles.body}>
                <View style={styles.bodyContent}>
                    <Text style={styles.name}>{userData.name}</Text>
                    <Text style={styles.info}>{userData.email}</Text>

                    <TouchableOpacity style={styles.buttonContainer}>
                        <Text style={styles.userText}>{userData.name}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonContainer}>
                        <Text style={styles.userText}>{userData.email}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonContainer}>
                        <Text style={styles.userText}> {userData.name}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({

    userText: {
        fontSize: StyleGuide.fontSize.medium,
        fontFamily: StyleGuide.fontFamily.regular,
        color: 'black'
    },
    header: {
        backgroundColor: "#F5F5DC",
        height: 200,
    },
    avatar: {
        width: 130,
        height: 130,
        borderRadius: 63,
        borderWidth: 4,
        borderColor: "white",
        marginBottom: 10,
        alignSelf: 'center',
        position: 'absolute',
        marginTop: 130
    },
    name: {
        fontSize: 22,
        color: "black",
        fontWeight: '600',
    },
    body: {
        marginTop: 40,
    },
    bodyContent: {
        flex: 1,
        alignItems: 'center',
        padding: 30,
    },

    info: {
        fontSize: 16,
        color: "red",
        marginTop: 10
    },
    description: {
        fontSize: 16,
        color: "#696969",
        marginTop: 10,
        textAlign: 'center'
    },
    buttonContainer: {
        marginTop: 10,
        height: 45,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        width: 250,
        borderRadius: 30,
        backgroundColor: "#F5F5DC",
    },
});
export default Profile