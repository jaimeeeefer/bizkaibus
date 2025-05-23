const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors()); // permite CORS a todos

app.get('/bizkaibus', async (req, res) => {
  try {
    const xmlUrl = 'https://ctb-siri.s3.eu-south-2.amazonaws.com/bizkaibus-vehicle-positions.xml';
    const response = await fetch(xmlUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!response.ok) throw new Error('No se pudo obtener el XML');
    const xml = await response.text();
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('Error al obtener XML:', err);
    res.status(500).send('Error al obtener el XML');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor proxy escuchando en puerto ${PORT}`);
});
