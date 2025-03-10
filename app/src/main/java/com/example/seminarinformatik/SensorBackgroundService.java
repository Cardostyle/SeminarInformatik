package com.example.seminarinformatik;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.util.Log;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class SensorBackgroundService extends Service implements SensorEventListener {

    private SensorManager sensorManager;
    private Sensor accelerometer, lightSensor;
    private int accelerometerCount = 0;
    private int lightSensorCount = 0;
    private long startTime;
    private final Handler handler = new Handler();
    private static final String CHANNEL_ID = "SensorLoggingChannel";

    @Override
    public void onCreate() {
        super.onCreate();
        sensorManager = (SensorManager) getSystemService(SENSOR_SERVICE);

        if (sensorManager != null) {
            accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
            lightSensor = sensorManager.getDefaultSensor(Sensor.TYPE_LIGHT);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService();
        }

        startTime = System.currentTimeMillis();
        handler.postDelayed(loggingRunnable, 10000);
    }

    private void startForegroundService() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Sensor Logging Service",
                    NotificationManager.IMPORTANCE_LOW);
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Sensor-Tracking läuft")
                .setContentText("Die Sensoren werden weiterhin im Hintergrund überwacht.")
                .setSmallIcon(R.drawable.ic_launcher_foreground)
                .build();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(1, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_HEALTH);
        } else {
            startForeground(1, notification);
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (accelerometer != null) {
            sensorManager.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_GAME);
        }
        if (lightSensor != null) {
            sensorManager.registerListener(this, lightSensor, SensorManager.SENSOR_DELAY_UI);
        }
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        sensorManager.unregisterListener(this);
        handler.removeCallbacks(loggingRunnable);
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
            accelerometerCount++;
        } else if (event.sensor.getType() == Sensor.TYPE_LIGHT) {
            lightSensorCount++;
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        // Nicht benötigt
    }

    private final Runnable loggingRunnable = new Runnable() {
        @Override
        public void run() {
            long elapsedTime = System.currentTimeMillis() - startTime;
            float elapsedSeconds = elapsedTime / 1000.0f;

            float accelerometerRate = accelerometerCount / elapsedSeconds;
            float lightSensorRate = lightSensorCount / elapsedSeconds;

            Log.d("SensorLog", "Messwerte in den letzten 10 Sekunden (Background):");
            Log.d("SensorLog", "  - Beschleunigungssensor: " + accelerometerCount + " Messungen (" + accelerometerRate + " Messungen/Sekunde)");
            Log.d("SensorLog", "  - Lichtsensor: " + lightSensorCount + " Messungen (" + lightSensorRate + " Messungen/Sekunde)");

            accelerometerCount = 0;
            lightSensorCount = 0;
            startTime = System.currentTimeMillis();
            handler.postDelayed(this, 10000);
        }
    };
}
