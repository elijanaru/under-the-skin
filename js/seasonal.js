// What's in season, by climate region and month (local/regional field produce).
// Months are 1–12. Regions cover groups of countries with similar growing seasons.

export const COUNTRIES = [
  ['DE', 'Germany', 'central'], ['AT', 'Austria', 'central'], ['CH', 'Switzerland', 'central'], ['NL', 'Netherlands', 'central'],
  ['BE', 'Belgium', 'central'], ['DK', 'Denmark', 'north'], ['PL', 'Poland', 'central'], ['CZ', 'Czechia', 'central'],
  ['SE', 'Sweden', 'north'], ['NO', 'Norway', 'north'], ['GB', 'United Kingdom', 'north'], ['IE', 'Ireland', 'north'],
  ['FI', 'Finland', 'north'], ['FR', 'France', 'central'], ['ES', 'Spain', 'med'], ['IT', 'Italy', 'med'], ['PT', 'Portugal', 'med'], ['GR', 'Greece', 'med'],
  ['HR', 'Croatia', 'med'], ['TR', 'Türkiye', 'med'], ['US', 'United States', 'us'], ['CA', 'Canada', 'canada'],
  ['AU', 'Australia', 'aus'], ['NZ', 'New Zealand', 'aus'], ['ZA', 'South Africa', 'aus'],
];

const all = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const r = (a, b) => (a <= b ? Array.from({ length: b - a + 1 }, (_, i) => a + i) : [...r(a, 12), ...r(1, b)]);

// [name, kind, months]
const CENTRAL = [
  ['Kale', 'veg', r(10, 3)], ['Brussels sprouts', 'veg', r(10, 2)], ['Savoy & red cabbage', 'veg', r(9, 3)], ['Leeks', 'veg', r(8, 4)],
  ['Parsnips', 'veg', r(10, 3)], ['Beetroot', 'veg', r(7, 3)], ['Carrots', 'veg', r(6, 3)], ['Celeriac', 'veg', r(9, 3)],
  ['Salsify', 'veg', r(10, 3)], ["Lamb's lettuce", 'veg', r(10, 3)], ['Wild garlic', 'veg', r(3, 5)], ['Rhubarb', 'veg', r(4, 6)],
  ['Asparagus', 'veg', r(4, 6)], ['Radishes', 'veg', r(4, 9)], ['Spinach', 'veg', [3, 4, 5, 6, 9, 10, 11]], ['Lettuce', 'veg', r(5, 10)],
  ['Kohlrabi', 'veg', r(5, 10)], ['Peas', 'veg', r(6, 8)], ['Courgette', 'veg', r(6, 9)], ['Cucumber', 'veg', r(6, 9)],
  ['Tomatoes', 'veg', r(7, 10)], ['Peppers', 'veg', r(8, 10)], ['Green beans', 'veg', r(7, 9)], ['Broccoli', 'veg', r(6, 10)],
  ['Cauliflower', 'veg', r(6, 10)], ['Fennel', 'veg', r(7, 10)], ['Sweetcorn', 'veg', r(8, 9)], ['Pumpkin & squash', 'veg', r(8, 11)],
  ['New potatoes', 'veg', r(6, 8)], ['Mushrooms & chanterelles', 'veg', r(7, 10)],
  ['Strawberries', 'fruit', r(5, 7)], ['Cherries', 'fruit', r(6, 7)], ['Gooseberries & currants', 'fruit', r(6, 8)], ['Raspberries', 'fruit', r(6, 9)],
  ['Blueberries', 'fruit', r(7, 9)], ['Apricots', 'fruit', [7]], ['Plums', 'fruit', r(8, 9)], ['Blackberries', 'fruit', r(8, 9)],
  ['Elderberries', 'fruit', [8, 9]], ['Grapes', 'fruit', r(9, 10)], ['Apples', 'fruit', r(8, 3)], ['Pears', 'fruit', r(8, 1)],
  ['Quince', 'fruit', r(10, 11)], ['Walnuts', 'other', r(9, 12)], ['Chestnuts', 'other', r(10, 12)], ['Hazelnuts', 'other', r(9, 10)],
  ['Nettle', 'wild', r(3, 6)], ['Dandelion greens', 'wild', r(3, 5)], ['Elderflower', 'wild', r(5, 6)], ['Rosehips', 'wild', r(9, 11)],
  ['Sea buckthorn', 'wild', r(8, 10)], ['Wild berries', 'wild', r(7, 8)], ['Chives', 'herb', r(3, 10)], ['Parsley', 'herb', r(4, 11)],
  ['Dill', 'herb', r(5, 9)], ['Basil', 'herb', r(6, 9)], ['Thyme & sage', 'herb', r(5, 10)], ['Horseradish', 'veg', r(10, 2)],
  ['Jerusalem artichoke', 'veg', r(10, 3)], ['Red & black radish', 'veg', r(9, 2)], ['Spring onions', 'veg', r(4, 9)],
];
const MED = [
  ['Oranges & mandarins', 'fruit', r(11, 4)], ['Lemons', 'fruit', r(11, 5)], ['Artichokes', 'veg', r(11, 5)], ['Fennel', 'veg', r(10, 4)],
  ['Broccoli', 'veg', r(10, 4)], ['Cauliflower', 'veg', r(10, 3)], ['Chard', 'veg', r(10, 5)], ['Spinach', 'veg', r(10, 4)],
  ['Leeks', 'veg', r(10, 3)], ['Broad beans', 'veg', r(3, 5)], ['Peas', 'veg', r(3, 5)], ['Asparagus', 'veg', r(3, 5)],
  ['Strawberries', 'fruit', r(3, 6)], ['Cherries', 'fruit', r(5, 6)], ['Apricots', 'fruit', r(5, 7)], ['Peaches & nectarines', 'fruit', r(6, 9)],
  ['Melon & watermelon', 'fruit', r(6, 9)], ['Tomatoes', 'veg', r(6, 10)], ['Peppers', 'veg', r(6, 10)], ['Aubergine', 'veg', r(6, 10)],
  ['Courgette', 'veg', r(5, 9)], ['Cucumber', 'veg', r(5, 9)], ['Green beans', 'veg', r(6, 9)], ['Figs', 'fruit', r(7, 10)],
  ['Grapes', 'fruit', r(8, 10)], ['Pomegranate', 'fruit', r(9, 12)], ['Persimmon', 'fruit', r(10, 12)], ['Quince', 'fruit', r(10, 11)],
  ['Pumpkin & squash', 'veg', r(9, 12)], ['Mushrooms', 'veg', r(10, 12)], ['Chestnuts', 'other', r(10, 12)], ['Almonds', 'other', r(8, 10)],
  ['Olives', 'other', r(10, 1)], ['Wild greens', 'wild', r(1, 4)],
  ['Wild fennel', 'wild', r(2, 5)], ['Prickly pear', 'fruit', r(8, 10)], ['Basil', 'herb', r(5, 9)], ['Rosemary & oregano', 'herb', all],
  ['Mint', 'herb', r(4, 10)], ['Loquat', 'fruit', r(4, 5)], ['Plums', 'fruit', r(6, 8)],
  ['Cabbage', 'veg', r(11, 3)], ['Turnip greens', 'veg', r(11, 3)], ['Carrots', 'veg', r(11, 5)], ['Beetroot', 'veg', r(11, 4)],
  ['Cardoons', 'veg', r(11, 2)], ['Avocado', 'fruit', r(10, 4)], ['Kiwifruit', 'fruit', r(11, 3)],
];
const US = [
  ['Kale', 'veg', r(10, 3)], ['Brussels sprouts', 'veg', r(9, 2)], ['Cabbage', 'veg', r(10, 3)], ['Sweet potatoes', 'veg', r(9, 12)],
  ['Root vegetables', 'veg', r(10, 3)], ['Citrus', 'fruit', r(12, 4)], ['Asparagus', 'veg', r(3, 6)], ['Peas', 'veg', r(4, 6)],
  ['Rhubarb', 'veg', r(4, 6)], ['Radishes', 'veg', r(4, 6)], ['Spinach', 'veg', [3, 4, 5, 9, 10, 11]], ['Artichokes', 'veg', r(3, 5)],
  ['Strawberries', 'fruit', r(4, 7)], ['Cherries', 'fruit', r(6, 7)], ['Blueberries', 'fruit', r(6, 8)], ['Peaches & plums', 'fruit', r(6, 9)],
  ['Watermelon', 'fruit', r(6, 9)], ['Tomatoes', 'veg', r(7, 9)], ['Sweetcorn', 'veg', r(7, 9)], ['Zucchini', 'veg', r(6, 9)],
  ['Peppers', 'veg', r(7, 10)], ['Cucumbers', 'veg', r(6, 9)], ['Apples', 'fruit', r(8, 2)], ['Pears', 'fruit', r(8, 12)],
  ['Grapes', 'fruit', r(8, 10)], ['Pumpkin & winter squash', 'veg', r(9, 2)], ['Cranberries', 'fruit', r(10, 12)], ['Pecans & walnuts', 'other', r(10, 12)],
  ['Ramps (wild leeks)', 'wild', r(4, 5)], ['Fiddleheads', 'wild', r(4, 5)], ['Morels', 'wild', r(4, 5)], ['Basil', 'herb', r(6, 9)],
  ['Parsley & cilantro', 'herb', r(4, 10)], ['Raw honey', 'other', r(6, 9)],
  ['Collards & mustard greens', 'veg', r(11, 3)], ['Leeks', 'veg', r(9, 3)], ['Turnips & rutabaga', 'veg', r(10, 3)], ['Parsnips', 'veg', r(10, 3)],
  ['Carrots', 'veg', r(7, 3)], ['Beets', 'veg', r(7, 2)], ['Broccoli & cauliflower', 'veg', [5, 6, 9, 10, 11]], ['Pomegranate', 'fruit', r(9, 12)],
  ['Persimmon', 'fruit', r(10, 12)], ['Avocado', 'fruit', r(3, 9)], ['Maple syrup', 'other', r(2, 4)],
];
const AUS = [
  ['Mango', 'fruit', r(11, 3)], ['Cherries', 'fruit', r(11, 1)], ['Stone fruit', 'fruit', r(12, 3)], ['Berries', 'fruit', r(11, 3)],
  ['Watermelon', 'fruit', r(11, 3)], ['Tomatoes', 'veg', r(12, 4)], ['Sweetcorn', 'veg', r(12, 3)], ['Zucchini', 'veg', r(11, 3)],
  ['Apples', 'fruit', r(3, 8)], ['Pears', 'fruit', r(3, 7)], ['Figs', 'fruit', r(2, 4)], ['Pumpkin', 'veg', r(3, 8)],
  ['Mushrooms', 'veg', r(3, 6)], ['Feijoa', 'fruit', r(3, 6)], ['Citrus', 'fruit', r(5, 10)], ['Kale', 'veg', r(5, 9)],
  ['Broccoli & cauliflower', 'veg', r(5, 9)], ['Root vegetables', 'veg', r(5, 9)], ['Rhubarb', 'veg', r(5, 9)], ['Brussels sprouts', 'veg', r(5, 8)],
  ['Asparagus', 'veg', r(9, 11)], ['Peas & broad beans', 'veg', r(9, 11)], ['Strawberries', 'fruit', r(9, 12)], ['Artichokes', 'veg', r(8, 10)],
  ['Avocado', 'fruit', r(9, 2)], ['Macadamias', 'other', r(3, 9)],
  ['Basil', 'herb', r(11, 3)], ['Parsley & coriander', 'herb', r(3, 11)], ['Passionfruit', 'fruit', r(12, 5)], ['Pomegranate', 'fruit', r(3, 5)],
  ['Leeks', 'veg', r(5, 9)], ['Cabbage', 'veg', r(5, 9)], ['Spinach & silverbeet', 'veg', r(5, 10)], ['Fennel', 'veg', r(5, 9)],
  ['Sweet potatoes', 'veg', r(3, 8)], ['Jerusalem artichoke', 'veg', r(5, 8)], ['Kiwifruit', 'fruit', r(5, 9)], ['Quince', 'fruit', r(3, 6)],
  ['Persimmon', 'fruit', r(3, 6)], ['Custard apple', 'fruit', r(3, 8)], ['Chestnuts', 'other', r(3, 6)],
];
// seasonal animal foods (game seasons, fish runs, pasture peaks)
CENTRAL.push(['Venison & wild boar', 'animal', r(9, 1)], ['Goose & duck', 'animal', r(11, 12)], ['Carp', 'animal', r(9, 12)],
  ['Trout & char', 'animal', r(4, 10)], ['Matjes herring', 'animal', r(6, 7)], ['Mussels', 'animal', r(9, 3)], ['Oysters', 'animal', r(9, 4)],
  ['Spring lamb', 'animal', r(4, 6)], ['Grass-fed raw milk & butter', 'animal', r(5, 9)], ['Pasture eggs', 'animal', r(3, 9)]);
