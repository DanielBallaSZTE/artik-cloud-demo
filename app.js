/* Copyright 2018-present Samsung Electronics Co., Ltd. and other contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var mqtt = require('mqtt');
var tls = require('tls');
var fs = require('fs');

var device_id = 'DEVICE ID';
var device_token = 'DEVICE TOKEN';
var cert_file = 'client.crt';
var key_file = 'client.key';

var tls_opts = {
  host: 'api.artik.cloud',
  port: 8883,
  rejectUnauthorized: false,
  isServer: false,
  cert: fs.readFileSync(cert_file),
  key: fs.readFileSync(key_file),
}

var tlsSocket = tls.connect(tls_opts);

var mqtt_opts = {
  socket: tlsSocket,
  username: device_id,
  password: device_token,
  keepalive: 600,
}

var mqttClient = mqtt.getClient(mqtt_opts);

var mqtt_sub_opts = {
  topic: '/v1.1/actions/' + device_id,
  qos: 0,
}

// Subscribing to the error channel
//
/*
var mqtt_sub_opts_err = {
  topic: '/v1.1/errors/' + device_id,
  qos: 0,
}
*/

function getMsg() {
  var temperature = Math.round(Math.random() * 100);

  return JSON.stringify({
    "sdid": device_id,
    "ts": Date.now(),
    "type": "message",
    "data": {
      "temp": temperature
    }
  });
}

var mqtt_pub_opts = {
  topic: '/v1.1/messages/' + device_id,
  message: getMsg(),
  qos: 1,
}


function keepPublishing() {
  setInterval(function() {
    mqttClient.publish(mqtt_pub_opts);
  }, 1000);
}

tlsSocket.on('secureConnect', function () {
  mqttClient.on('suback', function () {
    console.log('Successful subscription');
    keepPublishing();
  });

  mqttClient.connect(function () {
    mqttClient.subscribe(mqtt_sub_opts);
    // Subscribe to error channel
    // mqttClient.subscribe(mqtt_sub_opts_err);
  });
});

mqttClient.on('message', function(mes) {
  console.log(mes.message.toString());
});
