import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, Image, StyleSheet, ScrollView, Linking, ActivityIndicator, ToastAndroid } from "react-native";
import images from "./images";
import LinearGradient from "react-native-linear-gradient";
import RazorpayCheckout from 'react-native-razorpay';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Modal from "react-native-modal";
import LottieView from 'lottie-react-native';
import analytics from '@react-native-firebase/analytics';


const RazorPayGateway = ({ navigation }) => {

  const [selectedTab, setSelectedTab] = useState("Quarterly");
  const [plans, setPlans] = useState([])
  const [userdetails, setUserDetails] = useState(null)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    analytics().logEvent('subscription_planView');
  }, [])


  useEffect(() => {
    getPlans()
  }, [])

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
    const token = await AsyncStorage.getItem('authToken')
    const headers = {
      Authorization: token,
    };
    try {
      setIsLoading(true);
      const resp = await axios.get('payment/get-subscription/razorpay/live', { headers })
      setPlans(resp.data)
    } catch (error) {
      console.log('error from the get plans', error?.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  }

  const getPrice = (planType) => {
    const plan = plans.find(p => p.planType === planType && p.duration === selectedTab);
    let price = plan ? plan.price : 0;

    if (selectedTab === 'Quarterly') {
      price = price / 3;
    } else if (selectedTab === 'Annually') {
      price = price / 12;
    }

    return Math.round(price).toLocaleString('en-IN');
  };


  const createSubscription = async (planType) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const headers = {
        Authorization: token
      };
      if (!token || !userdetails) {
        console.log('Token or user details are missing');
        setLoading(false);
        ToastAndroid.show('Error: Missing token or user details', ToastAndroid.BOTTOM);
        return;
      }
      setLoading(true);
      const selectedPlan = plans.find(p => p.planType === planType && p.duration === selectedTab);
      console.log('selected plan price', selectedPlan?.price);

      // If no selected plan, show error message
      if (!selectedPlan) {
        ToastAndroid.show('Error: Plan not found', ToastAndroid.BOTTOM);
        setLoading(false);
        return;
      }

      const { priceId, _id: planId } = selectedPlan;
      const userId = userdetails._id;
      const requestBody = {
        priceId,
        planId,
        userId
      };
      console.log('Request body to create subscription:', requestBody);
      try {
        const resp = await axios.post('payment/create-subscription-razorpay', requestBody, { headers });
        console.log('Subscription created:', resp.data);
        await analytics().logEvent('begin_checkout', {
          UserId: userdetails?._id,
          EmailId: userdetails?.email,
          Age: userdetails?.age,
          Gender: userdetails?.gender,
          Country: userdetails?.country,
          City: userdetails?.city,
          currency: 'INR',
          value: selectedPlan.price

        });
        const options = {
          description: 'Upgrade to premium',
          image: 'https://i.imgur.com/3g7nmJC.jpg',
          currency: 'INR',
          key: 'rzp_live_vEHPCxgOJv6rT5',
          amount: selectedPlan.price,
          name: 'Luxury Life',
          subscription_id: resp?.data?.subscriptionId,
          prefill: {
            email: userdetails?.email,
            name: userdetails?.userName,
          },
          theme: { color: '#916008' }
        };
        console.log('optionssssss', options);


        // Razorpay checkout
        RazorpayCheckout.open(options).then((data) => {
          console.log('Payment success response:', data);
          getVerifyPayment(data?.razorpay_payment_id, planId, data?.razorpay_subscription_id, data?.razorpay_signature);
          analytics()?.logEvent('purchase', {
            UserId: userdetails?._id,
            EmailId: userdetails?.email,
            Age: userdetails?.age,
            Gender: userdetails?.gender,
            Country: userdetails?.country,
            City: userdetails?.city,
            currency: 'INR',
            transaction_id: data?.razorpay_payment_id
          });
        }).catch((error) => {
          console.error('Payment failed response:', error?.error?.description);
          ToastAndroid.show(error?.error?.description || 'Payment failed, please try again', ToastAndroid.BOTTOM);
          setLoading(false);
        });

      } catch (error) {
        console.error('Error creating subscription (API Call):', error?.response?.data);
        ToastAndroid.show(error?.response?.data?.message || 'Subscription creation failed. Please try again', ToastAndroid.BOTTOM);
        setLoading(false);
      }

    } catch (error) {
      console.error('Unexpected error occurred:', error?.message || error);
      ToastAndroid.show('Unexpected error occurred, please try again', ToastAndroid.BOTTOM);
      setLoading(false);
    }
  };


  const getVerifyPayment = async (razorpay_payment_id, planId, razorpay_subscription_id, razorpay_signature) => {
    const token = await AsyncStorage.getItem('authToken');
    const headers = {
      Authorization: token
    };
    let body = {
      razorpay_payment_id: razorpay_payment_id,
      planId: planId,
      razorpay_subscription_id: razorpay_subscription_id,
      razorpay_signature: razorpay_signature
    }
    console.log('body of verify payment api', body);

    try {
      const resp = await axios.post('payment/verify-payment', body, { headers })
      console.log('response from the verify payment', resp.data);
      setIsModalVisible(true);
    } catch (error) {
      console.log('error from the verify payment', error.response.data.message);
    }
  }

  const goldMonthly = plans.find(p => p.planType === 'Gold' && p.duration === 'Monthly');
  const luxuryMonthly = plans.find(p => p.planType === 'Luxury' && p.duration === 'Monthly');

  const allFeatures = Array.from(new Set([
    ...(goldMonthly?.features || []),
    ...(luxuryMonthly?.features || [])
  ]));


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
      <TouchableOpacity onPress={() => navigation.goBack("")}>
        <View style={styles.cont}>
          <Image source={images.back} style={styles.back} />
          <Text style={styles.txt}>Membership</Text>
        </View>

      </TouchableOpacity>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#916008" />
          <Text style={styles.initializingText}>Initializing...</Text>
        </View>
      )}

      <View style={styles.tabsContainer}>
        <TouchableOpacity onPress={() => setSelectedTab("Monthly")} style={[styles.tabButton, selectedTab === "Monthly" && [styles.selectedTab, { height: 50 }]]}>
          <Text style={[styles.tabText, selectedTab === "Monthly" && styles.selectedTabText]}>Monthly</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedTab("Quarterly")} style={[styles.tabButton, selectedTab === "Quarterly" && styles.selectedTab]}>
          <Text style={[styles.tabText, selectedTab === "Quarterly" && styles.selectedTabText]}>Quarterly</Text>
          <Text style={styles.discountText}>20% off</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedTab("Annually")} style={[styles.tabButton, selectedTab === "Annually" && styles.selectedTab]}>
          <Text style={[styles.tabText, selectedTab === "Annually" && styles.selectedTabText]}>Annually</Text>
          <Text style={styles.discountText}>40% off</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        <ScrollView horizontal={true} style={styles.scrollViewContainer}>
          {/* First Card - Gold */}
          <View style={styles.contentContainer}>
            {selectedTab && (
              <LinearGradient
                colors={["#DDDDDD", "#FFFFFF"]}
                style={[styles.cardContainer, { borderColor: '#DDDDDD' }]}
                start={{ x: 0, y: -1 }}
                end={{ x: 0, y: 0.7 }}
              >
                <View>
                  <View style={{ top: 5 }}>
                    {/* <Image source={images.stars} style={{ height: 40, width: 40 }} /> */}
                    <View>
                      <Text style={{ color: '#18181B', fontSize: 20, fontFamily: 'Poppins-SemiBold', }}>Gold Plan</Text>
                      <Text style={{ fontSize: 12, textDecorationLine: 'line-through', color: 'grey' }}>{selectedTab === 'Quarterly' ? '9,147 INR/Month' : selectedTab === 'Annually' ? '8,004 INR/Month' : null}</Text>
                    </View>
                  </View>
                  <Text style={styles.price}>{getPrice('Gold')} INR/<Text style={styles.perMonth}>{selectedTab === 'Monthly' ? 'month' : selectedTab === 'Quarterly' ? 'month' : selectedTab === 'Annually' ? 'month' : null}</Text></Text>
                  <Text style={{ fontSize: 14, top: 10, color: '#3C4043' }}>Essential perks for a premium dating experience.</Text>
                  <TouchableOpacity onPress={() => createSubscription('Gold')} style={styles.button}>
                    <Text style={styles.buttonText}>Upgrade to Gold</Text>
                  </TouchableOpacity>
                  <View style={{ marginTop: 20 }}>
                    <Text style={{ fontSize: 16, fontFamily: 'Poppins-SemiBold' }}>All features:</Text>
                    {plans
                      .filter(item => (item.planType === 'Gold' && item.duration === 'Monthly'))
                      .map((item, index) => (
                        <View key={index} style={{ marginTop: 20 }}>
                          {item.features.map((feature, featureIndex) => (
                            <View
                              key={featureIndex}
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: 20,
                              }}
                            >
                              <Text>{feature}</Text>
                              <View style={styles.tickBoxContainer}>
                                <View style={styles.tickBox}>
                                  <Image source={images.tick1} style={styles.tickIcon} />
                                </View>
                              </View>
                            </View>
                          ))}
                        </View>
                      ))}
                  </View>
                </View>
              </LinearGradient>
            )}
          </View>

          {/* Second Card - Diamond */}
          <View style={styles.contentContainer}>
            {selectedTab && (
              <LinearGradient
                colors={["#DDDDDD", "white"]}
                style={[styles.cardContainer, { borderColor: '#DDDDDD' }]}
                start={{ x: 0, y: -1 }}
                end={{ x: 0, y: 0.7 }}
              >
                <View>
                  <View >
                    {/* <Image source={images.crown} style={{ height: 40, width: 40 }} /> */}
                    <View>
                      <Text style={{ color: '#18181B', fontSize: 20, fontFamily: 'Poppins-SemiBold', }}>Luxury Plan</Text>
                      <Text style={{ fontSize: 12, textDecorationLine: 'line-through', color: 'grey' }}>{selectedTab === 'Quarterly' ? '11,554 INR/Month' : selectedTab === 'Annually' ? '10,110 INR/Month' : null}</Text>
                    </View>
                  </View>
                  <Text style={[styles.price, { color: '#B53535' }]}>{getPrice('Luxury')} INR/<Text style={styles.perMonth}>{selectedTab === 'Monthly' ? 'month' : selectedTab === 'Quarterly' ? 'month' : selectedTab === 'Annually' ? 'month' : null}</Text></Text>
                  <Text style={{ fontSize: 14, top: 10 }}>Exclusive access to elite{'\n'}connections.</Text>
                  <TouchableOpacity onPress={() => createSubscription('Luxury')} style={[styles.button, { backgroundColor: '#B53535', borderColor: '#B53535', }]}>
                    <Text style={styles.buttonText}>Upgrade to Luxury</Text>
                  </TouchableOpacity>
                  <View style={{ marginTop: 20 }}>
                    <Text style={{ fontSize: 16, fontFamily: 'Poppins-SemiBold', }}>All features:</Text>
                    {plans
                      .filter(item => (item.planType === 'Luxury' && item.duration === 'Monthly'))
                      .map((item, index) => (
                        <View key={index} style={{ marginTop: 20 }}>
                          {item.features.map((feature, featureIndex) => (
                            <View
                              key={featureIndex}
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: 20,
                              }}
                            >
                              <Text>{feature}</Text>
                              <View style={styles.tickBoxContainer}>
                                <View style={[styles.tickBox, { backgroundColor: '#B53535', borderColor: '#B53535' }]}>
                                  <Image source={images.tick1} style={styles.tickIcon} />
                                </View>
                              </View>
                            </View>
                          ))}
                        </View>
                      ))}
                  </View>
                </View>
              </LinearGradient>
            )}
          </View>
        </ScrollView>
      </ScrollView>

      <Modal isVisible={isModalVisible} style={styles.modal}>
        <View style={styles.overlay}>
          <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeButton}>
            <Image source={images.cross} style={styles.closeIcon} />
          </TouchableOpacity>
          <View style={styles.modalContent}>
            <LottieView
              source={require('../assets/razorpay.json')}
              autoPlay
              loop
              style={{ width: 230, height: 230 }}
            />
            <Text style={[styles.pay, { color: 'skyblue' }]}>Your payment was successful!</Text>
            <Text style={[styles.pay, { color: 'white', fontFamily: 'Poppins-Regular' }]}>Successfully paid</Text>

            <TouchableOpacity onPress={() => { navigation.navigate('Home'); setIsModalVisible(false) }}>
              <View style={styles.submitButton}>
                <Text style={styles.submitText}>Explore Search</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  },
  scrollViewContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginLeft: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 30,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  selectedTab: {
    backgroundColor: 'black',
  },
  tabText: {
    fontSize: 16,
    color: 'black',
    fontFamily: 'Poppins-Medium'
  },
  selectedTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  discountText: {
    fontSize: 12,
    color: 'green',
    textAlign: 'center',
    // bottom:3
    // marginTop: 5,
  },
  cardContainer: {
    width: 280,
    alignSelf: "center",
    borderRadius: 10,
    padding: 30,
    shadowOffset: { width: 0, height: 2 },
    marginVertical: 20,
    justifyContent: "space-between",
    borderWidth: 1,
    height: 550
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
    color: "#916008",
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
    borderRadius: 100,
    paddingVertical: 10,
    alignSelf: "center",
    width: "100%",
    borderWidth: 1,
    marginTop: 40,
    backgroundColor: '#916008'

  },
  buttonText: {
    fontSize: 16,
    color: "white",
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
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  modalContent: {
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    margin: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  initializingText: {
    marginTop: 20,
    fontSize: 18,
    color: 'white',
    fontFamily: 'Poppins-Regular',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
    borderWidth: 1,
    height: 30,
    width: 30,
    justifyContent: 'center',
    borderRadius: 100
  },
  closeIcon: {
    height: 17,
    width: 17,
    alignSelf: 'center'
  },
});

export default RazorPayGateway;


