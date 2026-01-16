export type StackParamList ={
    ChatsScreen:{
        receiverName: string,
        receiverImage: string,
        receiverLogin: string,
        receiverID: string,
    }
    UserProfile:{
        id:string
    }
    Comment:{
        postData:  string[] ,
        comments: string [],
        setGetData: (e:string []) =>void,
        postID: string,
        mode: boolean,
    }

    
}