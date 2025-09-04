exports.handler = async (event, context) => {
  console.log('🧪 TEST-ENV: Función iniciada');
  
  // Verificar variables de entorno
  const envVars = {
    IZIPAY_API_KEY: process.env.IZIPAY_API_KEY,
    IZIPAY_SECRET_KEY: process.env.IZIPAY_SECRET_KEY,
    IZIPAY_BASE_URL: process.env.IZIPAY_BASE_URL,
    IZIPAY_MERCHANT_ID: process.env.IZIPAY_MERCHANT_ID,
    IZIPAY_ENVIRONMENT: process.env.IZIPAY_ENVIRONMENT
  };
  
  console.log('🧪 TEST-ENV: Variables de entorno:', envVars);
  
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({
      message: "Variables de entorno verificadas",
      variables: envVars,
      timestamp: new Date().toISOString()
    })
  };
};
