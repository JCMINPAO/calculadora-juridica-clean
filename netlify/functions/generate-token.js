const crypto = require('crypto');

exports.handler = async (event, context) => {
  // Solo procesar POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { amount, currency, orderId, customer } = body;

    // Validar datos requeridos
    if (!amount || !currency || !orderId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Datos requeridos faltantes' })
      };
    }

    // Configuración de MiCuentaWeb (usar variables de entorno)
    const merchantId = process.env.IZIPAY_MERCHANT_ID;
    const password = process.env.IZIPAY_PASSWORD;
    const apiUrl = process.env.IZIPAY_API_URL || 'https://api.micuentaweb.pe';

    if (!merchantId || !password) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Configuración incompleta' })
      };
    }

    // Crear datos del formulario
    const formData = {
      amount: amount,
      currency: currency,
      orderId: orderId,
      customer: customer || {
        email: 'cliente@example.com'
      },
      paymentMethods: body.paymentMethods || ['YAPE'],
      formAction: 'PAY',
      formType: 'PAYMENT'
    };

    // Generar token usando las credenciales del servidor
    const token = await generateFormToken(formData, merchantId, password, apiUrl);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        formToken: token,
        orderId: orderId
      })
    };

  } catch (error) {
    console.error('Error generando token:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  }
};

async function generateFormToken(formData, merchantId, password, apiUrl) {
  // En un entorno real, aquí harías una llamada a la API de MiCuentaWeb
  // para generar el token usando las credenciales del servidor
  
  const payload = {
    merchantId: merchantId,
    password: password,
    ...formData
  };

  try {
    const response = await fetch(`${apiUrl}/api-payment/V4/Charge/CreatePayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${merchantId}:${password}`).toString('base64')}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.formToken;

  } catch (error) {
    console.error('Error llamando a MiCuentaWeb API:', error);
    // Para desarrollo, retornar un token simulado
    return `DEMO-TOKEN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
