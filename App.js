import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import MainComponent from "./components/MainComponent/MainComponent";
import { RecoilRoot } from "recoil";
import { NativeBaseProvider, Box } from "native-base";

export default function App() {
  return (
    <RecoilRoot>
      <NativeBaseProvider>
        <View style={styles.container}>
          <MainComponent />
          <StatusBar style="auto" />
        </View>
      </NativeBaseProvider>
    </RecoilRoot>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
