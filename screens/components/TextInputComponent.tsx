import { View, Text } from 'react-native';
import React from 'react';
import { TextInput } from 'react-native-paper';
import { StyleGuide } from '../../Utils/StyleGuide';
import { windowHeight } from '../../Utils/Dimesnions';
import { Input, Icon, Pressable, IInputProps } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { widthPercentageToDP } from 'react-native-responsive-screen';


interface TextProps {
  placeholder?: string
  mode?: string
  label?: string
  secureTextEntry?: boolean
  value: string,
  setValue: (e: string) => void,
  setError: (e: string) => void,
  showPassword?: boolean,
  name: string,
  setShowPassword: (e: boolean) => void,
  IsPassword?: boolean,
  darkMode?: boolean,
}

const TextInputComponent = (props: TextProps) => {
  return (
    <>
      {props?.IsPassword ? (
        <View>
          <Input
            mx="3"
            {...props}
            value={props?.value}
            onChangeText={text => {
              props?.setValue(text), props?.setError('');
            }}
            type={props?.showPassword ? 'text' : 'password'}
            InputRightElement={
              <Pressable onPress={() => props?.setShowPassword(!props?.showPassword)}>
                <Icon
                  as={
                    <MaterialIcons
                      name={props?.showPassword ? 'visibility' : 'visibility-off'}
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
              color: StyleGuide.color.dark,
            }}
          />
        </View>
      ) : (
        <Input
          mx="3"
          {...props}
          value={props?.value}
          onChangeText={text => {
            props?.setValue(text), props?.setError('');
          }}
          InputLeftElement={
            <Icon
              as={<MaterialIcons name={props?.name} />}
              size={5}
              ml="2"
              color="muted.400"
            />
          }
          style={{
            height: windowHeight / 15,
            fontFamily: 'Poppins-Regular',
            fontSize: widthPercentageToDP('3.7'),
            color: StyleGuide.color.dark,
          }}
        />
      )}
    </>
  );
};

export default TextInputComponent;
