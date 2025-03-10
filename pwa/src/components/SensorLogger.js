import React, { useEffect, useState, useRef } from "react";

const SensorLogger = () => {
  const [motionEventCount, setMotionEventCount] = useState(0);
  const [lightEventCount, setLightEventCount] = useState(0);
  const [useEffectCount, setUseEffectCount] = useState(0);
  const [log, setLog] = useState([]);
  const logContainerRef = useRef(null);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    let motionListener, lightSensor;

    // Zähle, wie oft useEffect ausgeführt wurde
    setUseEffectCount((prev) => prev + 1);

    // Bewegungssensor aktivieren
    if ("DeviceMotionEvent" in window) {
      motionListener = () => {
        setMotionEventCount((prev) => prev + 1);
      };
      window.addEventListener("devicemotion", motionListener);
    } else {
      console.warn("❌ Bewegungssensor wird nicht unterstützt.");
    }

    // Lichtsensor aktivieren
    if ("AmbientLightSensor" in window) {
      try {
        lightSensor = new window.AmbientLightSensor();
        lightSensor.onreading = () => setLightEventCount((prev) => prev + 1);
        lightSensor.start();
      } catch (e) {
        console.warn("❌ Lichtsensor wird nicht unterstützt:", e);
      }
    } else {
      console.warn("❌ Lichtsensor wird nicht vom Browser unterstützt.");
    }

    // Logging alle 10 Sekunden
    const interval = setInterval(() => {
      const elapsedTime = (Date.now() - startTime) / 1000;
      const motionRate = (motionEventCount / elapsedTime).toFixed(2);
      const lightRate = (lightEventCount / elapsedTime).toFixed(2);

      const newEntry = {
        id: Date.now(),
        useEffectRuns: useEffectCount,
        motionEvents: `${motionEventCount} Aufrufe (${motionRate} pro Sekunde)`,
        lightEvents: `${lightEventCount} Aufrufe (${lightRate} pro Sekunde)`,
      };

      setLog((prevLog) => [...prevLog, newEntry]);

      console.log("=======================================");
      console.log("📢 Funktionsaufrufe in den letzten 10 Sekunden:");
      console.log(`  🔄 useEffect wurde ${newEntry.useEffectRuns} mal ausgeführt`);
      console.log(`  🔴 Bewegungssensor: ${newEntry.motionEvents}`);
      console.log(`  💡 Lichtsensor: ${newEntry.lightEvents}`);
      console.log("=======================================");

      // Werte zurücksetzen
      setMotionEventCount(0);
      setLightEventCount(0);
      setStartTime(Date.now());

      // Automatisch nach unten scrollen
      setTimeout(() => {
        if (logContainerRef.current) {
          logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
      }, 100);
    }, 10000);

    return () => {
      clearInterval(interval);
      if (motionListener) window.removeEventListener("devicemotion", motionListener);
      if (lightSensor) lightSensor.stop();
    };
  }, []);

  return (
    <div>
      <h2>Sensor Logger</h2>
      <div
        ref={logContainerRef}
        style={{
          maxHeight: "300px",
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: "10px",
          background: "#f8f8f8",
          borderRadius: "8px",
          marginTop: "10px",
        }}
      >
        {log.length === 0 ? <p>Noch keine Daten erfasst...</p> : null}
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {log.map((entry) => (
            <li key={entry.id} style={{ marginBottom: "10px", padding: "5px", background: "#fff", borderRadius: "5px" }}>
              <strong>⏱ {new Date(entry.id).toLocaleTimeString()}</strong>
              <p>🔄 useEffect wurde <strong>{entry.useEffectRuns}</strong> mal ausgeführt</p>
              <p>🔴 Bewegungssensor: {entry.motionEvents}</p>
              <p>💡 Lichtsensor: {entry.lightEvents}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SensorLogger;
