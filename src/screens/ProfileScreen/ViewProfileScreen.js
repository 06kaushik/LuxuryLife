import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity, ImageBackground, TextInput, FlatList, ScrollView, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { launchImageLibrary } from 'react-native-image-picker';
import DraggableFlatList from 'react-native-draggable-flatlist';
import images from "../../components/images";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import Slider from '@react-native-community/slider';
import Toast from 'react-native-simple-toast';



const { width, height } = Dimensions.get('window');

const ViewProfile = ({ navigation }) => {
    const profileCompletion = 0.49;
    const [selectedButton, setSelectedButton] = useState('Public Photo');
    const [photos, setPhotos] = useState({
        public: Array(6).fill(null),
        private: Array(6).fill(null)  // Initialize with 6 empty slots for private photos
    });
    const [userdetails, setUserDetails] = useState(null)

    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState('');
    const [iseditabout, setEditAbout] = useState(false)
    const [about, setAbout] = useState('')
    const [isdown, setIsDown] = useState(false)
    const [isdown1, setIsDown1] = useState(false)
    const [isHobbies, setIsHobbies] = useState(false)
    const [userhobbies, setUserHobbies] = useState([])
    const [ageRange, setAgeRange] = useState([]);
    const [isagerange, setIsRangeRange] = useState(false)
    const [selectethnicity, setEthnicity] = useState('');
    const [isethnicity, setIsEthnicity] = useState(false)
    const [unit, setUnit] = useState('');
    const [height, setHeight] = useState(0);
    const [isheight, setIsHeight] = useState(false)
    const [selectedBodyType, setSelectedBodyType] = useState('');
    const [isbodytype, setIsBodyType] = useState(false)
    const [child, setChild] = useState('')
    const [ischild, setIsChild] = useState(false)
    const [smoke, setSmoke] = useState('')
    const [issmoke, setIsSmoke] = useState(false)
    const [drinking, setDrinking] = useState('')
    const [isdrinking, setIsDrinking] = useState(false)
    const [selecteducation, setEducation] = useState('')
    const [iseducation, setIsEducation] = useState(false)
    const [workfield, setField] = useState('')
    const [isworkfield, setIsWorkField] = useState(false)
    const [networth, setNetWorth] = useState('')
    const [isnetworth, setIsNetworth] = useState(false)
    const [isUploading, setIsUploading] = useState(Array(6).fill(false));
    const [isDeleting, setIsDeleting] = useState(Array(6).fill(false)); // Track deletion state for each photo

    const hobbies = ['Reading', 'Traveling', 'Cooking/Baking', 'Hiking/Outdoor Adventures', 'Photography', 'Painting/Drawing', 'Playing Sports', 'Writing', 'Yoga/Meditation', 'Gardening', 'Watching Movies/TV Shows', 'Dancing', 'Volunteering/Community Service', 'Collecting(eg.,stamps,coins']
    const ethnicity = ['Asian', 'Black/African descent', 'Hispanic/Latino', 'Middle Eastern', 'Native American/Indigenous', 'Pacific Islander', 'White/Caucasian', 'Mixed/Multiracial', 'Other', 'Prefer not to say']
    const bodyTypes = ['Slim', 'Athletic', 'Average', 'Curvy', 'Plus-Size', 'Petite', 'Muscular', 'Broad', 'Lean', 'Prefer not to say']
    const children = ['Yes,I have children', 'No,I do not have children', 'Prefer not to say']
    const smoking = ['Yes', 'No', 'Prefer not to say']
    const alcoholic = ['Yes', 'No', 'Prefer not to say']
    const education = ['High School or Equivalent', 'Some college', 'Associates Degree', 'Bachelors Degree', 'Master Degree', 'Doctorate or PhD', 'Other', 'Prefer not to say']
    const workField = ['Finance/Investments', 'Technology/Software', 'Art/Entertainment', 'Healthcare/Medical', 'Law/Legal', 'Education/Training', 'Marketing/Sales', 'Hospitality/Real Estate', 'Entrepreneur/Startup', 'Other', 'Prefer not to say']
    const netWorth = ['Below $200,000', '$200,000-$300,000', '$300,000-$400,000', '$400,000-$500,000', '$500,000-$600,000', '$600,000-$700,000', '$700,000-$800,000', '$800,000-$900,000', '$900,000-$1 million', 'More Than $1 Million', 'More Than $5 Million']


    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const data = await AsyncStorage.getItem('UserData');
                if (data !== null) {
                    const parsedData = JSON.parse(data);
                    setUserDetails(parsedData);
                    setPhotos({
                        public: [...parsedData.publicPhotos, ...Array(6 - parsedData.publicPhotos.length).fill(null)],
                        private: [...parsedData.privatePhotos, ...Array(6 - parsedData.privatePhotos.length).fill(null)]
                    });
                    setText(parsedData?.myHeading);
                    setAbout(parsedData?.aboutUsDescription)
                    setUserHobbies(parsedData?.hobbies)
                    const ageRange = parsedData?.preferences?.ageRange;
                    if (ageRange) {
                        setAgeRange([ageRange.min, ageRange.max]);
                    }
                    setEthnicity(parsedData?.ethnicity)
                    setHeight(parsedData?.tall?.value)
                    setUnit(parsedData?.tall?.unit)
                    setSelectedBodyType(parsedData?.bodyType)
                    setChild(parsedData?.children)
                    setSmoke(parsedData?.smoke)
                    setDrinking(parsedData?.drink)
                    setEducation(parsedData?.highestEducation)
                    setField(parsedData?.workField)
                    setNetWorth(parsedData?.netWorthRange)
                }
            } catch (error) {
                console.log('Error fetching user data:', error);
            }
        };

        fetchUserDetails();
    }, []);

    const handleSubmit = async () => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };

        try {
            // Upload each photo and get the URLs
            const urls = await Promise.all(
                [...photos.public, ...photos.private].map((photo, index) => {
                    if (!photo) return null;
                    const isPrivate = index >= photos.public.length;  // Determine if it's a private photo
                    return uploadPhoto(photo, isPrivate);  // Upload and get the URL
                })
            );


            const publicPhotosUrls = urls.slice(1, 7).filter(Boolean);
            const privatePhotosUrls = urls.slice(7).filter(Boolean);

            const accountUpdatePayload = {
                step: 20,
                accountUpdatePayload: {
                    publicPhotos: publicPhotosUrls,
                    privatePhotos: privatePhotosUrls,
                },
            };

            console.log('Payload for account update:', accountUpdatePayload);

            // Send the request to update the account
            const response = await axios.put(`auth/update-account/${userdetails?._id}`, accountUpdatePayload, { headers });
            console.log('Response from account update:', response.data);
            if (response.status === 200) {
                Toast.show('Photos uploaded successfully!', Toast.SHORT);
            }
        } catch (error) {
            // console.error('Error updating account:', error.response?.data || error.message);
            if (error.message === 'Network Error') {
                throw new Error('Network Error');
            }
            // Alert.alert('Error', 'Failed to upload photos. Please try again.');
        }
    };

    const uploadPhoto = async (uri, isPrivate = false) => {
        const token = await AsyncStorage.getItem('authToken');
        try {
            const formData = new FormData();
            formData.append('file', {
                uri,
                name: `photo_${Date.now()}.jpg`,
                type: 'image/jpeg',
            });

            const endpoint = isPrivate ? 'file/upload-private' : 'file/upload';
            const response = await axios.post(endpoint, formData, {
                headers: {
                    Authorization: token,
                    'Content-Type': 'multipart/form-data',
                },
            });

            const uploadedUrl = response.data.data.url;
            console.log('Uploaded photo URL:', uploadedUrl);
            return uploadedUrl;
        } catch (error) {
            console.error(`Error uploading to ${isPrivate ? 'private' : 'public'} endpoint:`, error.response?.data || error.message);
            throw error;
        }
    };

    const renderItem = (item, index, type, isResponsePhoto) => (
        <TouchableOpacity
            key={index}
            style={styles.photoBox}
            onPress={() => handlePhotoSelection(index, type)} // Pass the correct index to handlePhotoSelection
        >
            {item ? (
                <ImageBackground
                    source={{ uri: item }}
                    style={styles.photo}
                    imageStyle={styles.imageStyle}
                >
                    <TouchableOpacity
                        style={styles.removeIcon}
                        onPress={() => isResponsePhoto ? handleDeletePhoto(index, type, item) : handleRemovePhoto(index, type)}
                    >
                        <View style={styles.cont4}>
                            <Image style={styles.crossText} source={isResponsePhoto ? images.delete : images.cross} />
                        </View>
                    </TouchableOpacity>
                    {isUploading[index] && (
                        <ActivityIndicator style={{ alignSelf: 'center', top: 30 }} size="large" color="white" />
                    )}
                </ImageBackground>
            ) : (
                <Image source={images.add} style={styles.addIcon} />
            )}
        </TouchableOpacity>
    );

    const handlePhotoSelection = async (index, type) => {
        const options = {
            mediaType: 'photo',
            quality: 1,
        };

        launchImageLibrary(options, async (response) => {
            if (!response.didCancel && !response.error && response.assets) {
                const newPhotoUri = response.assets[0].uri;

                // Update the photos state to reflect the selected photo
                setPhotos((prevState) => {
                    const updatedPhotos = { ...prevState };
                    if (!updatedPhotos[type]) {
                        updatedPhotos[type] = Array(6).fill(null); // Initialize the type if not exists
                    }
                    updatedPhotos[type][index] = newPhotoUri; // Set the selected slot with the new photo URI
                    return updatedPhotos;
                });

                try {
                    const isPrivate = index >= 6;  // Check if the photo is private based on index
                    const uploadedUrl = await uploadPhoto(newPhotoUri, isPrivate);

                    // Update AsyncStorage with the new uploaded photo URL
                    const data = await AsyncStorage.getItem('UserData');
                    if (data) {
                        const parsedData = JSON.parse(data);
                        if (isPrivate) {
                            parsedData.privatePhotos.push(uploadedUrl);
                        } else {
                            parsedData.publicPhotos.push(uploadedUrl);
                        }

                        // Save the updated data back to AsyncStorage
                        await AsyncStorage.setItem('UserData', JSON.stringify(parsedData));

                        // Update the photos state to trigger re-render after upload
                        setPhotos(prevState => {
                            const updatedPhotos = { ...prevState };
                            if (isPrivate) {
                                updatedPhotos.private[index] = uploadedUrl; // Update the private photo array
                            } else {
                                updatedPhotos.public[index] = uploadedUrl; // Update the public photo array
                            }
                            return updatedPhotos; // Return updated state to trigger re-render
                        });
                        handleSubmit()
                        console.log('Updated photos in AsyncStorage:', parsedData);
                    }
                } catch (error) {
                    console.error('Error uploading photo:', error);
                } finally {
                    // Stop loader and any other finalization actions
                    setIsUploading(prevState => {
                        const newState = [...prevState];
                        newState[index] = false; // Mark upload as complete
                        return newState;
                    });
                }
            } else {
                console.log('Photo selection was canceled or an error occurred');
            }
        });
    };

    const handleDeletePhoto = async (index, type, item) => {
        // Show loader during deletion
        setIsDeleting(prevState => {
            const newState = [...prevState];
            newState[index] = true; // Mark this photo as being deleted
            return newState;
        });

        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            url: item,
        };

        try {
            // Perform the delete request
            const resp = await axios.post('file/deleteByUrl', body, { headers });
            console.log('Response from the delete photo', resp.data);

            // Update AsyncStorage with the new list of photos after deletion
            const data = await AsyncStorage.getItem('UserData');
            if (data) {
                const parsedData = JSON.parse(data);

                // Update public or private photos based on the type
                if (type === 'public') {
                    const updatedPublicPhotos = parsedData.publicPhotos.filter(photo => photo !== item);
                    parsedData.publicPhotos = updatedPublicPhotos;
                } else {
                    const updatedPrivatePhotos = parsedData.privatePhotos.filter(photo => photo !== item);
                    parsedData.privatePhotos = updatedPrivatePhotos;
                }

                // Save the updated data back to AsyncStorage
                await AsyncStorage.setItem('UserData', JSON.stringify(parsedData));

                // Update the photos state
                setPhotos(prevState => {
                    const updatedPhotos = { ...prevState };
                    if (type === 'public') {
                        updatedPhotos.public[index] = null;
                    } else {
                        updatedPhotos.private[index] = null;
                    }
                    return updatedPhotos;
                });
                await handleSubmit()
                console.log('Updated photos in AsyncStorage and UI');
            }

        } catch (error) {
            console.error('Error deleting photo', error);
        } finally {
            // Hide loader after deletion is complete
            setIsDeleting(prevState => {
                const newState = [...prevState];
                newState[index] = false; // Mark this photo as no longer being deleted
                return newState;
            });
        }
    };

    const handleRemovePhoto = (index, type) => {
        const updatedPhotos = { ...photos };
        updatedPhotos[type][index] = null;
        setPhotos(updatedPhotos);
    };

    const handleEditSave = async () => {
        if (isEditing) {
            await userHeading()
        }
        setIsEditing(!isEditing);
    };


    const handleEditAbout = async () => {
        if (iseditabout) {
            await userAboutYou()
        }
        setEditAbout(!iseditabout);
    };

    const handledropLoc = () => {
        if (isdown) {

        }
        setIsDown(!isdown)
    }
    const handledropLoc1 = () => {
        if (isdown1) {

        }
        setIsDown1(!isdown1)
    }

    const handleHobbie = async () => {
        if (isHobbies) {
            await userHobbies()
        }
        setIsHobbies(!isHobbies)
    }

    const handleHHobbies = (hobby) => {
        if (userhobbies.includes(hobby)) {
            setUserHobbies(userhobbies.filter((item) => item !== hobby));
        } else if (userhobbies.length < 7) {
            setUserHobbies([...userhobbies, hobby]);
        } else {
            Toast.show('You can select upto 7 Hobbies only', Toast.SHORT);
        }
    };

    const handleIsAge = async () => {
        if (isagerange) {
            await userAgeRange()
        }
        setIsRangeRange(!isagerange)
    }

    const handleSliderChange = (values) => {
        setAgeRange(values);
    };

    const handleEthnicity = (type) => {
        setEthnicity(type);
    };

    const handleIsEthni = async () => {
        if (isethnicity) {
            await userEthnicity()
        }
        setIsEthnicity(!isethnicity)
    }

    const convertToFeetInch = (cm) => {
        const totalInches = cm / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        return `${feet}ft ${inches}in`;
    };

    const handleIsHeight = async () => {
        if (isheight) {
            await userHeight()
        }
        setIsHeight(!isheight)
    }

    const handleIsBodyType = async () => {
        if (isbodytype) {
            await userBodyType()
        }
        setIsBodyType(!isbodytype)
    }

    const handleBodyTypeSelect = (type) => {
        setSelectedBodyType(type)

    };

    const handleChildren = (type) => {
        setChild(type);
    };

    const handleIsChild = async () => {
        if (ischild) {
            await userChildren()
        }
        setIsChild(!ischild)
    }

    const handleSmoking = (type) => {
        setSmoke(type);
    };

    const handleIsSmoke = async () => {
        if (issmoke) {
            await userSmoking()
        }
        setIsSmoke(!issmoke)
    }

    const handleAlcohol = (type) => {
        setDrinking(type);
    };

    const handleIsDrinking = async () => {
        if (isdrinking) {
            await userDrinking()
        }
        setIsDrinking(!isdrinking)
    }

    const handleEducation = (type) => {
        setEducation(type);
    };

    const handleIsEducation = async () => {
        if (iseducation) {
            await userEducation()
        }
        setIsEducation(!iseducation)
    }

    const handleWorkField = (type) => {
        setField(type);
    };

    const handleIsWork = async () => {
        if (isworkfield) {
            await userWorkField()
        }
        setIsWorkField(!isworkfield)
    }

    const handleNetWorth = (type) => {
        setNetWorth(type);
    };

    const handleIsNet = async () => {
        if (isnetworth) {
            await userNetWorthRange()
        }
        setIsNetworth(!isnetworth)
    }

    const userHeading = async () => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 21,
            accountUpdatePayload: {
                myHeading: text
            }
        }
        console.log('body response of the profileheading', body);
        try {
            const resp = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers })
            if (resp?.status === 200) {
                const updatedUserData = { ...userdetails, myHeading: text };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                console.log('User data updated in AsyncStorage');
            }
        } catch (error) {
            console.log('error from user profileheading', error);
        }
    }

    const userAboutYou = async () => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 22,
            accountUpdatePayload: {
                aboutUsDescription: about
            }
        }
        console.log('body response of the aboutyou', body);
        try {
            const resp = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers });
            if (resp?.status === 200) {
                const updatedUserData = { ...userdetails, aboutUsDescription: about };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                console.log('User data updated in AsyncStorage');
            }
        } catch (error) {
            console.log('error from user aboutyou', error);
        }
    }


    const userHobbies = async () => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 15,
            accountUpdatePayload: {
                hobbies: userhobbies
            }
        }
        console.log('body response of the hobbies', body);
        try {
            const resp = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers })
            if (resp?.status === 200) {
                const updatedUserData = { ...userdetails, hobbies: userhobbies };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                console.log('User data updated in AsyncStorage');
            }
        } catch (error) {
            console.log('error from user hobbies', error);
        }
    }

    const userAgeRange = async () => {
        const token = await AsyncStorage.getItem('authToken');
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
        console.log('body response of the ageRange', body);
        try {
            const resp = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers })
            if (resp?.status === 200) {
                const updatedUserData = {
                    ...userdetails, preferences: {
                        ageRange: {
                            min: ageRange[0],
                            max: ageRange[1]
                        }
                    }
                };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                console.log('User data updated in AsyncStorage');
            }
        } catch (error) {
            console.log('error from user ageRange', error);
        }
    }

    const userEthnicity = async () => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 8,
            accountUpdatePayload: {
                ethnicity: selectethnicity
            }
        }
        console.log('body response of the ethnicity', body);
        try {
            const resp = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers })
            if (resp?.status === 200) {
                const updatedUserData = { ...userdetails, ethnicity: selectethnicity };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                console.log('User data updated in AsyncStorage');
            }
        } catch (error) {
            console.log('error from user ethnicity', error);
        }
    }

    const userHeight = async () => {
        const token = await AsyncStorage.getItem('authToken');
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
        console.log('body response of the height', body);
        try {
            const resp = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers })
            if (resp?.status === 200) {
                const updatedUserData = {
                    ...userdetails, tall: {
                        value: height,
                        unit: unit
                    }
                };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                console.log('User data updated in AsyncStorage');
            }
        } catch (error) {
            console.log('error from user height', error);
        }
    }

    const userBodyType = async () => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 7,
            accountUpdatePayload: {
                bodyType: selectedBodyType
            }
        }
        console.log('body response of the bodytype', body);
        try {
            const resp = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers })
            if (resp?.status === 200) {
                const updatedUserData = { ...userdetails, bodyType: selectedBodyType };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                console.log('User data updated in AsyncStorage');
            }
        } catch (error) {
            console.log('error from user bodytype', error);
        }
    }

    const userChildren = async () => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 12,
            accountUpdatePayload: {
                children: child
            }
        }
        console.log('body response of the children', body);
        try {
            const resp = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers })
            if (resp?.status === 200) {
                const updatedUserData = { ...userdetails, children: child };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                console.log('User data updated in AsyncStorage');
            }
        } catch (error) {
            console.log('error from user children', error);
        }
    }

    const userSmoking = async () => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 16,
            accountUpdatePayload: {
                smoke: smoke
            }
        }
        console.log('body response of the smoke', body);
        try {
            const resp = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers })
            if (resp?.status === 200) {
                const updatedUserData = { ...userdetails, smoke: smoke };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                console.log('User data updated in AsyncStorage');
            }
        } catch (error) {
            console.log('error from user smoke', error);
        }
    }

    const userDrinking = async () => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 17,
            accountUpdatePayload: {
                drink: drinking
            }
        }
        console.log('body response of the drinking', body);
        try {
            const resp = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers })
            if (resp?.status === 200) {
                const updatedUserData = { ...userdetails, drink: drinking };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                console.log('User data updated in AsyncStorage');
            }
        } catch (error) {
            console.log('error from user drinking', error);
        }
    }

    const userEducation = async () => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 9,
            accountUpdatePayload: {
                highestEducation: selecteducation
            }
        }
        console.log('body response of the highestEducation', body);
        try {
            const resp = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers })
            if (resp?.status === 200) {
                const updatedUserData = { ...userdetails, highestEducation: selecteducation };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                console.log('User data updated in AsyncStorage');
            }
        } catch (error) {
            console.log('error from user highestEducation', error);
        }
    }

    const userWorkField = async () => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 10,
            accountUpdatePayload: {
                workField: workfield
            }
        }
        console.log('body response of the workField', body);
        try {
            const resp = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers })
            if (resp?.status === 200) {
                const updatedUserData = { ...userdetails, workField: workfield };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                console.log('User data updated in AsyncStorage');
            }
        } catch (error) {
            console.log('error from user workField', error);
        }
    }

    const userNetWorthRange = async () => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 13,
            accountUpdatePayload: {
                netWorthRange: networth
            }
        }
        console.log('body response of the networth', body);
        try {
            const resp = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers })
            if (resp?.status === 200) {
                const updatedUserData = { ...userdetails, netWorthRange: networth };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                console.log('User data updated in AsyncStorage');
            }
        } catch (error) {
            console.log('error from user networth', error);
        }
    }

    return (
        <View style={styles.main}>
            <View style={styles.cont}>
                <Image source={{ uri: userdetails?.profilePicture }} style={styles.profile} />
                <Text style={styles.txt}>Himanshu</Text>
            </View>
            <View style={styles.cont1}>
                <AnimatedCircularProgress
                    size={20}
                    width={4}
                    fill={userdetails?.profileCompletion}
                    tintColor="#916008"
                    backgroundColor="#ffffff"
                    rotation={0}
                    lineCap="round"
                    strokeCap="round"
                />
                <Text style={styles.completionText}>{Math.round(userdetails?.profileCompletion)}% Profile Completion</Text>
            </View>
            <Text style={styles.txt1}>Attention! Members can't interact with you!</Text>
            <ScrollView>
                <View style={styles.cont2}>
                    <TouchableOpacity onPress={() => setSelectedButton('Public Photo')}>
                        <View style={[styles.cont3, { right: 20 }]}>
                            <View style={{ flexDirection: 'row' }}>
                                <Image source={images.publicp} style={[styles.img, { tintColor: selectedButton === 'Public Photo' ? '#916008' : 'black' }]} />
                                <Text style={[styles.txt2, { color: selectedButton === 'Public Photo' ? '#916008' : 'black' }]}>
                                    Public Photo
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSelectedButton('Private Photo')}>
                        <View style={styles.cont3}>
                            <View style={{ flexDirection: 'row' }}>
                                <Image source={images.privatep2} style={[styles.img1, { tintColor: selectedButton === 'Private Photo' ? '#916008' : 'black' }]} />
                                <Text style={[styles.txt3, { color: selectedButton === 'Private Photo' ? '#916008' : 'black' }]}>
                                    Private Photo
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>



                {selectedButton === 'Public Photo' ? (
                    <View style={styles.photoGrid}>
                        {photos.public.map((photo, index) => renderItem(photo, index, 'public', userdetails?.publicPhotos && userdetails.publicPhotos.includes(photo)))}
                        <TouchableOpacity
                            style={styles.addMorePhotoButton}
                            onPress={() => handlePhotoSelection('public')}
                        >
                            {/* <Text style={styles.addMoreText}>+ Add More</Text> */}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.photoGrid}>
                        {photos.private.map((photo, index) => renderItem(photo, index, 'private', userdetails?.privatePhotos && userdetails.privatePhotos.includes(photo)))}
                        <TouchableOpacity
                            style={styles.addMorePhotoButton}
                            onPress={() => handlePhotoSelection('private')}
                        >
                            {/* <Text style={styles.addMoreText}>+ Add More</Text> */}
                        </TouchableOpacity>
                    </View>
                )}
                <View style={styles.cont5}>
                    <Image source={images.verified} style={styles.img2} />
                    <Text style={styles.txt4}>Verifications</Text>
                </View>
                <Text style={styles.txt5}>To verify your identity, please complete our verification process. We keep your data private and use it solely for verification purposes to ensure authenticity. Once you’re verified, you will get a blue shield checkmark on your profile</Text>

                <View style={styles.cont6}>
                    <Text style={styles.txt6}>ID Verification</Text>
                    {userdetails?.isIdVerified === true ?
                        <View style={styles.cont7}>
                            <Text style={styles.txtVerified}>Verified</Text>
                        </View>
                        :
                        <TouchableOpacity onPress={() => navigation.navigate('VerifyIdentity')}>
                            <View style={[styles.cont7, { borderColor: 'red' }]}>
                                <Text style={[styles.txtVerified, { color: 'red' }]}>Verify</Text>
                            </View>
                        </TouchableOpacity>
                    }
                </View>
                <View style={styles.cont6}>
                    <Text style={styles.txt6}>Selfie Verification</Text>
                    {userdetails?.isProfileVerified === true ?
                        <View style={styles.cont7}>
                            <Text style={styles.txtVerified}>Verified</Text>
                        </View>
                        :
                        <TouchableOpacity onPress={() => navigation.navigate('VerifySelfie')}>
                            <View style={[styles.cont7, { borderColor: 'red' }]}>
                                <Text style={[styles.txtVerified, { color: 'red' }]}>Verify</Text>
                            </View>
                        </TouchableOpacity>
                    }
                </View>

                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: 'Poppins-Bold' }]}>Heading</Text>
                    <TouchableOpacity onPress={handleEditSave}>
                        {isEditing === false ?
                            <Image
                                source={images.edit}
                                style={{ height: 20, width: 20, tintColor: 'grey' }}
                            />
                            :
                            <View style={styles.cont8}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        }
                    </TouchableOpacity>
                </View>
                {isEditing === true ?
                    <TextInput
                        style={[styles.txt7, { borderWidth: isEditing === true ? 1 : null }]}
                        value={text}
                        onChangeText={setText}
                        editable={isEditing}
                        scrollEnabled={true}
                        multiline={true}
                    />
                    :
                    null}

                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: 'Poppins-Bold' }]}>About</Text>
                    <TouchableOpacity onPress={handleEditAbout}>
                        {iseditabout === false ?
                            <Image
                                source={images.edit}
                                style={{ height: 20, width: 20, tintColor: 'grey' }}
                            />
                            :
                            <View style={styles.cont8}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        }
                    </TouchableOpacity>
                </View>
                {iseditabout === true ?
                    <TextInput
                        style={[styles.txt7, { borderWidth: iseditabout === true ? 1 : null }]}
                        value={about}
                        onChangeText={setAbout}
                        editable={iseditabout}
                    /> : null}

                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: 'Poppins-Bold' }]}>Location</Text>
                </View>
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginLeft: 16,
                    marginRight: 16,
                    marginTop: 20,
                }}>
                    <Text style={styles.txt6}>Primary Location</Text>
                    <TouchableOpacity onPress={handledropLoc}>
                        <Image source={isdown === false ? images.rightarrow : images.dropdown} style={{ height: 20, width: 20, tintColor: 'grey' }} />
                    </TouchableOpacity>
                </View>
                {isdown === true ?
                    <Text style={styles.txt8}>{userdetails?.city}, {userdetails?.state}, {userdetails?.country}</Text>
                    :
                    null
                }

                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginLeft: 16,
                    marginRight: 16,
                    marginTop: 20,
                }}>
                    <Text style={styles.txt6}>Secondary Location</Text>
                    <TouchableOpacity onPress={handledropLoc1}>
                        <Image source={isdown1 === false ? images.rightarrow : images.dropdown} style={{ height: 20, width: 20, tintColor: 'grey' }} />
                    </TouchableOpacity>
                </View>
                {isdown1 === true ?
                    <Text style={styles.txt8}>{userdetails?.city}, {userdetails?.state}, {userdetails?.country}</Text>
                    :
                    null
                }

                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: 'Poppins-Bold' }]}>Hobbies</Text>
                    <TouchableOpacity onPress={handleHobbie}>
                        {isHobbies === false ?
                            <Image
                                source={images.edit}
                                style={{ height: 20, width: 20, tintColor: 'grey' }}
                            />
                            :
                            <View style={[styles.cont8, { top: 3 }]}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        }
                    </TouchableOpacity>
                </View>
                {isHobbies === true ?
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
                    </View> : null}

                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: 'Poppins-Bold' }]}>Age Preferences</Text>
                    <TouchableOpacity onPress={handleIsAge}>
                        {isagerange === false ?
                            <Image
                                source={images.edit}
                                style={{ height: 20, width: 20, tintColor: 'grey' }}
                            />
                            :
                            <View style={[styles.cont8, { top: 3 }]}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        }
                    </TouchableOpacity>
                </View>
                {isagerange === true ?
                    <View>
                        <View style={styles.ageRangeContainer}>
                            <Text style={styles.ageRangeText}>
                                {ageRange[0]} - {ageRange[1] === 60 ? '70+' : ageRange[1]}
                            </Text>
                        </View>
                        <MultiSlider
                            values={ageRange}
                            sliderLength={width * 0.9}
                            onValuesChange={handleSliderChange}
                            min={18}
                            max={100}
                            step={1}
                            allowOverlap={false}
                            snapped
                            selectedStyle={{
                                backgroundColor: '#5F3D23',
                            }}
                            unselectedStyle={{
                                backgroundColor: '#E0E0E0',
                            }}
                            trackStyle={{
                                height: 6,
                            }}
                            customMarker={() => (
                                <View style={styles.markerStyle} />
                            )}
                        />
                    </View>
                    : null}

                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: 'Poppins-Bold' }]}>Ethnicity</Text>
                    <TouchableOpacity onPress={handleIsEthni}>
                        {isethnicity === false ?
                            <Image
                                source={images.edit}
                                style={{ height: 20, width: 20, tintColor: 'grey' }}
                            />
                            :
                            <View style={[styles.cont8, { top: 3 }]}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        }
                    </TouchableOpacity>
                </View>
                {isethnicity === true ?
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
                    </View> : null}


                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: 'Poppins-Bold' }]}>Height</Text>
                    <TouchableOpacity onPress={handleIsHeight}>
                        {isheight === false ?
                            <Image
                                source={images.edit}
                                style={{ height: 20, width: 20, tintColor: 'grey' }}
                            />
                            :
                            <View style={[styles.cont8, { top: 3 }]}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        }
                    </TouchableOpacity>
                </View>
                {isheight === true ?
                    <View>
                        <View style={styles.toggleContainer}>
                            <TouchableOpacity
                                style={[styles.toggleButton, unit === 'cm' && styles.activeButton]}
                                onPress={() => setUnit('cm')}
                            >
                                <Text style={[styles.toggleText, unit === 'cm' && styles.activeText]}>cm</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.toggleButton, unit === 'feet/inch' && styles.activeButton]}
                                onPress={() => setUnit('feet/inch')}
                            >
                                <Text style={[styles.toggleText, unit === 'feet/inch' && styles.activeText]}>feet/inch</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.heightText}>
                            {unit === 'cm' ? `${height} cm` : convertToFeetInch(height)}
                        </Text>
                        <Slider
                            style={styles.slider}
                            minimumValue={140}
                            maximumValue={210}
                            step={1}
                            value={height}
                            onValueChange={(value) => setHeight(value)}
                            minimumTrackTintColor="#5F3D23"
                            maximumTrackTintColor="#E0E0E0"
                            thumbTintColor="#5F3D23"
                        />
                        <View style={styles.rangeContainer}>
                            <Text style={styles.rangeText}>140</Text>
                            <Text style={styles.rangeText}>210</Text>
                        </View>
                    </View> : null}

                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: 'Poppins-Bold' }]}>Body Type</Text>
                    <TouchableOpacity onPress={handleIsBodyType}>
                        {isbodytype === false ?
                            <Image
                                source={images.edit}
                                style={{ height: 20, width: 20, tintColor: 'grey' }}
                            />
                            :
                            <View style={[styles.cont8, { top: 3 }]}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        }
                    </TouchableOpacity>
                </View>
                {isbodytype === true ?
                    <View style={styles.bodyTypeContainer}>
                        {bodyTypes.map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.bodyTypeButton,
                                    selectedBodyType === type && styles.selectedBodyTypeButton,

                                    // selectedBodyType === type && styles.selectedBodyTypeButton,
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
                    </View> : null}


                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: 'Poppins-Bold' }]}>Children</Text>
                    <TouchableOpacity onPress={handleIsChild}>
                        {ischild === false ?
                            <Image
                                source={images.edit}
                                style={{ height: 20, width: 20, tintColor: 'grey' }}
                            />
                            :
                            <View style={[styles.cont8, { top: 3 }]}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        }
                    </TouchableOpacity>
                </View>
                {ischild === true ?
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
                    </View> : null}

                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: 'Poppins-Bold' }]}>Do you smoke?</Text>
                    <TouchableOpacity onPress={handleIsSmoke}>
                        {issmoke === false ?
                            <Image
                                source={images.edit}
                                style={{ height: 20, width: 20, tintColor: 'grey' }}
                            />
                            :
                            <View style={[styles.cont8, { top: 3 }]}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        }
                    </TouchableOpacity>
                </View>
                {issmoke === true ?
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
                    </View> : null}

                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: 'Poppins-Bold' }]}>Do you drink?</Text>
                    <TouchableOpacity onPress={handleIsDrinking}>
                        {isdrinking === false ?
                            <Image
                                source={images.edit}
                                style={{ height: 20, width: 20, tintColor: 'grey' }}
                            />
                            :
                            <View style={[styles.cont8, { top: 3 }]}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        }
                    </TouchableOpacity>
                </View>
                {isdrinking === true ?
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
                    </View> : null}

                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: 'Poppins-Bold' }]}>Education</Text>
                    <TouchableOpacity onPress={handleIsEducation}>
                        {iseducation === false ?
                            <Image
                                source={images.edit}
                                style={{ height: 20, width: 20, tintColor: 'grey' }}
                            />
                            :
                            <View style={[styles.cont8, { top: 3 }]}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        }
                    </TouchableOpacity>
                </View>
                {iseducation === true ?
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
                    </View> : null}

                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: 'Poppins-Bold' }]}>Occupation</Text>
                    <TouchableOpacity onPress={handleIsWork}>
                        {isworkfield === false ?
                            <Image
                                source={images.edit}
                                style={{ height: 20, width: 20, tintColor: 'grey' }}
                            />
                            :
                            <View style={[styles.cont8, { top: 3 }]}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        }
                    </TouchableOpacity>
                </View>
                {isworkfield === true ?
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
                    </View> : null}

                <View style={[styles.cont6, { marginBottom: 20 }]}>
                    <Text style={[styles.txt6, { fontFamily: 'Poppins-Bold' }]}>Net worth</Text>
                    <TouchableOpacity onPress={handleIsNet}>
                        {isnetworth === false ?
                            <Image
                                source={images.edit}
                                style={{ height: 20, width: 20, tintColor: 'grey' }}
                            />
                            :
                            <View style={[styles.cont8, { top: 3 }]}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        }
                    </TouchableOpacity>
                </View>
                {isnetworth === true ?
                    <View style={[styles.bodyTypeContainer, { marginBottom: 100 }]}>
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
                    </View> : null}

            </ScrollView>
        </View>
    );
};


