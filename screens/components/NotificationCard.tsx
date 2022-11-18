import { View, Text, Image, StyleSheet } from 'react-native';
import React from 'react';
import { Avatar } from 'native-base';
import { StyleGuide } from '../../Utils/StyleGuide';
import { widthPercentageToDP } from 'react-native-responsive-screen';

const NotificationCard = ({ item, mode }) => {
    console.log(mode, 'user item');
    return (
        <View style={{ padding: 10 }}>
            <View
                style={[
                    styles.listItem,
                    { backgroundColor: mode ? 'rgb(40, 42, 54)' : '#f6f8fa' },
                ]}>
                <Avatar
                    size={'md'}
                    style={{ marginVertical: 3, marginHorizontal: 3 }}
                    source={{ uri: item.userProfileImaege }}>
                    {/* <Avatar.Badge bg={item.isLogin ? 'green.500' : 'red.500'} /> */}
                </Avatar>

                <View style={styles.metaInfo}>
                    <Text
                        style={[
                            styles.title,
                            { color: mode ? StyleGuide.color.light : StyleGuide.color.dark },
                        ]}>
                        {/* {item.userName.charAt(0).toUpperCase() + item.userName.slice(1)}{' '} */}
                    </Text>
                    <Text>
                        Liked Your Post  {item.postDetail}
                    </Text>
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
        borderRadius: 5,
        color: 'rgb(57, 58, 52)',
        shadowColor: 'grey',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 2,
        height: 120
    },
    coverImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    metaInfo: {
        marginVertical: 5,
        marginHorizontal: 5,
    },
    title: {
        fontFamily: StyleGuide.fontFamily.regular,
        fontSize: widthPercentageToDP('4%'),
        width: 200,
        padding: 10,
    },
});

export default NotificationCard;
