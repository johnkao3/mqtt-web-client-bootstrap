function onConnect() {
  let $connected = $("#connected")
  let $connectedBtn = $("#mqttConnect")
  let $DisconnectedBtn = $("#mqttDisconnect")

  $connected.removeClass("badge-danger").addClass("badge-success")
  $connected.html("已連線")
  $connectedBtn.addClass("d-none")
  $DisconnectedBtn.removeClass("d-none")
}

function onMessage(topic, message, packet) {
  console.log(packet)
  let msgObj = {
    topic:packet.topic,
    qos:packet.qos,
    payload:packet.payload.toString(),
  }
  let element = `
  <div class="alert alert-primary" role="alert">
    <h4 class="alert-heading">Topic: ${msgObj.topic}</h4>
    <p>${msgObj.payload}</p>
    <span class="badge badge-info">${msgObj.qos}</span>
  </div>
  `
  $("#msgList").prepend(element)
  messages.push(msgObj)
}

function connect() {
  var $host = $("#host").val()
  var $port = $("#port").val()

  if ($host.length == 0 || $port.length == 0) {
    alert("Host 或 Port 不得為空白!")
    return false
  }
  // MQTT Options
  // Options 參考 https://www.npmjs.com/package/mqtt#mqttclientstreambuilder-options 
  var options = {
    host: $host,
    port: $port,
    keepalive: 10,
    protocolId: 'MQTT',
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
  }

  var $username = $("#username").val()
  var $password = $("#password").val()

  if ( $username.length > 0) {
    options.username = $username
  }

  if ( $password.length > 0) {
    options.password = $password
  }
  client = mqtt.connect(options);

  client.on('error', function(err) {
    console.log(err)
  })
  
  client.on('connect', onConnect)
  client.on('message', onMessage)
}

function disconnect() {
  client.end(function() {
    let $connected = $("#connected")
    let $connectedBtn = $("#mqttConnect")
    let $DisconnectedBtn = $("#mqttDisconnect")
  
    $connected.addClass("badge-danger").removeClass("badge-success")
    $connected.html("尚未連線")
    $connectedBtn.removeClass("d-none")
    $DisconnectedBtn.addClass("d-none")

    messages = []
    client = null
  });
}

function subscribe() {
  if (typeof client === 'object') {
    var $subTopic = $("#topic").val()
    var $qos = $('#sub-qos').val()

    if (_.find(subs, {'name': $subTopic}) ) {
      alert('已經 Subscribe過了...');
      return false;
    }
    client.subscribe($subTopic, { qos: Number($qos) })
    subs.push({name:$subTopic, qos:$qos})
        
    var element = `
    <div class="alert alert-secondary" role="alert">
      ${$subTopic} <br>
      ${$qos}
    </div>`
    $("#subList").append(element)
  }
  else {
    alert('MQTT 尚未連線...')
    return false;
  }
}

function publish () {
  if (typeof client === 'object') {
   let $topic = $("#pub-topic").val()
   let $msg = $("#msg").val()
   let $qos = $('#pub-qos').val()

   if ($topic.length == 0) {
     alert('Topic 不得為白...')
     return false;
   }

   client.publish($topic, $msg, { qos: Number($qos) })
 }
 else {
   alert('MQTT 尚未連線...')
   return false;
 }
}

function main() {
  $("#mqttConnect").on('click', connect)
  $("#mqttDisconnect").on('click', disconnect)
  $("#mqttSubscribe").on('click', subscribe)
  $("#mqttPublish").on('click', publish)
}

$(document).ready( main )

var client = ''
var messages = []
var subs = []