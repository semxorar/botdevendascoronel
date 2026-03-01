const axios = require('axios');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const ACCESS_TOKEN = process.env.ML_ACCESS_TOKEN;

const NICHOS = ['iphone', 'ps5', 'monitor gamer', 'geladeira'];

async function buscar() {
    console.log("🚀 Iniciando busca para o canal Coronel Ofertas...");

    for (const nicho of NICHOS) {
        try {
            const url = `https://api.mercadolibre.com/sites/MLB/search?q=${nicho}&sort=relevance`;
            const res = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
            });

            const itens = res.data.results || [];
            // Filtro: busca o primeiro item que tenha um desconto (preço original > preço atual)
            const item = itens.find(i => i.original_price > i.price) || itens[0];

            if (item) {
                const preco = item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                
                const msg = `🔥 *${item.title}*\n` +
                            `💰 *${preco}*\n\n` +
                            `- 12x sem juros\n` +
                            `- Frete rápido\n\n` +
                            `🛒 *Link de compra:* ${item.permalink}`;

                const foto = item.thumbnail.replace("-I.jpg", "-O.jpg");

                await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, {
                    chat_id: CHAT_ID,
                    photo: foto,
                    caption: msg,
                    parse_mode: 'Markdown'
                });
                
                console.log(`✅ Sucesso! Oferta de ${nicho} enviada.`);
                // Espera 5 segundos para não ser bloqueado pelo Telegram
                await new Promise(r => setTimeout(r, 5000));
            }
        } catch (e) {
            console.error(`❌ Erro no nicho ${nicho}:`, e.message);
        }
    }
}

buscar();
