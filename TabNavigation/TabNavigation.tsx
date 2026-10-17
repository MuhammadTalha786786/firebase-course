import React from 'react';
import Post from '../screens/Post/Post';
import FriendsScreen from '../screens/FriendsScreen';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DrawerNavigation from '../DrawerNavigation/DrawerNavigation';
import ReelsScreen from '../screens/Reels/ReelsScreen';
import {StyleGuide} from '../Utils/StyleGuide';
import {Platform, View} from 'react-native';
import {useSelector} from 'react-redux';
import Notifications from '../screens/Notifications';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import {reducerType} from '../Utils/types';

const Tab = createBottomTabNavigator();

const TabNavigation = () => {
  const authState = useSelector((state: reducerType) => state);
  const mode = authState.darkModeReducer.mode;
  const isDarkMode = Boolean(mode);

  const inactiveColor = isDarkMode ? '#64748B' : '#94A3B8';
  const activeColor = StyleGuide.color.primary;

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused}) => {
          if (route.name === 'Home') {
            return (
              <AntDesign
                name="home"
                size={22}
                color={focused ? activeColor : inactiveColor}
              />
            );
          } else if (route.name === 'Reels') {
            return (
              <Ionicons
                name={focused ? 'film' : 'film-outline'}
                size={23}
                color={focused ? activeColor : inactiveColor}
              />
            );
          } else if (route.name === 'Friends') {
            return (
              <AntDesign
                name="addusergroup"
                size={22}
                color={focused ? activeColor : inactiveColor}
              />
            );
          } else if (route.name === ' ') {
            return (
              <View
                style={{
                  position: 'absolute',
                  bottom: 12,
                  height: 52,
                  width: 52,
                  borderRadius: 26,
                  backgroundColor: StyleGuide.color.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: StyleGuide.color.primary,
                  shadowOffset: {width: 0, height: 4},
                  shadowOpacity: 0.35,
                  shadowRadius: 8,
                  elevation: 6,
                }}>
                <AntDesign name="plus" size={24} color="#FFFFFF" />
              </View>
            );
          } else if (route.name === 'Profile') {
            return (
              <AntDesign
                name="user"
                size={22}
                color={focused ? activeColor : inactiveColor}
              />
            );
          } else if (route.name === 'Notifications') {
            return (
              <AntDesign
                name="notification"
                size={22}
                color={focused ? activeColor : inactiveColor}
              />
            );
          }
        },
        tabBarShowLabel: false,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 82 : 64,
          backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
          borderTopColor: isDarkMode ? '#1E293B' : '#E2E8F0',
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: StyleGuide.color.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontFamily: StyleGuide.fontFamily.bold,
          fontSize: 18,
        },
        tabBarActiveTintColor: StyleGuide.color.primary,
        tabBarInactiveTintColor: inactiveColor,
        headerTitleAlign: 'center',
      })}>
      <Tab.Screen
        name="Home"
        component={DrawerNavigation}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="Reels"
        component={ReelsScreen}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name=" "
        component={Post}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="Friends"
        component={FriendsScreen}
        options={{headerShown: false}}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{headerShown: true, title: 'My Profile'}}
      />
    </Tab.Navigator>
  );
};

export default TabNavigation;
