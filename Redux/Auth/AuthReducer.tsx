import { createSlice, configureStore } from '@reduxjs/toolkit'


const AuthSlice = createSlice({
    name: 'userAuth',
    initialState: {
        userData:null,
        mode: false

    },
    reducers: {
        setSignIn: (state, action) => {
            state.userData = action.payload;
            
        },
        setSignOut: (state) => {
            state.userData = null
        },
        setDarkMode: (state, action) => {
            state.mode = action.payload.mode
        }
    }
})

export const { setSignIn, setSignOut, setDarkMode } = AuthSlice.actions;



export default AuthSlice.reducer;

// Can still subscribe to the store
