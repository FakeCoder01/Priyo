import React from "react";
import { Image } from "react-native";


const LogoActive = (props) => {

    return (
        <Image source={require('./logo-active.png')}  {...props}/>
    );
};


export default LogoActive;
