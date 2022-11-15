import React from 'react'
import Home from '../screens/Home';
import Profile from '../screens/Profile';
import Post from '../screens/Post/Post'
import FriendsScreen from '../screens/FriendsScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AntDesign from 'react-native-vector-icons/AntDesign'
const Tab = createBottomTabNavigator();
import ProfileScreen from '../screens/ProfileScreen';
import DrawerNavigation from '../DrawerNavigation/DrawerNavigation';
import { StyleGuide } from '../Utils/StyleGuide';
import { Platform } from 'react-native'


const TabNavigation = () => {

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    if (route.name === 'Home') {
                        return focused ? (
                            <AntDesign name='home' size={20} color={'#ffff'} />
                        ) : (
                            <AntDesign name='home' size={20} color='black' />
                        );
                    }
                    else if (
                        route.name === 'Friends'
                    ) {
                        return focused ? (
                            <AntDesign name='addusergroup' size={20} color={"#ffff"} />
                        ) : (
                            <AntDesign name='addusergroup' size={20} color='black' />
                        );
                    }
                    else if (route.name === 'Post') {
                        return focused ? (
                            <AntDesign name='plus' size={20} color={'#ffff'} />
                        ) : (
                            <AntDesign name='plus' size={20} color='black' />
                        );
                    }
                    else if (route.name === 'Profile') {
                        return focused ? (
                            <AntDesign name='profile' size={20} color={'#fff'} />
                        ) : (
                            <AntDesign name='profile' size={20} color='black' />
                        );
                    }
                },
                tabBarStyle: {
                    height: 70,
                    backgroundColor: StyleGuide.color.primary,
                    borderRadius: 5,
                    borderTopStartRadius: 5,
                    borderTopEndRadius: 5,
                    marginHorizontal: 4,
                    margin: 0
                },
                headerStyle: {
                    backgroundColor: StyleGuide.color.primary,
                },
            })


            }

            tabBarOptions={{
                labelStyle: {
                    fontSize: 10,
                    margin: 0,
                    padding: 0,
                },
                activeTintColor: "#ffff",
                inactiveTintColor: 'black',
                style: {
                    // paddingHorizontal:25,
                    // height: 50,
                    // width: 300,
                    // flexDirection: 'column',
                    // alignSelf: 'center',
                    // elevation: 2,
                    // borderTopStartRadius: 5,
                    // borderTopEndRadius: 5,
                },
            }}


        >

            <Tab.Screen name="Home" component={DrawerNavigation} options={{ headerShown: false }} />
            <Tab.Screen name="Friends" component={FriendsScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Post" component={Post} options={{ headerShown: false }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />



        </Tab.Navigator >
    )
}

export default TabNavigation