import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase, getAllDbSamples } from './db.js';
import { updateSampleMetadata } from './datasetService.js';
import { extractEmotionAndCleanText } from './emotionUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tagged paragraphs from original user input for batch 1 (samples 3100 to 3148)
const BATCH_1_PARAGRAPHS = [
  "[calm] ئەم بەیانییە زوو لە خەو هەستام و پەنجەرەکەم کردەوە، هەواکە فێنک و ئارام بوو. I made some coffee and checked my phone before getting ready for university. والله كلشي جان هادي وماكو أي شي غريب بالبداية.",
  "[happy] لە ڕێگای زانکۆ گۆرانییەکی دڵخوازم گوێ لێبوو و ڕۆژەکە زۆر باش دەستی پێکرد. The streets were quiet, and I actually arrived earlier than usual. بصراحة فرحت لأن ماكو زحمة والطريق جان سهل.",
  "[surprise] کاتێک گەیشتمە زانکۆ، هاوڕێکەم وتمی وانەی یەکەم هەڵوەشاوەتەوە. I checked the group chat twice because I really did not expect that. صدگ چذب، الدكتور لغى المحاضرة قبل لا نوصل بدقايق.",
  "[laugh] من و هاوڕێکەم وت‌مان باشە با بچین قاوە بخۆینەوە و کات بەسەر بەرین. We sat down, started talking, and somehow ended up laughing about an old classroom mistake. والله متنا ضحك من تذكرنا السالفة القديمة.",
  "[excited] ئەمشەو بڕیارم دا یارییە نوێیەکەی کە چەند ڕۆژ بوو دابەزێنم بکەمەوە. I grabbed my headphones, turned off the room lights, and got ready to finally play. والله جان عندي حماس مو طبيعي حتى أجربها.",
  "[surprise] بەڵام کاتێک یارییەکەم کردەوە، نوێکردنەوەیەکی گەورەی داوا کرد. I just stared at the progress bar because I thought everything had already downloaded. يا ربي ساعتين وأنا أنتظر وهسه طلع تحديث جديد.",
  "[angry] دابەزاندنەکە گەیشتە نزیک کۆتایی و ئینتەرنێتەکە لەناکاو پچڕا. I literally just looked at the screen with complete silence and frustration. صدگ انقهرت، باقي بس دقيقة ويخلص.",
  "[tired] دوای چەند هەوڵێک دانیشتم و قاوەکەمیش سارد ببووەوە. I was looking forward to playing all evening, but nothing went as planned. بصراحة طفت الكهرباء وراها وما بقى عندي خلك لأي شي.",
  "[calm] بەڵام کەمێک دواتر وایفای گەڕایەوە و دابەزاندنەکە تەواو بوو. The game finally opened, and the opening music made me forget the whole headache. الحمد لله بالنهاية اشتغلت وكل التعب راح.",
  "[calm] ئەمڕۆ دوای نیوەڕۆ چووین بۆ بازاڕ بۆ کڕینی چەند پێداویستییەکی ڕۆژانە. The weather was a bit chilly, so we walked slowly and checked the small shops. والله جان الجو حلو والمحلات كلها هادية.",
  "[happy] لە یەکەم فرۆشگا هەمان شتەمان دۆزییەوە کە چەند ڕۆژ بوو بەدوایدا دەگەڕاین. The price was actually lower than we expected, which was a pleasant surprise. بصراحة فرحنا لأن لكينا الشي بسعر كلش مناسب.",
  "[surprise] لەناکاو لە ناو بازاڕ هاوڕێیەکی کۆنم بینی کە چەندین ساڵ بوو نەمبینیبوو. We both stopped in the middle of the street, completely surprised to run into each other. صدگ الدنيا زغيرة، صدفة عجيبة ما چنت متوقعها أبد.",
  "[laugh] دەستمان کرد بە قسەکردن و یادی چەند شتی کۆنمان کردەوە کە پێشتر کردبوومان. People walking by were looking at us because we were laughing so loudly. والله ضحكنا ضحك من تذكرنا أيام زمان والذكريات الحلوة.",
  "[tired] دوای چەند کاتژمێرێک لە بازاڕ، جانتاکانمان پڕ بوون و پێمان ماندوو بوو. We decided to stop at a quiet café to rest before heading back home. بصراحة رجلينا تكسرت من المشي وهسه بس نريد نرتاح.",
  "[calm] ئەمشەو کاتێک بە تەنها لە ماڵ بووم، دەنگێکی سەیر لە پەنجەرەکەوە هات. I paused the video I was watching and listened carefully for a moment. والله بالبداية گلت يمكن أتوهم وماكو شي.",
  "[whisper] بە هێواشی لە شوێنەکەم هەستام و بەرەو پەنجەرەکە چووم. I did not want to make any noise until I knew what was happening. بصوت واطي گلت يمكن بس الهوا أو شي طاح بره.",
  "[surprise] کاتێک پەردەکەم لادا، پشیلەیەکم بینی لەسەر لقی دارەکە وەستاوە. It was staring right back at me with two big glowing eyes. يا ربي شگد فزيت، طلع بس بزون صغير.",
  "[laugh] پشیلەکە سەیری منی دەکرد وەک ئەوەی خۆی خاوەنی ماڵەکە بێت. I started laughing at myself for being so anxious over absolutely nothing. صدگ ضحكت على روحي شلون خفت من بزون صغير.",
  "[calm] دوای ئەوە گەڕامەوە بۆ ژوورەکەم و ڤیدیۆکەم بە ئارامی تەواو کرد. The house was quiet again, and everything went back to normal. الحمد لله ارتاح بالي وسديت الشباك ورجعت لفراشي.",
  "[calm] ئەمڕۆ بڕیارم دا چێشتێکی نوێ لە ماڵ دروست بکەم کە پێشتر تاقیم نەکردبووەوە. I watched a tutorial online twice and carefully prepared all the ingredients on the counter. گلت اليوم لازم أبدع وأسوي شي مختلف.",
  "[excited] کاتێک بۆنی خواردنەکە دەستی پێکرد، هەموو ماڵەکە پڕ بوو لە بۆنی خۆش. I kept checking the pan because it looked better than I expected. بصراحة تحمست وگلت شكله راح يطلع رهيب.",
  "[surprise] بەڵام لەناکاو بیرم کەوتەوە خوێم بە تەواوی لەبیر کردووە. I tasted one bite and immediately knew something was missing. يا ربي شلون نسيت الملح وأنا مجهز كلشي.",
  "[laugh] دوای زیادکردنی خوێ، براکەم تاقی کردەوە و وتی ئێستا خواردنەکە ڕزگار بوو. We both laughed because five minutes earlier I was acting like a professional chef. والله قبل شوي عبالي نفسي شيف عالمي.",
  "[happy] لە کۆتاییدا خواردنەکە زۆر خۆش دەرچوو و هەمووانیان حەزیان لێکرد. I was genuinely proud that the experiment worked. الحمد لله بالنهاية الطبخة طلعت طيبة وما بقى منها شي.",
  "[nervous] ئەمڕۆ لە زانکۆ نۆرەی پێشکەشکردنم بوو و پێش دەستپێکردن دڵم خێرا لێیدەدا. I had practiced everything, but standing in front of the class still felt different. والله توترت من شفت الكل يطالعون بي.",
  "[calm] هەناسەیەکی قوڵم هەڵمژاند و یەکەم سلایدەکەم کردم. Once I started speaking, the words came back exactly as I had practiced them. بصراحة بعد أول دقيقة هديت وصار الوضع أسهل.",
  "[surprise] لە ناو پێشکەشکردنەکەدا مامۆستا پرسیارێکی کرد کە چاوەڕوانی نەبووم. I paused for a second, thought about it, and somehow answered correctly. صدگ حتى أني استغربت من نفسي لأن الجواب طلع مضبوط.",
  "[happy] کاتێک پێشکەشکردنەکەم تەواو بوو، مامۆستا وتی ڕوون و ڕێکخراو بوو. I sat down feeling much better than I had before starting. والله فرحت لأن كل التعب والتحضير ما راح هدر.",
  "[laugh] دوای وانەکە هاوڕێکەم پێی وتم لە یەکەم خولەکدا دەستم زۆر دەجووڵاند. We laughed because I had not even noticed I was doing it. صدگ التوتر يسوي أشياء غريبة بدون ما الواحد يحس.",
  "[calm] ئەمڕۆ ئێوارە بڕیارم دا ئۆتۆمبێلەکە بشۆم چونکە کەشوهەوا پاک بوو. I checked the sky first, and there was barely a cloud anywhere. والله گلت هذا أحسن يوم حتى أغسل السيارة.",
  "[happy] دوای نیو کاتژمێر ئۆتۆمبێلەکە پاک و بریقەدار بوو. I stepped back and felt satisfied because it looked almost new again. بصراحة النتيجة طلعت أحسن من اللي توقعت.",
  "[surprise] تەنها چەند خولەک دواتر هەورە ڕەشەکان لەناکاو دەرکەوتن. I looked up at the sky and immediately knew what was about to happen. يا ربي منين إجت هاي الغيوم كلها فجأة.",
  "[angry] باران بە توندی دەستی پێکرد و هەموو کارەکەم لە چەند چرکەدا لەناو چوو. I just stood there watching the clean car get covered in rainwater. والله قهر، يعني ما لكت تمطر غير هسه.",
  "[laugh] دوای کەمێک پێکەنیم چونکە هیچ شتێکم لەدەست نەدەهات. At least the rain gave the car one more free rinse. صدگ بالنهاية گلت خليها على الله وضحكت على حظي.",
  "[excited] ئەمڕۆ پاکەتێکم چاوەڕێ دەکرد کە چەند ڕۆژ بوو ئۆنلاین داوام کردبوو. I kept checking the tracking page because it finally said out for delivery. والله من الصبح وأنا أفتح التطبيق كل شوي.",
  "[surprise] لەناکاو زەنگی دەرگا لێیدا زووتر لەو کاتەی چاوەڕوانم دەکرد. I rushed downstairs because I knew it was probably the delivery driver. صدگ وصل قبل الموعد بساعتين تقريباً.",
  "[happy] قاپەکە بە تەواوی ساغ بوو و شتەکەش هەمان ئەوە بوو کە داوام کردبوو. I opened it carefully and everything looked perfect. الحمد لله لا مكسور ولا ناقص ولا بي أي مشكلة.",
  "[laugh] تەنها شتێکی سەیر ئەوە بوو سندوقەکە نزیکەی دە هێندەی شتەکە گەورەتر بوو. The tiny item was surrounded by a ridiculous amount of packaging. والله حسبالي بالبداية دازينلي جهاز كامل مو هالشي الصغير.",
  "[calm] دوای تاقیکردنەوە دڵنیا بووم کە بە باشی کار دەکات. I put the packaging away and finally stopped checking the tracking app every ten minutes. بصراحة ارتحت لأن الطلب وصل وكلشي صار تمام.",
  "[tired] دوێنێ شەو تا درەنگی شەو بۆ تاقیکردنەوەکەم خوێندم. I kept telling myself I would sleep after one more chapter, but that never happened. والله من شفت الساعة كانت تقريباً ثلاثة بالليل.",
  "[nervous] ئەم بەیانییە لە ڕێگای زانکۆ هەموو کات بیرم لە پرسیارەکان دەکردەوە. I felt prepared, but I still worried that the exam would focus on the one topic I disliked. بصراحة كل الطريق وأنا أراجع براسي.",
  "[surprise] کاتێک کاغەزی تاقیکردنەوەکەم بینی، زۆربەی پرسیارەکان لەو بابەتانە بوون کە باش خوێندبووم. I actually had to check the first page twice because it looked much easier than expected. صدگ ارتحت من شفت الأسئلة.",
  "[happy] بە هێواشی وەڵامم دانەوە و کاتێکی باشیشم بۆ پشکنینەوە مایەوە. For once, I did not have to rush through the final questions. الحمد لله كل التعب مال البارحة فادني.",
  "[tired] دوای تاقیکردنەوە گەڕامەوە ماڵ و یەکسەر لەسەر قەنەفەکە دانیشتم. I was happy with how it went, but my brain was completely finished for the day. والله هسه بس أريد أنام وما أفكر بأي امتحان.",
  "[happy] ئەمشەو من و هاوڕێکانم بڕیارمان دا فیلمێکی کۆمیدی ببینین. We ordered some food, turned down the lights, and picked a movie none of us had seen. والله من البداية الجو جان حلو وكلنا متحمسين.",
  "[laugh] لە یەکەم نیو کاتژمێردا دیمەنێکی زۆر پێکەنیناوی هات و هەموومان دەستمان کرد بە پێکەنین. One of my friends laughed so hard that everyone else started laughing at him instead of the movie. صدگ بطوننا وجعتنا من كثر الضحك.",
  "[surprise] لە ناو فیلمەکەدا کارەبا لەناکاو کوژایەوە و شاشەکە ڕەش بوو. For a few seconds nobody said anything because the timing was almost too perfect. يا ربي حتى الكهرباء اختارت أحلى لقطة حتى تطفي.",
  "[angry] یەکێک لە هاوڕێکانم وتی ئینتەرنێتیش پچڕاوە و ناتوانین لە مۆبایل بەردەوام بین. I complained for a minute because we had finally found a movie everyone liked. والله شنو هالحظ، لا كهرباء ولا نت.",
  "[calm] بەڵام لە کۆتاییدا چرای مۆبایلەکانمان هەڵکرد و تەنها دانیشتین و قسەمان کرد. The movie could wait, and somehow the conversation became more entertaining anyway. الحمد لله حتى بدون الفيلم قضينا ليلة حلوة."
];

