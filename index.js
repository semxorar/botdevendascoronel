const axios = require('axios');
const cron = require('node-cron');

const TELEGRAM_TOKEN = '8759778514:AAFBefXS4NR5hV-D_KY4cSV_DuyET2j625Y'; 
const CHAT_ID = '@coroneel7',' -1003719214110'; 
const NICHOS = ['iphone', 'geladeira', 'ps5', 'monitor gamer'];

async function buscarOfertas() {
    console.log("🔎 Buscando ofertas diretamente (Sem bloqueio)...");

    for (const nicho of NICHOS) {
        try {
            const url = `https://api.mercadolibre.com/sites/MLB/search?q=${nicho}&sort=relevance`;
            const res = await axios.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });

            const itens = res.data.results || [];
            const item = itens.find(i => i.original_price && i.price < i.original_price);

            if (item) {
                const desconto = Math.round(((item.original_price - item.price) / item.original_price) * 100);
                const mensagem = `🔥 *OFERTA NO CORONEL* 🔥\n\n📦 *${item.title}*\n💰 *R$ ${item.price}*\n📉 Desconto: ${desconto}%\n\n🛒 [VER NO MERCADO LIVRE](${item.permalink})`;

                await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
                    chat_id: CHAT_ID,
                    text: mensagem,
                    parse_mode: 'Markdown'
                });
                console.log(`✅ Sucesso! Postado: ${item.title}`);
            }
            await new Promise(r => setTimeout(r, 5000)); // Espera 5s entre itens
        } catch (err) {
            console.error(`❌ Erro em ${nicho}:`, err.message);
        }
    }
}

cron.schedule('*/30 * * * *', buscarOfertas);
buscarOfertas();
