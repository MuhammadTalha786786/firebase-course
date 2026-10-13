import { widthPercentageToDP } from "react-native-responsive-screen";
import { Platform } from 'react-native';

export const StyleGuide = {
  fontFamily: {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    bold: 'Poppins-Bold',
  },
  fontSize: {
    title: widthPercentageToDP('6.5%'),
    subtitle: widthPercentageToDP('3.7%'),
    textInput: widthPercentageToDP('3.8%'),
    buttonText: widthPercentageToDP('3.8%'),
    large: widthPercentageToDP('8%'),
    medium:
      Platform.OS === 'ios'
        ? widthPercentageToDP('5.5%')
        : widthPercentageToDP('5%'),
    small: widthPercentageToDP('3.5%'),
    tiny: widthPercentageToDP('3.1%'),
  },
  color: {
    // Primary Brand
    primary: '#10B981',
    primaryDark: '#059669',
    primaryLight: '#D1FAE5',

    // Neutrals & Surfaces
    background: '#F8FAFC',
    card: '#FFFFFF',
    border: '#E2E8F0',
    borderFocus: '#10B981',
    inputBg: '#F8FAFC',

    // Typography
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textPlaceholder: '#94A3B8',

    // Backward compatibility
    paragraph: '#64748B',
    heading: '#0F172A',
    light: '#FFFFFF',
    dark: '#0F172A',

    // Feedback
    error: '#EF4444',
    success: '#10B981',
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    pill: 999,
  },
  bottomNavigator: {
    focused: 'Poppins-Medium',
    blurred: 'Poppins-Regular',
    fontSize: 13,
  },
  headings: {
    bold: 'Poppins-Medium',
    fontSize: 16,
  },
};