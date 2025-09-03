// Función para probar el webhook
exports.handler = async (event, context) => {
  try {
    // Verificar que sea una petición GET (para pruebas)
    if (event.httpMethod !== "GET") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Método no permitido" })
      };
    }

    // Simular datos de webhook de Izipay
    const testWebhookData = {
      transactionId: 'TEST_' + Date.now(),
      orderId: 'JURISCALC_TEST_' + Date.now(),
      status: 'SUCCESS',
      amount: 1000, // S/ 10.00 en centavos
      currency: 'PEN',
      customer: {
        email: 'test@juriscalc.com',
        firstName: 'Test',
        lastName: 'Usuario'
      },
      timestamp: new Date().toISOString()
    };

    // Simular envío de webhook (DOMINIO CORRECTO)
    const webhookUrl = 'https://polite-belekoy-971f16.netlify.app/.netlify/functions/webhook';
    
    console.log('🧪 Probando webhook:', {
      url: webhookUrl,
      data: testWebhookData,
      timestamp: new Date().toISOString()
    });

    // Retornar información de prueba
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        status: "success",
        message: "Webhook de prueba configurado correctamente",
        webhookUrl: webhookUrl,
        testData: testWebhookData,
        instructions: [
          "1. Verifica que esta URL esté configurada en Izipay:",
          webhookUrl,
          "2. Haz una transacción de prueba",
          "3. Revisa los logs en Netlify Functions",
          "4. Verifica que el webhook reciba la notificación"
        ],
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error("❌ Error probando webhook:", error);
    
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ 
        error: "Error probando webhook",
        details: error.message 
      })
    };
  }
};
