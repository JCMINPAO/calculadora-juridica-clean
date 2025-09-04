const axios = require('axios');
const crypto = require('crypto');
const config = require('./izipay-config');

exports.handler = async (event, context) => {
  console.log('🚀 CREATE-PAYMENT: Función iniciada');
  console.log('🚀 CREATE-PAYMENT: Event:', JSON.stringify(event, null, 2));
  
  try {
    // Verificar que sea una petición POST
    if (event.httpMethod !== "POST") {
      console.log('❌ CREATE-PAYMENT: Método no permitido:', event.httpMethod);
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
    
    console.log('🚀 CREATE-PAYMENT: Datos recibidos:', {
      amount, currency, orderId, customer, paymentMethods
    });

    // Validar datos requeridos
    if (!amount || !orderId || !customer) {
      console.log('❌ CREATE-PAYMENT: Datos incompletos');
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({ error: "Datos incompletos" })
      };
    }

    // SIMULACIÓN TEMPORAL - Generar URL de pago de prueba
    console.log('🧪 CREATE-PAYMENT: Generando URL de pago de prueba...');
    
    // URL de prueba de Izipay (esto debería ser la URL real de Izipay)
    const testPaymentUrl = `https://api.micuentaweb.pe/vads-payment/Test_${orderId}_${Date.now()}`;
    
    console.log('✅ CREATE-PAYMENT: URL de pago generada:', testPaymentUrl);

    // Retornar respuesta exitosa con URL de prueba
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({
        status: "success",
        paymentUrl: testPaymentUrl,
        transactionId: `TEST_${orderId}_${Date.now()}`,
        orderId: orderId,
        message: "Pago de prueba creado exitosamente - MODO SIMULACIÓN",
        environment: "test",
        mode: "simulation",
        note: "Esta es una simulación - URL de prueba generada",
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error("❌ CREATE-PAYMENT: Error:", error);
    
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ 
        error: "Error interno del servidor",
        details: error.message,
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
