import {
    View,
    Text,
    StyleSheet,
    Platform,
    PermissionsAndroid,
    TouchableOpacity,
    Alert,
    useWindowDimensions,
} from 'react-native';
import React, { useState } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Geolocation from 'react-native-geolocation-service';
import { API_KEY } from '../Utils/Constants';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
console.log(API_KEY, "api key")
import {
    check,
    request,
    PERMISSIONS,
    RESULTS,
    Permission,
} from 'react-native-permissions';

interface IGeolocation {
    latitude: number;
    longitude: number;
    accuracy?: number;
    lat?: number;
    lng?: number;
}
const GoogleMaps = () => {
    const window = useWindowDimensions();
    const [currentLocation, setCurrentLocation] = useState<IGeolocation | null>();
    const getPermissionsAndroid = async () => {
        const granted = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        return granted;
    };
    const getLocationCurrent = () => {
        if (Platform.OS == 'android') {
            getPermissionsAndroid().then(res => {
                if (res) {
                    Geolocation.getCurrentPosition(position => {
                        setCurrentLocation(position.coords);
                    });
                } else {
                    Alert.alert('Please Turn on Your location ...');
                }
            });
        } else {
            Geolocation.requestAuthorization('whenInUse');
            Geolocation.getCurrentPosition(position => {
                setCurrentLocation(position.coords);
            });
        }
    };

    console.warn(currentLocation, 'lat longitude');

    const setMarkerToCurrent = () => {
        checkLocationPermissions();
    };




    const checkLocationPermissions = async () => {
        console.log('hello');
        let permission: Permission;
        if (Platform.OS == 'android') {
            permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
        } else if (Platform.OS == 'ios') {
            permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
        } else {
            return false;
        }

        const status = await check(permission);
        console.log(status, 'status');
        switch (status) {
            case RESULTS.UNAVAILABLE:
                return false;
            case RESULTS.DENIED:
                const granted = await request(permission, {
                    title: 'Location Permission',
                    message:
                        'Social Bee needs access to your location for clock in & clock out.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                });

                if (granted == RESULTS.GRANTED) {
                    getLocationCurrent();
                    return true;
                } else {
                    return false;
                }
            case RESULTS.GRANTED:
                getLocationCurrent();
                return true;
            case RESULTS.BLOCKED:
                return false;
        }
    };
    return (
        <View style={styles.container}>
            <GooglePlacesAutocomplete
                styles={{
                    container: {
                        position: 'absolute',
                        marginTop: 10,
                        padding: 10,
                        zIndex: 9999,
                        width: '100%',
                        color: "#111"
                    },
                }}
                placeholder="Search"
                currentLocation={true}
                onPress={(data, details) => {
                    setCurrentLocation(null);
                }}
                query={{
                    key: API_KEY,
                    language: 'en',
                }}
            />

            <MapView
                style={{
                    flex: 1,
                    height: '100%',
                    width: '100%',
                    backgroundColor: "#111"
                }}


                showsUserLocation
                userInterfaceStyle={'dark'}
                minZoomLevel={15}
                mapType="standard"
                showsCompass={true}
                zoomEnabled={true}
                provider={PROVIDER_GOOGLE}
                showsMyLocationButton={true}
                region={{
                    latitude:
                        currentLocation !== undefined
                            ? currentLocation?.latitude
                            : 31.5203696,
                    longitude:
                        currentLocation !== undefined
                            ? currentLocation?.longitude
                            : 74.35874729999999,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}>
                <Marker
                    style={{ flex: 1 }}
                    coordinate={{
                        latitude:
                            currentLocation !== undefined
                                ? currentLocation?.latitude
                                : 31.5203696,
                        longitude:
                            currentLocation !== undefined
                                ? currentLocation?.longitude
                                : 74.35874729999999,
                    }}
                />
            </MapView>
            <TouchableOpacity
                style={{
                    position: 'absolute',
                    backgroundColor: 'white',
                    elevation: 2,
                    padding: 10,
                    borderRadius: 30,
                    zIndex: 99999,
                    top: window.height - 200,
                    left: window.width - 80,
                }}
                onPress={setMarkerToCurrent}>
                <Icon name="my-location" size={30} color="#77acf1" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
});
export default GoogleMaps;
