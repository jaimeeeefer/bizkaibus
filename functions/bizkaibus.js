// Contenido para: functions/bizkaibus.js - CORREGIDO PARA CORS

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

    // --- INICIO DE MODIFICACIÓN PARA PERMITIR CORS ---

    // 1. Clonamos la respuesta original (para poder modificar los headers)
    const newResponse = new Response(originResponse.body, originResponse);

    // 2. Añadimos el encabezado CORS para permitir peticiones desde cualquier origen
    // Esto incluye tu entorno local (127.0.0.1)
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS'); // Buena práctica
    
    return newResponse;
    // --- FIN DE MODIFICACIÓN PARA PERMITIR CORS ---

  } catch (err) {
    return new Response(`Error en la Función: ${err.message}`, { status: 500 });
  }
}