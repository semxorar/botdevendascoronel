const axios = require('axios');
const qs = require('querystring'); // Necessário para formatar os dados corretamente

async function iniciarBot() {
    console.log("🏁 Iniciando Processo de Autenticação...");
    
    try {
        // 1. RENOVAR O TOKEN (Usando o formato de formulário aceito pelo ML)
        console.log("🔄 Solicitando novo Access Token...");
        
        const dadosRenovacao = qs.stringify({
            grant_type: 'refresh_token',
            client_id: process.env.ML_CLIENT_ID,
            client_secret: process.env.ML_CLIENT_SECRET,
            refresh_token: process.env.ML_REFRESH_TOKEN
        });

        const authRes = await axios.post('https://api.mercadolibre.com/oauth/token', dadosRenovacao, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
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
            
            if (error.response.data.message.includes("invalid_grant")) {
                console.error("👉 DICA: Seu ML_REFRESH_TOKEN expirou de vez. Gere um novo no painel do ML e atualize o GitHub Secret.");
            }
        } else {
            console.error("Mensagem:", error.message);
        }
    }
}

iniciarBot();
