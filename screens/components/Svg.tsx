import {SvgProps, SvgXml, XmlProps} from 'react-native-svg';
import React from 'react';

interface IProps {
  xml: string;
  rest?: SvgProps;
}

const Svg = (props: IProps) => {
  return props?.xml ? <SvgXml xml={props?.xml} {...props.rest} /> : null;
};

export default Svg;
