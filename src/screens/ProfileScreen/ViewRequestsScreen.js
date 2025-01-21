import React from "react";
import { Text, View, TouchableOpacity, StyleSheet, Image } from "react-native";
import images from "../../components/images";

const ViewRequestScreen = ({ navigation }) => {
    return (
        <View style={styles.main}>
            <TouchableOpacity onPress={() => navigation.goBack("")}>
                <View style={styles.cont}>
                    <Image source={images.back} style={styles.back} />
                    <Text style={styles.txt}>Request Private Photos</Text>
                </View>
            </TouchableOpacity>

            <View style={styles.cont1}>
                {[...Array(2)].map((_, index) => (
                    <View
                        key={index}
                        style={{
                            borderWidth: 1,
                            height: 80,
                            width: "90%",
                            alignSelf: "center",
                            borderRadius: 5,
                            borderColor: "#D9D9D9",
                            padding: 10,
                            justifyContent: "center",
                            marginTop: index > 0 ? 20 : 0,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Image
                                    source={images.profilePic}
                                    style={{
                                        height: 60,
                                        width: 60,
                                        borderRadius: 30,
                                        marginRight: 10,
                                    }}
                                />
                                <View style={{ marginTop: 5 }}>
                                    <Text
                                        style={{
                                            fontFamily: "Poppins-Medium",
                                            fontSize: 16,
                                            color: "#000",
                                        }}
                                    >
                                        StunningMiss,33
                                    </Text>
                                    <Text
                                        style={{
                                            fontFamily: "Poppins-Regular",
                                            fontSize: 14,
                                            color: "#7B7B7B",
                                        }}
                                    >
                                        New Delhi
                                    </Text>
                                </View>
                            </View>

                            <View style={{ alignItems: "flex-end" }}>
                                <Text
                                    style={{
                                        fontFamily: "Poppins-Regular",
                                        fontSize: 12,
                                        color: "#7B7B7B",
                                        marginBottom: 5,
                                    }}
                                >
                                    2 hours
                                </Text>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <TouchableOpacity
                                        style={{
                                            marginRight: 10,
                                            borderWidth: 1,
                                            height: 30,
                                            width: 30,
                                            justifyContent: "center",
                                            borderRadius: 100,
                                            backgroundColor: "black",
                                            borderColor: "black",
                                        }}
                                    >
                                        <Image
                                            source={images.cross}
                                            style={{
                                                height: 15,
                                                width: 15,
                                                alignSelf: "center",
                                                tintColor: "white",
                                            }}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={{
                                            borderWidth: 1,
                                            height: 30,
                                            width: 30,
                                            justifyContent: "center",
                                            borderRadius: 100,
                                            backgroundColor: "#916008",
                                            borderColor: "#916008",
                                        }}
                                    >
                                        <Image
                                            source={images.tick1}
                                            style={{
                                                height: 20,
                                                width: 20,
                                                alignSelf: "center",
                                                tintColor: "white",
                                            }}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.bottomButtons}>
                <TouchableOpacity style={styles.rejectButton}>
                    <Text style={[styles.buttonText, { color: 'black' }]}>Reject All</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptButton}>
                    <Text style={styles.buttonText}>Accept All</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ViewRequestScreen;

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
        marginTop:5

    },
    cont1: {
        marginTop: 40,
        flex: 1,
    },
    bottomButtons: {
        position: "absolute",
        bottom: 20,
        width: "100%",
        alignItems: "center",
    },
    rejectButton: {
        borderWidth: 1,
        height: 50,
        width: "90%",
        borderRadius: 100,
        borderColor: "#D9D9D9",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
        backgroundColor: "white",
    },
    acceptButton: {
        borderWidth: 1,
        height: 50,
        width: "90%",
        borderRadius: 100,
        borderColor: "#916008",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#916008",
    },
    buttonText: {
        fontFamily: "Poppins-Medium",
        fontSize: 16,
        color: "white",
    },
});
