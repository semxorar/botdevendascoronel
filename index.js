const axios = require('axios');

async function iniciarBot() {
    console.log("🏁 Iniciando Processo de Autenticação...");
    
    try {
        // 1. LIMPEZA DOS DADOS (Remove espaços invisíveis que causam erro 400)
        const CLIENT_ID = process.env.ML_CLIENT_ID?.trim();
        const CLIENT_SECRET = process.env.ML_CLIENT_SECRET?.trim();
        const REFRESH_TOKEN = process.env.ML_REFRESH_TOKEN?.trim();

        console.log("🔄 Solicitando novo Access Token...");
        
        // Usando o formato mais simples e direto de URLSearchParams
        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('client_id', CLIENT_ID);
        params.append('client_secret', CLIENT_SECRET);
        params.append('refresh_token', REFRESH_TOKEN);

        const authRes = await axios.post('https://api.mercadolibre.com/oauth/token', params.toString(), {
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            }
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
                    `- 12x sem juros\n\n` +
                    `🛒 *Link:* ${item.permalink}`;

        await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN.trim()}/sendPhoto`, {
            chat_id: process.env.CHAT_ID.trim(),
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
