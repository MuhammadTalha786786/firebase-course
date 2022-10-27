/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {persistor, Store} from './Redux/Store';
import {NativeBaseProvider} from 'native-base';

export default function Root() {
  return (
    <>
      <Provider store={Store}>
        <PersistGate loading={null} persistor={persistor}>
          <NativeBaseProvider>
            <App />
          </NativeBaseProvider>
        </PersistGate>
      </Provider>
    </>
  );
}

AppRegistry.registerComponent(appName, () => Root);
