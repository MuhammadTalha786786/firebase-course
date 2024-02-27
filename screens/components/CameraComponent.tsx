import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  Platform,
  Pressable
} from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  useCameraDevices,
} from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { StyleGuide } from '../../Utils/StyleGuide';
import storage from '@react-native-firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import Video from 'react-native-video';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';




interface cameraComponentsProps {
  recordedVideoURL: string
  setRecordedVideoURL: (e: string) => void
  fetchRecordedURL: string
  setFetchRecordedURL: (e: string) => void
  setIsCameraPost: (e: boolean) => void
  loading: boolean
  setLoading: (e: boolean) => void
}




const CameraComponent = (props: cameraComponentsProps) => {
  const camera = useRef<any>();
  const [hasPermission, setHasPermission] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [toggleCamera, setToggleCamera] = useState(false)
  // const [recordedVideoURL, setRecordedVideoURL] = useState('');
  // const [fetchRecordedURL, setFetchRecordedURL] = useState('')
  const navigation = useNavigation();
  const videoPlayer = useRef()

  console.warn(props?.fetchRecordedURL, "url")



  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const status = await Camera.requestCameraPermission();
        setHasPermission(status === 'authorized');
      })();
    }, [navigation]),
  );

  const devices = useCameraDevices();
  const device = toggleCamera ? devices?.front : devices.back;

  console.log(hasPermission, 'permission');

  const videoRecording = () => {
    setIsRecording(true);
    camera.current.startRecording({
      flash: 'on',
      onRecordingFinished: video => {
        props?.setRecordedVideoURL(video.path)
        // UploadVideo()
      },
      onRecordingError: error => console.error(error),
    });




  };

  const stopRecording = async () => {
    setIsRecording(false);
    await camera.current.stopRecording().then((res) => {
      props?.setIsCameraPost(false)
    });



  };






  // console.warn(props?.recordedVideoURL)



  // const UploadVideo = () => {
  //   props?.setLoading(true)
  //   console.log("upload video")
  //   let fileName = `${uuidv4()}${props?.recordedVideoURL.substr(
  //     props?.recordedVideoURL.lastIndexOf('.'),
  //   )}`;
  //   const ref = storage().ref(fileName);
  //   var metadata = {
  //     contentType: 'video/mp4'
  //   };
  //   ref.putFile(props?.recordedVideoURL, metadata).then(s => {
  //     console.log(s)
  //     ref.getDownloadURL().then(x => {

  //       props?.setLoading(false)
  //       console.log(x, 'x url');
  //       console.log('Your Video Has Been Uploaded')
  //       props?.setFetchRecordedURL(x);
  //     });
  //   });
  // }
  // console.log(fetchRecordedURL, "fetched url")

  return (
    <View
      style={{
        height: "100%",
        padding: 5,
        flex: 1,
        borderRadius: 100000000 / 2,
        // backgroundColor:'red',
        // alignItems: 'center',
      }}>


      {device != null && hasPermission && (
        <>
          <Camera
            ref={camera}
            video={true}
            style={[StyleSheet.absoluteFill, { height: '100%' }]}
            device={device}
            isActive={true}
            photo={true}
            preset="medium"
            fps={240}></Camera>


          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              // alignItems: 'center',
            }}>

            <Pressable onPress={() => { props?.setIsCameraPost(false) }} style={{ alignSelf: 'flex-end', flex: 1, left: 0 }}>
              <AntDesign name='closecircleo' color={'white'} size={25} />

            </Pressable>


            {/* <TouchableOpacity  onPress={()=>{props?.setIsCameraPost(false)}  }  >

               <Text style={{color:"red",}}>X</Text>
              </TouchableOpacity> */}


            {/* {
              fetchRecordedURL && 
              <Video source={{ uri: fetchRecordedURL }}   // Can be a URL or a local file.
                ref={(ref) => {
                  videoPlayer
                }}  
                fullscreen={false}
                controls={true}
                // Store reference
                //  onBuffer={this.onBuffer}                // Callback when remote video is buffering
                //  onError={this.videoError}               // Callback when video cannot be loaded
                style={styles.backgroundVideo} />
              
              } */}
            <View>



              <View style={{ flexDirection: 'row', }}>


                <View style={{ flex: 1, alignItems: 'center' }}>


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


                  {/* <View>
                <Text onPress={UploadVideo} style={{ color: 'red', marginTop:250 }}>Upload Video</Text>
              </View> */}
                </View>

                <View style={{ alignSelf: 'flex-end', marginBottom: 30 }}>

                  <Pressable onPress={() => setToggleCamera(!toggleCamera)} disabled={isRecording} >
                    <MaterialCommunityIcons name='camera-flip' color={'white'} size={30} />
                  </Pressable>
                </View>

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

  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    marginTop: 400,
    height: "40%",
    justifyContent: 'flex-end'
  },

  capture: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: StyleGuide.color.light,
    backgroundColor: StyleGuide.color.light,
    marginBottom: 15,
    marginTop: 250

  },
  stopCapture: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: 'red',
    backgroundColor: 'red',
    marginBottom: 15,
    marginTop: 250
  },
});

export default CameraComponent;
