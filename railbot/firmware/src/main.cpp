/*
 * RailBot — Firmware for automated plate swap robot
 * ESP32-S3 + TMC2209 + Servo
 * 
 * State machine that handles:
 * 1. Homing on startup
 * 2. Waiting for MQTT commands (which printer finished)
 * 3. Moving to printer → extracting plate → depositing → picking clean → inserting
 * 4. Reporting status via MQTT
 */

#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <AccelStepper.h>
#include <ESP32Servo.h>
#include <ArduinoJson.h>
#include "config.h"

// ============ Objects ============
AccelStepper stepperX(AccelStepper::DRIVER, X_STEP_PIN, X_DIR_PIN);
AccelStepper stepperY(AccelStepper::DRIVER, Y_STEP_PIN, Y_DIR_PIN);
Servo servoZ;
WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);

// ============ State Machine ============
enum State {
    STATE_INIT,
    STATE_HOMING_X,
    STATE_HOMING_Y,
    STATE_IDLE,
    STATE_MOVING_TO_PRINTER,
    STATE_EXTENDING_FORKS,
    STATE_LIFTING_PLATE,
    STATE_RETRACTING_WITH_PLATE,
    STATE_MOVING_TO_DROPOFF,
    STATE_DEPOSITING_PLATE,
    STATE_MOVING_TO_SUPPLY,
    STATE_PICKING_CLEAN_PLATE,
    STATE_MOVING_TO_PRINTER_INSERT,
    STATE_EXTENDING_CLEAN_PLATE,
    STATE_LOWERING_PLATE,
    STATE_RETRACTING_FORKS,
    STATE_RETURNING_HOME,
    STATE_ERROR,
};

State currentState = STATE_INIT;
int targetStation = -1;         // which printer to service (0-3)
bool hasPlateOnForks = false;
unsigned long stateStartTime = 0;
unsigned long lastStatusReport = 0;

// ============ Forward declarations ============
void setupWiFi();
void setupMQTT();
void mqttCallback(char* topic, byte* payload, unsigned int length);
void reconnectMQTT();
void publishStatus(const char* status, const char* detail = "");
void publishEvent(const char* event, int station = -1);
void changeState(State newState);
void runStateMachine();
bool isEndstopTriggered(int pin);
bool isHallTriggered(int pin);
bool isPlateDetected();
void enableSteppers();
void disableSteppers();
void setServoAngle(int angle);
void homeAxisX();
void homeAxisY();
long mmToStepsX(float mm);
long mmToStepsY(float mm);

// ============ Setup ============
void setup() {
    Serial.begin(115200);
    Serial.println("\n[RailBot] Starting...");

    // Endstops (INPUT_PULLUP: LOW when triggered)
    pinMode(X_MIN_PIN, INPUT_PULLUP);
    pinMode(X_MAX_PIN, INPUT_PULLUP);
    pinMode(Y_MIN_PIN, INPUT_PULLUP);
    pinMode(Y_MAX_PIN, INPUT_PULLUP);

    // Hall sensors
    pinMode(HALL_1_PIN, INPUT);
    pinMode(HALL_2_PIN, INPUT);
    pinMode(HALL_3_PIN, INPUT);
    pinMode(HALL_4_PIN, INPUT);

    // Optical sensors
    pinMode(PLATE_SENSOR_PIN, INPUT);
    pinMode(RACK_SENSOR_PIN, INPUT);

    // Stepper enable pins
    pinMode(X_EN_PIN, OUTPUT);
    pinMode(Y_EN_PIN, OUTPUT);
    disableSteppers();

    // Configure steppers
    stepperX.setMaxSpeed(X_MAX_SPEED);
    stepperX.setAcceleration(X_ACCEL);
    stepperY.setMaxSpeed(Y_MAX_SPEED);
    stepperY.setAcceleration(Y_ACCEL);

    // Servo
    servoZ.attach(Z_SERVO_PIN);
    setServoAngle(Z_DOWN_ANGLE);

    // Network
    setupWiFi();
    setupMQTT();

    changeState(STATE_HOMING_X);
    Serial.println("[RailBot] Setup complete, starting homing...");
}

