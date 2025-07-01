import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, Image, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import images from "../../components/images";
import axios from 'axios';
import Toast from 'react-native-simple-toast';


const AnswerSecurityQstn = ({ navigation, route }) => {
    const [selectedQuestion, setSelectedQuestion] = useState('');
    const [answer, setAnswer] = useState(''); 
    const { email } = route.params;
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getSecurityQstn();
    }, []);

    const getSecurityQstn = async () => {
        try {
            const resp = await axios.get(`auth/get-security-questions/${email}`);
            console.log('response from the Get Security Qstn', resp.data.data);
            setQuestions(resp.data.data)
        } catch (error) {
            console.log('error from get security qstn', error.message);
        }
    };


    const verifySecurityQstn = async () => {
        if (selectedQuestion && answer.trim() !== '') {
            let body = {
                email: email,
                answers: [
                    {
                        questionId: selectedQuestion?.questionId,
                        question: selectedQuestion?.question,
                        answerHash: answer
                    },
                ]
            }
            console.log('Verification body:', body);
            setIsLoading(true);
            try {
                const resp = await axios.put('auth/check-security-question', body)
                console.log('response from the check security qstn', resp.data);
                Toast.show(resp?.data?.message, Toast.SHORT)
                navigation.navigate('CreatePassword', { id: resp?.data?.data?.user?._id });
            } catch (error) {
                console.log('error from the security check', error.response.data.message);
                Toast.show(error?.response?.data?.message, Toast.SHORT)

            } finally {
                setIsLoading(false);
            }

        } else {
            Toast.show('Select question to proceed', Toast.SHORT)
        }
    };


    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image source={images.back} style={styles.backIcon} />
            </TouchableOpacity>

            <Text style={styles.title}>Answer your</Text>
            <Text style={styles.subtitle}>Security Question</Text>

            <Text style={styles.description}>
                To ensure your account’s security, please answer for new password.
            </Text>

            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={selectedQuestion}
                    onValueChange={(itemValue) => setSelectedQuestion(itemValue)}
                    style={styles.picker}
                    mode="dropdown"
                >
                    <Picker.Item label="Select Question?" value="" />
                    {questions.map((question, index) => (
                        <Picker.Item
                            key={index}
                            label={question.question}
                            value={question} // Use the entire question object as value
                        />
                    ))}
                </Picker>
                <Image source={images.dropdown} style={styles.dropdownIcon} />
            </View>

            <TextInput
                style={styles.input}
                placeholder="Type your answer here"
                placeholderTextColor="#B0B0B0"
                value={answer}
                onChangeText={(text) => setAnswer(text)}
            />

            <View style={styles.cont4}>
                <TouchableOpacity onPress={verifySecurityQstn}>
                    {isLoading ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Text style={styles.txt12}>Continue</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
    },
    backIcon: {
        height: 20,
        width: 20,
        marginTop: 20,
    },
    title: {
        fontFamily: 'Poppins-Bold',
        fontSize: 28,
        color: '#000',
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: 'Poppins-Bold',
        fontSize: 28,
        color: '#000',
        textAlign: 'center',
        marginBottom: 10,
    },
    description: {
        fontFamily: 'Poppins-Medium',
        fontSize: 14,
        color: '#7B7B7B',
        textAlign: 'center',
        marginBottom: 30,
    },
    pickerContainer: {
        position: 'relative',
        borderWidth: 1,
        borderColor: '#E8E6EA',
        borderRadius: 8,
        marginBottom: 20,
        height: 50,
        justifyContent: 'center',
        backgroundColor: '#FFF',
    },
    picker: {
        color: '#000',
    },
    dropdownIcon: {
        position: 'absolute',
        right: 15,
        top: '50%',
        transform: [{ translateY: -12 }],
        width: 20,
        height: 20,
        tintColor: '#916008',
    },
    input: {
        borderWidth: 1,
        borderColor: '#E8E6EA',
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 50,
        color: '#000',
        fontFamily: 'Poppins-Regular',
        marginBottom: 40,
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
});

export default AnswerSecurityQstn;
