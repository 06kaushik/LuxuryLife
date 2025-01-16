import React, { useState } from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity, ImageBackground } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { launchImageLibrary } from 'react-native-image-picker';
import DraggableFlatList from 'react-native-draggable-flatlist'; // For drag-and-drop functionality
import images from "../../components/images";  // Assuming your images are in this folder

const ViewProfile = () => {
    const profileCompletion = 0.49;
    const [selectedButton, setSelectedButton] = useState('Public Photo');
    const [photos, setPhotos] = useState({
        public: Array(6).fill(null),  // Initialize with 6 empty slots for public photos
        private: Array(6).fill(null)  // Initialize with 6 empty slots for private photos
    });
    const [userdetails, setUserDetails] = useState(null)
    const [isUploading, setIsUploading] = useState(false);






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
            setIsUploading(true);
            const response = await axios.post(endpoint, formData, {
                headers: {
                    Authorization: token,
                    'Content-Type': 'multipart/form-data',
                },
            });
            await new Promise((resolve) => setTimeout(resolve, 5000));  // Optional delay (you can adjust or remove it)
            setIsUploading(false);
            console.log(`Response from ${endpoint}:`, response.data);

            const uploadedUrl = response.data.data.url;
            console.log('Uploaded photo URL:', uploadedUrl);
            return uploadedUrl;
        } catch (error) {
            setIsUploading(false);
            console.error(`Error uploading to ${isPrivate ? 'private' : 'public'} endpoint:`, error.response?.data || error.message);
            throw error;
        }
    };



    const renderItem = (item, index, type, isResponsePhoto) => (
        <TouchableOpacity
            key={index}
            style={styles.photoBox}
            onPress={() => handlePhotoSelection(type)}
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
                        <ActivityIndicator style={styles.loader} size="large" color="red" />
                    )}
                </ImageBackground>
            ) : (
                <Image source={images.add} style={styles.addIcon} />
            )}
        </TouchableOpacity>
    );


    const handleEditSave = () => {
        if (isEditing) {
            Alert.alert('profile saved successfully')
        }
        setIsEditing(!isEditing);
    };

    const handleEditAbout = () => {
        if (iseditabout) {
            Alert.alert('about saved successfully')
        }
        setEditAbout(!iseditabout);
    };


    const handlePhotoSelection = async (index, type) => {
        const options = {
            mediaType: 'photo',
            quality: 1,
        };

        launchImageLibrary(options, async (response) => {
            if (!response.didCancel && !response.error && response.assets) {
                const newPhotoUri = response.assets[0].uri;

                // Check that photos[type] is initialized before updating it
                setPhotos((prevState) => {
                    const updatedPhotos = { ...prevState };

                    // Initialize type (public or private) if it doesn't exist
                    if (!updatedPhotos[type]) {
                        updatedPhotos[type] = Array(6).fill(null); // Initialize with 6 empty slots if undefined
                    }

                    updatedPhotos[type][index] = newPhotoUri; // Update the selected slot with the new photo URI

                    return updatedPhotos; // Return updated state
                });

                // Automatically upload the photo after selecting it
                try {
                    const isPrivate = index >= 6;  // Determine if it's a private photo based on index
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

                        console.log('Updated photos in AsyncStorage:', parsedData);
                    }
                } catch (error) {
                    console.error('Error uploading photo:', error);
                }
            } else {
                console.log('Photo selection was canceled or an error occurred');
            }
        });
    };

    const handleDeletePhoto = async (index, type, item) => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };
        let body = {
            url: item,
        };

        try {
            const resp = await axios.post('file/deleteByUrl', body, { headers });
            console.log('Response from the delete photo', resp.data);
            const data = await AsyncStorage.getItem('UserData');
            if (data) {
                const parsedData = JSON.parse(data);
                const updatedPublicPhotos = parsedData.publicPhotos.filter(
                    (photo) => photo !== item
                );
                parsedData.publicPhotos = updatedPublicPhotos;
                await AsyncStorage.setItem('UserData', JSON.stringify(parsedData));
                setPhotos((prevState) => {
                    const updatedPhotos = { ...prevState };
                    updatedPhotos.public[index] = null;
                    return updatedPhotos;
                });
                console.log('Updated photos in AsyncStorage and UI');
            }

        } catch (error) {
            console.log('Error from the delete photo', error);
        }
    };

    const handleRemovePhoto = (index, type) => {
        const updatedPhotos = { ...photos };
        updatedPhotos[type][index] = null;
        setPhotos(updatedPhotos);
    };

    return (
        <View style={styles.main}>
            <View style={styles.cont}>
                <Image source={images.profilePic} style={styles.profile} />
                <Text style={styles.txt}>Himanshu</Text>
            </View>
            <View style={styles.cont1}>
                <AnimatedCircularProgress
                    size={20}
                    width={4}
                    fill={profileCompletion * 100}
                    tintColor="#916008"
                    backgroundColor="#ffffff"
                    rotation={0}
                    lineCap="round"
                    strokeCap="round"
                />
                <Text style={styles.completionText}>{Math.round(profileCompletion * 100)}% Profile Completion</Text>
            </View>
            <Text style={styles.txt1}>Attention! Members can't interact with you!</Text>

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
});
