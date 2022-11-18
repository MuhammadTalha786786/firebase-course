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
import { Platform, View, Image } from 'react-native'
import { useDispatch, useSelector } from 'react-redux';
import Notifications from '../screens/Notifications';

const TabNavigation = () => {
    const authState = useSelector((state: AppState) => state);
    let mode = authState.darkModeReducer.mode;



    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    if (route.name === 'Home') {
                        return focused ? (
                            <AntDesign name='home' size={20} color={StyleGuide.color.primary} />
                        ) : (
                            <AntDesign name='home' size={20} color={mode ? StyleGuide.color.light : "#023047"} />
                        );
                    }
                    else if (
                        route.name === 'Friends'
                    ) {
                        return focused ? (
                            <AntDesign name='addusergroup' size={20} color={StyleGuide.color.primary} />
                        ) : (
                            <AntDesign name='addusergroup' size={20} color={mode ? StyleGuide.color.light : "#023047"} />
                        );
                    }
                    else if (route.name === ' ') {
                        return focused ? (
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: 20, // space from bottombar
                                    height: 58,
                                    width: 58,
                                    borderRadius: 58,
                                    backgroundColor: '#5a95ff',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                <AntDesign name='plus' size={20} color={StyleGuide.color.light} />

                            </View>
                        ) : (
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: 20, // space from bottombar
                                    height: 58,
                                    width: 58,
                                    borderRadius: 58,
                                    backgroundColor: '#5a95ff',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                <AntDesign name='plus' size={20} color={StyleGuide.color.light} />

                            </View>
                        );
                    }
                    else if (route.name === 'Profile') {
                        return focused ? (
                            <AntDesign name='profile' size={20} color={StyleGuide.color.primary} />
                        ) : (
                            <AntDesign name='profile' size={20} color={mode ? StyleGuide.color.light : "#023047"} />
                        );
                    }
                    else if (route.name === 'Notifications') {
                        return focused ? (
                            <AntDesign name='notification' size={20} color={StyleGuide.color.primary} />
                        ) : (
                            <AntDesign name='notification' size={20} color={mode ? StyleGuide.color.light : "#023047"} />
                        );
                    }
                },
                tabBarStyle: {
                    height: 70,
                    backgroundColor: mode ? 'rgb(40, 42, 54)' : '#f6f8fa',
                    borderRadius: 5,
                    borderTopStartRadius: 5,
                    borderTopEndRadius: 5,
                    marginHorizontal: 4,
                    margin: 0
                },
                headerStyle: {
                    backgroundColor: StyleGuide.color.primary,

                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    textAlign: 'center',
                    fontFamily: StyleGuide.fontFamily.regular,
                },
                headerTitleAlign: 'center'

            })


            }

            tabBarOptions={{
                labelStyle: {
                    fontSize: 10,
                    margin: 0,
                    padding: 0,
                },
                activeTintColor: StyleGuide.color.primary,
                inactiveTintColor: mode ? StyleGuide.color.light : "#023047",
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
            <Tab.Screen name="Friends" component={FriendsScreen} options={{ headerShown: true }} />
            <Tab.Screen name=" " component={Post} options={{ headerShown: true, title: "Create Post" }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: "Profile" }} />
            <Tab.Screen name="Notifications" component={Notifications} options={{ headerShown: true }} />




        </Tab.Navigator >
    )
}

export default TabNavigation