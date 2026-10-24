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
  { name: 'Rooster', han: '雞', traits: 'Confident, honest, precise', gift: 'Your clarity cuts through noise.', tip: 'Use your luteal focus for detail work.' },
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
