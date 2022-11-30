import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  Platform
} from 'react-native';
import React, {useRef, useState, useEffect} from 'react';
import {
  Camera,
  useCameraDevices,
} from 'react-native-vision-camera';
import {useNavigation} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native';
import {StyleGuide} from '../../Utils/StyleGuide';
import storage from '@react-native-firebase/storage';
import {v4 as uuidv4} from 'uuid';

const CameraComponent = () => {
  const camera = useRef<any>();
  const [hasPermission, setHasPermission] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoURL, setRecordedVideoURL]=useState('');
  const [fetchRecordedURL,setFetchRecordedURL]=useState('')
  const navigation = useNavigation();

 

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const status = await Camera.requestCameraPermission();
        setHasPermission(status === 'authorized');
      })();
    }, [navigation]),
  );

  const devices = useCameraDevices();
  const device = devices.back;

  console.log(hasPermission, 'permission');

  const videoRecording = () => {
    setIsRecording(true);
    camera.current.startRecording({
      flash: 'on',
      onRecordingFinished: video => {
        setRecordedVideoURL(video.path)
      },
      onRecordingError: error => console.error(error),
    });



       
  };

  const stopRecording = async () => {
    setIsRecording(false);
   
    await camera.current.stopRecording();
   
   
  };


  const uploadVideoURL= ()=> {
    console.log("inside");

      const uploadUri = Platform.OS === 'ios' ? recordedVideoURL.replace('file://', '') : recordedVideoURL

      const videoRef = storage().ref('videos').child('video_098')
      var metadata = {
        contentType: 'video/mp4'
      };
      var uploadTask = videoRef.put(uploadUri, metadata);
      uploadTask.on('state_changed', taskSnapshot => {
        console.log(`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`);


      });
      
      // Listen for state changes, errors, and completion of the upload.
    
    }





  const UploadVideo=()=>{
    console.log("upload video")
    let fileName =  `${uuidv4()}${recordedVideoURL.substr(
      recordedVideoURL.lastIndexOf('.'),
    )}`;
    const ref =  storage().ref(fileName);
    var metadata = {
      contentType: 'video/mp4'
    };
    ref.putFile(recordedVideoURL,metadata).then(s => {
      console.log(s)
      ref.getDownloadURL().then(x => {
        console.log(x, 'x url');
        console.log('Your Video Has Been Uploaded')
        setFetchRecordedURL(x);
      });
    });
  }
  console.log(fetchRecordedURL,"fetched url")

  return (
    <View
      style={{
        padding: 5,
        flex: 2,
        borderRadius: 100000000 / 2,
        alignItems: 'center',
      }}>
      {/* <RNCamera
    style={{ height: RFValue(320), width: RFValue(320), overflow: 'hidden', borderRadius: 10000 / 2 }}
    ref={camera} 
    captureAudio={false}
    type={RNCamera.Constants.Type.front }
    androidCameraPermissionOptions={
      {
        title: 'Permissions Required',
        message: 'Allow app to access Camera',
        buttonPositive: 'Ok',
        buttonNegative: 'No'
      }

    }>
  </RNCamera> */}

      {device != null && hasPermission && (
        <>
          <Camera
            ref={camera}
            video={true}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            photo={true}
            preset="medium"
            fps={240}></Camera>
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}>

              <View style={{flexDirection:'row'}}>


              {isRecording === false && (
              <TouchableHighlight
                onPress={videoRecording}
                style={styles.capture}>
                <View />
              </TouchableHighlight>
            )}

            {isRecording && (
              <TouchableHighlight
                onPress={stopRecording}
                style={styles.stopCapture}>
                <View />
              </TouchableHighlight>
            )}

            <View>
              <Text onPress={UploadVideo} style={{color:'red'}}>Upload Video</Text>
            </View>
              </View>
           
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  currentTime: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 40,
    letterSpacing: -1,
    color: '#4a5563',
  },
  date: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 20,
    letterSpacing: -0.5,
    color: '#878787',
  },

  loginButtonText: {
    fontFamily: 'SFProDisplay-Bold',
    color: '#ffffff',
    fontSize: 16,
    letterSpacing: 0.8,
  },

  capture: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: StyleGuide.color.light,
    backgroundColor: StyleGuide.color.light,
    marginBottom: 15,
  },
  stopCapture: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: 'red',
    backgroundColor: 'red',
    marginBottom: 15,
  },
});

export default CameraComponent;
