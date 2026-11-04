// Spiritual layer: Western sun sign, Chinese zodiac + five elements, moon phase.
// Presented as tradition for reflection, not science.

export const SIGNS = [
  { k: 'aries', name: 'Aries', glyph: '♈\uFE0E', from: [3, 21], el: 'Fire', mode: 'Cardinal', body: 'Head & face', gift: 'Courage, initiative, fresh starts', shadow: 'Impatience and burning out fast', ritual: 'Massage your scalp and temples before bed to release built-up heat.', aff: 'I lead with courage and rest without guilt.' },
  { k: 'taurus', name: 'Taurus', glyph: '♉\uFE0E', from: [4, 20], el: 'Earth', mode: 'Fixed', body: 'Throat & neck', gift: 'Sensuality, steadiness, devotion', shadow: 'Holding on too tightly, resisting change', ritual: 'Hum or sing for five minutes to open the throat.', aff: 'I am allowed to enjoy my body and my life.' },
  { k: 'gemini', name: 'Gemini', glyph: '♊\uFE0E', from: [5, 21], el: 'Air', mode: 'Mutable', body: 'Lungs, arms & hands', gift: 'Curiosity, wit, connection', shadow: 'Scattered energy, a restless mind', ritual: 'Three rounds of slow 4-7-8 breathing to gather your energy.', aff: 'My mind is bright and my breath brings me home.' },
  { k: 'cancer', name: 'Cancer', glyph: '♋\uFE0E', from: [6, 21], el: 'Water', mode: 'Cardinal', body: 'Breasts & stomach', gift: 'Nurturing, intuition, emotional depth', shadow: 'Over-giving, retreating into your shell', ritual: 'Warm hands on your belly and breasts; ask what you need today.', aff: 'I nurture myself the way I nurture others.' },
  { k: 'leo', name: 'Leo', glyph: '♌\uFE0E', from: [7, 23], el: 'Fire', mode: 'Fixed', body: 'Heart & upper back', gift: 'Warmth, generosity, creative joy', shadow: 'Needing to be seen to feel worthy', ritual: 'Hand on heart, name three things you love about yourself.', aff: 'My light is worthy, even when no one is watching.' },
  { k: 'virgo', name: 'Virgo', glyph: '♍\uFE0E', from: [8, 23], el: 'Earth', mode: 'Mutable', body: 'Digestion & intestines', gift: 'Care, discernment, healing hands', shadow: 'Perfectionism and worry', ritual: 'Slow clockwise belly massage after dinner.', aff: 'I am whole, not a project to fix.' },
  { k: 'libra', name: 'Libra', glyph: '♎\uFE0E', from: [9, 23], el: 'Air', mode: 'Cardinal', body: 'Kidneys & lower back', gift: 'Harmony, beauty, partnership', shadow: 'People-pleasing, losing your own centre', ritual: 'Rub your palms warm and hold them over your lower back.', aff: 'Balance begins with honouring my own needs.' },
  { k: 'scorpio', name: 'Scorpio', glyph: '♏\uFE0E', from: [10, 23], el: 'Water', mode: 'Fixed', body: 'Womb & reproductive organs', gift: 'Depth, magnetism, transformation', shadow: 'Holding pain inside, all-or-nothing', ritual: 'Lay a warm cloth over your womb and breathe into it.', aff: 'I let go of what no longer serves me and rise renewed.' },
  { k: 'sagittarius', name: 'Sagittarius', glyph: '♐\uFE0E', from: [11, 22], el: 'Fire', mode: 'Mutable', body: 'Hips & thighs', gift: 'Optimism, freedom, wisdom-seeking', shadow: 'Restlessness, overcommitting', ritual: 'Hip-opening stretches — butterfly and pigeon — to free stuck energy.', aff: 'My freedom and my roots can live together.' },
  { k: 'capricorn', name: 'Capricorn', glyph: '♑\uFE0E', from: [12, 22], el: 'Earth', mode: 'Cardinal', body: 'Bones, knees & skin', gift: 'Discipline, resilience, quiet strength', shadow: 'Over-working, being hard on yourself', ritual: 'Warm sesame oil on knees and joints before sleep.', aff: 'Rest is part of my success.' },
  { k: 'aquarius', name: 'Aquarius', glyph: '♒\uFE0E', from: [1, 20], el: 'Air', mode: 'Fixed', body: 'Ankles & circulation', gift: 'Vision, originality, community', shadow: 'Detaching from your feelings', ritual: 'Ankle circles and brisk calf rubs to move circulation.', aff: 'My feelings are welcome here.' },
  { k: 'pisces', name: 'Pisces', glyph: '♓\uFE0E', from: [2, 19], el: 'Water', mode: 'Mutable', body: 'Feet & lymphatic system', gift: 'Intuition, empathy, imagination, dreams', shadow: 'Absorbing everyone’s emotions, escaping, blurry boundaries', ritual: 'A warm sea-salt foot soak — your feet are your sign’s gateway, and the Kidney (Water) channel begins on the sole.', aff: 'I can feel everything and still keep my shape.' },
];