// ============ Main Loop ============
void loop() {
    // Keep MQTT alive
    if (!mqtt.connected()) {
        reconnectMQTT();
    }
    mqtt.loop();

    // Run steppers (must be called frequently!)
    stepperX.run();
    stepperY.run();

    // State machine
    runStateMachine();

    // Periodic status report
    if (millis() - lastStatusReport > 5000) {
        lastStatusReport = millis();
        char detail[64];
        snprintf(detail, sizeof(detail), "pos_x=%.1f pos_y=%.1f plate=%d",
            (float)stepperX.currentPosition() / X_STEPS_PER_MM,
            (float)stepperY.currentPosition() / Y_STEPS_PER_MM,
            hasPlateOnForks ? 1 : 0);
        publishStatus(stateToString(currentState), detail);
    }
}

// ============ State Machine ============
void runStateMachine() {
    switch (currentState) {
        
        case STATE_HOMING_X:
            // Move left until X_MIN endstop
            enableSteppers();
            if (isEndstopTriggered(X_MIN_PIN)) {
                stepperX.setCurrentPosition(0);
                stepperX.stop();
                Serial.println("[HOME] X axis homed");
                changeState(STATE_HOMING_Y);
            } else if (stateStartTime == 0) {
                stateStartTime = millis();
                stepperX.setSpeed(-X_HOME_SPEED);
                stepperX.runSpeed(); // start moving
            } else {
                stepperX.runSpeed();
                // Timeout after 60 seconds
                if (millis() - stateStartTime > 60000) {
                    Serial.println("[ERROR] X homing timeout!");
                    changeState(STATE_ERROR);
                }
            }
            break;

        case STATE_HOMING_Y:
            // Retract forks until Y_MIN endstop
            if (isEndstopTriggered(Y_MIN_PIN)) {
                stepperY.setCurrentPosition(0);
                stepperY.stop();
                Serial.println("[HOME] Y axis homed");
                publishEvent("homed");
                changeState(STATE_IDLE);
            } else if (stateStartTime == 0) {
                stateStartTime = millis();
                stepperY.setSpeed(-Y_HOME_SPEED);
            } else {
                stepperY.runSpeed();
                if (millis() - stateStartTime > 30000) {
                    Serial.println("[ERROR] Y homing timeout!");
                    changeState(STATE_ERROR);
                }
            }
            break;

        case STATE_IDLE:
            disableSteppers();
            // Just waiting for MQTT command
            break;

        case STATE_MOVING_TO_PRINTER:
            enableSteppers();
            if (stepperX.distanceToGo() == 0) {
                Serial.printf("[MOVE] Arrived at station %d\n", targetStation);
                changeState(STATE_EXTENDING_FORKS);
            }
            // Safety: check X endstops
            if (isEndstopTriggered(X_MAX_PIN) && stepperX.speed() > 0) {
                stepperX.stop();
                changeState(STATE_ERROR);
            }
            break;

        case STATE_EXTENDING_FORKS:
            // Extend forks under the plate
            if (stateStartTime == 0) {
                stateStartTime = millis();
                stepperY.moveTo(mmToStepsY(Y_EXTEND_MM));
            }
            if (stepperY.distanceToGo() == 0) {
                Serial.println("[FORK] Forks extended under plate");
                changeState(STATE_LIFTING_PLATE);
            }
            if (isEndstopTriggered(Y_MAX_PIN)) {
                stepperY.stop();
                changeState(STATE_LIFTING_PLATE);
            }
            break;

        case STATE_LIFTING_PLATE:
            // Lift plate off magnetic bed
            if (stateStartTime == 0) {
                stateStartTime = millis();
                setServoAngle(Z_UP_ANGLE);
            }
            // Wait 1 second for servo to reach position
            if (millis() - stateStartTime > 1000) {
                hasPlateOnForks = true;
                Serial.println("[LIFT] Plate lifted");
                changeState(STATE_RETRACTING_WITH_PLATE);
            }
            break;

        case STATE_RETRACTING_WITH_PLATE:
            // Pull forks back with plate
            if (stateStartTime == 0) {
                stateStartTime = millis();
                stepperY.moveTo(0);
            }
            if (stepperY.distanceToGo() == 0 || isEndstopTriggered(Y_MIN_PIN)) {
                stepperY.setCurrentPosition(0);
                Serial.println("[FORK] Retracted with plate");
                changeState(STATE_MOVING_TO_DROPOFF);
            }
            break;

        case STATE_MOVING_TO_DROPOFF:
            if (stateStartTime == 0) {
                stateStartTime = millis();
                stepperX.moveTo(mmToStepsX(DROPOFF_POS_MM));
            }
            if (stepperX.distanceToGo() == 0) {
                Serial.println("[MOVE] At dropoff zone");
                changeState(STATE_DEPOSITING_PLATE);
            }
            break;

        case STATE_DEPOSITING_PLATE:
            // Extend forks to deposit, lower, retract
            if (stateStartTime == 0) {
                stateStartTime = millis();
                stepperY.moveTo(mmToStepsY(Y_EXTEND_MM / 2)); // half extend over rack
            }
            if (stepperY.distanceToGo() == 0) {
                setServoAngle(Z_DOWN_ANGLE); // drop plate
                delay(500);
                hasPlateOnForks = false;
                stepperY.moveTo(0); // retract
                publishEvent("plate_deposited", targetStation);
                changeState(STATE_MOVING_TO_SUPPLY);
            }
            break;

        case STATE_MOVING_TO_SUPPLY:
            if (stateStartTime == 0) {
                stateStartTime = millis();
                stepperY.moveTo(0); // make sure forks retracted
                stepperX.moveTo(mmToStepsX(SUPPLY_POS_MM));
            }
            if (stepperX.distanceToGo() == 0 && stepperY.distanceToGo() == 0) {
                Serial.println("[MOVE] At supply rack");
                changeState(STATE_PICKING_CLEAN_PLATE);
            }
            break;

        case STATE_PICKING_CLEAN_PLATE:
            // Extend forks under clean plate, lift, retract
            if (stateStartTime == 0) {
                stateStartTime = millis();
                stepperY.moveTo(mmToStepsY(Y_EXTEND_MM / 2));
            }
            if (stepperY.distanceToGo() == 0) {
                setServoAngle(Z_UP_ANGLE);
                delay(500);
                hasPlateOnForks = true;
                stepperY.moveTo(0);
                publishEvent("clean_plate_picked");
                changeState(STATE_MOVING_TO_PRINTER_INSERT);
            }
            break;

        case STATE_MOVING_TO_PRINTER_INSERT:
            if (stateStartTime == 0) {
                stateStartTime = millis();
                stepperX.moveTo(mmToStepsX(STATION_POS_MM[targetStation]));
            }
            if (stepperX.distanceToGo() == 0 && stepperY.distanceToGo() == 0) {
                Serial.printf("[MOVE] Back at printer %d for insert\n", targetStation);
                changeState(STATE_EXTENDING_CLEAN_PLATE);
            }
            break;

        case STATE_EXTENDING_CLEAN_PLATE:
            if (stateStartTime == 0) {
                stateStartTime = millis();
                stepperY.moveTo(mmToStepsY(Y_EXTEND_MM));
            }
            if (stepperY.distanceToGo() == 0 || isEndstopTriggered(Y_MAX_PIN)) {
                Serial.println("[FORK] Clean plate positioned");
                changeState(STATE_LOWERING_PLATE);
            }
            break;

        case STATE_LOWERING_PLATE:
            if (stateStartTime == 0) {
                stateStartTime = millis();
                setServoAngle(Z_DOWN_ANGLE); // lower onto magnetic bed
            }
            if (millis() - stateStartTime > 1000) {
                hasPlateOnForks = false;
                Serial.println("[LIFT] Plate lowered onto bed");
                changeState(STATE_RETRACTING_FORKS);
            }
            break;

        case STATE_RETRACTING_FORKS:
            if (stateStartTime == 0) {
                stateStartTime = millis();
                stepperY.moveTo(0);
            }
            if (stepperY.distanceToGo() == 0 || isEndstopTriggered(Y_MIN_PIN)) {
                stepperY.setCurrentPosition(0);
                Serial.println("[DONE] Plate swap complete!");
                publishEvent("swap_complete", targetStation);
                changeState(STATE_RETURNING_HOME);
            }
            break;

        case STATE_RETURNING_HOME:
            if (stateStartTime == 0) {
                stateStartTime = millis();
                stepperX.moveTo(mmToStepsX(PARK_POS_MM));
            }
            if (stepperX.distanceToGo() == 0) {
                Serial.println("[PARK] Robot parked");
                changeState(STATE_IDLE);
            }
            break;

        case STATE_ERROR:
            disableSteppers();
            // Publish error, wait for reset command via MQTT
            if (stateStartTime == 0) {
                stateStartTime = millis();
                publishStatus("ERROR", "Robot stopped. Send 'reset' to rehome.");
            }
            break;
    }
}

