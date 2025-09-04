const { Handler } = require('@netlify/functions');

exports.handler = async (event, context) => {
    // Configuración de Izipay para el frontend
    const config = {
        publicKey: process.env.IZIPAY_MERCHANT_ID + ':testpublickey_TxzPjl9xKlhM0a6tfSVNilcLTOUZ0ndsTogGTByPUATcE',
        environment: process.env.IZIPAY_ENVIRONMENT || 'TEST',
        baseUrl: process.env.IZIPAY_BASE_URL || 'https://api.micuentaweb.pe'
    };

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: JSON.stringify(config)
    };
};