// Western element resonates with a TCM organ system (a bridging idea, not classical).
export const EL_BRIDGE = {
  Water: { tcm: 'Water', organ: 'Kidney', note: 'Water signs resonate with the Kidney — the root of Yin, deep reserves and intuition.' },
  Fire: { tcm: 'Fire', organ: 'Heart', note: 'Fire signs resonate with the Heart — joy, warmth and the Shen (spirit).' },
  Earth: { tcm: 'Earth', organ: 'Spleen', note: 'Earth signs resonate with the Spleen — nourishment, grounding and steady digestion.' },
  Air: { tcm: 'Metal', organ: 'Lung', note: 'Air signs resonate with the Lung — breath, inspiration and letting go.' },
};

// Western element × cycle phase reflections.
export const EL_PHASE = {
  Water: {
    menstrual: 'Your most intuitive days. You feel everything — protect your energy, cry if you need to, and write down your dreams.',
    follicular: 'Let new feelings turn into ideas. A gentle creative project suits your flowing nature.',
    ovulatory: 'Your empathy is magnetic now — just don’t carry everyone else’s mood home with you.',
    luteal: 'Sensitivity peaks. Boundaries are self-love: say no early, retreat to water — baths, rain walks, the sea.',
  },
  Fire: {
    menstrual: 'Your fire is embers now. Let it rest so it can blaze again — no forcing.',
    follicular: 'Your spark returns fast. Start the bold thing.',
    ovulatory: 'Full flame. Lead, perform, celebrate — and drink enough water.',
    luteal: 'Fire can turn to frustration. Channel it into finishing, not fighting.',
  },
  Earth: {
    menstrual: 'Ground into comfort — warm food, soft fabrics, slow mornings.',
    follicular: 'Plant seeds: plan the routine you want to grow this month.',
    ovulatory: 'Enjoy your body and the senses — good food, touch, nature.',
    luteal: 'Your nesting instinct is wisdom. Tidy, prepare, simplify.',
  },
  Air: {
    menstrual: 'Quiet the busy mind. Fewer conversations, more breath.',
    follicular: 'Ideas flow — capture them, talk them through, learn something.',
    ovulatory: 'Your words land beautifully. Connect, network, speak up.',
    luteal: 'An overthinking window. Journal it out before you talk it out.',
  },
};

export const ANIMALS = [
  { name: 'Rat', han: '鼠', traits: 'Quick, resourceful, perceptive', gift: 'You see opportunities others miss.', tip: 'Save your sharpest strategy for your follicular phase.' },
  { name: 'Ox', han: '牛', traits: 'Patient, steady, devoted', gift: 'Your strength is endurance.', tip: 'Honour rest in your menstrual phase — even the ox lies down.' },
  { name: 'Tiger', han: '虎', traits: 'Brave, passionate, independent', gift: 'You were born to lead.', tip: 'Pour your power into your ovulatory window.' },
  { name: 'Rabbit', han: '兔', traits: 'Gentle, elegant, intuitive', gift: 'Your softness is a superpower.', tip: 'Guard your calm in the late luteal days.' },
  { name: 'Dragon', han: '龍', traits: 'Charismatic, ambitious, vital', gift: 'You carry big, bright energy.', tip: 'Let yourself be small and quiet during your period.' },
  { name: 'Snake', han: '蛇', traits: 'Wise, intuitive, magnetic', gift: 'Like the snake, you know how to shed and renew.', tip: 'Your period is your shedding ritual — release, don’t resist.' },
  { name: 'Horse', han: '馬', traits: 'Free, energetic, warm-hearted', gift: 'Your enthusiasm moves people.', tip: 'Pace yourself in the luteal phase so you don’t crash.' },
  { name: 'Goat', han: '羊', traits: 'Creative, kind, sensitive', gift: 'You bring beauty and gentleness.', tip: 'Create in your follicular phase; nest in your luteal.' },
  { name: 'Monkey', han: '猴', traits: 'Clever, playful, inventive', gift: 'You solve what others can’t.', tip: 'Play is medicine — especially around ovulation.' },
  { name: 'Rooster', han: '雞', traits: 'Confident, honest, precise', gift: 'Your clarity cuts through noise.', tip: 'Luteal days suit calm, careful detail work.' },
  { name: 'Dog', han: '狗', traits: 'Loyal, protective, sincere', gift: 'You love fiercely.', tip: 'Let others take care of you during your period.' },
  { name: 'Pig', han: '豬', traits: 'Generous, sensual, warm', gift: 'You know how to enjoy life.', tip: 'Savour nourishing food without guilt in your luteal phase.' },
];

