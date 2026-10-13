import { View, Platform } from 'react-native';
import React from 'react';
import { StyleGuide } from '../../Utils/StyleGuide';
import { Input, Icon, Pressable } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { widthPercentageToDP } from 'react-native-responsive-screen';

interface TextProps {
  placeholder?: string;
  mode?: string;
  label?: string;
  secureTextEntry?: boolean;
  value: string;
  setValue?: (e: string) => void;
  setError?: (e: string) => void;
  showPassword?: boolean;
  name?: string;
  setShowPassword?: (e: boolean) => void;
  IsPassword?: boolean;
  darkMode?: any | boolean;
  isReadOnly?: boolean;
  keyboardType?: any;
  placeholderTextColor?: string;
}

const TextInputComponent = (props: TextProps) => {
  const isDark = props?.darkMode;
  const bgColor = isDark ? '#1E293B' : '#F8FAFC';
  const borderColor = isDark ? '#334155' : '#E2E8F0';
  const textColor = isDark ? '#FFFFFF' : '#0F172A';
  const placeholderColor = props?.placeholderTextColor || '#94A3B8';

  return (
    <>
      {props?.IsPassword ? (
        <View>
          <Input
            mx="0"
            h="50px"
            {...props}
            value={props?.value}
            onChangeText={text => {
              props?.setValue && props.setValue(text);
              props?.setError && props.setError('');
            }}
            type={props?.showPassword ? 'text' : 'password'}
            borderRadius={14}
            borderWidth={1}
            borderColor={borderColor}
            backgroundColor={bgColor}
            placeholderTextColor={placeholderColor}
            selectionColor={StyleGuide.color.primary}
            cursorColor={StyleGuide.color.primary}
            pl="2.5"
            pr="2"
            _focus={{
              borderColor: StyleGuide.color.primary,
              backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            }}
            InputLeftElement={
              <Icon
                as={<MaterialIcons name="lock-outline" />}
                size={5}
                ml="3.5"
                color={placeholderColor}
              />
            }
            InputRightElement={
              <Pressable
                p="2"
                onPress={() =>
                  props?.setShowPassword &&
                  props?.setShowPassword(!props?.showPassword)
                }>
                <Icon
                  as={
                    <MaterialIcons
                      name={
                        props?.showPassword ? 'visibility' : 'visibility-off'
                      }
                    />
                  }
                  size={5}
                  mr="2"
                  color={placeholderColor}
                />
              </Pressable>
            }
            style={{
              fontFamily: 'Poppins-Regular',
              fontSize: widthPercentageToDP('3.8%'),
              color: textColor,
            }}
          />
        </View>
      ) : (
        <Input
          mx="0"
          h="50px"
          {...props}
          isReadOnly={props?.isReadOnly}
          value={props?.value}
          onChangeText={text => {
            props?.setValue && props.setValue(text);
            props?.setError && props.setError('');
          }}
          borderRadius={14}
          borderWidth={1}
          borderColor={borderColor}
          backgroundColor={bgColor}
          placeholderTextColor={placeholderColor}
          selectionColor={StyleGuide.color.primary}
          cursorColor={StyleGuide.color.primary}
          pl="2.5"
          pr="3"
          _focus={{
            borderColor: StyleGuide.color.primary,
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
          }}
          InputLeftElement={
            <Icon
              as={<MaterialIcons name={props?.name || 'mail-outline'} />}
              size={5}
              ml="3.5"
              color={placeholderColor}
            />
          }
          style={{
            fontFamily: 'Poppins-Regular',
            fontSize: widthPercentageToDP('3.8%'),
            color: textColor,
          }}
        />
      )}
    </>
  );
};

export default TextInputComponent;
