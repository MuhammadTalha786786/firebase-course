export interface Auth {
    email: string;
    name: string;
    uid: string;
}
export type AuthState = {
    auth: Auth | null;
};

export type AppState = {
    auth: AuthState;
};

export enum AUTH_ACTION_TYPES {
    SIGN_IN = "SIGN_IN",
    SIGN_OUT = "SIGN_OUT",

}

export interface SignInAction {
    type: AUTH_ACTION_TYPES.SIGN_IN;
    payload: Auth;
}

export interface SignOutAction {
    type: AUTH_ACTION_TYPES.SIGN_OUT;
}


export type AuthAction =
    | SignInAction
    | SignOutAction