export const FIVE = {
  Wood: { han: '木', organ: 'Liver & Gallbladder', season: 'Spring', color: 'Green', taste: 'Sour', emotion: ['Kindness & vision', 'Anger & frustration'], foods: ['Leafy greens', 'Sprouts', 'Lemon', 'Mung beans'], ritual: 'Stretch your sides and walk among trees. Wood women thrive on growth and movement.', cycle: 'Liver Qi rules the smooth flow of your cycle — keep stress moving to ease PMS.' },
  Fire: { han: '火', organ: 'Heart & Small Intestine', season: 'Summer', color: 'Red', taste: 'Bitter', emotion: ['Joy & love', 'Anxiety & restlessness'], foods: ['Red dates', 'Bitter greens', 'Berries', 'Lotus seeds'], ritual: 'Laughter, dance and heart-opening breath. Calm the Shen before sleep.', cycle: 'The Heart sends Blood down to the womb — joy and good sleep support regular cycles.' },
  Earth: { han: '土', organ: 'Spleen & Stomach', season: 'Late summer', color: 'Yellow', taste: 'Sweet', emotion: ['Care & stability', 'Worry & overthinking'], foods: ['Sweet potato', 'Pumpkin', 'Millet', 'Congee'], ritual: 'Warm, regular meals and walking barefoot on the ground.', cycle: 'The Spleen makes Blood from food — warm, cooked meals build a strong cycle.' },
  Metal: { han: '金', organ: 'Lung & Large Intestine', season: 'Autumn', color: 'White', taste: 'Pungent', emotion: ['Clarity & letting go', 'Grief & sadness'], foods: ['Pear', 'White radish', 'Ginger', 'Almonds'], ritual: 'Deep breathing in fresh air and decluttering your space.', cycle: 'Letting go is Metal’s lesson — your period is a monthly practice of release.' },
  Water: { han: '水', organ: 'Kidney & Bladder', season: 'Winter', color: 'Black & deep blue', taste: 'Salty', emotion: ['Wisdom & willpower', 'Fear & insecurity'], foods: ['Black beans', 'Black sesame', 'Seaweed', 'Walnuts', 'Bone broth'], ritual: 'Keep your feet and lower back warm, rest deeply, sleep early in winter.', cycle: 'The Kidney stores Jing (essence), the root of fertility and your whole cycle.' },
};

export const MOON_CYCLES = {
  white: { name: 'White Moon', when: 'You bleed near the new moon', meaning: 'The most common pattern in the tradition: ovulating with the full moon. Associated with nurturing, fertility and the mother archetype.' },
  red: { name: 'Red Moon', when: 'You bleed near the full moon', meaning: 'Associated with the wise woman and healer: creative and spiritual energy turned outward, toward the world.' },
  pink: { name: 'Pink Moon', when: 'You bleed while the moon is waxing', meaning: 'A transition cycle: moving from inward reflection toward outward expression.' },
  purple: { name: 'Purple Moon', when: 'You bleed while the moon is waning', meaning: 'A transition cycle of shedding and release: turning inward to heal and grow.' },
};

export const MOON_PHASES = [
  { name: 'New moon', max: 1.85, glyph: '🌑', ritual: 'Set intentions. Write down what you want to grow this month.' },
  { name: 'Waxing crescent', max: 5.54, glyph: '🌒', ritual: 'Take one small step toward your intention.' },
  { name: 'First quarter', max: 9.23, glyph: '🌓', ritual: 'Push through resistance; adjust your plan.' },
  { name: 'Waxing gibbous', max: 12.92, glyph: '🌔', ritual: 'Refine and nourish what is growing.' },
  { name: 'Full moon', max: 16.61, glyph: '🌕', ritual: 'Celebrate, express gratitude, release what feels heavy.' },
  { name: 'Waning gibbous', max: 20.3, glyph: '🌖', ritual: 'Share what you have learned; be generous.' },
  { name: 'Last quarter', max: 23.99, glyph: '🌗', ritual: 'Forgive, declutter, let go.' },
  { name: 'Waning crescent', max: 27.68, glyph: '🌘', ritual: 'Rest and surrender before the new cycle.' },
  { name: 'New moon', max: 99, glyph: '🌑', ritual: 'Set intentions. Write down what you want to grow this month.' },
];

