import React,{Component} from 'react';
import {View, StyleSheet, Text,ScrollView, Dimensions} from 'react-native';
import { AudioContext } from '../context/AudioProvider';
import {RecyclerListView, LayoutProvider} from 'recyclerlistview';
import AudioListItem from '../components/AudioListItem';
import Screen from '../components/Screen';

export class AudioList extends Component{
    static contextType = AudioContext

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
    
    rowRenderer = (type, item)=>{
        return(
        <AudioListItem 
            title={item.filename} 
            duration={item.duration} 
            onOptionPress={()=>{
            console.log('opening option');
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