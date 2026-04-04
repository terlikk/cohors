# RailBot — Integracja z Klipper/Moonraker

## Jak to działa
1. Klipper kończy wydruk → wywołuje `PRINT_END` gcode macro
2. Macro wysyła HTTP request do Moonraker
3. Moonraker webhook → MQTT broker → RailBot ESP32
4. RailBot wykonuje wymianę płyty
5. RailBot raportuje "swap_complete" → MQTT → Moonraker
6. Moonraker może automatycznie startować kolejny wydruk z kolejki

## Konfiguracja Klipper (printer.cfg)

```ini
[gcode_macro PRINT_END]
gcode:
    # ... standardowy koniec wydruku (chłodzenie, parkowanie głowicy) ...
    G28 X Y              ; home X Y
    M84                  ; wyłącz silniki
    M104 S0              ; wyłącz hotend
    M140 S0              ; wyłącz bed
    # Poczekaj aż bed ostygnie do 35°C (łatwiejsze zdjęcie płyty)
    TEMPERATURE_WAIT SENSOR=heater_bed MAXIMUM=35
    # Powiadom RailBot
    RAILBOT_SWAP

[gcode_macro RAILBOT_SWAP]
gcode:
    # Wyślij request do local MQTT bridge
    {action_respond_info("RAILBOT: Requesting plate swap")}
    # Moonraker notification (obsługiwane przez plugin/skrypt)
    RESPOND PREFIX=railbot MSG=swap
```

## Moonraker + MQTT Bridge

### Opcja A: Skrypt Python (najprostsze)

Zapisz jako `/home/pi/railbot_bridge.py`:

```python
#!/usr/bin/env python3
"""
Bridge between Moonraker and RailBot via MQTT.
Listens for print completion, sends swap command.
Listens for swap_complete, can trigger next print.
"""
import json, time, requests
import paho.mqtt.client as mqtt

MOONRAKER_URL = "http://localhost:7125"
MQTT_BROKER = "localhost"  # or your MQTT broker IP
STATION_ID = 0             # which printer station this is (0-3)

# MQTT callbacks
def on_connect(client, userdata, flags, rc):
    print(f"[MQTT] Connected (rc={rc})")
    client.subscribe("railbot/event")
    client.subscribe("railbot/status")

def on_message(client, userdata, msg):
    try:
        data = json.loads(msg.payload.decode())
    except:
        return
    
    if msg.topic == "railbot/event":
        event = data.get("event", "")
        station = data.get("station", -1)
        
        if event == "swap_complete" and station == STATION_ID:
            print(f"[BRIDGE] Plate swap complete for station {station}")
            # Optionally start next print from queue
            # start_next_print()

def request_swap():
    """Send swap command to RailBot"""
    client.publish("railbot/command", json.dumps({
        "command": "swap",
        "station": STATION_ID
    }))
    print(f"[BRIDGE] Swap requested for station {STATION_ID}")

def poll_moonraker():
    """Check if print just completed"""
    try:
        r = requests.get(f"{MOONRAKER_URL}/printer/objects/query?print_stats")
        data = r.json()
        state = data["result"]["status"]["print_stats"]["state"]
        return state
    except:
        return "unknown"

# Main
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.connect(MQTT_BROKER, 1883)
client.loop_start()

last_state = "unknown"
print("[BRIDGE] RailBot-Moonraker bridge started")

while True:
    state = poll_moonraker()
    if last_state == "printing" and state == "complete":
        print("[BRIDGE] Print complete detected!")
        time.sleep(5)  # wait for bed to be clear
        request_swap()
    last_state = state
    time.sleep(10)
```

### Opcja B: Moonraker Notification (zaawansowane)

W `moonraker.conf`:
```ini
[mqtt]
address: localhost
port: 1883
enable_moonraker_api: True
status_objects:
    print_stats

[notifier railbot]
url: mqtt://localhost:1883/railbot/command
events: complete
body: {"command": "swap", "station": 0}
```

## MQTT Topics Reference

| Topic | Kierunek | Opis |
|-------|----------|------|
| `railbot/command` | → Robot | Komendy: swap, home, park, status |
| `railbot/status` | ← Robot | Cykliczny status (co 5s) |
| `railbot/event` | ← Robot | Zdarzenia: homed, plate_deposited, swap_complete |

## Przykłady komend MQTT

```bash
# Testuj ręcznie z mosquitto_pub:

# Wymień płytę na drukarce 0
mosquitto_pub -t "railbot/command" -m '{"command":"swap","station":0}'

# Rehome robota
mosquitto_pub -t "railbot/command" -m '{"command":"home"}'

# Zaparkuj
mosquitto_pub -t "railbot/command" -m '{"command":"park"}'

# Sprawdź status
mosquitto_pub -t "railbot/command" -m '{"command":"status"}'

# Nasłuchuj eventów
mosquitto_sub -t "railbot/#"
```
