import {useWindowDimensions} from "react-native";

export function useDevice() {
     const dimensions = useWindowDimensions();
     const isLargeScreen = dimensions.width >= 768;
     
     return {
          isLargeScreen
     }
}