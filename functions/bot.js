const { Telegraf } = require('telegraf');
const axios = require('axios');
require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('Welcome! I'm Ayman's bot powered by AI. Ask me anything!'));

bot.on('text', async (ctx) => {
  try {
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar-medium-online',
        messages: [{ role: 'user', content: ctx.message.text }],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    ctx.reply(reply);
  } catch (error) {
    console.error('Error:', error);
    ctx.reply('Sorry, I encountered an error while processing your request.');
  }
});

exports.handler = async (event) => {
  try {
    await bot.handleUpdate(JSON.parse(event.body));
    return { statusCode: 200, body: '' };
  } catch (e) {
    console.error('Error in Telegram bot:', e);
    return { statusCode: 400, body: 'This endpoint is meant for bot and telegram communication' };
  }
};
