import {Image} from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import useOnboarding from './useOnboarding';
const OnBoardingScreen = ({navigation}) => {
  const {firstLaunch, setFirstLaunch} = useOnboarding()
  return (
    <Onboarding
      containerStyles={{padding: 30}}
      imageContainerStyles={{
        padding: 0,
      }}
      onSkip={() => {navigation.navigate('Login'),setFirstLaunch(false)}}
      onDone={() => {navigation.navigate('Login'),setFirstLaunch(false)}}
      pages={[
        {
          backgroundColor: '#a6e4d0',
          image: <Image source={require('../images/onBoarding1.jpeg')} />,
          title: 'Welcome to SociaBea',
          subtitle: ' Connect. Share. Blossom Together.',        },
        {
          backgroundColor: '#e9bcbe',
          image: <Image source={require('../images/onBoarding1.jpeg')} />,
          title: ' Discover New Communities',
          subtitle: 'Find friends, join groups, and thrive socially.',
        },
      ]}
    />
  );
};

export default OnBoardingScreen;
