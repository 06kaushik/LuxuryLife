import React, { useState,useEffect} from "react";
import { Text, View, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import images from "../../../components/images";
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Toast from 'react-native-simple-toast';


const VerifyIdentity = ({ navigation }) => {
    const [photos, setPhotos] = useState([]);
    const [photos1, setPhotos1] = useState([]);
    const [loading, setLoading] = useState(false);
    const [canSelectBack, setCanSelectBack] = useState(false);
    const [userdetails, setUserDetails] = useState(null)


    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const data = await AsyncStorage.getItem('UserData');
                if (data !== null) {
                    const parsedData = JSON.parse(data);
                    setUserDetails(parsedData);

                }
            } catch (error) {
                console.log('Error fetching user data:', error);
            }
        };
        fetchUserDetails();
    }, []);

    const uploadPhoto = async (uri) => {
        const token = await AsyncStorage.getItem('authToken');
        try {
            const formData = new FormData();
            formData.append('file', {
                uri,
                name: `photo_${Date.now()}.jpg`,
                type: 'image/jpeg',
            });

            const endpoint = 'file/upload';
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
            console.error('Error uploading file:', error.response?.data || error.message);
            Toast.show('Failed to upload the file. Please try again.', Toast.SHORT);
            throw error;
        }
    };

    const uploadDocuments = async (frontUrl, backUrl) => {
        const token = await AsyncStorage.getItem('authToken');
        try {
            const payload = {
                documents: {
                    front: frontUrl,
                    back: backUrl,
                },
            };

            const response = await axios.put(`account/upload-document/${userdetails?._id}`, payload, {
                headers: {
                    Authorization: token,
                    'Content-Type': 'application/json',
                },
            });
            console.log('Documents uploaded successfully:', response.data);
            Toast.show('Dcoument Uploaded Successfully', Toast.SHORT);

        } catch (error) {
            console.error('Error uploading documents:', error.response?.data || error.message);
            Toast.show('Failed to upload the documents.', Toast.SHORT);

            throw error;
        }
    };

    const handlePhotoSelection = async (index, setter, isBackPhoto = false) => {
        if (isBackPhoto && !canSelectBack) {
            Toast.show('Please upload the front photo first.', Toast.SHORT);
            return;
        }
        const options = {
            mediaType: 'photo',
            quality: 1,
        };
        launchImageLibrary(options, async (response) => {
            if (!response.didCancel && !response.error && response.assets) {
                const uri = response.assets[0].uri;

                try {
                    setLoading(true);
                    const uploadedUrl = await uploadPhoto(uri);
                    const updatedPhotos = [...(setter === setPhotos ? photos : photos1)];
                    updatedPhotos[index] = uploadedUrl;
                    setter(updatedPhotos);

                    if (!isBackPhoto) {
                        setCanSelectBack(true);
                    }
                } catch (error) {
                    console.error('Error in photo selection and upload:', error.message);
                } finally {
                    setLoading(false);
                }
            } else if (response.error) {
                console.error('Image selection error:', response.error);
            }
        });
    };

    const handleSubmit = async () => {
        try {
            if (photos[0] && photos1[0]) {
                await uploadDocuments(photos[0], photos1[0]);
                navigation.navigate('IdentitySuccess');
            } else {
                Toast.show('Please upload both front and back photos.', Toast.SHORT);
            }
        } catch (error) {
            console.error('Error during submission:', error.message);
            Toast.show(error.message, Toast.SHORT);

        }
    };

    return (
        <View style={styles.main}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <View style={styles.cont}>
                    <Image source={images.back} style={styles.backIcon} />
                    <Text style={styles.txt}>Verification</Text>
                </View>
            </TouchableOpacity>
            <Text style={styles.txt1}>Verify Your Identity</Text>
            <Text style={styles.txt2}>
                We need to confirm it's really you! Follow these quick steps to complete the selfie verification.
            </Text>
            <ScrollView>
                <View style={[styles.cont1, { borderStyle: photos[0] ? null : 'dashed' }]}>
                    <TouchableOpacity onPress={() => handlePhotoSelection(0, setPhotos)}>
                        {photos[0] ? (
                            <Image
                                source={{ uri: photos[0] }}
                                style={{
                                    height: '100%',
                                    width: '100%',
                                    resizeMode: 'cover',
                                    borderRadius: 12,
                                }}
                                resizeMode="cover"
                            />
                        ) : (
                            <Image source={images.plus} style={styles.img1} />
                        )}
                    </TouchableOpacity>
                </View>
                <Text style={styles.txt3}>Front</Text>

                {loading && (
                    <ActivityIndicator size="large" color="#916008" style={{ marginTop: 20 }} />
                )}

                <View style={[styles.cont1, { borderStyle: photos1[0] ? null : 'dashed' }]}>
                    <TouchableOpacity onPress={() => handlePhotoSelection(0, setPhotos1, true)}>
                        {photos1[0] ? (
                            <Image
                                source={{ uri: photos1[0] }}
                                style={{
                                    height: '100%',
                                    width: '100%',
                                    resizeMode: 'cover',
                                    borderRadius: 12,
                                }}
                                resizeMode="cover"
                            />
                        ) : (
                            <Image source={images.plus} style={styles.img1} />
                        )}
                    </TouchableOpacity>
                </View>
                <Text style={styles.txt3}>Back</Text>
            </ScrollView>

            <View style={styles.cont4}>
                <TouchableOpacity onPress={handleSubmit}>
                    <Text style={styles.txt12}>Submit</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default VerifyIdentity;

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: 'white',
        paddingHorizontal: 20,
    },
    backIcon: {
        height: 20,
        width: 20,
        marginTop: 10,
    },
    cont: {
        flexDirection: 'row',
        marginTop: 40,
    },
    txt: {
        fontSize: 20,
        fontFamily: 'Poppins-Medium',
        marginLeft: 12,
        top: 5,
    },
    txt1: {
        color: '#3C4043',
        fontFamily: 'Poppins-Bold',
        fontSize: 24,
        marginTop: 40,
    },
    txt2: {
        color: '#3C4043',
        fontFamily: 'Poppins-Regular',
        fontSize: 10,
    },
    cont1: {
        borderWidth: 2,
        borderStyle: 'dashed',
        height: 155,
        width: '80%',
        alignSelf: 'center',
        marginTop: 20,
        justifyContent: 'center',
        borderColor: '#C4C4C4',
        borderRadius: 14,
    },
    img1: {
        height: 45,
        width: 45,
        alignSelf: 'center',
        tintColor: '#C4C4C4',
    },
    txt3: {
        textAlign: 'center',
        marginTop: 10,
        color: '#3C4043',
        fontFamily: 'Poppins-Medium',
    },
    cont4: {
        position: 'absolute',
        bottom: 20,
        width: '100%',
        borderWidth: 1,
        height: 50,
        alignSelf: 'center',
        borderRadius: 100,
        borderColor: '#916008',
        backgroundColor: '#916008',
        justifyContent: 'center',
    },
    txt12: {
        color: 'white',
        textAlign: 'center',
        fontSize: 15,
        fontFamily: 'Poppins-SemiBold',
    },
});
