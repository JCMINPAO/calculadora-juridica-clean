const { Handler } = require('@netlify/functions');

exports.handler = async (event, context) => {
    try {
        // Configuración de Izipay para el frontend
        const merchantId = process.env.IZIPAY_MERCHANT_ID || '34847543';
        const config = {
            publicKey: merchantId + ':testpublickey_TxzPjl9xKlhM0a6tfSVNilcLTOUZ0ndsTogGTByPUATcE',
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
    } catch (error) {
        console.error('Error en izipay-config:', error);
        
        // Fallback con valores por defecto
        const fallbackConfig = {
            publicKey: '34847543:testpublickey_TxzPjl9xKlhM0a6tfSVNilcLTOUZ0ndsTogGTByPUATcE',
            environment: 'TEST',
            baseUrl: 'https://api.micuentaweb.pe'
        };

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify(fallbackConfig)
        };
    }
};