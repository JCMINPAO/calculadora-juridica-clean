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

    // Parsear el cuerpo del webhook
    const webhookBody = JSON.parse(event.body);
    
    // Log del webhook recibido
    console.log("Webhook recibido de Izipay:", JSON.stringify(webhookBody, null, 2));

    // Verificar que sea una notificación válida de Izipay
    if (!webhookBody.transactionId || !webhookBody.status) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Webhook inválido" })
      };
    }

    // Procesar según el estado del pago
    let response;
    
    switch (webhookBody.status) {
      case 'SUCCESS':
        // Pago exitoso
        response = {
          status: "success",
          message: "Pago procesado exitosamente",
          transactionId: webhookBody.transactionId,
          orderId: webhookBody.orderId,
          amount: webhookBody.amount,
          timestamp: new Date().toISOString()
        };
        
        // Aquí podrías:
        // 1. Guardar en base de datos
        // 2. Enviar email de confirmación
        // 3. Actualizar inventario
        // 4. Limpiar carrito del usuario
        
        console.log("✅ Pago exitoso procesado:", webhookBody.transactionId);
        break;
        
      case 'FAILED':
        // Pago fallido
        response = {
          status: "failed",
          message: "Pago falló",
          transactionId: webhookBody.transactionId,
          orderId: webhookBody.orderId,
          error: webhookBody.error || "Error desconocido",
          timestamp: new Date().toISOString()
        };
        
        console.log("❌ Pago fallido:", webhookBody.transactionId);
        break;
        
      case 'CANCELLED':
        // Pago cancelado
        response = {
          status: "cancelled",
          message: "Pago cancelado por el usuario",
          transactionId: webhookBody.transactionId,
          orderId: webhookBody.orderId,
          timestamp: new Date().toISOString()
        };
        
        console.log("🚫 Pago cancelado:", webhookBody.transactionId);
        break;
        
      default:
        // Estado desconocido
        response = {
          status: "unknown",
          message: "Estado de pago desconocido",
          transactionId: webhookBody.transactionId,
          orderId: webhookBody.orderId,
          paymentStatus: webhookBody.status,
          timestamp: new Date().toISOString()
        };
        
        console.log("❓ Estado desconocido:", webhookBody.status);
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error("Error procesando webhook:", error);
    
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
