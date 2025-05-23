const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(require('cors')());

app.get('/bizkaibus', async (req, res) => {
  try {
    const response = await fetch('https://ctb-siri.s3.eu-south-2.amazonaws.com/bizkaibus-vehicle-positions.xml');
    const text = await response.text();
    res.set('Content-Type', 'application/xml');
    res.send(text);
  } catch (err) {
    res.status(500).send('Error al obtener datos');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor proxy escuchando en ${PORT}`));
