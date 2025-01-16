import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Switch, ScrollView } from "react-native";
import images from "../../../components/images";

const PhotoVideoPermissions = ({ navigation }) => {
    // State for switches
    const [blockIncoming1, setBlockIncoming1] = useState(true);
    const [blockIncoming2, setBlockIncoming2] = useState(false);
    const [receiveCalls, setReceiveCalls] = useState(false);
    const [incomingRingtone, setIncomingRingtone] = useState(false);
    const [photosharing, setPhotoSharing] = useState(false)
    const [photovisibility, setPhotoVisibility] = useState(false)
    const [autodownload, setAutoDownload] = useState(false)
    const [privatephoto, setPrivatePhoto] = useState(false)
    const [privatesharing, setPrivateSharing] = useState(false)
    const [videosharing, setVideoSharing] = useState(false)
    const [autoplayback, setAutoPlayBack] = useState(false)
    const [videocallperm, setVideoCallPer] = useState(false)
    const [filesharing, setFileSharing] = useState(false)
    const [multimediaprev, SetMultiMediaPrev] = useState(false)
    const [storageperm, setStoragePerm] = useState(false)


    return (
        <View style={styles.mainContainer}>
            <TouchableOpacity onPress={() => navigation.goBack('')}>
                <View style={styles.cont}>
                    <Image source={images.back} style={styles.backIcon} />
                    <Text style={styles.txt}>Multimedia and Voice{'\n'}Permissions</Text>
                </View>
            </TouchableOpacity>

            <ScrollView style={{ marginTop: 40 }}>
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Video Settings</Text>

                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleText}>Recieve voice messages</Text>
                        <Switch
                            value={blockIncoming1}
                            onValueChange={() => setBlockIncoming1((prev) => !prev)}
                            trackColor={{ false: "#C4C4C4", true: "#916008" }}
                            thumbColor={"#FFF"}
                        />
                    </View>
                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleText}>Voice note playback</Text>
                        <Switch
                            value={blockIncoming2}
                            onValueChange={() => setBlockIncoming2((prev) => !prev)}
                            trackColor={{ false: "#C4C4C4", true: "#916008" }}
                            thumbColor={"#FFF"}
                        />
                    </View>

                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleText}>
                            Voice chat requests
                        </Text>
                        <Switch
                            value={receiveCalls}
                            onValueChange={() => setReceiveCalls((prev) => !prev)}
                            trackColor={{ false: "#C4C4C4", true: "#916008" }}
                            thumbColor={"#FFF"}
                        />
                    </View>
                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleText}>Set incoming ringtone</Text>
                        <Switch
                            value={incomingRingtone}
                            onValueChange={() => setIncomingRingtone((prev) => !prev)}
                            trackColor={{ false: "#C4C4C4", true: "#916008" }}
                            thumbColor={"#FFF"}
                        />
                    </View>
                    <Text style={[styles.sectionHeader, { marginTop: 10 }]}>Photo Settings</Text>
                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleText}>Photo Sharing</Text>
                        <Switch
                            value={photosharing}
                            onValueChange={() => setPhotoSharing((prev) => !prev)}
                            trackColor={{ false: "#C4C4C4", true: "#916008" }}
                            thumbColor={"#FFF"}
                        />
                    </View>
                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleText}>Profile photo visibility</Text>
                        <Switch
                            value={photovisibility}
                            onValueChange={() => setPhotoVisibility((prev) => !prev)}
                            trackColor={{ false: "#C4C4C4", true: "#916008" }}
                            thumbColor={"#FFF"}
                        />
                    </View>
                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleText}>Photo auto-download</Text>
                        <Switch
                            value={autodownload}
                            onValueChange={() => setAutoDownload((prev) => !prev)}
                            trackColor={{ false: "#C4C4C4", true: "#916008" }}
                            thumbColor={"#FFF"}
                        />
                    </View>
                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleText}>Private photo access</Text>
                        <Switch
                            value={privatephoto}
                            onValueChange={() => setPrivatePhoto((prev) => !prev)}
                            trackColor={{ false: "#C4C4C4", true: "#916008" }}
                            thumbColor={"#FFF"}
                        />
                    </View>
                    <View style={styles.toggleContainer}>
                        <Text style={styles.toggleText}>Private photo sharing with</Text>
                        <Switch
                            value={privatesharing}
                            onValueChange={() => setPrivateSharing((prev) => !prev)}
                            trackColor={{ false: "#C4C4C4", true: "#916008" }}
                            thumbColor={"#FFF"}
                        />
                    </View>
                </View>

                <Text style={styles.sectionHeader}>Video Settings</Text>
                <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>Video Sharing</Text>
                    <Switch
                        value={videosharing}
                        onValueChange={() => setVideoSharing((prev) => !prev)}
                        trackColor={{ false: "#C4C4C4", true: "#916008" }}
                        thumbColor={"#FFF"}
                    />
                </View>
                <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>Video auto-playback</Text>
                    <Switch
                        value={autoplayback}
                        onValueChange={() => setAutoPlayBack((prev) => !prev)}
                        trackColor={{ false: "#C4C4C4", true: "#916008" }}
                        thumbColor={"#FFF"}
                    />
                </View>
                <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>Video call permissions</Text>
                    <Switch
                        value={videocallperm}
                        onValueChange={() => setVideoCallPer((prev) => !prev)}
                        trackColor={{ false: "#C4C4C4", true: "#916008" }}
                        thumbColor={"#FFF"}
                    />
                </View>
                <Text style={[styles.sectionHeader, { marginTop: 10 }]}>Other Multimedia{'\n'}Settings</Text>
                <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>File sharing</Text>
                    <Switch
                        value={filesharing}
                        onValueChange={() => setFileSharing((prev) => !prev)}
                        trackColor={{ false: "#C4C4C4", true: "#916008" }}
                        thumbColor={"#FFF"}
                    />
                </View>
                <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>Multimedia preview</Text>
                    <Switch
                        value={multimediaprev}
                        onValueChange={() => SetMultiMediaPrev((prev) => !prev)}
                        trackColor={{ false: "#C4C4C4", true: "#916008" }}
                        thumbColor={"#FFF"}
                    />
                </View>
                <View style={styles.toggleContainer}>
                    <Text style={styles.toggleText}>Storage permissions</Text>
                    <Switch
                        value={storageperm}
                        onValueChange={() => setStoragePerm((prev) => !prev)}
                        trackColor={{ false: "#C4C4C4", true: "#916008" }}
                        thumbColor={"#FFF"}
                    />
                </View>

                <View style={{ borderWidth: 0.5, width: '100%', borderColor: '#E0E2E9', top: 8 }} />

                <View style={styles.photoSection}>
                    <Text style={styles.sectionHeader}>Sharing Private Photos with</Text>
                    <Image source={images.privacy} style={styles.privacyIcon} />
                    <Text style={styles.emptyText}>You haven't shared any private photos.</Text>
                    <Text style={styles.infoText}>
                        Members that you have shared private photos with will display here.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

