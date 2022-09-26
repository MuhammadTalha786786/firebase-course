import {View, Text, Image} from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
const OnBoardingScreen = ({navigation}) => {
  return (
    <Onboarding
      onSkip={() => navigation.navigate('Login')}
      onDone={() => navigation.navigate('Login')}
      pages={[
        {
          backgroundColor: 'green',
          image: <Image source={require('../images/onBoarding1.jpeg')} />,
          title: 'Welcome to Tech App',
          subtitle: 'The World of Technology',
        },
        {
          backgroundColor: 'red',
          image: <Image source={require('../images/onBoarding1.jpeg')} />,
          title: 'Welcome to Tech App',
          subtitle: 'The World of Technology',
        },
      ]}
    />
  );
};

export default OnBoardingScreen;
