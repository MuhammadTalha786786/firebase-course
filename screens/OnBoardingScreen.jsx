import {Image} from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
const OnBoardingScreen = ({navigation}) => {
  return (
    <Onboarding
      containerStyles={{padding: 30}}
      imageContainerStyles={{
        padding: 0,
      }}
      onSkip={() => navigation.navigate('Login')}
      onDone={() => navigation.navigate('Login')}
      pages={[
        {
          backgroundColor: '#a6e4d0',
          image: <Image source={require('../images/onBoarding1.jpeg')} />,
          title: 'Welcome to Tech App',
          subtitle: 'The World of Technology',
        },
        {
          backgroundColor: '#e9bcbe',
          image: <Image source={require('../images/onBoarding1.jpeg')} />,
          title: 'Welcome to Tech App',
          subtitle: 'The World of Technology',
        },
      ]}
    />
  );
};

export default OnBoardingScreen;
