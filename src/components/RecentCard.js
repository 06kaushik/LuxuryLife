import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Image, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import images from './images'; // adjust this import path to match your project
import { GARAMOND, PLAYFAIRFONTS, POPPINSRFONTS } from './GlobalStyle'; // adjust if needed

const RecentCard = ({ item, onChatPress, onLikePress, navigation }) => {
  const hasLiked = item.localLiked;
  const truncatedUserName = item.userName.length > 5 ? item.userName.slice(0, 5) : item.userName;

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => navigation.navigate('UserProfileDetails', { item: item?.userId })}>
        <ImageBackground source={{ uri: item?.profilePicture }} style={styles.imageBackground} imageStyle={{ borderRadius: 10 }}>
          <LinearGradient
            colors={["transparent", "rgba(0, 0, 0, 0.7)"]}
            style={styles.gradientOverlay}
          />

          {/* Subscription Badges */}
          {item?.subscriptionsType === 'Gold' && (
            <View style={styles.goldBadge}>
              <Image source={images.stars} style={styles.goldIcon} />
            </View>
          )}
          {item?.subscriptionsType === 'Luxury' && (
            <View style={styles.luxuryBadge}>
              <Image source={images.crown} style={styles.luxuryIcon} />
            </View>
          )}

          {/* Online Status */}
          {item?.isOnline && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Online</Text>
            </View>
          )}

          <View style={styles.overlayContainer}>
            <View style={{ flexDirection: 'row', justifyContent: "space-between" }}>
              <View>
                <Text style={styles.memberName}>
                  {`${truncatedUserName.charAt(0).toUpperCase() + truncatedUserName.slice(1)}, ${item.age}`}
                </Text>
                <Text style={styles.memberLocation}>{item.city}</Text>
                <Text style={styles.memberDistance}>{item.distance === 0 ? 1 : item?.distance} mile away</Text>
              </View>

              <View>
                <TouchableOpacity
                  onPress={() => onChatPress(item)}
                  style={styles.chatButton}
                >
                  <Image source={images.chat} style={styles.chatIcon} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => onLikePress(item?.userId, hasLiked)}
                  style={styles.likeButton}
                >
                  <Image source={hasLiked ? images.redheart : images.heart} style={styles.likeIcon} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    width: '45%',
    borderRadius: 10,
    backgroundColor: "#FFF",
    height: 250,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  imageBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  gradientOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
    borderRadius: 10,
  },
  goldBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: '#916008',
    height: 25,
    width: 25,
    borderRadius: 100,
    justifyContent: 'center',
  },
  goldIcon: {
    height: 20,
    width: 20,
    alignSelf: 'center',
    tintColor: 'gold',
  },
  luxuryBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: 'silver',
    height: 25,
    width: 25,
    borderRadius: 100,
    justifyContent: 'center',
  },
  luxuryIcon: {
    height: 20,
    width: 20,
    alignSelf: 'center',
    tintColor: '#916008',
  },
  statusBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "green",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    color: "white",
    fontFamily: "Poppins-SemiBold",
    fontSize: 10,
  },
  overlayContainer: {
    padding: 10,
  },
  memberName: {
    fontFamily: GARAMOND.bold,
    fontSize: 23,
    color: "white",
  },
  memberLocation: {
    fontFamily: POPPINSRFONTS.regular,
    fontSize: 14,
    color: "white",
  },
  memberDistance: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    color: "white",
  },
  chatButton: {
    borderWidth: 1,
    borderColor: '#E0E2E9',
    borderRadius: 100,
    height: 30,
    width: 30,
    justifyContent: 'center',
    backgroundColor: 'white',
    position: 'absolute',
    right: 1
  },
  likeButton: {
    borderWidth: 1,
    borderColor: '#E0E2E9',
    borderRadius: 100,
    height: 30,
    width: 30,
    justifyContent: 'center',
    backgroundColor: 'white',
    top: 40,
    position: 'absolute',
    right: 1
  },
  chatIcon: {
    height: 18,
    width: 18,
    alignSelf: 'center',
  },
  likeIcon: {
    height: 20,
    width: 20,
    top: 1,
    alignSelf: 'center',
  },
});

export default React.memo(RecentCard);
