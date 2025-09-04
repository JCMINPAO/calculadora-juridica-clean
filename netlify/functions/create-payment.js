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
    
    // Log de credenciales para debugging (sin exponer secretos)
    console.log('🔑 CREATE-PAYMENT: Credenciales configuradas:', {
      apiKey: config.apiKey ? `${config.apiKey.substring(0, 8)}...` : 'NO_CONFIGURADA',
      merchantId: config.merchantId,
      environment: config.environment
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

    // Verificar que las credenciales estén configuradas
    if (!config.apiKey || !config.secretKey) {
      console.log('❌ CREATE-PAYMENT: Credenciales no configuradas');
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

    console.log('🧪 CREATE-PAYMENT: Enviando pago a Izipay:', {
      url: `${config.baseUrl}/api-payment/V4/Charge/CreatePayment`,
      orderId: orderId,
      amount: amount,
      environment: config.environment
    });
    
    console.log('🧪 CREATE-PAYMENT: Payload completo:', JSON.stringify(paymentPayload, null, 2));

    // Llamar a la API real de Izipay
    const response = await axios.post(
      `${config.baseUrl}/api-payment/V4/Charge/CreatePayment`,
      paymentPayload,
      { 
        headers,
        timeout: 30000
      }
    );

    console.log('✅ CREATE-PAYMENT: Respuesta completa de Izipay:', JSON.stringify(response.data, null, 2));
    console.log('✅ CREATE-PAYMENT: Status code:', response.status);
    console.log('✅ CREATE-PAYMENT: Headers:', response.headers);
    
    // Verificar si hay error en la respuesta
    if (response.data.status === 'ERROR') {
      console.log('❌ CREATE-PAYMENT: Error de Izipay:', response.data);
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
    console.error("❌ CREATE-PAYMENT: Error:", error);
    
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
