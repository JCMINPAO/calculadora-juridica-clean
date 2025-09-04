const axios = require('axios');
const crypto = require('crypto');
const config = require('./izipay-config');

exports.handler = async (event, context) => {
  
  try {
    // Verificar que sea una petición POST
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({ error: "Método no permitido" })
      };
    }

    // Parsear el cuerpo de la petición
    const requestBody = JSON.parse(event.body);
    const { amount, currency, orderId, customer, paymentMethods } = requestBody;
    

    // Validar datos requeridos
    if (!amount || !orderId || !customer) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({ error: "Datos incompletos" })
      };
    }

    // Verificar que las credenciales estén configuradas
    if (!config.apiKey || !config.secretKey) {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({ 
          error: "Credenciales de Izipay no configuradas",
          details: "Verificar variables de entorno IZIPAY_API_KEY e IZIPAY_SECRET_KEY"
        })
      };
    }

    // Crear payload para Izipay (formato oficial según documentación)
    const paymentPayload = {
      amount: amount, // en centavos
      currency: currency || 'PEN',
      orderId: orderId,
      customer: {
        email: customer.email
      }
      // Payload simplificado según documentación oficial de Izipay
    };

    // Generar firma de seguridad
    const signature = generateSignature(paymentPayload, config.secretKey);

    // Headers para la API de Izipay
    const headers = {
      'Authorization': `Basic ${Buffer.from(`${config.apiKey}:${config.secretKey}`).toString('base64')}`,
      'Content-Type': 'application/json',
      'X-Signature': signature,
      'User-Agent': 'JurisCalc/1.0',
      'Accept': 'application/json'
    };

    

    // Llamar a la API real de Izipay
    const response = await axios.post(
      `${config.baseUrl}/api-payment/V4/Charge/CreatePayment`,
      paymentPayload,
      { 
        headers,
        timeout: 30000
      }
    );

    
    // Verificar si hay error en la respuesta
    if (response.data.status === 'ERROR') {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          error: "Error de Izipay",
          details: response.data,
          timestamp: new Date().toISOString()
        })
      };
    }

    // Retornar respuesta exitosa con formToken
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({
        status: "success",
        formToken: response.data.answer?.formToken || response.data.formToken,
        paymentUrl: response.data.paymentUrl || response.data.redirectUrl,
        transactionId: response.data.transactionId || response.data.id,
        orderId: orderId,
        message: "Pago creado exitosamente en Izipay",
        environment: config.environment,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ 
        error: "Error creando pago en Izipay",
        details: error.response?.data?.message || error.message,
        statusCode: error.response?.status,
        timestamp: new Date().toISOString()
      })
    };
  }
};

// Función para generar firma de seguridad
function generateSignature(payload, secretKey) {
  const data = JSON.stringify(payload);
  return crypto
    .createHmac('sha256', secretKey)
    .update(data)
    .digest('hex');
}