// Direct mapping for batch 2 (samples 3149 to 3193)
const BATCH_2_EXACT_MAP = {
  "3149": { emotion: "calm", tag: "[calm]" },
  "3150": { emotion: "surprise", tag: "[surprise]" },
  "3151": { emotion: "angry", tag: "[angry]" },
  "3152": { emotion: "calm", tag: "[calm]" },
  "3153": { emotion: "laugh", tag: "[laugh]" },
  "3154": { emotion: "excited", tag: "[excited]" },
  "3155": { emotion: "surprise", tag: "[surprise]" },
  "3156": { emotion: "angry", tag: "[angry]" },
  "3157": { emotion: "tired", tag: "[tired]" },
  "3158": { emotion: "happy", tag: "[happy]" },
  "3159": { emotion: "calm", tag: "[calm]" },
  "3160": { emotion: "happy", tag: "[happy]" },
  "3161": { emotion: "surprise", tag: "[surprise]" },
  "3162": { emotion: "laugh", tag: "[laugh]" },
  "3163": { emotion: "tired", tag: "[tired]" },
  "3164": { emotion: "nervous", tag: "[nervous]" },
  "3165": { emotion: "surprise", tag: "[surprise]" },
  "3166": { emotion: "whisper", tag: "[whisper]" }, // "بە هێواشی بەرەو پەنجەرەکە چووم. I tried not to make any noise"
  "3167": { emotion: "laugh", tag: "[laugh]" },
  "3168": { emotion: "calm", tag: "[calm]" },
  "3169": { emotion: "excited", tag: "[excited]" },
  "3170": { emotion: "surprise", tag: "[surprise]" },
  "3171": { emotion: "angry", tag: "[angry]" },
  "3172": { emotion: "laugh", tag: "[laugh]" },
  "3173": { emotion: "happy", tag: "[happy]" },
  "3174": { emotion: "calm", tag: "[calm]" },
  "3175": { emotion: "surprise", tag: "[surprise]" },
  "3176": { emotion: "angry", tag: "[angry]" },
  "3177": { emotion: "sad", tag: "[sad]" },
  "3178": { emotion: "laugh", tag: "[laugh]" },
  "3179": { emotion: "excited", tag: "[excited]" },
  "3180": { emotion: "surprise", tag: "[surprise]" },
  "3181": { emotion: "happy", tag: "[happy]" },
  "3182": { emotion: "laugh", tag: "[laugh]" },
  "3183": { emotion: "calm", tag: "[calm]" },
  "3184": { emotion: "tired", tag: "[tired]" },
  "3185": { emotion: "nervous", tag: "[nervous]" },
  "3186": { emotion: "surprise", tag: "[surprise]" },
  "3187": { emotion: "happy", tag: "[happy]" },
  "3188": { emotion: "tired", tag: "[tired]" },
  "3189": { emotion: "happy", tag: "[happy]" },
  "3190": { emotion: "laugh", tag: "[laugh]" },
  "3191": { emotion: "surprise", tag: "[surprise]" },
  "3192": { emotion: "angry", tag: "[angry]" },
  "3193": { emotion: "calm", tag: "[calm]" }
};

