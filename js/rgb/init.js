function storageAvailable(type) {
  try {
    var storage = window[type],
      x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  }
  catch(e) {
    return false;
  }
}

// Intentionally global
var accessToken;

if (storageAvailable("localStorage")) {
    if (localStorage.accessToken) {
        accessToken = localStorage.accessToken;
    }
    else {
        promptAndStoreToken();
    }
}
else {
    alert("LocalStorage is not available in this browser. This site will not function.");
}


$("#colorpicker").spectrum({
    flat: true,
    showInput: true,
    preferredFormat: "rgb",
    chooseText: "Set LEDs",
    cancelText: "",
    allowEmpty: true,

    change: function(color) { 
        //console.log(color);

        // When clearing the field, null is sent.
        if (color == null) {
            sendColor(0,0,0);
            return;
        }

        var rgb = color.toRgb();
        sendColor(rgb.r, rgb.g, rgb.b);
    }
});

function sendColor(r,g,b) {
    var colorString = r + "," + g + "," + b;
    console.log(colorString);

    if (accessToken == null) {
        promptAndStoreToken();
    }

    $.post("https://api.particle.io/v1/devices/26003a000d47343432313031/updateColor", {
        "access_token": accessToken,
        "args": colorString
    });
}

function promptAndStoreToken() {
    var response = prompt("Please enter access token.");
    if (response) {
        accessToken = response;
        localStorage.accessToken = response;
    }
}
