const express = require('express');  // ← זה חשוב!
const cors = require('cors');
const fs = require('fs');
const path = require('path');        // ← זה מה שחסר
const xlsx = require('xlsx');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/html', express.static(path.join(__dirname, 'html')));
app.use('/data', express.static(path.join(__dirname, 'data')));
app.use(express.static(__dirname));

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the API!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
