// Shelly program to handle the flow temperature for a underfloor heating system getting to high temperature

let temperatureCelsiusFlow = null;
let temperatureCelsiusReturn = null;
let isCheckTemperatureRunning = false;
let isResetTooglesRunning = false;

function checkTemperatureFlow() {
  Shelly.call(
    "http.get", 
    { "url": "http://192.168.1.179/rpc/Temperature.GetStatus?id=100" },
    function(response) {
      if (response.code === 200 && response.body) {
        var data = JSON.parse(response.body);
        temperatureCelsiusFlow = data.tC; // Update the global variable
        print("Flow Temperature: ", temperatureCelsiusFlow, " Celsius");
      } else {
        print("Error or no data");
      }
    }
  );
}

function checkTemperatureReturn() {
  Shelly.call(
    "http.get", 
    { "url": "http://192.168.1.179/rpc/Temperature.GetStatus?id=101" },
    function(response) {
      if (response.code === 200 && response.body) {
        var data = JSON.parse(response.body);
        temperatureCelsiusReturn = data.tC; // Update the global variable
        print("Return Temperature: ", temperatureCelsiusReturn, " Celsius");
      } else {
        print("Error or no data");
      }
    }
  );
}

function checkTemperature() {
  print("Try to start checkTemperature")
  if (isResetTooglesRunning) return;
  isCheckTemperatureRunning = true;
  // Ensure both temperatures are available before evaluating
  if (temperatureCelsiusFlow !== null && temperatureCelsiusReturn !== null) {
    let temperature = temperatureCelsiusFlow;
    print("----------------------------------------------");
    print("Pump check, actual temperature: ", temperature);
    
    if (temperature > 44) {
      // Turn on Output 1
      Shelly.call("Switch.set", {'id': 1, 'on': false});
      Shelly.call("Switch.set", {'id': 0, 'on': true, 'toggle_after': 50});
      print("Temperature really high -> lowering");
    }
    if (temperature > 42 && temperature <= 44) {
      // Turn on Output 1
      Shelly.call("Switch.set", {'id': 1, 'on': false});
      Shelly.call("Switch.set", {'id': 0, 'on': true, 'toggle_after': 40});
      print("Temperature really high -> lowering");
    }
    else if (temperature > 40 && temperature <= 42) {
      // Turn on Output 1
      Shelly.call("Switch.set", {'id': 1, 'on': false});
      Shelly.call("Switch.set", {'id': 0, 'on': true, 'toggle_after': 10});
      print("Temperature high -> lowering");
    }
    else if (temperature >= 39 && temperature <= 40) {
      // Turn on Output 1
      Shelly.call("Switch.set", {'id': 1, 'on': false});
      Shelly.call("Switch.set", {'id': 0, 'on': true, 'toggle_after': 3});
      print("Temperature high -> lowering");
    }
    // Check if the temperature is greater than 38 degrees
    else if (temperature >= 5 && temperature <= 31) {
      // Turn on Output 2
      Shelly.call("Switch.set", {'id': 0, 'on': false});
      Shelly.call("Switch.set", {'id': 1, 'on': true, 'toggle_after': 30});
      print("Temperature really low -> getting higher");
    }  
    else if (temperature > 31 && temperature <= 35) {
      // Turn on Output 2
      Shelly.call("Switch.set", {'id': 0, 'on': false});
      Shelly.call("Switch.set", {'id': 1, 'on': true, 'toggle_after': 10});
      print("Temperature low -> getting higher");
    }
  }
  else{
        print("Error: Getting back NULL from at least one sensor!")
  }
  print("----------------------------------------------");
  isCheckTemperatureRunning = false;
}

function resetToogles() {
  if (isCheckTemperatureRunning) return;
  isResetTooglesRunning = true;
  // reset Toogles from time to time to avoid pushed toogles for longer term
  Shelly.call("Switch.set", {'id': 1, 'on': false});
  Shelly.call("Switch.set", {'id': 0, 'on': false});
  print("resetting both toogles...");
  isResetTooglesRunning = false;
}
Timer.set(
  601000,
  true,
  resetToogles
);
Timer.set(
  60000,
  true,
  checkTemperature
);
Timer.set(
  30000,
  true,
  checkTemperatureFlow
);
Timer.set(
  30000,
  true,
  checkTemperatureReturn
);