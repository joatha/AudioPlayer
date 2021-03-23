import React, {Component, createContext} from 'react';
import {Text, View, Alert} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import {DataProvider} from 'recyclerlistview';

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
    componentDidMount(){
        this.getPermission()
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
            
                }}>
                {this.props.children}
            </AudioContext.Provider>
        );
    }
    
}

export default AudioProvider