import React,{Component} from 'react';
import {View, StyleSheet, Text,ScrollView, Dimensions} from 'react-native';
import { AudioContext } from '../context/AudioProvider';
import {RecyclerListView, LayoutProvider} from 'recyclerlistview';
import AudioListItem from '../components/AudioListItem';
import Screen from '../components/Screen';
import OptionModal from '../components/OptionModal';
import {Audio} from 'expo-av';
import {play,pause,resume,playNext} from '../misc/AudioController';
import { storeAudioForNextOpening } from '../misc/helper';


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

    /*onPlaybackStatusUpdate = async (playbackStatus) =>{
        if(playbackStatus.isLoaded && playbackStatus.isPlaying){
            this.context.updtateState(this.context, {
                playbackPosition: playbackStatus.positionMillis,
                playbackDuration: playbackStatus.durationMillis,
            });
        }
        if(playbackStatus.didJustFinish){
            const nextAudioIndex = this.context.currentAudioIndex + 1;

            //there is no next audio to play or the current audio is the last
            if(nextAudioIndex >= this.context.totalAudioCount){
                this.context.playbackObj.unloadAsync();
                this.context.updtateState(this.context, {
                    soundObg: null,
                    currentAudio: this.context.audioFiles[0],
                    isPlaying: false,
                    currentAudioIndex:0,
                    playbackPosition: null,
                    playbackDuration:null,
                });
                return await storeAudioForNextOpening(this.context.audioFiles[0], 0);
            }
            // otherwise we want to select the netx audio
            
            const audio = this.context.audioFiles[nextAudioIndex];
            const status= await playNext(this.context.playbackObj, audio.uri);
            this.context.updtateState(this.context, {
                soundObg: status,
                currentAudio: audio,
                isPlaying: true,
                currentAudioIndex: nextAudioIndex,
            });
            await storeAudioForNextOpening(audio, nextAudioIndex)
        }
     


    }*/
    handleAudioPress= async audio =>{
        const {soundObg,
             playbackObj, 
             currentAudio,
             updtateState,
             audioFiles
            } = this.context;

        if(soundObg === null){
            const playbackObj =  new Audio.Sound()
            const status = await play(playbackObj, audio.uri)
            const index = audioFiles.indexOf(audio)
            updtateState(this.context,{
                currentAudio:audio,
                playbackObj: playbackObj, 
                soundObg: status,
                isPlaying: true,
                currentAudioIndex:index
            } );
            playbackObj.setOnPlaybackStatusUpdate(this.context.onPlaybackStatusUpdate);
            return storeAudioForNextOpening(audio, index);
        }
        if(
            soundObg.isLoaded &&
            soundObg.isPlaying &&
            currentAudio.id === audio.id
            ){
            const status = await pause(playbackObj);
            return updtateState(this.context, {soundObg: status, isPlaying: false})
           
        }
        if(
        soundObg.isLoaded &&
        !soundObg.isPlaying && 
        currentAudio.id === audio.id
        ){
            const status = await resume(playbackObj);
            return updtateState(this.context, {soundObg: status,isPlaying: true})
        }
        //select another audio

        if(soundObg.isLoaded && currentAudio.id !== audio.id){
            const status = await playNext(playbackObj, audio.uri)
            const index = audioFiles.indexOf(audio)
            updtateState(this.context,{
                currentAudio:audio,               
                soundObg: status,
                isPlaying: true,
                currentAudioIndex: index,
            });
            return storeAudioForNextOpening(audio, index);
        }
    }
    componentDidMount(){
        this.context.loadaPreviousAudio();

    }
    
    rowRenderer = (type, item, index, extendedState)=>{
        return(
        <AudioListItem 
            title={item.filename} 
            isPlaying={extendedState.isPlaying}
            activeListItem={this.context.currentAudioIndex === index}
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
            {({dataProvider, isPlaying})=>{
                if(!dataProvider._data.length) return null;

                return(
                <Screen > 
                    <RecyclerListView
                    dataProvider={dataProvider}
                    layoutProvider={this.layoutProvider}
                    rowRenderer={this.rowRenderer}
                    extendedState={{isPlaying}}
                 />
                 <OptionModal 
                 onPlayPress={()=> console.log('Playing audio')}
                 onPlayListPress={()=>{
                     this.props.navigation.navigate('PlayList')
                 }}
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