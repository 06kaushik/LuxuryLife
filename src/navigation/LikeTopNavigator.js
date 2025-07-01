import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { TabView } from 'react-native-tab-view';
import images from "../components/images";
import ViewedMe from '../screens/LikeScreen/ViewedMeScreen';
import FavouriteScreen from '../screens/LikeScreen/FavouriteScreen';
import FavouriteMeScreen from '../screens/LikeScreen/FavouritedMeScreen';


const InterestTopNavigator = ({ navigation }) => {

    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        { key: 'viewed me', title: 'VIEWED ME' },
        { key: 'favourites', title: 'FAVORITES' },
        { key: 'favorited me', title: 'FAVORITED ME' },
    ]);

    const renderScene = ({ route }) => {
        switch (route.key) {
            case 'viewed me':
                return <ViewedMe navigation={navigation} index={index} />;
            case 'favourites':
                return <FavouriteScreen navigation={navigation} index={index} />;
            case 'favorited me':
                return <FavouriteMeScreen navigation={navigation} index={index} />;
            default:
                return null;
        }
    };


    return (
        <>
            <View style={styles.main}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <View style={styles.header}>
                        <Image source={images.back} style={styles.backIcon} />
                        <Text style={styles.headerText}>Interested</Text>
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

export default InterestTopNavigator;

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
