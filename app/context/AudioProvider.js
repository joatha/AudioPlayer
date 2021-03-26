import React, {Component, createContext} from 'react';
import {Text, View, Alert} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import {DataProvider} from 'recyclerlistview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Audio} from 'expo-av';
import { storeAudioForNextOpening } from '../misc/helper';
import { playNext } from '../misc/AudioController';

export const AudioContext = createContext();
export class AudioProvider extends Component{
 
    constructor(props){
        super(props);
        this.state = {
            audioFiles: [],
            permissionError: false,
            dataProvider: new DataProvider((r1, r2)=> r1 !== r2),
            playbackObj: null,
            soundObg:null,
            currentAudio:{},
            isPlaying: false,
            currentAudioIndex:null,
            playbackPosition: null,
            playbackDuration: null,
        };
        this.totalAudioCount = 0
    }

    persmissionAllert = ()=>{
        Alert.alert("Permissão requerida", "Este appp precissa ler os arquivos de audio no seu dispositivo! ", [{
            text:'Eu estou pronto',
            onPress: ()=> this.getPermission()

        },{
                text:'Cancelar',
                onPress: ()=> this.persmissionAllert()
            },
        ]);
    };
    getAudioFiles = async ()=>{
       const {dataProvider, audioFiles} = this.state
       let media = await MediaLibrary.getAssetsAsync({
       mediaType:'audio',
           
        });
        media = await MediaLibrary.getAssetsAsync({
            mediaType:'audio',
            first:media.totalCount,
        });
        this.totalAudioCount = media.totalCount

         this.setState({
            ...this.state,
            dataProvider: dataProvider.cloneWithRows([
            ...audioFiles, 
            ...media.assets,
        ]),
            audioFiles: [...audioFiles, ...media.assets]
        });
    };

    loadaPreviousAudio = async ()=>{
        //TODO: we need to load audio form our asynch storage 

       let previousAudio = await AsyncStorage.getItem('previousAudio')
       let currentAudio;
       let currentAudioIndex;

       if(previousAudio === null){
        currentAudio = this.state.audioFiles[0];
        currentAudioIndex = 0

       }else{
        previousAudio=  JSON.parse(previousAudio);
        currentAudio = previousAudio.audio
        currentAudioIndex = previousAudio.index
       }

       this.setState({...this.state, currentAudio, currentAudioIndex})

    }

    getPermission= async () => {
          /* {
        "canAskAgain": true,     
        "expires": "never",      
        "granted": false,        
        "status": "undetermined",
      }*/
        const permission = await MediaLibrary.getPermissionsAsync()
        if(permission.granted){
            this.getAudioFiles()
        }

        if(!permission.canAskAgain && !permission.granted){
            this.setState({...this.state, permissionError: true})

        }

        if(!permission.granted && permission.canAskAgain){
            const { status, canAskAgain} =await MediaLibrary.
            requestPermissionsAsync();
            if(status === 'denied' && canAskAgain){
                this.persmissionAllert()

            }
            if(status === 'granted'){
                this.getAudioFiles();
            }
            if(status === 'denied' && !canAskAgain){
                this.setState({...this.state, permissionError: true})
                
            }
        }
    }
    onPlaybackStatusUpdate = async playbackStatus =>{

        if(playbackStatus.isLoaded && playbackStatus.isPlaying){
            this.updtateState(this, {
                playbackPosition: playbackStatus.positionMillis,
                playbackDuration: playbackStatus.durationMillis,
            });
        }
        if(playbackStatus.didJustFinish){
            const nextAudioIndex = this.state.currentAudioIndex + 1;
            //there is no next audio to play or the current audio is the last
            if(nextAudioIndex >= this.totalAudioCount){
                this.state.playbackObj.unloadAsync();
                this.updtateState(this, {
                    soundObg: null,
                    currentAudio: this.state.audioFiles[0],
                    isPlaying: false,
                    currentAudioIndex:0,
                    playbackPosition: null,
                    playbackDuration:null,
                });
                return await storeAudioForNextOpening(this.state.audioFiles[0], 0);
            }
            // otherwise we want to select the netx audio
            
            const audio = this.state.audioFiles[nextAudioIndex];
            const status= await playNext(this.state.playbackObj, audio.uri);
            this.updtateState(this, {
                soundObg: status,
                currentAudio: audio,
                isPlaying: true,
                currentAudioIndex: nextAudioIndex,
            });
            await storeAudioForNextOpening(audio, nextAudioIndex)
        }
     


    }
    componentDidMount(){
        this.getPermission();
        if(this.state.playbackObj === null){
            this.setState({...this.state, playbackObj: new Audio.Sound()})
        }
    }
    updtateState = (prevState, newState={})=>{
        this.setState({...prevState, ...newState})

    }
    render(){
        const{audioFiles,
             dataProvider,
              permissionError,
              playbackObj,
              soundObg,
              currentAudio,
              isPlaying,
              currentAudioIndex,
              playbackPosition,
              playbackDuration,
            } = this.state
        if(permissionError){
            return(
            <View style={{
                flex:1,
                justifyContent:'center',
                alignItems:'center'
                }}>
                 <Text style={{fontSize:25, textAlign:'center', color:'red'}}>
                     "Parece que não deu permissão"
                </Text>
            </View>
            );
        } 
        return(
            <AudioContext.Provider 
            value={{ 
                audioFiles, 
                dataProvider,
                playbackObj, 
                soundObg, 
                currentAudio, 
                isPlaying,
                currentAudioIndex,
                totalAudioCount: this.totalAudioCount,
                playbackPosition,
                playbackDuration,
                updtateState: this.updtateState,
                loadaPreviousAudio: this.loadaPreviousAudio,
                onPlaybackStatusUpdate: this.onPlaybackStatusUpdate
            
                }}>
                {this.props.children}
            </AudioContext.Provider>
        );
    }
    
}

export default AudioProvider