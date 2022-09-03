import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import api from "../../util/api";

const LOCATION_TASK_NAME = "LOCATION_TASK_NAME";
let foregroundSubscription = null;
let count = 0;
let globalLocation = null;
// Define the background task for location tracking
// TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
//   if (error) {
//     console.error(error);
//     return;
//   }
//   if (data) {
//     // Extract location coordinates from data
//     const { locations } = data;
//     const location = locations[0];
//     if (location) {
//       globalLocation = location;
//       console.log("Location in background", ++count, location.coords.longitude, location.coords.latitude);
      
      
//     }
//   }
// });

export default function App() {
  // Define position state: {latitude: number, longitude: number}

  // Start location tracking in background
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
  };

  // Stop location tracking in background
  const stopBackgroundUpdate = async () => {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log("Location tacking stopped");
    }
  };



  // Request permissions right after starting the app
  useEffect(() => {
    const requestPermissions = async () => {
      const foreground = await Location.requestForegroundPermissionsAsync();
      if (foreground.granted) await Location.requestBackgroundPermissionsAsync();
    };
    requestPermissions();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.separator} />
      <Button onPress={startBackgroundUpdate} title="Start in background" color="green" />
      <View style={styles.separator} />
      <Button onPress={stopBackgroundUpdate} title="Stop in background" color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    marginTop: 15,
  },
  separator: {
    marginVertical: 8,
  },
});