MED.push(['Octopus', 'animal', r(10, 4)], ['Cuttlefish', 'animal', r(1, 5)], ['Red mullet', 'animal', r(9, 12)], ['Sardines', 'animal', r(5, 10)], ['Anchovies', 'animal', r(4, 9)], ['Bluefin tuna', 'animal', r(5, 7)], ['Spring lamb', 'animal', r(3, 5)],
  ['Mussels', 'animal', r(6, 10)], ['Fresh sheep & goat cheese', 'animal', r(3, 6)], ['Pasture eggs', 'animal', r(2, 7)], ['Wild boar', 'animal', r(10, 1)]);
US.push(['Wild salmon', 'animal', r(5, 9)], ['Halibut', 'animal', r(3, 11)], ['Oysters', 'animal', r(9, 4)], ['Venison', 'animal', r(10, 1)],
  ['Turkey', 'animal', r(11, 12)], ['Dungeness crab', 'animal', r(11, 6)], ['Grass-fed raw milk & butter', 'animal', r(5, 9)], ['Pasture eggs', 'animal', r(3, 9)]);
AUS.push(['Spring lamb', 'animal', r(9, 11)], ['Oysters', 'animal', r(5, 10)], ['Snapper', 'animal', all], ['Prawns', 'animal', r(11, 2)], ['Mussels', 'animal', r(5, 10)],
  ['Grass-fed raw milk & butter', 'animal', r(9, 1)], ['Pasture eggs', 'animal', r(9, 3)]);

