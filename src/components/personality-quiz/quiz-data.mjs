import { AXIS_KEYS } from './quiz-engine.mjs';

export const QUIZ_VERSION = 1;
export const QUIZ_SESSION_KEY = 'pvzge.personalityQuiz.v1';
export const QUIZ_RESULT_SESSION_KEY = 'pvzge.personalityQuiz.result.v1';

export const LOCALES = Object.freeze({
  zh: { pathPrefix: '', htmlLang: 'zh-CN' },
  en: { pathPrefix: '/en', htmlLang: 'en-US' },
});

export const t = (value, locale) => value?.[locale] ?? value?.en ?? value?.zh ?? '';

const L = (zh, en) => ({ zh, en });
const O = (id, label, vector) => ({ id, label, vector });

export const UI_COPY = Object.freeze({
  eyebrow: L('戴夫的植物配对机', "Dave's Plant Matcher"),
  title: L('你是哪株植物？', 'Which Plant Are You?'),
  intro: L('12 个小场面，凭第一反应选就行。做完看看戴夫会把哪包种子塞给你。', 'Pick whatever feels right in 12 little situations. Then see which seed packet Dave hands you.'),
  start: L('开始测试', 'Start the quiz'),
  resume: L('继续上次进度', 'Resume previous quiz'),
  restart: L('重新开始', 'Start over'),
  previous: L('上一题', 'Previous'),
  reveal: L('看看我是哪株', 'Show me my plant'),
  questionProgress: L('第 {current} / {total} 题', 'Question {current} of {total}'),
  tieProgress: L('加赛题 {current} / 2', 'Tie-breaker {current} of 2'),
  tieEyebrow: L('戴夫纠结了', "Dave can't decide"),
  tieIntro: L('这两包种子都挺像你，再选一个。', 'Both seed packets look like you. Pick one more.'),
  keyboardHint: L('可按 1–4 选择答案', 'Press 1–4 to choose'),
  calculating: L('戴夫在种子堆里找结果…', 'Dave is digging through the seed packets…'),
  resultEyebrow: L('戴夫给你的是', 'Dave picked'),
  whyTitle: L('怎么会是它？', 'Why this one?'),
  mechanicTitle: L('它在游戏里干啥', 'What it does in the game'),
  axisTitle: L('你更偏哪边', 'Which way you lean'),
  closeTitle: L('你也有点像', 'You are also a bit like'),
  share: L('分享结果', 'Share result'),
  copy: L('复制结果文案', 'Copy result text'),
  download: L('下载结果卡', 'Download result card'),
  copied: L('结果文案已复制', 'Result text copied'),
  shareReady: L('结果卡已准备好', 'Result card is ready'),
  shareEyebrow: L('戴夫给我翻出的植物', 'The plant Dave picked for me'),
  scanToQuiz: L('扫码测测你是哪株植物', 'Scan to find your plant'),
  retry: L('再测一次', 'Take it again'),
  almanac: L('去图鉴看看它', 'View it in the Almanac'),
  unavailableShare: L('当前浏览器不支持直接分享，已改为复制文案。', 'Direct sharing is unavailable, so the result text was copied instead.'),
  resultTemplate: L('戴夫给我翻出了「{name}」：{title}。你会抽到哪包种子？{url}', 'Dave pulled {name} for me: {title}. Which seed packet will you get? {url}'),
});

export const AXIS_COPY = Object.freeze({
  initiative: { negative: L('观察', 'Observe'), positive: L('主动', 'Act') },
  risk: { negative: L('稳妥', 'Safe'), positive: L('冒险', 'Bold') },
  planning: { negative: L('规划', 'Plan'), positive: L('即兴', 'Improvise') },
  social: { negative: L('单株', 'Solo plant'), positive: L('配阵', 'Synergy') },
  method: { negative: L('直接', 'Direct'), positive: L('控场', 'Control') },
  tempo: { negative: L('持续', 'Steady'), positive: L('爆发', 'Burst') },
  change: { negative: L('稳定', 'Stable'), positive: L('变化', 'Adaptive') },
  presence: { negative: L('辅助', 'Support'), positive: L('主力', 'Core') },
});

