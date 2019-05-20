const SocketIO = require('socket.io-client');
const mongoose = require('mongoose');

// Get a valid token from LuffaHub if neeeded.
const URL = `https://io.luffanet.com.tw?token=${process.env.TOKEN}`;

// Connect to MongoDB service
mongoose.connect('mongodb://localhost/luffanet', {
  useNewUrlParser: true
});

// DB Schema
const schemaMac = new mongoose.Schema({
  mac: {
    type: String,
    unique: true,
    required: true
  }
}, {
  strict: false
});

const schemaAny = new mongoose.Schema({}, {
  strict: false
})

// DB Model
const Info = mongoose.model('info', schemaMac);
const SysInfo = mongoose.model('sysinfo', schemaAny);
const Device = mongoose.model('device', schemaMac);
const Network = mongoose.model('network', schemaMac);
const Eventlog = mongoose.model('eventlog', schemaAny);

// Connect to LuffaHub
const client = SocketIO(URL, {
  secure: true, // It should be true to connect to LuffaHub
});

// LuffaHub connected event
client.on('connect', () => {
  console.log('Connected');
});

// LuffaHub data event
// Write data to MongoDB
client.on('data', function(data) {
  if (data.info) updateDB(Info, data.mac, data.info);
  if (data.sysinfo) saveDB(SysInfo, data.mac, data.sysinfo);
  if (data.device) updateDB(Device, data.mac, data.device);
  if (data.network) updateDB(Network, data.mac, data.network);
  if (data.eventlog) saveDB(Eventlog, data.mac, data.eventlog);
});

// Save object to database without index key
function saveDB(model, mac, data) {
  data.mac = mac;
  data._timestamp = new Date().getTime();
  new model(data).save();
}

// Update object to database with index key
function updateDB(model, mac, data) {
  data.mac = mac;
  data._timestamp = new Date().getTime();
  model.updateOne({
    mac: mac
  }, data, {
    upsert: true
  }, function(error, writeOpResult) {
    if (error) console.log(error);
  });
}
