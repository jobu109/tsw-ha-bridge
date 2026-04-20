# tsw-ha-bridge

Auto-launch Home Assistant on a Crestron TSW touch panel without killing the SD card, with working side buttons.

---

## How It Works

1. Panel boots into the CH5 app
2. CH5 app fires a webhook to Home Assistant
3. HA automation triggers a shell command
4. Shell command SSH's into the panel and runs `BROWSEROPEN`
5. Browser opens with the HA dashboard — SD card safe, side buttons active

---

## Repo Structure
tsw-ha-bridge/
├── ha-scripts/
│   ├── crestron_cmd.py
│   ├── crestron-sidekeys.js
│   ├── configuration.yaml
│   └── automations.yaml
├── utils/
│   └── keytest.html
├── dist/
│   └── crestron-ha-launcher.ch5z
└── README.md

---

## Setup

### 1. Panel SSH Commands
Run these once via SSH to configure the panel:
BROWSERCACHE DISABLE
APPKEYS ON
DEDICATEDVIDEOSUPPORT DISABLE
CAMERASTREAMENABLE OFF
BROWSERSELECT WEBVIEW
BROWSERMOBILE DESKTOP
STBYTO 0
PERIODICREBOOT ON

Then locally on the panel touchscreen:
PROJECTMODE USERPROJECT
BROWMODE KIOSK
SDCARDCOUNTER ON
REBOOT

### 2. Deploy to Home Assistant

| File | Destination |
|---|---|
| `crestron_cmd.py` | `/config/scripts/` |
| `crestron-sidekeys.js` | `/config/www/crestron-panel.js` |
| `keytest.html` | `/config/www/` |

### 3. Update HA Configuration
Merge `ha-scripts/configuration.yaml` into your HA `configuration.yaml`.
Replace all placeholder IPs and entity IDs.

### 4. Add Automations
Import `ha-scripts/automations.yaml` into HA via
Settings > Automations > three dots > Import YAML.

### 5. Deploy CH5 App
npx --package=@crestron/ch5-utilities-cli ch5-cli deploy 
-p -H <PANEL_IP> -t touchscreen dist/crestron-ha-launcher.ch5z

Panel reboots > CH5 wizard appears > enter your HA URL and webhook ID > tap Launch.

### 6. Identify Side Button Keys
Copy `keytest.html` to `/config/www/` and open
`http://<HA_IP>:8123/local/keytest.html` on the panel.
Press each button to see its key name, then update `crestron-sidekeys.js` accordingly.

---

## Adding a Second Panel

1. Add a new `shell_command` block in `configuration.yaml` with the new panel IP
2. Add a new automation in `automations.yaml` with a unique webhook ID
3. Deploy the CH5 app to the new panel with the matching webhook ID

---

## SD Card Health Check

From the panel console, run twice 10 seconds apart and compare `Current Boot Counter`:
SDCARDSTATUS

With `BROWSERCACHE DISABLE` you should see ~13 writes/sec.
If you see 30+ the cache disable did not take — verify and reboot.

---

## Credits
Based on [crestron-ha-launcher](https://github.com/mikecirioli/crestron-ha-launcher) by mikecirioli.