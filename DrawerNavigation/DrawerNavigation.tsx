import {View, Text, Image, TouchableOpacity, Switch} from 'react-native';
import React from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import Home from '../screens/Home';
import ProfileScreen from '../screens/ProfileScreen';
import {StyleGuide} from '../Utils/StyleGuide';
import {DrawerActions} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Avatar} from 'native-base';
import {setDarkMode} from '../Redux/Auth/DarkMode';
import {useDispatch, useSelector} from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ChatScreen from '../screens/ChatScreen';
import GoogleMaps from '../screens/GoogleMaps';
import VideoComponent from '../screens/VideoComponent';

const Drawer = createDrawerNavigator();

const DrawerNavigation = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector((state: AppState) => state);
  const mode = darkMode.darkModeReducer.mode;
  console.log(mode, 'mode');
  return (
    <Drawer.Navigator
      defaultScreenOptions={{
        drawerLabelStyle: {
          fontFamily: StyleGuide.fontFamily.regular,
        },
      }}
      drawerContent={props => (
        <DrawerContentScrollView {...props}>
          <View
            style={{
              bottom: 0,
              alignSelf: 'center',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Avatar
              bg="indigo.500"
              alignSelf="center"
              size="xl"
              source={require('../images/logo.png')}
            />
          </View>
          <DrawerItemList {...props} />
          <View
            style={{
              bottom: 0,
              alignSelf: 'center',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            {/* <Text style={{fontFamily:StyleGuide.fontFamily.regular,fontSize:10}}>Copyright {'\u00A9'} 2022 Mahir Company</Text> */}
          </View>
          <View
            style={{
              paddingTop: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontFamily: StyleGuide.fontFamily.regular,
                  marginLeft: 32,
                  color: mode ? StyleGuide.color.light : StyleGuide.color.dark,
                }}>
                Dark Mode
              </Text>
            </View>
            <Switch
              thumbColor={'#fff'}
              trackColor={{
                false: 'grey',
                true: StyleGuide.color.primary,
              }}
              onChange={() => {
                if (mode == false) {
                  dispatch(setDarkMode({mode: true}));
                } else {
                  dispatch(setDarkMode({mode: false}));
                }
              }}
              value={mode ? true : false}
            />
          </View>
        </DrawerContentScrollView>
      )}
      screenOptions={({navigation}) => ({
        drawerStyle: {
          backgroundColor: mode ? 'rgb(40, 42, 54)' : '#f6f8fa',
        },
        headerTitleStyle: {
          fontFamily: StyleGuide.fontFamily.medium,
          color: '#fff',
        },
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: StyleGuide.color.primary,
        },
        contentOptions: {
          activeTintColor: '#e91e63',
          itemsContainerStyle: {
            marginVertical: 0,
          },
          iconContainerStyle: {
            opacity: 1,
          },
        },
        headerLeft: () => (
          <TouchableOpacity
            style={{marginLeft: 10}}
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
            <Icon name="menu" size={30} color="#fff" />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              onPress={() => {
                dispatch(setDarkMode({mode: !mode}));
              }}
              style={{marginRight: 15}}>
              {mode ? (
                <Feather size={25} color={'white'} name={'sun'} />
              ) : (
                <Ionicons size={25} color={'white'} name={'md-moon-sharp'} />
              )}
            </TouchableOpacity>
          </View>
        ),
      })}>
      <Drawer.Screen
        options={{
          drawerLabelStyle: {
            fontFamily: StyleGuide.fontFamily.regular,
          },
          drawerLabel: ({focused}) => (
            <Text
              style={[
                {fontFamily: StyleGuide.fontFamily.medium},
                focused ? {color: StyleGuide.color.primary} : {},
              ]}>
              Home
            </Text>
          ),
        }}
        name="Home"
        component={Home}
        mode={mode}
      />

      <Drawer.Screen
        options={{
          drawerLabelStyle: {
            fontFamily: StyleGuide.fontFamily.regular,
          },
          drawerLabel: ({focused}) => (
            <Text
              style={[
                {fontFamily: StyleGuide.fontFamily.medium},
                focused ? {color: StyleGuide.color.primary} : {},
              ]}>
              Google Map
            </Text>
          ),
        }}
        name="Google Map"
        component={GoogleMaps}
        mode={mode}
      />
      <Drawer.Screen
        options={{
          drawerLabelStyle: {
            fontFamily: StyleGuide.fontFamily.regular,
          },
          drawerLabel: ({focused}) => (
            <Text
              style={[
                {fontFamily: StyleGuide.fontFamily.medium},
                focused ? {color: StyleGuide.color.primary} : {},
              ]}>
              Video
            </Text>
          ),
        }}
        name="Video"
        component={VideoComponent}
        mode={mode}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigation;
