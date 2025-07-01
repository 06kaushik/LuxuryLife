import React from "react";
import { View, Text, StyleSheet } from 'react-native'
import { RNCamera } from 'react-native-camera';


const BillingHistory = () => {


    return (

        <View style={styles.main}>
            <Text>Billing History</Text>
        </View>
    )
}


export default BillingHistory

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "white"
    }
})

