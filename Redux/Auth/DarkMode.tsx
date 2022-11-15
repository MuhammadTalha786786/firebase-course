import { createSlice, configureStore } from '@reduxjs/toolkit'

const DarkModeSlice = createSlice({
    name: 'DarkModeSlice',
    initialState: {
        mode: false,
        value: null

    },
    reducers: {
        setDarkMode: (state, action) => {
            state.mode = action.payload.mode;
        },

    }
})

export const { setDarkMode, } = DarkModeSlice.actions;

export const mode = (state) => state.DarkModeSlice.mode;
// export const selectEmail = (state) => state.userAuth.email;
// export const selectUserName = (state) => state.userAuth.userName;
// export const selectUid = (state) => state.userAuth.uid;

export default DarkModeSlice.reducer;

// Can still subscribe to the store
