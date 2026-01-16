import { View, Text, TouchableOpacity,StyleSheet } from 'react-native'
import React from 'react'
import { StyleGuide } from '../../../Utils/StyleGuide'

interface  buttonProps{
    text?:string

}


const Buttons = (props:buttonProps) => {
  return (
    <TouchableOpacity style={styles.buttonStyle}>
      <Text>{props?.text}</Text>
    </TouchableOpacity>
  )
}


const styles   = StyleSheet.create({
    buttonStyle:{
        borderRadius:9,
        borderColor:StyleGuide.color.dark,
        backgroundColor:StyleGuide.color.dark,
        borderWidth:1,
        paddingHorizontal:10,
        padding:5
        
        // width:"50%"
        
    }

})

export default Buttons