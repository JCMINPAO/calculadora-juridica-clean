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

    // Crear payload para Izipay
    const paymentPayload = {
      amount: amount, // en centavos
      currency: currency || 'PEN',
      orderId: orderId,
      customer: {
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName
      },
      paymentMethods: paymentMethods || ['YAPE', 'BANK_TRANSFER'],
      returnUrl: config.returnUrl || 'https://polite-belekoy-971f16.netlify.app/payment-success',
      cancelUrl: config.cancelUrl || 'https://polite-belekoy-971f16.netlify.app/payment-cancel',
      webhookUrl: config.webhookUrl || 'https://polite-belekoy-971f16.netlify.app/.netlify/functions/webhook',
      merchantId: config.merchantId,
      environment: config.environment || 'sandbox',
      description: `Acceso JurisCalc - ${orderId}`,
      metadata: {
        source: 'JurisCalc Web',
        version: '1.0',
        environment: config.environment || 'sandbox'
      }
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
      url: `${config.baseUrl}/api-payment/v4/Charge/CreatePayment`,
      orderId: orderId,
      amount: amount,
      environment: config.environment
    });

    // Llamar a la API real de Izipay
    const response = await axios.post(
      `${config.baseUrl}/api-payment/v4/Charge/CreatePayment`,
      paymentPayload,
      { 
        headers,
        timeout: 30000
      }
    );

    console.log('✅ CREATE-PAYMENT: Respuesta exitosa de Izipay:', {
      orderId: orderId,
      transactionId: response.data.transactionId || response.data.id,
      status: response.data.status,
      paymentUrl: response.data.paymentUrl || response.data.redirectUrl
    });

    // Retornar respuesta exitosa
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({
        status: "success",
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
