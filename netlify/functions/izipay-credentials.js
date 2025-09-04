// Configuración de credenciales de Izipay
module.exports = {
    // Credenciales de prueba (sandbox)
    apiKey: process.env.IZIPAY_API_KEY || 'testpublickey_TxzPjl9xKlhM0a6tfSVNilcLTOUZ0ndsTogGTByPUATcE',
    secretKey: process.env.IZIPAY_SECRET_KEY || 'testsecretkey_TxzPjl9xKlhM0a6tfSVNilcLTOUZ0ndsTogGTByPUATcE',
    merchantId: process.env.IZIPAY_MERCHANT_ID || '34847543',
    environment: process.env.IZIPAY_ENVIRONMENT || 'TEST',
    baseUrl: process.env.IZIPAY_BASE_URL || 'https://api.micuentaweb.pe',
    returnUrl: process.env.IZIPAY_RETURN_URL || 'https://polite-belekoy-971f16.netlify.app/payment-success',
    cancelUrl: process.env.IZIPAY_CANCEL_URL || 'https://polite-belekoy-971f16.netlify.app/payment-cancel',
    webhookUrl: process.env.IZIPAY_WEBHOOK_URL || 'https://polite-belekoy-971f16.netlify.app/.netlify/functions/webhook'
};
