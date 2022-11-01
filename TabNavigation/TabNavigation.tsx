import React from 'react'
import Home from '../screens/Home';
import Profile from '../screens/Profile';
import Post from '../screens/Post/Post'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AntDesign from 'react-native-vector-icons/AntDesign'
const Tab = createBottomTabNavigator();



const TabNavigation = () => {

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    if (route.name === 'Home') {
                        return focused ? (
                            <AntDesign name='home' size={20} color='#8b6ed4' />
                        ) : (
                            <AntDesign name='home' size={20} color='black' />
                        );
                    } else if (route.name === 'Profile') {
                        return focused ? (
                            <AntDesign name='profile' size={20} color='#8b6ed4' />
                        ) : (
                            <AntDesign name='profile' size={20} color='black' />
                        );
                    }
                    else if (route.name === 'Post') {
                        return focused ? (
                            <AntDesign name='plus' size={20} color='#8b6ed4' />
                        ) : (
                            <AntDesign name='plus' size={20} color='black' />
                        );
                    }
                },
            })}
            // tabBarStyle={{paddingVertical: 5,borderTopLeftRadius:15,borderTopRightRadius:15,backgroundColor:'white',position:'absolute',height:50}}

            tabBarLabelStyle={{ paddingBottom: 3 }}
            tabBarOptions={{
                activeTintColor: '#8b6ed4',
                inactiveTintColor: 'gray',
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
            }}>
            <Tab.Screen name="Home" component={Home} options={{ headerShown: false }} />
            <Tab.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
            <Tab.Screen name="Post" component={Post} options={{ headerShown: false }} />




        </Tab.Navigator >
    )
}

export default TabNavigation