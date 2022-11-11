import React from 'react'
import Home from '../screens/Home';
import Profile from '../screens/Profile';
import Post from '../screens/Post/Post'
import FriendsScreen from '../screens/FriendsScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AntDesign from 'react-native-vector-icons/AntDesign'
const Tab = createBottomTabNavigator();
import ProfileScreen from '../screens/ProfileScreen';



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
                    }
                    else if (
                        route.name === 'Friends'
                    ) {
                        return focused ? (
                            <AntDesign name='addusergroup' size={20} color='#8b6ed4' />
                        ) : (
                            <AntDesign name='addusergroup' size={20} color='black' />
                        );
                    }
                    else if (route.name === 'Post') {
                        return focused ? (
                            <AntDesign name='plus' size={20} color='#8b6ed4' />
                        ) : (
                            <AntDesign name='plus' size={20} color='black' />
                        );
                    }
                    else if (route.name === 'Profile') {
                        return focused ? (
                            <AntDesign name='profile' size={20} color='#8b6ed4' />
                        ) : (
                            <AntDesign name='profile' size={20} color='black' />
                        );
                    }
                },
            })}

            tabBarLabelStyle={{ paddingBottom: 3 }}
        >
            <Tab.Screen name="Home" component={Home} options={{ headerShown: false }} />
            <Tab.Screen name="Friends" component={FriendsScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Post" component={Post} options={{ headerShown: false }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />

        </Tab.Navigator >
    )
}

export default TabNavigation