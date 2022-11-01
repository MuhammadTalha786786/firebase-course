import { Input } from 'native-base';
import React, { FC } from 'react';
import {
    Image,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    KeyboardAvoidingView,
    TextInput,
    SafeAreaView,
} from 'react-native';
import { Button } from 'react-native-paper';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
    widthPercentageToDP,
} from 'react-native-responsive-screen';
import Ionicons from 'react-native-vector-icons/Ionicons'
import TextInputComponent from './TextInputComponent';
import ButtonComponent from './ButtonComponent';
import { StyleGuide } from '../../Utils/StyleGuide';



const ForgotModal = ({
    setModalVisible,
    modalVisible,
    forgotEmail,
    setForgotEmail,
    forgotPassword,
    forgotEmailError,
    setForgotEmailError,
    setError
    ,
}) => {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.centeredView}>
                <Modal
                    animationType="slide"
                    statusBarTranslucent={true}
                    transparent={true}
                    visible={modalVisible}>
                    <KeyboardAvoidingView
                        behavior={'padding'}
                        style={styles.safeAreaView}
                        enabled>
                        <TouchableOpacity
                            onPress={() => {
                                setModalVisible(false)
                            }}
                            style={{
                                position: 'absolute',
                                height: '100%',
                                width: '100%',
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            }}
                        />
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                    }}>
                                    <Text
                                        style={{
                                            textAlign: 'center',
                                            fontSize: wp('3.3%'),
                                            fontFamily: StyleGuide.fontFamily.regular,
                                            marginBottom: 10,
                                            color: 'black',
                                        }}>
                                        Forgot Password
                                    </Text>
                                    <View>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setModalVisible(false)


                                            }}>
                                            <Ionicons
                                                name='close-outline'
                                                size={22}
                                                color={'black'}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                </View>

                                <View>
                                    <TextInputComponent
                                        value={forgotEmail}
                                        setValue={setForgotEmail}
                                        placeholder="Enter Email"
                                        mode="outlined"
                                        label="email"
                                        name={'email'}
                                        setError={setError}

                                    />
                                </View>


                                <View style={{ padding: 10 }}>
                                    <Text style={{ color: 'red', fontFamily: StyleGuide.fontFamily.regular, fontSize: widthPercentageToDP("2.5%") }} >{forgotEmailError}</Text>
                                    <ButtonComponent

                                        buttonTitle="SIGN IN"
                                        btnType="sign-in"
                                        color="#f5e7ea"
                                        backgroundColor="#6A0DAD"
                                        onPress={forgotPassword}

                                    />
                                </View>

                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
            </View>
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    safeAreaView: {
        flex: 1,
    },


    titles: {
        // marginTop: 5,
        fontSize: wp('2.7%'),
        fontFamily: 'Poppins-regular',
        color: 'gray',
    },

    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        // backgroundColor: '#ffff',
    },
    modalView: {
        margin: 20,
        backgroundColor: '#ffff',
        borderRadius: 4,
        padding: 20,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%'

    },
    button: {
        marginTop: 50,
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        backgroundColor: '#846acf',
    },

    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        fontFamily: 15,
        fontSize: wp('2.7%'),
        marginBottom: 10,
        textAlign: 'center',
        marginLeft: 5,
    },

    errors: {
        color: 'red',
        fontSize: 10,
    },
});
export default ForgotModal;
