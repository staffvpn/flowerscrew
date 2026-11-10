// Инлайн-режим: в любом чате пишешь @бота и кидаешь мем из своей лавки. Ссылка в кнопке — приглашение от тебя.
import { tgApi, getBot } from './_lib.js';

const esc = s => String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const fmt = n => Math.round(Number(n) || 0).toLocaleString('ru-RU').replace(/ |,/g, ' ');

const MEMES = [
  'Гусь победил. Сорок минут, вся смена, два разбитых букета.',
  'Флорист опоздал на два часа. Сказал, что пробки. Живёт над лавкой.',
  'Дама в шубе в +25 попросила самый дорогой цветы. Получила гвоздика за 900. Довольна.',
  'Мужик принёс кружку на два литра «Лучший папа» и попросил налить как за обычный.',
  'Бабушка двадцать минут пересчитывала сдачу через лупу. Очередь постарела вместе с ней.',
  'Гость предложил расплатиться пятью звёздами на картах. «Это сейчас дороже денег».',
  'Увидел новую цену и медленно сел на пол. Встал сам, через пять минут.',
  'Курьер уснул на диване три часа назад. Заказ остыл, клиент тоже.',
  'Пришёл заказ: двенадцать пионов на кладбище к полуночи. Чаевые оставили.',
  'Мойщица разбила любимую вазу Гоши. Говорит, та сама выскользнула.',
  'Санэпид провёл пальцем по полке, посмотрел на палец и расстроился. Придраться не к чему.',
  'Кассир третий день отвечает «угу». У него украли велосипед.',
  'В зоне отдыха показали чужую свадьбу с флешки. Драка на 2:40, зал стоя аплодировал.',
  'Гость нашёл в розы рыжий волос. Рыжая — его девушка.',
  'Директор крупной сети стоял в очереди и нюхал пенку. Через неделю у них наш пион.'
];
const PICS = ['events.jpg', 'banner.jpg', 'hall.jpg', 'expand.jpg'];

export async function inlineAnswer(env, q, origin) {
  const uid = q.from && q.from.id; let p = null;
  try { if (env.DB) p = await env.DB.prepare('SELECT cafe, level, earned, goal_cups FROM players WHERE tg_id = ?1').bind(uid).first(); } catch {}
  const bot = await getBot(env);
  const url = bot ? `https://t.me/${bot.username}${env.APP_SHORT ? '/' + env.APP_SHORT : ''}?${env.APP_SHORT ? 'startapp' : 'start'}=ref_${uid}` : origin;
  const cafe = p && p.cafe ? '«' + esc(p.cafe) + '»' : 'Моя лавка';
  const pool = MEMES.slice().sort(() => Math.random() - 0.5).slice(0, 5);
  const results = pool.map((m, i) => ({
    type: 'photo', id: 'm' + i + '_' + Date.now() % 100000,
    photo_url: `${origin}/img/${PICS[i % PICS.length]}`, thumbnail_url: `${origin}/img/${PICS[i % PICS.length]}`,
    title: m.slice(0, 60), description: 'Кинуть в чат',
    caption: `<b>${cafe}, Flowers Crew</b>\n\n${esc(m)}${p && p.level ? `\n\nУровень ${p.level}, заработано ${fmt(p.earned)} ₽` : ''}`,
    parse_mode: 'HTML',
    reply_markup: { inline_keyboard: [[{ text: 'Открыть свою лавку', url }]] }
  }));
  await tgApi(env, 'answerInlineQuery', { inline_query_id: q.id, results, cache_time: 10, is_personal: true });
}
