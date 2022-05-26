const express = require('express');
const app = express();
const port = 5000;
// const path = require('path');
app.use(express.static('./public'));

app.use("/api", require("./src/api/router"));
// app.get('*', (req, res) => {
//    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
// });

app.listen(port);