// Contenido para: functions/bizkaibus.js

export async function onRequestGet(context) {
  // La URL del XML original
  const xmlUrl = 'https://ctb-siri.s3.eu-south-2.amazonaws.com/bizkaibus-vehicle-positions.xml';

  try {
    // Creamos la petición al origen
    const proxyRequest = new Request(xmlUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    // Hacemos el fetch
    const originResponse = await fetch(proxyRequest);

    if (!originResponse.ok) {
      return new Response(`Error al contactar el S3: ${originResponse.statusText}`, { status: originResponse.status });
    }

    // Retornamos una nueva respuesta clonando la original.
    // Esto copia el body, status, y las cabeceras (como Content-Type).
    // ¡No necesitamos cabeceras CORS porque se sirve desde el mismo dominio!
    return new Response(originResponse.body, originResponse);

  } catch (err) {
    return new Response(`Error en la Función: ${err.message}`, { status: 500 });
  }
}