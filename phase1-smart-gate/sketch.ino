#include <ESP32Servo.h>

// ---------------- PINS ----------------
#define TRIG_PIN 5
#define ECHO_PIN 18

#define SERVO_PIN 13

#define RED_LED 15
#define GREEN_LED 4

// ---------------- OBJECTS ----------------
Servo gateServo;

// ---------------- VARIABLES ----------------
bool gateOpen = false;

const int thresholdDistance = 20;

// ---------------- FUNCTION: Measure Distance ----------------
long measureDistance() {

  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);

  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000);

  // Ignore invalid sensor readings
  if (duration == 0) {
    return 999;
  }

  long distance = duration * 0.034 / 2;

  return distance;
}

// ---------------- FUNCTION: Blink Red LED ----------------
void blinkRedLED() {

  digitalWrite(RED_LED, HIGH);
  delay(150);

  digitalWrite(RED_LED, LOW);
  delay(150);
}

// ---------------- FUNCTION: Open Gate ----------------
void openGate() {

  Serial.println("Opening Gate...");

  digitalWrite(GREEN_LED, LOW);

  for (int pos = 0; pos <= 90; pos++) {

    gateServo.write(pos);

    blinkRedLED();
  }

  digitalWrite(RED_LED, LOW);
  digitalWrite(GREEN_LED, HIGH);

  gateOpen = true;

  Serial.println("Gate Opened");
}

// ---------------- FUNCTION: Close Gate ----------------
void closeGate() {

  Serial.println("Closing Gate...");

  digitalWrite(GREEN_LED, LOW);

  for (int pos = 90; pos >= 0; pos--) {

    gateServo.write(pos);

    blinkRedLED();
  }

  digitalWrite(RED_LED, HIGH);
  digitalWrite(GREEN_LED, LOW);

  gateOpen = false;

  Serial.println("Gate Closed");
}

// ---------------- SETUP ----------------
void setup() {

  Serial.begin(115200);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  pinMode(RED_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);

  gateServo.attach(SERVO_PIN);

  gateServo.write(0);

  digitalWrite(RED_LED, HIGH);
  digitalWrite(GREEN_LED, LOW);

  Serial.println("SMART GATE SYSTEM STARTED");
}

// ---------------- LOOP ----------------
void loop() {

  long distance = measureDistance();

  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");

  // Vehicle detected
  if (distance < thresholdDistance && !gateOpen) {

    openGate();
  }

  // Gate already open
  if (gateOpen) {

    // Path clear
    if (distance > thresholdDistance) {

      Serial.println("Path Clear. Waiting 5 seconds...");

      delay(5000);

      // Recheck for another vehicle
      distance = measureDistance();

      if (distance > thresholdDistance) {

        closeGate();
      }

      else {

        Serial.println("Another vehicle detected!");
        Serial.println("Keeping gate open...");
      }
    }
  }

  delay(500);
}