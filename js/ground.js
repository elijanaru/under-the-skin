// Grounding (earthing): bare skin on the earth. Practice steps, where to stand, a version for each phase and moon,
// and what the (small) studies found. Written in our own words.

export const GROUND_NOW = ['Ground yourself now', 'Shoes and socks off, stand or sit on grass, sand or soil', 'Stay 10 to 20 minutes, phone away, feel your soles', 'Today'];

// [surface, how well it connects 0 to 3, short note]
export const GROUND_WHERE = [
  ['Wet sand', 3, 'The shore line is the best spot'],
  ['Dewy grass', 3, 'Morning grass, still a little wet'],
  ['Garden soil', 2, 'Kneel, plant, put your hands in'],
  ['Sea or lake', 3, 'Paddle your feet in when it is warm enough'],
  ['Stone on the ground', 1, 'Unsealed stone or concrete, a little'],
  ['Wood, asphalt, rubber', 0, 'These block it, so go barefoot elsewhere'],
];

// Phase by phase. Warm ground only during the period and the days before it.
export const GROUND_PHASE = {
  menstrual: { t: 'Warm ground only', d: ['Ground on warm, dry ground', 'Sun-warmed sand or dry grass at midday, 10 minutes', 'Socks on straight after, no cold wet ground or sea dips', 'Midday'],
    why: 'Chinese medicine keeps the feet and lower back warm while you bleed, because cold is thought to slow the flow and deepen cramps. A short, warm session still gives you the calm without the chill.' },
  follicular: { t: 'Morning grass', d: ['Barefoot in the morning grass', '15 minutes on dewy grass after sunrise', 'Face the light: it also sets your body clock', 'Morning'],
    why: 'Rising estrogen makes this a fresh, outward time. Pairing grounding with morning daylight gives you two rhythm anchors at once: the earth under you and the light in your eyes.' },
  ovulatory: { t: 'Water and shore', d: ['Walk the water line', '20 minutes barefoot where the waves reach', 'Cool water is welcome now', 'This week'],
    why: 'Around ovulation you run warmer and have the most energy. Wet sand connects best of all, and the cool water feels good in this phase.' },
  luteal: { t: 'Slow roots', d: ['Root down in the evening', '20 minutes barefoot in a garden or park', 'In the last 3 days: warm dry ground and a warm foot bath after', 'Evening'],
    why: 'Progesterone makes you calmer but more sensitive to stress. A slow evening session helps you land before sleep. As the period nears, switch to warm ground and keep your feet warm.' },
};

// Moon: when to ground and what to hold in mind.
export const GROUND_MOON = {
  wax: ['Plant it', 'As the moon grows, press your palms into the soil and name one thing you want to grow.'],
  wane: ['Let it sink', 'As the moon shrinks, stand barefoot and let each out-breath carry one worry down into the ground.'],
};

// The roots visualisation, an old practice found in many traditions.
export const GROUND_ROOTS = {
  steps: [['Sit', 'Cross-legged on the ground, spine tall, hands on your knees'], ['Feel the base', 'Notice where your body touches the earth'], ['Grow roots', 'On each out-breath, picture golden roots growing down from the base of your spine'], ['Draw up', 'On each in-breath, imagine warmth rising back up through the roots into your belly']],
  mins: 3,
  d: ['Golden roots, 3 minutes', 'Sit on the ground and picture roots growing down on each out-breath', 'On each in-breath, draw warmth back up into your belly', 'Tonight'],
};

// What studies found: [authors, year, journal, short finding, detail, people, time grounded], oldest first so the years read as a timeline
export const GROUND_STUDIES = [
  ['Ghaly & Teplitz', 2004, 'Journal of Alternative and Complementary Medicine', 'Calmer cortisol at night', '12 people with poor sleep slept on a grounded sheet for 8 weeks. Their night-time cortisol evened out toward a normal daily rhythm, and most said they slept better and woke less.', 12, '8 weeks'],
  ['Brown, Chevalier & Hill', 2010, 'Journal of Alternative and Complementary Medicine', 'Less soreness after exercise', 'A pilot study of 8 people: those grounded after hard calf exercise felt less muscle pain and showed lower markers of muscle damage.', 8, '3 days'],
  ['Chevalier et al.', 2013, 'Journal of Alternative and Complementary Medicine', 'Blood flows more freely', 'After two hours grounded, red blood cells clumped together less in 10 healthy adults, measured as a higher zeta potential.', 10, '2 hours'],
  ['Chevalier et al.', 2015, 'Psychological Reports', 'Better mood after an hour', 'In a small controlled trial, people who sat grounded for one hour reported a clearly better mood than those on a sham connection.', 40, '1 hour'],
  ['Oschman, Chevalier & Brown', 2015, 'Journal of Inflammation Research', 'A review on inflammation', 'A review that pulls the early studies together and suggests grounding may calm inflammation and help recovery, while calling for larger trials.', 0, ''],
];
export const GROUND_CAUTION = 'These are small studies, many from one research group, so think of grounding as a calm daily habit, not a treatment. Never ground outdoors in a thunderstorm, and only use indoor grounding mats that are properly wired and tested.';

