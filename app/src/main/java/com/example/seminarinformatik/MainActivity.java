package com.example.seminarinformatik;

import android.content.Intent;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity implements SensorEventListener {

    private SensorManager sensorManager;
    private Sensor accelerometer, lightSensor;
    private BallView ballView;
    private float lastLightValue = 100; // Standardwert
    private final float sensitivity = 5.0f; // Bewegungsempfindlichkeit

    // Variablen für das Logging
    private int accelerometerCount = 0;
    private int lightSensorCount = 0;
    private long startTime;
    private final Handler handler = new Handler();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        ballView = findViewById(R.id.ballView);
        sensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);

        if (sensorManager != null) {
            accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
            lightSensor = sensorManager.getDefaultSensor(Sensor.TYPE_LIGHT);
        }

        // Starte den Hintergrunddienst
        Intent serviceIntent = new Intent(this, SensorBackgroundService.class);
        startService(serviceIntent);

        // Starte Logging alle 10 Sekunden
        startTime = System.currentTimeMillis();
        handler.postDelayed(loggingRunnable, 10000); // Alle 10 Sekunden ausführen
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (accelerometer != null) {
            sensorManager.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_GAME);
        }
        if (lightSensor != null) {
            sensorManager.registerListener(this, lightSensor, SensorManager.SENSOR_DELAY_UI);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        sensorManager.unregisterListener(this);
        handler.removeCallbacks(loggingRunnable); // Stoppt den Logging-Timer, wenn die App pausiert wird
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
            accelerometerCount++; // Zähler für den Beschleunigungssensor erhöhen
            float deltaX = -event.values[0] * sensitivity;
            float deltaY = event.values[1] * sensitivity;
            ballView.updateBall(deltaX, deltaY);
        }
        else if (event.sensor.getType() == Sensor.TYPE_LIGHT) {
            lightSensorCount++; // Zähler für den Lichtsensor erhöhen
            lastLightValue = event.values[0];
            ballView.updateBackgroundAndBallColor(lastLightValue);
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        // Nicht benötigt
    }

    // Runnable für das Logging alle 10 Sekunden
    private final Runnable loggingRunnable = new Runnable() {
        @Override
        public void run() {
            long elapsedTime = System.currentTimeMillis() - startTime;
            float elapsedSeconds = elapsedTime / 1000.0f;

            // Berechnung der Messungen pro Sekunde
            float accelerometerRate = accelerometerCount / elapsedSeconds;
            float lightSensorRate = lightSensorCount / elapsedSeconds;

            // Ausgabe der Werte im Log
            Log.d("SensorLog", "Messwerte in den letzten 10 Sekunden (Foreground):");
            Log.d("SensorLog", "  - Beschleunigungssensor: " + accelerometerCount + " Messungen (" + accelerometerRate + " Messungen/Sekunde)");
            Log.d("SensorLog", "  - Lichtsensor: " + lightSensorCount + " Messungen (" + lightSensorRate + " Messungen/Sekunde)");

            // Zähler zurücksetzen
            accelerometerCount = 0;
            lightSensorCount = 0;
            startTime = System.currentTimeMillis(); // Neue Startzeit setzen

            // Wiederholung nach 10 Sekunden
            handler.postDelayed(this, 10000);
        }
    };
}