// ============ State helpers ============
void changeState(State newState) {
    Serial.printf("[STATE] %s → %s\n", stateToString(currentState), stateToString(newState));
    currentState = newState;
    stateStartTime = 0;
}

const char* stateToString(State s) {
    switch (s) {
        case STATE_INIT: return "INIT";
        case STATE_HOMING_X: return "HOMING_X";
        case STATE_HOMING_Y: return "HOMING_Y";
        case STATE_IDLE: return "IDLE";
        case STATE_MOVING_TO_PRINTER: return "MOVING_TO_PRINTER";
        case STATE_EXTENDING_FORKS: return "EXTENDING_FORKS";
        case STATE_LIFTING_PLATE: return "LIFTING";
        case STATE_RETRACTING_WITH_PLATE: return "RETRACTING";
        case STATE_MOVING_TO_DROPOFF: return "TO_DROPOFF";
        case STATE_DEPOSITING_PLATE: return "DEPOSITING";
        case STATE_MOVING_TO_SUPPLY: return "TO_SUPPLY";
        case STATE_PICKING_CLEAN_PLATE: return "PICKING";
        case STATE_MOVING_TO_PRINTER_INSERT: return "TO_INSERT";
        case STATE_EXTENDING_CLEAN_PLATE: return "INSERTING";
        case STATE_LOWERING_PLATE: return "LOWERING";
        case STATE_RETRACTING_FORKS: return "RETRACTING_FORKS";
        case STATE_RETURNING_HOME: return "PARKING";
        case STATE_ERROR: return "ERROR";
        default: return "UNKNOWN";
    }
}

