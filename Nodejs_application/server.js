const express = require("express");
var http = require('http')
const os = require('os');

const app = express();
var port =2000
var server = http.createServer(app);
app.listen(port, () => {
    // console.log("listening on port: " +port);
    // console.log("hostname:" + os.hostname);
});

app.get("/", (req, res) => {
    
    res.send("Running on: " + os.hostname)
     
});