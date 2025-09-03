const crypto = require("crypto");

exports.handler = async (event, context) => {
  try {
    // Verificar que sea una petición POST
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Método no permitido" })
      };
    }

    // Parsear el cuerpo de la petición
    const requestBody = JSON.parse(event.body);
    const { paymentMethods, amount } = requestBody;

    // Generar un token de demostración
    const demoToken = `DEMO-TOKEN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Simular respuesta exitosa
    const response = {
      status: "success",
      token: demoToken,
      message: "Token generado correctamente",
      paymentMethods: paymentMethods,
      amount: amount
    };

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error("Error en generate-token:", error);
    
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ 
        error: "Error interno del servidor",
        details: error.message 
      })
    };
  }
};
