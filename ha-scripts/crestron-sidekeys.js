// ------------------------------------------------------------------------------
// TSW-HA-Bridge — Side button handler
// Copy to /config/www/crestron-panel.js in Home Assistant
// Loaded globally via configuration.yaml frontend > extra_js_url_es5
// Only activates on the Crestron panel via user agent guard
// ------------------------------------------------------------------------------

(function () {
  // Only run on the Crestron panel browser
  if (!navigator.userAgent.includes("CrBrowser")) return;

  const HA_URL = "http://192.168.1.167:8123";  // your HA URL
  const TOKEN  = "YOUR_LONG_LIVED_ACCESS_TOKEN"; // HA long-lived access token

  // Call a HA service via REST API
  function callService(domain, service, data = {}) {
    fetch(`${HA_URL}/api/services/${domain}/${service}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }

  // Navigate to a HA dashboard path
  function navigate(path) {
    window.location.href = `${HA_URL}${path}`;
  }

  // ------------------------------------------------------------------------------
  // Button mappings — TSW-1060 key names:
  //   BrowserBack     = top button (Power icon)
  //   Home            = second button (Home icon)
  //   AudioVolumeUp   = third button (Up arrow)
  //   AudioVolumeMute = fourth button (Lightbulb)
  //   AudioVolumeDown = fifth button (Down arrow)
  // ------------------------------------------------------------------------------
  const keyMap = {
    "BrowserBack": () => navigate("/lovelace/home"),
    "Home":        () => navigate("/lovelace/home"),
    "AudioVolumeUp":   () => callService("light", "turn_on",  { entity_id: "light.YOUR_LIGHT" }),
    "AudioVolumeDown": () => callService("light", "turn_off", { entity_id: "light.YOUR_LIGHT" }),
    "AudioVolumeMute": () => callService("scene", "turn_on",  { entity_id: "scene.YOUR_SCENE" }),
  };

  document.addEventListener("keydown", function (e) {
    const action = keyMap[e.key];
    if (action) {
      e.preventDefault();
      action();
    }
  });

})();