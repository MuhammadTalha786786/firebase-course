import { StyledProps } from 'native-base';
import React from 'react';
import {View, StyleSheet, Animated, ViewStyle, ImageStyle, ImageSourcePropType, StyleProp} from 'react-native';


  interface   progressiveImagePropsI {
    
    source?:ImageSourcePropType, 
    style:StyleProp<ImageStyle>
   
}
class ProgressiveImage extends React.Component<progressiveImagePropsI> {
  
  defaultImageAnimated = new Animated.Value(0);
  imageAnimated = new Animated.Value(0);

  handleDefaultImageLoad = () => {
    Animated.timing(this.defaultImageAnimated, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  handleImageLoad = () => {
    Animated.timing(this.imageAnimated, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  render() {
  // const { source, style,...props}: Readonly<progressiveImagePropsI> = this.props;
    return (
      <View style={styles.container}>
        <Animated.Image
          {...this.props}
          source={this.props.source}
          style={[this.props.style, {opacity: this.defaultImageAnimated}]}
          onLoad={this.handleDefaultImageLoad}
          blurRadius={1}
        />
       
      </View>
    );
  }
}

export default ProgressiveImage;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e1e4e8',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }
});