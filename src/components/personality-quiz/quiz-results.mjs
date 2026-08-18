const L = (zh, en) => ({ zh, en });
const P = (profile) => ({
  initiative: 0,
  risk: 0,
  planning: 0,
  social: 0,
  method: 0,
  tempo: 0,
  change: 0,
  presence: 0,
  ...profile,
});

const result = (id, archetype, profile, name) => ({
  id,
  archetype,
  profile: P(profile),
  name,
});

const RESULT_BASE = Object.freeze([
  result(
    'wallnut', 'guard',
    { initiative: -0.5, risk: -1, planning: -0.2, social: 0.5, method: -0.2, tempo: -0.8, change: -1, presence: -0.5 },
    L('坚果墙', 'Wall-nut'),
  ),
  result(
    'tallnut', 'guard',
    { initiative: -0.2, risk: -1, planning: -0.6, social: 0.5, method: -0.3, tempo: -1, change: -1, presence: 0.3 },
    L('高坚果', 'Tall-nut'),
  ),
  result(
    'snowpea', 'guard',
    { initiative: -0.3, risk: -0.6, planning: -0.6, social: 0, method: 0.8, tempo: -0.8, change: -0.5, presence: -0.5 },
    L('寒冰射手', 'Snow Pea'),
  ),
  result(
    'mirrornut', 'guard',
    { initiative: 0, risk: -0.7, planning: -0.5, social: 0.5, method: 0.6, tempo: 0.3, change: -0.4, presence: -0.2 },
    L('镜面坚果', 'Mirror-nut'),
  ),
  result(
    'loquat', 'guard',
    { initiative: 0, risk: -0.3, planning: 0.2, social: 0.5, method: 1, tempo: -0.4, change: 0.3, presence: 0.2 },
    L('漩涡枇杷', 'Loquanado'),
  ),

  result(
    'repeater', 'action',
    { initiative: 0.7, risk: 0.2, planning: -0.2, social: 0.1, method: -0.8, tempo: 0.3, change: -0.4, presence: 0.2 },
    L('双重射手', 'Repeater'),
  ),
  result(
    'cherry_bomb', 'action',
    { initiative: 1, risk: 0.8, planning: 0.4, social: 0, method: -1, tempo: 1, change: 0.2, presence: 0.5 },
    L('樱桃炸弹', 'Cherry Bomb'),
  ),
  result(
    'chomper', 'action',
    { initiative: 0.7, risk: 0.4, planning: -0.1, social: -0.5, method: -1, tempo: 0.4, change: -0.4, presence: -0.4 },
    L('大嘴花', 'Chomper'),
  ),
  result(
    'inferno', 'action',
    { initiative: 0.9, risk: 0.6, planning: 0.4, social: 0.2, method: -0.8, tempo: 0.8, change: 0.5, presence: 0.5 },
    L('地狱火蕨', 'Inferno'),
  ),
  result(
    'atombomb', 'action',
    { initiative: 0.8, risk: 1, planning: -0.4, social: -0.2, method: -0.9, tempo: 1, change: 0.4, presence: 0.6 },
    L('原子石榴弹', 'Atomic Bombegranate'),
  ),

  result(
    'sunflower', 'support',
    { initiative: -0.1, risk: -0.8, planning: -0.5, social: 1, method: 0.2, tempo: -0.8, change: -0.7, presence: 0.1 },
    L('向日葵', 'Sunflower'),
  ),
  result(
    'goldbloom', 'support',
    { initiative: 0.3, risk: 0.1, planning: -0.5, social: 0.6, method: -0.2, tempo: 1, change: 0.2, presence: 0.5 },
    L('黄金蓓蕾', 'Gold Bloom'),
  ),
  result(
    'moonflower', 'support',
    { initiative: -0.3, risk: -0.5, planning: -0.7, social: 1, method: 0.7, tempo: -0.6, change: -0.4, presence: -0.2 },
    L('月光花', 'Moonflower'),
  ),
  result(
    'intensivecarrot', 'support',
    { initiative: -0.2, risk: -0.8, planning: -0.4, social: 1, method: 0.1, tempo: -0.5, change: -0.2, presence: -0.4 },
    L('复活萝卜', 'Intensive Carrot'),
  ),
  result(
    'torchwood', 'support',
    { initiative: 0.4, risk: -0.2, planning: -0.6, social: 0.9, method: -0.3, tempo: 0.1, change: -0.6, presence: 0.5 },
    L('火炬树桩', 'Torchwood'),
  ),

  result(
    'potatomine', 'strategy',
    { initiative: -0.4, risk: -0.2, planning: -1, social: -0.3, method: 0.2, tempo: 0.7, change: -0.6, presence: -0.7 },
    L('土豆地雷', 'Potato Mine'),
  ),
  result(
    'magnetshroom', 'strategy',
    { initiative: -0.4, risk: -0.7, planning: -0.7, social: 0.1, method: 1, tempo: -0.6, change: -0.5, presence: -0.5 },
    L('磁力菇', 'Magnet-shroom'),
  ),
  result(
    'caulipower', 'strategy',
    { initiative: -0.2, risk: 0.2, planning: -0.2, social: -0.1, method: 1, tempo: 0.1, change: 0.7, presence: -0.1 },
    L('超能花菜', 'Caulipower'),
  ),
  result(
    'witchhazel', 'strategy',
    { initiative: 0.1, risk: 0.5, planning: 0.2, social: -0.2, method: 1, tempo: 0.3, change: 0.8, presence: 0.1 },
    L('女巫金缕梅', 'Witch Hazel'),
  ),
  result(
    'hypnoshroom', 'strategy',
    { initiative: -0.3, risk: 0.1, planning: -0.2, social: 0.2, method: 0.9, tempo: 0.2, change: 0.5, presence: -0.3 },
    L('魅惑菇', 'Hypno-shroom'),
  ),

  result(
    'zoybeanpod', 'explore',
    { initiative: 0.2, risk: 0.4, planning: 0.4, social: 0.5, method: 0.2, tempo: 0.3, change: 1, presence: 0.1 },
    L('豆腐尸荚', 'Zoybean Pod'),
  ),
  result(
    'bamboozle', 'explore',
    { initiative: 0.5, risk: 0.5, planning: 0.8, social: -0.3, method: 0.2, tempo: 0.7, change: 0.9, presence: 0.2 },
    L('整人竹', 'Bamboozle'),
  ),
  result(
    'escaperoot', 'explore',
    { initiative: 0.5, risk: 0.3, planning: 1, social: 0.1, method: 0.5, tempo: 0.1, change: 1, presence: -0.3 },
    L('逃脱树根', 'Escape Root'),
  ),
  result(
    'bulbkekengi', 'explore',
    { initiative: -0.4, risk: -0.6, planning: -0.3, social: 0.3, method: 0.7, tempo: -0.7, change: 0.8, presence: -0.7 },
    L('灯笼草', 'Bulbkekengi'),
  ),
  result(
    'hurrikale', 'explore',
    { initiative: 0.4, risk: 0.1, planning: 0.7, social: 0.2, method: 0.9, tempo: 0.7, change: 0.8, presence: 0.2 },
    L('飓风甘蓝', 'Hurrikale'),
  ),

  result(
    'peashooter', 'lead',
    { initiative: 0.7, risk: -0.3, planning: -0.4, social: 0.2, method: -0.8, tempo: -0.3, change: -0.8, presence: 0.4 },
    L('豌豆射手', 'Peashooter'),
  ),
  result(
    'peacommando', 'lead',
    { initiative: 1, risk: 0.6, planning: 0.2, social: 0.7, method: -0.8, tempo: 0.8, change: 0.5, presence: 1 },
    L('豌豆突击队', 'Pea Commando'),
  ),
  result(
    'pinkstarfruit', 'lead',
    { initiative: 0.5, risk: 0.3, planning: 0.6, social: 0.4, method: 0.2, tempo: 0.5, change: 0.9, presence: 0.8 },
    L('天使星星果', 'Angel Starfruit'),
  ),
  result(
    'darkmatterdragonfruit', 'lead',
    { initiative: 0.6, risk: 0.5, planning: -0.1, social: 0.1, method: 0.5, tempo: 0.7, change: 0.7, presence: 0.9 },
    L('暗物质火龙果', 'Dark Matter Dragonfruit'),
  ),
  result(
    'asparagus', 'lead',
    { initiative: 0.8, risk: 0.2, planning: -0.4, social: 0.6, method: -0.4, tempo: 0.5, change: 0.2, presence: 0.8 },
    L('芦笋战机', 'Asparajet'),
  ),
]);

