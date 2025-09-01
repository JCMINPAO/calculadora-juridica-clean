const crypto = require('crypto');

exports.handler = async (event, context) => {
  // Solo procesar POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    console.log('Webhook recibido:', body);

    // Verificar la firma del webhook (opcional pero recomendado)
    const signature = event.headers['x-izipay-signature'];
    const hmacKey = process.env.IZIPAY_HMAC_KEY; // Configurar en Netlify
    
    if (hmacKey && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', hmacKey)
        .update(event.body)
        .digest('hex');
      
      if (signature !== expectedSignature) {
        console.error('Firma del webhook inválida');
        return {
          statusCode: 401,
          body: JSON.stringify({ error: 'Invalid signature' })
        };
      }
    }

    // Procesar diferentes tipos de notificaciones
    const notificationType = body.notificationType;
    const orderId = body.orderId;
    const transactionId = body.transactionId;
    const status = body.status;

    console.log(`Notificación: ${notificationType} - Order: ${orderId} - Status: ${status}`);

    // Solo procesar pagos exitosos
    if (status === 'AUTHORISED' || status === 'CAPTURED') {
      // Aquí puedes implementar la lógica para activar el acceso
      // Por ahora, guardamos en una base de datos simple o enviamos email
      
      const paymentData = {
        orderId: orderId,
        transactionId: transactionId,
        status: status,
        amount: body.amount,
        currency: body.currency,
        customerEmail: body.customer?.email,
        customerName: body.customer?.firstName + ' ' + body.customer?.lastName,
        paymentMethod: body.paymentMethod,
        timestamp: new Date().toISOString(),
        notificationType: notificationType
      };

             console.log('Pago exitoso procesado:', paymentData);

       // Implementar activación automática del acceso
       try {
         // 1. Buscar el pago pendiente por orderId
         const pendingPayments = JSON.parse(localStorage.getItem('juriscalcPendingPayments') || '[]');
         const pendingPayment = pendingPayments.find(p => p.orderId === orderId);
         
         if (pendingPayment) {
           // 2. Activar el plan correspondiente
           const activePlan = {
             name: pendingPayment.planName || 'Acceso JurisCalc',
             price: pendingPayment.amount,
             purchaseDate: new Date().toISOString(),
             expiryDate: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)).toISOString(), // 1 año por defecto
             customerEmail: paymentData.customerEmail,
             customerName: paymentData.customerName,
             transactionId: transactionId,
             paymentMethod: paymentData.paymentMethod
           };
           
           // Guardar plan activo
           localStorage.setItem('juriscalcActivePlan', JSON.stringify(activePlan));
           
           // 3. Marcar pago como completado
           pendingPayment.status = 'completed';
           pendingPayment.activatedAt = new Date().toISOString();
           localStorage.setItem('juriscalcPendingPayments', JSON.stringify(pendingPayments));
           
           console.log('✅ Acceso activado automáticamente para:', paymentData.customerEmail);
           
           // 4. Enviar email de confirmación (opcional)
           // Aquí podrías integrar con un servicio de email
         } else {
           console.log('⚠️ Pago no encontrado en pendientes, pero procesado exitosamente');
         }
       } catch (error) {
         console.error('Error activando acceso:', error);
       }

      // Respuesta exitosa
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: true, 
          message: 'Webhook procesado correctamente',
          orderId: orderId 
        })
      };
    } else {
      console.log(`Pago no exitoso: ${status} para order ${orderId}`);
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: true, 
          message: 'Webhook recibido pero pago no exitoso',
          orderId: orderId 
        })
      };
    }

  } catch (error) {
    console.error('Error procesando webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error interno del servidor' })
    };
  }
};
