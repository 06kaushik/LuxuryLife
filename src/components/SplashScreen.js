import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import images from './images';

const SplashScreen = () => {
  return (
    <LinearGradient
      colors={['#000000', '#5F3D23']}
      style={styles.container}
    >
      <View style={styles.centerContent}>
        <Image
          source={images.mainlogo}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.tagline}>Where Elegance Meets Connection.</Text>
      </View>

      <View style={styles.footerContainer}>
        <Text style={styles.footer}>Powered by Luxury Life</Text>
        <Text style={styles.footerCopyright}>
          © 2024 LuxuryLife. All rights reserved.
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: Dimensions.get('window').width * 0.5, // Scales logo to 50% of screen width
    height: Dimensions.get('window').height * 0.15, // Proportional height
    marginBottom: 20, // Space between logo and tagline
  },
  tagline: {
    fontSize: 16,
    
    fontStyle: 'italic',
    color: '#FFF',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  footerContainer: {
    alignItems: 'center',
    paddingBottom: 20, // Ensures it’s close to the bottom of the screen
  },
  footer: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 5,
  },
  footerCopyright: {
    fontSize: 12,
    color: '#AAA', // Light grey
  },
});

export default SplashScreen;