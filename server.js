const express = require('express');
const app = express();
const ejs = require('ejs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');


// app set
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// app use
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use('/remixicon', express.static('node_modules/remixicon/fonts'));
app.use('/remixicon', express.static('node_modules/remixicon'));


// middleware
app.use(cors());
app.use(bodyParser.json());
// routes
app.get('/', (req, res) => {
    res.render('index');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
