const fs = require('fs');
const express = require('express');
const app = express();

const WASM_DIR = 'build/'

app.use(express.static(__dirname + '/public/'));
app.use('/wasm/', express.static(WASM_DIR, {index: false}));

app.get('/wasm/', (req, res) => {
    fs.readdir(WASM_DIR, (err, files) => {
        if (err) {
            res.status(500);
            res.send({error: err});
        } else {
            res.send({data: files.map(file => ({
                name: file,
                url: `/wasm/${file}`,
            }))});
        }
    });
});


app.listen(3000);
console.log("Listening on http://localhost:3000/");