// Where she lives (25 Nov 2026): asked the first time she opens Ground, then her guide fits her life.
// [key, label, short line, emoji]
export const GROUND_PLACES = [
  ['city', 'In a city', 'Little grass, lots of concrete', '🏙️'],
  ['village', 'In a village', 'Grass and open land nearby', '🌾'],
];
// [emoji, spot, how, minutes, more, how in the cold, minutes in the cold]
export const GROUND_GUIDE = {
  city: {
    t: 'Grounding in the city',
    lead: 'No garden? The earth is still right there under the pavement. You only need the small green gaps.',
    spots: [
      ['🌳', 'A park lawn', 'Shoes off in the middle of the lawn, away from the paths', 15, 'Pick the same spot at the same time, like your lunch break. Check the grass for glass and dog mess first and rinse your feet after.', 'Dry grass at midday, then socks straight back on', 5],
      ['🌲', 'A tree on your street', 'Palms on the bark, or a hand in the soil around it', 5, 'Most city trees stand in a small square of open earth. On your way home, rest a hand on the trunk and take ten slow breaths.'],
      ['🌊', 'A river or lake shore', 'Wet sand and stones at the water connect best', 20, 'Many cities grew up by water. Find a small beach or a stony bank and walk the water line when it is warm enough.', 'Hands on a wet stone at the edge, no paddling in the cold', 3],
      ['⛪', 'A quiet green corner', 'Botanical garden, churchyard or allotment', 15, 'These stay calm even in the middle of a big city. Many allotments welcome visitors, and someone may let you dig a little.'],
      ['🪴', 'Soil on your windowsill', 'Hands in a big pot of garden soil', 10, 'A pot is not connected to the earth, so it does not ground you the same way. But real soil on your hands and a few slow breaths still calm you on the days you cannot get out.'],
      ['🔌', 'A grounding mat at home', 'Only a properly wired and tested one', 30, 'An indoor mat connects to the earth wire of a socket. Use one only if the socket is properly earthed and the mat is tested, and never during a thunderstorm.'],
    ],
    tips: ['Concrete laid straight on the ground connects a little when it is wet. Asphalt, wood and rubber block it.', 'Make it a habit: the same spot at the same time, even if it is only 5 minutes.'],
  },
  village: {
    t: 'Grounding in the countryside',
    lead: 'You have the best spots right outside. Make one of them yours and go a little every day.',
    spots: [
      ['🌼', 'Your garden or a meadow', 'Barefoot on the grass in the morning dew', 20, 'Dewy grass is one of the best spots there is. Go out after sunrise, face the light and let your soles get a little wet.', 'Dry grass or soil at midday, then socks straight back on', 5],
      ['🥕', 'Garden work, bare hands', 'Weeding, planting and digging', 20, 'Gloves off for the soft jobs. Hands in the soil ground you, and the time outside slows you down.', 'Turn the compost or cut winter herbs, gloves off for a few minutes', 5],
      ['🍂', 'A field or forest path', 'A slow barefoot walk on soft ground', 15, 'Field paths, moss and forest floor feel lovely under bare feet. Walk slowly and look where you step.', 'Under big trees the soil stays softer and less frozen, shoes back on after', 5],
      ['💧', 'A stream or pond', 'Feet in at the edge, or hands in the water', 10, 'Wet ground at the water connects best of all. Paddle in when it is warm enough.', 'Hands only, then dry them well', 2],
      ['🌳', 'Your tree', 'The tree practice, palms on the bark', 10, 'An old tree near home becomes your spot. Palms on the bark first, then sit with your back to it.'],
    ],
    tips: ['Bare skin is what counts: feet, hands or even sitting on the grass.', 'Make it a habit: the same spot at the same time, even if it is only 5 minutes.'],
  },
};
// The cold months: shorter, warmer, hands count too.
export const GROUND_WINTER = {
  t: 'It is cold out',
  lead: 'Cold ground pulls the warmth out of your feet fast. Keep it short and warm, and let your hands do some of it.',
  rules: [
    ['✋', 'Hands count too', 'Palms on soil, bark or a wet stone, 3 to 5 minutes'],
    ['☀️', 'Go at midday', 'The ground is warmest then, and the light lifts your mood'],
    ['🧦', 'Short, then warm', '2 to 5 minutes barefoot on dry ground, socks on after'],
    ['🛁', 'Warm feet after', 'A warm foot bath with a handful of salt, 10 minutes'],
  ],
  period: 'On your period and the 3 days before it: hands only, and keep your feet warm.',
  care: 'Skip cold bare feet if you have Raynaud’s, diabetes or numb feet, and never stand on snow or ice.',
};