// ============ MQTT ============
void setupWiFi() {
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    Serial.print("[WiFi] Connecting");
    int retries = 0;
    while (WiFi.status() != WL_CONNECTED && retries < 30) {
        delay(500);
        Serial.print(".");
        retries++;
    }
    Serial.printf("\n[WiFi] Connected: %s\n", WiFi.localIP().toString().c_str());
}

void setupMQTT() {
    mqtt.setServer(MQTT_SERVER, MQTT_PORT);
    mqtt.setCallback(mqttCallback);
    reconnectMQTT();
}

void reconnectMQTT() {
    if (mqtt.connected()) return;
    Serial.print("[MQTT] Connecting...");
    if (mqtt.connect(MQTT_CLIENT_ID, MQTT_USER, MQTT_PASS)) {
        Serial.println(" connected!");
        mqtt.subscribe(TOPIC_COMMAND);
        publishStatus("online");
    } else {
        Serial.printf(" failed (rc=%d)\n", mqtt.state());
    }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
    char msg[256];
    int len = min((unsigned int)255, length);
    memcpy(msg, payload, len);
    msg[len] = '\0';

    Serial.printf("[MQTT] %s: %s\n", topic, msg);

    JsonDocument doc;
    if (deserializeJson(doc, msg)) {
        Serial.println("[MQTT] Invalid JSON");
        return;
    }

    const char* cmd = doc["command"];
    if (!cmd) return;

    if (strcmp(cmd, "swap") == 0) {
        int station = doc["station"] | -1;
        if (station < 0 || station >= NUM_STATIONS) {
            publishStatus("error", "Invalid station number");
            return;
        }
        if (currentState != STATE_IDLE) {
            publishStatus("busy", "Robot is busy, queuing not implemented yet");
            return;
        }
        targetStation = station;
        Serial.printf("[CMD] Swap plate at station %d\n", station);
        stepperX.moveTo(mmToStepsX(STATION_POS_MM[station]));
        changeState(STATE_MOVING_TO_PRINTER);

    } else if (strcmp(cmd, "home") == 0 || strcmp(cmd, "reset") == 0) {
        Serial.println("[CMD] Homing...");
        changeState(STATE_HOMING_X);

    } else if (strcmp(cmd, "park") == 0) {
        if (currentState == STATE_IDLE) {
            stepperX.moveTo(mmToStepsX(PARK_POS_MM));
            changeState(STATE_RETURNING_HOME);
        }

    } else if (strcmp(cmd, "status") == 0) {
        publishStatus(stateToString(currentState));

    } else if (strcmp(cmd, "calibrate") == 0) {
        // Move to a station for position calibration
        int station = doc["station"] | 0;
        float pos = doc["position"] | -1.0f;
        if (pos >= 0) {
            // Save calibrated position (would need EEPROM/NVS for persistence)
            Serial.printf("[CAL] Station %d = %.1f mm\n", station, pos);
        }
    }
}