export default ViewProfile;



const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: 'white',
    },
    cont: {
        flexDirection: 'row',
        marginTop: 30,
        marginRight: 16,
        marginLeft: 16,
    },
    profile: {
        height: 40,
        width: 40,
        borderRadius: 100
    },
    txt: {
        marginLeft: 10,
        fontFamily: 'Poppins-Medium',
        fontSize: 24,
    },
    cont1: {
        flexDirection: 'row',
        marginTop: 30,
        marginLeft: 16,
    },
    completionText: {
        fontFamily: 'Poppins-Regular',
        fontSize: 16,
        marginLeft: 10,
        bottom: 2,
        color: '#5F6368',
    },
    txt1: {
        marginLeft: 16,
        fontFamily: 'Poppins-Regular',
        color: '#3C4043',
        fontSize: 12,
    },
    cont2: {
        height: 35,
        width: '60%',
        alignSelf: 'center',
        borderRadius: 100,
        marginTop: 12,
        justifyContent: 'center',
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: 'grey',
    },
    cont3: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    img: {
        height: 15,
        width: 15,
        top: 3,
        right: 5,
    },
    img1: {
        height: 18,
        width: 18,
        left: 4,
    },
    txt2: {
        fontSize: 16,
        textAlign: 'center',
    },
    txt3: {
        fontSize: 16,
        textAlign: 'center',
        left: 10,
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
        borderStyle: 'dotted',
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
    imageStyle: {
        borderRadius: 8,
    },
    removeIcon: {
        position: 'absolute',
        top: 5,
        right: 5,
        zIndex: 10,
    },
    crossText: {
        height: 12,
        width: 12,
        tintColor: 'white',
        alignSelf: 'center',
    },
    cont4: {
        borderWidth: 1,
        height: 20,
        width: 20,
        borderRadius: 100,
        justifyContent: 'center',
        backgroundColor: 'black',
    },
    cont5: {
        flexDirection: 'row',
        marginLeft: 16,
        marginRight: 16,
        marginTop: 20
    },
    img2: {
        height: 20,
        width: 20,
        top: 5
    },
    txt4: {
        color: 'black',
        fontFamily: "Poppins-Bold",
        fontSize: 20,
        marginLeft: 10
    },
    txt5: {
        marginLeft: 16,
        marginRight: 16,
        textAlign: 'center',

    },
    cont6: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: 16,
        marginRight: 16,
        marginTop: 20,
    },
    cont7: {
        borderWidth: 1,
        height: 25,
        width: 75,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        borderColor: '#4CAF50'
    },
    txt6: {
        color: '#383838',
        fontSize: 16,
        fontFamily: 'Poppins-Medium',
        textAlign: 'left',
    },
    txtVerified: {
        fontSize: 14,
        color: '#4CAF50',
        fontFamily: 'Poppins-Regular',
        textAlign: 'center',
        top: 2
    },
    txt7: {
        marginLeft: 16,
        marginRight: 16,
        fontFamily: 'Poppins-Medium',
        color: '#3838383',
        borderWidth: 1,
        alignSelf: 'center',
        width: '90%',
        borderColor: '#DDDDDD',
        paddingLeft: 8
    },
    cont8: {
        borderWidth: 1,
        height: 22,
        width: 40,
        justifyContent: 'center',
        borderRadius: 5,
        backgroundColor: '#916008',
        borderColor: '#916008'
    },
    searchContainer: {
        width: '90%',
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
    txt8: {
        marginLeft: 16,
        color: '#383838',
        fontFamily: 'Poppins-Regular',
        fontSize: 14
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
        backgroundColor: '#5F3D23',
        borderColor: '#5F3D23',
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
        // marginVertical: 30,
    },
    ageRangeText: {
        fontSize: 24,
        fontFamily: 'Poppins-Bold',
        color: '#5F3D23',
    },
    markerStyle: {
        height: 24,
        width: 24,
        borderRadius: 12,
        backgroundColor: '#5F3D23',
        borderWidth: 2,
        borderColor: '#FFF',
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
        backgroundColor: '#5F3D23',
        borderColor: '#5F3D23',
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
        color: '#5F3D23',
        // marginTop: 30,
    },
    slider: {
        width: '100%',
        height: 40,
        // marginTop: 20,
    },
    rangeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        // marginTop: 10,
    },
    rangeText: {
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        color: '#999',
    },

});