const SYN = 29.530588853;
const REF = Date.UTC(2000, 0, 6, 18, 14);
export function moonAge(d) { return (((d.getTime() - REF) / 864e5) % SYN + SYN) % SYN; }
export function moonPhase(d) { const a = moonAge(d); return { age: a, illum: (1 - Math.cos(a / SYN * 2 * Math.PI)) / 2, ...MOON_PHASES.find(p => a < p.max) }; }
export function moonCycleType(starts) {
  if (!starts.length) return null;
  const c = { white: 0, red: 0, pink: 0, purple: 0 };
  starts.forEach(s => {
    const a = moonAge(s);
    if (a < 3.7 || a > SYN - 3.7) c.white++;
    else if (Math.abs(a - SYN / 2) < 3.7) c.red++;
    else if (a < SYN / 2) c.pink++;
    else c.purple++;
  });
  return Object.entries(c).sort((x, y) => y[1] - x[1])[0][0];
}

export function sunSign(month, day) {
  // walk backwards through the year to find the sign whose start precedes the date
  const order = SIGNS.slice().sort((a, b) => a.from[0] - b.from[0] || a.from[1] - b.from[1]);
  let s = order[order.length - 1];
  for (const x of order) if (month > x.from[0] || (month === x.from[0] && day >= x.from[1])) s = x;
  return s;
}
// Chinese astrology (BaZi convention): the year turns at Li Chun, ~4 February.
export function chineseZodiac(y, m, d) {
  const year = (m < 2 || (m === 2 && d < 4)) ? y - 1 : y;
  const animal = ANIMALS[((year - 4) % 12 + 12) % 12];
  const element = ['Metal', 'Metal', 'Water', 'Water', 'Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth'][year % 10];
  return { year, animal, element, yin: year % 2 === 1 };
}

