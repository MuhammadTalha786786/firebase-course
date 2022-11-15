import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet, ActivityIndicator } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { windowHeight } from '../../Utils/Dimesnions';
import { StyleGuide } from '../../Utils/StyleGuide';
const ButtonComponent = ({
    buttonTitle,
    btnType,
    color,
    backgroundColor,
    press,
    uploading,
    setUploading,
    ...rest

}) => {
    let bgColor = backgroundColor;

    return (
        <TouchableOpacity
            onPress={press}
            style={[styles.buttonContainer, { backgroundColor: bgColor }]}   {...rest}>
            <View style={styles.iconWrapper}>
                <FontAwesome
                    name={btnType}
                    style={styles.icon}
                    size={22}
                    color={color}
                />
            </View>
            <View style={styles.btnTxtWrapper}>
                {uploading ? <ActivityIndicator color='white' size={20} /> : <Text style={[styles.buttonText, { color: color }]}>{buttonTitle}</Text>}

            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        marginTop: 10,
        width: '100%',
        height: windowHeight / 15,
        padding: 10,
        flexDirection: 'row',
        borderRadius: 3,
    },
    iconWrapper: {
        width: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        fontWeight: 'bold',
    },
    btnTxtWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: StyleGuide.fontSize.buttonText,
        fontFamily: StyleGuide.fontFamily.medium,
    },
});
export default ButtonComponent;
