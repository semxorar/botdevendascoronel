const axios = require('axios');
const cron = require('node-cron');

// --- CONFIGURAÇÕES ---
const TELEGRAM_TOKEN = '8759778514:AAFBefXS4NR5hV-D_KY4cSV_DuyET2j625Y'; 
const CHAT_ID = '-1003719214110'; 
const NICHOS = ['iphone', 'geladeira', 'ps5', 'monitor gamer'];

async function buscarOfertas() {
    console.log("🚀 Iniciando busca via Roteador Estável...");

    for (const nicho of NICHOS) {
        try {
            // Usamos o serviço do Cors-Anywhere ou o próprio Proxy da Cloudflare (via roteador público)
            // Essa URL abaixo é uma ponte mais robusta
            const mlUrl = `https://api.mercadolibre.com/sites/MLB/search?q=${nicho}&sort=relevance`;
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(mlUrl)}`;
            
            const res = await axios.get(proxyUrl, { timeout: 15000 });

            if (res.data && res.data.contents) {
                const data = JSON.parse(res.data.contents);
                const itens = data.results || [];
                
                // Filtramos o item com melhor desconto
                const item = itens.find(i => i.original_price && i.price < i.original_price);

                if (item) {
                    const desconto = Math.round(((item.original_price - item.price) / item.original_price) * 100);
                    
                    const mensagem = 
                        `🔥 *OFERTA NO CORONEL - ${desconto}% OFF* 🔥\n\n` +
                        `📦 *${item.title}*\n` +
                        `❌ De: R$ ${item.original_price}\n` +
                        `✅ *Por: R$ ${item.price}*\n\n` +
                        `🛒 [VER NO MERCADO LIVRE](${item.permalink})`;

                    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
                        chat_id: CHAT_ID,
                        text: mensagem,
                        parse_mode: 'Markdown'
                    });

                    console.log(`✅ SUCESSO: Postado ${nicho}`);
                }
            }
            
            // Espera obrigatória de 5 segundos para não travar a ponte
            await new Promise(r => setTimeout(r, 5000));

        } catch (err) {
            console.error(`⚠️ Tentando reconectar para ${nicho}...`);
            // Se a ponte falhar, o bot apenas pula para o próximo nicho sem travar tudo
        }
    }
}

// Roda a cada 30 minutos
cron.schedule('*/30 * * * *', buscarOfertas);

// Inicia imediatamente
buscarOfertas();