export default PhotoVideoPermissions;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "#FFF",
        paddingHorizontal: 20,
    },
    backIcon: {
        height: 20,
        width: 20,
        marginTop: 10

    },
    cont: {
        flexDirection: 'row',
        marginTop: 40
    },
    txt: {
        fontSize: 20,
        fontFamily: 'Poppins-Medium',
        marginLeft: 12,
        top: 5
    },
    headerText: {
        fontSize: 20,
        fontFamily: "Poppins-Bold",
        color: "black",
        marginBottom: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        fontSize: 24,
        fontFamily: "Poppins-Bold",
        color: "black",
        marginBottom: 10,
    },
    subHeader: {
        fontSize: 14,
        fontFamily: "Poppins-SemiBold",
        color: "black",
        marginBottom: 10,
    },
    toggleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 8,
    },
    toggleText: {
        fontSize: 14,
        fontFamily: "Poppins-Regular",
        color: "black",
        flex: 1, // Allows wrapping text
    },
    photoSection: {
        alignItems: "center",
        marginTop: 20,
    },
    privacyIcon: {
        height: 60,
        width: 60,
        marginTop: 10,
        marginBottom: 10,
    },
    emptyText: {
        fontFamily: "Poppins-Medium",
        fontSize: 16,
        color: "#000",
        textAlign: "center",
    },
    infoText: {
        fontFamily: "Poppins-Regular",
        fontSize: 12,
        color: "#7B7B7B",
        textAlign: "center",
        marginTop: 5,
        paddingHorizontal: 10,
    },
});
