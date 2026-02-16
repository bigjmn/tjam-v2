import { DimensionValue, View } from "react-native";

interface SpacerProps {
    width?: DimensionValue | number;
    height?: number;
}

const Spacer: React.FC<SpacerProps> = ({ width = "100%", height = 40 }) => {
    return (
        <View style={{ width, height }} />
    );
};

export default Spacer;