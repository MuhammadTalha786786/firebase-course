export type reducerType =
{    userAuthReducer:{
        uid:string
        isLoggedIn: boolean,
        email: string,
        userName: string,
        photoURL: string,
    }
    darkModeReducer:{
        mode:boolean
    }

}