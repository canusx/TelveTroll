/**
 * Created by xcoder on 2.04.2016.
 */
var express = require('express');
var app = express();
var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("COM6", {
  baudrate: 38400
});
var http = require('http').Server(app);
var io = require('socket.io')(http);
var serialOpened=false;
app.get('/', function(req, res){
  res.sendfile('index.html');
});
app.use('/statics', express.static('statics'));
serialPort.on("open", function () {
serialOpened = true;
   console.log("serial open");
    var recdata = "";
    serialPort.on('data', function(data) {
    //console.log(data);
        recdata +=data.toString();
      if(data.indexOf("\n") > -1) {
          console.log(recdata);
      }
    console.log(data.indexOf("\n"));
  });
});
io.on('connection', function(socket){
  console.log('a user connected');
     socket.on("joy",function(data) {
         if(data.up || data.down ||data.left || data.right) {
            console.log("updown");
             var speedx = parseInt(255 * (data.x_speed * 0.01))
             var speedy = parseInt(255 * (data.y_speed * 0.01))
             var leftrightspeed = speedy - speedx;
             if(leftrightspeed < 0) {
                 leftrightspeed = leftrightspeed * -1;
             }
             if(data.left || data.right) {
                 if(data.left) serialPort.write("u,"+leftrightspeed+"|u,"+speedy);
                 if(data.right) serialPort.write("d,"+speedy+"|d,"+leftrightspeed);
             } else {
                if(data.up) serialPort.write("u,"+speedy+"|u,"+speedy);
                if(data.down) serialPort.write("d,"+speedy+"|d,"+speedy);
             }
         } else {
             serialPort.write("u,0|u,0");
         }


     });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});