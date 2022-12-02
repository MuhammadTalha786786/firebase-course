import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  Platform,
} from 'react-native';
import React, {useRef, useState, useEffect} from 'react';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import {useNavigation} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native';
import {StyleGuide} from '../../Utils/StyleGuide';
import storage from '@react-native-firebase/storage';
import {v4 as uuidv4} from 'uuid';

const CameraComponent = () => {
  const camera = useRef<any>();
  const [hasPermission, setHasPermission] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoURL, setRecordedVideoURL] = useState('');
  const [fetchRecordedURL, setFetchRecordedURL] = useState('');
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
      flash: 'off',
      onRecordingFinished: video => {
        console.log(video, 'video details');
        setRecordedVideoURL(video.path);
      },
      onRecordingError: error => console.error(error),
    });
  };

  const stopRecording = async () => {
    setIsRecording(false);

    await camera.current.stopRecording();
  };

  const UploadVideo = () => {
    console.log(recordedVideoURL, 'url');
    console.log('upload video');
    let fileName = `${uuidv4()}${recordedVideoURL.substr(
      recordedVideoURL.lastIndexOf('.'),
    )}`;
    console.log(fileName, 'file name of the recorded video');
    const ref = storage().ref().child(fileName);

    console.log('ref', ref);
    console.log('recordedVideoURL', recordedVideoURL);

    // storage()
    //   .ref(fileName)
    //   .putFile(recordedVideoURL)
    //   .then(snapshot => {
    //     //You can check the image is now uploaded in the storage bucket
    //     console.log(snapshot, 'snapshot of uploading the file.....');
    //     console.log(`${fileName} has been successfully uploaded.`);
    //   })
    //   .catch(e => console.log('uploading image error => ', e));
    // var task = ref.putFile(recordedVideoURL);
    // task.on(
    //   'state_changed',
    //   function progress(snapshot) {
    //     console.log(snapshot,)
    //     var percentage =
    //       (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    //     ref.getDownloadURL().then(x => {
    //       console.log(x, 'x url');
    //       console.log('Your Video Has Been Uploaded');
    //       setFetchRecordedURL(x);
    //     });
    //     console.log(percentage, 'the process is on the way....');
    //   },
    //   function complete() {},
    // );

     ref.putFile(recordedVideoURL).then(s => {
        console.log(s,"s");
        ref.getDownloadURL().then(x => {
          console.log(x, 'x url');
          console.log('Your Video Has Been Uploaded');
          setFetchRecordedURL(x);
        });
      }).catch((error)=>{
        console.log(error,"this is the error while uploading videos")
      })
  };
  console.log(fetchRecordedURL, 'fetched url');

  return (
    <View
      style={{
        padding: 5,
        flex: 2,
        borderRadius: 100000000 / 2,
        alignItems: 'center',
      }}>
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
            <View style={{flexDirection: 'row'}}>
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
                <Text onPress={UploadVideo} style={{color: 'red'}}>
                  Upload Video
                </Text>
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