export const QUESTIONS = Object.freeze([
  {
    id: 'q01-opening-wave',
    prompt: L('第一波就来了个没见过的僵尸，你咋办？', "A zombie you've never seen shows up in the first wave. What now?"),
    options: [
      O('watch', L('先看它走两步，摸清楚再种', 'Watch it for a moment, then start planting'), { initiative: -1, planning: -1, method: 0.5 }),
      O('meet', L('管它呢，先种一棵顶上去', 'Whatever — put a plant down and deal with it'), { initiative: 1, risk: 0.5, method: -0.5 }),
      O('roles', L('前排先拖住，后排再补输出', 'Stall it up front and add damage behind'), { social: 1, presence: 0.5, planning: -0.5 }),
      O('remix', L('把原来的阵换掉，现场试个新搭配', 'Change the setup and try a new combo on the spot'), { planning: 1, change: 1, risk: 0.5 }),
    ],
  },
  {
    id: 'q02-spare-sun',
    prompt: L('手里突然多了 100 阳光，你会怎么花？', 'You suddenly have 100 extra sun. What do you buy?'),
    options: [
      O('income', L('再补一棵产阳光的，后面心里踏实', 'Add another sun producer so the rest feels safer'), { risk: -1, tempo: -1, change: -0.5 }),
      O('burst', L('先攒着，等怪多了放个大的', 'Save it until the lawn gets crowded'), { risk: 0.5, tempo: 1, planning: -0.5 }),
      O('control', L('放个减速的，别让僵尸走太快', 'Put down something that slows the zombies'), { method: 1, planning: -0.5, tempo: -0.5 }),
      O('odd', L('挑棵平时不用的，今天就试试它', "Pick a plant you never use and give it a go"), { change: 1, planning: 1, risk: 0.5 }),
    ],
  },
  {
    id: 'q03-mistake',
    prompt: L('刚才手滑种错一格，这一路留了个口子。你会？', 'You planted on the wrong tile and left a gap in one lane. You…'),
    options: [
      O('cover', L('临时补一棵，先把口子堵上', 'Drop in a quick plant and close the gap first'), { initiative: 1, social: 1, risk: -0.5 }),
      O('recalc', L('铲掉重种，顺手把这一路排整齐', 'Dig it up, replant, and straighten out the lane'), { social: -1, planning: -1, presence: 0.5 }),
      O('rally', L('调一下附近几棵，让它们互相补位', 'Adjust the nearby plants so they cover one another'), { social: 1, presence: 1, method: 0.5 }),
      O('pivot', L('干脆留着这个口，等僵尸靠近再一波清', 'Keep the gap and clear the zombies once they come closer'), { change: 1, risk: 1, planning: 1 }),
    ],
  },
  {
    id: 'q04-new-rule',
    prompt: L('游戏里刚加了个你完全看不懂的新东西，你会？', "The game adds something you don't understand at all. You…"),
    options: [
      O('read', L('先把说明看完，省得白忙', 'Read the instructions first and save the trouble'), { initiative: -1, planning: -1, risk: -0.5 }),
      O('touch', L('直接上手点，玩两把就懂了', "Just start clicking. I'll get it after a game or two"), { initiative: 1, risk: 1, planning: 0.5 }),
      O('observe', L('先去简单关里试两次', 'Try it a couple of times in an easy level'), { initiative: -1, planning: -0.5, presence: -1 }),
      O('bend', L('专门试些奇怪操作，看能不能玩出新花样', 'Try weird stuff and see what the game lets me do'), { method: 1, change: 1, risk: 0.5 }),
    ],
  },
  {
    id: 'q05-reward',
    prompt: L('选植物时还剩最后一个位置，你会带？', 'There is one slot left in the seed chooser. What do you bring?'),
    options: [
      O('steady', L('不挑场面，怎么都能用的', 'A reliable plant that works almost anywhere'), { risk: -1, tempo: -1, change: -1 }),
      O('rare', L('冷却很久，但能一下救场的', 'A slow-cooling plant that can rescue a bad situation'), { risk: 1, tempo: 1, change: 0.5 }),
      O('team', L('能跟已经选好的植物配合的', 'A plant that fits the rest of the lineup'), { social: 1, method: 0.5, presence: 0.5 }),
      O('spotlight', L('专门收拾最麻烦那种僵尸的', 'A plant picked for the most troublesome zombie'), { presence: 1, method: -0.5, tempo: 0.5 }),
    ],
  },
  {
    id: 'q06-pressure',
    prompt: L('最后一波快压到家门口了，你会？', 'The last wave is almost at the house. You…'),
    options: [
      O('hold', L('前排继续加厚，能拖一秒是一秒', 'Add more defense and buy every second I can'), { risk: -1, change: -1, tempo: -0.5 }),
      O('counter', L('把输出全下了，跟它们拼了', 'Drop all the damage plants and fight it out'), { initiative: 1, method: -1, tempo: 0.5 }),
      O('slow', L('先减速聚怪，再一只只收拾', 'Slow them down, bunch them up, pick them off'), { method: 1, planning: -1, tempo: -1 }),
      O('ace', L('终于能把一直舍不得用的大招交了', 'Finally use the big move I have been saving'), { tempo: 1, planning: -1, risk: 0.5 }),
    ],
  },
  {
    id: 'q07-formation-choice',
    prompt: L('两套阵型都想用，但草坪只摆得下一套。你会？', 'You like two different setups, but only one fits on the lawn. You…'),
    options: [
      O('evidence', L('算一下阳光和冷却，选更稳的', 'Check the sun cost and cooldowns, then pick the safer one'), { planning: -1, method: 0.5, presence: -0.5 }),
      O('call', L('就用自己最想玩的那套', 'Go with the setup I want to play most'), { initiative: 1, presence: 1, method: -0.5 }),
      O('bridge', L('两边各拿几棵，重新凑一套', 'Take a few plants from each and make a new setup'), { social: 1, risk: -0.5, method: 0.5 }),
      O('trial', L('各打一局，哪套顺手就用哪套', 'Play one round with each and keep the smoother one'), { change: 1, planning: 1, initiative: 0.5 }),
    ],
  },
  {
    id: 'q08-work-style',
    prompt: L('想把一关打得更顺，你一般怎么调？', 'You want a smoother run on a level. How do you tune it?'),
    options: [
      O('deep', L('每天改一点，慢慢磨到满意', 'Tweak it a little every day until it feels right'), { social: -1, tempo: -1, planning: -1 }),
      O('teamwork', L('找几棵能互相配合的，重新组阵', 'Rebuild around a few plants that work well together'), { social: 1, planning: -1, change: -0.5 }),
      O('sprint', L('先放一放，哪天来感觉了一口气搞完', 'Leave it alone, then finish it in one big session'), { tempo: 1, planning: 1, risk: 0.5 }),
      O('iterate', L('先随便打个能过的版本，再一点点换', 'Get any winning run first, then improve it'), { change: 1, initiative: 1, planning: 0.5 }),
    ],
  },
  {
    id: 'q09-attention',
    prompt: L('打完一关回头看草坪，你最想看到？', 'When the level ends and you look over the lawn, you want to see…'),
    options: [
      O('reliable', L('每一路都很稳，几乎没出岔子', 'Every lane held steady with hardly any trouble'), { presence: -1, change: -1, risk: -0.5 }),
      O('captain', L('主力位置清楚，整个阵都围着它打', 'A clear core plant with the whole setup built around it'), { presence: 1, social: 1, initiative: 0.5 }),
      O('spark', L('前面一直忍着，最后一下清干净', 'A patient setup that cleared everything in one big finish'), { presence: 1, tempo: 1, risk: 1 }),
      O('surprise', L('一套看着很怪，实际特别好用的阵', 'A strange-looking setup that worked surprisingly well'), { presence: -0.5, change: 1, method: 1 }),
    ],
  },
  {
    id: 'q10-own-error',
    prompt: L('你发现刚才那步下错了，已经有点来不及。你会？', "You made the wrong move and you're running out of time. You…"),
    options: [
      O('repair', L('先补救，能少漏一只是一只', 'Fix what I can. Every zombie stopped counts'), { initiative: 1, method: -1, tempo: 0.5 }),
      O('analyse', L('停一下想想，到底哪步出了问题', 'Pause and work out exactly what went wrong'), { initiative: -1, planning: -1, risk: -0.5 }),
      O('help', L('调旁边两路的植物一起补这个缺口', 'Use plants from the nearby lanes to cover the gap'), { social: 1, risk: -1, presence: -0.5 }),
      O('reroute', L('不硬救了，顺着现在的局面换个打法', 'Stop forcing the old plan and play from here'), { change: 1, planning: 1, risk: 0.5 }),
    ],
  },
  {
    id: 'q11-perfect-win',
    prompt: L('下面哪种过关最让你爽？', 'Which kind of win feels the best?'),
    options: [
      O('clean', L('从头稳到尾，基本没掉血', 'Safe from start to finish, barely a scratch'), { risk: -1, change: -1, tempo: -0.5 }),
      O('fast', L('僵尸还没站稳就被一路推回去', 'The zombies get pushed back before they settle in'), { initiative: 1, method: -1, tempo: 1 }),
      O('elegant', L('摆好以后几乎不用管，自己就转起来了', 'Once it is set up, the lawn practically runs itself'), { planning: -1, method: 1, presence: -0.5 }),
      O('unlikely', L('拿一套没人看好的怪阵，居然翻盘了', 'Win with a weird setup nobody believed in'), { change: 1, risk: 1, planning: 1 }),
    ],
  },
  {
    id: 'q12-role',
    prompt: L('真让你变成一株植物，你想站哪儿？', 'If you actually became a plant, where would you stand?'),
    options: [
      O('shield', L('最前面，先替后排扛住', 'Right at the front, buying time for the back line'), { social: 1, risk: -1, change: -0.5 }),
      O('cannon', L('能打到最多僵尸的位置', 'Wherever I can hit the most zombies'), { initiative: 1, method: -1, tempo: 1 }),
      O('conductor', L('哪儿最需要帮忙，我就去哪儿控场', 'Wherever the lawn needs help keeping things under control'), { planning: -1, method: 1, social: 0.5 }),
      O('wildcard', L('都行，最好一会儿还能换个玩法', 'Anywhere, as long as I can switch things up later'), { planning: 1, change: 1, risk: 0.5 }),
    ],
  },
]);

