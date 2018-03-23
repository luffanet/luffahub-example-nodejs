const SocketIO = require('socket.io-client');

// Get a valid token from LuffaHub if neeeded.
const URL = `https://io.luffanet.com.tw?token=${process.env.TOKEN}`;

const client = SocketIO(URL, {
  secure: true, // It should be true to connect to LuffaHub
});

client.on('connect', () => {

  console.log('===', 'Client connected');

  // After connect, we could send command to Hub.
  // It is not necessary with setTimeout in actual usage.
  setTimeout(trySendCommandAfterConnect, 3000);

})

/*
 *   Listen to data event.
 *
 *   - All information triggered from gateway will be catched here.
 */
client.on('data', function(data) {
  Object.keys(data).forEach(type => {
    switch (type) {

      case 'mac': // MAC address for the data coming from.
        return;

      case 'eventlog':
        console.log('===', 'Get a event from device');
        break;

      case 'socketstatus':
        console.log('===', 'Get a gateway info status changed');
        break;

      case 'info':
        console.log('===', 'Get a gateway info');
        break;

      case 'device':
        console.log('===', 'Get a device list from a gateway');
        break;

      case 'macro':
        console.log('===', 'Get a event from triggered macro');
        break;

      case 'network':
        console.log('===', 'Get a user defined data from gateway. Rooms/Scenes/Macro/Namings');
        break;

      case 'timezone':
        console.log('===', 'Get a timezone from gateway');
        break;

      case 'authcode':
        console.log('===', 'Get a auth code from gateway');
        break;

      case 'usercode':
        console.log('===', 'Get a usercode from gateway. It is usually door lock password.');
        break;

      case 'control':
        console.log('===', 'Get a control result');
        break;

      case 'twins':
        console.log('===', 'Get a twins from gateway. Store the name in response in order to restore');
        break;

      case 'juice':
        console.log('===', 'Get a juice analysis result');
        break;
    }

    // show about data content
    console.log(type, JSON.stringify(data[type]), '\n');
  });
});

// Send commands
function trySendCommandAfterConnect() {
  // Perform functions below with interval of 1secs
  // In actual usage, it is not necessary to have the interval.
  [
    sendSwitchCommand,
    sendDoSceneCommand,
    sendReloadCommand,
    sendSimpleAVControlCommand,
    sendThermostatCommand,
    sendUserCodeListCommand,
    sendUserCodeSetCommand,
    sendUserCodeRemoveCommand,
    // sendTwinsBackupCommand,
    // sendTwinsRestoreCommand,
    sendJuiceCommand
  ]
  .forEach((c, i) => setTimeout(c, 1000 * i));
}

// Switch a device, includes ON/OFF and level
function sendSwitchCommand() {
  console.log('===', 'Send switch command');
  client.emit('switch', {
    mac: '18CC230027DC', // MAC address registered in Hub. You may bind it into Hub first.
    uid: 300, // Device ID
    cid: 0, // Channel ID
    val: 255 // Switch Level, 0 for OFF, 255 for ON, 0~99 for dimmer level.
  });
}

// Perform a scene
function sendDoSceneCommand() {
  console.log('===', 'Send perform scene command');
  client.emit('doscene', {
    mac: '18CC230027DC', // MAC address registered in Hub. You may bind it into Hub first.
    val: 'Wake up' // The name of scene
  });
}

// Reload a gateway information and device list
function sendReloadCommand() {
  console.log('===', 'Send reload command');
  client.emit('reload', {
    mac: '18CC230027DC', // MAC address registered in Hub. You may bind it into Hub first.
  });
}

// Control a AV controller
function sendSimpleAVControlCommand() {
  console.log('===', 'Send AV control command');
  client.emit('simpleAVcontrol', {
    mac: '18CC230027DC', // MAC address registered in Hub. You may bind it into Hub first.
    uid: 300, // Device ID
    cid: 0, // Channel ID
    val: 0 // For more detail about values, refer to the documents of Philio SDK.
  });
}

// Control a thermostat
function sendThermostatCommand() {
  console.log('===', 'Send thermostat control command');
  client.emit('thermostat', {
    mac: '18CC230027DC', // MAC address registered in Hub. You may bind it into Hub first.
    uid: 300, // Device ID
    cid: 0, // Channel ID
    fan: 1, // Fan state, 0 for OFF, 1 for auto/auto Low, 2 for low, 3 for auto high, 4 for high
    mode: 1, // 0 for OFF, 1 for heating, 2 for cooling, 3 for auto.
    temp: 250, // temperature value
    unit: 0 // 0 for 0.1 Celsius, 1 for 0.1 Fahrenheit
  });
}

// List all password in a door lock
function sendUserCodeListCommand() {
  console.log('===', 'Send user code list command');
  client.emit('usercode', {
    cmd: 'usercodelist', // command for list
    mac: '18CC230027DC', // MAC address registered in Hub. You may bind it into Hub first.
    uid: 300 // Device ID
  });
}

// Set password for a door lock
function sendUserCodeSetCommand() {
  console.log('===', 'Send user code set command');
  client.emit('usercode', {
    cmd: 'usercodeset', // command for list
    mac: '18CC230027DC', // MAC address registered in Hub. You may bind it into Hub first.
    uid: 300, // Device ID
    userID: 1, // Number for ID of user code
    code: '3526' // Passwrod to be set. 4~10 digits number in string
  });
}

// Remove password for a door lock
function sendUserCodeRemoveCommand() {
  console.log('===', 'Send user code remove command');
  client.emit('usercode', {
    cmd: 'usercoderemove', // command for list
    mac: '18CC230027DC', // MAC address registered in Hub. You may bind it into Hub first.
    uid: 300, // Device ID
    userID: 1 // Number for ID of user code
  });
}

// Backup user data from a gateway
function sendTwinsBackupCommand() {
  console.log('===', 'Send twins backup command');
  client.emit('twins', {
    cmd: 'backup', // command for backup
    mac: '18CC230027DC', // MAC address registered in Hub. You may bind it into Hub first.
  });
}

// Restore user data from a gateway
function sendTwinsRestoreCommand() {
  console.log('===', 'Send twins restore command');
  client.emit('twins', {
    cmd: 'restore', // command for restore
    mac: '18CC230027DC', // MAC address registered in Hub. You may bind it into Hub first.
    name: '20180117T051149046Z' // name of backup file from backup command response
  });
}

// Make an analysis with LuffaJuice
function sendJuiceCommand() {
  console.log('===', 'Send juice command');
  client.emit('juice', {
    cmd: 'trend_chart', // command for juice
    mac: '18CC230027DC', // MAC address registered in Hub. You may bind it into Hub first.
    uid: 300, // Device ID
    cid: 0, // Channel ID
  });
}
