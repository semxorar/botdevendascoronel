const axios = require('axios');

async function iniciarBot() {
    console.log("🏁 Iniciando Processo de Autenticação...");
    
    try {
        // 1. RENOVAR O TOKEN (Usando URLSearchParams para formato de formulário)
        console.log("🔄 Solicitando novo Access Token...");
        
        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('client_id', process.env.ML_CLIENT_ID);
        params.append('client_secret', process.env.ML_CLIENT_SECRET);
        params.append('refresh_token', process.env.ML_REFRESH_TOKEN);

        const authRes = await axios.post('https://api.mercadolibre.com/oauth/token', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const novoToken = authRes.data.access_token;
        console.log("✅ Token renovado com sucesso!");

        // 2. BUSCAR PRODUTO (Testando com iPhone)
        const ml = await axios.get(`https://api.mercadolibre.com/sites/MLB/search?q=iphone&limit=1`, {
            headers: { 'Authorization': `Bearer ${novoToken}` }
        });

        const item = ml.data.results[0];
        const preco = item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const foto = item.thumbnail.replace("-I.jpg", "-O.jpg");

        // 3. ENVIAR PARA TELEGRAM (Usando seu ID numérico)
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
            
            // Se o erro for 'invalid_grant', o Refresh Token expirou
            if (JSON.stringify(error.response.data).includes("invalid_grant")) {
                console.error("🚨 AVISO: Seu Refresh Token expirou. Você precisa gerar um novo manualmente no painel do ML.");
            }
        } else {
            console.error("Mensagem:", error.message);
        }
    }
}

iniciarBot();
