import React from 'react';
import {View, StyleSheet, Text, ScrollView, TouchableOpacity, Touchable} from 'react-native';
import color from '../misc/color';

const PlayList = () => {
    return(

        <ScrollView contentContainerStyle={styles.container}>
   
           <TouchableOpacity style={styles.playListBanner}>
            <Text>Minha Lista</Text>
            <Text style={styles.audioCount}> 0 Músicas</Text>
           </TouchableOpacity>
           <TouchableOpacity onPress={()=> console.log('Adicionando a playlist')} style={{marginTop:15}} >
               <Text style={styles.playListBtn}>+ Add numa nova Playlist</Text>
           </TouchableOpacity>
        </ScrollView>

    )
}

const styles = StyleSheet.create({

    container:{
      padding:20

    },
    playListBanner:{
        padding:5,
        backgroundColor: 'rgba(204,204,204,0.3)',
        borderRadius:5
    },
    audioCount:{
        marginTop: 3,
        opacity: 0.5,
        fontSize:14,

    },
    playListBtn:{
        color: color.ACTIVE_BG,
        letterSpacing:1,
        fontWeight:'bold',
        fontSize:14,
        padding:5
    }
})

export default PlayList;