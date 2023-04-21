import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { Avatar } from 'native-base';
import { StyleGuide } from '../../Utils/StyleGuide';
import { widthPercentageToDP } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import { StackParamList } from '../../Utils/routes';


const FriendListCard = ({ item, mode }) => {
  const navigation =useNavigation<NativeStackNavigationProp<StackParamList>>();
  return (
    <View style={{ padding: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View
          style={[
            styles.listItem,
            { backgroundColor: mode ? 'rgb(40, 42, 54)' : '#f6f8fa' },
          ]}>
          <Avatar
            size={'lg'}
            style={{ marginVertical: 10, marginHorizontal: 10 }}
            source={{ uri: item.image }}>
            <Avatar.Badge bg={item.isLogin ? 'green.500' : 'red.500'} />
          </Avatar>

          <View   >
            <Text
              style={[
                styles.title,
                { color: mode ? StyleGuide.color.light : StyleGuide.color.dark },
              ]}>
              {item.name.charAt(0).toUpperCase() + item.name.slice(1)}{' '}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ChatsScreen', {
                receiverName: item.name,
                receiverImage: item.image,
                receiverLogin: item.isLogin,
                receiverID: item.uid
              })
            }
          >
            <Image
             
              style={{ marginVertical: 20, marginHorizontal: 5, width: 50, height: 50 }}
              source={require("../../images/chat.png")}>

            </Image>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    color: '#101010',
    marginTop: 60,
    fontWeight: '700',
  },
  listItem: {
    padding: 30,
    marginTop: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    borderRadius: 12,
    color: 'red',
    // color: 'rgb(57, 58, 52)',
    shadowColor: 'grey',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  followingButton: {
    backgroundColor: StyleGuide.color.primary,
    width: 50,
    height: 40,
    borderRadius: 4,
    marginHorizontal: 10,
    marginVertical: 30,
  },
  coverImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  // metaInfo: {
  //   marginVertical: 10,
  //   marginHorizontal: 10,
  // },
  title: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: widthPercentageToDP('4%'),
    width: 200,
    marginVertical: 30,
    marginHorizontal: 5


  },
});

export default FriendListCard;
