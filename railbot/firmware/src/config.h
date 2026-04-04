#pragma once

// ============ WiFi ============
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASS "YOUR_WIFI_PASS"

// ============ MQTT ============
#define MQTT_SERVER "YOUR_MQTT_BROKER_IP"
#define MQTT_PORT 1883
#define MQTT_USER ""
#define MQTT_PASS ""
#define MQTT_CLIENT_ID "railbot-01"

// MQTT Topics
#define TOPIC_COMMAND "railbot/command"        // incoming commands
#define TOPIC_STATUS  "railbot/status"         // outgoing status
#define TOPIC_EVENT   "railbot/event"          // outgoing events

// ============ Pins - Axis X (rail movement) ============
#define X_STEP_PIN    1
#define X_DIR_PIN     2
#define X_EN_PIN      3
#define X_UART_PIN    4

// ============ Pins - Axis Y (fork in/out) ============
#define Y_STEP_PIN    5
#define Y_DIR_PIN     6
#define Y_EN_PIN      7
#define Y_UART_PIN    8

// ============ Pins - Axis Z (lift servo) ============
#define Z_SERVO_PIN   9

// ============ Pins - Endstops ============
#define X_MIN_PIN     10   // left end of rail
#define X_MAX_PIN     11   // right end of rail
#define Y_MIN_PIN     12   // fork retracted
#define Y_MAX_PIN     13   // fork extended

// ============ Pins - Hall Sensors (station positions) ============
#define HALL_1_PIN    14   // printer 1
#define HALL_2_PIN    15   // printer 2
#define HALL_3_PIN    16   // printer 3
#define HALL_4_PIN    17   // printer 4
#define NUM_STATIONS  4

// ============ Pins - Optical Sensors ============
#define PLATE_SENSOR_PIN   18   // plate on forks
#define RACK_SENSOR_PIN    19   // rack full/empty

// ============ Pins - Status LED ============
#define LED_PIN       20

// ============ Motion Parameters ============
#define X_STEPS_PER_MM     80    // 200 steps * 16 microsteps / (20T * 2mm GT2) = 80
#define Y_STEPS_PER_MM     400   // 200 * 16 / (T8 lead 8mm) = 400

#define X_MAX_SPEED        10000  // steps/sec (~125 mm/s)
#define X_ACCEL            5000   // steps/sec² 
#define X_HOME_SPEED       3000   // steps/sec (~37 mm/s)

#define Y_MAX_SPEED        4000   // steps/sec (~10 mm/s, slower for safety)
#define Y_ACCEL            2000
#define Y_HOME_SPEED       1500

#define Y_EXTEND_MM        220    // how far forks extend
#define Z_DOWN_ANGLE       0      // servo angle: plate down (on bed)
#define Z_UP_ANGLE         18     // servo angle: plate lifted

// ============ Station Positions (calibrate after build!) ============
// These are X positions in mm from home (left endstop)
// Adjust after physical calibration
static const float STATION_POS_MM[NUM_STATIONS] = {
    100.0,   // printer 1
    400.0,   // printer 2
    700.0,   // printer 3
    1000.0,  // printer 4
};

// Special positions
#define DROPOFF_POS_MM     1300.0   // where to drop finished plates
#define SUPPLY_POS_MM      1400.0   // where to pick clean plates
#define PARK_POS_MM        0.0      // home/park position
