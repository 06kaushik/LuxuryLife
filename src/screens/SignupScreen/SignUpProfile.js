import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, TextInput, ScrollView, KeyboardAvoidingView, FlatList, PermissionsAndroid, Alert, ActivityIndicator, ImageBackground, Keyboard } from 'react-native';
import images from '../../components/images';
import Slider from '@react-native-community/slider';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import Toast from 'react-native-simple-toast';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from "react-native-modal";
import Geolocation from '@react-native-community/geolocation';
import LottieView from 'lottie-react-native';
import { AuthContext } from '../../components/AuthProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import RBSheet from 'react-native-raw-bottom-sheet';
import { PLAYFAIRFONTS, POPPINSRFONTS } from '../../components/GlobalStyle';
import ImageCropPicker from 'react-native-image-crop-picker';
import analytics from '@react-native-firebase/analytics';



const { width, height } = Dimensions.get('window');

const ProfileSignUp = ({ navigation, route }) => {

    const { userId, step, email, password, idToken, fcmtoken, logintoken } = route.params
    const { login, loginWithEmail, loginWithDoItLater } = useContext(AuthContext);
    const [currentStep, setCurrentStep] = useState(step || 4);
    const [name, setName] = useState('');
    const [username, setUserName] = useState('')
    const [search, setSearch] = useState('')
    const [unit, setUnit] = useState('cm');
    const [height, setHeight] = useState(0);
    const [selectedBodyType, setSelectedBodyType] = useState('');
    const [selectethnicity, setEthnicity] = useState('');
    const [selecteducation, setEducation] = useState('')
    const [workfield, setField] = useState('')
    const [rstatus, setRStatus] = useState('')
    const [child, setChild] = useState('')
    const [networth, setNetWorth] = useState('')
    const [ageRange, setAgeRange] = useState([18, 32]);
    const [userhobbies, setUserHobbies] = useState([])
    const [smoke, setSmoke] = useState('')
    const [drinking, setDrinking] = useState('')
    const [userinterest, setUserInterest] = useState([])
    const [aboutpartner, setAboutPartner] = useState('')
    const [photos, setPhotos] = useState([]);
    const [profileheading, setProfileHeading] = useState('')
    const [aboutyou, setAboutYou] = useState('')
    const bodyTypes = ['Slim', 'Athletic', 'Average', 'Curvy', 'Plus-size', 'Petite', 'Muscular', 'Broad', 'Lean', 'Prefer not to say'];
    const ethnicity = ['Asian', 'Black/African descent', 'Hispanic/Latino', 'Middle Eastern', 'Native American/Indigenous', 'Pacific Islander', 'White/Caucasian', 'Mixed/Multiracial', 'Other', 'Prefer not to say'];
    const education = ["High School", "Some College", "Associate's Degree", "Bachelor's Degree", "Master's Degree", "PhD / Post Doctoral", "MD / Medical Doctor", "JD / Attorney", 'Prefer not to say']
    const workField = ['Finance/Investment', 'Technology/Software', 'Art/Entertainment', 'Healthcare/Medical', 'Law/Legal', 'Education', 'Marketing/Sales', 'Hospitality/Real Estate', 'Entrepreneur/Startup', 'Other', 'Prefer not to say'];
    const statusR = ["Single", "In a Relationship", "Divorced", "Widowed", "Married", 'Prefer not to say']
    const children = ['Yes', 'No', 'Prefer not to say'];
    const netWorth = ['Below $200,000', '$200,000 - $500,000', '$500,000 - $1 Million', '$1 Million - $5 Million', 'More Than $5 Million', 'Prefer not to say'];
    const hobbies = ['Reading', 'Traveling', 'Cooking/Baking', 'Hiking/Outdoor Adventures', 'Photography', 'Painting/Drawing', 'Playing Sports', 'Writing', 'Yoga/Meditation', 'Playing Musical Instruments', 'Gardening', 'Watching Movies/TV Shows', 'Dancing', 'Volunteering/Community Service'];
    const smoking = ['Yes', 'No', 'Occasionally'];
    const alcoholic = ['Yes', 'No', 'Occasionally'];
    const interests = ['Fine Dining', 'Luxury Travel', 'Yachting', 'Private Jets', 'Wine Tasting', 'Fashion & Design', 'Exclusive Events', 'Golf', 'High-End Cars', 'Wellness & Fitness', 'Spa Retreats', 'Gourmet Cooking', 'Philanthropy', 'Skiing/Snowboarding', 'Collecting (e.g., stamps, coins, Car, Wine)'];
    const [selfie, setSelfie] = useState(null);
    const [message, setMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoading1, setIsLoading1] = useState(false);
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [load, setLoad] = useState(false)
    const [submitselfie, setSubmitSelfie] = useState(false);
    const [uploadedPublicPhotos, setUploadedPublicPhotos] = useState([]);
    const [uploadedPrivatePhotos, setUploadedPrivatePhotos] = useState([]);
    const [isAgeSelected, setIsAgeSelected] = useState(false);
    const [isMaxMarkerActive, setIsMaxMarkerActive] = useState(false);
    const [workfieldskip, setWorkFieldSkip] = useState(false)
    const [childskip, setChildSkip] = useState(false)
    const [networthskip, setNetWorthSkip] = useState(false)
    const [educationskip, setEducationSkip] = useState(false)
    const [hobbieskip, setHobbieSkip] = useState(false)
    const [ageskip, setAgeSkip] = useState(false)

    const rbSheetRef = useRef();
    const [attemptedUsernames, setAttemptedUsernames] = useState([]);
    const [attemptCount, setAttemptCount] = useState(0);
    const selectedIndex = useRef(null);
    const [userdetails, setUserDetails] = useState(null)
    const [loading, setLoading] = useState(false);
    const [loadingUserData, setLoadingUserData] = useState(true);



    useEffect(() => {
        if (step) {
            setCurrentStep(step);
        }
    }, [step]);

    useEffect(() => {
        const fetchUserDetails = async () => {
            const token = await AsyncStorage.getItem('verifcationToken');
            try {
                const response = await axios.get('auth/user-profile', {
                    headers: { Authorization: token },
                });

                const data = response.data.data;
                setUserDetails(data);

                // Pre-fill fields
                if (data?.userName) setUserName(data.userName);
                if (data?.city) {
                    setSearch(data.city);
                    setCity(data.city); // ✅ this fixes it
                }
                if (data?.state) setState(data.state);
                if (data?.country) setCountry(data.country);
                if (data?.smoke) setSmoke(data.smoke);
                if (data?.drink) setDrinking(data.drink);
                if (data?.ethnicity) setEthnicity(data.ethnicity);
                if (data?.tall?.value) setHeight(Number(data.tall.value));
                if (data?.bodyType) setSelectedBodyType(data.bodyType);
                if (data?.highestEducation) setEducation(data.highestEducation);
                if (data?.workField) setField(data.workField);
                if (data?.currentRelationshipStatus) setRStatus(data.currentRelationshipStatus);
                if (data?.children) setChild(data.children);
                if (data?.netWorthRange) setNetWorth(data.netWorthRange);
                if (data?.hobbies?.length) setUserHobbies(data.hobbies);
                if (data?.luxuryInterests?.length) setUserInterest(data.luxuryInterests);
                if (data?.preferences?.ageRange) {
                    setAgeRange([
                        data.preferences.ageRange.min,
                        data.preferences.ageRange.max
                    ]);
                    setIsAgeSelected(true);
                }
                if (data?.preferences?.aboutPartnerDescription) setAboutPartner(data?.preferences?.aboutPartnerDescription);
                if (data?.profileHeading) setProfileHeading(data.profileHeading);
                if (data?.aboutYou) setAboutYou(data.aboutYou);
                if (data?.profilePicture) setPhotos([data.profilePicture]);


            } catch (error) {
                console.log('Error fetching user data:', error);
            } finally {
                setLoadingUserData(false);
            }
        };

        fetchUserDetails();
    }, []);



    // const handlePartnerDescriptionChange = (text) => {
    //     setAboutPartner(text);
    //     if (text.length > 0) {
    //         setAboutPartnerSkip(true);
    //     } else {
    //         setAboutPartnerSkip(false);
    //     }
    // };


    useEffect(() => {
        if (search.length >= 3) { // Trigger API call if 3 or more characters are entered
            fetchLocationSuggestions(search);
        } else {
            setSuggestions([]); // Clear suggestions if input length is less than 3
        }
    }, [search]);

    const fetchLocationSuggestions = async (query) => {
        setIsLoading1(true);

        try {
            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=AIzaSyBMSu3-s9hl4tDatsaEcTXC5Ul-IEP5J_E`
            );

            // Extracting suggestions from the API response
            const results = response.data.results;
            //('resultt', JSON.stringify(results));

            if (results.length > 0) {
                setSuggestions(results);
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            console.error("Error fetching location suggestions:", error);
        } finally {
            setIsLoading1(false);
        }
    };

    const handleSelectLocation = async (item) => {

        setSearch(item.formatted_address);
        setSuggestions([]);
        const city = item.address_components.find((component) => component.types.includes("locality"))?.long_name || '';
        const state = item.address_components.find((component) => component.types.includes("administrative_area_level_1"))?.long_name || '';
        const country = item.address_components.find((component) => component.types.includes("country"))?.long_name || '';
        const latitude = item.geometry.location.lat;
        const longitude = item.geometry.location.lng;

        const token = await AsyncStorage.getItem('verifcationToken');
        const headers = {
            Authorization: token
        };
        let body = {
            step: 5,
            accountUpdatePayload: {
                location: {
                    type: "Point",
                    coordinates: [longitude, latitude],
                },
                city: city,
                state: state,
                country: country,
            },
        };
        try {
            const apiResponse = await axios.put(`auth/update-account/${userId}`, body, { headers });
            // //("API response from selection :", apiResponse.data);
            Toast.show('Updated Successfully', Toast.SHORT)
            setCurrentStep(currentStep + 1);
        } catch (error) {
            console.error("Error updating account:", error.message);
            Toast.show('Something Went Wrong', Toast.SHORT)
        }
    };


    const fetchLocationName = async () => {

        setIsLoading(true);

        const locationPermission = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        if (locationPermission !== 'granted') {
            //("Location permission denied");
            Toast.show('Location permission is required', Toast.SHORT);
            setIsLoading(false);
            return;
        }
        setTimeout(async () => {
            Geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;

                // Get location details from Google Geocoding API
                const response = await axios.get(
                    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyBMSu3-s9hl4tDatsaEcTXC5Ul-IEP5J_E`
                );

                if (response.data.results.length > 0) {
                    const address = response.data.results[0].formatted_address;

                    // Extract city, state, and country from the address components
                    let city = '';
                    let state = '';
                    let country = '';
                    const addressComponents = response.data.results[0].address_components;

                    addressComponents.forEach(component => {
                        if (component.types.includes("locality")) {
                            city = component.long_name;
                        }
                        if (component.types.includes("administrative_area_level_1")) {
                            state = component.long_name;
                        }
                        if (component.types.includes("country")) {
                            country = component.long_name;
                        }
                    });

                    setCity(city);
                    setState(state);
                    setCountry(country);
                    setSearch(`${city}, ${state}, ${country}`);
                    // Prepare the account update payload
                    const token = await AsyncStorage.getItem('verifcationToken');

                    const headers = {
                        Authorization: token,
                    };
                    let body = {
                        step: 5,
                        accountUpdatePayload: {
                            location: {
                                type: "Point",
                                coordinates: [longitude, latitude]
                            },
                            city: city,
                            state: state,
                            country: country
                        }
                    };
                    //("Payload to send to API:", body);

                    // Send the payload to the API
                    try {
                        const apiResponse = await axios.put(`auth/update-account/${userId}`, body, { headers });
                        Toast.show('Updated Successfully', Toast.SHORT);
                        setCurrentStep(currentStep + 1);
                        // //("API response:", apiResponse.data);
                    } catch (error) {
                        console.error("Error sending data to API:", error.message);
                        Toast.show('Something Went Wrong', Toast.SHORT);
                    }
                } else {
                    //("No results found for the provided coordinates.");
                }
                setIsLoading(false); // Hide Lottie animation after processing
            }, (error) => {
                console.error("Error getting current location:", error);
                Toast.show("Error getting current location, check your device location", Toast.SHORT);
                setIsLoading(false); // Hide Lottie animation after error
            });
        }, 3000); // W
    };


    const convertToFeetInch = (cm) => {
        const totalInches = cm / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        return `${feet}ft ${inches}in`;
    };

    const handleBodyTypeSelect = (type) => {
        if (selectedBodyType === type) {
            setSelectedBodyType('');
        } else {
            setSelectedBodyType(type);
        }
    };


    const handleEthnicity = (type) => {
        if (selectethnicity === type) {
            setEthnicity(''); // Deselect if the same ethnicity is clicked
        } else {
            setEthnicity(type); // Select the new ethnicity
        }
    };


    const handleEducation = (type) => {
        if (selecteducation === type) {
            setEducation(''); // Deselect if the same education is clicked
            setEducationSkip(false)
        } else {
            setEducation(type); // Select the new education level
            setEducationSkip(true)
        }
    };


    const handleWorkField = (type) => {
        // If the same option is clicked again, deselect it
        if (workfield === type) {
            setField(''); // Deselect the option
            setWorkFieldSkip(false); // Reset skip status if deselected
        } else {
            setField(type); // Select the new option
            setWorkFieldSkip(true); // Set skip status when an option is selected
        }
    };

    const handleRStatus = (type) => {
        if (rstatus === type) {
            setRStatus('');
        } else {
            setRStatus(type);
        }
    };

    const handleChildren = (type) => {
        if (child === type) {
            setChild('');
            setChildSkip(false);
        } else {
            setChild(type);
            setChildSkip(true);
        }
    };


    const handleNetWorth = (type) => {

        if (networth === type) {
            setNetWorth('');
            setNetWorthSkip(false);
        } else {
            setNetWorth(type);
            setNetWorthSkip(true);
        }
    };

    const handleAlcohol = (type) => {
        // If the same option is clicked again, deselect it
        if (drinking === type) {
            setDrinking(''); // Deselect the option
        } else {
            setDrinking(type); // Select the new option
        }
    };

    const handleSliderChange = (values) => {
        setAgeRange(values);
        setIsAgeSelected(true);
        setIsMaxMarkerActive(true);
    };


    const handleHHobbies = (hobby) => {
        if (userhobbies.includes(hobby)) {
            setUserHobbies(userhobbies.filter(item => item !== hobby));

        } else if (userhobbies.length < 7) {
            setUserHobbies([...userhobbies, hobby]);

        } else {
            Toast.show('You can select up to 7 hobbies only', Toast.SHORT);
        }
    };


    const handleInterests = (interest) => {
        if (userinterest.includes(interest)) {
            setUserInterest(userinterest.filter(item => item !== interest));
        } else if (userinterest.length < 7) {
            setUserInterest([...userinterest, interest]); // Select new interest if less than 7 interests
        } else {
            Toast.show('You can select up to 7 interests only', Toast.SHORT);
        }
    };


    const handlePhotoSelection = (index) => {
        rbSheetRef.current.open();
        selectedIndex.current = index;
    };


    const handleImagePick = async (type) => {
        const pickerOptions = {
            width: 300,
            height: 300,
            cropping: false, // no crop yet
            compressImageQuality: 1,
            mediaType: 'photo',
        };

        try {
            let image = null;
            if (type === 'camera') {
                image = await ImageCropPicker.openCamera(pickerOptions);
            } else {
                image = await ImageCropPicker.openPicker(pickerOptions);
            }

            if (selectedIndex.current === 0) {
                // Show alert for crop/full for profile photo
                Alert.alert(
                    "Choose Option",
                    "Would you like to crop the image before uploading?",
                    [
                        {
                            text: "Crop Image",
                            onPress: () => cropSelectedImage(image.path),
                        },
                        {
                            text: "Use Full Image",
                            onPress: () => {
                                const updated = [...photos];
                                updated[selectedIndex.current] = image.path;
                                setPhotos(updated);
                            },
                        },
                        {
                            text: "Cancel",
                            style: "cancel",
                        },
                    ]
                );
            } else {
                // Use full image directly for other slots
                const updated = [...photos];
                updated[selectedIndex.current] = image.path;
                setPhotos(updated);
            }
        } catch (error) {
            //('Image selection error:', error);
        } finally {
            rbSheetRef.current.close();
        }
    };


    const cropSelectedImage = async (imagePath) => {
        try {
            const cropped = await ImageCropPicker.openCropper({
                path: imagePath,
                width: 300,
                height: 300,
                cropperCircleOverlay: true,
                compressImageQuality: 1,

            });
            const updated = [...photos];
            updated[selectedIndex.current] = cropped.path;
            setPhotos(updated);
        } catch (err) {
            //('Crop cancelled or failed:', err); 
        }
    };

    const handleTakeSelfie = () => {
        const options = {
            mediaType: 'photo',
            cameraType: 'front', // Use the front-facing camera
            saveToPhotos: true,
            quality: 1,
        };

        launchCamera(options, (response) => {
            if (!response.didCancel && !response.error && response.assets) {
                setSelfie(response.assets[0].uri); // Save the captured selfie
            }
        });
    };

    const uploadPhoto = async (uri, isPrivate = false) => {
        const token = await AsyncStorage.getItem('verifcationToken');
        try {
            const formData = new FormData();
            formData.append('file', {
                uri,
                name: `photo_${Date.now()}.jpg`,
                type: 'image/jpeg',
            });

            // Determine the correct endpoint based on privacy
            const endpoint = isPrivate ? 'file/upload-private' : 'file/upload';
            setIsUploading(true);
            setSubmitSelfie(true)
            const response = await axios.post(endpoint, formData, {
                headers: {
                    Authorization: token,
                    'Content-Type': 'multipart/form-data',
                },
            });
            await new Promise((resolve) => setTimeout(resolve, 5000));
            setIsUploading(false);
            setSubmitSelfie(false)
            //(`Response from ${endpoint}:`, response.data);

            // Extract and return the URL of the uploaded photo
            const uploadedUrl = response.data?.data?.url
            //('Uploaded photo URL:', uploadedUrl);
            return uploadedUrl;
        } catch (error) {
            setIsUploading(false);
            setSubmitSelfie(false)
            console.error(`Error uploading to ${isPrivate ? 'private' : 'public'} endpoint:`, error.response?.data || error.message);
            throw error;
        }
    };


    const handleSubmit = async () => {
        const token = await AsyncStorage.getItem('verifcationToken');
        const headers = {
            Authorization: token,
        };

        const publicPhotos = photos.slice(1, 7).filter(Boolean);

        try {
            // Change 'urls' to 'uploadedUrls' to avoid the reference error
            const uploadedUrls = await Promise.all(
                photos.map((photo, index) => {
                    if (!photo) return null;
                    const isPrivate = index >= 7;
                    return uploadPhoto(photo, isPrivate);
                })
            );
            const profilePicture = uploadedUrls[0] || ''; // Use uploadedUrls here
            const publicPhotos = uploadedUrls.slice(1, 7).filter(Boolean);
            const privatePhotos = uploadedUrls.slice(7).filter(Boolean);

            const accountUpdatePayload = {
                step: 20,
                accountUpdatePayload: {
                    profilePicture,
                    publicPhotos: publicPhotos,
                    privatePhotos: privatePhotos,
                },
            };

            const response = await axios.put(`auth/update-account/${userId}`, accountUpdatePayload, { headers });
            if (response.status === 200) {
                Toast.show('Photos uploaded successfully!', Toast.SHORT);
                setLoading(false)
                return true;  // Return true to indicate success
            } else {
                throw new Error('Failed to upload photos');  // Handle failure case
            }
        } catch (error) {
            console.error('Error updating account:', error.response?.data.message || error.message);
            if (error.message === 'Network Error') {
                Alert.alert('Network Error', 'Failed to upload photos due to a network issue. Please try again.');
            } else {
                // Alert.alert('Error', 'Failed to upload photos. Please try again.');
                Toast.show('Failed to upload', Toast.SHORT)
            }
            return false;  // Return false to indicate failure
        }
    };




    const handleSubmitSelfie = async () => {
        setLoad(true);
        const token = await AsyncStorage.getItem('verifcationToken');
        const headers = {
            Authorization: token,
        };
        try {
            if (!selfie) {
                Alert.alert('Error', 'Please take a selfie before submitting.');
                setLoad(false);
                return;
            }
            const realTimePictureUrl = await uploadPhoto(selfie, false);
            //('Uploaded selfie URL:', realTimePictureUrl);
            setSubmitSelfie(true)
            const accountUpdatePayload = {
                step: 23,
                accountUpdatePayload: {
                    realTimePicture: realTimePictureUrl,
                },
            };
            //('Payload for account update (selfie):', accountUpdatePayload);
            const response = await axios.put(`auth/update-account/${userId}`, accountUpdatePayload, { headers });
            //('Response from account update:', response.data);
            if (response.status === 200) {
                Toast.show('Selfie uploaded successfully!', Toast.SHORT);
                return true;
            } else {
                Toast.show('Failed to upload selfie. Please try again.', Toast.SHORT);
                return false;
            }
        } catch (error) {
            console.error('Error updating account:', error.response?.data || error.message);
            if (error.message === 'Network Error') {
                Alert.alert('Network Error', 'Failed to upload photos due to a network issue. Please try again.');
                throw new Error('Network Error');
            }

            Alert.alert('Error', 'Failed to upload photos. Please try again.');
        } finally {
            setSubmitSelfie(false)

        }
    };

    const renderLottieModal = () => (
        <Modal
            transparent={true}
            animationType="fade"
            visible={isUploading}
            onRequestClose={() => { }}
        >
            <View style={styles.modalContainer1}>
                <LottieView
                    source={require('../../assets/upload.json')}
                    autoPlay
                    loop
                    style={styles.lottie}
                />
                <Text style={styles.modalText1}>Uploading, please wait...</Text>
            </View>
        </Modal>
    );

    const handleSmoking = (type) => {
        setSmoke(type);
    };

    const handleGoogleSignIn = async () => {
        try {
            // const googletoken = await GoogleSignin.getTokens();
            // const idToken = googletoken.idToken;
            const response = await axios.post('auth/sign-in-google', { idToken });
            console.log('response from the google sign in>>>>>>>>> in signuo profile');
            Toast.show(response?.data?.message, Toast.SHORT);
            if (response?.data?.data?.user?.email) {
                login(idToken);
            } else {
                // Handle case where the user does not exist
                //('User not found');
            }

        } catch (error) {
            //('Error from Google Sign-In:', error.message);
            // Toast.show('Failed to sign in with Google', Toast.SHORT);
        }
    };




    const handleDoitLater = async () => {
        setLoading(true);  // Start the loader

        try {
            if (idToken.length > 0) {
                await login(idToken);
            } else {
                await loginWithDoItLater(logintoken);
            }
        } catch (error) {
            console.error('Error during login:', error);
            Toast.show('Something went wrong. Please try again later.', Toast.SHORT);
        } finally {
            setLoading(false);  // Stop the loader after the operation
        }
    };


    const handleContinue = async () => {
        if (currentStep !== 4) {
            Keyboard.dismiss();
        }
        setLoading(true);

        if (currentStep === 4) {
            if (!username || username.length < 3) {
                Toast.show('Username must be at least 2 characters long.', Toast.SHORT);
                setLoading(false);
                return;
            }
            const isValid = /^[a-zA-Z0-9]+$/.test(username);
            const startsWithCapital = /^[A-Z]/.test(username);
            if (!isValid) {
                Toast.show('Username can only contain letters and numbers, no special characters and no space.', Toast.SHORT);
                setLoading(false);
                return;
            }
            // if (!startsWithCapital) {
            //     Toast.show('Username must start with a capital letter.', Toast.SHORT);
            //     setLoading(false);
            //     return;
            // }

            if (
                attemptedUsernames.includes(username) &&
                username !== userdetails?.userName
            ) {
                Toast.show('You have already tried this username. Please choose a different one.', Toast.SHORT);
                setLoading(false);
                return;
            }

            if (attemptCount < 2) {
                if (username !== userdetails?.userName) {
                    // Only block if it's not their own prefilled username
                    setAttemptedUsernames(prev => [...prev, username]);
                    setAttemptCount(prev => prev + 1);
                    Toast.show('Username already exists. Please choose a different name.', Toast.SHORT);
                    setLoading(false);
                    return;
                } else {
                    // It's user's own username, allow it
                    await userUserName();
                    setCurrentStep(currentStep + 1);
                    setLoading(false);
                    return;
                }


            } else {
                // 3rd attempt: hit API
                try {
                    const token = await AsyncStorage.getItem('verifcationToken');
                    const headers = {
                        Authorization: token,
                    };
                    const body = {
                        userName: username
                    };
                    //('body of username', body);

                    const resp = await axios.post('auth/check-username-available', body, { headers });
                    //('response from username api', resp.data);

                    if (resp.data.message === 'Username already exists') {
                        // Third attempt: even if exists, move ahead
                        await userUserName();
                        setCurrentStep(currentStep + 1);
                        setLoading(false);
                    } else {
                        // Username available, move ahead
                        await userUserName();
                        setCurrentStep(currentStep + 1);
                        setLoading(false);
                    }
                } catch (error) {
                    console.error('Error checking username availability:', error);
                    Toast.show('There was an error verifying the username. Please try again later.', Toast.SHORT);
                    setLoading(false);
                }
            }
        }
        else if (currentStep === 5) {
            if (!search || search.length < 3 || !city) {
                Toast.show('Please select your location to continue.', Toast.SHORT);
                setLoading(false);
                return;
            }
            setCurrentStep(currentStep + 1);
            setLoading(false);
        }
        else if (currentStep === 6) {
            if (height <= 0) {
                Toast.show('Select Height To Continue.', Toast.SHORT);
                setLoading(false);
                return;
            }

            try {
                await userHeight();
                setCurrentStep(currentStep + 1);
                setLoading(false);
            } catch (error) {
                console.error('Error updating height:', error);
                Toast.show('There was an error updating your height. Please try again later.', Toast.SHORT);
                setLoading(false);
            }
        }
        else if (currentStep === 7) {
            if (selectedBodyType.length <= 0) {
                Toast.show('Choose your body type to continue', Toast.SHORT);
                setLoading(false);
                return;
            }

            try {
                await userBodyType(); // Call the userHeight function and wait for it to complete
                setCurrentStep(currentStep + 1); // Proceed to the next step after a successful API call
                setLoading(false);
            } catch (error) {
                console.error('Error updating bodytype:', error);
                Toast.show('There was an error updating your bodytype. Please try again later.', Toast.SHORT);
                setLoading(false);
            }
        }
        else if (currentStep === 8) {
            if (selectethnicity.length <= 0) {
                Toast.show('Choose your ethnicity to continue.', Toast.SHORT);
                setLoading(false);
                return;
            }

            try {
                await userEthnicity(); // Call the userHeight function and wait for it to complete
                setCurrentStep(currentStep + 1); // Proceed to the next step after a successful API call
                setLoading(false);
            } catch (error) {
                console.error('Error updating ethnicity:', error);
                Toast.show('There was an error updating your ethnicity. Please try again later.', Toast.SHORT);
                setLoading(false);
            }
        }

        else if (currentStep === 9) {
            if (selecteducation.length <= 0) {
                Toast.show('Choose your education to continue.', Toast.SHORT);
                setLoading(false);
                return;
            }

            try {
                await userEducation(); // Call the userHeight function and wait for it to complete
                setCurrentStep(currentStep + 1); // Proceed to the next step after a successful API call
                setLoading(false);
            } catch (error) {
                console.error('Error updating Education:', error);
                Toast.show('There was an error updating your Education. Please try again later.', Toast.SHORT);
                setLoading(false);
            }
        }

        else if (currentStep === 10) {
            if (workfield.length <= 0) {
                Toast.show('Choose your workfield to continue.', Toast.SHORT);
                setLoading(false);
                return;
            }

            try {
                await userWorkField(); // Call the userHeight function and wait for it to complete
                setCurrentStep(currentStep + 1); // Proceed to the next step after a successful API call
                setLoading(false);
            } catch (error) {
                console.error('Error updating WorkField:', error);
                Toast.show('There was an error updating your WorkField. Please try again later.', Toast.SHORT);
                setLoading(false);
            }
        }

        else if (currentStep === 11) {
            if (rstatus.length <= 0) {
                Toast.show('Choose your status to continue.', Toast.SHORT);
                setLoading(false);
                return;
            }

            try {
                await userRelationStatus(); // Call the userHeight function and wait for it to complete
                setCurrentStep(currentStep + 1); // Proceed to the next step after a successful API call
                setLoading(false);
            } catch (error) {
                console.error('Error updating Status:', error);
                Toast.show('There was an error updating your Status. Please try again later.', Toast.SHORT);
                setLoading(false);
            }
        }

        else if (currentStep === 12) {
            if (child.length <= 0) {
                Toast.show('Select an option to continue.', Toast.SHORT);
                setLoading(false);
                return;
            }

            try {
                await userChildren(); // Call the userHeight function and wait for it to complete
                setCurrentStep(currentStep + 1); // Proceed to the next step after a successful API call
                setLoading(false);
            } catch (error) {
                console.error('Error updating Children:', error);
                Toast.show('There was an error updating your Children. Please try again later.', Toast.SHORT);
                setLoading(false);
            }
        }

        else if (currentStep === 13) {
            if (networth.length <= 0) {
                Toast.show('Choose your networth to continue.', Toast.SHORT);
                setLoading(false);
                return;
            }

            try {
                await userNetWorthRange(); // Call the userHeight function and wait for it to complete
                setCurrentStep(currentStep + 1); // Proceed to the next step after a successful API call
                setLoading(false);
            } catch (error) {
                console.error('Error updating NetWorth:', error);
                Toast.show('There was an error updating your NetWorth. Please try again later.', Toast.SHORT);
                setLoading(false);
            }
        }

        else if (currentStep === 14) {
            if (!isAgeSelected) {
                Toast.show('Please select your age preference to continue.', Toast.SHORT);
                setLoading(false);
                return;
            }
            if (ageRange[0] <= 0 || ageRange[1] <= 0) {
                Toast.show('Both minimum and maximum age must be greater than 0.', Toast.SHORT);
                setLoading(false);
                return;
            }
            if (ageRange[0] >= ageRange[1]) {
                Toast.show('Minimum age must be less than maximum age.', Toast.SHORT);
                setLoading(false);
                return;
            }

            try {
                await userAgeRange(); // Call the userHeight function and wait for it to complete
                setCurrentStep(currentStep + 1); // Proceed to the next step after a successful API call
                setLoading(false);
            } catch (error) {
                console.error('Error updating Age:', error);
                Toast.show('There was an error updating your Age. Please try again later.', Toast.SHORT);
                setLoading(false);
            }
        }


        else if (currentStep === 15) {
            if (userhobbies.length < 3) {
                Toast.show('Please select at least 3 hobbies to continue.', Toast.SHORT);
                setLoading(false);
                return;
            }

            if (userhobbies.length > 7) {
                Toast.show('You can select a maximum of 7 hobbies.', Toast.SHORT);
                setLoading(false);
                return;
            }

            try {
                await userHobbies(); // Call the userHeight function and wait for it to complete
                setCurrentStep(currentStep + 1); // Proceed to the next step after a successful API call
                setLoading(false);
            } catch (error) {
                console.error('Error updating Hobbies:', error);
                Toast.show('There was an error updating your Hobbies. Please try again later.', Toast.SHORT);
                setLoading(false);
            }
        }



        else if (currentStep === 16) {
            if (smoke.length <= 0) {
                Toast.show('Select an option to continue.', Toast.SHORT);
                setLoading(false);
                return;
            }

            try {
                await userSmoking(); // Call the userHeight function and wait for it to complete
                setCurrentStep(currentStep + 1); // Proceed to the next step after a successful API call
                setLoading(false);
            } catch (error) {
                console.error('Error updating Option:', error);
                Toast.show('There was an error updating your Option. Please try again later.', Toast.SHORT);
                setLoading(false);
            }
        }

        else if (currentStep === 17) {
            if (drinking.length <= 0) {
                Toast.show('Select an option to continue.', Toast.SHORT);
                setLoading(false);
                return;
            }

            try {
                await userDrinking(); // Call the userHeight function and wait for it to complete
                setCurrentStep(currentStep + 1); // Proceed to the next step after a successful API call
                setLoading(false);
            } catch (error) {
                console.error('Error updating Option:', error);
                Toast.show('There was an error updating your Option. Please try again later.', Toast.SHORT);
                setLoading(false);
            }
        }

        else if (currentStep === 18) {
            if (userinterest.length < 3) {
                Toast.show('Please select at least 3 Interest to continue.', Toast.SHORT);
                setLoading(false);
                return;
            }

            if (userinterest.length > 7) {
                Toast.show('You can select a maximum of 7 Interest.', Toast.SHORT);
                setLoading(false);
                return;
            }

            try {
                await userLuxuryEvent(); // Call the userHeight function and wait for it to complete
                setCurrentStep(currentStep + 1); // Proceed to the next step after a successful API call
                setLoading(false);
            } catch (error) {
                console.error('Error updating Interest:', error);
                Toast.show('There was an error updating your Interest. Please try again later.', Toast.SHORT);
                setLoading(false);
            }
        }

        else if (currentStep === 19) {
            if (aboutpartner.length <= 0) {
                Toast.show('Please tell us what you are looking for in a partner to continue', Toast.SHORT);
                setLoading(false);
                return;
            }
            if (aboutpartner?.length <= 50) {
                Toast.show('Minimum char should be 50', Toast.SHORT);
                setLoading(false);
                return;
            }

            try {
                await userLookingFor(); // Call the userHeight function and wait for it to complete
                setCurrentStep(currentStep + 1); // Proceed to the next step after a successful API call
                setLoading(false);
            } catch (error) {
                console.error('Error updating Partner:', error);
                Toast.show('There was an error updating your Partner. Please try again later.', Toast.SHORT);
                setLoading(false);
            }
        }

        else if (currentStep === 20) {
            if (photos.length <= 0) {
                Toast.show('Select Photos To Continue.', Toast.SHORT);
                setLoading(false);
                return;
            }
            const profilePhotos = photos[0]
            if (profilePhotos === undefined) {
                Toast.show('Please Upload Profile photo.', Toast.SHORT);
                setLoading(false);
                return;
            }
            // const publicPhotos = photos.slice(1, 7).filter(Boolean);
            // if (publicPhotos.length < 3) {
            //     Toast.show('Please select at least 3 public photos.', Toast.SHORT);
            //     return;
            // }
            try {
                const uploadSuccess = await handleSubmit();  // Call handleSubmit to upload photos
                if (uploadSuccess) {
                    setCurrentStep(currentStep + 1);  // Proceed to the next step only if upload succeeded
                } else {
                    setLoading(false);  // Stop loading if upload fails
                }
            } catch (error) {
                console.error('Error updating Photo:', error);
                Toast.show('There was an error updating your Photo. Please try again later.', Toast.SHORT);
                setLoading(false);
            }
        }

        else if (currentStep === 21) {
            if (profileheading.length <= 0) {
                Toast.show('Write Something To Continue', Toast.SHORT);
                setLoading(false);
                return;
            }


            try {
                await userHeading(); // Call the userHeight function and wait for it to complete
                setCurrentStep(currentStep + 1); // Proceed to the next step after a successful API call
                setLoading(false);
            } catch (error) {
                console.error('Error updating Heading:', error);
                Toast.show('There was an error updating your Heading. Please try again later.', Toast.SHORT);
                setLoading(false);
            }
        }

        else if (currentStep === 22) {
            if (aboutyou.length <= 0) {
                Toast.show('Write Something About You', Toast.SHORT);
                setLoading(false);
                return;
            }
            if (aboutyou?.length <= 50) {
                Toast.show('Description should not be less than 50 character', Toast.SHORT);
                setLoading(false);
                return;
            }

            try {
                await userAboutYou(); // Call the userHeight function and wait for it to complete
                setCurrentStep(currentStep + 1); // Proceed to the next step after a successful API call
                setLoading(false);
            } catch (error) {
                console.error('Error updating Heading:', error);
                Toast.show('There was an error updating your AboutYou. Please try again later.', Toast.SHORT);
                setLoading(false);
            }
        }
        else if (currentStep === 23 || currentStep === 24) {
            setLoading(false);  // Stop loading for steps without API calls
            setCurrentStep(currentStep + 1);  // Move to the next step
        }
        else if (currentStep === 25) {
            if (!selfie) {
                Toast.show('Upload Selfie Before Submitting', Toast.SHORT);
                setLoading(false);
                return;
            }
            try {
                await handleSubmitSelfie();
                if (idToken.length > 0) {
                    await handleGoogleSignIn();
                } else {
                    await loginWithDoItLater(logintoken);

                }
            } catch (error) {
                Toast.show('Something went wrong.', Toast.SHORT);
                setLoading(false);

            }
        }

        else {
            if (currentStep < 25) {
                setCurrentStep(currentStep + 1);
            }
        }
    };


    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleInputChange = (text, type) => {
        // Remove extra spaces and double quotes
        const extraSpacesPattern = /\s+/g;
        const doubleQuotesPattern = /"/g;

        if (extraSpacesPattern.test(text)) {
            // Toast.show('Extra Space cannot be use.', Toast.BOTTOM)
        } else if (doubleQuotesPattern.test(text)) {
            Toast.show('DoubleQuotes cannot be use.', Toast.BOTTOM)
        }

        // Remove extra spaces and double quotes
        const noExtraSpaces = text.replace(extraSpacesPattern, ' ');
        const noDoubleQuotes = noExtraSpaces.replace(doubleQuotesPattern, '');

        // Update the state based on the field type
        if (type === 'aboutYou') {
            setAboutYou(noDoubleQuotes);
        } else if (type === 'catchyHeadline') {
            setProfileHeading(noDoubleQuotes);
        } else if (type === 'aboutPartner') {
            setAboutPartner(noDoubleQuotes);
        }
    }




    const getStepNote = () => {
        switch (currentStep) {
            case 4:
                return 'Your username is your unique identity, elegant and exclusive to you.';
            case 5:
                return 'Your exact location is never shared with other users and will remain private.';
            case 6:
                return 'This detail will be visible to your matches and helps in creating better compatibility.';
            case 7:
                return 'This information helps create a more tailored experience for you and your matches';
            case 8:
                return 'This detail is required to personalize your matches.';
            case 9:
                return 'This detail helps us match you with people who share similar values and interests.'
            case 10:
                return 'This is optional, but it helps us create a more tailored experience for you.'
            case 11:
                return 'This information is necessary and will help us tailor your experience to find better matches.'
            case 12:
                return 'This information is optional but helps us personalize your experience.'
            case 13:
                return 'This helps match you with individuals who share similar financial goals.'
            case 14:
                return 'Your age preference ensures personalized matches for meaningful connections.'
            case 15:
                return 'These hobbies help us connect you with like-minded individuals.'
            case 16:
                return 'This information is public and can be viewed on your profile.'
            case 17:
                return 'This information is public and can be viewed on your profile.'
            case 18:
                return 'These tags help us match you with people who share your lifestyle preferences and passions.'
            case 19:
                return 'This detail is optional but will help us refine your matches based on your personal preferences and relationship goals.'
            case 20:
                return 'Make sure to share the photos that represent you authentically and help others get to know you.'
            case 21:
                return 'Tip: Keep it brief, engaging, and authentic to attract the right matches.'
            case 22:
                return 'Tip: Be genuine, and let your personality shine through. Whether it’s your sense of humor, passion for adventure, or dedication to success, this is your moment to stand out.'
            // case 23:
            //     return 'Tip : Keep it brief, engaging and authentic to attract the right matches.'
            // case 24:
            //     return 'Tip : Be genuine, and let your personality shine through. Wheather it is your sense of humor, passion for adventure, or dedication to success, this is your momemnt to stand out.';
            default:
                return '';
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {

            case 4:
                return (
                    <View>
                        <Text style={[styles.txt, { fontFamily: PLAYFAIRFONTS.bold, fontSize: 28 }]}>What Name Do you Want to Use?</Text>
                        <Text style={styles.txt1}>Please note that the username you enter here cannot be changed later</Text>
                        <TextInput
                            placeholder="@username"
                            placeholderTextColor="#3C4043"
                            value={username}
                            onChangeText={setUserName}
                            style={styles.input}
                        />
                        <Text style={styles.txt2}>eg.@johndow25</Text>
                        <Text style={styles.mssg}>{message}</Text>
                    </View>
                )
            case 5:
                return (
                    <View>
                        <Text style={styles.txt}>Where Are You Located?</Text>
                        <Text style={styles.txt1}>Your location helps us find the best matches near you.</Text>
                        <Text style={styles.txt3}>Your Location*</Text>
                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Your Current Location"
                                placeholderTextColor="#999"
                                value={search}
                                onChangeText={setSearch}
                                editable={false}
                            />
                            <TouchableOpacity >
                                <Image source={images.search} style={[styles.searchIcon, { tintColor: 'white' }]} />
                            </TouchableOpacity>
                        </View>

                        {search.length >= 3 && suggestions.length > 0 && (
                            <FlatList
                                data={suggestions}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => handleSelectLocation(item)}>
                                        <View style={styles.suggestionItem}>
                                            <Text style={styles.suggestionText}>{item.formatted_address}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        )}

                        {/* Loading indicator */}
                        {isLoading1 && <Text>Loading...</Text>}

                        {isLoading === false ?
                            <TouchableOpacity onPress={fetchLocationName} style={{ marginTop: 50 }}>
                                <Image source={images.location} style={styles.loc} />
                                <Text style={styles.txt4}>Use my current location</Text>
                            </TouchableOpacity>
                            :
                            null
                        }
                        {isLoading && (
                            <LottieView
                                source={require('../../assets/location.json')} // Path to your Lottie JSON file
                                autoPlay
                                loop
                                style={styles.lottieContainer}
                            />
                        )}

                    </View>
                )
            case 6:
                return (
                    <View>
                        <Text style={styles.txt}>How Tall Are You?</Text>
                        <Text style={styles.txt1}>Let your potential matches know your height.</Text>
                        <View style={styles.toggleContainer}>
                            <TouchableOpacity
                                style={[styles.toggleButton, unit === 'cm' && styles.activeButton]}
                                onPress={() => setUnit('cm')}
                            >
                                <Text style={[styles.toggleText, unit === 'cm' && styles.activeText]}>cm</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.toggleButton, unit === 'feet' && styles.activeButton]}
                                onPress={() => setUnit('feet')}
                            >
                                <Text style={[styles.toggleText, unit === 'feet' && styles.activeText]}>feet</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Height Display */}
                        <Text style={styles.heightText}>
                            {unit === 'cm' ? `${height} cm` : convertToFeetInch(height)}
                        </Text>


                        {/* Slider */}
                        <Slider
                            style={styles.slider}
                            minimumValue={122}
                            maximumValue={236}
                            step={1}
                            value={height}
                            onValueChange={(value) => setHeight(value)}
                            minimumTrackTintColor="#916008"
                            maximumTrackTintColor="#E0E0E0"
                            thumbTintColor="#916008"
                        />


                        {/* Range Numbers */}
                        {unit === 'cm' ?
                            <View style={styles.rangeContainer}>
                                <Text style={styles.rangeText}>122</Text>
                                <Text style={styles.rangeText}>236</Text>
                            </View>
                            :
                            <View style={styles.rangeContainer}>
                                <Text style={styles.rangeText}>4ft</Text>
                                <Text style={styles.rangeText}>7ft 9in</Text>
                            </View>
                        }

                    </View>
                )
            case 7:
                return (
                    <View>
                        <Text style={styles.txt}>What Best Describes Your Body Type?</Text>
                        <Text style={styles.txt1}>Help us understand more about you by selecting {'\n'} the option that best matches your body type.</Text>
                        <Text style={styles.txt3}>Choose Your Body Type</Text>
                        <View style={styles.bodyTypeContainer}>
                            {bodyTypes.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.bodyTypeButton,
                                        selectedBodyType === type && styles.selectedBodyTypeButton,
                                    ]}
                                    onPress={() => handleBodyTypeSelect(type)}
                                >
                                    <Text
                                        style={[
                                            styles.bodyTypeText,
                                            selectedBodyType === type && styles.selectedBodyTypeText,
                                        ]}
                                    >
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>


                    </View>
                )
            case 8:
                return (
                    <SafeAreaView style={{ flex: 1 }}>
                        <KeyboardAvoidingView
                            style={{ flex: 1 }}
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            keyboardVerticalOffset={100}
                        >
                            <ScrollView
                                contentContainerStyle={{
                                    paddingHorizontal: 20,
                                    paddingBottom: 140, // Adjust dynamically for footer space
                                    flexGrow: 1, // Ensures the ScrollView grows with the content
                                }}
                                showsVerticalScrollIndicator={false}
                            >
                                <Text style={styles.txt}>What's Your Ethnicity?</Text>
                                <Text style={styles.txt1}>
                                    Let your matches get to know you better by sharing your ethnicity.
                                </Text>
                                <Text style={styles.txt3}>Choose Your Ethnicity</Text>

                                <View style={styles.bodyTypeContainer}>
                                    {ethnicity.map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[
                                                styles.bodyTypeButton,
                                                selectethnicity === type && styles.selectedBodyTypeButton,
                                            ]}
                                            onPress={() => handleEthnicity(type)}
                                        >
                                            <Text
                                                style={[
                                                    styles.bodyTypeText,
                                                    selectethnicity === type && styles.selectedBodyTypeText,
                                                ]}
                                            >
                                                {type}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    </SafeAreaView>
                );


            case 9:
                return (
                    <SafeAreaView style={{ flex: 1 }}>
                        <KeyboardAvoidingView
                            style={{ flex: 1 }}
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            keyboardVerticalOffset={100}
                        >
                            <ScrollView
                                contentContainerStyle={{
                                    paddingHorizontal: 20,
                                    paddingBottom: 140, // Adjust dynamically for footer space
                                    flexGrow: 1, // Ensures the ScrollView grows with the content
                                }}
                                showsVerticalScrollIndicator={false}
                            >
                                <Text style={styles.txt}>What is Your Highest Level of Education?</Text>
                                <Text style={styles.txt1}>This detail helps us create a bespoke experience.</Text>
                                <Text style={styles.txt3}>Choose Your Level of Education</Text>

                                <View style={styles.bodyTypeContainer}>
                                    {education.map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[
                                                styles.bodyTypeButton,
                                                selecteducation === type && styles.selectedBodyTypeButton,
                                            ]}
                                            onPress={() => handleEducation(type)}
                                        >
                                            <Text
                                                style={[
                                                    styles.bodyTypeText,
                                                    selecteducation === type && styles.selectedBodyTypeText,
                                                ]}
                                            >
                                                {type}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    </SafeAreaView>
                )
            case 10:
                return (
                    <SafeAreaView style={{ flex: 1 }}>
                        <KeyboardAvoidingView
                            style={{ flex: 1 }}
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            keyboardVerticalOffset={100}
                        >
                            <ScrollView
                                contentContainerStyle={{
                                    paddingHorizontal: 20,
                                    paddingBottom: 140, // Adjust dynamically for footer space
                                    flexGrow: 1, // Ensures the ScrollView grows with the content
                                }}
                                showsVerticalScrollIndicator={false}
                            >
                                <Text style={styles.txt}>What Field Do You Work In?</Text>
                                <Text style={styles.txt1}>Let us know your profession to help us match you with like-minded individuals.</Text>
                                <Text style={styles.txt3}>Choose Your Field</Text>

                                <View style={styles.bodyTypeContainer}>
                                    {workField.map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[
                                                styles.bodyTypeButton,
                                                workfield === type && styles.selectedBodyTypeButton,
                                            ]}
                                            onPress={() => handleWorkField(type)}
                                        >
                                            <Text
                                                style={[
                                                    styles.bodyTypeText,
                                                    workfield === type && styles.selectedBodyTypeText,
                                                ]}
                                            >
                                                {type}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    </SafeAreaView>
                )
            case 11:
                return (
                    <View>
                        <Text style={styles.txt}>What is Your Current Relationship Status?</Text>
                        <Text style={styles.txt1}>Please let us know your relationship status to help us match you with compatible individuals.</Text>
                        <Text style={styles.txt3}>Choose Your Relationship Status</Text>
                        <View style={styles.bodyTypeContainer}>
                            {statusR.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.bodyTypeButton,
                                        rstatus === type && styles.selectedBodyTypeButton,
                                    ]}
                                    onPress={() => handleRStatus(type)}
                                >
                                    <Text
                                        style={[
                                            styles.bodyTypeText,
                                            rstatus === type && styles.selectedBodyTypeText,
                                        ]}
                                    >
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )
            case 12:
                return (
                    <View>
                        <Text style={styles.txt}>Do You Have Children?</Text>
                        <Text style={styles.txt1}>Let us know if you have children to help us find matches with similar family values and preferences.</Text>
                        <Text style={styles.txt3}>Select Your Option</Text>
                        <View style={styles.bodyTypeContainer}>
                            {children.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.bodyTypeButton,
                                        child === type && styles.selectedBodyTypeButton,
                                    ]}
                                    onPress={() => handleChildren(type)}
                                >
                                    <Text
                                        style={[
                                            styles.bodyTypeText,
                                            child === type && styles.selectedBodyTypeText,
                                        ]}
                                    >
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )

            case 13:
                return (
                    <SafeAreaView style={{ flex: 1 }}>
                        <KeyboardAvoidingView
                            style={{ flex: 1 }}
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            keyboardVerticalOffset={100}
                        >
                            <ScrollView
                                contentContainerStyle={{
                                    paddingHorizontal: 20,
                                    paddingBottom: 140, // Adjust dynamically for footer space
                                    flexGrow: 1, // Ensures the ScrollView grows with the content
                                }}
                                showsVerticalScrollIndicator={false}
                            >
                                <Text style={styles.txt}>What is Your Net Worth?</Text>
                                <Text style={styles.txt1}>Enter the approximate amount that best reflects your current financial standing.</Text>

                                <View style={styles.bodyTypeContainer}>
                                    {netWorth.map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[
                                                styles.bodyTypeButton,
                                                networth === type && styles.selectedBodyTypeButton,
                                            ]}
                                            onPress={() => handleNetWorth(type)}
                                        >
                                            <Text
                                                style={[
                                                    styles.bodyTypeText,
                                                    networth === type && styles.selectedBodyTypeText,
                                                ]}
                                            >
                                                {type}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                            </ScrollView>
                        </KeyboardAvoidingView>
                    </SafeAreaView>
                )
            case 14:
                return (
                    <View>
                        <Text style={styles.txt}>What Are Your Age Preferences? </Text>
                        <Text style={styles.txt1}>Please share the age range you prefer for your ideal match.</Text>

                        <View style={styles.ageRangeContainer}>
                            <Text style={styles.ageRangeText}>
                                {ageRange[0]} - {ageRange[1] === 70 ? '70+' : ageRange[1]}
                            </Text>
                        </View>
                        <View style={{ marginLeft: 30, marginRight: 30 }}>
                            <MultiSlider
                                values={ageRange}
                                sliderLength={width * 0.7}
                                onValuesChange={handleSliderChange}
                                min={18}
                                max={70}
                                step={1}
                                allowOverlap={false}
                                snapped
                                selectedStyle={{
                                    backgroundColor: '#916008',
                                }}
                                unselectedStyle={{
                                    backgroundColor: '#E0E0E0',
                                }}
                                trackStyle={{
                                    height: 6,
                                }}
                                customMarker={(e) => (
                                    <View style={[
                                        styles.markerStyle,
                                        e.currentValue === ageRange[1] && !isMaxMarkerActive ? styles.disabledMarker : {}
                                    ]} />
                                )}
                            />
                        </View>


                    </View>
                )
            case 15:
                return (
                    <SafeAreaView style={{ flex: 1 }}>
                        <KeyboardAvoidingView
                            style={{ flex: 1 }}
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            keyboardVerticalOffset={100}
                        >
                            <ScrollView
                                contentContainerStyle={{
                                    paddingHorizontal: 20,
                                    paddingBottom: 140, // Adjust dynamically for footer space
                                    flexGrow: 1, // Ensures the ScrollView grows with the content
                                }}
                                showsVerticalScrollIndicator={false}
                            >
                                <Text style={styles.txt}>What Are Your Hobbies?</Text>
                                <Text style={styles.txt1}>Select at least 3 hobbies that reflect your passions and lifestyle. (Maximum 7 hobbies only)</Text>
                                <Text style={styles.txt3}>Choose Your Hobbies</Text>

                                <View style={styles.bodyTypeContainer}>
                                    {hobbies.map((hobby) => (
                                        <TouchableOpacity
                                            key={hobby}
                                            style={[
                                                styles.bodyTypeButton,
                                                userhobbies.includes(hobby) && styles.selectedBodyTypeButton,
                                            ]}
                                            onPress={() => handleHHobbies(hobby)}
                                        >
                                            <Text
                                                style={[
                                                    styles.bodyTypeText,
                                                    userhobbies.includes(hobby) && styles.selectedBodyTypeText,
                                                ]}
                                            >
                                                {hobby}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>


                            </ScrollView>
                        </KeyboardAvoidingView>
                    </SafeAreaView>
                )
            case 16:
                // if (loadingUserData || smoke === '') {
                //     return <ActivityIndicator size="large" color="#000" style={{ marginTop: 50 }} />;
                // }

                return (
                    <View>
                        <Text style={styles.txt}>Do You Smoke?</Text>
                        <Text style={styles.txt1}>
                            Please let us know if you smoke so we can better match you with individuals who share similar lifestyle choices.
                        </Text>
                        <Text style={styles.txt3}>Select Your Choice</Text>
                        <View style={styles.bodyTypeContainer}>
                            {smoking.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.bodyTypeButton,
                                        smoke === type && styles.selectedBodyTypeButton,
                                    ]}
                                    onPress={() => handleSmoking(type)}
                                >
                                    <Text
                                        style={[
                                            styles.bodyTypeText,
                                            smoke === type && styles.selectedBodyTypeText,
                                        ]}
                                    >
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );

            case 17:
                return (
                    <View>
                        <Text style={styles.txt}>Do You Drink?</Text>
                        <Text style={styles.txt1}>Let us know if you drink alcohol so we can better match you with individuals who have similar preferences.</Text>
                        <Text style={styles.txt3}>Choose One</Text>
                        <View style={styles.bodyTypeContainer}>
                            {alcoholic.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.bodyTypeButton,
                                        drinking === type && styles.selectedBodyTypeButton,
                                    ]}
                                    onPress={() => handleAlcohol(type)}
                                >
                                    <Text
                                        style={[
                                            styles.bodyTypeText,
                                            drinking === type && styles.selectedBodyTypeText,
                                        ]}
                                    >
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )
            case 18:
                return (
                    <SafeAreaView style={{ flex: 1 }}>
                        <KeyboardAvoidingView
                            style={{ flex: 1 }}
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            keyboardVerticalOffset={100}
                        >
                            <ScrollView
                                contentContainerStyle={{
                                    paddingHorizontal: 20,
                                    paddingBottom: 140, // Adjust dynamically for footer space
                                    flexGrow: 1, // Ensures the ScrollView grows with the content
                                }}
                                showsVerticalScrollIndicator={false}
                            >
                                <Text style={styles.txt}>Luxury life, Luxe Interests!</Text>
                                <Text style={styles.txt1}>Select at least 3 tags that best describe your passions and interests. Let's match you with someone who shares your luxury lifestyle and refined tastes.(Maximum 7 tags only)</Text>
                                <Text style={styles.txt3}>Choose Your Interests</Text>

                                <View style={styles.bodyTypeContainer}>
                                    {interests.map((interest) => (
                                        <TouchableOpacity
                                            key={interest}
                                            style={[
                                                styles.bodyTypeButton,
                                                userinterest.includes(interest) && styles.selectedBodyTypeButton,
                                            ]}
                                            onPress={() => handleInterests(interest)}
                                        >
                                            <Text
                                                style={[
                                                    styles.bodyTypeText,
                                                    userinterest.includes(interest) && styles.selectedBodyTypeText,
                                                ]}
                                            >
                                                {interest}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                            </ScrollView>
                        </KeyboardAvoidingView>
                    </SafeAreaView>
                )
            case 19:

                return (
                    <SafeAreaView style={{ flex: 1 }}>
                        <KeyboardAvoidingView
                            style={{ flex: 1 }}
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            keyboardVerticalOffset={100}
                        >
                            <ScrollView
                                contentContainerStyle={{
                                    paddingHorizontal: 20,
                                    paddingBottom: 140,
                                    flexGrow: 1,
                                }}
                                showsVerticalScrollIndicator={false}
                            >
                                <Text style={styles.txt}>Describe your perfect match</Text>
                                <Text style={styles.txt1}>Tell us more about the qualities and traits you desire in a partner.
                                </Text>
                                <TextInput
                                    style={styles.textArea}
                                    placeholder="Describe Your Ideal Partner"
                                    placeholderTextColor="#999"
                                    multiline
                                    maxLength={4000}
                                    value={aboutpartner}
                                    onChangeText={(text) => handleInputChange(text, 'aboutPartner')}
                                />
                                <Text style={styles.wordCount}>
                                    {aboutpartner.length} / 4000
                                </Text>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    </SafeAreaView>
                );
            case 20:
                return (
                    <SafeAreaView style={{ flex: 1 }}>
                        <KeyboardAvoidingView
                            style={{ flex: 1 }}
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            keyboardVerticalOffset={100}
                        >
                            <ScrollView
                                contentContainerStyle={{
                                    paddingHorizontal: 20,
                                    paddingBottom: 140,
                                    flexGrow: 1,
                                }}
                                showsVerticalScrollIndicator={false}
                            >
                                {renderLottieModal()}
                                <Text style={styles.txt}>Show Us Your Best Side!</Text>
                                <Text style={styles.txt1}>Please upload at least one clear profile picture to continue. Let matches see the real you!</Text>
                                {/* <Text style={[styles.txt3, { bottom: 20 }]}>Minimum Selection: 3 Photos</Text> */}
                                <Text style={[styles.txt3, { bottom: 40 }]}>Upload Profile Photo</Text>

                                <View style={styles.uploadBox}>
                                    <TouchableOpacity style={[styles.photoBox, { height: 257, width: 190 }]} onPress={() => handlePhotoSelection(0)}>
                                        {photos[0] ? (
                                            <Image source={{ uri: photos[0] }} style={styles.photo} resizeMode='cover' />
                                        ) : (
                                            <Image source={images.add} style={[styles.addIcon, { height: 40, width: 40 }]} />
                                        )}
                                    </TouchableOpacity>
                                </View>

                                {/* Upload Public Photo */}
                                <Text style={styles.sectionTitle}>Public Photo</Text>
                                <View style={styles.photoGrid}>
                                    {[...Array(6)].map((_, index) => (
                                        <TouchableOpacity key={index} style={styles.photoBox} onPress={() => handlePhotoSelection(index + 1)}>
                                            {photos[index + 1] ? (
                                                <Image source={{ uri: photos[index + 1] }} style={styles.photo} />
                                            ) : (
                                                <Image source={images.add} style={styles.addIcon} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Private Public Photo */}
                                <Text style={styles.sectionTitle}>
                                    Private Photo <Text style={styles.optional}></Text>
                                </Text>
                                <View style={styles.photoGrid}>
                                    {[...Array(6)].map((_, index) => (
                                        <TouchableOpacity key={index} style={styles.photoBox} onPress={() => handlePhotoSelection(index + 7)}>
                                            {photos[index + 7] ? (
                                                <Image source={{ uri: photos[index + 7] }} style={styles.photo} />
                                            ) : (
                                                <Image source={images.lock} style={styles.lockIcon} />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>

                            </ScrollView>
                            <RBSheet
                                ref={rbSheetRef}
                                height={200}
                                closeOnPressMask={true}
                                customStyles={{
                                    container: {
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    },
                                }}
                            >
                                <View style={{ padding: 20, width: '100%' }}>
                                    {/* Title text at the top */}
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 50, textAlign: 'center', textDecorationLine: 'underline' }}>

                                    </Text>

                                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', bottom: 20 }}>

                                        {/* Camera Option */}
                                        <TouchableOpacity
                                            style={{ alignItems: 'center', flex: 1 }}
                                            onPress={() => handleImagePick('camera')}
                                        >
                                            <Image source={images.camera} style={{ height: 40, width: 40, marginBottom: 8 }} />
                                            <Text>Camera</Text>
                                        </TouchableOpacity>

                                        {/* Gallery Option */}
                                        <TouchableOpacity
                                            style={{ alignItems: 'center', flex: 1 }}
                                            onPress={() => handleImagePick('gallery')}
                                        >
                                            <Image source={images.gallery} style={{ height: 40, width: 40, marginBottom: 8 }} />
                                            <Text>Choose from Gallery</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </RBSheet>


                        </KeyboardAvoidingView>
                    </SafeAreaView>
                )
            case 21:

                return (
                    <SafeAreaView style={{ flex: 1 }}>
                        <KeyboardAvoidingView
                            style={{ flex: 1 }}
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            keyboardVerticalOffset={100}
                        >
                            <ScrollView
                                contentContainerStyle={{
                                    paddingHorizontal: 20,
                                    paddingBottom: 140,
                                    flexGrow: 1,
                                }}
                                showsVerticalScrollIndicator={false}
                            >
                                <Text style={styles.txt}>Create a Catchy Heading for Your Profile</Text>
                                <Text style={styles.txt1}>First impressions matter! Make your headline count with a unique detail.</Text>
                                <TextInput
                                    style={[styles.textArea, { width: '100%', height: 100, fontSize: 13 }]}
                                    placeholder="Example Ideas: Adventure seeker looking for my next journey."
                                    placeholderTextColor="#999"
                                    multiline
                                    maxLength={150}
                                    value={profileheading}
                                    onChangeText={(text) => handleInputChange(text, 'catchyHeadline')}
                                />
                                <Text style={styles.wordCount}>
                                    {profileheading.length} / 150
                                </Text>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    </SafeAreaView>
                )
            case 22:
                return (
                    <SafeAreaView style={{ flex: 1 }}>
                        <KeyboardAvoidingView
                            style={{ flex: 1 }}
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            keyboardVerticalOffset={100}
                        >
                            <ScrollView
                                contentContainerStyle={{
                                    paddingHorizontal: 20,
                                    paddingBottom: 140, // Adjust dynamically for footer space
                                    flexGrow: 1, // Ensures the ScrollView grows with the content
                                }}
                                showsVerticalScrollIndicator={false}
                            >
                                <Text style={styles.txt}>Describe Yourself in a Few Words</Text>
                                <Text style={styles.txt1}>This is your chance to let others know what makes you unique. Share a brief description of your personality, interests, and what you're looking for in a partner. </Text>
                                <TextInput
                                    style={styles.textArea}
                                    placeholder="Create Your Personal Intro."
                                    placeholderTextColor="#999"
                                    multiline
                                    maxLength={4000}
                                    value={aboutyou}
                                    onChangeText={(text) => handleInputChange(text, 'aboutYou')}
                                />
                                <Text style={styles.wordCount}>
                                    {aboutyou?.length} / 4000
                                </Text>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    </SafeAreaView>
                )
            case 23:
                return (

                    <SafeAreaView style={{ flex: 1 }}>
                        <KeyboardAvoidingView
                            style={{ flex: 1 }}
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            keyboardVerticalOffset={100}
                        >
                            <ScrollView
                                contentContainerStyle={{
                                    // paddingHorizontal: 20,
                                    paddingBottom: 140, // Adjust dynamically for footer space
                                    flexGrow: 1, // Ensures the ScrollView grows with the content
                                }}
                                showsVerticalScrollIndicator={false}
                            >
                                <Text style={styles.txt}>Verify Your Profile with a Selfie</Text>
                                <Text style={styles.txt1}>To maintain a safe and genuine community, we require a quick selfie verification. This ensures that all profile on our platform are real and trustworthy.</Text>
                                <Image source={images.selfie} style={styles.img} />
                                <View style={styles.cont}>
                                    <Image source={images.eyebrow} style={styles.img1} />
                                    <View style={{ marginLeft: 20 }}>
                                        <Text style={styles.txt5}>100% Private</Text>
                                        <Text style={styles.txt6}>Your selfie is strictly for {'\n'}verification-it will never be {'\n'}visible to others.</Text>
                                    </View>
                                </View>

                                <View style={styles.cont}>
                                    <Image source={images.authencity} style={styles.img1} />
                                    <View style={{ marginLeft: 20 }}>
                                        <Text style={styles.txt5}>Show Authencity</Text>
                                        <Text style={styles.txt6}>Demonstrate you're the real person {'\n'}behind your profile pictures.</Text>
                                    </View>
                                </View>

                                <View style={styles.cont}>
                                    <Image source={images.safety} style={styles.img1} />
                                    <View style={{ marginLeft: 20 }}>
                                        <Text style={styles.txt5}>Elevate Safety</Text>
                                        <Text style={styles.txt6}>Contribute to a trusted environment {'\n'}for genuine and secure connections.</Text>
                                    </View>
                                </View>

                            </ScrollView>
                        </KeyboardAvoidingView>
                    </SafeAreaView>
                )
            case 24:
                return (
                    <SafeAreaView style={{ flex: 1 }}>
                        <KeyboardAvoidingView
                            style={{ flex: 1 }}
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            keyboardVerticalOffset={100}
                        >
                            <ScrollView
                                contentContainerStyle={{
                                    // paddingHorizontal: 20,
                                    paddingBottom: 200, // Adjust dynamically for footer space
                                    flexGrow: 1, // Ensures the ScrollView grows with the content
                                }}
                                showsVerticalScrollIndicator={false}
                            >
                                <Text style={styles.txt}>How It Works</Text>
                                <Text style={styles.txt1}>To maintain a safe and genuine community, we require a quick selfie verification. This ensures that all profile on our platform are real and trustworthy.</Text>

                                <Image source={images.selfie1} style={styles.img} />

                                <View style={styles.cont1}>
                                    <Image source={images.point} style={styles.img2} />
                                    <Text style={styles.txt7}>Instructions</Text>
                                </View>

                                <View style={styles.cont2}>
                                    <View style={styles.cont3}>
                                        <Text style={{ textAlign: 'center' }}>1</Text>
                                    </View>
                                    <View style={{ marginLeft: 20 }}>
                                        <Text style={styles.txt8}>Ensure Proper Lighting</Text>
                                        <Text style={styles.txt9}>Use natural light for a clear photo.</Text>
                                    </View>
                                </View>
                                <View style={styles.cont2}>
                                    <View style={styles.cont3}>
                                        <Text style={{ textAlign: 'center' }}>2</Text>
                                    </View>
                                    <View style={{ marginLeft: 20 }}>
                                        <Text style={styles.txt8}>Face Camera Directly</Text>
                                        <Text style={styles.txt9}>Look straight and keep your face centered.</Text>
                                    </View>
                                </View>
                                <View style={styles.cont2}>
                                    <View style={styles.cont3}>
                                        <Text style={{ textAlign: 'center' }}>3</Text>
                                    </View>
                                    <View style={{ marginLeft: 20 }}>
                                        <Text style={styles.txt8}>Avoid Blurry Images</Text>
                                        <Text style={styles.txt9}>Hold steady and ensure the image is sharp.</Text>
                                    </View>
                                </View>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    </SafeAreaView>
                )
            case 25:
                return (
                    <View>

                        {selfie ?
                            <Text style={styles.txt}>Verify Your Selfie Photo</Text>
                            :
                            <Text style={styles.txt}>Take Selfie Photo</Text>
                        }
                        {selfie ?
                            <Text style={styles.txt1}>We need to confirm it's really you! Follow these {'\n'} quick steps to complete the selfie verification.</Text>
                            :
                            <Text style={styles.txt1}>Open your camera for real-time verification.</Text>
                        }
                        {selfie ?
                            <Text style={styles.txt3}>Selfie Verification</Text>
                            :
                            null
                        }
                        <TouchableOpacity onPress={handleTakeSelfie}>
                            {selfie ? (
                                <Image source={{ uri: selfie }} style={{ alignSelf: 'center', marginTop: 20, height: 264, width: 198, borderRadius: 5 }} />
                            ) : (
                                <Image source={images.selfie3} style={{ alignSelf: 'center', marginTop: 20, height: 260, width: 200 }} />
                            )}
                        </TouchableOpacity>

                        {selfie ?
                            <TouchableOpacity onPress={handleTakeSelfie}>
                                <View style={styles.cont4}>
                                    <Text style={styles.txt10}>Re-take</Text>
                                </View>
                            </TouchableOpacity>
                            :
                            null
                        }
                        {!selfie ? (
                            <TouchableOpacity onPress={() => handleDoitLater()}>
                                <View style={styles.cont4}>
                                    {loading ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : (
                                        <Text style={styles.txt10}>Do it later</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ) : null}

                        {load && (
                            <View style={styles.overlay}>
                                <ActivityIndicator size="large" color="#ffffff" />
                            </View>
                        )}

                    </View>
                );

            default:
                return <Text style={styles.stepText}>This is Step {currentStep}</Text>;
        }
    };


    ///// HANDLING API INTEGRATIONS //////

    const userUserName = async () => {
        const token = await AsyncStorage.getItem('verifcationToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 4,
            accountUpdatePayload: {
                userName: username
            }
        }
        //('body response of the height', body);
        try {
            const resp = await axios.put(`auth/update-account/${userId}`, body, { headers })
            //('response from the user Username api', resp.data.message);
        } catch (error) {
            //('error from user Username', error.response.data.message);
        }
    }

    const userHeight = async () => {
        const token = await AsyncStorage.getItem('verifcationToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 6,
            accountUpdatePayload: {
                tall: {
                    value: height,
                    unit: unit
                }
            }
        }
        //('body response of the height', body);
        try {
            const resp = await axios.put(`auth/update-account/${userId}`, body, { headers })
            //('response from the user height api', resp.data.message);
        } catch (error) {
            //('error from user height', error);
        }
    }

    const userBodyType = async () => {
        const token = await AsyncStorage.getItem('verifcationToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 7,
            accountUpdatePayload: {
                bodyType: selectedBodyType
            }
        }
        //('body response of the bodytype', body);
        try {
            const resp = await axios.put(`auth/update-account/${userId}`, body, { headers })
            //('response from the user bodytype api', resp.data.message);
        } catch (error) {
            //('error from user bodytype', error);
        }
    }

    const userEthnicity = async () => {
        const token = await AsyncStorage.getItem('verifcationToken');

        const headers = {
            Authorization: token,
        };
        let body = {
            step: 8,
            accountUpdatePayload: {
                ethnicity: selectethnicity
            }
        }
        //('body response of the ethnicity', body);
        try {
            const resp = await axios.put(`auth/update-account/${userId}`, body, { headers })
            //('response from the user ethnicity api', resp.data.message);
        } catch (error) {
            //('error from user ethnicity', error);
        }
    }

    const userEducation = async () => {
        const token = await AsyncStorage.getItem('verifcationToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 9,
            accountUpdatePayload: {
                highestEducation: selecteducation
            }
        }
        //('body response of the highestEducation', body);
        try {
            const resp = await axios.put(`auth/update-account/${userId}`, body, { headers })
            //('response from the user highestEducation api', resp.data.message);
        } catch (error) {
            //('error from user highestEducation', error);
        }
    }

    const userWorkField = async () => {
        const token = await AsyncStorage.getItem('verifcationToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 10,
            accountUpdatePayload: {
                workField: workfield
            }
        }
        //('body response of the workField', body);
        try {
            const resp = await axios.put(`auth/update-account/${userId}`, body, { headers })
            //('response from the user workField api', resp.data.message);
        } catch (error) {
            //('error from user workField', error);
        }
    }

    const userRelationStatus = async () => {
        const token = await AsyncStorage.getItem('verifcationToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 11,
            accountUpdatePayload: {
                currentRelationshipStatus: rstatus
            }
        }
        //('body response of the relation', body);
        try {
            const resp = await axios.put(`auth/update-account/${userId}`, body, { headers })
            //('response from the user relation api', resp.data.message);
        } catch (error) {
            //('error from user relation', error);
        }
    }

    const userChildren = async () => {
        const token = await AsyncStorage.getItem('verifcationToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 12,
            accountUpdatePayload: {
                children: child
            }
        }
        //('body response of the children', body);
        try {
            const resp = await axios.put(`auth/update-account/${userId}`, body, { headers })
            //('response from the user children api', resp.data.message);
        } catch (error) {
            //('error from user children', error);
        }
    }

    const userNetWorthRange = async () => {
        const token = await AsyncStorage.getItem('verifcationToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 13,
            accountUpdatePayload: {
                netWorthRange: networth
            }
        }
        //('body response of the networth', body);
        try {
            const resp = await axios.put(`auth/update-account/${userId}`, body, { headers })
            //('response from the user networth api', resp.data.message);
        } catch (error) {
            //('error from user networth', error);
        }
    }

    const userAgeRange = async () => {
        const token = await AsyncStorage.getItem('verifcationToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 14,
            accountUpdatePayload: {
                preferences: {
                    ageRange: {
                        min: ageRange[0],
                        max: ageRange[1]
                    }
                }
            }
        }
        //('body response of the ageRange', body);
        try {
            const resp = await axios.put(`auth/update-account/${userId}`, body, { headers })
            //('response from the user ageRange api', resp.data.message);
        } catch (error) {
            //('error from user ageRange', error);
        }
    }

    const userHobbies = async () => {
        const token = await AsyncStorage.getItem('verifcationToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 15,
            accountUpdatePayload: {
                hobbies: userhobbies
            }
        }
        //('body response of the hobbies', body);
        try {
            const resp = await axios.put(`auth/update-account/${userId}`, body, { headers })
            console.log('response from the user hobbies api', resp.data.message);
        } catch (error) {
            console.log('error from user hobbies', error);
        }
    }

    const userSmoking = async () => {
        const token = await AsyncStorage.getItem('verifcationToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 16,
            accountUpdatePayload: {
                smoke: smoke
            }
        }
        //('body response of the smoke', body);
        try {
            const resp = await axios.put(`auth/update-account/${userId}`, body, { headers })
            //('response from the user smoke api', resp.data.message);
        } catch (error) {
            //('error from user smoke', error);
        }
    }

    const userDrinking = async () => {
        const token = await AsyncStorage.getItem('verifcationToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 17,
            accountUpdatePayload: {
                drink: drinking
            }
        }
        //('body response of the drinking', body);
        try {
            const resp = await axios.put(`auth/update-account/${userId}`, body, { headers })
            //('response from the user drinking api', resp.data.message);
        } catch (error) {
            //('error from user drinking', error);
        }
    }

    const userLuxuryEvent = async () => {
        const token = await AsyncStorage.getItem('verifcationToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 18,
            accountUpdatePayload: {
                luxuryInterests: userinterest
            }
        }
        //('body response of the interest', body);
        try {
            const resp = await axios.put(`auth/update-account/${userId}`, body, { headers })
            //('response from the user interest api', resp.data.message);
        } catch (error) {
            //('error from user interest', error);
        }
    }

    const userLookingFor = async () => {
        const token = await AsyncStorage.getItem('verifcationToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 19,
            accountUpdatePayload: {
                preferences: {
                    aboutPartnerDescription: aboutpartner
                }
            }
        }
        //('body response of the aboutpartner', body);
        try {
            const resp = await axios.put(`auth/update-account/${userId}`, body, { headers })
            //('response from the user aboutpartner api', resp.data.message);
        } catch (error) {
            //('error from user aboutpartner', error);
        }
    }

    const userHeading = async () => {
        const token = await AsyncStorage.getItem('verifcationToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 21,
            accountUpdatePayload: {
                myHeading: profileheading
            }
        }
        //('body response of the profileheading', body);
        try {
            const resp = await axios.put(`auth/update-account/${userId}`, body, { headers })
            //('response from the user profileheading api', resp.data.message);
        } catch (error) {
            //('error from user profileheading', error);
        }
    }

    const userAboutYou = async () => {
        const token = await AsyncStorage.getItem('verifcationToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 22,
            accountUpdatePayload: {
                aboutUsDescription: aboutyou
            }
        }
        //('body response of the aboutyou', body);
        try {
            const resp = await axios.put(`auth/update-account/${userId}`, body, { headers })
            //('response from the user aboutyou api', resp.data.message);
        } catch (error) {
            //('error from user aboutyou', error);
        }
    }

    const handleSkip = () => {
        if (currentStep < 25) {
            setCurrentStep(currentStep + 1);
        }
    };


    return (
        <View style={styles.container}>
            <View style={styles.header}>

                <TouchableOpacity style={{ flexDirection: 'row' }} >
                    <Image source={images.back} style={[styles.backIcon, { tintColor: 'white' }]} />
                    <Text style={styles.headerText}>Profile</Text>
                </TouchableOpacity>

                {/* Conditionally render the "Skip" button */}
                {[9, 10, 12, 13, 14, 15, 19, 21, 22, 23, 24].includes(currentStep) && (
                    (!workfieldskip && currentStep === 10 || !childskip && currentStep === 12 || !networthskip && currentStep === 13 || !aboutpartner?.length > 0 && currentStep === 19 || !educationskip && currentStep === 9 || !ageskip && currentStep === 14 || !hobbieskip && currentStep === 15 || !profileheading?.length > 0 && currentStep === 21 || !aboutyou.length > 0 && currentStep === 22)
                        ? (
                            <TouchableOpacity onPress={handleSkip}>
                                <Text style={styles.skipText}>Skip</Text>
                            </TouchableOpacity>
                        ) : null
                )}
            </View>

            {/* Progress Line */}
            <View style={styles.lineContainer}>
                <View
                    style={[
                        styles.line,
                        { width: `${(currentStep / 25) * 100}%` },
                    ]}
                />
            </View>

            {/* Step Content */}
            <View style={styles.stepContent}>{renderStepContent()}</View>

            {/* Footer */}
            <SafeAreaView style={styles.footerContainer}>
                <Text style={styles.note}>{getStepNote()}</Text>

                <View style={styles.footerButtonsContainer}>
                    {/* Back Button */}
                    {currentStep > 4 && (
                        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                            <Text style={styles.buttonText}>Back</Text>
                        </TouchableOpacity>
                    )}

                    {/* Continue Button */}
                    {/* Continue Button */}
                    <TouchableOpacity
                        style={[
                            currentStep === 4 ? styles.fullWidthButton : styles.continueButton,
                        ]}
                        onPress={handleContinue}
                    >
                        {loading ? (  // Show loader if loading is true
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text style={styles.buttonText}>
                                {currentStep === 25 ? 'Submit' : 'Continue'}
                            </Text>
                        )}
                    </TouchableOpacity>

                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'flex-start',
    },
    header: {
        flexDirection: 'row',
        marginTop: height * 0.03,
        marginLeft: width * 0.05,
        alignItems: 'center',
        justifyContent: 'space-between', // Ensures the "Skip" button is on the right
    },
    backIcon: {
        height: width * 0.06,
        width: width * 0.06,
        top: 12,
    },
    headerText: {
        fontFamily: 'Poppins-Bold',
        fontSize: width * 0.06,
        marginLeft: width * 0.04,
        top: 5,
    },
    skipText: {
        fontFamily: 'Poppins-Regular',
        fontSize: width * 0.05,
        color: '#916008',
        marginRight: width * 0.05, // Ensures it stays at the right side
        textDecorationLine: 'underline',
    },
    lineContainer: {
        width: '90%',
        height: 5,
        backgroundColor: '#E0E0E0',
        alignSelf: 'center',
        borderRadius: 5,
        overflow: 'hidden',
        marginTop: 20,
    },
    line: {
        height: '100%',
        backgroundColor: '#916008',
        borderRadius: 5,
    },
    stepContent: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingHorizontal: 20,
        marginTop: 20,
    },
    stepText: {
        fontSize: 16,
        color: '#333',
    },
    footer: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: height * 0.05,
    },

    backButton: {
        width: '45%',
        height: 50,
        backgroundColor: '#B0BEC5',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
    },
    continueButton: {
        width: '45%',
        height: 50,
        backgroundColor: '#916008',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
    },
    fullWidthButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#916008',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    txt: {
        color: 'black',
        fontFamily: 'Poppins-Medium',
        fontSize: 20,
        textAlign: 'center',
        marginTop: 20,
    },
    txt1: {
        color: '#3C4043',
        fontFamily: POPPINSRFONTS.regular,
        fontSize: 13,
        textAlign: 'center',
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        height: 52,
        width: '100%',
        alignSelf: 'center',
        paddingLeft: 20,
        color: 'black',
        borderRadius: 10,
        backgroundColor: 'white',
        borderColor: '#E8E6EA',
        marginTop: 40,
    },
    note: {
        fontSize: 10,
        color: '#7A7A7A',
        fontFamily: 'Poppins-Italic',
        textAlign: 'center',
        marginBottom: 10, // Adjust spacing above the buttons
    },
    txt2: {
        marginLeft: 30,
        color: '#7B7B7B',
        fontSize: 10,
        fontFamily: 'Poppins-Regular',
        marginTop: 3
    },
    txt3: {
        color: 'black',
        textAlign: 'center',
        fontFamily: 'Poppins-SemiBold',
        fontSize: 14,
        marginTop: 40
    },
    searchContainer: {
        width: '100%',
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        alignSelf: 'center',
        marginTop: 20,
        backgroundColor: '#fff',
    },
    searchInput: {
        flex: 1,
        paddingLeft: 15,
        fontSize: 16,
        color: '#000',
    },
    searchIcon: {
        height: 25,
        width: 25,
        marginRight: 15,
    },
    loc: {
        height: 25,
        width: 25,
        alignSelf: 'center',
        tintColor: '#BF8500',
        marginTop: 40
    },
    txt4: {
        color: 'black',
        textAlign: 'center',
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        marginTop: 10
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    toggleButton: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        marginHorizontal: 5,
    },
    activeButton: {
        backgroundColor: '#916008',
        borderColor: '#916008',
    },
    toggleText: {
        fontSize: 14,
        fontFamily: 'Poppins-Medium',
        color: '#3C4043',
    },
    activeText: {
        color: '#FFF',
    },
    heightText: {
        fontSize: 40,
        fontFamily: 'Poppins-Bold',
        textAlign: 'center',
        color: '#916008',
        marginTop: 30,
    },
    slider: {
        width: '100%',
        height: 40,
        marginTop: 20,
    },
    rangeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 10,
    },
    rangeText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#999',
    },
    bodyTypeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 20,
    },
    bodyTypeButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        margin: 5,
        backgroundColor: '#FFF',
    },
    selectedBodyTypeButton: {
        backgroundColor: '#916008',
        borderColor: '#916008',
    },
    bodyTypeText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#3C4043',
    },
    selectedBodyTypeText: {
        color: '#FFF',
        fontFamily: 'Poppins-Bold',
    },
    ageRangeContainer: {
        alignItems: 'center',
        marginVertical: 30,
    },
    ageRangeText: {
        fontSize: 24,
        fontFamily: 'Poppins-Bold',
        color: '#916008',
    },
    markerStyle: {
        height: 24,
        width: 24,
        borderRadius: 12,
        backgroundColor: '#916008',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    disabledMarker: {
        backgroundColor: '#B0BEC5', // Grey color when disabled
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#000',
        height: height * 0.3, // Responsive height
        textAlignVertical: 'top', // Ensures text starts at the top-left
        backgroundColor: '#FFF',
        width: '90%',
        alignSelf: 'center',
        marginTop: 20,
    },
    wordCount: {
        textAlign: 'right',
        fontSize: 12,
        fontFamily: 'Poppins-Italic',
        color: '#7A7A7A',
        marginTop: 5,
        marginRight: '5%',
    },
    sectionTitle: {
        fontFamily: 'Poppins-Medium',
        fontSize: 16,
        color: '#3C4043',
        marginTop: 20,
        marginLeft: 20,
    },
    optional: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        color: '#999',
    },
    uploadBox: {
        alignItems: 'center',
        marginVertical: 10,
    },
    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
        marginTop: 10,
    },
    photoBox: {
        width: 104,
        height: 150,
        borderWidth: 3,
        borderColor: '#ddd',
        borderRadius: 8,
        margin: 5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderStyle: 'dotted'
    },
    addIcon: {
        width: 24,
        height: 24,
        tintColor: '#D9D9D9',
    },
    lockIcon: {
        width: 24,
        height: 24,
        tintColor: '#B0BEC5',
    },
    photo: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    txt5: {
        fontFamily: 'Poppins-Medium',
        fontSize: 16,
        color: 'black'

    },
    txt6: {
        fontFamily: 'Poppins-Regular',
        fontSize: 12,
        color: 'black'
    },
    img: {
        alignSelf: 'center',
        marginTop: 20
    },
    cont: {
        flexDirection: 'row',
        padding: 20,
        marginLeft: 20
    },
    img1: {
        height: 30,
        width: 30,
        tintColor: '#5F3D23',
        marginTop: 10
    },
    cont1: {
        flexDirection: 'row',
        marginLeft: 16,
        marginTop: 20
    },
    img2: {
        height: 30,
        width: 30,
        tintColor: '#5F3D23'
    },
    txt7: {
        fontFamily: 'Poppins-Medium',
        fontSize: 16,
        color: '#5F3D23',
        marginLeft: 16,
        marginTop: 3
    },
    cont2: {
        flexDirection: 'row',
        marginLeft: 16,
        marginTop: 20
    },
    cont3: {
        borderWidth: 1,
        justifyContent: 'center',
        backgroundColor: '#f0ebe2',
        height: 31,
        width: 31,
        borderRadius: 100,
        borderColor: '#f0ebe2'
    },
    txt8: {
        fontFamily: 'Poppins-Bold',
        fontSize: 12,
        color: '#3C4043'
    },
    txt9: {
        fontFamily: 'Poppins-Medium',
        fontSize: 12,
        color: '#3C4043'
    },
    cont4: {
        borderWidth: 1,
        borderRadius: 100,
        width: '100%',
        height: 47,
        justifyContent: 'center',
        borderColor: '#E0E2E9',
        backgroundColor: 'white',
        marginTop: 100
    },
    txt10: {
        textAlign: 'center',
        color: '#5F3D23',
        fontSize: 15,
        fontFamily: 'Poppins-SemiBold'
    },
    mssg: {
        marginLeft: 16,
        marginRight: 16,
        textAlign: 'center',
        color: 'red',
        marginTop: 10

    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalItem: { backgroundColor: '#fff', padding: 15, borderBottomWidth: 1, borderColor: '#ccc' },
    modalText: { fontSize: 16 },
    modalCloseButton: { padding: 15, backgroundColor: '#007BFF', alignItems: 'center' },
    modalCloseText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    modalContainer1: {
        // height: '100%',
        // width: '100%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    lottie: {
        width: 150,
        height: 150,
    },
    modalText1: {
        marginTop: 10,
        fontSize: 16,
        color: '#fff',
    },
    lottieContainer: {
        width: 100, // Adjust the size
        height: 100,
        alignSelf: 'center',
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    suggestionText: {
        fontSize: 16,
    },
    txt: {
        fontSize: 28,
        fontFamily: PLAYFAIRFONTS.bold,
        textAlign: 'center',
    },
    footerContainer: {
        position: 'absolute',
        bottom: 0, // Stick to the bottom
        width: '100%', // Full width of the screen
        backgroundColor: 'white', // Optional background for contrast
        paddingHorizontal: 20, // Padding for content
        paddingBottom: 10, // Space for safe area
        paddingTop: 10, // Space between note and buttons
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0', // Light border for separation
    },
    footerButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    backButton: {
        width: '45%',
        height: 50,
        backgroundColor: '#B0BEC5',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
    },
    continueButton: {
        width: '45%',
        height: 50,
        backgroundColor: '#916008',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
    },
    fullWidthButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#916008',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
    },
    note: {
        fontSize: 12,
        color: '#7A7A7A',
        fontFamily: 'Poppins-Italic',
        textAlign: 'center',
        marginBottom: 10, // Space above the buttons
    },

});

export default ProfileSignUp;
