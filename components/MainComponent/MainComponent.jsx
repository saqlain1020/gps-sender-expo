import React from "react";
import { StyleSheet, Text, View, Button, ToastAndroid } from "react-native";
import * as Location from "expo-location";
import socket from "../../api/socket";
import * as Application from "expo-application";
import * as Device from "expo-device";

const MainComponent = () => {
  const [location, setLocation] = React.useState(null);
  const [errorMsg, setErrorMsg] = React.useState(null);
  const [isTracking, setIsTracking] = React.useState(false);
  const [permission, setPermission] = React.useState(false);

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
    let osName = Device.osName;
    socket.emit("location", {
      latitude: location?.coords.latitude,
      longitude: location?.coords.longitude,
      osName,
      id: socket.id,
    });
  };

  React.useEffect(() => {
    let int = null;
    if (isTracking) {
      int = setInterval(() => {
        getLocation();
      }, 1000);
      socket.connect();
    } else {
      clearInterval(int);
      socket.disconnect();
    }
    return () => {
      clearInterval(int);
      socket.disconnect();
    };
  }, [isTracking]);

  React.useEffect(handleLocationSend, [location]);
  return (
    <View styles={styles.container}>
      <Button
        title={isTracking ? "Stop Tracking" : "Start Tracking"}
        // color="#841584".
        onPress={isTracking ? stopTracking : handleClick}
      />
      <Text>Latitude: {location?.coords.latitude}</Text>
      <Text>Longitude: {location?.coords.longitude}</Text>
      <Text style={{ color: "red" }}>{errorMsg}</Text>
      <Button title="Send Location" onPress={handleLocationSend} />
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
