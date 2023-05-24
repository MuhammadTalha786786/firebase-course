import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';



export const UserProfileHook = () => {
    const route  = useRoute();
    const id =  route?.params?.id;
    const navigation = useNavigation();
    const [userData, setUserData] =useState<FirebaseFirestoreTypes.DocumentData>([])
    console.warn(id)



    const buttonArray  = [
      {
      id:1,
      name:"Follow"
    },
    {
      id:2,
      name:"Message"
    },
    {
      id:3,
      name:"Email"
    },

    {
      id:4,
      name:"Email"
    }
 
  
  ]

  interface userDocumentI{
    data:{
      dateOfBirth: Date,
      email:string,
      image:string,
      isLogin:boolean,
      name:string,
      numberVerified:boolean,
      phoneNumbe:string,
      uid:string
    }
  }
 

    useEffect(() => {
      firestore()
        .collection('users')
        .where('uid', '==', id)
        .get()
        .then(res => {
          let userData:FirebaseFirestoreTypes.DocumentData  = [];
          res.forEach((documentSnap )=> {
            console.log((documentSnap),"document snap")
            let data :FirebaseFirestoreTypes.DocumentData = documentSnap.data();
            userData.push(data);
          });
          setUserData(userData);
        });
    }, []);
    return {
      id,
      navigation, userData, setUserData,buttonArray
    }
    
  
}

