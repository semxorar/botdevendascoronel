const axios = require('axios');

async function iniciarBot() {
    console.log("🏁 Iniciando Processo com Renovação de Token...");
    
    try {
        // 1. RENOVAR O TOKEN (Para evitar o erro 403)
        console.log("🔄 Solicitando novo Access Token ao Mercado Livre...");
        const authRes = await axios.post('https://api.mercadolibre.com/oauth/token', {
            grant_type: 'refresh_token',
            client_id: process.env.ML_CLIENT_ID,
            client_secret: process.env.ML_CLIENT_SECRET,
            refresh_token: process.env.ML_REFRESH_TOKEN
        });

        const novoToken = authRes.data.access_token;
        console.log("✅ Token renovado com sucesso!");

        // 2. BUSCAR PRODUTO
        const ml = await axios.get(`https://api.mercadolibre.com/sites/MLB/search?q=iphone&limit=1`, {
            headers: { 'Authorization': `Bearer ${novoToken}` }
        });

        const item = ml.data.results[0];
        const preco = item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const foto = item.thumbnail.replace("-I.jpg", "-O.jpg");

        // 3. ENVIAR PARA TELEGRAM
        const msg = `🔥 *${item.title}*\n` +
                    `💰 *${preco}*\n\n` +
                    `- 12x sem juros\n` +
                    `- Frete rápido\n\n` +
                    `🛒 *Link:* ${item.permalink}`;

        await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendPhoto`, {
            chat_id: process.env.CHAT_ID,
            photo: foto,
            caption: msg,
            parse_mode: 'Markdown'
        });

        console.log("✅ SUCESSO TOTAL! Postado no canal.");

    } catch (error) {
        console.error("❌ ERRO DETALHADO:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Resposta:", JSON.stringify(error.response.data));
        } else {
            console.error("Mensagem:", error.message);
        }
    }
}

iniciarBot();