// ---- "Your stars" topics: each reading = your cycle phase × your sign's element ----
export const STAR_TOPICS = {
  emotions: { t: 'Emotions',
    phase: { menstrual: 'You feel everything more deeply — let the tears and the quiet come.', follicular: 'Lightness returns; curiosity and hope lift you.', ovulatory: 'Open-hearted and expressive — you want to share.', luteal: 'Feelings get louder before your period. Notice them, don’t judge them.' },
    el: { Fire: 'As a fire sign, frustration flares fast — move it through your body.', Earth: 'As an earth sign, routine and touch steady you.', Air: 'As an air sign, you process by talking and writing it out.', Water: 'As a water sign, you absorb other people’s moods — protect your energy.' } },
  body: { t: 'Body',
    phase: { menstrual: 'Your body asks for warmth, rest and iron.', follicular: 'Energy is rebuilding — a lovely time to start moving more.', ovulatory: 'Energy and glow often peak — many women feel their most vibrant now.', luteal: 'You burn more energy and hold more water — eat well, move steadily.' },
    el: { Fire: 'Fire signs need to sweat — movement clears your head.', Earth: 'Earth signs thrive on slow strength: walks, lifting, nature.', Air: 'Air signs need breath: running, dancing, deep breathing.', Water: 'Water signs heal in water: swimming, baths, sauna.' } },
  moon: { t: 'Moon', phase: {}, el: {} },
  path: { t: 'Path',
    phase: { menstrual: 'Look back, let go, and set your intention for the month ahead.', follicular: 'Plant the seeds: start the project, book the course.', ovulatory: 'Step forward and be seen — pitch the idea.', luteal: 'Edit, finish and organise what you began.' },
    el: { Fire: 'Your path lights up when you lead.', Earth: 'Your path is built step by step — trust the slow climb.', Air: 'Your path opens through people and ideas.', Water: 'Your path follows your intuition — trust the pull.' } },
  social: { t: 'Social',
    phase: { menstrual: 'Keep plans small — one close friend over a crowd.', follicular: 'Say yes — new people and places energise you.', ovulatory: 'Your social peak: host, celebrate, connect.', luteal: 'Cosy plans with your inner circle feel best.' },
    el: { Fire: 'You light up a room — just leave space to recharge.', Earth: 'Long dinners and loyal friends nourish you.', Air: 'Conversation is your oxygen — call the friend.', Water: 'Deep one-to-one talks over small talk.' } },
  romance: { t: 'Romance',
    phase: { menstrual: 'Let yourself be cared for — tenderness over plans.', follicular: 'Flirty and playful — try something new together.', ovulatory: 'Magnetic: desire and confidence peak — plan the date.', luteal: 'Intimacy feels deeper and slower — cuddles count.' },
    el: { Fire: 'You love with passion — keep the spark alive with adventure.', Earth: 'You love through touch, food and devotion.', Air: 'Words and wit win you over — talk, text, laugh.', Water: 'You need emotional depth to feel truly close.' } },
  career: { t: 'Career',
    phase: { menstrual: 'Review, reflect and plan — not the week for big launches.', follicular: 'Brainstorm and begin — fresh energy suits new ideas.', ovulatory: 'Present, negotiate, ask for the raise.', luteal: 'Detail work, admin and finishing suit the inward mood.' },
    el: { Fire: 'Take the lead role.', Earth: 'Build the long-term plan.', Air: 'Network and pitch your ideas.', Water: 'Trust your gut on people and timing.' } },
  beauty: { t: 'Beauty',
    phase: { menstrual: 'Gentle care: rich creams, warm baths, no new products.', follicular: 'Your best skin — facials, new looks, a fresh haircut.', ovulatory: 'Natural glow — less makeup, more sun-kissed skin.', luteal: 'Oil rises — clean skin, a clay mask and early nights.' },
    el: { Fire: 'Bold red lips or warm bronze tones suit your fire.', Earth: 'Earthy tones, natural textures, slow skincare rituals.', Air: 'Light, fresh and airy — mists and glow.', Water: 'Dewy, soft and luminous — hydrate inside and out.' } },
  creativity: { t: 'Creativity',
    phase: { menstrual: 'Dream and journal — your intuition is loud.', follicular: 'Experiment and play — new ideas flow freely.', ovulatory: 'Share your work — perform, post, present.', luteal: 'Refine, edit and complete.' },
    el: { Fire: 'Create fast and bold.', Earth: 'Create with your hands — clay, cooking, gardening.', Air: 'Write, speak, design.', Water: 'Music, painting, poetry — feel it out.' } },
  sensuality: { t: 'Sensuality',
    phase: { menstrual: 'Comfort is sensual now: soft fabrics, warm oil, slow touch.', follicular: 'Curiosity awakens — explore what feels new.', ovulatory: 'Desire peaks — lean into your body and your confidence.', luteal: 'Slow, grounding pleasure: massage, baths, presence.' },
    el: { Fire: 'You are lit by passion and spontaneity.', Earth: 'You are lit by touch, taste and texture.', Air: 'You are lit by anticipation, words and imagination.', Water: 'You are lit by emotional closeness — and water.' } },
  fragrance: { t: 'Fragrance',
    phase: { menstrual: 'Warm and grounding: vanilla, sandalwood, cinnamon.', follicular: 'Fresh and green: bergamot, neroli, fig leaf.', ovulatory: 'Floral and radiant: jasmine, tuberose, rose.', luteal: 'Earthy and calming: vetiver, lavender, amber.' },
    el: { Fire: 'Your signature notes: orange, frankincense, black pepper.', Earth: 'Your signature notes: patchouli, cedar, vetiver.', Air: 'Your signature notes: lavender, bergamot, mint.', Water: 'Your signature notes: jasmine, ylang-ylang, lotus.' } },
  flower: { t: 'Flower',
    phase: { menstrual: 'Bring it home to soften your space.', follicular: 'Fresh stems on your desk spark new ideas.', ovulatory: 'Wear it or gift it — you are in full bloom.', luteal: 'Dry a few petals for a calming bath.' },
    el: {} },
};
export const SIGN_FLOWER = { aries: 'Honeysuckle', taurus: 'Rose', gemini: 'Lavender', cancer: 'White lily', leo: 'Sunflower', virgo: 'Aster', libra: 'Hydrangea', scorpio: 'Chrysanthemum', sagittarius: 'Carnation', capricorn: 'Pansy', aquarius: 'Orchid', pisces: 'Water lily' };

