exports.handler = async (event, context) => {
  try {
    // Verificar que sea una petición POST
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Método no permitido" })
      };
    }

    // Parsear el cuerpo del webhook
    const webhookBody = JSON.parse(event.body);
    
    // Log del webhook recibido
    console.log("Webhook recibido de Izipay:", JSON.stringify(webhookBody, null, 2));

    // Simular procesamiento del webhook
    const response = {
      status: "success",
      message: "Webhook procesado correctamente",
      receivedData: webhookBody,
      timestamp: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error("Error en webhook:", error);
    
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ 
        error: "Error procesando webhook",
        details: error.message 
      })
    };
  }
};
