const axios = require('axios');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID; // Deve ser -1003719214110 nos Secrets
const ACCESS_TOKEN = process.env.ML_ACCESS_TOKEN;

async function iniciarBot() {
    console.log("🏁 Iniciando Processo de Postagem...");
    
    try {
        // 1. Buscar um produto simples do Mercado Livre
        const ml = await axios.get(`https://api.mercadolibre.com/sites/MLB/search?q=iphone&limit=1`, {
            headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
        });

        if (!ml.data.results || ml.data.results.length === 0) {
            console.log("⚠️ Nenhum produto encontrado no ML.");
            return;
        }

        const item = ml.data.results[0];
        const preco = item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const foto = item.thumbnail.replace("-I.jpg", "-O.jpg");

        // 2. Montar Mensagem Profissional
        const msg = `🔥 *${item.title}*\n` +
                    `💰 *${preco}*\n\n` +
                    `- 12x sem juros\n` +
                    `- Frete rápido\n\n` +
                    `🛒 *Link:* ${item.permalink}`;

        console.log(`📡 Tentando enviar para o ID: ${CHAT_ID}`);

        // 3. Enviar e AGUARDAR a resposta do Telegram
        const telegramRes = await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, {
            chat_id: CHAT_ID,
            photo: foto,
            caption: msg,
            parse_mode: 'Markdown'
        });

        if (telegramRes.data.ok) {
            console.log("✅ SUCESSO TOTAL! Verifique seu canal agora.");
        }

    } catch (error) {
        console.error("❌ ERRO NO PROCESSO:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Detalhes:", JSON.stringify(error.response.data));
        } else {
            console.error("Mensagem:", error.message);
        }
    }
}

// Chamar a função
iniciarBot();
