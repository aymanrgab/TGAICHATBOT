const { Telegraf } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('Welcome! I\'m Ayman\'s bot powered by AI. Ask me anything!'));

bot.on('text', async (ctx) => {
  try {
    console.log('Received message:', ctx.message.text);
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'llama-3.1-70b-instruct',
        messages: [{ role: 'user', content: ctx.message.text }],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Perplexity API response:', response.data);
    const reply = response.data.choices[0].message.content;
    await ctx.reply(reply);
  } catch (error) {
    console.error('Error details:', error.response ? error.response.data : error.message);
    await ctx.reply('Sorry, I encountered an error while processing your request.');
  }
});

exports.handler = async (event) => {
  try {
    console.log('Received event:', event);
    await bot.handleUpdate(JSON.parse(event.body));
    return { statusCode: 200, body: 'OK' };
  } catch (e) {
    console.error('Error in Telegram bot:', e);
    return { statusCode: 400, body: 'This endpoint is meant for bot and telegram communication' };
  }
};
