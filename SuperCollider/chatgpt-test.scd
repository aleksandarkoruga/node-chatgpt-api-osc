// Edit settings.js to set your api key and select a model
// Edit OSCServerTest.js to reflect local and remote ports ( currently set to 7772 and 7773)

a=OSCFunc({arg msg, time, addr, recvPort;  msg.postln;  }, '/GPTSource' , recvPort:7772 )

m = NetAddr("127.0.0.1", 7773); // loopback

m.sendMsg("/ChatGPT", "Hello I'm talking to you by sending messages from SuperCollider");

a.free