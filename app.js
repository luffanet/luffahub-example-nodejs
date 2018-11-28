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
    let handler = eventHandlers[type];
    if (handler) handler(data[type]);
  });
});

const eventHandlers = {
  mac: data => {
    // MAC address for the data coming from.
  },
  eventlog: data => {
    console.log('===', 'Get a event\n', JSON.stringify(data));
    //
    // refer to Philio SDK to get more detail about event log.
    //
  },
  socketstatus: data => {
    console.log('===', 'Get a gateway info status changed\n', JSON.stringify(data));
    //
    // "connected" or "close" or "error"
    //
  },
  info: data => {
    console.log('===', 'Get a gateway info\n', JSON.stringify(data));
    // {
    //   "mac": "18CC230027DC", // MAC address
    //   "map": "25.014841,121.218676", // Geolocation
    //   "uuid": "98NSX91PIKFZUYKPFA6T", // P2P uuid
    //   "address": "::ffff:60.250.242.233:34751" // network address the gateway used
    // }
  },
  device: data => {
    console.log('===', 'Get a device list from a gateway\n', JSON.stringify(data));
    //
    // refer to Philio SDK to get more detail about device list.
    //
  },
  macro: data => {
    console.log('===', 'Get a event from triggered macro\n', JSON.stringify(data));
    // {
    //   "mac": "18:CC:23:00:27:9E", MAC address
    //   "name": "Pir2LightOff", // the name of macro triggered
    //   "scene": "", // the scene name in macro
    //   "timeStamp": 1521784632 // time stamp in seconds
    // }
  },
  network: data => {
    console.log('===', 'Get a user defined data from gateway. Rooms/Scenes/Macro/Namings\n', JSON.stringify(data));
    //
    // refer to Philio SDK to get more detail about device list.
    //
  },
  timezone: data => {
    console.log('===', 'Get a timezone from gateway\n', JSON.stringify(data));
    //
    // "CCT_008" or others shown in Philio SDK
    //
  },
  authcode: data => {
    console.log('===', 'Get a auth code from gateway\n', JSON.stringify(data));
    //
    // "UVOJ53" the six chars in string
    //
  },
  usercode: data => {
    console.log('===', 'Get a usercode from gateway. It is usually door lock password.\n', JSON.stringify(data));
    // {
    //   "list": [{
    //     "password": "3526", // the password for user ID 1
    //     "status": 0, // 0x00: Available (not set), 0x01: Occupied, 0x02: Reserved by administrator, 0xFE: Status not available
    //     "userID": 1
    //   }],
    //   "uid": 300
    // }
  },
  control: data => {
    console.log('===', 'Get a control result\n', JSON.stringify(data));
    // {
    //   "cmd": "switch",
    //   "respcode": 100,
    //   "respmsg": "OK",
    //   "uid": 300
    // }
    // {
    //   "cmd": "doscene",
    //   "value": "Wake up"
    // }
  },
  twins: data => {
    console.log('===', 'Get a twins from gateway. Store the name in response in order to restore\n', JSON.stringify(data));
    // {
    //   "request": { // original command
    //     "cmd": "backup",
    //     "mac": "18CC230027DC"
    //   },
    //   "name": "20180323T062550540Z", // the name of backup file. it will be needed in restore
    //   "timestamp": 1521786352480, // time stamp of backup
    //   "success": true // whether backup is successful
    // }
  },
  juice: data => {
    console.log('===', 'Get a juice analysis result\n', JSON.stringify(data));
    // {
    //   "request": { // original command
    //     "cmd": "trend_chart",
    //     "mac": "18CC230027DC",
    //     "uid": 300,
    //     "cid": 0
    //   },
    //   "timestamp": [1521784453219, 1521784453226], // time stamp for analysis, first is for starting, the other one is for ending.
    //   "lengthRaw": 2, // the length of result without compression
    //   "lengthCompressed": 16, // the length of result with compression
    //   "result": "eJyLjgUAARUAuQ==", // it will be a json string in normal. in the other hand, it will be base64 in compressed.
    //   "elapsed": 7 // the total time spend in analysis, milliseconds.
    // }
  },
  cast: data => {
    console.log('===', 'Get a cast snapshot result\n', JSON.stringify(data));
    // {
    //   "request": {
    //     "cmd": "snapshot",
    //     "mac": "18CC23000E7E",
    //     "uid": 770,
    //     "notified": ["cube@luffanet.com.tw"]
    //   },
    //   "result": {
    //     "AcceptRanges": "bytes",
    //     "LastModified": "2018-11-26T09:06:07.000Z",
    //     "ContentLength": 37799,
    //     "ETag": "\"967860ee72aba3c1ed130aff446821c7\"",
    //     "ContentType": "application/octet-stream"
    //   },
    //   "url": "https://luffacast.s3.ap-northeast-1.amazonaws.com/snapshot/18CC23000E7E-770...",  // the image url for snapshot
    //   "expires": 1543309567713,  // the image url expires time in milliseconds
    //   "timestamp": 1543223167713,
    //   "success": true
    // }
  },
  error: data => {
    console.log('===', 'Get a error\n', JSON.stringify(data));
    // {
    //   "switch": {
    //     "mac": "18CC230027DC",
    //     "cid": 0,
    //     "val": 255
    //   },
    //   "msg": "data should have required property 'uid'"
    // }
  }
};

