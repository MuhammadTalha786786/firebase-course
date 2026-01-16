import React from 'react';
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
import {Icon} from 'react-native-elements';
import { StyleGuide } from '../../Utils/StyleGuide';
import { useChat } from './useChat';



type messageType= {

      message:string
      messageID:string
      receiverID:string
      receiverName:string
      senderID:string
      senderName:string
      timeofsend:string
      createdAt:Date

  }

  export default function ChatScreen({navigation}) {
  const {mode, messages, inputMessage, setInputMessage, sendMessage, senderID} =
    useChat();


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
          renderItem={({item}:{item:messageType}) => (
            <TouchableWithoutFeedback>
              <View style={{marginTop: 6}}>
                <View
                  style={{
                    maxWidth: Dimensions.get('screen').width * 0.8,
                    backgroundColor:
                      item?.senderID === senderID ? '#3a6ee8' : '#2E3359',
                    alignSelf:
                      item?.senderID === senderID ? 'flex-end' : 'flex-start',
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
                    {item?.message}
                  </Text>
                  <Text
                    style={{
                      color: '#dfe4ea',
                      fontSize: 14,
                      alignSelf: 'flex-end',
                      fontFamily: StyleGuide.fontFamily.medium,
                    }}>

                      {item?.timeofsend}
                     
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          )}
        />

        <View style={{paddingVertical: 10}}>
          <View
            style={{
              ...styles.messageInputView,
              backgroundColor:  mode ? '#fff':'#000',
            }}>
            <TextInput
              defaultValue={inputMessage}
              style={{...styles.messageInput, color: mode ? StyleGuide.color.dark:StyleGuide.color.light}}
              placeholder="Message"
              onChangeText={text => setInputMessage(text)}
              // onSubmitEditing={() => {
              //   sendMessage();
              // }}
            />
            <TouchableOpacity
              style={styles.messageSendView}
              onPress={() => {
                sendMessage();
              }}>
              <Icon
                name="send"
                type="material"
                color=  { mode ? StyleGuide.color.dark:StyleGuide.color.light }
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
  userProfileImage: {height: '100%', aspectRatio: 1, borderRadius: 100},
  container: {
    flex: 1,
  },
  messageInputView: {
    display: 'flex',
    flexDirection: 'row',
    marginHorizontal: 10,
    borderRadius: 3.3,
    height: 55,
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
