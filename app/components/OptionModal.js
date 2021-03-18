import React from 'react';
import {Text, View, Alert, StyleSheet, Dimensions, Modal, StatusBar, Touchable,TouchableWithoutFeedback} from 'react-native';
import color from '../misc/color';


const OptionModal = ({visible,currentItem,onClose,onPlayPress,onPlayListPress}) =>{
    const{filename}= currentItem
    return (<>
    <StatusBar hidden/>
     <Modal animationType='slide' transparent visible={visible}>
         <View style={styles.modal}>
             <Text style={styles.title} numberOfLines={2}>
                 {filename}
                 </Text>
             <View style={styles.optopmContainer}>
                 
                 <TouchableWithoutFeedback onPress={onPlayPress}>
                     <Text style={styles.opton}>Play</Text>
                 </TouchableWithoutFeedback>
                
                 <TouchableWithoutFeedback onPress={onPlayListPress}>
                     <Text style={styles.opton}>Add to plalist</Text>
                 </TouchableWithoutFeedback>

             </View>
         </View>
         <TouchableWithoutFeedback onPress={onClose}>

         <View style={styles.modalBG}/>
         </TouchableWithoutFeedback>
     </Modal>

    </>
    );
      
    
}

const styles = StyleSheet.create({
    modal:{
        position:'absolute',
        bottom:0,
        right:0,
        left:0,
        backgroundColor: color.APP_BG,
        borderTopRightRadius:20,
        borderTopLeftRadius:20,
        zIndex:1000,
    },
    title:{
        fontSize:18,
        fontWeight:'bold',
        padding:20,
        paddingBottom:0,
        color:color.FONT_MEDIUM
    },
    optopmContainer:{
        padding:20,

    },
    opton:{
        fontSize:16,
        fontWeight:'bold',
        color:color.FONT,
        paddingVertical:10,
        letterSpacing:1,
    },
    modalBG:{
        position:'absolute',
        top:0,
        right:0,
        left:0,
        bottom:0,
        backgroundColor:color.MODAL_BG,
    },



})

export default OptionModal;