// ---- Deeper sign readings for the detail page (traditional Western astrology) ----
// Topic → the planet and house that govern it in a birth chart.
export const TOPIC_ASTRO = {
  emotions: { planet: 'Moon', glyph: '☽', house: '4th house', why: 'In astrology the Moon rules your feelings, needs and inner safety, and the 4th house is home and roots. It tides like your hormones do.' },
  body: { planet: 'Mars', glyph: '♂', house: '6th house', why: 'Mars is your drive and physical energy; the 6th house rules daily health, habits and routine care.' },
  moon: { planet: 'Moon', glyph: '☽', house: 'Lunar cycle', why: 'The moon’s 29.5-day cycle is close to the average menstrual cycle, which is why so many traditions link the two.' },
  path: { planet: 'North Node', glyph: '☊', house: '10th house', why: 'The North Node points to the growth your soul is reaching for; the 10th house is your calling and public life.' },
  social: { planet: 'Jupiter', glyph: '♃', house: '11th house', why: 'Jupiter expands whatever it touches; the 11th house rules friends, groups and your community.' },
  romance: { planet: 'Venus', glyph: '♀', house: '5th & 7th houses', why: 'Venus is how you love and what you find beautiful; the 5th house is romance and play, the 7th is partnership.' },
  career: { planet: 'Saturn', glyph: '♄', house: '10th house', why: 'Saturn is discipline, mastery and time; the 10th house is ambition, reputation and the work you are known for.' },
  beauty: { planet: 'Venus', glyph: '♀', house: '1st house', why: 'Venus rules beauty and pleasure; the 1st house is your body, face and the first impression you give.' },
  creativity: { planet: 'Sun', glyph: '☉', house: '5th house', why: 'The Sun is your life force and self-expression; the 5th house is art, play and what you create from the heart.' },
  sensuality: { planet: 'Venus & Mars', glyph: '♀♂', house: '8th house', why: 'Venus is what you desire, Mars how you go after it; the 8th house is intimacy, merging and transformation.' },
  fragrance: { planet: 'Venus', glyph: '♀', house: '2nd house', why: 'Venus rules the senses; the 2nd house is the body’s pleasures, comfort and what you value.' },
  flower: { planet: 'Venus', glyph: '♀', house: 'Sign flower', why: 'Each sign has a traditional flower that carries its qualities, a small way to bring your sign into your space.' },
};
// Per sign: ruling planet, colour, stone and one line per topic.
export const SIGN_DEPTH = {
  aries: { ruler: 'Mars', color: 'Red', stone: 'Carnelian', emotions: 'Your feelings arrive fast and hot, then pass. Anger is often hurt in armour.', body: 'You carry energy in your head. Headaches and tension come when you skip rest.', path: 'You are here to begin things and to lead with courage, not to finish everything alone.', social: 'You bring the spark and the plan; friends who can keep up energise you.', romance: 'You love the chase and honesty. You need a partner who is a little bit of a challenge.', career: 'A natural founder. You thrive with autonomy, deadlines and something to win.', beauty: 'Quick routines, scalp care and a bold lip suit you.', creativity: 'You create in bursts. Start now and edit later.', sensuality: 'Spontaneous and direct: you want to feel wanted.', fragrance: 'Spicy and bright: pink pepper, ginger, blood orange.' },
  taurus: { ruler: 'Venus', color: 'Green & rose', stone: 'Emerald', emotions: 'Steady on the outside, deep on the inside. Change needs time to land with you.', body: 'Throat and neck hold your stress. Good food and slow walks reset you.', path: 'You are here to build something that lasts and to show that pleasure is not a luxury.', social: 'Loyal and few: long dinners with the same close friends.', romance: 'You love through touch, food and being there. Consistency is your love language.', career: 'Patient builder, great with money, quality and craft.', beauty: 'Rich textures, body oils and a slow evening ritual.', creativity: 'Your hands are magic: cooking, pottery, gardening, design.', sensuality: 'The most sensual sign: all five senses, no rushing.', fragrance: 'Rose, vanilla, tonka and warm skin musks.' },
  gemini: { ruler: 'Mercury', color: 'Yellow', stone: 'Agate', emotions: 'You think your feelings first. Writing or talking turns them into clarity.', body: 'Your nervous system runs fast. Breathwork and screens-off evenings calm you.', path: 'You are here to connect people and ideas, a messenger and a learner for life.', social: 'Endlessly curious; you have friends in every corner.', romance: 'The mind first: banter, texts and a partner who keeps you curious.', career: 'Writing, media, teaching, sales: anything with words and variety.', beauty: 'Playful and light: mists, glow, trying new looks.', creativity: 'Many projects at once is your style. Let them cross-pollinate.', sensuality: 'Anticipation and words turn you on as much as touch.', fragrance: 'Citrus, mint, lemongrass and fresh green notes.' },
  cancer: { ruler: 'Moon', color: 'Silver & pearl', stone: 'Moonstone', emotions: 'You feel the tides most strongly, and your moods often follow the moon.', body: 'Your belly and breasts are your barometer; warm food soothes you.', path: 'You are here to nurture, to create belonging and to learn to receive.', social: 'Home is your favourite venue. You are the friend everyone calls.', romance: 'You need safety before you open. Once you do, your love is deep and devoted.', career: 'Care, hospitality, food, family business: work that feels like home.', beauty: 'Moisture, gentle cleansers and moon-night masks.', creativity: 'Memory and feeling are your material: photos, recipes, stories.', sensuality: 'Emotional closeness first; the body follows the heart.', fragrance: 'Milky and soft: fig, coconut, white musk, lily.' },
  leo: { ruler: 'Sun', color: 'Gold', stone: 'Ruby', emotions: 'Big heart, big feelings. You need to feel seen and appreciated.', body: 'Heart and upper back: posture, sun and joyful movement keep you bright.', path: 'You are here to shine and to give others permission to shine too.', social: 'The warm host: you gather people and make them feel special.', romance: 'Generous and loyal, and you want to be adored back, openly.', career: 'Leadership, stage, brand, creative direction: you are meant to be visible.', beauty: 'Hair is your crown: masks, oils, golden glow.', creativity: 'Performing and self-expression; make it personal.', sensuality: 'Playful and confident: you love to be admired.', fragrance: 'Amber, orange blossom, saffron and warm resins.' },
  virgo: { ruler: 'Mercury', color: 'Sage & earth', stone: 'Sapphire', emotions: 'You worry as a way of caring. Notice when helping turns into fixing.', body: 'Digestion is your centre. Routine, warm meals and herbs keep you calm.', path: 'You are here to heal, refine and serve, without being perfect yourself.', social: 'You show love by being useful; small, sincere circles suit you.', romance: 'Acts of service and quiet devotion. Trust grows slowly and truly.', career: 'Health, editing, analysis, craft: anything that needs precision.', beauty: 'Clean, simple and natural, with a few products that really work.', creativity: 'Detail is your art: illustration, sewing, editing, herbs.', sensuality: 'Relaxed and safe first; then you are surprisingly devoted.', fragrance: 'Herbal and clean: sage, vetiver, chamomile.' },
  libra: { ruler: 'Venus', color: 'Pastel pink & blue', stone: 'Opal', emotions: 'You feel others’ moods and seek harmony, sometimes at your own expense.', body: 'Kidneys and lower back: water, balance and gentle stretching.', path: 'You are here to create beauty and fairness, and to learn your own yes and no.', social: 'Charming connector. You make every group feel balanced.', romance: 'Partnership is central; romance, beauty and fairness matter to you.', career: 'Design, law, diplomacy, styling: you see what is fair and beautiful.', beauty: 'Harmony and elegance: symmetry, soft tones, perfume.', creativity: 'Aesthetics and composition: styling, music, interiors.', sensuality: 'Romance and atmosphere: candles, music, a beautiful setting.', fragrance: 'Powdery florals: iris, peony, rose and pear.' },
  scorpio: { ruler: 'Pluto & Mars', color: 'Deep red & black', stone: 'Topaz', emotions: 'You feel at full depth and keep it private. Trust is earned, never given.', body: 'Womb and pelvis: your sign rules the reproductive organs, so warmth and release matter.', path: 'You are here to transform, letting go and rising again stronger.', social: 'Few but forever. You can read people instantly.', romance: 'All or nothing: intense, loyal and deeply intimate.', career: 'Research, psychology, finance, healing: you go where others won’t.', beauty: 'Dark and magnetic: smoky eyes, deep reds, night rituals.', creativity: 'You make art out of shadow and truth.', sensuality: 'The sign of intimacy: deep, emotional and transformative.', fragrance: 'Oud, black rose, patchouli and incense.' },
  sagittarius: { ruler: 'Jupiter', color: 'Purple', stone: 'Turquoise', emotions: 'Optimistic by nature. Heavy feelings can make you want to run.', body: 'Hips and thighs: you need movement, open space and stretching.', path: 'You are here to explore and to share what you find.', social: 'Adventure friends, travel friends, friends from everywhere.', romance: 'Freedom and fun. You need a partner who is also your travel buddy.', career: 'Teaching, travel, publishing, coaching: big-picture work.', beauty: 'Sun-kissed and easy, made for life on the move.', creativity: 'Stories, journeys and philosophy; write what you learn.', sensuality: 'Playful, adventurous and laughter-filled.', fragrance: 'Warm spice and wood: cardamom, cedar, sandalwood.' },
  capricorn: { ruler: 'Saturn', color: 'Charcoal & brown', stone: 'Garnet', emotions: 'You hold it together for everyone. Let yourself be held too.', body: 'Bones, knees and skin: warmth, minerals and real rest protect you.', path: 'You are here to build mastery and to learn that rest is part of success.', social: 'A small, trusted inner circle and quiet loyalty.', romance: 'Slow to commit, then devoted for life. Reliability is romance for you.', career: 'The ambitious climber: leadership, business, long-term plans.', beauty: 'Classic and timeless: quality over quantity.', creativity: 'Structure is your canvas: architecture, strategy, craft.', sensuality: 'Reserved in public, earthy and deep in private.', fragrance: 'Leather, tobacco leaf, cypress and myrrh.' },
  aquarius: { ruler: 'Uranus & Saturn', color: 'Electric blue', stone: 'Amethyst', emotions: 'You observe your feelings from a distance. Let them be felt, not just understood.', body: 'Ankles and circulation: keep moving and keep warm.', path: 'You are here to innovate and to change things for the collective.', social: 'Community-minded. You collect unusual, brilliant friends.', romance: 'Friendship first; you need space, honesty and a meeting of minds.', career: 'Tech, science, activism, the future: work that changes systems.', beauty: 'Experimental: new tech, unexpected colour, your own rules.', creativity: 'Original and visionary; ideas no one has tried yet.', sensuality: 'Curious and open-minded, sparked by the mind.', fragrance: 'Ozonic and unusual: violet leaf, aldehydes, sea air.' },
  pisces: { ruler: 'Neptune & Jupiter', color: 'Sea green & lavender', stone: 'Aquamarine', emotions: 'You absorb everything around you. Boundaries are self-care for you.', body: 'Feet and lymph: warm foot soaks, water and sleep heal you.', path: 'You are here to dream, heal and remind others of the magic.', social: 'The empath friend. Recharge alone after people.', romance: 'Romantic and soulful: you love with your whole being.', career: 'Art, music, healing, spirituality: intuition is your edge.', beauty: 'Dewy and dreamy: hydration, shimmer, water rituals.', creativity: 'Music, painting, poetry, dance: you channel more than you plan.', sensuality: 'Melting, emotional and dreamy, often in water.', fragrance: 'Aquatic florals: lotus, water lily, ylang-ylang.' },
};

