import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import OnBoardingScreen from './screens/OnBoardingScreen';
import Home from './screens/Home';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useDispatch, useSelector} from 'react-redux';

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

  return (
    firstLaunch != null && (
      <NavigationContainer>
        <AppStack.Navigator
          header="none"
          screenOptions={{
            headerShown: false,
          }}>
          {firstLaunch && (
            <AppStack.Screen name="OnBoarding" component={OnBoardingScreen} />
          )}

          {UserLogin === false ? (
            <>
              <AppStack.Screen name="Login" component={LoginScreen} />
              <AppStack.Screen
                name="RegisterScreen"
                component={RegisterScreen}
              />
            </>
          ) : (
            <AppStack.Screen name="Home" component={Home} />
          )}
        </AppStack.Navigator>
      </NavigationContainer>
    )
  );
};

export default App;
