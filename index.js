const axios = require('axios');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const ACCESS_TOKEN = process.env.ML_ACCESS_TOKEN;

const NICHOS = ['iphone', 'ps5', 'monitor gamer'];

async function buscar() {
    console.log("🚀 Iniciando busca de teste...");

    for (const nicho of NICHOS) {
        try {
            const url = `https://api.mercadolibre.com/sites/MLB/search?q=${nicho}&sort=relevance`;
            const res = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
            });

            const itens = res.data.results || [];
            
            // LOG DE TESTE: Mostra no GitHub quantos itens foram achados
            console.log(`🔎 Nicho ${nicho}: ${itens.length} itens encontrados.`);

            if (itens.length > 0) {
                // Pegamos o primeiro item da lista (mesmo sem desconto) apenas para TESTAR o envio
                const item = itens[0]; 
                
                const preco = item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                
                // Formatação igual à da imagem que você enviou
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
                
                console.log(`✅ Mensagem de teste enviada para: ${item.title}`);
                return; // Para o teste após o primeiro envio bem-sucedido
            }
        } catch (e) {
            console.error(`❌ Erro no nicho ${nicho}:`, e.response?.data || e.message);
        }
    }
}

buscar();