// ---------- birth chart wording (Moon, Rising and the planets), used with js/astro.js ----------
// One "style" per sign, so any planet in that sign reads naturally: "You love slowly, through the senses."
export const SIGN_STYLE = {
  aries: 'boldly, and fast', taurus: 'slowly, through the senses', gemini: 'curiously, in many directions', cancer: 'tenderly, protecting what you love',
  leo: 'warmly, and out loud', virgo: 'carefully, with an eye for detail', libra: 'gracefully, looking for balance', scorpio: 'deeply, all the way',
  sagittarius: 'freely, chasing meaning', capricorn: 'steadily, with a long plan', aquarius: 'your own way, a little ahead of your time', pisces: 'softly, through feeling and intuition',
};
export const PLANET_LINE = {
  sun: s => `You shine ${s}.`, moon: s => `You feel ${s}.`, mercury: s => `You think and talk ${s}.`, venus: s => `You love ${s}.`,
  mars: s => `You go after what you want ${s}.`, jupiter: s => `Luck grows when you live ${s}.`, saturn: s => `Your strength grows when you work ${s}.`,
};
export const PLANET_THEME = { sun: 'who you are', moon: 'your feelings', mercury: 'your mind', venus: 'love and beauty', mars: 'drive and desire', jupiter: 'growth and luck', saturn: 'structure and patience' };
// Each part of the cycle has a planet that speaks loudest, which keeps the chart tied to her body.
export const PHASE_PLANET = {
  menstrual: ['moon', 'Your Moon leads during your period', 'Turn inward. This is how you need to be held right now:'],
  follicular: ['mars', 'Your Mars wakes up after your period', 'Energy rises. This is how you start things best:'],
  ovulatory: ['venus', 'Your Venus glows around ovulation', 'You are magnetic now. This is how you love and shine:'],
  luteal: ['moon', 'Your Moon grows louder before your period', 'Feelings come closer to the surface. What soothes you:'],
};
export const DIGNITY_WORD = { home: 'At home', exalted: 'Exalted', detriment: 'Stretched', fall: 'Quiet' };
export const DIGNITY_NOTE = { home: 'Strong and natural here.', exalted: 'At its very best here.', detriment: 'Works harder here, and grows wise.', fall: 'Speaks softly here. Give it time.' };
// Whole-sign houses: what each part of life is about, and what the passing Moon asks for there.
export const HOUSES = [
  ['You & your body', 'Put yourself first today. A good day to begin something just for you.'],
  ['Money & self-worth', 'Look at what you value. Small comforts and tidy money matters feel good.'],
  ['Words & short trips', 'Messages, calls and short walks. Your words land well today.'],
  ['Home & roots', 'Nest. Cook at home, call family, rest in your own space.'],
  ['Joy, love & creating', 'Play, flirt, make something. Pleasure is the point today.'],
  ['Health & routines', 'Tidy your days: sleep, food, movement. Small habits stick now.'],
  ['Partners', 'One-to-one time matters. Listen closely and meet halfway.'],
  ['Intimacy & letting go', 'Feelings run deep. Let go of something you no longer need.'],
  ['Learning & far places', 'Read, plan a trip, look at the bigger picture.'],
  ['Work & being seen', 'Your work is visible today. Let people see it.'],
  ['Friends & hopes', 'Reach out to friends and dream a little bigger.'],
  ['Rest & your inner world', 'Slow down, sleep more, journal. Your inner world asks for time.'],
];
export const ASPECT_VERB = { conjunction: 'meets', trine: 'flows with', sextile: 'opens a door to', square: 'pushes on', opposition: 'faces' };
export const ASPECT_TONE = { conjunction: 'Strong and focused.', trine: 'Easy energy. Use it.', sextile: 'A small chance. Say yes.', square: 'Some friction. Go gently.', opposition: 'A tug between two sides. Find the middle.' };
