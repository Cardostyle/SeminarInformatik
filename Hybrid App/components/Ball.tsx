import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions, Text, ScrollView, AppState } from "react-native";
import { Accelerometer, LightSensor } from "expo-sensors";
import { Svg, Circle } from "react-native-svg";
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const { width, height } = Dimensions.get("window");
const BALL_RADIUS = 40;
const SENSITIVITY = 50;

// **Globale Variablen für Zählung der Sensoraufrufe**
let globalAccelCount = 0;
let globalLightCount = 0;

export default function SensorBallApp() {
  const [ballPosition, setBallPosition] = useState({ x: width / 2, y: height / 2 });
  const [lightIntensity, setLightIntensity] = useState(100);
  const [logs, setLogs] = useState([]);
  const [cpuUsage, setCpuUsage] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState("");

  useEffect(() => {
    let startTime = Date.now();

    // **Beschleunigungssensor überwachen & Bewegungen registrieren**
    let accelerometerSubscription = Accelerometer.addListener(({ x, y }) => {
      globalAccelCount++; // Globale Zählung der Aufrufe

      setBallPosition((prev) => ({
        x: Math.min(Math.max(prev.x + x * SENSITIVITY, BALL_RADIUS), width - BALL_RADIUS),
        y: Math.min(Math.max(prev.y - y * SENSITIVITY, BALL_RADIUS), height - BALL_RADIUS),
      }));
    });

    // **Lichtsensor überwachen**
    let lightSubscription = LightSensor.addListener(({ illuminance }) => {
      globalLightCount++; // Globale Zählung der Aufrufe
      setLightIntensity(illuminance);
    });

    // **Alle 10 Sekunden Sensorlog ausgeben & Zählung zurücksetzen**
    const interval = setInterval(() => {
      const now = new Date();
      const timeString = now.toLocaleTimeString();

      setLogs((prevLogs) => [
        `⏱️ ${timeString} | Accel: ${globalAccelCount} in 10s (${(globalAccelCount / 10).toFixed(2)} /s) | Light: ${globalLightCount} in 10s (${(globalLightCount / 10).toFixed(2)} /s)`,
        ...prevLogs.slice(0, 10),
      ]);

      // **Globale Variablen zurücksetzen**
      globalAccelCount = 0;
      globalLightCount = 0;

      setLastUpdateTime(timeString);
    }, 10000);

    return () => {
      accelerometerSubscription.remove();
      lightSubscription.remove();
      clearInterval(interval);
    };
  }, []);

  // Berechnung der CPU-Auslastung (Simulation)
  useEffect(() => {
    const interval = setInterval(() => {
      const usage = Math.random() * 10 + 20; // Simulierter CPU-Wert (20-30%)
      setCpuUsage(usage.toFixed(2));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const backgroundColor = `rgba(${255 - lightIntensity}, ${255 - lightIntensity}, ${255 - lightIntensity}, 1)`;
  const ballColor = `rgba(${lightIntensity}, ${lightIntensity}, ${lightIntensity}, 1)`;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Svg height={height} width={width}>
        <Circle cx={ballPosition.x} cy={ballPosition.y} r={BALL_RADIUS} fill={ballColor} />
      </Svg>

      {/* Logging-Anzeige */}
      <View style={styles.logContainer}>
        <Text style={styles.logTitle}>Sensor Logs (letzte 10s)</Text>
        <ScrollView style={styles.logBox}>
          {logs.map((log, index) => (
            <Text key={index} style={styles.logText}>{log}</Text>
          ))}
        </ScrollView>
        <Text style={styles.cpuText}>CPU-Auslastung: {cpuUsage}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logContainer: {
    position: "absolute",
    bottom: 20,
    width: "90%",
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 10,
    padding: 10,
  },
  logTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  logBox: {
    maxHeight: 100,
    marginTop: 5,
  },
  logText: {
    color: "white",
    fontSize: 14,
  },
  cpuText: {
    color: "white",
    fontSize: 14,
    marginTop: 5,
    textAlign: "center",
  },
});
