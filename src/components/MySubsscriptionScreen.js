import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, TextInput, Linking, TouchableWithoutFeedback } from "react-native";
import images from "./images";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import moment from 'moment'
import LottieView from 'lottie-react-native';



const MySubscription = ({ navigation }) => {

    const [userdetails, setUserDetails] = useState(null)
    const [plandetails, setPlanDetails] = useState(null)
    console.log('plan details', plandetails);

    const [isLoading, setIsLoading] = useState(true);



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

    useEffect(() => {
        getSubscriptionDetail()
    }, [userdetails])


    const getSubscriptionDetail = async () => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = { Authorization: token };
        let body = {
            isStatusCheck: false
        }

        try {
            setIsLoading(true);
            const resp = await axios.post('payment/get-user-subscription-details', body, { headers });
            setPlanDetails(resp?.data?.data);
        } catch (error) {
            console.log('error from get details subscription', error?.response.data.message || error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                <LottieView
                    source={require('../assets/loaderr.json')} // 👈 Update the correct path
                    autoPlay
                    loop
                    style={{ height: 100, width: 100 }}
                />
            </View>
        );
    }


    return (

        <View style={styles.main}>
            <TouchableOpacity onPress={() => navigation.goBack('')}>
                <View style={styles.cont}>
                    <Image source={images.back} style={styles.back} />
                    <Text style={styles.txt}>Membership and Billing</Text>
                </View>
            </TouchableOpacity>
            <Text style={styles.txt2}>My Subscription</Text>
            <Text style={styles.txt3}>Manage your plan, update payment details, or explore exclusive upgrades.</Text>

            <ScrollView>
                <View style={styles.cont3}>
                    <View style={styles.cont4}>
                        <Text style={styles.txt13}>Current Active Plan</Text>
                        <View style={styles.cont5}>
                            <Image style={styles.img} source={images.tick1} />
                        </View>
                    </View>

                    <View style={styles.cont1}>
                        <Image source={plandetails?.subscriptionPlanId?.planType === 'Gold' ? images.stars : images.crown} style={{ height: 40, width: 40 }} />
                        <Text style={styles.txt4}>{plandetails?.subscriptionPlanId?.name}</Text>
                        <Text style={[styles.txt4, { left: 5 }]}>{plandetails?.subscriptionPlanId?.price}</Text>
                        <Text style={[styles.txt4, { left: 8 }]}>{plandetails?.subscriptionPlanId?.currency?.toUpperCase()}/{plandetails?.duration === 'Monthly' ? 'month' : plandetails?.duration === 'Quarterly' ? 'quarter' : plandetails?.duration === 'Annually' ? 'year' : null}</Text>
                    </View>

                    <View style={styles.cont2}>
                        <Text style={styles.txt5}>Next Payment:  <Text style={styles.txt7}>{plandetails?.isActive === false ? plandetails?.subscriptionStatus : moment(plandetails?.endDate).format('MMMM Do, YYYY')}</Text></Text>
                    </View>
                    <View style={{ marginLeft: 20, marginTop: 20 }}>
                        <Text style={styles.txt6}>Current Benefits</Text>
                        {plandetails?.subscriptionPlanId?.features?.map((feature, index) => (
                            <View key={index} style={styles.txt10}>
                                <Image source={images.tick1} style={styles.txt8} />
                                <Text style={styles.txt9}>{feature}</Text>
                            </View>
                        ))}

                    </View>

                    {userdetails?.country === 'India' ?
                        <TouchableOpacity style={styles.txt11} onPress={() => navigation.navigate('RazorPay')}>
                            <Text style={styles.txt12}>Switch to a higher plan</Text>
                        </TouchableOpacity>
                        :
                        <TouchableOpacity style={styles.txt11} onPress={() => navigation.navigate('Paypal')}>
                            <Text style={styles.txt12}>Switch to a higher plan</Text>
                        </TouchableOpacity>
                    }

                </View>
                {userdetails?.country === 'India' ?
                    <TouchableWithoutFeedback onPress={() => navigation.navigate('RazorPay')} style={{ marginBottom: 50 }}>
                        <Image source={images.discount} style={styles.banner} />
                    </TouchableWithoutFeedback>
                    :
                    <TouchableWithoutFeedback onPress={() => navigation.navigate('Paypal')} style={{ marginBottom: 50 }}>
                        <Image source={images.discount} style={styles.banner} />
                    </TouchableWithoutFeedback>
                }

            </ScrollView>

            <TouchableOpacity style={{ marginLeft: 16, marginRight: 16 }} onPress={() => Linking.openURL('https://www.luxurylife.ai/support')}>
                <Text style={styles.txt1}>Please contact the <Text style={{ textDecorationLine: 'underline' }}>customer support</Text> for any questions regarding billing.</Text>
            </TouchableOpacity>

        </View>
    )
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "white",
    },
    back: {
        height: 20,
        width: 20,
        marginTop: 10,
    },
    cont: {
        marginRight: 20,
        marginLeft: 20,
        marginTop: 30,
        flexDirection: "row",
    },
    txt: {
        color: "black",
        marginLeft: 10,
        fontFamily: "Poppins-Medium",
        fontSize: 20,
        marginTop: 5,
    },
    txt1: {
        textAlign: 'center',
        color: '#3C4043',
        fontFamily: 'Poppins-Medium',
        fontSize: 16
    },
    txt2: {
        color: 'black',
        fontSize: 36,
        marginLeft: 20,
        marginTop: 30,
        fontFamily: 'Playfair_9pt-Bold'
    },
    txt3: {
        color: 'black',
        fontFamily: "Poppins-Regular",
        marginTop: 30,
        marginLeft: 20,
        marginRight: 20
    },
    cont1: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginLeft: 20,
        elevation: 2
    },
    txt4: {
        color: 'black',
        fontFamily: 'Poppins-Bold',
        fontSize: 16,
        top: 2
    },
    cont2: {
        borderWidth: 1,
        height: 30,
        width: '90%',
        alignSelf: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        borderColor: '#ebd8ad',
        backgroundColor: '#ebd8ad',
        marginTop: 20
    },
    txt5: {
        color: 'black',
        fontFamily: 'Poppins-Bold',
        fontSize: 14,
        textAlign: 'center'
    },
    txt6: {
        color: 'black',
        fontSize: 14,
        fontFamily: "Poppins-SemiBold"
    },
    txt7: {
        color: 'black',
        fontSize: 14,
        fontFamily: 'Poppins-Regular'
    },
    txt8: {
        height: 15,
        width: 15,
        right: 5,
        top: 3
    },
    txt9: {
        color: '#3C4043',
        fontFamily: 'Poppins-Regular'
    },
    txt10: {
        flexDirection: 'row',
        margin: 5
    },
    txt11: {
        marginLeft: 20,
        marginTop: 30
    },
    txt12: {
        color: '#3361FF',
        fontSize: 16,
        fontFamily: 'Poppins-Bold'
    },
    banner: {
        width: 354,
        alignSelf: 'center',
        height: 388,
        marginTop: 20
    },
    cont3: {
        borderWidth: 1,
        width: '90%',
        alignSelf: 'center',
        marginTop: 30,
        // height: 450,
        borderRadius: 8,
        borderColor: '#DDDDDD',


    },
    cont4: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginTop: 20
    },
    txt13: {
        color: '#3C4043',
        fontFamily: "Poppins-Regular",
        fontSize: 14
    },
    cont5: {
        borderWidth: 1,
        height: 20,
        width: 20,
        borderRadius: 100,
        justifyContent: 'center',
        backgroundColor: 'black'
    },
    img: {
        height: 13,
        width: 13,
        tintColor: 'white',
        alignSelf: 'center'
    }
})


export default MySubscription