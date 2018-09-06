/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    Text,
    View,
    StyleSheet,
    Button,
    TextInput
} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
//import ClusteredMapView from 'react-native-maps-super-cluster';

const LATITUDE=55.876058;
const LONGITUDE=38.449205;
const LONGITUDEDELTA=0.21;
const LATITUDEDELTA=0.72;

const styles = StyleSheet.create({
    map: {
        height: 450,
    }
});


export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            myloc:{
                latitude: LATITUDE,
                longitude: LONGITUDE,
                latitudeDelta:LATITUDEDELTA,
                longitudeDelta:LONGITUDEDELTA


            },
            searchText:"",
            markers:[]
        }
    }
    componentDidMount() {
        fetch('http://10.0.3.2:9200/geo/_search', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
                {
                    "query" : {
                        "match_all" : {}
                    }
                }
            )
        }).then((res)=>{
            console.log(res)
        })
            .catch((err) => {console.log(err)});
        navigator.geolocation.getCurrentPosition(
            position => {
                console.log(position);
                this.setState({
                    myloc: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        latitudeDelta:0.72,
                        longitudeDelta:0.21
                    }
                });
            },
            (error) => console.log(error.message),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
        );
        this.watchID = navigator.geolocation.watchPosition(
            position => {
                this.setState({
                    myloc: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        latitudeDelta:0.72,
                        longitudeDelta:0.21

                    }
                });
            }
        );
    };
    onPressSearch(loc) {
        let distance=this.state.searchText+"km";
        let lat=this.state.myloc.latitude;
        let lon=this.state.myloc.longitude;
        console.log(distance);
        console.log(typeof (lat));
        console.log(typeof (lon));
        fetch('http://10.0.3.2:9200/geo/_search', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
                {
                    "query": {
                        "bool" : {
                            "must" : {
                                "match_all" : {}
                            },
                            "filter" : {
                                "geo_distance" : {
                                    "distance" : this.state.searchText+"km",
                                    "location" : {
                                        "lat" : this.state.myloc.latitude,
                                        "lon" : this.state.myloc.longitude
                                    }
                                }
                            }
                        }
                    }
                }
            )
        }).then((res)=>{
             let response=JSON.parse(res._bodyInit);
             console.log(response.hits.hits);
             this.setState({markers:response.hits.hits})
        })
            .catch((err) => {console.log(err)});
    }
    render() {
        console.log(this.state.searchText);
        this.state.markers.length==0?console.log("nullmarkers"):console.log(this.state.markers[0]._source.location.lat);
        return (
            <View style={{flex: 1, flexDirection: 'column'}}>
                <View style={{flex: 10}}>
            <MapView
                initialRegion={{
                    longitude:38.449205,
                    latitude: 55.876058,
                    latitudeDelta: 0.72,
                    longitudeDelta: 0.21,
                }}
                region={ this.state.myloc }
                style={styles.map}
            >
                {this.state.markers.length==0?<Marker
                    coordinate={this.state.myloc}
                />:this.state.markers.map((marker, key) => (
                    <Marker key={key}
                        coordinate={{latitude: marker._source.location.lat,longitude:marker._source.location.lon}}
                        title={marker._source.text}
                    />
                ))

                }
            </MapView>
                </View>
                <View style={{flex: 2}}>
                    <View >
                        <TextInput
                            placeholder='Радиус, км'
                            value={this.state.searchText}
                            onChangeText={(searchText) => this.setState({searchText})}
                        />
                    </View>
                </View>
                <View style={{flex: 2}}>
                    <View >
                        <Button
                            onPress={() => this.onPressSearch(this.state.myloc)}
                            title="Найти ближнее"
                            color="#841584"
                        />
                    </View>
                </View>
            </View>
        );
    }
}