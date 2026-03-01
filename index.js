const axios = require('axios');

// --- CARREGAR VARIÁVEIS DO GITHUB ---
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const ACCESS_TOKEN = process.env.ML_ACCESS_TOKEN;
const CLIENT_ID = process.env.ML_CLIENT_ID;
const CLIENT_SECRET = process.env.ML_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.ML_REFRESH_TOKEN;

const NICHOS = ['iphone', 'geladeira', 'ps5', 'monitor gamer'];

async function buscarOfertas() {
    console.log("🔎 Iniciando busca profissional...");

    for (const nicho of NICHOS) {
        try {
            const url = `https://api.mercadolibre.com/sites/MLB/search?q=${nicho}&sort=relevance`;
            const res = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
            });

            const itens = res.data.results || [];
            // Filtra itens com desconto real
            const item = itens.find(i => i.original_price > i.price);

            if (item) {
                // Formatação Profissional (Estilo Wolf Ofertas)
                const precoFormatado = item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                const mensagem = 
                    `🔥 *${item.title}*\n` +
                    `💰 *${precoFormatado}*\n\n` +
                    `- 12x sem juros\n` +
                    `- Frete rápido\n\n` +
                    `🛒 *Link de compra:* ${item.permalink}`;

                // Envia Foto em Alta Resolução
                const fotoUrl = item.thumbnail.replace("-I.jpg", "-O.jpg");

                await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, {
                    chat_id: CHAT_ID,
                    photo: fotoUrl,
                    caption: mensagem,
                    parse_mode: 'Markdown'
                });

                console.log(`✅ Postado: ${item.title}`);
                await new Promise(r => setTimeout(r, 5000)); // Espera 5s
            }
        } catch (err) {
            console.error(`❌ Erro em ${nicho}: Verifique se o ML_ACCESS_TOKEN ainda é válido.`);
        }
    }
}

buscarOfertas();
