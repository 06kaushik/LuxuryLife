import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import images from "../../../components/images";
import { launchCamera } from 'react-native-image-picker';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from 'react-native-simple-toast';


const VerifySelfie = ({ navigation }) => {
    const [selfie, setSelfie] = useState(null);
    const [uploadedUrl, setUploadedUrl] = useState(null); // Store the uploaded URL
    const [isUploading, setIsUploading] = useState(false); // Loader state
    const userId = '677687b24cd0469415aa2c8a';

    const uploadPhoto = async (uri) => {
        const token = await AsyncStorage.getItem('verifcationToken');
        try {
            const formData = new FormData();
            formData.append('file', {
                uri,
                name: `selfie_${Date.now()}.jpg`,
                type: 'image/jpeg',
            });

            const response = await axios.post('file/upload', formData, {
                headers: {
                    Authorization: token,
                    'Content-Type': 'multipart/form-data',
                },
            });

            const uploadedUrl = response.data.data.url; // Assuming the URL is in `data.url`
            console.log('Uploaded photo URL:', uploadedUrl);
            setUploadedUrl(uploadedUrl); // Save the uploaded URL
            Alert.alert('Photo Uploaded, Now Click on Submit')

        } catch (error) {
            console.error('Error uploading file:', error.response?.data || error.message);
            Toast.show('Failed to upload the selfie. Please try again.', Toast.SHORT);
            throw error;
        }
    };

    const submitSelfie = async () => {
        if (!uploadedUrl) {
            Toast.show('Please upload a selfie before submitting.', Toast.SHORT);
            return;
        }
        const token = await AsyncStorage.getItem('verifcationToken');
        const payload = {
            step: 24,
            accountUpdatePayload: {
                realTimePicture: uploadedUrl,
            },
        };
        console.log('Submitting payload:', payload);

        try {
            const response = await axios.put(`auth/update-account/${userId}`, payload, {
                headers: {
                    Authorization: token,
                    'Content-Type': 'application/json',
                },
            });

            console.log('Selfie submitted successfully:', response.data);
            Toast.show('Selfie submitted successfully.', Toast.SHORT);
            navigation.navigate('AccountSetting'); // Navigate to success screen
        } catch (error) {
            console.error('Error submitting selfie:', error.response?.data || error.message);
            Toast.show('Failed to upload the selfie. Please try again.', Toast.SHORT);
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
                const uri = response.assets[0].uri; // Get the captured selfie URI
                setSelfie(uri); // Save the selfie URI
                setUploadedUrl(null); // Clear any previous uploaded URL
            } else if (response.error) {
                console.error('Camera error:', response.error);
            }
        });
    };

    const handleUpload = async () => {
        if (!selfie) {
            Toast.show('Please upload a selfie before submitting.', Toast.SHORT);
            return;
        }

        try {
            setIsUploading(true); // Show loader
            await uploadPhoto(selfie); // Upload selfie
            setIsUploading(false); // Hide loader
        } catch (error) {
            setIsUploading(false); // Hide loader on error
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
            <Text style={styles.txt1}>Verify Your Selfie Photo</Text>
            <Text style={styles.txt2}>
                We need to confirm it's really you! Follow these quick steps to complete the selfie verification.
            </Text>
            <TouchableOpacity onPress={handleTakeSelfie} disabled={isUploading}>
                {selfie ? (
                    <Image
                        source={{ uri: selfie }}
                        style={{ alignSelf: 'center', marginTop: 20, height: 264, width: 198, borderRadius: 5 }}
                    />
                ) : (
                    <Image source={images.selfie2} style={styles.img} />
                )}
            </TouchableOpacity>


            {isUploading && (
                <ActivityIndicator size="large" color="#916008" style={{ marginTop: 20 }} />
            )}

            {/* {selfie && !isUploading && (
                <TouchableOpacity onPress={handleTakeSelfie}>
                    <View style={styles.cont5}>
                        <Text style={styles.txt10}>Re-take</Text>
                    </View>
                </TouchableOpacity>
            )} */}

            <View style={styles.cont4}>
                {uploadedUrl ? (
                    <TouchableOpacity onPress={submitSelfie} disabled={isUploading}>
                        <Text style={styles.txt12}>Submit</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={handleUpload} disabled={isUploading}>
                        <Text style={styles.txt12}>Upload</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default VerifySelfie;

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "white",
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
        textAlign: 'center',
        color: '#383838',
        fontFamily: 'Poppins-Medium',
        fontSize: 20,
        marginTop: 40,
    },
    txt2: {
        fontFamily: 'Poppins-Regular',
        fontSize: 13,
        textAlign: 'center',
        color: '#7B7B7B',
        marginTop: 10,
    },
    img: {
        alignSelf: 'center',
        height: 240,
        width: 192,
        marginTop: 20,
    },
    cont4: {
        position: 'absolute',
        bottom: 20,
        width: '100%',
        borderWidth: 1,
        height: 50,
        alignSelf: 'center',
        borderRadius: 100,
        borderColor: "#916008",
        backgroundColor: '#916008',
        justifyContent: 'center',
    },
    txt12: {
        color: 'white',
        textAlign: 'center',
        fontSize: 15,
        fontFamily: 'Poppins-SemiBold',
    },
    cont5: {
        borderWidth: 1,
        borderRadius: 100,
        width: '100%',
        height: 47,
        justifyContent: 'center',
        borderColor: '#E0E2E9',
        backgroundColor: 'white',
        marginTop: 100,
    },
    txt10: {
        textAlign: 'center',
        color: '#5F3D23',
        fontSize: 15,
        fontFamily: 'Poppins-SemiBold',
    },
});
