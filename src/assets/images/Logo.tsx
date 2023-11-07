import * as React from "react";
import { Image } from "react-native";

const Logo = (props) => {
    return (
        <Image source={require('./logo.png')}  {...props}/>
    );
};


export default Logo;