export async function runRepair() {
  console.log('[Repair] Initializing database connection...');
  await initDatabase();
  const allSamples = await getAllDbSamples();
  console.log(`[Repair] Found ${allSamples.length} total samples in database.`);

  let repairedCount = 0;

  // 1. Repair Batch 1 (samples 3100 to 3148) by matching text with original prompt tags
  console.log('\n[Repair] Processing Batch 1 (3100-3148) against original tagged script...');
  for (const p of BATCH_1_PARAGRAPHS) {
    const parsed = extractEmotionAndCleanText(p);
    if (!parsed.emotion || parsed.emotion === 'neutral') continue;

    const matched = allSamples.find(s => {
      const idNum = parseInt(s.id);
      if (idNum < 3100 || idNum > 3148) return false;
      const sText = s.text.replace(/\s+/g, ' ').trim();
      const cleanP = parsed.cleanText.replace(/\s+/g, ' ').trim();
      return cleanP.includes(sText.slice(0, 20)) || sText.includes(cleanP.slice(0, 20));
    });

    if (matched) {
      console.log(`  -> Repaired #${matched.id}: emotion "${matched.emotion}" -> "${parsed.emotion}" (${parsed.emotionTag})`);
      await updateSampleMetadata(matched.id, {
        emotion: parsed.emotion,
        emotion_tag: parsed.emotionTag,
        emotionTag: parsed.emotionTag
      });
      repairedCount++;
    }
  }

  // 2. Repair Batch 2 (samples 3149 to 3193)
  console.log('\n[Repair] Processing Batch 2 (3149-3193) with exact emotional narrative sequence...');
  for (const [id, info] of Object.entries(BATCH_2_EXACT_MAP)) {
    const existing = allSamples.find(s => String(s.id) === String(id));
    if (existing) {
      console.log(`  -> Repaired #${id}: emotion "${existing.emotion}" -> "${info.emotion}" (${info.tag})`);
      await updateSampleMetadata(id, {
        emotion: info.emotion,
        emotion_tag: info.tag,
        emotionTag: info.tag
      });
      repairedCount++;
    }
  }

  console.log(`\n======================================================`);
  console.log(`[Repair Complete] Successfully repaired ${repairedCount} samples!`);
  console.log(`Both MySQL database and disk .json files are now updated.`);
  console.log(`======================================================\n`);
  return repairedCount;
}

// Run directly if invoked from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runRepair().then(() => process.exit(0)).catch(err => {
    console.error('[Repair Error]:', err);
    process.exit(1);
  });
}
