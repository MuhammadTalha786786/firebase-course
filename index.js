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


export default function Root() {
  return (
    <>
      <NativeBaseProvider>
        <Provider store={Store}>
          <PersistGate loading={null} persistor={persistor}>
            <App />
            <Toast />
          </PersistGate>
        </Provider>
      </NativeBaseProvider>
    </>
  );
}

AppRegistry.registerComponent(appName, () => Root);
