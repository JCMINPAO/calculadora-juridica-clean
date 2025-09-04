// Configuracion de Izipay - Solo variables de entorno
module.exports = {
  // Credenciales de Izipay - Solo desde variables de entorno
  apiKey: process.env.IZIPAY_API_KEY,
  secretKey: process.env.IZIPAY_SECRET_KEY,
  
  // URLs de Izipay
  baseUrl: process.env.IZIPAY_BASE_URL || 'https://api.micuentaweb.pe',
  
  // Configuracion del comercio
  merchantId: process.env.IZIPAY_MERCHANT_ID,
  
  // Modo de operacion
  environment: process.env.IZIPAY_ENVIRONMENT,
  
  // URLs de callback
  returnUrl: process.env.IZIPAY_RETURN_URL,
  cancelUrl: process.env.IZIPAY_CANCEL_URL,
  
  // Webhook URL
  webhookUrl: process.env.IZIPAY_WEBHOOK_URL
};