// Northern Europe (UK, Ireland, Scandinavia): same produce as central Europe but spring/summer
// crops arrive about a month later, plus regional specialties.
const NORTH = CENTRAL.filter(([f]) => !['Apricots', 'Peppers', 'Sweetcorn', 'Chestnuts', 'Grapes'].includes(f)).map(([f, k, m]) => {
  const lo = Math.min(...m), wraps = m.includes(12) && m.includes(1);
  return [f, k, !wraps && lo >= 3 && lo <= 6 && m.length > 2 ? m.filter(x => x !== lo) : m];
});
NORTH.push(['Samphire', 'veg', r(6, 8)], ['Watercress', 'veg', r(4, 9)], ['Purple sprouting broccoli', 'veg', r(2, 4)], ['Damsons', 'fruit', r(8, 9)],
  ['Lingonberries', 'wild', r(8, 9)], ['Cloudberries', 'wild', r(7, 8)], ['Bilberries', 'wild', r(7, 8)], ['Mackerel', 'animal', r(6, 9)],
  ['Cod', 'animal', r(1, 4)], ['Crab & langoustine', 'animal', r(5, 10)]);

// Canada: northern US produce with a shorter season (spring/summer crops ~a month later, ending ~a month earlier),
// no warm-climate California crops, plus Canadian specialties.
const SHORT = m => { if (m.length >= 12 || (m.includes(12) && m.includes(1))) return m; const lo = Math.min(...m), hi = Math.max(...m);
  return m.length > 3 ? m.filter(x => !(lo >= 3 && lo <= 6 && x === lo) && !(hi >= 9 && hi <= 11 && x === hi)) : m; };
const CANADA = US.filter(([f]) => !['Citrus', 'Artichokes', 'Avocado', 'Pomegranate', 'Persimmon', 'Halibut'].includes(f)).map(([f, k, m]) => [f, k, SHORT(m)]);
CANADA.push(['Saskatoon berries', 'fruit', r(7, 8)], ['Wild blueberries', 'wild', r(8, 9)], ['Haskap berries', 'fruit', r(6, 7)],
  ['Arctic char', 'animal', all], ['Atlantic lobster', 'animal', r(5, 7)], ['Pacific halibut', 'animal', r(4, 10)], ['Wild rice', 'other', r(9, 10)]);

const DATA = { central: CENTRAL, north: NORTH, med: MED, us: US, canada: CANADA, aus: AUS };

// TCM season for the month (southern regions are shifted by 6 months).
const SEASON_N = { 12: 'Winter', 1: 'Winter', 2: 'Winter', 3: 'Spring', 4: 'Spring', 5: 'Spring', 6: 'Summer', 7: 'Summer', 8: 'Late summer', 9: 'Autumn', 10: 'Autumn', 11: 'Autumn' };
export const SEASON_TCM = {
  Winter: { el: 'Water', han: '水', note: 'Season of the Kidney: warm, slow-cooked roots, broths and dark foods. Rest and store energy.',
    emotion: ['Wisdom & willpower', 'Fear'], sleep: 'Go to bed early and rise with the light — winter is for storing energy.',
    tea: 'Black sesame & warm raw milk, or ginger with red dates', ritual: { t: 'Kidney warming', steps: ['Soak your feet in hot water with ginger for 15 minutes.', 'Rub your lower back with warm palms until it glows.', 'Eat one warm, slow-cooked meal with bone broth.'] } },
  Spring: { el: 'Wood', han: '木', note: 'Season of the Liver: fresh greens, sprouts and wild herbs to move energy after winter.',
    emotion: ['Kindness & vision', 'Anger & frustration'], sleep: 'Rise a little earlier and take a brisk morning walk outside.',
    tea: 'Nettle & dandelion, or fresh mint', ritual: { t: 'Liver awakening', steps: ['Start the day with warm lemon water.', 'Stretch your sides and twist gently for 5 minutes.', 'Eat a handful of fresh spring greens or wild herbs.'] } },
  Summer: { el: 'Fire', han: '火', note: 'Season of the Heart: light, colourful, cooling fruit and raw vegetables.',
    emotion: ['Joy & connection', 'Restlessness'], sleep: 'Later nights are natural — rest in the hottest part of the day.',
    tea: 'Rose & hibiscus, or cooling chrysanthemum', ritual: { t: 'Heart opening', steps: ['Eat a fruit breakfast outdoors in the morning light.', 'Dance or laugh with someone you love.', 'End the day with a cool foot bath and slow breathing.'] } },
  'Late summer': { el: 'Earth', han: '土', note: 'Season of the Spleen: sweet, golden, grounding foods — corn, squash, ripe fruit.',
    emotion: ['Care & stability', 'Worry & overthinking'], sleep: 'Keep regular meal and sleep times — routine steadies the Spleen.',
    tea: 'Corn silk, or ginger & orange peel', ritual: { t: 'Grounding', steps: ['Walk barefoot on grass or earth for 10 minutes.', 'Eat warm, golden food at regular times.', 'Write down your worries, then close the notebook.'] } },
  Autumn: { el: 'Metal', han: '金', note: 'Season of the Lung: pears, roots and pungent warming spices to protect and moisten.',
    emotion: ['Clarity & letting go', 'Grief'], sleep: 'Sleep early, rise early — protect your breath from cold wind.',
    tea: 'Pear & ginger, or thyme with raw honey', ritual: { t: 'Letting go', steps: ['Take 10 deep breaths in fresh air every morning.', 'Declutter one drawer, closet or inbox.', 'Gently stew a pear with ginger and eat it warm.'] } },
};

export function countryRegion(code) { return (COUNTRIES.find(c => c[0] === code) || COUNTRIES[0])[2]; }
export function guessCountry() {
  const l = (navigator.language || 'de-DE').split('-');
  const code = (l[1] || '').toUpperCase();
  if (COUNTRIES.some(c => c[0] === code)) return code;
  return { de: 'DE', en: 'GB', fr: 'FR', es: 'ES', it: 'IT', nl: 'NL', pt: 'PT', el: 'GR', pl: 'PL', sv: 'SE', da: 'DK', nb: 'NO', tr: 'TR', cs: 'CZ' }[l[0]] || 'DE';
}
export function seasonal(code, month) {
  const region = countryRegion(code);
  return DATA[region].filter(([, , m]) => m.includes(month)).map(([f, kind]) => ({ f, kind, ...foodInfo(f, kind) }));
}
export function seasonName(code, month) {
  const m = countryRegion(code) === 'aus' ? ((month + 5) % 12) + 1 : month;
  return SEASON_N[m];
}

