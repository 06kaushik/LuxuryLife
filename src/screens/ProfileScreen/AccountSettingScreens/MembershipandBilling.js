import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, TextInput } from "react-native";
import images from "../../../components/images";
import LinearGradient from "react-native-linear-gradient";
import { usePaymentSheet, StripeProvider } from '@stripe/stripe-react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Modal from "react-native-modal";
import LottieView from 'lottie-react-native';
import Toast from 'react-native-simple-toast'

const MembershipScreen = ({ navigation }) => {

    const { initPaymentSheet, presentPaymentSheet, loading } = usePaymentSheet();
    const [selectedTab, setSelectedTab] = useState("Monthly");
    const [plans, setPlans] = useState([]);
    const [userdetails, setUserDetails] = useState(null);
    const [clientSecret, setClientSecret] = useState('')
    const [isModalVisible, setIsModalVisible] = useState(false);



    useEffect(() => {
        getPlans();
    }, []);

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

    const getPlans = async () => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = {
            Authorization: token,
        };
        try {
            const resp = await axios.get('payment/get-subscription', { headers });
            setPlans(resp.data);
        } catch (error) {
            console.log('error from the get plans', error?.response?.data?.message);
        }
    };

    const getPrice = (planType) => {
        const plan = plans.find(p => p.planType === planType && p.duration === selectedTab);
        return plan ? plan.price : 0;
    };

    const createSubscriptionIntent = async (planType) => {

        const token = await AsyncStorage.getItem('authToken');
        const headers = { Authorization: token };
        const price = getPrice(planType);

        if (price === 0) {
            Alert.alert('Invalid plan selected.');
            return;
        }

        const selectedPlan = plans.find(plan => plan.planType === planType && plan.duration === selectedTab);
        if (!selectedPlan) {
            Alert.alert('Plan details not found.');
            return;
        }

        const { _id: planId, priceId } = selectedPlan;

        const body = {
            userId: userdetails?._id,
            amount: price * 100,
            currency: "usd",
            planId,
            priceId,

        };
        console.log('body of create subscription', body);

        try {
            const response = await axios.post('payment/create-subscription-intent', body, { headers });
            console.log('response from the intent API', response.data);

            const { clientSecret, ephemeralKey, customerId } = response.data;
            setClientSecret(clientSecret)
            const { error } = await initPaymentSheet({
                customerId,
                customerEphemeralKeySecret: ephemeralKey,
                paymentIntentClientSecret: clientSecret,
                merchantDisplayName: 'Luxury Life',
                allowsDelayedPaymentMethods: true,
                returnURL: 'stripe-example://stripe-redirect',
            });
            console.log('error from initial', error);

            if (error) {
                Alert.alert(`Error code: ${error.code}`, error.message);
            } else {
                await buy(planType, clientSecret)
                await saveTransaction(planType, clientSecret)
            }
        } catch (err) {
            console.error('Error during subscription flow:', err.response.data.message);
            Alert.alert('Error', 'Something went wrong during payment initialization.');
        }
    };


    async function buy(planType, clientSecret) {
        // console.log('plan selected', planType);

        try {
            const { error } = await presentPaymentSheet();

            if (error) {
                Alert.alert(`Error code: ${error.code}`, error.message);
                return;
            }

            // Continue if payment successful
            const token = await AsyncStorage.getItem('authToken');
            const headers = { Authorization: token };
            const price = getPrice(planType);

            if (price === 0) {
                Alert.alert('Invalid plan selected.');
                return;
            }

            const selectedPlan = plans.find(plan => plan.planType === planType && plan.duration === selectedTab);
            console.log('selected plan', selectedPlan);

            if (!selectedPlan) {
                Alert.alert('Plan details not found.');
                return;
            }

            const { _id: planId, priceId } = selectedPlan;

            const paymentIntentId = clientSecret?.split('_secret_')[0];
            if (!paymentIntentId) {
                console.log("clientSecret not found or invalid");
                return;
            }

            const body = {
                amount: price * 100,
                email: userdetails?.email,
                name: '',
                paymentIntentId,
                planId,
                priceId,
                planType: selectedTab,
                userId: userdetails?._id,
            };
            console.log('bodyyyyy', body);


            const resp = await axios.post('payment/create-subscription', body, { headers });
            console.log('create-subscription API response:', resp.data);
            // Alert.alert('Success', 'Payment is successful!');
        } catch (err) {
            console.log('Unhandled error:', err);
            Alert.alert('Something went wrong', err?.message || 'Unknown error');
        }
    }

    const saveTransaction = async (planType, clientSecret) => {
        const token = await AsyncStorage.getItem('authToken');
        const headers = { Authorization: token };
        const price = getPrice(planType);

        if (price === 0) {
            Alert.alert('Invalid plan selected.');
            return;
        }

        const selectedPlan = plans.find(plan => plan.planType === planType && plan.duration === selectedTab);
        console.log('selected plan', selectedPlan);

        if (!selectedPlan) {
            Alert.alert('Plan details not found.');
            return;
        }

        const { _id: planId, priceId } = selectedPlan;

        const paymentIntentId = clientSecret?.split('_secret_')[0];
        if (!paymentIntentId) {
            console.log("clientSecret not found or invalid");
            return;
        }
        let body = {
            stripePaymentIntentId: paymentIntentId,
            planId: planId
        }
        try {
            const resp = await axios.post('payment/save-transaction', body, { headers })
            console.log('response from the save transaction', resp.data);
            setIsModalVisible(true);
        } catch (error) {
            console.log('error from save transaction', error.response.data.message);
        }

    }


    return (
        <StripeProvider publishableKey="pk_test_51KJBgYSF5FRCqQ9pslbdBB96ela3V4Hk0xVr92i11Iy5QhniB0EiJlzEgjcmvX0ikM7BFLdrhodTTBZEnuragxaK00OGjSQufP">

            <View style={styles.main}>
                <TouchableOpacity onPress={() => navigation.goBack("")}>
                    <View style={styles.cont}>
                        <Image source={images.back} style={styles.back} />
                        <Text style={styles.txt}>Membership and Billing</Text>
                    </View>
                </TouchableOpacity>
                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity onPress={() => setSelectedTab("Monthly")} style={[styles.tabButton, selectedTab === "Monthly" && styles.selectedTab]}>
                        <Text style={[styles.tabText, selectedTab === "Monthly" && styles.selectedTabText]}>Monthly</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSelectedTab("Quarterly")} style={[styles.tabButton, selectedTab === "Quarterly" && styles.selectedTab]}>
                        <Text style={[styles.tabText, selectedTab === "Quarterly" && styles.selectedTabText]}>Quarterly</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSelectedTab("Annually")} style={[styles.tabButton, selectedTab === "Annually" && styles.selectedTab]}>
                        <Text style={[styles.tabText, selectedTab === "Annually" && styles.selectedTabText]}>Annually</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView>
                    <ScrollView horizontal={true} style={styles.scrollViewContainer}>
                        {/* First Card - Gold */}
                        <View style={styles.contentContainer}>
                            {selectedTab && (
                                <LinearGradient
                                    colors={["#916008", "#FFFFFF"]}
                                    style={styles.cardContainer}
                                    start={{ x: 0, y: -1 }}
                                    end={{ x: 0, y: 0.7 }}
                                >
                                    <View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Image source={images.stars} style={{ height: 40, width: 40 }} />
                                            <View >
                                                <Text style={{ color: '#18181B', fontSize: 20, fontFamily: 'Poppins-SemiBold', left: 10 }}>Gold Plan</Text>
                                                <Text style={{ fontSize: 12, left: 10 }}>Essential perks for{'\n'}a premium dating experience.</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.price}>${getPrice('Gold')}/<Text style={styles.perMonth}>{selectedTab.toLowerCase()}</Text></Text>
                                        <TouchableOpacity onPress={() => createSubscriptionIntent('Gold')} style={styles.button}>
                                            <Text style={styles.buttonText}>Get Started</Text>
                                        </TouchableOpacity>

                                        <View style={{ marginTop: 20 }}>
                                            <Text style={{ fontSize: 16, fontFamily: 'Poppins-SemiBold', }}>All features:</Text>
                                            <View>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                                                    <Text>Instant chat access with matches</Text>
                                                    <View style={styles.tickBoxContainer}>
                                                        <View style={styles.tickBox}>
                                                            <Image source={images.tick1} style={styles.tickIcon} />
                                                        </View>
                                                    </View>
                                                </View>

                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                                                    <Text>Hide your join date for privacy</Text>
                                                    <View style={styles.tickBoxContainer}>
                                                        <View style={styles.tickBox}>
                                                            <Image source={images.tick1} style={styles.tickIcon} />
                                                        </View>
                                                    </View>
                                                </View>

                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                                                    <Text>Control your search visibility</Text>
                                                    <View style={styles.tickBoxContainer}>
                                                        <View style={styles.tickBox}>
                                                            <Image source={images.tick1} style={styles.tickIcon} />
                                                        </View>
                                                    </View>
                                                </View>


                                            </View>
                                        </View>
                                    </View>
                                </LinearGradient>
                            )}
                        </View>

                        {/* Second Card - Diamond */}
                        <View style={styles.contentContainer}>
                            {selectedTab && (
                                <LinearGradient
                                    colors={["#FF4A4A", "white"]}
                                    style={[styles.cardContainer, { backgroundColor: 'white', }]}
                                    start={{ x: 0, y: -1 }}
                                    end={{ x: 0, y: 0.7 }}
                                >
                                    <View>
                                        <View style={{ flexDirection: 'row' }}>
                                            <Image source={images.crown} style={{ height: 40, width: 40 }} />
                                            <View >
                                                <Text style={{ color: '#18181B', fontSize: 20, fontFamily: 'Poppins-SemiBold', left: 10 }}>Luxury Plan</Text>
                                                <Text style={{ fontSize: 12, left: 10 }}>Exclusive access to elite{'\n'}connections.</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.price}>${getPrice('Diamond')}/<Text style={styles.perMonth}>{selectedTab.toLowerCase()}</Text></Text>
                                        <TouchableOpacity onPress={() => createSubscriptionIntent('Diamond')} style={[styles.button, { backgroundColor: '#B53535', borderColor: '#B53535' }]}>
                                            <Text style={[styles.buttonText, { color: 'white' }]}>Get Started</Text>
                                        </TouchableOpacity>

                                        <View style={{ marginTop: 20 }}>
                                            <Text style={{ fontSize: 16, fontFamily: 'Poppins-SemiBold', }}>All features:</Text>
                                            <View>
                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                                                    <Text>Instant chat access with matches</Text>
                                                    <View style={styles.tickBoxContainer}>
                                                        <View style={[styles.tickBox, { backgroundColor: '#B53535', borderColor: '#B53535' }]}>
                                                            <Image source={images.tick1} style={styles.tickIcon} />
                                                        </View>
                                                    </View>
                                                </View>

                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                                                    <Text>Hide your join date for privacy</Text>
                                                    <View style={styles.tickBoxContainer}>
                                                        <View style={[styles.tickBox, { backgroundColor: '#B53535', borderColor: '#B53535' }]}>
                                                            <Image source={images.tick1} style={styles.tickIcon} />
                                                        </View>
                                                    </View>
                                                </View>

                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                                                    <Text>Control your search visibility</Text>
                                                    <View style={styles.tickBoxContainer}>
                                                        <View style={[styles.tickBox, { backgroundColor: '#B53535', borderColor: '#B53535' }]}>
                                                            <Image source={images.tick1} style={styles.tickIcon} />
                                                        </View>
                                                    </View>
                                                </View>

                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                                                    <Text>Private Browsing</Text>
                                                    <View style={styles.tickBoxContainer}>
                                                        <View style={[styles.tickBox, { backgroundColor: '#B53535', borderColor: '#B53535' }]}>
                                                            <Image source={images.tick1} style={styles.tickIcon} />
                                                        </View>
                                                    </View>
                                                </View>

                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                                                    <Text>Attractive members respond{'\n'}faster to luxury members</Text>
                                                    <View style={styles.tickBoxContainer}>
                                                        <View style={[styles.tickBox, { backgroundColor: '#B53535', borderColor: '#B53535' }]}>
                                                            <Image source={images.tick1} style={styles.tickIcon} />
                                                        </View>
                                                    </View>
                                                </View>

                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                                                    <Text>Luxury badge makes you stand{'\n'}out everywhere</Text>
                                                    <View style={styles.tickBoxContainer}>
                                                        <View style={[styles.tickBox, { backgroundColor: '#B53535', borderColor: '#B53535' }]}>
                                                            <Image source={images.tick1} style={styles.tickIcon} />
                                                        </View>
                                                    </View>
                                                </View>

                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                                                    <Text>Attractive members know you're truthful and serious</Text>
                                                    <View style={styles.tickBoxContainer}>
                                                        <View style={[styles.tickBox, { backgroundColor: '#B53535', borderColor: '#B53535' }]}>
                                                            <Image source={images.tick1} style={styles.tickIcon} />
                                                        </View>
                                                    </View>
                                                </View>

                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                                                    <Text>More chances of connection</Text>
                                                    <View style={styles.tickBoxContainer}>
                                                        <View style={[styles.tickBox, { backgroundColor: '#B53535', borderColor: '#B53535' }]}>
                                                            <Image source={images.tick1} style={styles.tickIcon} />
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </LinearGradient>
                            )}
                        </View>
                    </ScrollView>
                </ScrollView>
                <View style={{ borderWidth: 0.5, borderColor: 'grey', marginLeft: 16, marginRight: 16, }} />
                <TouchableOpacity style={{ marginLeft: 16, marginRight: 16, }} onPress={() => Linking.openURL('https://www.luxurylife.ai/support')}>
                    <Text style={styles.txt1}>Please contact the <Text style={{ textDecorationLine: 'underline' }}>customer support</Text> for any questions regarding billing.</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('BillingHistory')}>
                    <Text style={styles.txt2}>Billing History</Text>
                </TouchableOpacity>

                <Modal isVisible={isModalVisible} style={styles.modal}>
                    <View style={styles.overlay}>
                        <View style={styles.modalContent}>
                            <LottieView
                                source={require('../../../assets/payment1.json')}
                                autoPlay
                                loop
                                style={{ width: 200, height: 200 }}
                            />
                            <Text style={styles.pay}>Your payment was successful!</Text>
                            <Text style={[styles.pay, { color: 'white', fontFamily: 'Poppins-Regular' }]}>Successfully paid</Text>

                            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                                <View style={styles.submitButton}>
                                    <Text style={styles.submitText}>Explore Search</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>


        </StripeProvider>
    );
};


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
    contentContainer: {
        marginRight: 20,
    },
    scrollViewContainer: {
        flexDirection: 'row',
        marginTop: 20,
        marginLeft: 16,
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    tabButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderBottomWidth: 2,
    },
    selectedTab: {
        borderBottomColor: '#916008',
    },
    tabText: {
        fontSize: 16,
        color: 'black',
    },
    selectedTabText: {
        color: '#916008',
        fontWeight: 'bold',
    },
    cardContainer: {
        width: 280,
        alignSelf: "center",
        borderRadius: 10,
        padding: 30,
        shadowOffset: { width: 0, height: 2 },
        marginVertical: 20,
        justifyContent: "space-between",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#916008",
        textAlign: "center",
        marginBottom: 10,
        fontFamily: "Poppins-Bold",
    },
    price: {
        fontSize: 32,
        fontWeight: "bold",
        color: "black",
        // textAlign: "center",
        fontFamily: "Poppins-Bold",
        marginTop: 20
    },
    perMonth: {
        fontSize: 14,
        color: "grey",
        textAlign: "center",
        // fontFamily: "Poppins-Regular",
        marginBottom: 20,
    },
    button: {
        borderColor: "#916008",
        borderRadius: 5,
        paddingVertical: 10,
        alignSelf: "center",
        width: "100%",
        borderWidth: 1,
        marginTop: 20,

    },
    buttonText: {
        fontSize: 16,
        color: "#916008",
        textAlign: "center",
        fontFamily: "Poppins-SemiBold",
    },
    features: {
        marginTop: 10,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    featureText: {
        fontSize: 14,
        color: "black",
        fontFamily: "Poppins-Regular",
        marginLeft: 10,
    },
    tickBoxContainer: {
        flex: 1,
        alignItems: 'flex-end',  // Ensures the tick box is aligned to the right
    },
    tickBox: {
        borderWidth: 1,
        borderRadius: 100,
        height: 20,
        width: 20,
        justifyContent: 'center',
        backgroundColor: '#916008',
        borderColor: '#916008',
        left: 20
    },
    tickIcon: {
        height: 11,
        width: 11,
        alignSelf: 'center',
        tintColor: "white",
    },

    txt1: {
        textAlign: 'center',
        color: '#3C4043',
        fontFamily: 'Poppins-Medium',
        fontSize: 16
    },
    txt2: {
        color: '#3C4043',
        fontFamily: 'Poppins-Bold',
        fontSize: 16,
        marginTop: 20,
        textAlign: 'center',
        textDecorationLine: 'underline'
    },
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
    },
    modalContent: {
        // backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pay: {
        textAlign: 'center',
        color: 'green',
        fontFamily: 'Poppins-Bold',
        fontSize: 16,
        marginTop: 20,
    },
    submitButton: {
        backgroundColor: "#916008",
        borderRadius: 25,
        paddingVertical: 10,
        width: "100%",
        marginTop: 20,
    },
    submitText: {
        fontSize: 16,
        color: "white",
        textAlign: "center",
        fontFamily: "Poppins-Medium",
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        margin: 0,
    },
});

export default MembershipScreen;