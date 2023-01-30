import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
    FlatList,
    Dimensions,
    Alert,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import uuid from 'react-native-uuid';
import moment from 'moment';
import { StyleGuide } from '../Utils/StyleGuide';
import { useFocusEffect } from '@react-navigation/native';

export default function ChatScreen({ navigation }) {
    const route = useRoute();
    const { receiverName, receiverImage, receiverLogin, receiverID } = route.params;
    const authState = useSelector((state: AppState) => state.userAuthReducer);
    const modeReducer = useSelector((state: AppState) => state.darkModeReducer);
    const mode = modeReducer.mode;
    console.warn(mode, 'mode');
    const [messageSend, setMesssageSend] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    let senderName = authState.userName;
    let senderID = authState.uid;
    const sendMessage = () => {
        setMesssageSend(!messageSend);
        if (inputMessage === '') {
            return setInputMessage('');
        }
        let id = uuid.v4();
        const messageData = {
            senderName: senderName,
            senderID: senderID,
            receiverName: receiverName,
            receiverID: receiverID,
            messageID: id,
            timeofSend: moment(new Date()).format('LT'),
            message: inputMessage,
        };

        firestore()
            .collection('messages')
            .doc(id)
            .set(messageData)
            .then(() => {
                console.log('Message added!');
            })
            .catch(error => {
                console.log(error);
            });
    };

    useEffect(() => {
        navigation.setOptions({
            title: '',
            headerStyle: {
                backgroundColor: mode ? StyleGuide.color.dark : StyleGuide.color.light,
            },
            headerLeft: () => (
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        style={{ paddingRight: 10 }}
                        onPress={() => {
                            navigation.goBack();
                        }}>
                        <Icon
                            name="angle-left"
                            type="font-awesome"
                            size={30}
                            color={mode ? StyleGuide.color.light : StyleGuide.color.dark}
                        />
                    </TouchableOpacity>
                    <Image
                        style={styles.userProfileImage}
                        source={{ uri: receiverImage }}
                    />
                    <View
                        style={{
                            paddingLeft: 10,
                            justifyContent: 'center',
                        }}>
                        <Text
                            style={{
                                color: mode ? StyleGuide.color.light : StyleGuide.color.dark,
                                fontSize: 18,
                                fontFamily: StyleGuide.fontFamily.medium,
                            }}>
                            {receiverName}
                        </Text>
                        <Text
                            style={{
                                color: '#111',
                                fontFamily: StyleGuide.fontFamily.medium,
                                color: mode ? StyleGuide.color.light : StyleGuide.color.dark,
                            }}>
                            {receiverLogin ? 'online' : 'offline'}
                        </Text>
                    </View>
                </View>
            ),
        });
    }, []);

    console.log(receiverID);
    console.warn(senderID);

    useFocusEffect(
        React.useCallback(() => {
            getMessages();
        }, [messageSend, navigation]),
    );

    const getMessages = () => {
        firestore()
            .collection('messages')
            .orderBy('timeofSend')
            .get()
            .then(res => {
                let tempArray = [];
                console.log(res);
                res.forEach(documentSnapshot => {
                    let data = documentSnapshot.data();

                    if (
                        [senderID, receiverID].includes(data.senderID) &&
                        [senderID, receiverID].includes(data.receiverID)
                    )
                        tempArray.push(data);
                });
                setMessages(tempArray);
            });
    };

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View
                style={[
                    styles.container,
                    {
                        backgroundColor: mode
                            ? StyleGuide.color.dark
                            : StyleGuide.color.light,
                    },
                ]}>
                <FlatList
                    style={{
                        backgroundColor: mode
                            ? StyleGuide.color.dark
                            : StyleGuide.color.light,
                    }}
                    inverted={true}
                    data={JSON.parse(JSON.stringify(messages)).reverse()}
                    renderItem={({ item }) => (
                        <TouchableWithoutFeedback>
                            <View style={{ marginTop: 6 }}>
                                <View
                                    style={{
                                        maxWidth: Dimensions.get('screen').width * 0.8,
                                        backgroundColor:
                                            item.senderID === senderID ? '#3a6ee8' : '#2E3359',
                                        alignSelf:
                                            item.senderID === senderID ? 'flex-end' : 'flex-start',
                                        marginHorizontal: 10,
                                        padding: 10,
                                        borderRadius: 8,
                                        borderBottomLeftRadius: item.senderID === senderID ? 8 : 0,
                                        borderBottomRightRadius: item.senderID === senderID ? 0 : 8,
                                    }}>
                                    <Text
                                        style={{
                                            color: '#fff',
                                            fontSize: 16,
                                            fontFamily: StyleGuide.fontFamily.medium,
                                        }}>
                                        {item.message}
                                    </Text>
                                    <Text
                                        style={{
                                            color: '#dfe4ea',
                                            fontSize: 14,
                                            alignSelf: 'flex-end',
                                            fontFamily: StyleGuide.fontFamily.medium,
                                        }}>
                                        {item.timeofSend}
                                    </Text>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    )}
                />

                <View style={{ paddingVertical: 10 }}>
                    <View
                        style={{
                            ...styles.messageInputView,
                            backgroundColor: 'rgb(57, 58, 52)',
                        }}>
                        <TextInput
                            defaultValue={inputMessage}
                            style={{ ...styles.messageInput, color: StyleGuide.color.light }}
                            placeholder="Message"
                            onChangeText={text => setInputMessage(text)}
                            onSubmitEditing={() => {
                                sendMessage();
                            }}
                        />
                        <TouchableOpacity
                            style={styles.messageSendView}
                            onPress={() => {
                                sendMessage();
                            }}>
                            <Icon
                                name="send"
                                type="material"
                                color={StyleGuide.color.light}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    headerLeft: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    userProfileImage: { height: '100%', aspectRatio: 1, borderRadius: 100 },
    container: {
        flex: 1,
    },
    messageInputView: {
        display: 'flex',
        flexDirection: 'row',
        marginHorizontal: 10,
        borderRadius: 3.3,
        height: 50,
    },
    messageInput: {
        height: 50,
        flex: 1,
        paddingHorizontal: 10,
    },
    messageSendView: {
        paddingHorizontal: 10,
        justifyContent: 'center',
    },
});