// Per-food details: TCM thermal nature, key nutrients, best cycle phases.
// nature: warm | neutral | cool. Phases: m=menstrual f=follicular o=ovulatory l=luteal.
const I = (nature, nut, ph) => ({ nature, nut, ph: ph.split('').map(c => ({ m: 'menstrual', f: 'follicular', o: 'ovulatory', l: 'luteal' })[c]) });
export const FOOD_INFO = {
  'turnip greens': I('warm', ['Calcium', 'Folate', 'Vitamin K'], 'mf'), 'cardoons': I('cool', ['Fibre', 'Magnesium', 'Folate'], 'l'),
  'octopus': I('neutral', ['Iron', 'Vitamin B12', 'Selenium'], 'm'), 'cuttlefish': I('neutral', ['Iron', 'Vitamin B12', 'Copper'], 'mf'),
  'red mullet': I('neutral', ['Omega-3', 'Vitamin D', 'Iodine'], 'fo'),
  'saskatoon berries': I('neutral', ['Iron', 'Manganese', 'Fibre'], 'mf'), 'wild blueberries': I('cool', ['Antioxidants', 'Vitamin C'], 'fo'),
  'haskap berries': I('cool', ['Vitamin C', 'Antioxidants'], 'f'), 'arctic char': I('warm', ['Omega-3', 'Vitamin D', 'Protein'], 'ml'),
  'atlantic lobster': I('warm', ['Zinc', 'Selenium', 'Copper'], 'fo'), 'pacific halibut': I('neutral', ['Protein', 'Selenium', 'Vitamin D'], 'ml'),
  'wild rice': I('neutral', ['Magnesium', 'Zinc', 'Fibre'], 'l'), 'snapper': I('neutral', ['Protein', 'Selenium', 'Omega-3'], 'ml'),
  'prawns': I('warm', ['Zinc', 'Iodine', 'Selenium'], 'fo'), 'feijoa': I('cool', ['Vitamin C', 'Fibre', 'Folate'], 'f'),
  'collards & mustard greens': I('warm', ['Calcium', 'Vitamin K', 'Folate'], 'mfl'), 'turnips & rutabaga': I('neutral', ['Vitamin C', 'Fibre'], 'l'),
  'beets': I('neutral', ['Iron', 'Folate', 'Nitrates'], 'm'), 'broccoli & cauliflower': I('neutral', ['Sulforaphane', 'Vitamin C'], 'fol'),
  'persimmon': I('cool', ['Vitamin A', 'Fibre', 'Manganese'], 'l'), 'avocado': I('neutral', ['Healthy fats', 'Potassium', 'Vitamin E'], 'ol'),
  'maple syrup': I('warm', ['Manganese', 'Zinc'], 'm'), 'dungeness crab': I('cool', ['Zinc', 'Vitamin B12', 'Selenium'], 'fo'),
  'spinach & silverbeet': I('cool', ['Iron', 'Magnesium', 'Folate'], 'ml'), 'sweet potatoes': I('neutral', ['Beta-carotene', 'Complex carbs', 'Vitamin B6'], 'l'),
  'kiwifruit': I('cool', ['Vitamin C', 'Fibre'], 'mf'), 'custard apple': I('neutral', ['Vitamin C', 'Vitamin B6', 'Magnesium'], 'l'),
  'mussels': I('warm', ['Iron', 'Vitamin B12', 'Omega-3'], 'm'),
  'kale': I('neutral', ['Calcium', 'Vitamin K', 'Iron'], 'mfo'), 'brussels sprouts': I('neutral', ['Fibre', 'Vitamin C', 'Sulforaphane'], 'ol'),
  'savoy & red cabbage': I('neutral', ['Vitamin C', 'Fibre'], 'ol'), 'cabbage': I('neutral', ['Vitamin C', 'Fibre'], 'ol'), 'leeks': I('warm', ['Prebiotic fibre', 'Folate'], 'ml'),
  'parsnips': I('warm', ['Complex carbs', 'Folate', 'Potassium'], 'l'), 'beetroot': I('neutral', ['Iron', 'Folate', 'Nitrates'], 'm'), 'carrots': I('neutral', ['Beta-carotene', 'Fibre'], 'fl'),
  'celeriac': I('neutral', ['Vitamin K', 'Potassium'], 'l'), 'salsify': I('neutral', ['Inulin', 'Iron'], 'm'), "lamb's lettuce": I('cool', ['Iron', 'Vitamin C', 'Folate'], 'mf'),
  'wild garlic': I('warm', ['Vitamin C', 'Allicin'], 'f'), 'rhubarb': I('cool', ['Calcium', 'Vitamin K'], 'f'), 'asparagus': I('cool', ['Folate', 'Prebiotic fibre'], 'fo'),
  'radishes': I('cool', ['Vitamin C'], 'ol'), 'spinach': I('cool', ['Iron', 'Magnesium', 'Folate'], 'ml'), 'lettuce': I('cool', ['Folate', 'Water'], 'o'),
  'kohlrabi': I('neutral', ['Vitamin C', 'Fibre'], 'fo'), 'peas': I('neutral', ['Protein', 'Fibre', 'Zinc'], 'f'), 'courgette': I('cool', ['Potassium', 'Water'], 'o'), 'zucchini': I('cool', ['Potassium', 'Water'], 'o'),
  'cucumber': I('cool', ['Water', 'Potassium'], 'o'), 'cucumbers': I('cool', ['Water', 'Potassium'], 'o'), 'tomatoes': I('cool', ['Lycopene', 'Vitamin C'], 'o'),
  'peppers': I('neutral', ['Vitamin C', 'Antioxidants'], 'mo'), 'green beans': I('neutral', ['Fibre', 'Folate'], 'f'), 'broccoli': I('neutral', ['Sulforaphane', 'Vitamin C', 'Calcium'], 'fo'),
  'cauliflower': I('neutral', ['Vitamin C', 'Choline'], 'o'), 'fennel': I('warm', ['Fibre', 'Potassium'], 'l'), 'sweetcorn': I('neutral', ['Fibre', 'B vitamins'], 'f'),
  'pumpkin & squash': I('warm', ['Beta-carotene', 'Magnesium'], 'lm'), 'pumpkin': I('warm', ['Beta-carotene', 'Magnesium'], 'lm'), 'pumpkin & winter squash': I('warm', ['Beta-carotene', 'Magnesium'], 'lm'),
  'new potatoes': I('neutral', ['Potassium', 'Vitamin B6'], 'l'), 'mushrooms & chanterelles': I('neutral', ['Vitamin D', 'B vitamins'], 'mf'), 'mushrooms': I('neutral', ['Vitamin D', 'B vitamins'], 'mf'),
  'strawberries': I('cool', ['Vitamin C', 'Folate'], 'fo'), 'cherries': I('warm', ['Melatonin', 'Antioxidants', 'Iron'], 'ml'), 'gooseberries & currants': I('cool', ['Vitamin C'], 'm'),
  'raspberries': I('neutral', ['Fibre', 'Vitamin C'], 'o'), 'blueberries': I('neutral', ['Antioxidants', 'Fibre'], 'fo'), 'apricots': I('warm', ['Beta-carotene', 'Iron'], 'm'),
  'plums': I('cool', ['Fibre', 'Antioxidants'], 'l'), 'blackberries': I('neutral', ['Fibre', 'Vitamin C'], 'o'), 'elderberries': I('neutral', ['Vitamin C', 'Antioxidants'], 'm'),
  'grapes': I('neutral', ['Antioxidants', 'Potassium'], 'f'), 'apples': I('cool', ['Fibre', 'Pectin'], 'fol'), 'pears': I('cool', ['Fibre', 'Potassium'], 'l'),
  'quince': I('warm', ['Fibre', 'Vitamin C'], 'm'), 'walnuts': I('warm', ['Omega-3', 'Magnesium'], 'mo'), 'chestnuts': I('warm', ['Complex carbs', 'Potassium'], 'ml'),
  'hazelnuts': I('neutral', ['Vitamin E', 'Magnesium'], 'f'), 'nettle': I('cool', ['Iron', 'Calcium', 'Magnesium'], 'mf'), 'dandelion greens': I('cool', ['Calcium', 'Vitamin K'], 'f'),
  'elderflower': I('cool', ['Flavonoids'], 'o'), 'rosehips': I('neutral', ['Vitamin C'], 'm'), 'sea buckthorn': I('neutral', ['Vitamin C', 'Omega-7'], 'fm'),
  'wild berries': I('neutral', ['Antioxidants', 'Vitamin C'], 'o'), 'chives': I('warm', ['Vitamin K'], 'f'), 'parsley': I('neutral', ['Vitamin C', 'Iron', 'Vitamin K'], 'm'),
  'dill': I('warm', ['Calcium'], 'l'), 'basil': I('warm', ['Vitamin K', 'Antioxidants'], 'o'), 'thyme & sage': I('warm', ['Antioxidants'], 'm'),
  'horseradish': I('warm', ['Vitamin C', 'Glucosinolates'], 'm'), 'jerusalem artichoke': I('neutral', ['Inulin', 'Iron'], 'm'), 'red & black radish': I('cool', ['Vitamin C'], 'l'),
  'spring onions': I('warm', ['Vitamin K'], 'f'), 'oranges & mandarins': I('cool', ['Vitamin C', 'Folate'], 'mf'), 'lemons': I('cool', ['Vitamin C'], 'm'),
  'artichokes': I('neutral', ['Fibre', 'Folate'], 'o'), 'chard': I('cool', ['Magnesium', 'Iron', 'Vitamin K'], 'ml'), 'broad beans': I('neutral', ['Protein', 'Folate', 'Iron'], 'f'),
  'peaches & nectarines': I('warm', ['Vitamin C', 'Beta-carotene'], 'o'), 'peaches & plums': I('warm', ['Vitamin C', 'Beta-carotene'], 'o'), 'melon & watermelon': I('cool', ['Water', 'Potassium'], 'o'),
  'watermelon': I('cool', ['Water', 'Potassium'], 'o'), 'aubergine': I('cool', ['Fibre', 'Antioxidants'], 'o'), 'figs': I('neutral', ['Calcium', 'Fibre'], 'l'),
  'pomegranate': I('warm', ['Antioxidants', 'Vitamin C'], 'mo'), 'persimmon': I('cool', ['Beta-carotene', 'Fibre'], 'l'), 'almonds': I('neutral', ['Magnesium', 'Calcium', 'Vitamin E'], 'l'),
  'olives': I('neutral', ['Healthy fats', 'Vitamin E'], 'f'), 'wild greens': I('cool', ['Calcium', 'Iron'], 'f'), 'wild fennel': I('warm', ['Fibre'], 'l'),
  'prickly pear': I('cool', ['Magnesium', 'Vitamin C'], 'o'), 'rosemary & oregano': I('warm', ['Antioxidants'], 'm'), 'mint': I('cool', ['Menthol'], 'l'),
  'loquat': I('cool', ['Beta-carotene'], 'o'), 'sweet potatoes': I('warm', ['Beta-carotene', 'Vitamin B6', 'Complex carbs'], 'lm'), 'root vegetables': I('warm', ['Complex carbs', 'Potassium'], 'lm'),
  'citrus': I('cool', ['Vitamin C', 'Folate'], 'mf'), 'rhubarb ': I('cool', ['Calcium'], 'f'), 'cranberries': I('neutral', ['Vitamin C', 'Proanthocyanidins'], 'f'),
  'pecans & walnuts': I('warm', ['Omega-3', 'Magnesium', 'Zinc'], 'ml'), 'ramps (wild leeks)': I('warm', ['Vitamin C', 'Iron'], 'f'), 'fiddleheads': I('neutral', ['Omega-3', 'Iron'], 'f'),
  'morels': I('neutral', ['Vitamin D', 'Iron'], 'm'), 'parsley & cilantro': I('neutral', ['Vitamin C', 'Iron'], 'm'), 'parsley & coriander': I('neutral', ['Vitamin C', 'Iron'], 'm'),
  'raw honey': I('neutral', ['Enzymes', 'Antioxidants'], 'mfol'), 'mango': I('warm', ['Vitamin C', 'Beta-carotene'], 'o'), 'stone fruit': I('warm', ['Vitamin C', 'Beta-carotene'], 'o'),
  'berries': I('neutral', ['Antioxidants', 'Fibre'], 'fo'), 'feijoa': I('neutral', ['Vitamin C', 'Fibre'], 'f'), 'broccoli & cauliflower': I('neutral', ['Sulforaphane', 'Vitamin C'], 'fo'),
  'peas & broad beans': I('neutral', ['Protein', 'Folate'], 'f'), 'avocado': I('neutral', ['Healthy fats', 'Potassium', 'Folate'], 'fl'), 'macadamias': I('neutral', ['Healthy fats', 'Magnesium'], 'l'),
  'passionfruit': I('cool', ['Fibre', 'Vitamin C'], 'o'),
  'venison & wild boar': I('warm', ['Heme iron', 'Zinc', 'B12'], 'ml'), 'venison': I('warm', ['Heme iron', 'Zinc', 'B12'], 'ml'), 'wild boar': I('warm', ['Heme iron', 'Zinc'], 'ml'),
  'goose & duck': I('neutral', ['Iron', 'Healthy fats'], 'm'), 'carp': I('neutral', ['Protein', 'Vitamin D'], 'l'), 'trout & char': I('warm', ['Omega-3', 'Vitamin D'], 'fo'),
  'matjes herring': I('neutral', ['Omega-3', 'Vitamin D', 'B12'], 'fo'), 'mussels': I('warm', ['Iron', 'B12', 'Zinc'], 'm'), 'oysters': I('cool', ['Zinc', 'B12', 'Iron'], 'fo'),
  'spring lamb': I('warm', ['Heme iron', 'Zinc', 'B12'], 'ml'), 'grass-fed raw milk & butter': I('neutral', ['Calcium', 'Vitamin A', 'K2'], 'lf'), 'pasture eggs': I('neutral', ['Choline', 'Vitamin D', 'Protein'], 'mfol'),
  'sardines': I('neutral', ['Omega-3', 'Calcium', 'Vitamin D'], 'ol'), 'anchovies': I('warm', ['Omega-3', 'Calcium'], 'o'), 'bluefin tuna': I('neutral', ['Omega-3', 'Selenium'], 'o'),
  'fresh sheep & goat cheese': I('neutral', ['Calcium', 'Protein'], 'l'), 'wild salmon': I('warm', ['Omega-3', 'Vitamin D', 'Astaxanthin'], 'mfol'), 'halibut': I('neutral', ['Protein', 'Selenium'], 'f'),
  'turkey': I('neutral', ['Vitamin B6', 'Tryptophan'], 'l'),
  'samphire': I('cool', ['Iodine', 'Minerals'], 'o'), 'watercress': I('cool', ['Vitamin K', 'Calcium', 'Iron'], 'mf'), 'purple sprouting broccoli': I('neutral', ['Sulforaphane', 'Vitamin C'], 'f'),
  'damsons': I('cool', ['Antioxidants', 'Fibre'], 'l'), 'lingonberries': I('neutral', ['Vitamin C', 'Antioxidants'], 'f'), 'cloudberries': I('neutral', ['Vitamin C', 'Vitamin E'], 'o'),
  'bilberries': I('neutral', ['Anthocyanins', 'Vitamin C'], 'fo'), 'mackerel': I('warm', ['Omega-3', 'Vitamin D', 'B12'], 'mfol'), 'cod': I('neutral', ['Protein', 'Iodine'], 'f'),
  'crab & langoustine': I('cool', ['Zinc', 'Iodine'], 'o'), 'snapper': I('neutral', ['Protein', 'Selenium'], 'f'), 'prawns': I('warm', ['Zinc', 'Iodine'], 'o'),
};
export function foodInfo(name, kind) {
  return FOOD_INFO[name.toLowerCase()] || { nature: kind === 'fruit' ? 'cool' : kind === 'herb' ? 'warm' : 'neutral', nut: [], ph: [] };
}