/*
 *   Send commands
 */
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
    // sendTwinsBackupCommand,  // Caution to send the command
    // sendTwinsRestoreCommand, // !!!DANGEROUS!!!  Caution to send the command
    sendJuiceCommand,
    sendAuthCodeCommand,
    // sendEmailCommand, // quota limit to 1 email in 1 minute
    // sendSMSCommand    // quota limit to 1 SMS in 5 minutes
    sendSnapshotCommand,
    sendCastSnapshotCommand
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
    juice: 'health', // get gateway health info
    type: 'load_average', // load_average, memory, latency
    mac: '18CC230027DC', // MAC address registered in Hub. You may bind it into Hub first.
  });
  client.emit('juice', { // get device basicValue and sensorValue info
    juice: 'trend', // trend, histogram, distribution
    mac: '18CC230027DC', // MAC address registered in Hub. You may bind it into Hub first.
    uid: 300, // Device ID
    cid: 0, // Channel ID
    eventCode: eventCode, // Event code to filter results,
    days: 1 // data range in days. Max 7, Min 1
  });
  client.emit('juice', { // get meter info
    juice: 'meter', // meter, prediction
    mac: '18CC230027DC', // MAC address registered in Hub. You may bind it into Hub first.
    uid: 300, // Device ID
    cid: 0, // Channel ID,
    days: 7 // data range in days. Max 30, Min 1
  });
}

// Send a authcode to bind gateway.
// Get authcode from gateway. http://<gateway>/network.cgi?authcode
function sendAuthCodeCommand() {
  console.log('===', 'Send authcode command');
  client.emit('authcode', '123456');
}

// Send email
function sendEmailCommand() {
  console.log('===', 'Send email command');
  client.emit('postman', {
    to: [
      'test@luffanet.com.tw'
    ],
    title: 'this is title for a mail',
    body: 'this is body for a mail ',
  });
}

// Send email
function sendSMSCommand() {
  console.log('===', 'Send SMS command');
  client.emit('express', {
    to: [
      '+886912345678'
    ],
    message: 'this is message for a sms',
  });
}

// Get snapshot from IPCam.
function sendSnapshotCommand() {
  console.log('===', 'Send snapshot command');
  client.emit('snapshot', {
    mac: '18CC230027DC', // MAC address registered in Hub. You may bind it into Hub first.
    uid: 300, // Camera ID
    url: 'https://...' // the url to upload image by gateway. use PUT method.
  });
}

// Get snapshot from IPCam via LuffaCast.
function sendCastSnapshotCommand() {
  console.log('===', 'Send cast/snapshot command');
  client.emit('cast', {
    cmd: 'snapshot',
    mac: '18CC230027DC', // MAC address registered in Hub. You may bind it into Hub first.
    uid: 300, // Camera ID
    notify: [
      'someone@youremail.com' // optional. Send notification with snapshot image.
    ]
  });
}
