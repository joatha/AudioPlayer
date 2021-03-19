import React,{Component} from 'react';
import {View, StyleSheet, Text,ScrollView, Dimensions} from 'react-native';
import { AudioContext } from '../context/AudioProvider';
import {RecyclerListView, LayoutProvider} from 'recyclerlistview';
import AudioListItem from '../components/AudioListItem';
import Screen from '../components/Screen';
import OptionModal from '../components/OptionModal';
import {Audio} from 'expo-av';
import {play,pause,resume,playNext} from '../misc/AudioController';

export class AudioList extends Component{
    static contextType = AudioContext;

    constructor(props){
        super(props);
        this.state={
            OptionModalVisible:false,
           
        };
        this.currentItem ={}
    }

    layoutProvider = new LayoutProvider(
        i=>'audio', 
        (type, dim) =>{

            switch(type){
                case 'audio':
                    dim.width = Dimensions.get('window').width;
                    dim.height =70;
                    break;
                    default:
                    dim.width = 0;
                    dim.height =0;
            }
    })
    handleAudioPress= async audio =>{
        const {soundObg, playbackObj, currentAudio,updtateState} = this.context;

        if(soundObg === null){
            const playbackObj=  new Audio.Sound()
            const status =await play(playbackObj, audio.uri)
            return updtateState(this.context,{currentAudio:audio,
                playbackObj: playbackObj, 
                soundObg: status,} )
                        
        }
        if(soundObg.isLoaded && soundObg.isPlaying && currentAudio.id === 
            audio.id){
            const status = await pause(playbackObj);
            return updtateState(this.context, {soundObg: status})
           
        }
        if(
        soundObg.isLoaded &&
        !soundObg.isPlaying && 
        currentAudio.id === audio.id
        ){
            const status = await resume(playbackObj);
            return updtateState(this.context, {soundObg: status})
        }
        //select another audio

        if(soundObg.isLoaded && currentAudio.id !== audio.id){
            const status = await playNext(playbackObj, audio.uri)
            return updtateState(this.context,{
                currentAudio:audio,               
                soundObg: status,
            });
        }
    }
    
    rowRenderer = (type, item)=>{
        return(
        <AudioListItem 
            title={item.filename} 
            duration={item.duration} 
            onAudioPress={()=> this.handleAudioPress(item)}
            onOptionPress={()=>{
                this.currentItem = item;
            this.setState({...this.state, OptionModalVisible:true})
        }}
        />
       );
    };
    render(){
        return(
        
            <AudioContext.Consumer>
            {({dataProvider})=>{
                return(
                <Screen > 
                    <RecyclerListView
                    dataProvider={dataProvider}
                    layoutProvider={this.layoutProvider}
                    rowRenderer={this.rowRenderer}
                 />
                 <OptionModal 
                 onPlayPress={()=> console.log('Playing audio')}
                 onPlayListPress={()=>console.log('Adicionado a playlist')}
                    currentItem={this.currentItem}
                    onClose={() => 
                        this.setState({...this.state, OptionModalVisible:false})
                    } 
                    visible={this.state.OptionModalVisible}/>
                 </Screen>
                );
            }}
        </AudioContext.Consumer>
        );
    }
}
const styles = StyleSheet.create({
    
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'

    },
});

export default AudioList;