import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React, { useState, useLayoutEffect } from 'react'
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import uuid from 'react-native-uuid';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';
import { StyleGuide } from '../../Utils/StyleGuide';
import { Icon } from 'react-native-elements';
import { StackParamList } from '../../Utils/routes';
import { reducerType } from '../../Utils/types';




type Props = RouteProp<StackParamList, 'ChatsScreen'>;

export const useChat = () => {





  const [messageSend, setMesssageSend] = useState<boolean>(false);
  const [messages, setMessages] = useState<FirebaseFirestoreTypes.DocumentData>([]);
  const [inputMessage, setInputMessage] = useState<string>('');


  const route = useRoute<Props>();
  const { receiverName, receiverImage, receiverLogin, receiverID } = route?.params;
  const authState = useSelector(
    (state: reducerType) => state.userAuthReducer,
  );
  const modeReducer = useSelector(
    (state: reducerType) => state.darkModeReducer,
  );
  const navigation = useNavigation()
  const mode = modeReducer.mode;


  let senderName = authState.userName;
  let senderID = authState.uid;


  const sendMessage = () => {
    setMesssageSend(!messageSend);
    if (inputMessage === '') {
      return setInputMessage('');
    }
    let id = uuid.v4() as string
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
        setInputMessage('')
      })
      .catch(error => {
        console.log(error);
      });

  };

  useLayoutEffect(() => {
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
          <Image style={styles.userProfileImage} source={{ uri: receiverImage }} />
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
                // color: '#111',
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
        let tempArray: FirebaseFirestoreTypes.DocumentData = [];
        console.log(res);
        res.forEach((documentSnapshot: FirebaseFirestoreTypes.DocumentData) => {
          let data: FirebaseFirestoreTypes.DocumentData = documentSnapshot.data();

          if (
            [senderID, receiverID].includes(data.senderID) &&
            [senderID, receiverID].includes(data.receiverID)
          )
            tempArray.push(data);
        });
        setMessages(tempArray);
      });
  };



  return {
    mode,
    messages,
    inputMessage,
    setInputMessage,
    sendMessage,
    senderID,
  };

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
});

