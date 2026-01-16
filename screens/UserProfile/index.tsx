import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useLayoutEffect } from 'react'
import { UserProfileHook } from './UserProfileHook'
import { StyleGuide } from '../../Utils/StyleGuide';
import Svg from '../../screens/components/Svg';
import { backArrowBlack, logout, moreIconBlack } from '../../Utils/SvgAssests';
import Buttons from './components/Buttons';
// 


const UserProfile = () => {
  const { id, navigation, userData, setUserData, buttonArray } = UserProfileHook();



  useLayoutEffect(() => {
    navigation.setOptions({
      title: userData[0]?.name ? userData[0]?.name : "",
      headerStyle: { borderBottomWidth: 0 },
      headerTitleStyle: { fontFamily: StyleGuide.fontFamily.medium, color: "#000", textAlign: "center" },
      headerTintColor: "#000",
      headerShadowVisible: false,
      headerTitleAlign: 'center',
      // headerLeft: () => (<View style={{ marginHorizontal: 10 }}>     <Svg xml={logout}  rest={{height:30, width:30}} /> </View>),
      //  headerRight: () => (<View style={{ paddingHorizontal: 10 }}><Svg xml={moreIconBlack} /></View>)
    });
  }, [navigation])

  return (
    <View style={{ backgroundColor: StyleGuide.color.light, flex: 1 }}>
      <View style={styles.userStatusContainer}  >
        <Image source={{ uri: userData[0]?.image ? userData[0]?.image : "" }} style={{ height: 86, width: 86, borderRadius: 40, marginLeft: 15 }} />

        <View style={{ marginHorizontal: 40, marginVertical: 20, justifyContent: "center", flexDirection: "row", }}>
          <View   >
            <Text style={styles.textStyle}>29 </Text>
            <Text style={styles.textStyle}  >Posts</Text>
          </View>
          <View style={{ marginLeft: 30 }}>
            <Text style={styles.textStyle}>29 </Text>
            <Text style={styles.textStyle}  >Followers</Text>
          </View>
          <View style={{ marginLeft: 30 }}>
            <Text style={styles.textStyle}>29 </Text>
            <Text style={styles.textStyle}  >Following</Text>
          </View>
        </View>
      </View>

      <View style={{ padding: 10 }}>
        <Text style={styles.userDetail}    >{userData[0]?.name ? userData[0]?.name : "user_name"}</Text>
        <Text style={styles.userDetail}    >Programmer</Text>
        <Text style={styles.userDetail}    >{userData[0]?.email ? userData[0]?.email : "email"}</Text>
      </View>


      <View style={styles.buttonContainer} >
        {
          buttonArray.map((e) => {
            return (
              <>
                <Buttons text={e.name} />
              </>
            )
          })
        }
      </View>

    </View>
  )
}

export default UserProfile

const styles = StyleSheet.create({
  userStatusContainer: {
    marginVertical: 30,
    flexDirection: "row",
    // justifyContent:"sp"
  },

  textStyle: {
    fontSize: 18,
    fontFamily: StyleGuide.fontFamily.medium,
    letterSpacing: -1.5,
    lineHeight: 23,
    color: StyleGuide.color.dark
  },
  userDetail: {
    fontSize: 14,
    fontFamily: StyleGuide.fontFamily.medium,
    color:StyleGuide.color.dark
    // letterSpacing: -1.5,
    // lineHeight: 23,
  },
 
  buttonContainer: {
    flexDirection: 'row',
    // marginRight:20
    justifyContent: "space-between",
    paddingHorizontal:40

  }


})