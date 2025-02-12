import React, { useState } from "react";
import { Text, View, TouchableOpacity, Image, StyleSheet, ScrollView } from "react-native";
import images from "../../../components/images";
import LinearGradient from "react-native-linear-gradient";
import RazorpayCheckout from 'react-native-razorpay';

const MembershipScreen = ({ navigation }) => {
    const [selectedButton, setSelectedButton] = useState("Monthly");

    return (
        <View style={styles.main}>
            <TouchableOpacity onPress={() => navigation.goBack("")}>
                <View style={styles.cont}>
                    <Image source={images.back} style={styles.back} />
                    <Text style={styles.txt}>Membership and Billing</Text>
                </View>
            </TouchableOpacity>


            <ScrollView horizontal={true} style={styles.scrollViewContainer}>
                {/* First Card */}
                <View style={styles.contentContainer}>
                    {selectedButton === "Monthly" && (
                        <LinearGradient
                            colors={["#916008", "#FFFFFF"]}
                            style={[styles.cardContainer, {}]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 0.7 }}
                        >
                            <Text style={styles.title}>Gold</Text>
                            <Text style={styles.price}>$100</Text>
                            <Text style={styles.perMonth}>per month</Text>

                            <TouchableOpacity style={styles.button} onPress={() => {
                                var options = {
                                    description: 'Credits towards consultation',
                                    image: 'https://i.imgur.com/3g7nmJC.jpg',
                                    currency: 'USD',
                                    key: 'rzp_test_0U87k8QQAqqeki',
                                    amount: 2000 * 100,
                                    name: 'AcadeCraft',
                                    order_id: '',
                                    prefill: {
                                        email: 'gaurav.kumar@example.com',
                                        contact: '9191919191',
                                        name: 'Gaurav Kumar'
                                    },
                                    theme: { color: '#53a20e' }
                                }
                                RazorpayCheckout.open(options).then((data) => {
                                    alert(`Success: ${data.razorpay_payment_id}`);
                                }).catch((error) => {
                                    alert(`Error: ${error.code} | ${error.description}`);
                                });
                            }}>
                                <Text style={styles.buttonText}>Upgrade to premium</Text>
                            </TouchableOpacity>
                            <Text>Features</Text>
                            <View style={styles.features}>
                                <View style={styles.featureItem}>
                                    <View style={styles.tickBox}>
                                        <Image source={images.tick1} style={styles.tickIcon} />
                                    </View>
                                    <Text style={styles.featureText}>Gold badge indicating premium status.</Text>
                                </View>
                                <View style={styles.featureItem}>
                                    <View style={styles.tickBox}>
                                        <Image source={images.tick1} style={styles.tickIcon} />
                                    </View>
                                    <Text style={styles.featureText}>Slightly increased profile visibility.</Text>
                                </View>
                                <View style={styles.featureItem}>
                                    <View style={styles.tickBox}>
                                        <Image source={images.tick1} style={styles.tickIcon} />
                                    </View>
                                    <Text style={styles.featureText}>Access to event invites for networking opportunities.</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    )}
                </View>

                {/* Second Card */}
                <View style={styles.contentContainer}>
                    {selectedButton === "Monthly" && (
                        <LinearGradient
                            colors={["silver", "white"]}
                            style={[styles.cardContainer, { backgroundColor: 'white', }]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 0.7 }}
                        >
                            <Text style={[styles.title, { color: 'black' }]}>Diamond</Text>
                            <Text style={styles.price}>$150</Text>
                            <Text style={styles.perMonth}>per month</Text>

                            <TouchableOpacity style={[styles.button, { backgroundColor: 'white', borderColor: 'silver', borderWidth: 1 }]} onPress={() => {
                                var options = {
                                    description: 'Credits towards consultation',
                                    image: 'https://i.imgur.com/3g7nmJC.jpg',
                                    currency: 'USD',
                                    key: 'rzp_test_0U87k8QQAqqeki',
                                    amount: 2000 * 100,
                                    name: 'AcadeCraft',
                                    order_id: '',
                                    prefill: {
                                        email: 'gaurav.kumar@example.com',
                                        contact: '9191919191',
                                        name: 'Gaurav Kumar'
                                    },
                                    theme: { color: '#53a20e' }
                                }
                                RazorpayCheckout.open(options).then((data) => {
                                    alert(`Success: ${data.razorpay_payment_id}`);
                                }).catch((error) => {
                                    alert(`Error: ${error.code} | ${error.description}`);
                                });
                            }}>
                                <Text style={[styles.buttonText, { color: 'black' }]}>Upgrade to premium</Text>
                            </TouchableOpacity>
                            <Text>Features</Text>

                            <View style={styles.features}>
                                <View style={styles.featureItem}>
                                    <View style={[styles.tickBox, { borderColor: 'black', backgroundColor: 'black' }]}>
                                        <Image source={images.tick1} style={styles.tickIcon} />
                                    </View>
                                    <Text style={[styles.featureText, { top: 8 }]}>Exclusive Diamond badge that signals wealth and status, highly visible to female members.</Text>
                                </View>
                                <View style={styles.featureItem}>
                                    <View style={[styles.tickBox, { borderColor: 'black', backgroundColor: 'black' }]}>
                                        <Image source={images.tick1} style={styles.tickIcon} />
                                    </View>
                                    <Text style={[styles.featureText, { top: 10 }]}>Top-tier profile placement in searches.</Text>
                                </View>
                                <View style={styles.featureItem}>
                                    <View style={[styles.tickBox, { borderColor: 'black', backgroundColor: 'black' }]}>
                                        <Image source={images.tick1} style={styles.tickIcon} />
                                    </View>
                                    <Text style={[styles.featureText, { top: 10 }]}>Priority invitations to luxury events and networking opportunities.</Text>
                                </View>
                                <View style={styles.featureItem}>
                                    <View style={[styles.tickBox, { borderColor: 'black', backgroundColor: 'black' }]}>
                                        <Image source={images.tick1} style={styles.tickIcon} />
                                    </View>
                                    <Text style={[styles.featureText, { top: 10 }]}>Profile verification and "Authenticity Star" for trustworthiness.</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    )}
                </View>
            </ScrollView>
            <View style={{ borderWidth: 0.5, borderColor: 'grey', marginLeft: 16, marginRight: 16, marginBottom: 20 }} />
            <View style={{ marginLeft: 16, marginRight: 16, marginBottom: 40 }}>
                <Text style={styles.txt1}>Please contact the <Text style={{ textDecorationLine: 'underline' }}>customer support</Text> for any questions regarding billing.</Text>
                <TouchableOpacity onPress={() => navigation.navigate('BillingHistory')}>
                    <Text style={styles.txt2}>Billing History</Text>
                </TouchableOpacity>
            </View>

        </View>
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
        // flex: 1,
        // alignItems: "center",
    },
    scrollViewContainer: {
        flexDirection: 'row',
        marginTop: 40,
        marginLeft: 16,
    },
    cardContainer: {
        width: 280,  // Adjust width to fit within screen size
        alignSelf: "center",
        borderRadius: 10,
        padding: 30,
        shadowOffset: { width: 0, height: 2 },
        marginVertical: 20,
        // height: 430,
        justifyContent: "space-between",
        // elevation: 3,
        // marginHorizontal: 10,  // Add horizontal margin to separate cards
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
        textAlign: "center",
        fontFamily: "Poppins-Bold",
    },
    perMonth: {
        fontSize: 14,
        color: "black",
        textAlign: "center",
        fontFamily: "Poppins-Regular",
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#916008",
        borderRadius: 25,
        paddingVertical: 10,
        alignSelf: "center",
        width: "100%",
        marginBottom: 20,
    },
    buttonText: {
        fontSize: 16,
        color: "#fff",
        textAlign: "center",
        fontFamily: "Poppins-Medium",
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
    tickBox: {
        borderWidth: 1,
        borderRadius: 100,
        height: 20,
        width: 20,
        justifyContent: 'center',
        backgroundColor: '#916008',
        borderColor: '#916008',
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
    }
});

export default MembershipScreen;
