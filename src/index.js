const Telegraf = require('telegraf');
const fetch = require('node-fetch');
const Markup = require('telegraf/markup');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  const name = ctx.from.first_name;

  ctx.reply(`Привет, ${name}!`).then(() => {
    ctx.replyWithSticker('CAADAgADCQADlqTFCsZWT3mG1J5FAg');
  });
});

bot.help(ctx => ctx.reply(
  `
    /exchange_rates - показать текущий курс валют
  `,
));

bot.command('exchange_rates', ctx => ctx.reply(
  'Какой курс вас интересует?',
  Markup.inlineKeyboard([
    [Markup.callbackButton('Наличный', 'cash')],
    [Markup.callbackButton('Безналичный', 'cashless')],
  ]).extra(),
));

bot.action(['cash', 'cashless'], (ctx) => {
  const action = ctx.callbackQuery.data;
  let usd;
  let eur;
  let rur;

  if (action === 'cash') {
    usd = 'USD_C';
    eur = 'EUR_C';
    rur = 'RUR_C';
  }

  if (action === 'cashless') {
    usd = 'USD_CL';
    eur = 'EUR_CL';
    rur = 'RUR_CL';
  }

  ctx.reply(
    'Выберите валюту:',
    Markup.inlineKeyboard([
      Markup.callbackButton('$ - USD', usd),
      Markup.callbackButton('€ - EUR', eur),
      Markup.callbackButton('₽ - RUR', rur),
    ]).extra(),
  );
});

bot.action(['USD_C', 'EUR_C', 'RUR_C', 'USD_CL', 'EUR_CL', 'RUR_CL'], (ctx) => {
  const action = ctx.callbackQuery.data;
  const [currency, type] = action.split('_');
  const rate = currency;
  let url;

  if (type === 'C') {
    url = 'https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5';
  }

  if (type === 'CL') {
    url = 'https://api.privatbank.ua/p24api/pubinfo?exchange&json&coursid=11';
  }

  fetch(url, {
    method: 'GET',
  })
    .then(res => res.json())
    .then(res => res.filter(item => item.ccy === rate)[0])
    .then(res => ctx.reply(
      `
        ${res.ccy} => ${res.base_ccy}
        Покупка: ${res.buy}
        Продажа: ${res.sale}
      `,
    ))
    .catch((err) => {
      console.dir(err);
      ctx.reply('Упс, что-то пошло не так. Попробуйте позже.');
    });
});

bot.launch();
