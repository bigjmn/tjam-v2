import { StyleProp, Text, TextStyle } from 'react-native';
// import { defaultStyle, italicStyle, voteAnswerStyle } from '';
import { useTheme } from '../../hooks/useTheme';
interface ThemedTextProps {
    style?: StyleProp<TextStyle>; 
    title?: boolean;
    variant?: TextVariant;
    [key: string]: any; 
}
const ThemedText = ({ style, title = false, variant="regular", ...props}: ThemedTextProps) => {
    const { theme, colors } = useTheme()

    const textColor = title ? colors.title : colors.text 

    if (variant === "title"){
        return (
            <Text 
                style={[{color: textColor, fontFamily: "Roboto-Bold", fontWeight: 700, fontSize:70}, style]}
                {...props}
                />
        )
    }

    if (variant === "header"){
        return (
            <Text 
                style={[{color: textColor, fontFamily: "Roboto-Medium", fontWeight: 500, fontSize:30}, style]}
                {...props}
                />
        )
    }
    if (variant === "header2"){
        return (
            <Text 
                style={[{color: textColor, fontFamily: "Roboto-Medium", fontWeight: 500, fontSize:24}, style]}
                {...props}
                />
        )
    }
    if (variant === "medium"){
        return (
            <Text 
                style={[{color: textColor, fontFamily: "Roboto-Medium", fontWeight: 500, fontSize:16}, style]}
                {...props}
                />
        )
    }
    if (variant === "light"){
        return (
            <Text 
                style={[{color: textColor, fontFamily: "Roboto-Light", fontWeight: 300, fontSize:16}, style]}
                {...props}
                />
        )
    }
    if (variant === "strong"){
        return (
            <Text 
                style={[{color: textColor, fontFamily: "Roboto-Bold", fontWeight: 700, fontSize:16}, style]}
                {...props}
                />
        )
    }
    if (variant === "regular"){
        return (
            <Text 
                style={[{color: textColor, fontFamily: "Roboto-Regular", fontWeight: 400, fontSize:16}, style]}
                {...props}
                />
        )
    }
    if (variant === "soft"){
        return (
            <Text 
                style={[{color: textColor, fontFamily: "Roboto-Medium", fontSize:16, opacity:.5}, style]}
                {...props}
                />
        )
    }
    if (variant === "uber"){
        return (
            <Text 
                style={[{color: textColor, fontFamily: "UberMove-Medium", fontSize:22}, style]}
                {...props}
                />
        )
    }
    
    
    if (variant === "italic"){
        return (
            <Text 
                style={[{color: textColor, fontFamily: "Roboto-LightItalic", fontSize:16}, style]}
                {...props}
                />
        )

    }


    return (
        <Text 
            style={[{color: textColor, fontFamily: "Roboto-Regular", fontWeight:400, fontSize: 16}, style]}
            {...props}
            />
    )
}

export default ThemedText