const TIE_BREAK_PROMPTS = {
  initiative: L('最后就差你按一下，你会？', 'Everything is ready. You just need to press the button. You…'),
  risk: L('两条路摆在你面前，你会走？', 'Two paths are in front of you. You take…'),
  planning: L('突然白捡一天假，你会？', 'You suddenly get a free day. You…'),
  social: L('一只麻烦的僵尸老是处理不掉，你会？', 'One troublesome zombie keeps getting through. You…'),
  method: L('事情一下全乱了，你先管哪儿？', 'Everything goes wrong at once. What do you fix first?'),
  tempo: L('赶一件事时，你通常是哪种？', 'When something needs finishing, you usually…'),
  change: L('原计划做到一半，突然有个新点子。你会？', 'Halfway through the plan, you get a new idea. You…'),
  presence: L('最后一波来了，你更想？', 'The last wave arrives. You would rather…'),
};

const TIE_BREAK_OPTIONS = {
  initiative: [
    O('negative', L('再看一眼，等最合适的时候按', 'Wait one more moment for the best time'), { initiative: -1 }),
    O('positive', L('先按了再说', 'Press it and see what happens'), { initiative: 1 }),
  ],
  risk: [
    O('negative', L('看起来稳稳能到的那条', 'The one that clearly gets me there'), { risk: -1 }),
    O('positive', L('不知道通哪儿，但有点想试的那条', 'The one that looks strange but tempting'), { risk: 1 }),
  ],
  planning: [
    O('negative', L('先列个清单，别把一天混过去', 'Make a list so the day does not disappear'), { planning: -1 }),
    O('positive', L('睡醒再说，想干啥就干啥', 'Wake up and do whatever feels good'), { planning: 1 }),
  ],
  social: [
    O('negative', L('换一棵能单独收拾它的', 'Bring one plant that can handle it alone'), { social: -1 }),
    O('positive', L('用两三棵植物配合处理', 'Use two or three plants that work together'), { social: 1 }),
  ],
  method: [
    O('negative', L('先把最急的那个解决掉', 'Fix the most urgent problem first'), { method: -1 }),
    O('positive', L('先让场面慢下来，一个个处理', 'Slow everything down and handle it one piece at a time'), { method: 1 }),
  ],
  tempo: [
    O('negative', L('每天弄一点，不拖到最后', 'Do a little every day'), { tempo: -1 }),
    O('positive', L('前面慢慢来，最后一口气冲完', 'Take it easy, then finish in one big rush'), { tempo: 1 }),
  ],
  change: [
    O('negative', L('记下来，先把手上的做完', 'Write it down and finish what I started'), { change: -1 }),
    O('positive', L('现在就拐过去试试', 'Switch over and try it right now'), { change: 1 }),
  ],
  presence: [
    O('negative', L('在旁边补漏，别让阵型崩掉', 'Patch the weak spots and keep the setup intact'), { presence: -1 }),
    O('positive', L('把主力摆下去，正面收掉这一波', 'Put down the core plant and finish the wave head-on'), { presence: 1 }),
  ],
};

export const TIE_BREAK_QUESTIONS = Object.freeze(AXIS_KEYS.map((axis) => ({
  id: `tie-${axis}`,
  axis,
  prompt: TIE_BREAK_PROMPTS[axis],
  options: TIE_BREAK_OPTIONS[axis],
})));

export const getQuizPath = (locale = 'zh') => `${LOCALES[locale]?.pathPrefix ?? ''}/useful-tool/which-pvzge-plant/`;
export const getResultPath = (resultId, locale = 'zh') => `${getQuizPath(locale)}?plant=${encodeURIComponent(resultId)}`;
