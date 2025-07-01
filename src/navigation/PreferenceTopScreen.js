import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { TabView, SceneMap, } from 'react-native-tab-view';
import images from "../components/images";
import { MaterialIcons } from '@expo/vector-icons';
import RecentScreen from '../screens/PreferencesScreen/RecentScreen';
import NewestScreen from '../screens/PreferencesScreen/NewestScreen';
import RelevantScreen from '../screens/PreferencesScreen/RelevantScreen';

const PreferenceTopNavigator = ({ navigation }) => {
    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        { key: 'active', title: 'ACTIVE' },
        { key: 'newest', title: 'NEWEST' },
        { key: 'nearest', title: 'NEAREST' },
    ]);

    const renderScene = ({ route }) => {
        switch (route.key) {
            case 'active':
                return <RecentScreen navigation={navigation} index={index} />;
            case 'newest':
                return <NewestScreen navigation={navigation} index={index} />;
            case 'nearest':
                return <RelevantScreen navigation={navigation} index={index} />;
            default:
                return null;
        }
    };

console.log({
  NewestScreen,
  RecentScreen,
  RelevantScreen
});


    return (
        <>
            <View style={styles.main}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <View style={styles.header}>
                        <Image source={images.back} style={styles.backIcon} />
                        <Text style={styles.headerText}>Your Preference Results</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: 300 }}
                renderTabBar={(props) => (
                    <View style={styles.tabBar}>
                        {props.navigationState.routes.map((route, i) => (
                            <TouchableOpacity
                                key={i}
                                style={[styles.tab, index === i && styles.activeTab]}
                                onPress={() => setIndex(i)}
                            >
                                <Text style={[styles.tabText, index === i && styles.activeTabText]}>
                                    {route.title}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            />
        </>
    );
};

export default PreferenceTopNavigator;

const styles = StyleSheet.create({
    main: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 40,
    },
    backIcon: {
        height: 20,
        width: 20,
        marginBottom: 30,
    },
    headerText: {
        fontSize: 20,
        fontFamily: 'Poppins-Medium',
        marginLeft: 10,
        marginBottom: 27,
    },
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E2E9',
        backgroundColor: 'white',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: '#916008',
    },
    tabText: {
        fontFamily: 'Poppins-Medium',
        color: 'black',
    },
    activeTabText: {
        color: '#916008',
    },
});
