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

// What studies found: [authors, year, journal, short finding, detail]
export const GROUND_STUDIES = [
  ['Ghaly & Teplitz', 2004, 'J Altern Complement Med', 'Calmer cortisol at night', '12 people with poor sleep slept on a grounded sheet for 8 weeks. Their night-time cortisol evened out toward a normal daily rhythm, and most said they slept better and woke less.'],
  ['Chevalier et al.', 2015, 'Psychological Reports', 'Better mood after an hour', 'In a small controlled trial, people who sat grounded for one hour reported a clearly better mood than those on a sham connection.'],
  ['Brown, Chevalier & Hill', 2010, 'J Altern Complement Med', 'Less soreness after exercise', 'A pilot study of 8 people: those grounded after hard calf exercise felt less muscle pain and showed lower markers of muscle damage.'],
  ['Chevalier et al.', 2013, 'J Altern Complement Med', 'Blood flows more freely', 'After two hours grounded, red blood cells clumped together less in 10 healthy adults, measured as a higher zeta potential.'],
  ['Oschman, Chevalier & Brown', 2015, 'J Inflamm Res', 'A review on inflammation', 'A review that pulls the early studies together and suggests grounding may calm inflammation and help recovery, while calling for larger trials.'],
];
export const GROUND_CAUTION = 'These are small studies, many from one research group, so think of grounding as a calm daily habit, not a treatment. Never ground outdoors in a thunderstorm, and only use indoor grounding mats that are properly wired and tested.';