// Seasonal dish ideas. `keys` = seasonal foods the dish is built on (each entry: alternatives as regex);
// `extra` = pantry staples. Built on natural whole food: raw-first, warm when the body needs it,
// no oats, no tofu, few grains, raw dairy welcome.
const D = (name, warm, keys, extra, how) => ({ name, warm, keys, extra, how });
export const SEASON_DISHES = [
  D('Roasted Root Bowl with Herb Butter', true, ['parsnip', 'carrot', 'beetroot', 'celeriac|jerusalem'], ['Butter or ghee', 'Thyme', 'Walnuts', 'Sea salt'], 'Roast the roots at 200 °C for 35 minutes, toss with melted herb butter and toasted walnuts.'),
  D('Kale, Leek & Bone Broth Soup', true, ['kale|cabbage', 'leek', 'carrot'], ['Bone broth', 'Garlic', 'Pasture egg'], 'Soften leeks in butter, add carrots and broth, simmer 15 minutes, stir in kale and finish with a soft egg.'),
  D('Pumpkin & Ginger Soup with Raw Cream', true, ['pumpkin|squash'], ['Fresh ginger', 'Bone broth', 'Raw cream', 'Pumpkin seeds'], 'Simmer pumpkin with ginger in broth until soft, blend, swirl in raw cream and top with seeds.'),
  D('Baked Apples & Pears with Walnuts', true, ['apple', 'pear|quince'], ['Walnuts', 'Cinnamon', 'Raw honey', 'Raw cream'], 'Bake the fruit with walnuts and cinnamon at 180 °C for 25 minutes; drizzle with raw honey and cream.'),
  D('Butter-Roasted Brussels Sprouts & Chestnuts', true, ['brussels', 'chestnut'], ['Butter', 'Sea salt', 'Lemon'], 'Halve the sprouts, roast with chestnuts and butter until golden and crisp-edged.'),
  D('Warm Spiced Plums with Raw Cream', true, ['plum'], ['Cinnamon', 'Star anise', 'Raw cream'], 'Gently stew halved plums with spices for 10 minutes, serve warm with cold raw cream.'),
  D('Beef & Root Winter Stew', true, ['beetroot|parsnip', 'carrot', 'celeriac|leek'], ['Grass-fed beef', 'Bone broth', 'Bay leaf'], 'Brown the beef, add roots and broth, cover and simmer low for 90 minutes.'),
  D('Asparagus with Soft Eggs & Wild Garlic Butter', true, ['asparagus', 'wild garlic|chive|spring onion'], ['Pasture eggs', 'Butter'], 'Steam asparagus 4 minutes, top with soft-boiled eggs and melted wild-garlic butter.'),
  D('Spring Nettle & Spinach Soup', true, ['nettle|wild greens|dandelion', 'spinach|chard'], ['Bone broth', 'Spring onion', 'Raw cream'], 'Wilt the greens in hot broth (gloves for nettles!), blend and finish with raw cream.'),
  D('Warm Rhubarb & Strawberry Compote', true, ['rhubarb', 'strawberr'], ['Raw honey', 'Vanilla', 'Raw yoghurt'], 'Simmer rhubarb with honey for 8 minutes, fold in strawberries, spoon over yoghurt.'),
  D('Summer Vegetable Stew', true, ['courgette|zucchini', 'tomato', 'pepper|aubergine'], ['Olive oil', 'Garlic', 'Basil'], 'Slowly stew the vegetables in olive oil and garlic for 30 minutes; finish with basil.'),
  D('Mushroom & Leek Ragout with Egg', true, ['mushroom|morel', 'leek|spring onion'], ['Butter', 'Thyme', 'Pasture egg'], 'Brown mushrooms in butter, add leeks and thyme, top with a fried egg.'),
  D('Braised Fish with Fennel & Citrus', true, ['fennel|wild fennel', 'orange|citrus|lemon'], ['Wild white fish', 'Olive oil', 'Olives'], 'Braise sliced fennel with citrus juice, nestle the fish on top and cook covered 10 minutes.'),
  D('Sweet Potato & Cranberry Bake', true, ['sweet potato', 'cranberr'], ['Butter', 'Cinnamon', 'Pecans'], 'Roast sweet potato wedges, add cranberries and pecans for the last 10 minutes.'),
  D('Shaved Fennel, Apple & Walnut Salad', false, ['fennel', 'apple', 'walnut|hazelnut'], ['Lemon', 'Olive oil', 'Raw cheese'], 'Shave fennel and apple thinly, toss with lemon, oil and nuts.'),
  D('Kohlrabi & Radish Slaw with Kefir Dill', false, ['kohlrabi', 'radish', 'dill|chive'], ['Kefir', 'Lemon', 'Sea salt'], 'Julienne kohlrabi and radish, dress with kefir, lemon and herbs.'),
  D('Berry & Raw Milk Bowl', false, ['strawberr|raspberr|blueberr|^berries|blackberr|wild berr'], ['Raw milk or kefir', 'Chia', 'Raw honey'], 'Blend half the berries with raw milk, pour over chia, top with whole berries.'),
  D('Tomato, Cucumber & Basil Salad', false, ['tomato', 'cucumber', 'basil|mint'], ['Olive oil', 'Sea salt', 'Raw cheese'], 'Chop, salt, dress with good olive oil — summer in a bowl.'),
  D('Raw Carrot & Beet Salad', false, ['carrot', 'beetroot'], ['Lemon', 'Pumpkin seeds', 'Olive oil'], 'Grate both, dress with lemon and oil, finish with pumpkin seeds.'),
  D("Lamb's Lettuce, Pear & Hazelnut Salad", false, ["lamb's lettuce|spinach|lettuce", 'pear|apple', 'hazelnut|walnut'], ['Raw cheese', 'Apple cider vinegar', 'Olive oil'], 'Toss leaves with sliced pear, toasted nuts and crumbled raw cheese.'),
  D('Peaches with Raw Cream & Mint', false, ['peach|apricot|stone fruit', 'mint|basil'], ['Raw cream', 'Raw honey'], 'Slice ripe fruit, spoon over raw cream, scatter mint and a drizzle of honey.'),
  D('Watermelon, Cucumber & Mint', false, ['watermelon|melon', 'cucumber', 'mint'], ['Lime', 'Sea salt'], 'Cube, squeeze lime, pinch of salt — instantly hydrating.'),
  D('Citrus & Pomegranate Salad', false, ['orange|citrus|mandarin', 'pomegranate'], ['Mint', 'Olive oil', 'Almonds'], 'Slice citrus into rounds, scatter pomegranate, mint and almonds.'),
  D('Spinach, Strawberry & Asparagus Salad', false, ['spinach|lettuce', 'strawberr', 'asparagus'], ['Lemon', 'Olive oil', 'Raw cheese'], 'Shave raw asparagus, toss with leaves and halved strawberries.'),
  D('Cherries & Raw Yoghurt Bowl', false, ['cherr'], ['Raw yoghurt or kefir', 'Almonds', 'Raw cacao nibs'], 'Pit cherries, layer with yoghurt, almonds and cacao nibs.'),
  D('Courgette Ribbons with Basil & Lemon', false, ['courgette|zucchini', 'basil|mint'], ['Lemon', 'Olive oil', 'Pumpkin seeds'], 'Peel courgette into ribbons, dress with lemon, oil, herbs and seeds.'),
  D('Figs with Raw Honey & Walnuts', false, ['fig', 'walnut|almond|hazelnut|macadamia'], ['Raw honey', 'Raw cream'], 'Quarter the figs, drizzle honey, add nuts and a spoon of cream.'),
  D('Mango & Avocado Salad', false, ['mango', 'avocado'], ['Lime', 'Coriander', 'Chili'], 'Cube both, squeeze lime, add herbs and a little chili.'),
  D('Artichokes with Lemon Butter', true, ['artichoke', 'lemon|orange'], ['Butter', 'Garlic', 'Sea salt'], 'Steam whole artichokes 30 minutes; dip the leaves in warm lemon-garlic butter.'),
  D('Orange, Fennel & Olive Salad', false, ['orange|citrus|mandarin', 'fennel|wild fennel'], ['Olives', 'Olive oil', 'Mint'], 'Slice oranges and fennel thinly, add olives and a glug of good oil.'),
  D('Warm Chard with Garlic & Lemon', true, ['chard|spinach|wild greens|turnip green', 'lemon|orange'], ['Olive oil', 'Garlic', 'Pine nuts'], 'Sauté greens with garlic for 3 minutes, finish with lemon and toasted pine nuts.'),
  D('Venison & Root Vegetable Stew', true, ['venison|wild boar', 'carrot|parsnip|celeriac|root'], ['Bone broth', 'Juniper', 'Red cabbage'], 'Brown the meat, add roots, broth and juniper; braise covered for 2 hours.'),
  D('Mussels in Garlic Broth', true, ['mussels'], ['Bone broth', 'Garlic', 'Parsley', 'Butter'], 'Steam mussels in garlicky broth with butter for 5 minutes until they open; finish with parsley.'),
  D('Matjes with Apple & Onion', false, ['matjes|herring', 'apple'], ['Red onion', 'Raw cream or kefir', 'Dill'], 'Slice apple and onion, fold into soured raw cream with dill, serve with the herring.'),
  D('Oysters with Lemon', false, ['oyster'], ['Lemon', 'Black pepper'], 'Shuck, squeeze lemon, eat fresh — the richest food source of zinc.'),
  D('Spring Lamb with Wild Herbs', true, ['spring lamb', 'wild garlic|parsley|thyme|rosemary|mint|chive'], ['Butter', 'Garlic', 'Lemon'], 'Roast the lamb with herbs and garlic; rest, then slice with a herb butter.'),
  D('Grilled Sardines with Lemon & Herbs', true, ['sardine|anchov', 'lemon|parsley|rosemary|basil'], ['Olive oil', 'Sea salt'], 'Grill whole sardines 2–3 minutes per side; finish with lemon, herbs and good oil.'),
  D('Wild Salmon with Summer Greens', true, ['salmon', 'zucchini|courgette|peas|spinach|asparagus'], ['Butter', 'Lemon', 'Dill'], 'Pan-sear the salmon in butter, serve on lightly wilted seasonal greens.'),
  D('Pan-Fried Mackerel with Dill Butter', true, ['mackerel', 'dill|chive|parsley'], ['Butter', 'Lemon', 'New potatoes'], 'Fry the mackerel skin-side down until crisp, spoon over melted dill butter.'),
  D('Wild Berries with Raw Cream', false, ['bilberr|cloudberr|lingonberr|wild berr'], ['Raw cream', 'Raw honey'], 'A bowl of just-picked berries, cold raw cream and a thread of honey.'),
  D('Braised Collards with Bone Broth', true, ['collard|kale|cabbage'], ['Bone broth', 'Pastured bacon', 'Garlic', 'Apple cider vinegar'], 'Crisp the bacon, add garlic and greens, pour in broth and braise 20 minutes; finish with a splash of vinegar.'),
  D('Roasted Turnips & Carrots with Maple Butter', true, ['turnip|parsnip|root', 'carrot|beet'], ['Butter', 'Maple syrup or raw honey', 'Thyme'], 'Roast the roots at 200 °C for 30 minutes, toss in melted butter with a little maple and thyme.'),
  D('Crab with Warm Lemon Butter', true, ['crab'], ['Butter', 'Lemon', 'Parsley'], 'Steam the crab 12–15 minutes, crack, and dip in melted lemon-parsley butter.'),
  D('Winter Citrus & Avocado Salad', false, ['citrus|orange|mandarin', 'avocado'], ['Olive oil', 'Sea salt', 'Mint'], 'Slice citrus into rounds, fan out avocado, salt, oil and mint.'),
  D('Persimmon & Pomegranate with Raw Yoghurt', false, ['persimmon', 'pomegranate'], ['Raw yoghurt or kefir', 'Raw honey'], 'Slice ripe persimmon, scatter pomegranate seeds, spoon over yoghurt.'),
  D('Leek & Silverbeet Soup with Raw Cream', true, ['leek', 'spinach|silverbeet|chard'], ['Bone broth', 'Butter', 'Raw cream', 'Nutmeg'], 'Soften leeks in butter, add broth and greens, simmer 10 minutes, blend and swirl in raw cream.'),
  D('Kiwi & Mandarin Bowl with Kefir', false, ['kiwi', 'citrus|mandarin'], ['Raw kefir', 'Raw honey', 'Pumpkin seeds'], 'Slice the fruit over cold kefir, drizzle honey, sprinkle seeds.'),
  D('Sweet Potato, Leek & Fennel Bake', true, ['sweet potato', 'fennel|leek'], ['Butter', 'Raw cheese', 'Thyme'], 'Layer thin slices in a buttered dish, top with raw cheese, bake 40 minutes at 190 °C.'),
  D('Custard Apple with Raw Cream', false, ['custard apple'], ['Raw cream', 'Lime'], 'Halve, scoop the creamy flesh (spit out the seeds), add a squeeze of lime and raw cream.'),
  D('Chestnut & Mushroom Soup', true, ['chestnut', 'mushroom'], ['Bone broth', 'Butter', 'Thyme', 'Raw cream'], 'Brown mushrooms in butter, add peeled chestnuts and broth, simmer 20 minutes, blend smooth.'),
  D('Wild Garlic & Nettle Soup', true, ['wild garlic', 'nettle'], ['Bone broth', 'Butter', 'Raw cream'], 'Wilt nettle tips (gloves!) and wild garlic in hot broth for 3 minutes, blend, finish with cream.'),
  D('Purple Sprouting Broccoli with Soft Eggs', true, ['purple sprouting'], ['Pasture eggs', 'Butter', 'Lemon'], 'Steam the spears 4 minutes, top with soft-boiled eggs, brown butter and lemon.'),
  D('Whole Baked Snapper with Lemon & Herbs', true, ['snapper', 'lemon|citrus|parsley|coriander|basil'], ['Butter', 'Garlic', 'Sea salt'], 'Stuff the fish with lemon and herbs, bake at 200 °C for 20–25 minutes, spoon over the buttery juices.'),
  D('Garlic Butter Prawns', true, ['prawn'], ['Butter', 'Garlic', 'Chili', 'Lemon'], 'Sizzle garlic in butter, add prawns for 2 minutes per side until pink, finish with lemon.'),
  D('Feijoa & Passionfruit with Kefir', false, ['feijoa', 'passionfruit'], ['Raw kefir', 'Raw honey'], 'Scoop feijoa and passionfruit over cold kefir, a thread of honey on top.'),
  D('Pan-Seared Arctic Char with Wild Rice', true, ['arctic char|halibut', 'wild rice|leek|carrot'], ['Butter', 'Dill', 'Lemon'], 'Sear the fish skin-side down in butter until crisp; serve over buttered wild rice or soft leeks.'),
  D('Lobster with Brown Butter', true, ['lobster'], ['Butter', 'Lemon', 'Chives'], 'Boil the lobster 8–10 minutes, crack, dip in nutty brown butter with lemon.'),
  D('Saskatoon & Wild Blueberry Bowl', false, ['saskatoon|wild blueberr|haskap|blueberr'], ['Raw cream or kefir', 'Raw honey', 'Pumpkin seeds'], 'Heap the berries in a bowl, pour over cold raw cream, honey and seeds.'),
  D('Octopus with Lemon, Olive Oil & Paprika', true, ['octopus', 'lemon|orange|parsley'], ['Olive oil', 'Smoked paprika', 'Sea salt'], 'Simmer the octopus gently for 50 minutes until tender, slice, dress warm with oil, lemon and paprika.'),
  D('Cuttlefish with Spring Peas', true, ['cuttlefish', 'peas|broad beans'], ['Olive oil', 'Garlic', 'Mint'], 'Sauté cuttlefish strips in olive oil and garlic, add peas and a splash of water, cook 10 minutes, finish with mint.'),
  D('Pan-Fried Red Mullet with Fennel', true, ['red mullet', 'fennel|lemon|orange'], ['Olive oil', 'Sea salt'], 'Fry the fillets skin-side down 3 minutes until crisp; serve on thinly sliced fennel with citrus.'),
  D('Slow-Braised Cardoons with Butter & Lemon', true, ['cardoon', 'lemon|orange'], ['Butter', 'Bone broth', 'Raw cheese'], 'Peel and cut the cardoons, braise in broth 40 minutes until tender, finish with butter, lemon and grated raw cheese.'),
  D('Radishes with Butter & Sea Salt', false, ['radish'], ['Raw butter', 'Flaky sea salt', 'Chives'], 'Dip crisp radishes in soft raw butter, then in salt — the classic French spring snack.'),
  D('Herb Omelette with Spring Onions', true, ['spring onion|chive|wild garlic', 'parsley|dill|chive|spinach'], ['Pasture eggs', 'Butter', 'Raw cheese'], 'Whisk eggs with chopped herbs, cook gently in butter, fold over grated raw cheese.'),
  D('Watercress, Egg & Radish Salad', false, ['watercress', 'radish'], ['Pasture eggs', 'Olive oil', 'Lemon'], 'Toss peppery watercress with sliced radish, halved soft eggs, oil and lemon.'),
  D('Trout with Wild Garlic Butter', true, ['trout', 'wild garlic|chive|parsley|dill'], ['Butter', 'Lemon', 'Sea salt'], 'Pan-fry the trout in butter 3–4 minutes a side, spoon over melted herb butter and lemon.'),
  D('Gazpacho', false, ['tomato', 'cucumber', 'pepper'], ['Olive oil', 'Garlic', 'Sherry vinegar', 'Sea salt'], 'Blend ripe tomatoes, cucumber, pepper and garlic with oil and vinegar until silky; chill — no bread needed.'),
  D('Grilled Aubergine with Raw Yoghurt & Mint', true, ['aubergine', 'mint|basil'], ['Raw yoghurt', 'Olive oil', 'Garlic'], 'Grill thick aubergine slices until soft and charred, top with garlicky yoghurt and torn mint.'),
  D('Melon with Raw Cheese & Mint', false, ['melon', 'mint|basil'], ['Raw sheep cheese', 'Black pepper', 'Olive oil'], 'Slice ripe melon, crumble over raw cheese, scatter mint and a crack of pepper.'),
  D('Broad Beans with Fresh Goat Cheese & Mint', false, ['broad beans|peas', 'goat cheese|mint'], ['Lemon', 'Olive oil'], 'Pop young beans from their skins, toss with crumbled fresh cheese, mint, lemon and oil.'),
  D('Sautéed Courgette with Garlic & Basil', true, ['zucchini|courgette', 'basil|parsley|mint'], ['Butter or olive oil', 'Garlic', 'Raw cheese'], 'Slice and sauté in butter with garlic 5 minutes until golden, finish with torn basil and grated raw cheese.'),
  D('Summer Shakshuka', true, ['tomato', 'pepper|zucchini|courgette|basil'], ['Pasture eggs', 'Olive oil', 'Cumin', 'Raw yoghurt'], 'Stew tomatoes and peppers with cumin 15 minutes, crack in eggs, cover until just set; spoon over yoghurt.'),
  D('Sweetcorn with Herb Butter', true, ['sweetcorn'], ['Butter', 'Chives or basil', 'Sea salt'], 'Boil or grill the cobs 6–8 minutes, roll in soft herb butter and salt.'),
  D('Ginger-Poached Stone Fruit', true, ['stone fruit|peach|apricot|plum|cherr'], ['Fresh ginger', 'Cinnamon', 'Raw honey', 'Raw cream'], 'Poach halved fruit with ginger and cinnamon 8 minutes — warming for your period, sweet for summer.'),
  D('Warm Pea & Mint Soup', true, ['peas', 'mint|basil|parsley'], ['Bone broth', 'Butter', 'Raw cream'], 'Simmer peas in broth 5 minutes, blend with mint and butter, swirl in raw cream.'),
  D('Grapes, Raw Cheese & Walnuts', false, ['grape', 'walnut|hazelnut'], ['Raw cheese'], 'A simple autumn plate — perfect afternoon snack.'),
];
export function dishesFor(items) {
  const names = items.map(i => i.f.toLowerCase());
  const has = alt => names.some(n => new RegExp(alt).test(n));
  return SEASON_DISHES.map(d => {
    const hit = d.keys.filter(has);
    return { ...d, hit, score: hit.length / d.keys.length, used: items.filter(i => d.keys.some(k => new RegExp(k).test(i.f.toLowerCase()))) };
  }).filter(d => d.score >= .66 && has(d.keys[0])).sort((a, b) => b.score - a.score); // main ingredient must be in season
}

// Whole-year view: every food of the region with its in-season months.
export function yearTable(code) {
  return DATA[countryRegion(code)].map(([f, kind, m]) => ({ f, kind, months: m, ...foodInfo(f, kind) }));
}

const MN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// "Sep – Mar" style label for a (possibly wrapping) list of months.
export function monthRange(months) {
  if (months.length >= 12) return 'All year';
  const set = new Set(months);
  let start = months.find(m => !set.has(m === 1 ? 12 : m - 1)) ?? months[0];
  let end = start; while (set.has(end === 12 ? 1 : end + 1) && (end === 12 ? 1 : end + 1) !== start) end = end === 12 ? 1 : end + 1;
  return start === end ? MN[start - 1] : `${MN[start - 1]} – ${MN[end - 1]}`;
}
export function nextSeasonStart(months, from) {
  for (let k = 1; k <= 12; k++) { const m = ((from - 1 + k) % 12) + 1; if (months.includes(m)) return MN[m - 1]; }
  return null;
}
