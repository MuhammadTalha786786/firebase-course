import React from 'react';

import {View, Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import OnBoardingScreen from './screens/OnBoardingScreen';
import Home from './screens/Home';
const AppStack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <AppStack.Navigator header="none">
        <AppStack.Screen name="OnBoarding" component={OnBoardingScreen} />
        <AppStack.Screen name="Login" component={LoginScreen} />
        <AppStack.Screen name="Home" component={Home} />

        <AppStack.Screen name="RegisterScreen" component={RegisterScreen} />
      </AppStack.Navigator>
    </NavigationContainer>
  );
};

export default App;
