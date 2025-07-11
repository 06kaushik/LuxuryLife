import React, { useEffect, useState, useRef } from 'react';
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
import { useIsFocused } from '@react-navigation/native';
import { GARAMOND, PLAYFAIRFONTS, POPPINSRFONTS } from '../../components/GlobalStyle';


const { width, height } = Dimensions.get('window');

const ViewProfile = ({ navigation }) => {
    const profileCompletion = 0.49;
    const [selectedButton, setSelectedButton] = useState('Public Photo');
    const [photos, setPhotos] = useState({
        public: Array(6).fill(null),
        private: Array(6).fill(null)
    });
    // console.log("Updated photos state:", photos);


    const [userdetails, setUserDetails] = useState(null)
    // console.log('userdetailsss', userdetails);
    const [selectedButton1, setSelectedButton1] = useState('Rejected');
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState('');
    const [iseditabout, setEditAbout] = useState(false)
    const [about, setAbout] = useState('')
    const [isdown, setIsDown] = useState(false)
    const [isdown1, setIsDown1] = useState(false)
    const [isHobbies, setIsHobbies] = useState(false)
    const [userhobbies, setUserHobbies] = useState([])
    const [ageRange, setAgeRange] = useState([18, 32]);
    const [isagerange, setIsRangeRange] = useState(false)
    const [selectethnicity, setEthnicity] = useState('');
    const [isethnicity, setIsEthnicity] = useState(false)
    const [unit, setUnit] = useState('');
    const [height, setHeight] = useState([122, 0]);

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
    const [isDeleting, setIsDeleting] = useState(Array(6).fill(false));
    const [privatepicrequests, setPrivatePicRequests] = useState([])
    const [iseditlookingfor, setIsEditLookingFor] = useState(false)
    const [lookingfor, setLookingfor] = useState('')
    const [interestedin, setInterestedIn] = useState([])
    const [isInterestedIn, setIsInterestedIn] = useState(false)
    const [relationshipstatus, setRelationshipStatus] = useState([])
    const [isrelationstatus, setIsRelationStatus] = useState(false)
    const [luxinterest, setLuxInterest] = useState([])
    const [isluxinterest, setIsLuxInterest] = useState(false)
    const [userprofiledata, setUserProfileData] = useState();
    const [isUploadingAny, setIsUploadingAny] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loading1, setLoading1] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const [loading3, setLoading3] = useState(false);
    const [loading4, setLoading4] = useState(false);
    const [loading5, setLoading5] = useState(false);
    const [loading6, setLoading6] = useState(false);
    const [loading7, setLoading7] = useState(false);
    const [loading8, setLoading8] = useState(false);
    const [loading9, setLoading9] = useState(false);
    const [loading10, setLoading10] = useState(false);
    const [loading11, setLoading11] = useState(false);
    const [loading12, setLoading12] = useState(false);
    const [loading13, setLoading13] = useState(false);
    const [loading14, setLoading14] = useState(false);
    const [loading15, setLoading15] = useState(false);




    const isFocused = useIsFocused()
    const bodyTypes = ['Slim', 'Athletic', 'Average', 'Curvy', 'Plus-size', 'Petite', 'Muscular', 'Broad', 'Lean', 'Prefer not to say'];
    const ethnicity = ['Asian', 'Black/African descent', 'Hispanic/Latino', 'Middle Eastern', 'Native American/Indigenous', 'Pacific Islander', 'White/Caucasian', 'Mixed/Multiracial', 'Other', 'Prefer not to say'];
    const education = ["High School", "Some College", "Associate's Degree", "Bachelor's Degree", "Master's Degree", "PhD / Post Doctoral", "MD / Medical Doctor", "JD / Attorney", 'Prefer not to say']
    const workField = ['Finance/Investment', 'Technology/Software', 'Art/Entertainment', 'Healthcare/Medical', 'Law/Legal', 'Education', 'Marketing/Sales', 'Hospitality/Real Estate', 'Entrepreneur/Startup', 'Other', 'Prefer not to say'];
    const children = ['Yes', 'No', 'Prefer not to say']
    const netWorth = ['Below $200,000', '$200,000 - $500,000', '$500,000 - $1 Million', '$1 Million - $5 Million', 'More Than $5 Million', 'Prefer not to say'];
    const hobbies = ['Reading', 'Traveling', 'Cooking/Baking', 'Hiking/Outdoor Adventures', 'Photography', 'Painting/Drawing', 'Playing Sports', 'Writing', 'Yoga/Meditation', 'Playing Musical Instruments', 'Gardening', 'Watching Movies/TV Shows', 'Dancing', 'Volunteering/Community Service', 'Collecting (e.g., stamps, coins)'];
    const smoking = ['Yes', 'No', 'Prefer not to say'];
    const alcoholic = ['Yes', 'No', 'Prefer not to say'];
    const interests = ['Fine Dining', 'Luxury Travel', 'Yachting', 'Private Jets', 'Wine Tasting', 'Fashion & Design', 'Exclusive Events', 'Golf', 'High-End Cars', 'Wellness & Fitness', 'Spa Retreats', 'Gourmet Cooking', 'Philanthropy', 'Skiing/Snowboarding', 'Collecting (e.g., stamps, coins, Car, Wine)'];
    const statusR = ["Single", "In a Relationship", "Divorced", "Widowed", "Married", 'Prefer not to say']
    const inwhointerested = ['Male', 'Female', 'Both', 'Non-binary']


    useEffect(() => {
        fetchUserDetails();
    }, []);


    useEffect(() => {
        getUserProfileData()
    }, [userdetails])

    const getUserProfileData = async () => {
        const token = await AsyncStorage.getItem('authToken')
        const headers = {
            Authorization: token
        }
        try {
            const resp = await axios.get(`auth/user-profile`, { headers })
            // console.log('user profile dataa', resp?.data?.data);
            const parsedData = resp?.data?.data
            setUserProfileData(resp?.data?.data)
            setPhotos({
                public: [
                    ...parsedData.publicPhotos,
                    ...Array(6 - parsedData.publicPhotos.length).fill(null),
                ],
                private: [
                    ...parsedData.privatePhotos,
                    ...Array(6 - parsedData.privatePhotos.length).fill(null),
                ],
            });
        } catch (error) {
            //('error frm the user profile', error.response.data.message);
        } 812345
    }

    const fetchUserDetails = async () => {
        try {
            const data = await AsyncStorage.getItem('UserData');

            if (data !== null) {
                const parsedData = JSON.parse(data);
                setUserDetails(parsedData);

                setText(parsedData?.myHeading);
                setAbout(parsedData?.aboutUsDescription)
                setUserHobbies(parsedData?.hobbies)
                const ageRange = parsedData?.preferences?.ageRange;
                if (ageRange) {
                    setAgeRange([ageRange.min, ageRange.max]);
                }
                setEthnicity(parsedData?.ethnicity)
                if (parsedData?.tall?.value) {
                    // Set the value for index 1 from parsedData
                    setHeight([122, parsedData?.tall?.cm]);
                }
                setUnit(parsedData?.tall?.unit)
                setSelectedBodyType(parsedData?.bodyType)
                setChild(parsedData?.children)
                setSmoke(parsedData?.smoke)
                setDrinking(parsedData?.drink)
                setEducation(parsedData?.highestEducation)
                setField(parsedData?.workField)
                setNetWorth(parsedData?.netWorthRange)
                setLookingfor(parsedData?.preferences?.aboutPartnerDescription)
                setInterestedIn(parsedData?.preferences?.gender)
                setRelationshipStatus(parsedData?.currentRelationshipStatus)
                setLuxInterest(parsedData?.luxuryInterests)
            }
        } catch (error) {
            //('Error fetching user data:', error);
        }
    };

    const handleSubmit = async () => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };

        try {
            // Filter out null values and get the updated public and private photo URLs
            const publicPhotosUrls = photos.public.filter(photo => photo !== null);
            const privatePhotosUrls = photos.private.filter(photo => photo !== null);

            const accountUpdatePayload = {
                step: 20,
                accountUpdatePayload: {
                    publicPhotos: publicPhotosUrls,
                    privatePhotos: privatePhotosUrls.map(url => url.split('?')[0]),  // Clean up URL if needed
                },
            };

            // Debugging line to check payload
            console.log('Updated photos payload:', accountUpdatePayload);

            const response = await axios.put(
                `auth/update-account/${userdetails?._id}`,
                accountUpdatePayload,
                { headers }
            );

            if (response.status === 200) {
                Toast.show('Please wait!', Toast.SHORT);

                // After update, fetch user details and profile data to ensure backend is in sync
                fetchUserDetails(); // Ensures the latest user details from backend
                getUserProfileData(); // Ensures latest profile data (with uploaded photos) is fetched
            } else {
                console.error('Error from backend:', response?.data?.message);
            }
        } catch (error) {
            console.error('Error updating account:', error?.response?.data?.message);
        }
    };



    const uploadPhoto = async (uri, isPrivate = false, index) => {
        const token = await AsyncStorage.getItem('authToken');
        try {
            const formData = new FormData();
            formData.append('file', {
                uri,
                name: `photo_${Date.now()}.jpg`,
                type: 'image/jpeg',
            });

            const endpoint = isPrivate
                ? 'file/upload-private'
                : 'file/upload';


            const response = await axios.post(endpoint, formData, {
                headers: {
                    Authorization: token,
                    'Content-Type': 'multipart/form-data',
                },
            });

            const uploadedUrl = isPrivate ? response.data?.data?.signedUrl : response.data.data.url;
            //('Uploaded photo URL:', uploadedUrl);
            // const uploadedUrl = response.data?.data?.url
            // //('signeddd urlll', signedUrlPrivate);

            setIsUploading((prevState) => {
                const newState = [...prevState];
                newState[index] = false;
                return newState;
            });
            return uploadedUrl;
        } catch (error) {
            console.error(`Error uploading to ${isPrivate ? 'private' : 'public'} endpoint:`, error?.message);
            throw error;
        }
    };

    const renderItem = (item, index, type, isResponsePhoto) => {
        // //('item', item);

        return (
            <TouchableOpacity
                key={index}
                style={styles.photoBox}
                onPress={() => handlePhotoSelection(index, type)}
            >
                {item ? (
                    <ImageBackground
                        source={{ uri: item }}
                        style={styles.photo}
                        imageStyle={styles.imageStyle}
                    >
                        <TouchableOpacity
                            style={styles.removeIcon}
                            onPress={() =>
                                isResponsePhoto
                                    ? handleDeletePhoto(index, type, item)
                                    : handleRemovePhoto(index, type)
                            }
                        >
                            <View style={styles.cont4}>
                                <Image
                                    style={styles.crossText}
                                    source={
                                        isResponsePhoto ? images.delete : images.cross
                                    }
                                />
                            </View>
                        </TouchableOpacity>
                        {isUploading[index] && (
                            <ActivityIndicator
                                style={{ alignSelf: 'center', top: 30 }}
                                size="large"
                                color="#916008"
                            />
                        )}
                    </ImageBackground>
                ) : (
                    <Image source={images.add} style={styles.addIcon} />
                )}
            </TouchableOpacity>
        )

    }



    const handlePhotoSelection = async (index, type) => {
        if (isUploadingAny) {
            return; // Prevent adding new photos while any photo is uploading
        }

        const options = {
            mediaType: 'photo',
            quality: 1,
        };

        launchImageLibrary(options, async (response) => {
            if (!response.didCancel && !response.error && response.assets) {
                const newPhotoUri = response.assets[0].uri;

                // Update the UI state immediately to show the photo in the UI
                setPhotos(prevState => {
                    const updatedPhotos = { ...prevState };
                    updatedPhotos[type][index] = newPhotoUri;
                    return updatedPhotos;
                });

                // Start uploading the photo
                setIsUploadingAny(true);
                setIsUploading(prevState => {
                    const newState = [...prevState];
                    newState[index] = true; // Start uploading for this index
                    return newState;
                });

                try {
                    const isPrivate = type === 'private';
                    const uploadedUrl = await uploadPhoto(newPhotoUri, isPrivate, index);

                    // Immediately sync uploaded photo with AsyncStorage
                    const data = await AsyncStorage.getItem('UserData');
                    if (data) {
                        const parsedData = JSON.parse(data);
                        if (isPrivate) {
                            parsedData.privatePhotos[index] = uploadedUrl;
                        } else {
                            parsedData.publicPhotos[index] = uploadedUrl;
                        }
                        await AsyncStorage.setItem('UserData', JSON.stringify(parsedData));
                    }

                    // Now update the state again with the uploaded URL
                    setPhotos(prevState => {
                        const updatedPhotos = { ...prevState };
                        updatedPhotos[type][index] = uploadedUrl;
                        return updatedPhotos;
                    });

                    // Call backend to update the user profile
                    await handleSubmit(); // Ensures backend sync with latest photos

                    Toast.show('Photo uploaded successfully!', Toast.SHORT);
                } catch (error) {
                    console.error('Error uploading photo:', error);
                } finally {
                    // Stop uploading for this index
                    setIsUploading(prevState => {
                        const newState = [...prevState];
                        newState[index] = false;
                        return newState;
                    });

                    // If no uploads are left, set the global upload state to false
                    if (!isUploading.some((uploading) => uploading)) {
                        setIsUploadingAny(false);
                    }
                }
            }
        });
    };








    const handleDeletePhoto = async (index, type, item) => {
        // Show loader during deletion
        // setIsDeleting(prevState => {
        //     const newState = [...prevState];
        //     newState[index] = true;
        //     return newState;
        // });

        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            url: item,
        };
        console.log('body of delete', body);

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
                console.log('parsed dataaaaa', parsedData);

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
                Toast.show(resp.data?.message, Toast.BOTTOM)
                //('Updated photos in AsyncStorage and UI');
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
            setLoading(true);
            await userHeading();
            setLoading(false);
        }
        setIsEditing(!isEditing);
    };


    const handleEditAbout = async () => {
        if (iseditabout) {
            setLoading1(true);
            await userAboutYou();
            setLoading1(false)
        }
        setEditAbout(!iseditabout);  // Toggle the edit state
    };

    const handleEditLookingFor = async () => {
        if (iseditlookingfor) {
            setLoading2(true)
            await userLookingFor(); // Save changes when exiting edit mode
            setLoading2(false)
        }
        setIsEditLookingFor(!iseditlookingfor);  // Toggle the edit state
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
            setLoading5(true)
            await userHobbies()
            setLoading5(false)
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

    const handleIsInterestedIn = async () => {
        if (isInterestedIn) {
            await userInterestedIn()
        }
        setIsInterestedIn(!isInterestedIn)
    }

    const handleInterestedInn = (hobby) => {
        setInterestedIn([hobby]);
        // if (interestedin?.includes(hobby)) {
        //     setInterestedIn(interestedin.filter((item) => item !== hobby));
        // } else if (interestedin.length < 0 ) {
        //     setInterestedIn([...interestedin, hobby]);
        // } else {
        //     Toast.show('You can select upto 7 Hobbies only', Toast.SHORT);
        // }
    };

    const handleIsRelationship = async () => {
        if (isrelationstatus) {
            setLoading3(true)
            await userRelationshipStatus()
            setLoading3(false)
        }
        setIsRelationStatus(!isrelationstatus)
    }

    const handleRelationStatus = (hobby) => {
        setRelationshipStatus(hobby)
    };

    const handleIsLuxeInterest = async () => {
        if (isluxinterest) {
            setLoading4(true)
            await userLuxuryIntrst()
            setLoading4(false)

        }
        setIsLuxInterest(!isluxinterest)
    }

    const handleLuxuryInterest = (hobby) => {
        if (luxinterest.includes(hobby)) {
            setLuxInterest(luxinterest.filter((item) => item !== hobby));
        } else if (luxinterest.length < 7) {
            setLuxInterest([...luxinterest, hobby]);
        } else {
            Toast.show('You can select upto 7 Hobbies only', Toast.SHORT);
        }
    };


    const handleIsAge = async () => {
        if (isagerange) {
            setLoading6(true)
            await userAgeRange()
            setLoading6(false)
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
            setLoading7(true)
            await userEthnicity()
            setLoading7(false)
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
            setLoading8(true)
            await userHeight()
            setLoading8(false)
        }
        setIsHeight(!isheight)
    }

    const handleIsBodyType = async () => {
        if (isbodytype) {
            setLoading9(true)
            await userBodyType()
            setLoading9(false)
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
            setLoading10(true)
            await userChildren()
            setLoading10(false)
        }
        setIsChild(!ischild)
    }

    const handleSmoking = (type) => {
        setSmoke(type);
    };

    const handleIsSmoke = async () => {
        if (issmoke) {
            setLoading11(true)
            await userSmoking()
            setLoading11(false)
        }
        setIsSmoke(!issmoke)
    }

    const handleAlcohol = (type) => {
        setDrinking(type);
    };

    const handleIsDrinking = async () => {
        if (isdrinking) {
            setLoading12(true)
            await userDrinking()
            setLoading12(false)
        }
        setIsDrinking(!isdrinking)
    }

    const handleEducation = (type) => {
        setEducation(type);
    };

    const handleIsEducation = async () => {
        if (iseducation) {
            setLoading13(true)
            await userEducation()
            setLoading13(false)
        }
        setIsEducation(!iseducation)
    }

    const handleWorkField = (type) => {
        setField(type);
    };

    const handleIsWork = async () => {
        if (isworkfield) {
            setLoading14(true)
            await userWorkField()
            setLoading14(false)
        }
        setIsWorkField(!isworkfield)
    }

    const handleNetWorth = (type) => {
        setNetWorth(type);
    };

    const handleIsNet = async () => {
        if (isnetworth) {
            setLoading15(true)
            await userNetWorthRange()
            setLoading15(false)
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
        //('body response of the profileheading', body);
        try {
            const resp = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers })
            if (resp?.status === 200) {
                const updatedUserData = { ...userdetails, myHeading: text };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                await getUserProfileData()
                //('User data updated in AsyncStorage');
            }
        } catch (error) {
            //('error from user profileheading', error);
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
        //('body response of the aboutyou', body);
        try {
            const resp = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers });
            if (resp?.status === 200) {
                const updatedUserData = { ...userdetails, aboutUsDescription: about };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                await getUserProfileData()
                //('User data updated in AsyncStorage');
            }
        } catch (error) {
            //('error from user aboutyou', error);
        }
    }


    const userLookingFor = async () => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 19,
            accountUpdatePayload: {
                preferences: {
                    aboutPartnerDescription: lookingfor
                }
            }
        }
        //('body response of the aboutyou', body);
        try {
            const resp = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers });
            if (resp?.status === 200) {
                const updatedUserData = { ...userdetails, preferences: { aboutPartnerDescription: lookingfor } };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                await getUserProfileData()
                //('User data updated in AsyncStorage');
            }
        } catch (error) {
            //('error from user aboutyou', error);
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
        //('body response of the hobbies', body);
        try {
            const resp = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers })
            // //('response from the hobbies',resp.data?.data);

            if (resp?.status === 200) {
                const updatedUserData = { ...userdetails, hobbies: userhobbies };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                getUserProfileData()
                // //('User data updated in AsyncStorage');
            }
        } catch (error) {
            //('error from user hobbies', error.response.data.message);
        }
    }

    const userInterestedIn = async () => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 18,
            accountUpdatePayload: {
                preferences: {
                    gender: interestedin
                }
            }
        }
        //('body response of the in who interested', body);
        try {
            const resp = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers })
            //('response from the who are you interested in', resp?.data?.data);

            if (resp?.status === 200) {
                const updatedUserData = { ...userdetails, preferences: { gender: interestedin } };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                getUserProfileData()
                //('User data updated in AsyncStorage');
            }
        } catch (error) {
            //('error from user hobbies', error);
        }
    }

    const userRelationshipStatus = async () => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 11,
            accountUpdatePayload: {
                currentRelationshipStatus: relationshipstatus
            }
        }
        // console.log('body response of the relationship', body);
        try {
            const resp = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers })
            // console.log('respponse from the relationshi', resp?.data?.data);

            if (resp?.status === 200) {
                const updatedUserData = { ...userdetails, currentRelationshipStatus: relationshipstatus };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                getUserProfileData()
                //('User data updated in AsyncStorage');
            }
        } catch (error) {
            //('error from user hobbies', error.response.data.message);
        }
    }

    const userLuxuryIntrst = async () => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            step: 15,
            accountUpdatePayload: {
                luxuryInterests: luxinterest
            }
        }
        //('body response of the hobbies', body);
        try {
            const resp = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers })
            if (resp?.status === 200) {
                const updatedUserData = { ...userdetails, luxuryInterests: luxinterest };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                await getUserProfileData()
                //('User data updated in AsyncStorage');
            }
        } catch (error) {
            //('error from user hobbies', error);
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
        //('body response of the ageRange', body);
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
                await getUserProfileData()
                //('User data updated in AsyncStorage');
            }
        } catch (error) {
            //('error from user ageRange', error);
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
        //('body response of the ethnicity', body);
        try {
            const resp = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers })
            if (resp?.status === 200) {
                const updatedUserData = { ...userdetails, ethnicity: selectethnicity };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                getUserProfileData()
                //('User data updated in AsyncStorage');
            }
        } catch (error) {
            //('error from user ethnicity', error);
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
                    value: height[1],
                    unit: unit
                }
            }
        }
        //('body response of the height', body);
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
                getUserProfileData()
                //('User data updated in AsyncStorage');
            }
        } catch (error) {
            //('error from user height', error.response.data.message);
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
        //('body response of the bodytype', body);
        try {
            const resp = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers })
            if (resp?.status === 200) {
                const updatedUserData = { ...userdetails, bodyType: selectedBodyType };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                getUserProfileData()
                //('User data updated in AsyncStorage');
            }
        } catch (error) {
            //('error from user bodytype', error);
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
        //('body response of the children', body);
        try {
            const resp = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers })
            if (resp?.status === 200) {
                const updatedUserData = { ...userdetails, children: child };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                await getUserProfileData()
                //('User data updated in AsyncStorage');
            }
        } catch (error) {
            //('error from user children', error.response.data.message);
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
        //('body response of the smoke', body);
        try {
            const resp = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers })
            if (resp?.status === 200) {
                const updatedUserData = { ...userdetails, smoke: smoke };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                getUserProfileData()
                //('User data updated in AsyncStorage');
            }
        } catch (error) {
            //('error from user smoke', error);
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
        //('body response of the drinking', body);
        try {
            const resp = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers })
            if (resp?.status === 200) {
                const updatedUserData = { ...userdetails, drink: drinking };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                getUserProfileData()
                //('User data updated in AsyncStorage');
            }
        } catch (error) {
            //('error from user drinking', error);
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
        //('body response of the highestEducation', body);
        try {
            const resp = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers })
            if (resp?.status === 200) {
                const updatedUserData = { ...userdetails, highestEducation: selecteducation };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                getUserProfileData()
                //('User data updated in AsyncStorage');
            }
        } catch (error) {
            //('error from user highestEducation', error);
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
        //('body response of the workField', body);
        try {
            const resp = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers })
            if (resp?.status === 200) {
                const updatedUserData = { ...userdetails, workField: workfield };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                getUserProfileData()
                //('User data updated in AsyncStorage');
            }
        } catch (error) {
            //('error from user workField', error);
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
        //('body response of the networth', body);
        try {
            const resp = await axios.put(`auth/update-account/${userdetails?._id}`, body, { headers })
            if (resp?.status === 200) {
                const updatedUserData = { ...userdetails, netWorthRange: networth };
                await AsyncStorage.setItem('UserData', JSON.stringify(updatedUserData));
                getUserProfileData()
                //('User data updated in AsyncStorage');
            }
        } catch (error) {
            //('error from user networth', error);
        }
    }


    const handleInputChange = (text, type) => {
        // Check for emojis, extra spaces, and double quotes
        const extraSpacesPattern = /\s+/g;
        const doubleQuotesPattern = /"/g;

        if (extraSpacesPattern.test(text)) {
            // Toast.show('Extra Space cannot be use.', Toast.BOTTOM)
        } else if (doubleQuotesPattern.test(text)) {
            Toast.show('DoubleQuotes cannot be use.', Toast.BOTTOM)
        }

        // Remove emojis, extra spaces, and double quotes

        const noExtraSpaces = text.replace(extraSpacesPattern, ' ')
        const noDoubleQuotes = noExtraSpaces.replace(doubleQuotesPattern, '');

        // Update the state based on the field type
        if (type === 'aboutYou') {
            setAbout(noDoubleQuotes);
        } else if (type === 'catchyHeadline') {
            setText(noDoubleQuotes);
        } else if (type === 'aboutPartner') {
            setLookingfor(noDoubleQuotes);
        }
    }

    let formattedHeight = '';
    if (userprofiledata?.tall?.unit === 'feet') {
        const totalInches = userprofiledata?.tall?.value / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        formattedHeight = `${feet} feet ${inches} inch`;
    } else {
        formattedHeight = `${userprofiledata?.tall?.value} cm`;
    }



    return (
        <View style={styles.main}>
            <TouchableOpacity style={{ flexDirection: 'row', marginTop: 20, marginLeft: 16 }} onPress={() => navigation.goBack('')}>
                <Image source={images.back} style={{ height: 20, width: 20, top: 8 }} />
                <Text style={{ marginLeft: 10, fontFamily: POPPINSRFONTS.medium, fontSize: 23 }}>Profile</Text>
            </TouchableOpacity>
            <View style={styles.cont}>
                <Image source={{ uri: userdetails?.profilePicture }} style={styles.profile} />
                <Text style={styles.txt}>{userdetails?.userName?.charAt(0).toUpperCase() + userdetails?.userName?.slice(1)}, {userdetails?.age}</Text>
            </View>
            <View style={styles.cont1}>
            </View>
            <Text style={[styles.completionText, { marginLeft: 16 }]}>{Math.round(userdetails?.profileCompletion)}% Profile Completion</Text>

            <Text style={styles.txt1}>Complete your profile to make it visible to others.</Text>
            <ScrollView>
                <View style={styles.cont2}>
                    <TouchableOpacity onPress={() => setSelectedButton('Public Photo')}>
                        <View style={[styles.cont3, { right: 20 }]}>
                            <View style={{ flexDirection: 'row' }}>
                                <Image source={images.publicp} style={[styles.img, { tintColor: selectedButton === 'Public Photo' ? '#916008' : 'black' }]} />
                                <Text style={[styles.txt2, { color: selectedButton === 'Public Photo' ? '#916008' : 'black' }]}>
                                    Public Photos
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSelectedButton('Private Photo')}>
                        <View style={styles.cont3}>
                            <View style={{ flexDirection: 'row' }}>
                                <Image source={images.privatep2} style={[styles.img1, { tintColor: selectedButton === 'Private Photo' ? '#916008' : 'black' }]} />
                                <Text style={[styles.txt3, { color: selectedButton === 'Private Photo' ? '#916008' : 'black' }]}>
                                    Private Photos
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {selectedButton === 'Public Photo' ? (
                    <View style={styles.photoGrid}>
                        {photos.public.map((photo, index) => renderItem(photo, index, 'public', userprofiledata?.publicPhotos && userprofiledata.publicPhotos.includes(photo)))}
                        <TouchableOpacity
                            style={styles.addMorePhotoButton}
                            onPress={() => handlePhotoSelection('public')}
                        >
                            {/* <Text style={styles.addMoreText}>+ Add More</Text> */}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.photoGrid}>
                        {photos.private.map((photo, index) => renderItem(photo, index, 'private', userprofiledata?.privatePhotos && userprofiledata.privatePhotos.includes(photo)))}
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
                <Text style={styles.txt5}>Verify your profile to enhance trust and ensure a secure dating experience.</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Verification')} style={{ borderWidth: 1, height: 40, width: '80%', borderRadius: 5, alignSelf: 'center', justifyContent: 'center', backgroundColor: '#916008', borderColor: '#916008', marginTop: 20 }}>
                    <Text style={{ textAlign: 'center', fontSize: 16, color: 'white', fontFamily: 'Poppins-SemiBold' }}>Verify Yourself</Text>
                </TouchableOpacity>

                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: PLAYFAIRFONTS.bold, fontSize: 25 }]}>Heading</Text>
                    <TouchableOpacity onPress={handleEditSave} disabled={loading}>
                        {isEditing === false ? (
                            <Image
                                source={images.edit}
                                style={{ height: 25, width: 25, tintColor: 'grey' }}
                            />
                        ) : loading ? (
                            <ActivityIndicator size="small" color="white" style={styles.cont8} />
                        ) : (
                            <View style={styles.cont8}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                </View>
                {isEditing === true ?
                    <TextInput
                        style={[styles.txt7, { marginTop: 10, borderWidth: isEditing === true ? 1 : null }]}
                        value={text}
                        editable={isEditing}
                        scrollEnabled={true}
                        multiline={true}
                        onChangeText={(text) => handleInputChange(text, 'catchyHeadline')}
                    />
                    :
                    null}

                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: PLAYFAIRFONTS.bold, fontSize: 25 }]}>About</Text>
                    <TouchableOpacity onPress={handleEditAbout} disabled={loading1}>
                        {iseditabout === false ? (
                            <Image
                                source={images.edit}
                                style={{ height: 25, width: 25, tintColor: 'grey' }}
                            />
                        ) : loading1 ? (
                            <ActivityIndicator size="small" color="white" style={styles.cont8} />
                        ) : (
                            <View style={styles.cont8}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
                {iseditabout === true ?
                    <TextInput
                        style={[styles.txt7, { marginTop: 10, borderWidth: iseditabout === true ? 1 : null }]}
                        value={about}
                        editable={iseditabout}
                        scrollEnabled={true}
                        multiline={true}
                        onChangeText={(text) => handleInputChange(text, 'aboutYou')}
                    />
                    :
                    null}

                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: PLAYFAIRFONTS.bold, fontSize: 25 }]}>Describe your perfect match<Text style={{ color: '#DDDDDD', fontFamily: 'Poppins-Regular', fontSize: 12 }}>   {userprofiledata?.preferences?.aboutPartnerDescription === undefined || userprofiledata?.preferences?.aboutPartnerDescription === null || userdetails?.preferences?.aboutPartnerDescription?.length === 0 ? 'Skipped' : null}</Text></Text>
                    <TouchableOpacity onPress={handleEditLookingFor} disabled={loading2}>
                        {iseditlookingfor === false ? (
                            <Image
                                source={userprofiledata?.preferences?.aboutPartnerDescription === undefined || userprofiledata?.preferences?.aboutPartnerDescription === null || userprofiledata?.preferences?.aboutPartnerDescription?.length === 0 ? images.plus : images.edit}
                                style={{ height: 25, width: 25, tintColor: 'grey' }}
                            />
                        ) : loading2 ? (
                            <ActivityIndicator size="small" color="white" style={styles.cont8} />
                        ) : (
                            <View style={styles.cont8}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
                {iseditlookingfor === true ?
                    <TextInput
                        style={[styles.txt7, { borderWidth: iseditlookingfor === true ? 1 : null }]}
                        value={lookingfor}
                        multiline={true}
                        onChangeText={(text) => handleInputChange(text, 'aboutPartner')}
                        editable={iseditlookingfor}
                    /> : null}

                {iseditlookingfor != true ?
                    <View style={{ borderWidth: 1, width: '90%', alignSelf: 'center', borderRadius: 5, borderColor: userprofiledata?.preferences?.aboutPartnerDescription === undefined || userprofiledata?.preferences?.aboutPartnerDescription === null || userprofiledata?.preferences?.aboutPartnerDescription?.length === 0 ? 'red' : '#DDDDDD', justifyContent: 'center', marginTop: 10 }}>
                        <Text style={{ paddingLeft: 20, color: '#7A7A7A', fontSize: 14, fontFamily: POPPINSRFONTS.regular, paddingRight: 10 }}>{userprofiledata?.preferences?.aboutPartnerDescription}</Text>
                    </View> : null}


                {/* <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: PLAYFAIRFONTS.bold,fontSize:25 }]}>Location</Text>
                </View> */}
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

                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: PLAYFAIRFONTS.bold, fontSize: 25 }]}>Who are you interested in</Text>
                    {/* <TouchableOpacity onPress={handleIsInterestedIn}>
                        {isInterestedIn === false ?
                            <Image
                                source={images.edit}
                                style={{ height: 25, width: 25, tintColor: 'grey' }}
                            />
                            :
                            <View style={[styles.cont8, { top: 3 }]}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        }
                    </TouchableOpacity> */}
                </View>
                {isInterestedIn === true ?
                    <View style={styles.bodyTypeContainer}>
                        {inwhointerested.map((hobby) => (
                            <TouchableOpacity
                                key={hobby}
                                style={[
                                    styles.bodyTypeButton,
                                    interestedin?.includes(hobby) && styles.selectedBodyTypeButton,
                                ]}
                                onPress={() => handleInterestedInn(hobby)}
                            >
                                <Text
                                    style={[
                                        styles.bodyTypeText,
                                        interestedin?.includes(hobby) && styles.selectedBodyTypeText,
                                    ]}
                                >
                                    {hobby}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View> : null}
                {isInterestedIn != true ?
                    <View style={{ borderWidth: 1, height: 40, width: '90%', alignSelf: 'center', borderRadius: 5, borderColor: '#DDDDDD', justifyContent: 'center', marginTop: 10 }}>
                        <Text style={{ paddingLeft: 20, color: '#7A7A7A', fontSize: 14, fontFamily: POPPINSRFONTS.regular, top: 3 }}>{userprofiledata?.preferences?.gender}</Text>
                    </View> : null}


                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: PLAYFAIRFONTS.bold, fontSize: 25 }]}>Relationship status</Text>
                    <TouchableOpacity onPress={handleIsRelationship} disabled={loading3}>
                        {isrelationstatus === false ? (
                            <Image
                                source={images.edit}
                                style={{ height: 25, width: 25, tintColor: 'grey' }}
                            />
                        ) : loading3 ? (
                            <ActivityIndicator size="small" color="white" style={styles.cont8} />
                        ) : (
                            <View style={[styles.cont8, { top: 3 }]}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
                {isrelationstatus === true ?
                    <View style={styles.bodyTypeContainer}>
                        {statusR.map((hobby) => (
                            <TouchableOpacity
                                key={hobby}
                                style={[
                                    styles.bodyTypeButton,
                                    relationshipstatus.includes(hobby) && styles.selectedBodyTypeButton,
                                ]}
                                onPress={() => handleRelationStatus(hobby)}
                            >
                                <Text
                                    style={[
                                        styles.bodyTypeText,
                                        relationshipstatus.includes(hobby) && styles.selectedBodyTypeText,
                                    ]}
                                >
                                    {hobby}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View> : null}

                {isrelationstatus != true ?
                    <View style={{ borderWidth: 1, height: 40, width: '90%', alignSelf: 'center', borderRadius: 5, borderColor: '#DDDDDD', justifyContent: 'center', marginTop: 10 }}>
                        <Text style={{ paddingLeft: 20, color: '#7A7A7A', fontSize: 14, fontFamily: POPPINSRFONTS.regular, top: 3 }}>{userprofiledata?.currentRelationshipStatus}</Text>
                    </View> : null}

                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: PLAYFAIRFONTS.bold, fontSize: 25 }]}>Luxe Interests</Text>
                    <TouchableOpacity onPress={handleIsLuxeInterest} disabled={loading4}>
                        {isluxinterest === false ? (
                            <Image
                                source={images.edit}
                                style={{ height: 25, width: 25, tintColor: 'grey' }}
                            />
                        ) : loading4 ? (
                            <ActivityIndicator size="small" color="white" style={styles.cont8} />
                        ) : (
                            <View style={[styles.cont8, { top: 3 }]}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
                {isluxinterest === true ?
                    <View style={styles.bodyTypeContainer}>
                        {interests.map((hobby) => (
                            <TouchableOpacity
                                key={hobby}
                                style={[
                                    styles.bodyTypeButton,
                                    luxinterest.includes(hobby) && styles.selectedBodyTypeButton,
                                ]}
                                onPress={() => handleLuxuryInterest(hobby)}
                            >
                                <Text
                                    style={[
                                        styles.bodyTypeText,
                                        luxinterest.includes(hobby) && styles.selectedBodyTypeText,
                                    ]}
                                >
                                    {hobby}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View> : null}

                {isluxinterest != true ?
                    <View style={{ borderWidth: 1, width: '90%', alignSelf: 'center', borderRadius: 5, borderColor: '#DDDDDD', justifyContent: 'center', marginTop: 10 }}>
                        <Text style={{ paddingLeft: 20, color: '#7A7A7A', fontSize: 14, fontFamily: POPPINSRFONTS.regular, top: 3 }}>{userprofiledata?.luxuryInterests?.join(', ')}</Text>
                    </View> : null}

                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: PLAYFAIRFONTS.bold, fontSize: 25 }]}>Hobbies</Text>
                    <TouchableOpacity onPress={handleHobbie} disabled={loading5}>
                        {isHobbies === false ? (
                            <Image
                                source={images.edit}
                                style={{ height: 25, width: 25, tintColor: 'grey' }}
                            />
                        ) : loading5 ? (
                            <ActivityIndicator size="small" color="white" style={styles.cont8} />
                        ) : (
                            <View style={[styles.cont8, { top: 3 }]}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        )}
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

                {isHobbies != true ?
                    <View style={{ borderWidth: 1, width: '90%', alignSelf: 'center', borderRadius: 5, borderColor: '#DDDDDD', justifyContent: 'center', marginTop: 10 }}>
                        <Text style={{ paddingLeft: 20, color: '#7A7A7A', fontSize: 14, fontFamily: POPPINSRFONTS.regular, top: 3 }}>{userprofiledata?.hobbies?.join(', ')}</Text>
                    </View> : null}

                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: PLAYFAIRFONTS.bold, fontSize: 25 }]}>Age Preferences</Text>
                    <TouchableOpacity onPress={handleIsAge} disabled={loading6}>
                        {isagerange === false ? (
                            <Image
                                source={images.edit}
                                style={{ height: 25, width: 25, tintColor: 'grey' }}
                            />
                        ) : loading6 ? (
                            <ActivityIndicator size="small" color="white" style={styles.cont8} />
                        ) : (
                            <View style={[styles.cont8, { top: 3 }]}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
                {isagerange === true ?
                    <View >
                        <View style={styles.ageRangeContainer}>
                            <Text style={styles.ageRangeText}>
                                {ageRange[0]} - {ageRange[1] === 70 ? '70+' : ageRange[1]}
                            </Text>
                        </View>
                        <View style={{ marginLeft: 20 }}>
                            <MultiSlider
                                values={ageRange}
                                sliderLength={width * 0.8}
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
                                customMarker={() => (
                                    <View style={styles.markerStyle} />
                                )}
                            />
                        </View>
                    </View>
                    : null}

                {isagerange != true ?
                    <View style={{ borderWidth: 1, height: 50, width: '90%', alignSelf: 'center', borderRadius: 5, borderColor: '#DDDDDD', justifyContent: 'center', marginTop: 10 }}>
                        <Text style={{ paddingLeft: 20, color: '#7A7A7A', fontSize: 14, fontFamily: POPPINSRFONTS.regular, top: 3 }}>{userprofiledata?.preferences?.ageRange?.min} - {userprofiledata?.preferences?.ageRange?.max}</Text>
                    </View> : null}


                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: PLAYFAIRFONTS.bold, fontSize: 25 }]}>Ethnicity</Text>
                    <TouchableOpacity onPress={handleIsEthni} disabled={loading7}>
                        {isethnicity === false ? (
                            <Image
                                source={images.edit}
                                style={{ height: 25, width: 25, tintColor: 'grey' }}
                            />
                        ) : loading7 ? (
                            <ActivityIndicator size="small" color="white" style={styles.cont8} />
                        ) : (
                            <View style={[styles.cont8, { top: 3 }]}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        )}
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

                {isethnicity != true ?
                    <View style={{ borderWidth: 1, height: 50, width: '90%', alignSelf: 'center', borderRadius: 5, borderColor: '#DDDDDD', justifyContent: 'center', marginTop: 10 }}>
                        <Text style={{ paddingLeft: 20, color: '#7A7A7A', fontSize: 14, fontFamily: POPPINSRFONTS.regular, top: 3 }}>{userprofiledata?.ethnicity}</Text>
                    </View> : null}

                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: PLAYFAIRFONTS.bold, fontSize: 25 }]}>Height</Text>
                    <TouchableOpacity onPress={handleIsHeight} disabled={loading8}>
                        {isheight === false ? (
                            <Image
                                source={images.edit}
                                style={{ height: 25, width: 25, tintColor: 'grey' }}
                            />
                        ) : loading8 ? (
                            <ActivityIndicator size="small" color="white" style={styles.cont8} />
                        ) : (
                            <View style={[styles.cont8, { top: 3 }]}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        )}
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
                                style={[styles.toggleButton, unit === 'feet' && styles.activeButton]}
                                onPress={() => setUnit('feet')}
                            >
                                <Text style={[styles.toggleText, unit === 'feet' && styles.activeText]}>feet</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.heightText}>
                            {unit === 'cm' ? `${height[1]} cm` : convertToFeetInch(height[1])}
                        </Text>
                        <View style={{ alignSelf: 'center' }}>
                            <MultiSlider
                                values={height}
                                sliderLength={width * 0.8}
                                onValuesChange={(values) => setHeight(values)}
                                min={122}
                                max={236}
                                step={1}
                                snapped
                                selectedStyle={{ backgroundColor: "#916008" }}
                                trackStyle={{
                                    height: 6,
                                }}
                                unselectedStyle={{ backgroundColor: "#E0E0E0" }}
                                customMarker={() => <View style={styles.markerStyle} />}
                            />
                        </View>
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

                    </View> : null}

                {isheight != true ?
                    <View style={{ borderWidth: 1, height: 50, width: '90%', alignSelf: 'center', borderRadius: 5, borderColor: '#DDDDDD', justifyContent: 'center', marginTop: 10 }}>
                        <Text style={{ paddingLeft: 20, color: '#7A7A7A', fontSize: 14, fontFamily: POPPINSRFONTS.regular, top: 3 }}>
                            {userdetails?.tall?.value} {userdetails?.tall?.unit === 'cm' ? 'cm' : 'feet'}
                        </Text>

                    </View> : null}

                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: PLAYFAIRFONTS.bold, fontSize: 25 }]}>Body Type</Text>
                    <TouchableOpacity onPress={handleIsBodyType} disabled={loading9}>
                        {isbodytype === false ? (
                            <Image
                                source={images.edit}
                                style={{ height: 25, width: 25, tintColor: 'grey' }}
                            />
                        ) : loading9 ? (
                            <ActivityIndicator size="small" color="white" style={styles.cont8} />
                        ) : (
                            <View style={[styles.cont8, { top: 3 }]}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        )}
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


                {isbodytype != true ?
                    <View style={{ borderWidth: 1, height: 50, width: '90%', alignSelf: 'center', borderRadius: 5, borderColor: '#DDDDDD', justifyContent: 'center', marginTop: 10 }}>
                        <Text style={{ paddingLeft: 20, color: '#7A7A7A', fontSize: 14, fontFamily: POPPINSRFONTS.regular, top: 3 }}>{userprofiledata?.bodyType}</Text>
                    </View> : null}

                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: PLAYFAIRFONTS.bold, fontSize: 25 }]}>Children<Text style={{ color: '#DDDDDD', fontFamily: 'Poppins-Regular' }}>   {userprofiledata?.children === undefined || userprofiledata?.children === null || userprofiledata?.children?.length === 0 ? 'Skipped' : null}</Text></Text>
                    <TouchableOpacity onPress={handleIsChild} disabled={loading10}>
                        {ischild === false ? (
                            <Image
                                source={userprofiledata?.children === undefined || userprofiledata?.children === null || userprofiledata?.children?.length === 0 ? images.plus : images.edit}
                                style={{ height: 25, width: 25, tintColor: 'grey' }}
                            />
                        ) : loading10 ? (
                            <ActivityIndicator size="small" color="white" style={styles.cont8} />
                        ) : (
                            <View style={[styles.cont8, { top: 3 }]}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        )}
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
                {ischild != true ?
                    <View style={{ borderWidth: 1, height: 50, width: '90%', alignSelf: 'center', borderRadius: 5, borderColor: userprofiledata?.children === undefined || userprofiledata?.children === null || userprofiledata?.children?.length === 0 ? 'red' : '#DDDDDD', justifyContent: 'center', marginTop: 10 }}>
                        <Text style={{ paddingLeft: 20, color: '#7A7A7A', fontSize: 14, fontFamily: POPPINSRFONTS.regular, top: 3 }}>{userprofiledata?.children}</Text>
                    </View> : null}

                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: PLAYFAIRFONTS.bold, fontSize: 25 }]}>Do you smoke?</Text>
                    <TouchableOpacity onPress={handleIsSmoke} disabled={loading11}>
                        {issmoke === false ? (
                            <Image
                                source={images.edit}
                                style={{ height: 25, width: 25, tintColor: 'grey' }}
                            />
                        ) : loading11 ? (
                            <ActivityIndicator size="small" color="white" style={styles.cont8} />
                        ) : (
                            <View style={[styles.cont8, { top: 3 }]}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        )}
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

                {issmoke != true ?
                    <View style={{ borderWidth: 1, height: 50, width: '90%', alignSelf: 'center', borderRadius: 5, borderColor: '#DDDDDD', justifyContent: 'center', marginTop: 10 }}>
                        <Text style={{ paddingLeft: 20, color: '#7A7A7A', fontSize: 14, fontFamily: POPPINSRFONTS.regular, top: 3 }}>{userprofiledata?.smoke}</Text>
                    </View> : null}

                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: PLAYFAIRFONTS.bold, fontSize: 25 }]}>Do you drink?</Text>
                    <TouchableOpacity onPress={handleIsDrinking} disabled={loading12}>
                        {isdrinking === false ? (
                            <Image
                                source={images.edit}
                                style={{ height: 25, width: 25, tintColor: 'grey' }}
                            />
                        ) : loading12 ? (
                            <ActivityIndicator size="small" color="white" style={styles.cont8} />
                        ) : (
                            <View style={[styles.cont8, { top: 3 }]}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        )}
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

                {isdrinking != true ?
                    <View style={{ borderWidth: 1, height: 50, width: '90%', alignSelf: 'center', borderRadius: 5, borderColor: '#DDDDDD', justifyContent: 'center', marginTop: 10 }}>
                        <Text style={{ paddingLeft: 20, color: '#7A7A7A', fontSize: 14, fontFamily: POPPINSRFONTS.regular, top: 3 }}>{userprofiledata?.drink}</Text>
                    </View> : null}

                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: PLAYFAIRFONTS.bold, fontSize: 25 }]}>Education</Text>
                    <TouchableOpacity onPress={handleIsEducation} disabled={loading13}>
                        {iseducation === false ? (
                            <Image
                                source={images.edit}
                                style={{ height: 25, width: 25, tintColor: 'grey' }}
                            />
                        ) : loading13 ? (
                            <ActivityIndicator size="small" color="white" style={styles.cont8} />
                        ) : (
                            <View style={[styles.cont8, { top: 3 }]}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        )}
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

                {iseducation != true ?
                    <View style={{ borderWidth: 1, height: 50, width: '90%', alignSelf: 'center', borderRadius: 5, borderColor: '#DDDDDD', justifyContent: 'center', marginTop: 10 }}>
                        <Text style={{ paddingLeft: 20, color: '#7A7A7A', fontSize: 14, fontFamily: POPPINSRFONTS.regular, top: 3 }}>{userprofiledata?.highestEducation}</Text>
                    </View> : null}

                <View style={styles.cont6}>
                    <Text style={[styles.txt6, { fontFamily: PLAYFAIRFONTS.bold, fontSize: 25 }]}>Profession<Text style={{ color: '#DDDDDD', fontFamily: 'Poppins-Regular' }}>   {userprofiledata?.workField === undefined || userprofiledata?.workField === null || userprofiledata?.workField?.length === 0 ? 'Skipped' : null}</Text></Text>
                    <TouchableOpacity onPress={handleIsWork} disabled={loading14}>
                        {isworkfield === false ? (
                            <Image
                                source={userprofiledata?.workField === undefined || userprofiledata?.workField === null || userprofiledata?.workField?.length === 0 ? images.plus : images.edit}
                                style={{ height: 25, width: 25, tintColor: 'grey' }}
                            />
                        ) : loading14 ? (
                            <ActivityIndicator size="small" color="white" style={styles.cont8} />
                        ) : (
                            <View style={[styles.cont8, { top: 3 }]}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        )}
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

                {isworkfield != true ?
                    <View style={{ borderWidth: 1, height: 50, width: '90%', alignSelf: 'center', borderRadius: 5, borderColor: userprofiledata?.workField === undefined || userprofiledata?.workField === null || userprofiledata?.workField?.length === 0 ? 'red' : '#DDDDDD', justifyContent: 'center', marginTop: 10 }}>
                        <Text style={{ paddingLeft: 20, color: '#7A7A7A', fontSize: 14, fontFamily: POPPINSRFONTS.regular, top: 3 }}>{userprofiledata?.workField}</Text>
                    </View> : null}

                <View style={[styles.cont6, { marginBottom: 20 }]}>
                    <Text style={[styles.txt6, { fontFamily: PLAYFAIRFONTS.bold, fontSize: 25 }]}>Net worth<Text style={{ color: '#DDDDDD', fontFamily: 'Poppins-Regular' }}>   {userprofiledata?.netWorthRange === undefined || userprofiledata?.netWorthRange === null || userprofiledata?.netWorthRange?.length === 0 ? 'Skipped' : null}</Text></Text>
                    <TouchableOpacity onPress={handleIsNet} disabled={loading15}>
                        {isnetworth === false ? (
                            <Image
                                source={userprofiledata?.netWorthRange === undefined || userprofiledata?.netWorthRange === null || userprofiledata?.netWorthRange?.length === 0 ? images.plus : images.edit}
                                style={{ height: 25, width: 25, tintColor: 'grey' }}
                            />
                        ) : loading15 ? (
                            <ActivityIndicator size="small" color="white" style={styles.cont8} />
                        ) : (
                            <View style={[styles.cont8, { top: 3 }]}>
                                <Text style={{ textAlign: 'center', color: 'white' }}>Save</Text>
                            </View>
                        )}
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

                {isnetworth != true ?
                    <View style={{ borderWidth: 1, height: 50, width: '90%', alignSelf: 'center', borderRadius: 5, borderColor: userprofiledata?.netWorthRange === undefined || userprofiledata?.netWorthRange === null || userprofiledata?.netWorthRange?.length === 0 ? 'red' : '#DDDDDD', justifyContent: 'center', marginBottom: 50 }}>
                        <Text style={{ paddingLeft: 20, color: '#7A7A7A', fontSize: 14, fontFamily: POPPINSRFONTS.regular, top: 3 }}>{userprofiledata?.netWorthRange}</Text>
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
        fontFamily: GARAMOND.bold,
        fontSize: 30,
        bottom: 3
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
        fontSize: 14,
    },
    cont2: {
        height: 35,
        width: '50%',
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
        marginTop: 10,
        justifyContent: 'center'
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
        height: 15,
        width: 15,
        tintColor: 'white',
        alignSelf: 'center',
    },
    cont4: {
        borderWidth: 1,
        height: 25,
        width: 25,
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
        fontFamily: PLAYFAIRFONTS.bold,
        fontSize: 25,
        marginLeft: 10
    },
    txt5: {
        marginLeft: 16,
        marginRight: 16,
        textAlign: 'center',
        marginTop: 10,
        fontFamily: POPPINSRFONTS.regular

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
        fontSize: 25,
        fontFamily: PLAYFAIRFONTS.bold,
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
        fontFamily: POPPINSRFONTS.regular,
        color: 'black',
        borderWidth: 1,
        alignSelf: 'center',
        width: '90%',
        borderColor: '#DDDDDD',
        paddingLeft: 20,
        paddingRight: 10,
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
        // marginVertical: 30,

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


