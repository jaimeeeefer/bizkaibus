// Contenido para: functions/bizkaibus.js - VERSIÓN FINAL CORREGIDA PARA CORS Y BODY

export async function onRequestGet(context) {
  // La URL del XML original
  const xmlUrl = 'https://ctb-siri.s3.eu-south-2.amazonaws.com/bizkaibus-vehicle-positions.xml';

  try {
    // 1. Creamos la petición al origen
    const proxyRequest = new Request(xmlUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    // 2. Hacemos el fetch
    const originResponse = await fetch(proxyRequest);

    if (!originResponse.ok) {
      return new Response(`Error al contactar el S3: ${originResponse.statusText}`, { status: originResponse.status });
    }
    
    // 3. LEER EL CUERPO COMPLETO DE LA RESPUESTA ORIGINAL (el XML)
    // Esto resuelve el problema de los 0 bytes al asegurar que el contenido se carga.
    const bodyText = await originResponse.text();

    // 4. Crear un nuevo objeto de encabezados, copiando el Content-Type original
    const headers = new Headers(originResponse.headers);
    
    // 5. AÑADIR LOS ENCABEZADOS CORS
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS'); 
    
    // 6. Devolver una nueva respuesta con el cuerpo leído y los nuevos encabezados
    return new Response(bodyText, {
        status: originResponse.status,
        headers: headers
    });

  } catch (err) {
    return new Response(`Error en la Función: ${err.message}`, { status: 500 });
  }
}