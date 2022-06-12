import React from "react";
import { StyleSheet, Text, View, Button, ToastAndroid } from "react-native";
import * as Location from "expo-location";
import * as Application from "expo-application";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { locationState } from "../../state/socketAtom";
import { useSocket } from "../../hooks/useSocket";
import { deviceInfoState } from "../../state/deviceAtom";
import api from "../../util/api";
import { REALTIME_SERVER } from "../../util/constants";
import useBus from "../../hooks/useBus";

const MainComponent = () => {
  const { connected, msg, location, disconnect, connect } = useSocket();
  const setLocation = useSetRecoilState(locationState);
  const deviceInfo = useRecoilValue(deviceInfoState);
  const [errorMsg, setErrorMsg] = React.useState(null);
  const [isTracking, setIsTracking] = React.useState(false);
  const [permission, setPermission] = React.useState(false);
  const [status, setStatus] = React.useState(false);
  const {busses} = useBus();
console.log(busses)
  const getLocation = async () => {
    if (!permission) {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        setIsTracking(false);
        return;
      }
      setPermission(true);
      setErrorMsg("");
    } else setIsTracking(true);
    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
  };

  const handleClick = () => {
    setErrorMsg("");
    setIsTracking(true);
  };

  const stopTracking = () => {
    setIsTracking(false);
    setLocation(null);
    setErrorMsg("");
  };

  const handleLocationSend = () => {
    // let osName = Device.osName;
    // socket.emit("location", {
    //   latitude: location?.coords.latitude,
    //   longitude: location?.coords.longitude,
    //   osName,
    //   id: socket.id,
    // });
  };
  const checkStatus = async () => {
    console.log(REALTIME_SERVER)
    console.log(api.options)
    let res = await api.get("/ping");
    console.log(res.data.status);

    setStatus(res.data.status);
  };
  React.useEffect(() => {
    let int = null;
    if (isTracking) {
      int = setInterval(() => {
        getLocation();
      }, 1000);
    } else {
      clearInterval(int);
    }
    return () => {
      clearInterval(int);
    };
  }, [isTracking]);

  return (
    <View styles={styles.container}>
      <Button
        title={isTracking ? "Stop Tracking" : "Start Tracking"}
        onPress={isTracking ? stopTracking : handleClick}
      />
      <Text>Latitude: {location?.coords.latitude}</Text>
      <Text>Longitude: {location?.coords.longitude}</Text>
      <Text style={{ color: "red" }}>{errorMsg}</Text>
      <Text>Socket connection: {connected.toString()}</Text>
      <Text>Server Message: {msg}</Text>
      <Button
        title={connected ? "Disconnect Socket" : "Connect Socket"}
        color="#841584"
        onPress={connected ? disconnect : connect}
      />
      <Text>Device Info:-</Text>
      {Object.entries(deviceInfo).map(([key, value]) => (
        <Text key={key}>
          {key}: {value}
        </Text>
      ))}
      <Button title={"Check Health"} color={status ? "rgb(0,255,0)" : "rgb(255,0,0)"} onPress={checkStatus} />
    </View>
  );
};

export default MainComponent;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    padding: 24,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
});
