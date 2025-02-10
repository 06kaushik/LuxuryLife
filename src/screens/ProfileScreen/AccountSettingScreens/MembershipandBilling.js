import React, { useState } from "react";
import { Text, View, TouchableOpacity, Image, StyleSheet } from "react-native";
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

            <View style={styles.cont2}>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                    ]}
                    onPress={() => setSelectedButton("Monthly")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            { color: selectedButton === "Monthly" ? "#916008" : "black" },
                        ]}
                    >
                        Monthly
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tabButton,
                    ]}
                    onPress={() => setSelectedButton("Quarterly")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            { color: selectedButton === "Quarterly" ? "#916008" : "#000" },
                        ]}
                    >
                        Quarterly
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tabButton,
                    ]}
                    onPress={() => setSelectedButton("Yearly")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            { color: selectedButton === "Yearly" ? "#916008" : "#000" },
                        ]}
                    >
                        Yearly
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.contentContainer}>
                {selectedButton === "Monthly" && (
                    <View>
                        <LinearGradient
                            colors={["#916008", "#FFFFFF"]}
                            style={styles.cardContainer}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 0.7 }}
                        >
                            <Text style={styles.title}>Gold</Text>
                            <Text style={styles.price}>$180</Text>
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
                                    // handle success
                                    alert(`Success: ${data.razorpay_payment_id}`);
                                }).catch((error) => {
                                    // handle failure
                                    alert(`Error: ${error.code} | ${error.description}`);
                                });
                            }}>
                                <Text style={styles.buttonText}>Upgrade to premium</Text>
                            </TouchableOpacity>
                            <Text>Features</Text>
                            <View style={styles.features}>
                                <Text style={styles.featureItem}>
                                    • Gold badge indicating premium status.
                                </Text>
                                <Text style={styles.featureItem}>
                                    • Slightly increased profile visibility.
                                </Text>
                                <Text style={styles.featureItem}>
                                    • Access to event invites for networking opportunities.
                                </Text>
                            </View>
                        </LinearGradient>
                        <View style={{ marginLeft: 16, marginRight: 16, }}>
                            <Text style={styles.txt1}>Please contact the <Text style={{ textDecorationLine: 'underline' }}>customer support</Text> for any questions regarding billing.</Text>
                            <Text style={styles.txt2}>Billing History</Text>
                        </View>
                    </View>
                )}
                {selectedButton === "Quarterly" && (
                    <Text style={styles.contentText}>Quarterly</Text>
                )}
                {selectedButton === "Yearly" && (
                    <Text style={styles.contentText}>Yearly</Text>
                )}
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
    cont2: {
        height: 40,
        width: "90%",
        alignSelf: "center",
        borderRadius: 25,
        marginTop: 40,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderColor: "grey",
        padding: 2,
    },
    tabButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        borderRadius: 20,
        marginHorizontal: 5,
    },
    tabText: {
        fontSize: 16,
        fontFamily: "Poppins-SemiBold",
        textAlign: "center",
    },
    contentContainer: {
        flex: 1,
        marginTop: 20,
        alignItems: "center",
    },
    contentText: {
        fontSize: 16,
        fontFamily: "Poppins-Regular",
        color: "#000",
    },
    cardContainer: {
        width: "90%",
        alignSelf: "center",
        borderRadius: 10,
        padding: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        marginVertical: 20,
        height: 450,
        justifyContent: "space-between",
        // borderWidth: 5,
        borderColor: '#916008',
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
        fontSize: 16,
        color: "black",
        fontFamily: "Poppins-Regular",
        marginBottom: 5,
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
        marginTop: 20
    }
});

export default MembershipScreen;
