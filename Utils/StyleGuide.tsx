import { widthPercentageToDP } from "react-native-responsive-screen"
import { Platform } from 'react-native'
export const StyleGuide = {
    fontFamily: {
        regular: 'Poppins-Regular',
        medium: 'Poppins-Medium',
        bold: 'Poppins-Bold'
    },
    fontSize: {
        textInput: widthPercentageToDP('3.8%'),
        buttonText: widthPercentageToDP('3.8%'),
        large: widthPercentageToDP('8%'),
        medium: Platform.OS == 'ios' ? widthPercentageToDP('5.5%') : widthPercentageToDP('5%'),
        small: widthPercentageToDP('3.5%')
    },
    color: {
        primary: '#60C35B',
        paragraph: "#8e8e93",
        heading: "#272d4e",
        light: '#f6f6f6'
    },
    bottomNavigator: {
        focused: 'Poppins-Medium',
        blurred: 'Poppins-Regular',
        fontSize: 13
    },
    headings: {
        bold: 'Poppins-Medium',
        fontSize: 16,
    },


}