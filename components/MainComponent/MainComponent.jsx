import React from "react";
import { StyleSheet, Text, View, ToastAndroid } from "react-native";
import * as Location from "expo-location";
import * as Application from "expo-application";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { locationState } from "../../state/socketAtom";
import { useSocket } from "../../hooks/useSocket";
import { deviceInfoState } from "../../state/deviceAtom";
import api from "../../util/api";
import useBus from "../../hooks/useBus";

import * as Clipboard from 'expo-clipboard';
import * as TaskManager from "expo-task-manager";
import { Select, Box, CheckIcon, Center, Button, NativeBaseProvider } from "native-base";

var selectedBusId = "";
var globalIp = "";
var globalMac = "";

const LOCATION_TASK_NAME = "LOCATION_TASK_NAME";
let count = 0;
// Define the background task for location tracking
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
    // Extract location coordinates from data
    const { locations } = data;
    const location = locations[0];
    console.log(deviceInfoState.__cTag);
    if (location) {
      globalLocation = location;
      console.log("store", selectedBusId);
      console.log(
        "Location in background",
        ++count,
        location.coords.longitude,
        location.coords.latitude,
        selectedBusId
      );
      if (selectedBusId && globalIp && globalMac)
        api
          .post("/api/v1/location", {
            bus: selectedBusId,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            senderIp: globalIp,
            mac: globalMac,
          })
          .then((res) => {
            console.log("Location Posted");
          })
          .catch((err) => {
            console.log("Error Posting", err);
          });
    }
  }
});
const MainComponent = () => {
  // const { connected, msg, location, disconnect, connect } = useSocket();
  // const setLocation = useSetRecoilState(locationState);
  const deviceInfo = useRecoilValue(deviceInfoState);
  const [errorMsg, setErrorMsg] = React.useState(null);
  const [status, setStatus] = React.useState(false);
  const { busses, selected, selectBus } = useBus();
  const [isTracking, setIsTracking] = React.useState(false);

  const checkStatus = async () => {
    let res = await api.get("/ping");
    console.log(res.data.status);

    setStatus(res.data.status);
  };

  const startBackgroundUpdate = async () => {
    // Don't track position if permission is not granted
    const { granted } = await Location.getBackgroundPermissionsAsync();
    if (!granted) {
      console.log("location tracking denied");
      return;
    }

    // Make sure the task is defined otherwise do not start tracking
    const isTaskDefined = await TaskManager.isTaskDefined(LOCATION_TASK_NAME);
    if (!isTaskDefined) {
      console.log("Task is not defined");
      return;
    }

    // Don't track if it is already running in background
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (hasStarted) {
      console.log("Already started");
      setIsTracking(true);
      return;
    }

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      // For better logs, we set the accuracy to the most sensitive option
      accuracy: Location.Accuracy.BestForNavigation,
      // Make sure to enable this notification if you want to consistently track in the background
      showsBackgroundLocationIndicator: true,
      //   distanceInterval: 1,
      foregroundService: {
        notificationTitle: "Location",
        notificationBody: "Location tracking in background",
        notificationColor: "#fff",
      },
    });
    setIsTracking(true);
  };

  // Stop location tracking in background
  const stopBackgroundUpdate = async () => {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      setIsTracking(false);
      console.log("Location tacking stopped");
    }
  };

  // Request permissions right after starting the app
  React.useEffect(() => {
    const requestPermissions = async () => {
      const foreground = await Location.requestForegroundPermissionsAsync();
      if (foreground.granted) await Location.requestBackgroundPermissionsAsync();
    };
    requestPermissions();
  }, []);

  React.useEffect(() => {
    globalIp = deviceInfo.ip;
    globalMac = deviceInfo.mac;
  }, [deviceInfo]);

  return (
    <View styles={styles.container}>
      <Select
        selectedValue={selected}
        minWidth="200"
        accessibilityLabel="Choose Service"
        placeholder="Choose Bus"
        _selectedItem={{
          bg: "teal.600",
          endIcon: <CheckIcon size="5" />,
        }}
        mb={5}
        onValueChange={(itemValue) => {
          selectBus(itemValue);
          selectedBusId = itemValue
        }}
      >
        {busses.map((item) => (
          <Select.Item key={item.id} label={item.name} value={item.id} />
        ))}
      </Select>
      <Button mb={5} onPress={isTracking ? stopBackgroundUpdate : startBackgroundUpdate}>
        {isTracking ? "Stop Tracking" : "Start Tracking"}
      </Button>

      <Text style={{ color: "red" }}>{errorMsg}</Text>

      <Text>Device Info:-</Text>
      {Object.entries(deviceInfo).map(([key, value]) => (
        <Text key={key}>
          {key}: {value}
        </Text>
      ))}
      <Button
        //  color={status ? "rgb(0,255,0)" : "rgb(255,0,0)"}
        colorScheme={status ? "emerald" : "amber"}
        onPress={checkStatus}
        mt={5}
      >
        Check Health
      </Button>
      <Button
        //  color={status ? "rgb(0,255,0)" : "rgb(255,0,0)"}
        colorScheme={"cyan"}
        onPress={()=>Clipboard.setString(deviceInfo.mac)}
        mt={5}
      >
        Copy Mac
      </Button>
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
