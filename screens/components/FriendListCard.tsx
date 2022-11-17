import {View, Text, Image, StyleSheet} from 'react-native';
import React from 'react';
import {Avatar} from 'native-base';

const FriendListCard = ({item}) => {
  console.log(item, 'user item');
  return (
    <View>
      <View style={styles.listItem}>
        <Avatar
          style={{marginVertical: 10, marginHorizontal: 10}}
          source={{uri: item.image}}>
          <Avatar.Badge bg={item.isLogin ? 'green.500' : 'red.500'} />
        </Avatar>

        <View style={styles.metaInfo}>
          <Text style={styles.title}>{item.name} </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    color: '#101010',
    marginTop: 60,
    fontWeight: '700',
  },
  listItem: {
    padding: 10,
    marginTop: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    width: '100%',
  },
  coverImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  metaInfo: {
    marginVertical: 10,
    marginHorizontal: 10,
  },
  title: {
    color: 'black',
    fontSize: 18,
    width: 200,
    padding: 10,
  },
});

export default FriendListCard;