void publishStatus(const char* status, const char* detail) {
    JsonDocument doc;
    doc["state"] = status;
    doc["station"] = targetStation;
    doc["plate"] = hasPlateOnForks;
    doc["pos_x"] = (float)stepperX.currentPosition() / X_STEPS_PER_MM;
    if (strlen(detail) > 0) doc["detail"] = detail;
    
    char buf[256];
    serializeJson(doc, buf);
    mqtt.publish(TOPIC_STATUS, buf);
}

void publishEvent(const char* event, int station) {
    JsonDocument doc;
    doc["event"] = event;
    doc["station"] = station >= 0 ? station : targetStation;
    doc["timestamp"] = millis();
    
    char buf[256];
    serializeJson(doc, buf);
    mqtt.publish(TOPIC_EVENT, buf);
}

// ============ Hardware helpers ============
bool isEndstopTriggered(int pin) {
    return digitalRead(pin) == LOW;
}

bool isHallTriggered(int pin) {
    return digitalRead(pin) == LOW;
}

bool isPlateDetected() {
    return digitalRead(PLATE_SENSOR_PIN) == LOW;
}

void enableSteppers() {
    digitalWrite(X_EN_PIN, LOW);
    digitalWrite(Y_EN_PIN, LOW);
}

void disableSteppers() {
    digitalWrite(X_EN_PIN, HIGH);
    digitalWrite(Y_EN_PIN, HIGH);
}

void setServoAngle(int angle) {
    servoZ.write(angle);
}

long mmToStepsX(float mm) {
    return (long)(mm * X_STEPS_PER_MM);
}

long mmToStepsY(float mm) {
    return (long)(mm * Y_STEPS_PER_MM);
}
