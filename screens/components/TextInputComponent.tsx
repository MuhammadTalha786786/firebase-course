import { View, Text } from 'react-native';
import React from 'react';
import { TextInput } from 'react-native-paper';
import { StyleGuide } from '../../Utils/StyleGuide';
import { windowHeight } from '../../Utils/Dimesnions';
import { Input, Icon, Pressable } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { widthPercentageToDP } from 'react-native-responsive-screen';

const TextInputComponent = ({
    value,
    setValue,
    setError,
    showPassword,
    name,
    setShowPassword,
    IsPassword,
    ...reset
}) => {
    return (
        <>
            {IsPassword ? (
                <View>
                    <Input
                        mx="3"

                        value={value}
                        onChangeText={text => {
                            setValue(text), setError('');
                        }}
                        type={showPassword ? 'text' : 'password'}
                        InputRightElement={
                            <Pressable onPress={() => setShowPassword(!showPassword)}>
                                <Icon
                                    as={
                                        <MaterialIcons
                                            name={showPassword ? 'visibility' : 'visibility-off'}
                                        />
                                    }
                                    size={5}
                                    mr="2"
                                    color="muted.400"
                                />
                            </Pressable>
                        }
                        style={{
                            height: windowHeight / 15,
                            fontFamily: 'Poppins-Regular',
                            fontSize: widthPercentageToDP('3.7'),
                        }}
                        {...reset}
                    />
                </View>
            ) : (
                <Input
                    mx="3"
                    value={value}
                    onChangeText={text => {
                        setValue(text), setError('');
                    }}
                    InputLeftElement={
                        <Icon
                            as={<MaterialIcons name={name} />}
                            size={5}
                            ml="2"
                            color="muted.400"
                        />
                    }
                    style={{
                        height: windowHeight / 15,
                        fontFamily: 'Poppins-Regular',
                        fontSize: widthPercentageToDP('3.7'),
                    }}
                    {...reset}
                />
            )}
        </>
    );
};

export default TextInputComponent;
