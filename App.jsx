import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import OnBoardingScreen from './screens/OnBoardingScreen';
import Home from './screens/Home';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch, useSelector} from 'react-redux';
import TabNavigation from './TabNavigation/TabNavigation';
import Comment from './screens/Post/Comment';
import Profile from './screens/Profile';
import messaging from '@react-native-firebase/messaging';
import ChatScreen from './screens/ChatScreen';

const AppStack = createStackNavigator();

const App = () => {
  const authState = useSelector((state: AppState) => state);
  const UserLogin = authState.userAuthReducer.isLoggedIn;
  console.log(UserLogin, 'UserLogin');
  const [firstLaunch, setFirstLaunch] = useState(null);
  useEffect(() => {
    async function setData() {
      const appData = await AsyncStorage.getItem('appLaunched');
      if (appData == null) {
        setFirstLaunch(true);
        AsyncStorage.setItem('appLaunched', 'false');
      } else {
        setFirstLaunch(false);
      }
    }
    setData();
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Assume a message-notification contains a "type" property in the data payload of the screen to open

    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
    });

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );
        }
      });
  }, []);

  console.log(UserLogin);

  return (
    firstLaunch != null && (
      <NavigationContainer>
        <AppStack.Navigator
          header="none"
          screenOptions={{
            headerShown: false,
          }}>
          {UserLogin ? (
            <>
              <AppStack.Screen
                name="Main"
                component={TabNavigation}
                options={{headerShown: false}}
              />

              <AppStack.Screen name="Comment" component={Comment} />
              <AppStack.Screen
                name="Profile"
                component={Profile}
                options={{headerShown: true}}
              />
              <AppStack.Screen
                name="ChatsScreen"
                component={ChatScreen}
                options={{headerShown: true}}
              />
            </>
          ) : (
            <>
              {firstLaunch && (
                <AppStack.Screen
                  name="OnBoarding"
                  component={OnBoardingScreen}
                />
              )}
              <AppStack.Screen name="Login" component={LoginScreen} />
              <AppStack.Screen
                name="RegisterScreen"
                component={RegisterScreen}
                
              />
            </>
          )}
        </AppStack.Navigator>
      </NavigationContainer>
    )
  );
};

export default App;
