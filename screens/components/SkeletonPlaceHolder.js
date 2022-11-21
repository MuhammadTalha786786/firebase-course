import {View, Text} from 'react-native';
import React from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const SkeletonPlaceHolder = () => {
  return (
    <View>
      <SkeletonPlaceholder style={{padding: 10}}>
        <View
          style={{
            justifyContent: 'space-between',
            flexDirection: 'row',
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={{width: 60, height: 60, borderRadius: 50}} />
            <View style={{marginLeft: 20}}>
              <View style={{width: 120, height: 20, borderRadius: 4}} />
              {/* <View
              style={{marginTop: 6, width: 80, height: 20, borderRadius: 4}}
            /> */}
            </View>
          </View>
          <View
            style={{
              width: 100,
              height: 20,
              borderRadius: 4,
              marginHorizontal: 10,
              marginVertical: 20,
            }}
          />
        </View>

        <View style={{marginTop: 10, marginBottom: 30}}>
          <View style={{width: 300, height: 20, borderRadius: 4}} />
          {/* <View
            style={{marginTop: 6, width: 250, height: 20, borderRadius: 4}}
          /> */}
          <View
            style={{marginTop: 6, width: 420, height: 200, borderRadius: 4}}
          />
        </View>
      </SkeletonPlaceholder>
    </View>
  );
};

export default SkeletonPlaceHolder;
