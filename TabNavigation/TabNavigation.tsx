import React from 'react';
// import Home from '../screens/Home';
import Post from '../screens/Post/Post';
import FriendsScreen from '../screens/FriendsScreen';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AntDesign from 'react-native-vector-icons/AntDesign';
const Tab = createBottomTabNavigator();

import DrawerNavigation from '../DrawerNavigation/DrawerNavigation';
import {StyleGuide} from '../Utils/StyleGuide';
import {Platform, View, Image} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Notifications from '../screens/Notifications';
import GoogleMaps from '../screens/GoogleMaps';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import { reducerType } from '../Utils/types';

const TabNavigation = () => {
  const authState = useSelector((state:reducerType) => state);
  let mode = authState.darkModeReducer.mode;

  return (
    <Tab.Navigator
 
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          if (route.name === 'Home') {
            return focused ? (
              <AntDesign
                name="home"
                size={20}
                color={StyleGuide.color.primary}
              />
            ) : (
              <AntDesign
                name="home"
                size={20}
                color={mode ? StyleGuide.color.light : '#023047'}
              />
            );
          } else if (route.name === 'Friends') {
            return focused ? (
              <AntDesign
                name="addusergroup"
                size={20}
                color={StyleGuide.color.primary}
              />
            ) : (
              <AntDesign
                name="addusergroup"
                size={20}
                color={mode ? StyleGuide.color.light : '#023047'}
              />
            );
          } else if (route.name === ' ') {
            return focused ? (
              <View
                style={{
                  position: 'absolute',
                  bottom: 20, // space from bottombar
                  height: 58,
                  width: 58,
                  borderRadius: 58,
                  backgroundColor: StyleGuide.color.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <AntDesign
                  name="plus"
                  size={20}
                  color={StyleGuide.color.light}
                />
              </View>
            ) : (
              <View
                style={{
                  position: 'absolute',
                  bottom: 20, // space from bottombar
                  height: 58,
                  width: 58,
                  borderRadius: 58,
                  backgroundColor: StyleGuide.color.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <AntDesign
                  name="plus"
                  size={20}
                  color={StyleGuide.color.light}
                />
              </View>
            );
          } else if (route.name === 'Profile') {
            return focused ? (
              <AntDesign
                name="profile"
                size={20}
                color={StyleGuide.color.primary}
              />
            ) : (
              <AntDesign
                name="profile"
                size={20}
                color={mode ? StyleGuide.color.light : '#023047'}
              />
            );
          } else if (route.name === 'Notifications') {
            return focused ? (
              <AntDesign
                name="notification"
                size={20}
                color={StyleGuide.color.primary}
              />
            ) : (
              <AntDesign
                name="notification"
                size={20}
                color={mode ? StyleGuide.color.light : '#023047'}
              />
            );
          }
        },
        tabBarStyle: {
          height: 70,
          backgroundColor: mode ? 'rgb(40, 42, 54)' : '#f6f8fa',
        },
        headerStyle: {
          backgroundColor: StyleGuide.color.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          textAlign: 'center',
          fontFamily: StyleGuide.fontFamily.regular,
        },
        tabBarActiveTintColor: StyleGuide.color.primary,
        headerTitleAlign: 'center',
      })}
    
      
      >
      <Tab.Screen
        name="Home"
        component={DrawerNavigation}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="Friends"
        component={FriendsScreen}
        options={{headerShown: true}}
      />
      <Tab.Screen
        name=" "
        component={Post}
        options={{headerShown: true, title: 'Create Post'}}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{headerShown: true}}
      />
      <Tab.Screen
        name="Notifications"
        component={Notifications}
        options={{headerShown: true}}
      />
     
    </Tab.Navigator>
  );
};

export default TabNavigation;
