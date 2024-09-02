const { Telegraf } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Object to store conversation history for each user
const conversationHistory = {};

bot.start((ctx) => ctx.reply('Welcome! I\'m Ayman\'s bot powered by AI. Ask me anything!'));

bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const userMessage = ctx.message.text;

  // Initialize conversation history if it doesn't exist
  if (!conversationHistory[userId]) {
    conversationHistory[userId] = [];
  }

  // Add user message to conversation history
  conversationHistory[userId].push({ role: 'user', content: userMessage });

  try {
    console.log('Received message:', userMessage);
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'llama-3.1-sonar-small-128k-chat',
        messages: conversationHistory[userId],
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

    // Add bot's reply to conversation history
    conversationHistory[userId].push({ role: 'assistant', content: reply });

    // Trim conversation history if it gets too long
    if (conversationHistory[userId].length > 10) {
      conversationHistory[userId] = conversationHistory[userId].slice(-10);
    }

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
