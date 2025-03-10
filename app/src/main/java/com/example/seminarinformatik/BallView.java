package com.example.seminarinformatik;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.util.AttributeSet;
import android.view.View;

public class BallView extends View {

    private float ballX, ballY;
    private float ballRadius = 50;
    private float canvasWidth, canvasHeight;
    private Paint ballPaint, backgroundPaint;

    public BallView(Context context, AttributeSet attrs) {
        super(context, attrs);
        ballPaint = new Paint();
        backgroundPaint = new Paint();
        updateBackgroundAndBallColor(100); // Standard-Helligkeitswert setzen
    }

    public void updateBall(float deltaX, float deltaY) {
        ballX += deltaX;
        ballY += deltaY;

        // Begrenzung des Balls innerhalb des Bildschirms
        if (ballX - ballRadius < 0) ballX = ballRadius;
        if (ballX + ballRadius > canvasWidth) ballX = canvasWidth - ballRadius;
        if (ballY - ballRadius < 0) ballY = ballRadius;
        if (ballY + ballRadius > canvasHeight) ballY = canvasHeight - ballRadius;

        invalidate(); // Zeichenfläche neu zeichnen
    }

    public void updateBackgroundAndBallColor(float lightValue) {
        // Hintergrundfarbe je nach Helligkeit
        int bgColor = Color.rgb(
                Math.min(255, (int) (lightValue * 2)),
                Math.min(255, (int) (lightValue * 1.5)),
                Math.min(255, (int) (lightValue * 1))
        );

        // Ballfarbe anpassen (invertierter Wert für besseren Kontrast)
        int ballColor = Color.rgb(
                Math.max(0, 255 - (int) (lightValue * 2)),
                Math.max(0, 255 - (int) (lightValue * 1.5)),
                Math.max(0, 255 - (int) (lightValue * 1))
        );

        backgroundPaint.setColor(bgColor);
        ballPaint.setColor(ballColor);
        invalidate(); // Neuzeichnen mit neuen Farben
    }

    @Override
    protected void onSizeChanged(int w, int h, int oldw, int oldh) {
        super.onSizeChanged(w, h, oldw, oldh);
        canvasWidth = w;
        canvasHeight = h;
        ballX = w / 2;
        ballY = h / 2;
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        canvas.drawPaint(backgroundPaint); // Hintergrundfarbe setzen
        canvas.drawCircle(ballX, ballY, ballRadius, ballPaint); // Ball zeichnen
    }
}
