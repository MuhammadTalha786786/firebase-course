import {
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { Avatar } from 'native-base';
import TextInputComponent from './components/TextInputComponent';
import { useDispatch, useSelector } from 'react-redux';
import { StyleGuide } from '../Utils/StyleGuide';
import firestore from '@react-native-firebase/firestore';
import { Button } from 'react-native-paper';
import { windowHeight } from '../Utils/Dimesnions';
import moment from 'moment';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { widthPercentageToDP } from 'react-native-responsive-screen';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import PhoneInput from 'react-native-phone-number-input';
import auth from '@react-native-firebase/auth';
import ButtonComponent from './components/ButtonComponent';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ImagePicker from 'react-native-image-crop-picker';
import { v4 as uuidv4 } from 'uuid';
import storage from '@react-native-firebase/storage';
import { setSignIn } from '../Redux/Auth/AuthReducer'
const ProfileScreen = () => {
    const authState = useSelector((state: AppState) => state);






    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [confirm, setConfirm] = useState(null);
    const [code, setCode] = useState('');
    const [ishow, setShow] = useState(false);
    const [verified, setVerified] = useState(false);
    const [image, setImage] = useState('');
    const [updateImage, setUpdateImage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [newDate, setNewDate] = useState<Date>(new Date())
    const dispatch = useDispatch()

    let userID = authState.userAuthReducer.uid;
    let isLoggedIn = authState.userAuthReducer.isLoggedIn;
    let userProfileImage = authState.userAuthReducer.photoURL;

    const updateProfile = () => {
        if (name === '') {
            Alert.alert('Please Enter Your name');
        } else if (phoneNumber === '' || phoneNumber === undefined) {
            Alert.alert('Please Enter Your phone number..');
        }

        // else if (dateOfBirth === '') {
        //     Alert.alert('Please Enter Your name');
        // }

        else if (verified === false) {
            Alert.alert('Your Number has not been  Verified');
        }
        else {
            firestore()
                .collection('users')
                .doc(userID)
                .update({
                    dateOfBirth: dateOfBirth,
                    name: name,
                    phoneNumber: phoneNumber,
                    image: updateImage === '' ? userProfileImage : updateImage,
                    numberVerified: true
                })
                .then(() => {
                    Alert.alert("Your Data has been updated...")
                    console.log('User data has been updated!');

                });
            dispatch(setSignIn({ ...authState, photoURL: image === '' ? userProfileImage : updateImage }));

        }
    };

    const selectImage = async () => {
        setUploading(true);
        ImagePicker.openPicker({
            width: 300,
            height: 400,
            cropping: true,
        }).then(image => {
            setImage(image.path);
            console.log(image.path);
            let fileName = `${uuidv4()}${image.path.substr(
                image.path.lastIndexOf('.'),
            )}`;
            const ref = storage().ref(fileName);
            ref.putFile(image.path).then(s => {
                ref.getDownloadURL().then(x => {
                    console.log(x, 'x url');
                    setUpdateImage(x);
                    setUploading(false)
                });
            });
        }).catch(error => {
            console.log(error)
            setUploading(false)
        })
    };

    const verifyPhoneNumber = async phoneNumber => {
        if (phoneNumber === '') {
            Alert.alert('please Enter the Phone Number');
        } else {
            const confirmation = await auth().verifyPhoneNumber(phoneNumber);
            setConfirm(confirmation);
            setVerified(true)
            setShow(true);
        }
    };

    console.log(name === '', 'confirm');

    // Handle confirm code button press
    const confirmCode = async code => {
        console.log(code);
        try {
            const credential = auth.PhoneAuthProvider.credential(
                confirm.verificationId,
                code,
            );
            console.log(credential, 'credential');
            Alert.alert('Your Number Has Been Verified...');
            setShow(false);
        } catch (error) {
            console.log(error);
            if (error.code == 'auth/invalid-verification-code') {
                Alert.alert('Your Code is Wrong...');
            } else {
                console.log('Account linking error');
            }
        }
    };


    useEffect(() => {
        firestore()
            .collection('users')
            .doc(userID)
            .get()
            .then(snapshot => {
                console.log(snapshot.data());
                let data = snapshot.data();
                console.log(data, dateOfBirth)
                setName(data?.name);
                setEmail(data?.email);
                if (data?.phoneNumber !== undefined) {
                    setPhoneNumber(data?.phoneNumber)
                    setDateOfBirth(data?.dateOfBirth.toDate())
                    setNewDate(data?.dateOfBirth.toDate())
                    setVerified(data?.numberVerified)
                }

            });
    }, []);

    const mode = authState.darkModeReducer.mode;
    console.log(mode, "mode reducer")

    return (
        <SafeAreaView style={[styles.SafeAreaView, { backgroundColor: mode ? StyleGuide.color.dark : StyleGuide.color.light }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : ''}
                style={styles.container}>
                <ScrollView>
                    <View style={styles.container}>
                        <View style={styles.header}>
                            <Text style={styles.userText}> User Profile</Text>
                        </View>

                        <Avatar
                            style={styles.avatar}
                            source={{ uri: image === '' ? userProfileImage : image }}>
                            <Avatar.Badge bg={isLoggedIn ? 'green.500' : 'red.500'} />
                        </Avatar>

                        <View
                            style={{
                                marginHorizontal: 190,
                                backgroundColor: 'white',
                                borderRadius: 20,
                                width: 40,
                                height: 40,
                                marginTop: 30,
                            }}>
                            <MaterialCommunityIcons
                                name="image-edit-outline"
                                size={25}
                                color={StyleGuide.color.primary}
                                onPress={selectImage}
                                style={{ marginVertical: 10, marginHorizontal: 7 }}
                            />
                        </View>

                        <View style={styles.body}>
                            <View style={{ marginVertical: 10 }}>
                                <TextInputComponent
                                    value={email}
                                    placeholder="Enter Email"
                                    mode="outlined"
                                    label="Email"
                                    name={'email'}
                                    isReadOnly={true}
                                    darkMode={mode}
                                />
                            </View>
                            <View style={{ marginVertical: 10 }}>
                                <TextInputComponent
                                    placeholderTextColor={mode ? 'white' : 'black'}

                                    value={name}
                                    placeholder="Enter Name"
                                    mode="outlined"
                                    label="Email"
                                    name={'supervised-user-circle'}
                                    setValue={setName}
                                    setError={setError}
                                    darkMode={mode}

                                />
                            </View>

                            <View style={{ marginVertical: 10, padding: 10 }}>
                                <TouchableOpacity
                                    style={styles.ButtonStyle}
                                    onPress={() => setDatePickerVisibility(true)}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <View>
                                            <EvilIcons
                                                name="calendar"
                                                size={20}
                                                color={mode ? StyleGuide.color.light : StyleGuide.color.dark} style={{ marginVertical: 20, marginHorizontal: 10 }}
                                            />
                                        </View>
                                        <View>
                                            <Text style={[styles.dateOfBirthText, { color: mode ? StyleGuide.color.light : StyleGuide.color.dark }]}>
                                                {dateOfBirth === ''
                                                    ? 'Select Your DOB'
                                                    : moment(dateOfBirth).format('LL')}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <DateTimePickerModal
                                isVisible={isDatePickerVisible}
                                mode="date"
                                onConfirm={date => {
                                    setDateOfBirth(date), setDatePickerVisibility(false);
                                }}
                                onCancel={() => {
                                    setDatePickerVisibility(false);
                                }}
                                maximumDate={new Date()}
                            />
                            <View style={{ marginVertical: 10 }}>
                                <TextInputComponent
                                    value={phoneNumber}
                                    placeholder="+923151234567"
                                    mode="outlined"
                                    label="Email"
                                    name={'phone'}
                                    setValue={setPhoneNumber}
                                    setError={setError}
                                    keyboardType="phone-pad"
                                    darkMode={mode}

                                />

                                <Text
                                    onPress={() => verifyPhoneNumber(phoneNumber)}
                                    style={{
                                        color: 'rgb(40, 42, 54)',
                                        fontSize: widthPercentageToDP('3.3%'),
                                        fontFamily: StyleGuide.fontFamily.regular,
                                        marginVertical: 10,
                                        textAlign: 'right',
                                        marginHorizontal: 10,
                                    }}>
                                    Send OTP
                                </Text>
                            </View>
                            {ishow && (
                                <View style={{ marginVertical: 10 }}>
                                    <TextInputComponent
                                        value={code}
                                        placeholder="123456"
                                        mode="outlined"
                                        label="Email"
                                        name={'phone'}
                                        setValue={setCode}
                                        setError={setError}
                                        keyboardType="phone-pad"
                                        darkMode={mode}

                                    />
                                    <Text
                                        onPress={() => confirmCode(code)}
                                        style={{
                                            color: 'blue',
                                            fontSize: widthPercentageToDP('3.3%'),
                                            fontFamily: StyleGuide.fontFamily.regular,
                                            marginVertical: 10,
                                            textAlign: 'right',
                                            marginHorizontal: 10,
                                        }}>
                                        Verify OTP
                                    </Text>
                                </View>
                            )}

                            <View style={{ padding: 10 }}>
                                {uploading && (<Text style={{ color: 'red', fontSize: 10 }}>Please Wait While Your Image has been upload.... </Text>)}
                                <ButtonComponent
                                    buttonTitle="Update"
                                    btnType="upload"
                                    color={'#ffff'}
                                    backgroundColor={uploading ? 'grey' : '#3d5a80'}
                                    onPress={updateProfile}
                                    disabled={uploading}
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    cameraIcon: {
        borderRadius: 20,
        borderColor: 'red',
        width: 40,
        height: 40,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        position: 'absolute',
    },
    SafeAreaView: {
        flex: 1,
        // backgroundColor: '#F5F5DC',
    },
    userText: {
        fontSize: StyleGuide.fontSize.medium,
        fontFamily: StyleGuide.fontFamily.regular,
        color: 'white',
        textAlign: 'center',
        marginVertical: 60,
    },
    header: {
        marginVertical: 10,
        backgroundColor: '#3d5a80',
        height: 200,
        borderBottomRightRadius: 25,
        borderBottomLeftRadius: 25,
    },
    avatar: {
        width: 130,
        height: 130,
        borderRadius: 63,
        borderWidth: 4,
        borderColor: 'white',
        marginBottom: 10,
        alignSelf: 'center',
        position: 'absolute',
        marginTop: 130,
    },
    name: {
        fontSize: 22,
        color: 'black',
        fontWeight: '600',
    },
    // body: {
    //     marginVertical: 100,
    // },
    ButtonStyle: {
        height: windowHeight / 15,
        borderWidth: 0.85,
        borderRadius: 3.5,
        borderColor: 'lightgrey',
    },
    dateOfBirthText: {

        textAlign: 'center',
        marginVertical: 18,
        marginHorizontal: 5,
        fontFamily: StyleGuide.fontFamily.regular,
        fontSize: widthPercentageToDP('3.7%'),
    },
});

export default ProfileScreen;
