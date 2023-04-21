import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import firestore from '@react-native-firebase/firestore';



export const UserProfileHook = () => {
    const route  = useRoute();
    const id =  route?.params?.id;
    const navigation = useNavigation();
    const [userData, setUserData] =useState([])
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


    useEffect(() => {
      firestore()
        .collection('users')
        .where('uid', '==', id)
        .get()
        .then(res => {
          let userData:string[] | any = [];
          res.forEach(documentSnap => {
            let data= documentSnap.data();
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

