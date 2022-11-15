import { createSlice, configureStore } from '@reduxjs/toolkit'

const AuthSlice = createSlice({
    name: 'userAuth',
    initialState: {
        isLoggedIn: false,
        email: null,
        userName: null,
        uid: null,
        photoURL: null,
        mode: false

    },
    reducers: {
        setSignIn: (state, action) => {
            state.email = action.payload.email;
            state.isLoggedIn = action.payload.isLoggedIn;
            state.userName = action.payload.userName;
            state.uid = action.payload.uid;
            state.photoURL = action.payload.photoURL;


        },
        setSignOut: (state) => {
            state.email = null;
            state.userName = null;
            state.isLoggedIn = false;
            state.uid = null;
            state.photoURL = null;


        },
        setDarkMode: (state, action) => {
            state.mode = action.payload.mode
        }
    }
})

export const { setSignIn, setSignOut, setDarkMode } = AuthSlice.actions;

export const selectIsLoggedIn = (state) => state.userAuth.isLoggedIn;
export const selectEmail = (state) => state.userAuth.email;
export const selectUserName = (state) => state.userAuth.userName;
export const selectUid = (state) => state.userAuth.uid;

export default AuthSlice.reducer;

// Can still subscribe to the store
