import React,{Component} from 'react';
import {View, StyleSheet, Text,ScrollView, Dimensions} from 'react-native';
import { AudioContext } from '../context/AudioProvider';
import {RecyclerListView, LayoutProvider} from 'recyclerlistview';
import AudioListItem from '../components/AudioListItem';
import Screen from '../components/Screen';
import OptionModal from '../components/OptionModal';
import {Audio} from 'expo-av';

export class AudioList extends Component{
    static contextType = AudioContext;
    constructor(props){
        super(props);
        this.state={
            OptionModalVisible:false,
            playbackObj: null,
            soundObg:null,
            currentAudio:{}
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

        if(this.state.soundObg === null){
            const playbackObj=  new Audio.Sound()
            const status =await playbackObj.loadAsync(
                {uri:audio.uri},
                {shouldPlay:true}
             );
             
             return this.setState({
                 ...this.state, 
                 currentAudio:audio,
                 playbackObj: playbackObj, 
                 soundObg: status,
                })
        }
        if(this.state.soundObg.isLoaded && this.state.soundObg.isPlaying){
            const status = await this.state.playbackObj.setStatusAsync({shouldPlay:false});

            return this.setState({
                ...this.state, 
                soundObg: status,
               })
        }
        if(this.state.soundObg.isLoaded &&
        !this.state.soundObg.isPlaying && 
        this.state.currentAudio.id === audio.id
        ){
            const status = await this.state.playbackObj.playAsync()
            return this.setState({
                ...this.state, 
                soundObg: status,
               })

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