const RESULT_COPY = Object.freeze({
  wallnut: {
    title: L('先把这格守住', 'Hold this tile'),
    mechanism: L('坚果墙不会攻击，但耐久很高，能把僵尸稳稳卡在前排。后排缺时间时，先种一面墙通常最管用。', 'Wall-nut cannot attack, but its high toughness pins zombies at the front. When the back line needs time, planting a wall is often the simplest answer.'),
    motto: L('你们往后打，这里我顶着。', 'You keep firing. I have this tile.'),
    fit: L('你遇到压力时，通常先补最危险的缺口，再考虑怎么反打。场面乱起来，你愿意接住最先撞上来的那一下。', 'When pressure hits, you usually patch the worst gap before planning the counterattack. If the board gets messy, you are willing to take the first hit.'),
  },
  tallnut: {
    title: L('这条路不通', 'Lane closed'),
    mechanism: L('高坚果比普通坚果更耐打，还能拦住低空飞行的僵尸。它花费更高，但这一路很长时间都不用担心。', 'Tall-nut takes far more punishment than Wall-nut and stops low-flying zombies. It costs more, but keeps one lane closed for a long time.'),
    motto: L('想过去，先问过我。', 'If you want through, ask me first.'),
    fit: L('你认定一件事后很少被临时变化带跑。比起频繁换方案，你更相信边界划清楚，然后站住不退。', 'Once you commit, temporary noise rarely moves you. You would rather set a clear boundary and hold it than keep changing plans.'),
  },
  snowpea: {
    title: L('先让它们慢下来', 'Slow them down first'),
    mechanism: L('寒冰射手持续发射冰豌豆，边打边给僵尸减速。它清场不算快，却能把快要失控的一路重新拖回可处理的速度。', 'Snow Pea keeps firing while slowing every zombie it hits. It does not clear quickly, but it can pull a runaway lane back to a manageable pace.'),
    motto: L('别急，慢下来就看清了。', 'Slow it down. Then you can see it.'),
    fit: L('你不太信一次大动作能解决所有事。先降速、看清，再一件件处理，更符合你的习惯。', 'You do not expect one dramatic move to fix everything. Slowing things down, reading the board, and handling one problem at a time suits you better.'),
  },
  mirrornut: {
    title: L('挨打也会还手', 'Hits back'),
    mechanism: L('其他坚果受伤时，镜面坚果会收集能量；玩家点击后，它再把能量放出去。前排挨过的打，不会白挨。', 'Mirror-nut stores energy whenever other nuts are damaged, then releases it when clicked. Hits taken by the front line do not go to waste.'),
    motto: L('这一下我记着，等会儿还你。', 'I felt that one. You can have it back.'),
    fit: L('你能扛事，但不会把承受当成结束。压力到了你这里，往往会被记下来，等时机合适再变成回应。', 'You can take pressure without treating endurance as the whole job. You remember what landed, then answer when the timing is right.'),
  },
  loquat: {
    title: L('把僵尸拉到一起', 'Pull them together'),
    mechanism: L('漩涡枇杷会旋转，把附近僵尸拉向自己。敌人站得太散不好处理时，它能把战场重新收成一团。', 'Loquanado spins and pulls nearby zombies toward itself. When enemies are spread too widely, it gathers the fight back into one place.'),
    motto: L('都过来，别把战线扯散了。', 'Come here. Stop stretching the lane.'),
    fit: L('别人躲着混乱走时，你更可能把问题拉到眼前，一次看清全貌。你擅长先把散乱的东西收拢，再开始处理。', 'While others step around the mess, you are more likely to pull it into view. You work best after gathering scattered problems into one clear pile.'),
  },
  repeater: {
    title: L('一颗不够就两颗', 'Two peas, every time'),
    mechanism: L('双重射手每次连发两颗豌豆，打法和豌豆射手一样直接，只是火力更足。方向确定后，它负责持续把伤害打上去。', 'Repeater follows the same direct plan as Peashooter, but fires two peas every time. Once the lane is chosen, it keeps the damage coming.'),
    motto: L('方向对了，就多打一发。', 'Right direction? Fire one more.'),
    fit: L('你不喜欢把简单的事讲复杂。看准方向以后，你更愿意马上动手，并且比计划里再多推进一点。', 'You do not like making simple work sound complicated. Once the direction is clear, you start moving and usually push a little farther than planned.'),
  },
  cherry_bomb: {
    title: L('现在就炸', 'Blow it up now'),
    mechanism: L('樱桃炸弹种下就爆炸，能清掉中等范围内的一大片僵尸。它贵、一次性，但僵尸挤成一团时非常省事。', 'Cherry Bomb explodes as soon as it is planted and clears a medium area. It is costly and single-use, but excellent when zombies bunch up.'),
    motto: L('这波别省，炸了再说。', 'Do not save it. Blow up this wave.'),
    fit: L('你平时未必抢着出手，但会认得“再等就晚了”的时刻。机会一到，你宁愿干脆解决，也不拖成长战。', 'You may not rush every move, but you recognize the moment when waiting becomes expensive. Then you would rather end it cleanly than drag it out.'),
  },
  chomper: {
    title: L('先吃掉最大的', 'Eat the biggest one'),
    mechanism: L('大嘴花能一口吞掉僵尸，吞完却要花时间咀嚼。它适合处理单个棘手目标，旁边最好有人帮它守住空档。', 'Chomper swallows one zombie whole, then spends time chewing. It is built for one nasty target and works best with cover during the downtime.'),
    motto: L('最麻烦的那个，交给我。', 'Give me the worst one.'),
    fit: L('问题越大，你越不想绕着走。你会先处理最碍事的那个，也接受做完以后需要缓一口气。', 'The bigger the problem, the less you want to walk around it. You take on the worst one first and accept that recovery comes afterward.'),
  },
  inferno: {
    title: L('把整条路吹回去', 'Push the whole lane back'),
    mechanism: L('地狱火蕨放出火焰龙卷，持续灼烧并击退僵尸。它不只是打伤害，还会直接把前线往回推。', 'Inferno sends out a fire tornado that burns and knocks zombies back. It deals damage while physically moving the front line away.'),
    motto: L('顶不住？那就把战线推回去。', 'Cannot hold it? Push the line back.'),
    fit: L('局面往坏处滑时，你不会只想着撑住。你更愿意加一把力，直接把节奏和位置抢回来。', 'When the board starts sliding the wrong way, you do not only brace for impact. You add force and take the tempo and position back.'),
  },
  atombomb: {
    title: L('一炸到底', 'One complete reset'),
    mechanism: L('原子石榴弹会造成很高的爆炸伤害，爆炸后还留下幼苗。它用一次大范围清场换来新的落脚点。', 'Atomic Bombegranate deals huge explosive damage and leaves seedlings behind. One major clear also gives the next formation somewhere to start.'),
    motto: L('要清场，就别留半截。', 'If we reset, reset all of it.'),
    fit: L('你不常半推半就地改局面。真要出手时，你会把旧问题清干净，再给下一步留个能接上的位置。', 'You rarely make half-hearted resets. When you commit, you clear the old problem and leave a usable starting point for whatever comes next.'),
  },
  sunflower: {
    title: L('后排阳光供应', 'Sun from the back row'),
    mechanism: L('向日葵不断生产阳光，本身几乎不负责打僵尸。少了它，前排再强的植物也很难按时种下。', 'Sunflower keeps producing sun and does almost no fighting itself. Without it, even the strongest front line is hard to plant on time.'),
    motto: L('你们种，我供阳光。', 'You plant. I will supply the sun.'),
    fit: L('你不介意自己站在后排，更在意整套阵容有没有资源继续运转。前排能稳稳发挥，常常是因为你先把基础补齐了。', 'You do not mind working from the back row. You care more about whether the whole setup has enough to keep running, and often provide the base that keeps the front line going.'),
  },
  goldbloom: {
    title: L('阳光现在到账', 'Sun, right now'),
    mechanism: L('黄金蓓蕾种下后会立刻喷出大量阳光。它不做长期生产，而是在卡资源的那一刻把选择一次性打开。', 'Gold Bloom releases a large burst of sun immediately. It does not produce for long; it unlocks several choices at the exact moment resources are tight.'),
    motto: L('缺阳光？现在给你。', 'Short on sun? Here it is.'),
    fit: L('你帮人时很看时机，不会只顾平均分配。谁正卡在关键一步，你更愿意把资源集中送到那里。', 'Your help is about timing, not equal portions. When someone is stuck at the important step, you would rather put the resources there.'),
  },
  moonflower: {
    title: L('暗影植物的邻座', 'The shadow row neighbor'),
    mechanism: L('月光花能生产阳光，还会强化相邻的暗影植物。它摆在哪一格很重要，站对位置时，一小片暗影阵容会一起启动。', 'Moonflower produces sun and powers adjacent shadow plants. Placement matters: in the right tile, a whole shadow setup switches on together.'),
    motto: L('站近一点，大家都亮。', 'Stand closer. We all light up.'),
    fit: L('你会留意哪些东西放在一起更合适。比起单独把一点做强，你更擅长找到能让整套方案一起顺起来的位置。', 'You notice which pieces work better beside each other. Rather than strengthening one part alone, you find the position that makes the whole setup click.'),
  },
  intensivecarrot: {
    title: L('拉一株回来', 'Bring one plant back'),
    mechanism: L('复活萝卜能把被打败的植物重新带回场上。它不能随便替代所有植物，但能把关键位置再救一次。', 'Intensive Carrot returns a defeated plant to the lawn. It cannot replace everything, but it can restore one important position.'),
    motto: L('倒下了？再种一次。', 'It fell? Plant it again.'),
    fit: L('一次失误在你这里不等于结束。只要那件事仍然重要，你愿意把人或计划重新拉回场上，再给一次机会。', 'One failure does not end the run for you. If it still matters, you are willing to bring the person or plan back for another try.'),
  },
  torchwood: {
    title: L('让豌豆更烫', 'Make every pea hotter'),
    mechanism: L('豌豆穿过火炬树桩后会被点燃，伤害更高；火炬树桩倒下时还会烧过整行。它自己不发豌豆，却能把后排火力升一档。', 'Peas that pass through Torchwood ignite for more damage, and Torchwood burns the lane when defeated. It fires no peas itself, but upgrades every shooter behind it.'),
    motto: L('从我这里过，火力翻一档。', 'Pass through me. Hit harder.'),
    fit: L('你很会接住已经打好的基础，再把它推远一点。你的作用不一定最先被看见，但整套方案会因为你明显变强。', 'You are good at taking an existing foundation and pushing it farther. You may not be the first part people see, but the whole setup clearly hits harder with you there.'),
  },
  potatomine: {
    title: L('等它踩上来', 'Wait for the step'),
    mechanism: L('土豆地雷种下后需要时间武装，准备好才会炸掉踩上来的僵尸。种得早、位置对，它能用很低的阳光解决大目标。', 'Potato Mine needs time to arm before it can destroy the zombie that steps on it. Planted early and in the right tile, it trades very little sun for a big target.'),
    motto: L('别催，埋好了才响。', 'Do not rush it. Let it arm.'),
    fit: L('你习惯把准备做在别人注意之前。表面上没有动静，不代表你没在推进；时机到了，前面的安排会自己起作用。', 'You often prepare before anyone notices. A quiet stretch does not mean nothing is happening; when the moment arrives, the earlier setup does the work.'),
  },
  magnetshroom: {
    title: L('先扒掉盔甲', 'Take the armor first'),
    mechanism: L('磁力菇会吸走附近僵尸身上的金属盔甲和物品。铁桶、头盔和工具没了以后，原本难打的目标会简单很多。', 'Magnet-shroom removes nearby metal armor and objects. Buckets, helmets, and tools disappear, leaving a much easier target behind.'),
    motto: L('铁桶先拿走，剩下的好办。', 'Take the bucket. The rest is easy.'),
    fit: L('你不爱和最硬的部分正面较劲。先找出是什么让问题变难，再把那层保护拆掉，是你更顺手的办法。', 'You do not enjoy punching the hardest surface. You first find what makes the problem difficult, then remove that layer.'),
  },
  caulipower: {
    title: L('让僵尸打僵尸', 'Make zombies fight zombies'),
    mechanism: L('超能花菜会随机魅惑僵尸，让它转身攻击原来的同伴。场上不用多一份蛮力，敌方自己就少了一份。', 'Caulipower hypnotizes a random zombie and turns it against its former allies. The plants gain help while the zombie side loses it.'),
    motto: L('不用加火力，换个阵营就行。', 'No more firepower. Just switch sides.'),
    fit: L('你解决冲突时不一定继续加码。换关系、换方向、让现有力量重新站队，往往比硬碰硬更像你的做法。', 'You do not always solve conflict by adding more force. Changing the relationship, direction, or side is often more natural to you than hitting harder.'),
  },
  witchhazel: {
    title: L('把僵尸变成蘑菇', 'Turn zombies into mushrooms'),
    mechanism: L('女巫金缕梅会把僵尸直接变成小喷菇。威胁不只消失了，原地还多出一株能帮植物作战的单位。', 'Witch Hazel turns a zombie directly into a Puff-shroom. The threat disappears and a new plant-side unit takes its place.'),
    motto: L('别浪费，变株小喷菇吧。', 'Do not waste it. Make a Puff-shroom.'),
    fit: L('你看到麻烦时，会下意识找它能不能改成别的用途。把问题清掉还不够，最好原地留下点能用的东西。', 'When trouble appears, you instinctively ask whether it can be repurposed. Removing the problem is good; leaving something useful behind is better.'),
  },
  hypnoshroom: {
    title: L('吃完就倒戈', 'One bite, then switch sides'),
    mechanism: L('僵尸吃掉魅惑菇后会转身，开始替植物攻击其他僵尸。它只有一次接触机会，但能直接改写这一小段战线。', 'A zombie that eats Hypno-shroom turns around and attacks other zombies. It gets one contact, but that contact can rewrite a section of the lane.'),
    motto: L('过来吃一口，你就是自己人。', 'Take one bite. Now you are with us.'),
    fit: L('你不需要一直站在台前说服所有人。一次找对对象、说到关键点，就可能让局面整个换边。', 'You do not need to persuade everyone from center stage. Reaching the right person with the right point can flip the whole situation.'),
  },
  zoybeanpod: {
    title: L('种出一队豆腐僵尸', 'Grow a zomboid squad'),
    mechanism: L('豆腐尸荚成长后会不断放出豆腐僵尸，沿路替植物作战。它把僵尸的打法搬到植物阵营，越放越热闹。', 'Zoybean Pod grows and releases zomboids that fight down the lane. It borrows a zombie-style army for the plant side and keeps adding to it.'),
    motto: L('谁说僵尸不能帮植物？', 'Who says zombies cannot help plants?'),
    fit: L('奇怪的组合不会先把你吓退，反而容易让你好奇。你愿意把看似不搭的东西养一阵，看看它能不能变成新打法。', 'Odd combinations do not scare you off; they make you curious. You are willing to grow an unlikely idea long enough to see whether it becomes a new playstyle.'),
  },
  bamboozle: {
    title: L('点哪格就打哪格', 'Click the target tile'),
    mechanism: L('整人竹会先储存竹竿，玩家再点击指定地格发射。它不会自动替你决定目标，存货和落点都要自己掌握。', 'Bamboozle stores bamboo sticks, then fires at the tile the player clicks. It does not choose the target for you; you manage both the stock and the landing spot.'),
    motto: L('竹竿攒好了，你来点目标。', 'Bamboo ready. You pick the tile.'),
    fit: L('你喜欢把最后的选择留在自己手里。先准备好工具，等现场信息够了再精确落点，比提前锁死方案更适合你。', 'You like keeping the final choice in your own hands. Prepare the tool first, then aim once the board is clear instead of locking the plan too early.'),
  },
  escaperoot: {
    title: L('危险就换个位置', 'Swap out of danger'),
    mechanism: L('逃脱树根能和处境危险的植物交换位置，碰到僵尸时还会爆炸。它可以救人、换线，也能在换位后留下反击。', 'Escape Root swaps places with a plant in danger and explodes when a zombie reaches it. It rescues, changes lanes, and can leave a counterattack behind.'),
    motto: L('这格不对，换一格再打。', 'Wrong tile. Swap and keep playing.'),
    fit: L('计划遇到危险时，你不会为了证明自己而死守原位。换个位置、保住重要的东西，再继续打，是你自然的应变。', 'When a plan becomes dangerous, you do not stay put just to prove a point. You change position, protect what matters, and keep playing.'),
  },
  bulbkekengi: {
    title: L('先把雾照开', 'Clear the fog first'),
    mechanism: L('灯笼草会照亮中等范围，驱散遮住战场的雾。它不直接消灭僵尸，但会让接下来的每一步都更有把握。', 'Bulbkekengi clears fog in a medium area. It does not defeat zombies directly, but makes every next move easier to judge.'),
    motto: L('看清楚，再落子。', 'See the board. Then plant.'),
    fit: L('信息不够时，你宁愿先承认看不清，也不会装作有答案。把范围照亮、补齐信息，再决定怎么走，是你的习惯。', 'When information is missing, you would rather admit the board is unclear than pretend to know. You light the area, fill the gaps, then decide.'),
  },
  hurrikale: {
    title: L('整行吹回起点', 'Send the lane backward'),
    mechanism: L('飓风甘蓝吹出寒风，把整行僵尸推回后方并减速。它不负责收尾，却能立刻把最紧张的一路腾出空间。', 'Hurrikale blasts an entire lane backward and slows it. It does not finish the fight, but instantly creates room in the lane under the most pressure.'),
    motto: L('回去，重新排队。', 'Back you go. Form the line again.'),
    fit: L('事情挤成一团时，你会先给大家腾出空间。后退一点、重排顺序，不是放弃，而是让下一步终于有地方落。', 'When everything crowds together, you create room first. Moving back and reordering is not giving up; it makes the next move possible.'),
  },
  peashooter: {
    title: L('朝前一直打', 'Keep firing forward'),
    mechanism: L('豌豆射手会稳定攻击正前方，是最基础也最容易理解的输出植物。没有额外操作，种对一行就开始工作。', 'Peashooter fires steadily down its lane. It is basic, readable offense: plant it in the right row and it starts working.'),
    motto: L('先发第一颗，后面再说。', 'Fire the first pea. Work out the rest.'),
    fit: L('你不需要等所有条件都完美才开始。只要方向大致正确，先做出第一步，再边走边修就够了。', 'You do not need every condition to be perfect before starting. If the direction is roughly right, you take the first step and adjust while moving.'),
  },
  peacommando: {
    title: L('小队直接空降', 'Drop the squad in'),
    mechanism: L('豌豆突击队会派出三名飞行小兵，突袭靠前的多个目标。它一次调动一支小队，适合主动拆开前线压力。', 'Pea Commando deploys three flying soldiers against forward targets. It moves a small squad at once to break pressure at the front.'),
    motto: L('目标在前面，三人一起上。', 'Target ahead. All three, go.'),
    fit: L('局面需要拍板时，你往往会很快定下目标，再把手上的资源一起压过去，而不是零零散散地试。', 'When the situation needs a clear call, you choose a target quickly and commit your resources together instead of trying things one at a time.'),
  },
  pinkstarfruit: {
    title: L('五个方向一起打', 'Fire in five directions'),
    mechanism: L('天使星星果调整角度后，会同时向五个方向发射星星。站位和角度一变，同一株植物就能覆盖完全不同的区域。', 'Angel Starfruit adjusts its angle and fires in five directions at once. A new tile or angle gives the same plant a completely different coverage pattern.'),
    motto: L('角度换一下，五路都能到。', 'Change the angle. Reach all five paths.'),
    fit: L('你愿意表达，也会看现场调整说法和角度。重点不是所有人都听到同一句，而是该覆盖的方向都能收到。', 'You are willing to speak up, but you adjust the angle to the room. The point is not repeating one line to everyone; it is reaching every direction that matters.'),
  },
  darkmatterdragonfruit: {
    title: L('让战场变重', 'Make the field heavier'),
    mechanism: L('暗物质火龙果发射会爆炸的暗能量；进入暗影状态后，还会让僵尸变重、变慢。它一上场，附近敌人的移动节奏就会改变。', 'Dark Matter Dragonfruit fires explosive dark energy. When powered, it also makes zombies heavier and slower, changing how nearby enemies move.'),
    motto: L('靠近一点，连脚步都会慢。', 'Come closer. Even your steps slow down.'),
    fit: L('你不太可能悄悄经过一个房间。你一旦投入，周围人的注意力和行动速度都会跟着变化。', 'You are unlikely to pass through a room unnoticed. Once you engage, the attention and pace around you both change.'),
  },
  asparagus: {
    title: L('一株照顾三行', 'Cover three lanes'),
    mechanism: L('芦笋战机会同时攻击前方和相邻路线，最多照顾三行。它站在一格里，却能替旁边两路分担火力。', 'Asparajet attacks its own lane and the neighboring lanes, covering up to three rows. It stays in one tile while sharing fire with both sides.'),
    motto: L('旁边两路，也在我的射程里。', 'The two lanes beside me are covered.'),
    fit: L('你做自己的事时，也会顺手看一眼旁边有没有人吃紧。视野放得宽，让你很自然地替周围补位。', 'Even while handling your own work, you notice when the people beside you are under pressure. A wider view makes covering for them feel natural.'),
  },
});

export const RESULTS = Object.freeze(RESULT_BASE.map((entry) => {
  const copy = RESULT_COPY[entry.id];
  return { ...entry, ...copy };
}));

export const ARCHETYPE_COPY = Object.freeze({
  guard: L('前排防守', 'Front-line defense'),
  action: L('主动出击', 'Direct offense'),
  support: L('阳光与支援', 'Sun & support'),
  strategy: L('控场与变招', 'Control tricks'),
  explore: L('应变与试验', 'Adapt & experiment'),
  lead: L('带队与覆盖', 'Lead & cover'),
});

export const getResultById = (id) => RESULTS.find((candidate) => candidate.id === id) ?? null;
