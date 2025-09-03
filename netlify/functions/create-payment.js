const axios = require('axios');
const crypto = require('crypto');
const config = require('./izipay-config');

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
    const { amount, currency, orderId, customer, paymentMethods } = requestBody;

    // Validar datos requeridos
    if (!amount || !orderId || !customer) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Datos incompletos" })
      };
    }

    // Crear payload para Izipay (formato correcto para sandbox)
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
      returnUrl: config.returnUrl,
      cancelUrl: config.cancelUrl,
      webhookUrl: config.webhookUrl,
      // Campos adicionales requeridos por Izipay
      merchantId: config.merchantId,
      environment: config.environment,
      // Campos específicos para sandbox
      description: `[SANDBOX] Acceso JurisCalc - ${orderId}`,
      metadata: {
        source: 'JurisCalc Web',
        version: '1.0',
        environment: config.environment,
        mode: 'sandbox'
      }
    };

    // Generar firma de seguridad usando HMAC-SHA256
    const signature = generateSignature(paymentPayload, config.secretKey);

    // Headers para la API de Izipay
    const headers = {
      'Authorization': `Basic ${Buffer.from(`${config.apiKey}:${config.secretKey}`).toString('base64')}`,
      'Content-Type': 'application/json',
      'X-Signature': signature,
      'User-Agent': 'JurisCalc/1.0',
      'Accept': 'application/json'
    };

    console.log('🧪 [SANDBOX] Enviando pago de prueba a Izipay:', {
      url: `${config.baseUrl}/api-payment/v4/Charge/CreatePayment`,
      orderId: orderId,
      amount: amount,
      environment: config.environment,
      mode: 'SANDBOX - NO HAY PAGOS REALES',
      timestamp: new Date().toISOString()
    });

    // Llamar a la API de Izipay
    const response = await axios.post(
      `${config.baseUrl}/api-payment/v4/Charge/CreatePayment`,
      paymentPayload,
      { 
        headers,
        timeout: 30000 // 30 segundos de timeout
      }
    );

    console.log('✅ [SANDBOX] Respuesta exitosa de Izipay (PRUEBA):', {
      orderId: orderId,
      transactionId: response.data.transactionId || response.data.id,
      status: response.data.status,
      mode: 'SANDBOX - PAGO SIMULADO',
      timestamp: new Date().toISOString()
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
        message: "Pago de prueba creado exitosamente en Izipay - MODO SANDBOX",
        environment: config.environment,
        mode: "sandbox",
        note: "Este es un pago de prueba - NO hay transferencia real de dinero",
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error("❌ [SANDBOX] Error creando pago de prueba:", {
      error: error.response?.data || error.message,
      statusCode: error.response?.status,
      orderId: requestBody?.orderId,
      mode: 'SANDBOX',
      timestamp: new Date().toISOString()
    });
    
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ 
        error: "Error creando pago de prueba en modo sandbox",
        details: error.response?.data?.message || error.message,
        statusCode: error.response?.status,
        environment: config.environment,
        mode: "sandbox",
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
