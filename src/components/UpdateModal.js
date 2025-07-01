// UpdateModal.js
import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Image } from 'react-native';
import images from './images';
import { GARAMOND, PLAYFAIRFONTS, POPPINSRFONTS } from './GlobalStyle';

const UpdateModal = ({ visible, onClose, onUpdate }) => {
    return ( 
        <Modal
            transparent={true}
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>A New Update is Available!</Text>
                    <Image source={images.update} style={{ height: 150, width: 150 }} />
                    <Text style={styles.message}>
                        We've made improvements to enhance your experience, including new features, faster performance, and important bug fixes.
                    </Text>
                    <View style={styles.buttons}>
                        <TouchableOpacity style={[styles.button,{backgroundColor:'white', borderColor:'#DDDDDD',borderWidth:1}]} onPress={onClose}>
                            <Text style={[styles.buttonText,{color:'black'}]}>Later</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={onUpdate}>
                            <Text style={styles.buttonText}>Update</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: 320,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
        height: 460
    },
    title: {
        fontSize: 23,
        marginBottom: 10,
        fontFamily: GARAMOND.bold
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        color: '#3C4043',
        fontFamily: POPPINSRFONTS.regular
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        padding: 10,
        marginHorizontal: 10,
        borderRadius: 5,
        backgroundColor: '#916008',
        borderColor: '#916008',
        marginTop:30
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default UpdateModal;