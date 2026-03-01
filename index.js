const axios = require('axios');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const ACCESS_TOKEN = process.env.ML_ACCESS_TOKEN;
const NICHOS = ['iphone', 'geladeira', 'ps5', 'monitor gamer'];

async function buscar() {
  for (const nicho of NICHOS) {
    try {
      const url = `https://api.mercadolibre.com/sites/MLB/search?q=${nicho}&sort=relevance`;
      const res = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
      });
      const item = res.data.results.find(i => i.original_price > i.price);
      if (item) {
        const msg = `🔥 *OFERTA NO CORONEL* 🔥\n\n${item.title}\n💰 *R$ ${item.price}*\n🛒 [VER](${item.permalink})`;
        await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
          chat_id: CHAT_ID, text: msg, parse_mode: 'Markdown'
        });
        console.log(`✅ Postado: ${nicho}`);
      }
    } catch (e) { console.error(`Erro em ${nicho}`); }
  }
}
buscar();
