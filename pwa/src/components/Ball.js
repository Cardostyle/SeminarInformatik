import React, { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const Ball = () => {
  const ballRef = useRef();
  const [position, setPosition] = useState([0, 0, 0]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [motionEventCount, setMotionEventCount] = useState(0);
  const [lightEventCount, setLightEventCount] = useState(0);
  const [log, setLog] = useState([]);
  const [startTime, setStartTime] = useState(Date.now());
  const logContainerRef = useRef(null);

  // **🔧 Fix: Speichere letzte Event-Zeitpunkte in Refs**
  const lastMotionTime = useRef(Date.now());
  const lastLightTime = useRef(Date.now());

  useEffect(() => {
    if ("DeviceMotionEvent" in window) {
      const handleMotion = (event) => {
        const now = Date.now();
        if (now - lastMotionTime.current >= 1000) {
          setMotionEventCount((prev) => prev + 1);
          lastMotionTime.current = now;
        }

        const { x, y } = event.accelerationIncludingGravity || { x: 0, y: 0 };
        setPosition((prev) => [
          THREE.MathUtils.clamp(prev[0] - x * 0.1, -2, 2),
          THREE.MathUtils.clamp(prev[1] - y * 0.1, -2, 2),
          prev[2]
        ]);
      };

      window.addEventListener("devicemotion", handleMotion);
      return () => window.removeEventListener("devicemotion", handleMotion);
    } else {
      console.warn("❌ Bewegungssensor nicht unterstützt.");
    }
  }, []);

  useEffect(() => {
    if ("AmbientLightSensor" in window) {
      try {
        const sensor = new window.AmbientLightSensor();
        sensor.onreading = () => {
          const now = Date.now();
          if (now - lastLightTime.current >= 1000) {
            setLightEventCount((prev) => prev + 1);
            lastLightTime.current = now;
          }
          setIsDarkMode(sensor.illuminance < 10);
        };
        sensor.onerror = (event) => console.error("Lichtsensor Fehler:", event.error);
        sensor.start();
      } catch (e) {
        console.warn("❌ Lichtsensor nicht unterstützt:", e);
      }
    } else {
      console.warn("❌ Lichtsensor wird nicht vom Browser unterstützt.");
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsedTime = (Date.now() - startTime) / 1000;
      const motionRate = motionEventCount > 0 ? (motionEventCount / elapsedTime).toFixed(2) : "❌ Nicht erkannt";
      const lightRate = lightEventCount > 0 ? (lightEventCount / elapsedTime).toFixed(2) : "❌ Nicht erkannt";

      const newEntry = {
        id: Date.now(),
        motionEvents: `${motionEventCount} Aufrufe (${motionRate} pro Sekunde)`,
        lightEvents: `${lightEventCount} Aufrufe (${lightRate} pro Sekunde)`,
      };

      setLog((prevLog) => [...prevLog, newEntry]);

      console.log("=======================================");
      console.log("📢 SensorLog: Messwerte in den letzten 10 Sekunden");
      console.log(`  🔴 Bewegungssensor: ${newEntry.motionEvents}`);
      console.log(`  💡 Lichtsensor: ${newEntry.lightEvents}`);
      console.log("=======================================");

      setMotionEventCount(0);
      setLightEventCount(0);
      setStartTime(Date.now());

      setTimeout(() => {
        if (logContainerRef.current) {
          logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
      }, 100);
    }, 10000);

    return () => clearInterval(interval);
  }, [motionEventCount, lightEventCount]);

  return (
    <div style={{ backgroundColor: isDarkMode ? "black" : "white", height: "100vh", transition: "background 0.5s", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      
      <div
        ref={logContainerRef}
        style={{
          maxHeight: "200px",
          width: "90%",
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: "10px",
          background: "#f8f8f8",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        {log.length === 0 ? <p>📢 Warte auf erste Sensordaten...</p> : null}
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {log.map((entry) => (
            <li key={entry.id} style={{ marginBottom: "10px", padding: "5px", background: "#fff", borderRadius: "5px" }}>
              <strong>⏱ {new Date(entry.id).toLocaleTimeString()}</strong>
              <p>🔴 Bewegungssensor: {entry.motionEvents}</p>
              <p>💡 Lichtsensor: {entry.lightEvents}</p>
            </li>
          ))}
        </ul>
      </div>

      <Canvas camera={{ position: [0, 0, 5] }} style={{ width: "100%", height: "60vh" }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <mesh ref={ballRef} position={position}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color={isDarkMode ? "white" : "black"} />
        </mesh>
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default Ball;
