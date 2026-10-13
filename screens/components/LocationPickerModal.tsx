import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import Geolocation from 'react-native-geolocation-service';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {API_KEY} from '../../Utils/Constants';
import {StyleGuide} from '../../Utils/StyleGuide';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

export interface SelectedLocationData {
  name: string;
  latitude: number;
  longitude: number;
}

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: SelectedLocationData) => void;
  initialLocation?: SelectedLocationData | null;
  darkMode?: boolean;
}

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  onClose,
  onSelectLocation,
  initialLocation,
  darkMode,
}) => {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  // Default coordinates (Lahore / fallback or initial)
  const [coordinates, setCoordinates] = useState({
    latitude: initialLocation?.latitude || 31.5204,
    longitude: initialLocation?.longitude || 74.3587,
  });
  const [placeName, setPlaceName] = useState(
    initialLocation?.name || 'Lahore, Pakistan',
  );
  const [isLocating, setIsLocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const isDark = Boolean(darkMode);
  const bgColor = isDark ? '#0F172A' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#0F172A';
  const subtextColor = isDark ? '#94A3B8' : '#64748B';
  const borderColor = isDark ? '#334155' : '#E2E8F0';

  useEffect(() => {
    if (visible) {
      if (initialLocation?.name) {
        setCoordinates({
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude,
        });
        setPlaceName(initialLocation.name);
      } else {
        // Automatically attempt to fetch GPS and reverse-geocode initial coordinates
        getCurrentLocation();
        reverseGeocode(coordinates.latitude, coordinates.longitude);
      }
    }
  }, [visible, initialLocation]);

  // Request Android location permissions
  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      return auth === 'granted';
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Social Bea needs your location to tag posts.',
          buttonNeutral: 'Ask Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // Get current device GPS location
  const getCurrentLocation = async () => {
    setIsLocating(true);
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setIsLocating(false);
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setCoordinates({latitude, longitude});
        mapRef.current?.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          800,
        );
        reverseGeocode(latitude, longitude);
        setIsLocating(false);
      },
      error => {
        console.error('GPS error:', error);
        setIsLocating(false);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  // Reverse geocode lat/lng into a human-friendly name
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      // 1. Try Google Maps Geocoding API
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`,
      );
      const json = await res.json();
      if (json.results && json.results.length > 0) {
        const bestResult = json.results[0];
        const formatted = bestResult.formatted_address;
        const parts = formatted.split(',');
        const shortName =
          parts.length > 2
            ? `${parts[0].trim()}, ${parts[1].trim()}`
            : formatted;
        setPlaceName(shortName);
        setIsGeocoding(false);
        return shortName;
      }
    } catch (err) {
      console.warn('Google reverse geocode error:', err);
    }

    // 2. Fallback to free BigDataCloud Reverse Geocoding API
    try {
      const fallbackRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      );
      const data = await fallbackRes.json();
      const city = data.city || data.locality || data.principalSubdivision;
      const country = data.countryName;
      const fallbackName =
        city && country
          ? `${city}, ${country}`
          : city || country || 'Lahore, Pakistan';
      setPlaceName(fallbackName);
      return fallbackName;
    } catch (fallbackErr) {
      console.warn('Fallback reverse geocode error:', fallbackErr);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Handle map press to drop marker
  const handleMapPress = (e: any) => {
    const {latitude, longitude} = e.nativeEvent.coordinate;
    setCoordinates({latitude, longitude});
    reverseGeocode(latitude, longitude);
  };

  const handleConfirm = () => {
    const finalName =
      placeName && placeName !== 'Selected Location' && placeName !== 'Locating...'
        ? placeName
        : 'Lahore, Pakistan';
    onSelectLocation({
      name: finalName,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}>
      <View style={[styles.container, {backgroundColor: bgColor}]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: bgColor,
              borderBottomColor: borderColor,
              paddingTop: insets.top > 0 ? insets.top : 12,
            },
          ]}>
          <TouchableOpacity
            style={styles.headerBtn}
            activeOpacity={0.7}
            onPress={onClose}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, {color: textColor}]}>
            Select Location
          </Text>
          <TouchableOpacity
            style={[styles.confirmHeaderBtn, {backgroundColor: StyleGuide.color.primary}]}
            activeOpacity={0.8}
            onPress={handleConfirm}>
            <Text style={styles.confirmHeaderBtnText}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Autocomplete Search Bar */}
        <View style={styles.searchWrapper}>
          <GooglePlacesAutocomplete
            placeholder="Search city, place, or landmark..."
            fetchDetails={true}
            keepResultsAfterBlur={true}
            nearbyPlacesAPI="GooglePlacesSearch"
            query={{
              key: API_KEY,
              language: 'en',
            }}
            onPress={(data, details = null) => {
              if (details?.geometry?.location) {
                const lat = details.geometry.location.lat;
                const lng = details.geometry.location.lng;
                const name = data.structured_formatting?.main_text || data.description;
                setCoordinates({latitude: lat, longitude: lng});
                setPlaceName(name);
                mapRef.current?.animateToRegion(
                  {
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.015,
                  },
                  1000,
                );
              }
            }}
            styles={{
              container: styles.autocompleteContainer,
              textInputContainer: [
                styles.searchInputContainer,
                {backgroundColor: bgColor, borderColor: borderColor},
              ],
              textInput: [
                styles.searchInput,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  color: textColor,
                },
              ],
              listView: [
                styles.searchListView,
                {backgroundColor: bgColor, borderColor: borderColor},
              ],
              row: [styles.searchRow, {backgroundColor: bgColor}],
              description: {color: textColor, fontSize: 13},
            }}
            textInputProps={{
              placeholderTextColor: subtextColor,
            }}
          />
        </View>

        {/* Map View */}
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
          onPress={handleMapPress}>
          <Marker
            coordinate={coordinates}
            draggable
            title={placeName}
            onDragEnd={e => {
              const {latitude, longitude} = e.nativeEvent.coordinate;
              setCoordinates({latitude, longitude});
              reverseGeocode(latitude, longitude);
            }}
          />
        </MapView>

        {/* My Location Floating GPS Button */}
        <TouchableOpacity
          style={[styles.myLocationBtn, {backgroundColor: bgColor}]}
          activeOpacity={0.8}
          onPress={getCurrentLocation}>
          {isLocating ? (
            <ActivityIndicator size="small" color={StyleGuide.color.primary} />
          ) : (
            <MaterialIcons
              name="my-location"
              size={22}
              color={StyleGuide.color.primary}
            />
          )}
        </TouchableOpacity>

        {/* Selected Location Bottom Card */}
        <View
          style={[
            styles.bottomCard,
            {
              backgroundColor: bgColor,
              borderTopColor: borderColor,
              paddingBottom: insets.bottom > 0 ? insets.bottom + 12 : 20,
            },
          ]}>
          <View style={styles.locationDetailsRow}>
            <View
              style={[
                styles.markerIconWrap,
                {backgroundColor: StyleGuide.color.primaryLight},
              ]}>
              <Feather
                name="map-pin"
                size={20}
                color={StyleGuide.color.primaryDark}
              />
            </View>
            <View style={{flex: 1, marginLeft: 12}}>
              <Text style={[styles.locationName, {color: textColor}]} numberOfLines={1}>
                {isGeocoding ? 'Detecting address...' : placeName}
              </Text>
              <Text style={[styles.locationCoords, {color: subtextColor}]} numberOfLines={1}>
                {isGeocoding
                  ? 'Finding address...'
                  : 'Tap "Add This Location" to attach'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.confirmBtn, {backgroundColor: StyleGuide.color.primary}]}
            activeOpacity={0.8}
            onPress={handleConfirm}>
            <Feather name="check" size={18} color="#FFFFFF" style={{marginRight: 6}} />
            <Text style={styles.confirmBtnText}>Add This Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  headerBtn: {
    padding: 6,
  },
  headerTitle: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 17,
  },
  confirmHeaderBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
  },
  confirmHeaderBtnText: {
    color: '#FFFFFF',
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 13,
  },
  searchWrapper: {
    position: 'absolute',
    top: 68,
    left: 12,
    right: 12,
    zIndex: 999,
  },
  autocompleteContainer: {
    flex: 0,
  },
  searchInputContainer: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 4,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  searchInput: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 13.5,
    fontFamily: StyleGuide.fontFamily.regular,
  },
  searchListView: {
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 6,
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: 220,
  },
  searchRow: {
    padding: 12,
  },
  map: {
    flex: 1,
    width: '100%',
  },
  myLocationBtn: {
    position: 'absolute',
    right: 16,
    bottom: 180,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  bottomCard: {
    paddingHorizontal: 18,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  locationDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  markerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationName: {
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 15,
  },
  locationCoords: {
    fontFamily: StyleGuide.fontFamily.regular,
    fontSize: 12,
    marginTop: 2,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontFamily: StyleGuide.fontFamily.bold,
    fontSize: 15,
  },
});

export default LocationPickerModal;
