import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as RNIap from 'react-native-iap';

const itemSkus = [
    'com.luxurylife.gold.monthly',
    'com.luxurylife.gold.quarterly',
    'com.luxurylife.gold.annual',
    'com.luxurylife.luxury.monthly',
    'com.luxurylife.luxury.quarterly',
    'com.luxurylife.luxury.annual',
];

const SubscriptionScreen = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState('Monthly');

    useEffect(() => {
        const initIAP = async () => {
            try {
                const result = await RNIap.initConnection();
                console.log('✅ IAP connection initialized:', result);
                const subs = await RNIap.getSubscriptions({ skus: itemSkus });
                console.log('📦 Subscriptions:', subs);
                setSubscriptions(subs);
            } catch (err) {
                console.warn('❌ IAP init error:', err);
                Alert.alert('Error', 'Failed to initialize In-App Purchase');
            }
        };

        initIAP();

        const purchaseUpdate = RNIap.purchaseUpdatedListener(async (purchase) => {
            try {
                if (purchase.transactionReceipt) {
                    console.log('📄 Receipt:', purchase.transactionReceipt);
                    await RNIap.finishTransaction(purchase);
                    Alert.alert('Success', 'Your subscription is active!');
                }
            } catch (err) {
                console.warn('❌ Finish transaction error:', err);
            }
        });

        const purchaseError = RNIap.purchaseErrorListener((error) => {
            console.warn('❌ Purchase Error:', error);
            Alert.alert('Error', error.message || 'Something went wrong');
        });

        return () => {
            RNIap.endConnection();
            purchaseUpdate.remove();
            purchaseError.remove();
        };
    }, []);

    const handleSubscribe = async (sku) => {
        try {
            setLoading(true);
            await RNIap.requestSubscription({ sku });
        } catch (err) {
            console.warn('❌ Subscription error:', err);
            Alert.alert('Error', err.message || 'Subscription failed');
        } finally {
            setLoading(false);
        }
    };

    const getPlan = (planType) => {
        return subscriptions.find(sub =>
            sub.productId.includes(planType.toLowerCase()) &&
            sub.productId.includes(selectedTab.toLowerCase())
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <Text style={styles.header}>Membership Plans</Text>

            <View style={styles.tabsContainer}>
                {['Monthly', 'Quarterly', 'Annual'].map(tab => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setSelectedTab(tab)}
                        style={[styles.tabButton, selectedTab === tab && styles.selectedTab]}
                    >
                        <Text style={[styles.tabText, selectedTab === tab && styles.selectedTabText]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
                {['Gold', 'Luxury'].map(planType => {
                    const plan = getPlan(planType);
                    return (
                        <LinearGradient
                            key={planType}
                            colors={planType === 'Gold' ? ['#DDDDDD', '#FFFFFF'] : ['#FFDEE9', '#B5FFFC']}
                            style={styles.cardContainer}
                        >
                            <Text style={styles.planTitle}>{planType} Plan</Text>
                            <Text style={styles.price}>
                                {plan?.localizedPrice || 'N/A'}
                            </Text>
                            <Text style={styles.description}>
                                {plan?.description || `Premium access with ${planType} benefits`}
                            </Text>
                            <TouchableOpacity
                                style={styles.subscribeButton}
                                onPress={() => handleSubscribe(plan.productId)}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.subscribeButtonText}>Upgrade to {planType}</Text>
                                )}
                            </TouchableOpacity>
                        </LinearGradient>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        margin: 20,
        textAlign: 'center'
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly'
    },
    tabButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#916008'
    },
    selectedTab: {
        backgroundColor: '#916008'
    },
    tabText: {
        color: '#916008'
    },
    selectedTabText: {
        color: 'white',
        fontWeight: 'bold'
    },
    cardContainer: {
        width: 260,
        padding: 20,
        borderRadius: 10,
        marginRight: 20
    },
    planTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10
    },
    description: {
        fontSize: 14,
        color: '#555',
        marginBottom: 20
    },
    subscribeButton: {
        backgroundColor: '#916008',
        paddingVertical: 10,
        borderRadius: 5,
        alignItems: 'center'
    },
    subscribeButtonText: {
        color: 'white',
        fontWeight: '600'
    }
});

export default SubscriptionScreen;
