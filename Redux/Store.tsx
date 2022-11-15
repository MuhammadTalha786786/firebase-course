import { configureStore } from '@reduxjs/toolkit'
import AuthSlice from './Auth/AuthReducer'
import DarkSlice from './Auth/DarkMode'
import { persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStore, combineReducers } from 'redux';
const persistConfig = {
    key: 'root',
    storage: AsyncStorage,

};
const rootReducer = combineReducers({ userAuthReducer: AuthSlice, darkModeReducer: DarkSlice });
const persistedReducer = persistReducer(persistConfig, rootReducer);
export const Store = configureStore({
    reducer: persistedReducer,
})

export const persistor = persistStore(Store)

