import {View, Text, Image, TouchableOpacity, Switch, StyleSheet} from 'react-native';
import React from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import Home from '../screens/Home/Home';
import {StyleGuide} from '../Utils/StyleGuide';
import {DrawerActions} from '@react-navigation/native';
import {Avatar} from 'native-base';
import {setDarkMode} from '../Redux/Auth/DarkMode';
import {useDispatch, useSelector} from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import GoogleMaps from '../screens/GoogleMaps';
import VideoComponent from '../screens/VideoComponent';
import ReelsScreen from '../screens/Reels/ReelsScreen';
import Notifications from '../screens/Notifications';
import {setSignOut} from '../Redux/Auth/AuthReducer';
import {reducerType} from '../Utils/types';

const Drawer = createDrawerNavigator();

const DrawerNavigation = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: reducerType) => state);
  const mode = authState.darkModeReducer.mode;
  const isDark = Boolean(mode);
  const userData = authState.userAuthReducer.userData?.user;

  const logoutUser = () => {
    dispatch(setSignOut());
  };

  const bgColor = isDark ? '#0F172A' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? '#1E293B' : '#E2E8F0';
  const buttonBg = isDark ? '#1E293B' : '#F1F5F9';

  return (
    <Drawer.Navigator
      defaultScreenOptions={{
        drawerLabelStyle: {
          fontFamily: StyleGuide.fontFamily.medium,
        },
      }}
      drawerContent={props => (
        <View style={{flex: 1, backgroundColor: bgColor}}>
          <DrawerContentScrollView {...props}>
            {/* User Profile Header in Drawer */}
            <View style={[styles.drawerProfileHeader, {borderBottomColor: borderColor}]}>
              {userData?.image ? (
                <Avatar
                  size="lg"
                  source={{uri: userData?.image}}
                  style={{borderWidth: 2, borderColor: StyleGuide.color.primary}}
                />
              ) : (
                <View
                  style={[
                    styles.avatarFallback,
                    {backgroundColor: StyleGuide.color.primaryLight},
                  ]}>
                  <Text style={styles.avatarFallbackText}>
                    {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
              )}
              <Text style={[styles.drawerUserName, {color: textColor}]} numberOfLines={1}>
                {userData?.name || 'Welcome to Social Bea'}
              </Text>
              <Text style={[styles.drawerUserEmail, {color: subtextColor}]} numberOfLines={1}>
                {userData?.email || ''}
              </Text>
            </View>

            {/* Drawer Items */}
            <View style={{paddingTop: 8}}>
              <DrawerItemList {...props} />
            </View>

            {/* Dark Mode Switch Row */}
            <View
              style={[
                styles.drawerItemRow,
                {
                  borderTopColor: borderColor,
                  marginTop: 16,
                  paddingTop: 16,
                },
              ]}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Feather
                  name={isDark ? 'moon' : 'sun'}
                  size={20}
                  color={isDark ? '#F59E0B' : '#64748B'}
                  style={{marginRight: 14}}
                />
                <Text style={[styles.drawerLabel, {color: textColor}]}>
                  Dark Mode
                </Text>
              </View>
              <Switch
                thumbColor="#FFFFFF"
                trackColor={{
                  false: '#CBD5E1',
                  true: StyleGuide.color.primary,
                }}
                onValueChange={() => {
                  dispatch(setDarkMode({mode: !mode}));
                }}
                value={isDark}
              />
            </View>
          </DrawerContentScrollView>

          {/* Logout Button */}
          <View style={[styles.drawerFooter, {borderTopColor: borderColor}]}>
            <TouchableOpacity
              onPress={logoutUser}
              activeOpacity={0.7}
              style={[styles.logoutBtn, {backgroundColor: isDark ? '#1E293B' : '#FEE2E2'}]}>
              <Feather name="log-out" size={18} color="#EF4444" />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      screenOptions={({navigation}) => ({
        drawerStyle: {
          backgroundColor: bgColor,
          width: 290,
        },
        drawerActiveTintColor: StyleGuide.color.primary,
        drawerInactiveTintColor: subtextColor,
        drawerActiveBackgroundColor: isDark ? '#1E293B' : StyleGuide.color.primaryLight,
        drawerLabelStyle: {
          fontFamily: StyleGuide.fontFamily.medium,
          fontSize: 14,
        },
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: bgColor,
          borderBottomWidth: 1,
          borderBottomColor: borderColor,
          elevation: 0,
          shadowOpacity: 0,
        },
        // Modern Brand Wordmark in Header
        headerTitle: () => (
          <View style={styles.headerTitleWrap}>
            <Image
              source={require('../images/logo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <Text style={styles.headerTitleBrand}>
              Social<Text style={{color: textColor}}>Bea</Text>
            </Text>
          </View>
        ),
        headerLeft: () => (
          <TouchableOpacity
            style={[styles.headerIconButton, {backgroundColor: buttonBg, marginLeft: 14}]}
            activeOpacity={0.7}
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
            <Feather name="menu" size={20} color={textColor} />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <View style={{flexDirection: 'row', alignItems: 'center', marginRight: 14}}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
              style={[styles.headerIconButton, {backgroundColor: buttonBg, marginRight: 8}]}
              activeOpacity={0.7}>
              <Feather size={18} color={textColor} name="bell" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                dispatch(setDarkMode({mode: !mode}));
              }}
              style={[styles.headerIconButton, {backgroundColor: buttonBg}]}
              activeOpacity={0.7}>
              {isDark ? (
                <Feather size={18} color="#F59E0B" name="sun" />
              ) : (
                <Ionicons size={18} color="#6366F1" name="moon" />
              )}
            </TouchableOpacity>
          </View>
        ),
      })}>
      <Drawer.Screen
        name="Home"
        component={Home}
        options={{
          drawerIcon: ({color, size}) => (
            <Feather name="home" color={color} size={20} />
          ),
        }}
      />
      <Drawer.Screen
        name="Reels"
        component={ReelsScreen}
        options={{
          drawerIcon: ({color, size}) => (
            <Feather name="video" color={color} size={20} />
          ),
        }}
      />
      <Drawer.Screen
        name="Notifications"
        component={Notifications}
        options={{
          drawerIcon: ({color, size}) => (
            <Feather name="bell" color={color} size={20} />
          ),
        }}
      />
      <Drawer.Screen
        name="Google Map"
        component={GoogleMaps}
        options={{
          drawerIcon: ({color, size}) => (
            <Feather name="map-pin" color={color} size={20} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogo: {
    width: 26,
    height: 26,
    marginRight: 6,
  },
  headerTitleBrand: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 20,
    color: StyleGuide.color.primary,
    letterSpacing: -0.5,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerProfileHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 22,
    color: StyleGuide.color.primaryDark,
  },
  drawerUserName: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 17,
    marginTop: 12,
  },
  drawerUserEmail: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 13,
    marginTop: 2,
  },
  drawerItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  drawerLabel: {
    fontFamily: StyleGuide.fontFamily.medium,
    fontSize: 14,
  },
  drawerFooter: {
    padding: 16,
    borderTopWidth: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },
  logoutText: {
    color: '#EF4444',
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 14,
    marginLeft: 8,
  },
});

export default DrawerNavigation;
