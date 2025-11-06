// Contenido para: functions/bizkaibus.js - VERSIÓN FINAL Y COMPLETA
export async function onRequestGet(context) {
  const xmlUrl = 'https://ctb-siri.s3.eu-south-2.amazonaws.com/bizkaibus-vehicle-positions.xml';

  try {
    const proxyRequest = new Request(xmlUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const originResponse = await fetch(proxyRequest);

    if (!originResponse.ok) {
      return new Response(`Error al contactar el S3: ${originResponse.statusText}`, { status: originResponse.status });
    }
    
    // 1. Leer el cuerpo como texto (el Worker lo descomprime automáticamente)
    const bodyText = await originResponse.text();

    // 2. Crear un nuevo objeto de encabezados, copiando los originales
    const headers = new Headers(originResponse.headers);
    
    // 3. ✨ CORRECCIÓN CLAVE: Eliminar el encabezado Content-Encoding.
    // Esto es crucial porque el cuerpo ya está descomprimido al usar .text().
    if (headers.has('Content-Encoding')) {
        headers.delete('Content-Encoding');
    }
    
    // 4. CORRECCIÓN CORS: Añadir el encabezado CORS
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS'); 
    
    // 5. Devolver una nueva respuesta con el cuerpo descomprimido y los encabezados corregidos
    return new Response(bodyText, {
        status: originResponse.status,
        headers: headers
    });

  } catch (err) {
    return new Response(`Error en la Función: ${err.message}`, { status: 500 });
  }
}