/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, Store } from './Redux/Store';
import { NativeBaseProvider } from 'native-base';
import Toast from 'react-native-toast-message';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';



export default function Root() {
  return (
    <>
     <GestureHandlerRootView style={{flex: 1}}>


      <NativeBaseProvider>
        <Provider store={Store}>
          <PersistGate loading={null} persistor={persistor}>
            <App />
            <Toast />
          </PersistGate>
        </Provider>
      </NativeBaseProvider>
     </GestureHandlerRootView>
    </>
  );
}

AppRegistry.registerComponent(appName, () => Root);
