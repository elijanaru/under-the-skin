// Content library: phases, workouts, recipes, articles, log options.

export const PHASE_ORDER = ['menstrual', 'follicular', 'ovulatory', 'luteal'];

// Phase colors for dark surfaces and for light (white) surfaces.
export const PHASE_COLOR = {
  dark:  { menstrual: '#eba4a6', follicular: '#9fcf8c', ovulatory: '#ffd66b', luteal: '#b994f0' },
  light: { menstrual: '#b5666e', follicular: '#5f9a4c', ovulatory: '#c99412', luteal: '#7a4fc0' },
};

export const PHASES = {
  menstrual: {
    name: 'Menstrual',
    season: 'Inner winter',
    tagline: 'Rest, release, reset.',
    hormones: 'Estrogen and progesterone are at their lowest, which signals your uterine lining to shed. Low hormones can mean lower energy and a quieter, more inward mind — your body is doing real work.',
    superpower: { title: 'Reflection', text: 'A natural moment to look back on the past month, notice what is working and set gentle intentions.' },
    nourish: { title: 'Replenish & warm', text: 'Rebuild iron and minerals lost through bleeding. Warm, cooked, comforting meals feel best.' },
    foods: ['Lentils', 'Spinach', 'Grass-fed beef', 'Dark chocolate', 'Beetroot', 'Ginger tea', 'Bone broth', 'Kidney beans'],
    nutrients: ['Iron', 'Vitamin C', 'Magnesium', 'Omega-3'],
    mind: { title: 'Review & plan', text: 'Journal, review goals, plan the month ahead. Keep your calendar light and say no to extras.' },
    social: { title: 'Cosy & close', text: 'Low-key plans, solo time, a night in with someone who feels easy.' },
    selfcare: { title: 'Comfort first', text: 'Heat on your belly, early nights, warm baths, magnesium before bed.' },
    affirmation: 'Slowing down is how I come back to myself.',
  },
  follicular: {
    name: 'Follicular',
    season: 'Inner spring',
    tagline: 'Fresh energy, new ideas.',
    hormones: 'A new egg starts to ripen and estrogen begins to climb. Rising estrogen lifts mood, energy and motivation, and supports muscle building — a great window to start something new.',
    superpower: { title: 'Creativity', text: 'Curiosity is high and new things feel exciting. Brainstorm, learn, experiment.' },
    nourish: { title: 'Fresh & light', text: 'Lean protein, fermented foods and lots of fresh produce to support rising estrogen.' },
    foods: ['Eggs', 'Avocado', 'Raw sauerkraut', 'Broccoli', 'Citrus', 'Sprouts', 'Chicken', 'Flax seeds'],
    nutrients: ['B vitamins', 'Zinc', 'Probiotics', 'Vitamin E'],
    mind: { title: 'Start & brainstorm', text: 'Kick off projects, map out ideas, tackle the things that need fresh thinking.' },
    social: { title: 'Say yes', text: 'Meet new people, try the new spot, plan the trip.' },
    selfcare: { title: 'Try something new', text: 'New skincare, a new route for your walk, a new playlist.' },
    affirmation: 'I am allowed to begin again, as many times as I want.',
  },
  ovulatory: {
    name: 'Ovulatory',
    season: 'Inner summer',
    tagline: 'Magnetic, bold, bright.',
    hormones: 'Estrogen peaks, your egg is released and testosterone gets a small boost. Many women feel their most energetic, confident and social — and communication flows easily.',
    superpower: { title: 'Communication', text: 'Confidence and social energy often peak. Many women enjoy pitching, presenting and honest conversations now.' },
    nourish: { title: 'Fibre & antioxidants', text: 'Fibre and cruciferous veg help your body clear excess estrogen. Lighter meals feel great.' },
    foods: ['Berries', 'Cucumber', 'Asparagus', 'Salmon', 'Almonds', 'Leafy greens', 'Tomatoes', 'Brussels sprouts'],
    nutrients: ['Fibre', 'Antioxidants', 'Glutathione', 'Zinc'],
    mind: { title: 'Speak up', text: 'Negotiate, present, record content, have the conversation you have been putting off.' },
    social: { title: 'Be seen', text: 'Dates, events, collaborations, big group plans.' },
    selfcare: { title: 'Glow & show up', text: 'Skin often looks its best now — the perfect week for photos.' },
    affirmation: 'My energy is magnetic and my voice matters.',
  },
  luteal: {
    name: 'Luteal',
    season: 'Inner autumn',
    tagline: 'Grounded, focused, nesting.',
    hormones: 'Progesterone rises to its peak, which is calming but can slow digestion and raise body temperature. Late in this phase both hormones fall, which can bring PMS, cravings and a shorter fuse.',
    superpower: { title: 'Focus & detail', text: 'A great time to finish what you started, organise and get through detail-heavy work.' },
    nourish: { title: 'Steady & satisfying', text: 'Your metabolism rises slightly. Complex carbs, magnesium and B6 help keep blood sugar and mood steady.' },
    foods: ['Sweet potato', 'Pumpkin seeds', 'Squash', 'Chickpeas', 'Bananas', 'Dark chocolate', 'Turkey', 'Sunflower seeds'],
    nutrients: ['Magnesium', 'Vitamin B6', 'Calcium', 'Slow carbs'],
    mind: { title: 'Finish & organise', text: 'Wrap up projects, admin, editing, cleaning out your inbox and your space.' },
    social: { title: 'Inner circle', text: 'Keep plans with your closest people and protect your boundaries.' },
    selfcare: { title: 'Soften the edges', text: 'Go easy on salt, prioritise sleep, go easy on yourself.' },
    affirmation: 'I can hold boundaries and softness at the same time.',
  },
};

export const RECIPES = [
  {
    id: 'iron-lentil-soup', name: 'Iron Glow Lentil Soup', phases: ['menstrual'], time: 35, kcal: 420, meal: 'Dinner',
    nutrients: ['Iron', 'Fibre', 'Vitamin C'],
    ingredients: ['1 cup red lentils', '1 onion, diced', '2 garlic cloves', '1 tbsp fresh ginger', '1 tsp turmeric', '400 ml coconut milk', '700 ml vegetable broth', '2 handfuls spinach', '½ lemon'],
    steps: ['Soften onion, garlic and ginger in a little olive oil for 5 minutes.', 'Add turmeric, lentils, coconut milk and broth. Simmer 20 minutes.', 'Stir in spinach until wilted.', 'Finish with lemon juice — vitamin C helps you absorb the iron.'],
  },
  {
    id: 'cacao-beet-smoothie', name: 'Cacao Beet Smoothie', phases: ['luteal'], time: 5, kcal: 310, meal: 'Breakfast',  raw: true,
    nutrients: ['Magnesium', 'Iron', 'Potassium'],
    ingredients: ['1 small cooked beetroot', '1 ripe banana (not frozen)', '1 tbsp raw cacao', '1 tbsp almond butter', '250 ml almond or homemade nut milk', 'Pinch of cinnamon'],
    steps: ['Blend everything until smooth.', 'Top with cacao nibs or pumpkin seeds for extra magnesium.'],
  },
  {
    id: 'spring-green-bowl', name: 'Spring Green Bowl', phases: ['follicular'], time: 20, kcal: 480, meal: 'Lunch',
    nutrients: ['Protein', 'Probiotics', 'B vitamins'],
    ingredients: ['2 soft-boiled eggs', '½ avocado', '3 tbsp kimchi', '1 cup broccoli florets', '1 handful sprouts', '1 tbsp flax seeds', 'Lemon & tahini dressing'],
    steps: ['Steam broccoli for 4 minutes.', 'Boil eggs for 6½ minutes, then cool and peel.', 'Build the bowl with sprouts, broccoli, avocado, kimchi and eggs.', 'Sprinkle flax and drizzle with dressing.'],
  },
  {
    id: 'citrus-salmon-salad', name: 'Citrus Salmon Salad', phases: ['follicular', 'ovulatory'], time: 25, kcal: 520, meal: 'Dinner',
    nutrients: ['Omega-3', 'Vitamin C', 'Protein'],
    ingredients: ['1 salmon fillet', '1 orange, segmented', 'Mixed leaves', '½ fennel bulb, shaved', '10 almonds', 'Olive oil, lemon, honey dressing'],
    steps: ['Roast salmon at 200°C for 12–14 minutes.', 'Toss leaves, fennel and orange with dressing.', 'Flake salmon over the top and finish with almonds.'],
  },
  {
    id: 'berry-quinoa-bowl', name: 'Raw Berry Chia Bowl', phases: ['ovulatory', 'follicular'], time: 10, kcal: 360, meal: 'Breakfast', raw: true,
    nutrients: ['Antioxidants', 'Fibre', 'Protein'],
    ingredients: ['3 tbsp chia seeds', '200 ml raw milk or almond milk', '1 cup mixed berries', '1 tbsp hemp seeds', 'Drizzle of raw honey', 'Mint leaves'],
    steps: ['Stir chia into the milk and leave 10 minutes (or overnight) to set.', 'Top with berries, hemp seeds and raw honey.', 'Finish with fresh mint.'],
  },
  {
    id: 'cruciferous-stir-fry', name: 'Glow Stir-Fry', phases: ['ovulatory'], time: 20, kcal: 450, meal: 'Dinner',
    nutrients: ['Fibre', 'Sulforaphane', 'Zinc'],
    ingredients: ['1 cup broccoli', '1 cup Brussels sprouts, halved', '1 red pepper', '150 g wild prawns or chicken', '1 tbsp tamari', '1 tsp sesame oil', 'Ginger & garlic'],
    steps: ['Sear prawns or chicken until golden, set aside.', 'Stir-fry vegetables with ginger and garlic for 5 minutes.', 'Return protein, add tamari and sesame oil, toss and serve.'],
  },
  {
    id: 'sweet-potato-bowl', name: 'Sweet Potato Comfort Bowl', phases: ['luteal'], time: 40, kcal: 560, meal: 'Dinner',
    nutrients: ['Complex carbs', 'Vitamin B6', 'Magnesium'],
    ingredients: ['1 sweet potato, cubed', '1 can chickpeas', '1 handful rocket', '2 handfuls kale', '1 tbsp pumpkin seeds', 'Tahini-maple dressing', 'Smoked paprika'],
    steps: ['Roast sweet potato and chickpeas with paprika at 200°C for 30 minutes.', 'Massage kale with a little dressing.', 'Layer kale, rocket, roasted veg and chickpeas.', 'Top with pumpkin seeds and more dressing.'],
  },
  {
    id: 'raw-beet-slaw', name: 'Warm Beet & Apple Bowl', phases: ['menstrual'], time: 15, kcal: 330, meal: 'Breakfast', warm: true,
    nutrients: ['Iron', 'Vitamin C', 'Folate'],
    ingredients: ['1 beetroot, grated', '1 apple, diced', '1 carrot, grated', '2 tbsp pumpkin seeds', 'Juice of ½ lemon', '1 tsp fresh grated ginger', '½ tsp cinnamon', '1 tbsp ghee or olive oil', 'Pinch of sea salt'],
    steps: ['Warm the ghee in a pan and add ginger and cinnamon for 30 seconds.', 'Add beetroot, carrot and apple; cook gently for 6–8 minutes until soft.', 'Season with salt, finish with lemon — its vitamin C helps you absorb the iron.', 'Top with pumpkin seeds and eat warm.'],
  },
  {
    id: 'living-green-salad', name: 'Living Green Salad', phases: ['ovulatory', 'follicular'], time: 15, kcal: 430, meal: 'Lunch', raw: true,
    nutrients: ['Fibre', 'Antioxidants', 'Probiotics'],
    ingredients: ['2 handfuls rocket & spinach', '½ cucumber', '1 handful sprouts', '½ avocado', '3 tbsp raw sauerkraut', '1 tbsp hemp seeds', 'Pomegranate seeds', 'Lemon, olive oil & raw honey dressing'],
    steps: ['Slice cucumber and avocado.', 'Pile greens and sprouts into a big bowl.', 'Add avocado, sauerkraut, pomegranate and hemp.', 'Drizzle with dressing just before eating.'],
  },
  {
    id: 'ginger-bone-broth', name: 'Ginger Bone Broth Soup', phases: ['menstrual'], time: 25, kcal: 380, meal: 'Lunch', warm: true,
    nutrients: ['Iron', 'Collagen', 'Minerals'],
    ingredients: ['600 ml bone broth', '1 thumb fresh ginger, sliced', '6 red dates', '1 tbsp goji berries', '150 g shredded pasture chicken', '2 handfuls spinach', 'Spring onion & sea salt'],
    steps: ['Simmer broth with ginger and red dates for 15 minutes.', 'Add chicken and goji; warm through for 5 minutes.', 'Stir in spinach until just wilted.', 'Season and sip slowly — TCM’s classic period bowl.'],
  },
  {
    id: 'beef-beet-stew', name: 'Grass-fed Beef & Beet Stew', phases: ['menstrual'], time: 90, kcal: 540, meal: 'Dinner', warm: true,
    nutrients: ['Heme iron', 'Zinc', 'B12'],
    ingredients: ['400 g grass-fed beef, cubed', '2 beetroots, chunked', '2 carrots', '1 onion', '3 garlic cloves', '1 tsp cinnamon', '500 ml bone broth', 'Fresh parsley & lemon'],
    steps: ['Brown the beef in a heavy pot, then soften onion and garlic.', 'Add beetroot, carrots, cinnamon and broth.', 'Cover and simmer gently for 75 minutes until tender.', 'Finish with parsley and lemon for vitamin C.'],
  },
  {
    id: 'green-goddess-smoothie', name: 'Green Goddess Smoothie', phases: ['follicular', 'ovulatory'], time: 5, kcal: 340, meal: 'Breakfast', raw: true,
    nutrients: ['Vitamin C', 'Fibre', 'Healthy fats'],
    ingredients: ['2 handfuls spinach', '1 kiwi', '½ avocado', '1 green apple', '1 tbsp hemp seeds', 'Juice of ½ lemon', '250 ml coconut water'],
    steps: ['Blend everything until silky.', 'Drink fresh — living food is best right away.'],
  },
  {
    id: 'egg-kraut-plate', name: 'Pasture Egg & Kraut Plate', phases: ['follicular'], time: 10, kcal: 450, meal: 'Breakfast',
    nutrients: ['Protein', 'Probiotics', 'Choline'],
    ingredients: ['2–3 pasture eggs', '3 tbsp raw sauerkraut', '½ avocado', 'Cherry tomatoes', 'Handful of rocket', 'Cold-pressed olive oil & sea salt'],
    steps: ['Soft-boil or fry the eggs in a little ghee.', 'Plate with rocket, tomatoes, avocado and sauerkraut.', 'Drizzle with olive oil and season.'],
  },
  {
    id: 'courgette-pesto', name: 'Raw Courgette Pesto Noodles', phases: ['ovulatory', 'follicular'], time: 15, kcal: 410, meal: 'Dinner', raw: true,
    nutrients: ['Antioxidants', 'Zinc', 'Fibre'],
    ingredients: ['2 courgettes, spiralised', '1 big handful basil', '3 tbsp pumpkin seeds', '1 garlic clove', '4 tbsp cold-pressed olive oil', 'Juice of ½ lemon', 'Cherry tomatoes'],
    steps: ['Blitz basil, pumpkin seeds, garlic, oil and lemon into a pesto.', 'Toss with courgette noodles.', 'Top with halved tomatoes and a few whole seeds.'],
  },
  {
    id: 'rainbow-wraps', name: 'Rainbow Collard Wraps', phases: ['ovulatory'], time: 15, kcal: 380, meal: 'Lunch', raw: true,
    nutrients: ['Fibre', 'Antioxidants', 'Protein'],
    ingredients: ['4 large collard or cabbage leaves', '4 tbsp hummus', '1 carrot, julienned', '½ red pepper, sliced', '½ cucumber', 'Red cabbage & sprouts', 'Tahini-lemon drizzle'],
    steps: ['Shave the thick stem off each leaf.', 'Spread with hummus and pile in the vegetables.', 'Drizzle with tahini, roll tightly and slice.'],
  },
  {
    id: 'squash-walnut-soup', name: 'Roasted Squash & Walnut Soup', phases: ['luteal', 'menstrual'], time: 45, kcal: 420, meal: 'Dinner', warm: true,
    nutrients: ['Magnesium', 'Slow carbs', 'Omega-3'],
    ingredients: ['1 butternut squash, cubed', '1 onion', '1 tsp cinnamon', '½ tsp nutmeg', '700 ml bone or vegetable broth', '3 tbsp walnuts', 'Coconut milk to finish'],
    steps: ['Roast squash and onion with cinnamon at 200°C for 30 minutes.', 'Blend with hot broth until velvety.', 'Swirl in coconut milk and top with toasted walnuts.'],
  },
  {
    id: 'baked-apple', name: 'Baked Apple, Tahini & Cinnamon', phases: ['luteal', 'menstrual'], time: 30, kcal: 260, meal: 'Snack', warm: true,
    nutrients: ['Fibre', 'Calcium', 'Magnesium'],
    ingredients: ['2 apples, cored', '2 tbsp tahini', '1 tsp cinnamon', '4 dates, chopped', 'Handful of walnuts', 'Raw honey to drizzle'],
    steps: ['Stuff apples with dates, walnuts and cinnamon.', 'Bake at 180°C for 25 minutes until soft.', 'Drizzle with tahini and raw honey once slightly cooled.'],
  },
  {
    id: 'chickpea-curry', name: 'Sweet Potato & Chickpea Curry', phases: ['luteal'], time: 35, kcal: 520, meal: 'Dinner', warm: true,
    nutrients: ['Vitamin B6', 'Slow carbs', 'Fibre'],
    ingredients: ['1 sweet potato, cubed', '1 can chickpeas', '400 ml coconut milk', '2 tsp curry spices & turmeric', '1 thumb ginger', '2 handfuls spinach', 'Coriander & lime'],
    steps: ['Soften ginger and spices in a little coconut oil.', 'Add sweet potato, chickpeas and coconut milk; simmer 20 minutes.', 'Stir in spinach, finish with lime and coriander. No rice needed.'],
  },
  {
    id: 'liver-pancakes', name: 'Liver Pancakes', phases: ['menstrual', 'follicular'], time: 15, kcal: 380, meal: 'Breakfast', warm: true, source: 'Heart & Soil', url: 'https://heartandsoil.co/blog/category/animal-based-diet/animal-based-recipes/',
    nutrients: ['Heme iron', 'Vitamin A', 'B12'],
    ingredients: ['60 g raw grass-fed beef liver', '3 pasture eggs', '2 tbsp melted ghee or butter', 'Pinch of sea salt', 'Optional: 1 banana', 'Raw honey & berries to serve'],
    steps: ['Blend liver, eggs, melted fat and salt (plus banana if using) until completely smooth.', 'Melt a little butter in a pan over medium heat.', 'Pour small rounds, cook until bubbles form and edges set, then flip.', 'Serve warm with raw honey and fruit — the easiest way to eat liver. Liver is very rich in vitamin A: once a week is plenty, especially when pregnant or trying to conceive.'],
  },
  {
    id: 'bone-marrow', name: 'Roasted Bone Marrow', phases: ['menstrual', 'luteal'], time: 25, kcal: 440, meal: 'Dinner', warm: true, source: 'Heart & Soil', url: 'https://heartandsoil.co/blog/category/animal-based-diet/animal-based-recipes/',
    nutrients: ['Healthy fats', 'Collagen', 'Minerals'],
    ingredients: ['2–4 beef marrow bones (canoe-cut)', 'Flaky sea salt', 'Optional: parsley & lemon'],
    steps: ['Heat the oven to 230°C.', 'Salt the bones and roast marrow-side up for 15–20 minutes until soft and bubbling.', 'Scoop and eat warm with a pinch of salt. In TCM, marrow nourishes the Kidney’s Jing (essence).'],
  },
  {
    id: 'caldereta', name: 'Beef & Liver Caldereta', phases: ['menstrual', 'luteal'], time: 120, kcal: 590, meal: 'Dinner', warm: true, source: 'Heart & Soil', url: 'https://heartandsoil.co/blog/category/animal-based-diet/animal-based-recipes/',
    nutrients: ['Heme iron', 'Zinc', 'B12'],
    ingredients: ['700 g grass-fed beef chuck, cubed', '100 g beef liver, finely minced', '400 g tomato passata', '2 carrots & 2 potatoes, chunked', '1 red pepper', '1 onion, 4 garlic cloves', 'Bone broth, bay leaf, salt'],
    steps: ['Brown the beef, then soften onion and garlic.', 'Add passata, broth and bay leaf; simmer covered for about 90 minutes.', 'Add carrots, potatoes and pepper; cook until tender.', 'Stir in the minced liver for the last 10 minutes to thicken and enrich.'],
  },
  {
    id: 'animal-tacos', name: 'Animal-Based Tacos', phases: ['ovulatory', 'follicular'], time: 30, kcal: 620, meal: 'Dinner', source: 'Heart & Soil', url: 'https://heartandsoil.co/blog/category/animal-based-diet/animal-based-recipes/',
    nutrients: ['Protein', 'Calcium', 'Vitamin C'],
    ingredients: ['1 cup grated raw cheddar', '3 large eggs', '250 g ground beef', '200 g wild prawns', 'Lemon & salt', 'Salsa: pineapple, cucumber, lime, salt'],
    steps: ['Whisk eggs and cheddar; cook thin rounds in a pan, flipping once — these are the tortillas.', 'Brown the beef with salt; cook prawns with salt and lemon until pink.', 'Dice pineapple and cucumber, toss with lime and salt.', 'Fill the tortillas and top with salsa.'],
  },
  {
    id: 'brazilian-lemonade', name: 'Brazilian Lemonade', phases: ['ovulatory', 'follicular'], time: 10, kcal: 210, meal: 'Drink', raw: true, source: 'Heart & Soil', url: 'https://heartandsoil.co/blog/category/animal-based-diet/animal-based-recipes/',
    nutrients: ['Vitamin C', 'Electrolytes', 'Calcium'],
    ingredients: ['2 whole limes, quartered', '3 tbsp maple syrup or raw honey', '3 tbsp sweetened condensed raw milk (or raw cream)', '500 ml water'],
    steps: ['Blend limes with water for only 10–15 seconds (longer turns it bitter).', 'Strain well.', 'Blend again with sweetener and condensed milk until frothy.', 'Enjoy on raw-first days — skip it during your period.'],
  },
  {
    id: 'raw-cream-icecream', name: 'Raw Cream Ice Cream', phases: ['ovulatory', 'follicular'], time: 20, kcal: 330, meal: 'Snack', raw: true, source: 'Heart & Soil', url: 'https://heartandsoil.co/blog/category/animal-based-diet/animal-based-recipes/',
    nutrients: ['Fat-soluble vitamins', 'Choline'],
    ingredients: ['500 ml raw cream', '4 pasture egg yolks', '4 tbsp raw honey', '1 tsp vanilla', 'Pinch of salt'],
    steps: ['Whisk yolks, honey, vanilla and salt until smooth.', 'Stir in the raw cream.', 'Churn in an ice-cream maker (or freeze, stirring every 30 minutes).', 'A treat for your raw-first weeks, not your period.'],
  },
  {
    id: 'sweet-potato-brownies', name: 'Sweet Potato Brownies', phases: ['luteal', 'menstrual'], time: 35, kcal: 140, meal: 'Snack', warm: true, source: '@belleadri', url: 'https://www.tiktok.com/@belleadri',
    nutrients: ['Magnesium', 'Slow carbs', 'Potassium'],
    ingredients: ['1 sweet potato, cooked & mashed', '1 ripe banana', '2 tbsp raw cacao or cocoa powder', '2 tbsp yoghurt (or kefir)', '1 tsp cinnamon', 'Optional: dark chocolate chips'],
    steps: ['Heat the oven to 180°C and line a small dish.', 'Mash sweet potato and banana, then mix in cacao, yoghurt and cinnamon.', 'Spread out, top with chocolate chips if you like.', 'Bake 20–25 minutes. Eat warm — perfect for luteal chocolate cravings.'],
  },
  {
    id: 'magnesium-bites', name: 'Magnesium Bliss Bites', phases: ['luteal', 'menstrual'], time: 15, kcal: 110, meal: 'Snack',
    nutrients: ['Magnesium', 'Healthy fats', 'Fibre'],
    ingredients: ['1 cup dates', '½ cup pumpkin seeds', '¼ cup sunflower seeds', '2 tbsp cacao', '1 tbsp nut butter', 'Pinch of sea salt'],
    steps: ['Blitz everything in a food processor until sticky.', 'Roll into 12 balls.', 'Chill for 20 minutes. Keeps 1 week in the fridge — around your period, let them come to room temperature first.'],
  },
];

export const ARTICLES = [
  {
    id: 'four-phases', title: 'Your cycle is more than your period', phase: null, mins: 4,
    body: [
      'Your menstrual cycle has four phases — menstrual, follicular, ovulatory and luteal — and each one comes with a different hormone mix.',
      'Estrogen, progesterone, LH, FSH and testosterone rise and fall in a predictable rhythm. Those shifts can influence energy, mood, sleep, appetite, skin and how your body responds to training.',
      'Cycle syncing simply means noticing those patterns and planning around them, instead of expecting yourself to feel the same every single day.',
      'Everyone is different. The more you log, the more this app learns your own rhythm rather than a textbook 28-day cycle.',
    ],
  },
  {
    id: 'estrogen', title: 'Why estrogen makes you feel unstoppable', phase: 'follicular', mins: 3,
    body: [
      'Estrogen rises through your follicular phase and peaks just before ovulation.',
      'It supports serotonin and dopamine activity, which is why many women feel more upbeat, social and motivated in the days before ovulation.',
      'It also supports muscle recovery and insulin sensitivity — a nice time to push strength goals if you feel like it.',
    ],
  },
  {
    id: 'progesterone-pms', title: 'Progesterone, PMS & cravings', phase: 'luteal', mins: 4,
    body: [
      'After ovulation, progesterone takes over. It has a calming effect, raises your body temperature slightly and can slow digestion — hello bloating.',
      'Your resting metabolism rises a little in this phase, so feeling hungrier is normal. Reach for complex carbs and protein to keep blood sugar steady.',
      'In the last few days before your period, both estrogen and progesterone fall. That drop is linked to PMS symptoms like irritability, low mood and breast tenderness.',
      'Magnesium, B6, calcium and good sleep are simple, evidence-backed ways to soften PMS.',
    ],
  },
  {
    id: 'yin-yang', title: 'The Yin & Yang of your cycle', phase: 'ovulatory', mins: 4,
    body: [
      'Traditional Chinese Medicine sees the menstrual cycle as a tide of Yin and Yang.',
      'After your period, Yin and Blood rebuild — the follicular "Yin phase". At ovulation, Yin reaches its fullest and transforms into Yang.',
      'In the luteal "Yang phase" warmth rises (which matches the real rise in basal body temperature after ovulation), and smooth flow of Liver Qi keeps PMS away.',
      'During your period, Blood must move freely — which is why TCM recommends warmth and avoiding raw and cold food and drinks.',
      'These are traditional concepts rather than proven science, but many women find the rhythm of warming, nourishing and moving a helpful way to care for themselves.',
    ],
  },
  {
    id: 'iron', title: 'Iron, energy & your period', phase: 'menstrual', mins: 3,
    body: [
      'You lose iron when you bleed, and low iron is one of the most common causes of fatigue in women.',
      'Pair iron-rich foods (lentils, red meat, spinach, pumpkin seeds) with vitamin C to boost absorption.',
      'If you have very heavy periods or constant exhaustion, ask your doctor to check your ferritin.',
    ],
  },
  {
    id: 'seed-cycling', title: 'Seed cycling: what we know', phase: 'follicular', mins: 3,
    body: [
      'Seed cycling means eating flax and pumpkin seeds in the first half of your cycle, then sesame and sunflower seeds in the second half.',
      'There is little direct research that it changes hormone levels — but seeds are rich in fibre, zinc, magnesium and healthy fats, which all support hormone health.',
      'Think of it as an easy nutrition habit, not a treatment.',
    ],
  },
];

export const FLOWS = [
  { id: 'spotting', label: 'Spotting', drops: 0 },
  { id: 'light', label: 'Light', drops: 1 },
  { id: 'medium', label: 'Medium', drops: 2 },
  { id: 'heavy', label: 'Heavy', drops: 3 },
];
export const PERIOD_FLOWS = ['light', 'medium', 'heavy'];

// ---- Check-in (the "+" tab): groups, emoji and order are our own ----
export const BODY_GROUPS = [
  ['Pain', [['Cramps', '🌀'], ['Ovulation pain', '✴️'], ['Pelvic pain', '🔻'], ['Headache', '🤕'], ['Back pain', '🦴'], ['Joint pain', '🦵'], ['Tender breasts', '💗']]],
  ['Belly', [['Bloating', '🎈'], ['Nausea', '🤢'], ['Constipation', '🧱'], ['Diarrhea', '💧'], ['Cravings', '🍫'], ['Big appetite', '🍽️']]],
  ['Skin & hair', [['Acne', '🔴'], ['Oily skin', '✨'], ['Dry skin', '🍂'], ['Hair shedding', '🪮'], ['Glowing skin', '🌟']]],
  ['Energy & sleep', [['Energetic', '⚡'], ['Fatigue', '🪫'], ['Insomnia', '🌙'], ['Brain fog', '🌫️'], ['Dizziness', '💫']]],
  ['Warm & cold', [['Cold hands & feet', '🧊'], ['Feeling hot', '🔥'], ['Night sweats', '💦']]],
];
export const MOOD_LIST = [['Calm', '🌿'], ['Happy', '😊'], ['Relaxed', '😌'], ['Confident', '💅'], ['Sexy', '🌹'], ['Social', '🫶'], ['Creative', '🎨'],
  ['Sensitive', '🥺'], ['Tearful', '🥲'], ['Anxious', '😰'], ['Stressed', '😵‍💫'], ['Irritable', '😤'], ['Angry', '😠'], ['Sad', '😔'], ['Low mood', '🌧️'], ['Mood swings', '🎢'], ['Indifferent', '😶'], ['Unmotivated', '🫠']];
export const GOOD_FEELINGS = ['Energetic', 'Glowing skin', 'Calm', 'Happy', 'Relaxed', 'Confident', 'Sexy', 'Social', 'Creative'];
export const DISCHARGE = [['Dry', '🏜️'], ['Sticky', '🍯'], ['Creamy', '🥛'], ['Watery', '💧'], ['Egg white', '🥚'], ['Clumpy', '☁️']];
export const DOWN_EXTRA = [['Blood clots', '🩸'], ['Unusual colour', '🎨'], ['Strong smell', '👃'], ['Itching', '🌶️'], ['Burning', '🔥']];
export const INTIMACY = [['Sex, protected', '🛡️'], ['Sex, unprotected', '💞'], ['Masturbation', '🌸'], ['Orgasm', '🎆'], ['Making out', '💋'], ['Fantasies', '💭'], ['I initiated', '🙋‍♀️'], ['Partner initiated', '🤝']];
export const INTAKE = [['Coffee', '☕'], ['Tea', '🍵'], ['Raw milk', '🥛'], ['Warm cooked meals', '🍲'], ['Raw & cold food', '🥗'], ['Sweets', '🍬'], ['Lots of water', '💧'], ['Skipped a meal', '⏳'], ['Late dinner', '🌙']];
export const SUPPS = [['Magnesium', '🌰'], ['Iron', '🩸'], ['Omega-3', '🐟'], ['Vitamin D', '☀️'], ['Zinc', '🦪'], ['Painkiller', '💊'], ['Other medicine', '🧴']];
export const DISRUPTORS = [['Alcohol', '🍷'], ['Illness', '🤒'], ['Travel', '✈️'], ['Big stress', '⚡'], ['Late night', '🌃'], ['Hard training', '🏋️'], ['Drugs', '🌿'], ['Shock or loss', '💔']];
export const SYMPTOMS = BODY_GROUPS.flatMap(([, l]) => l.map(([n]) => n));
export const MOODS = MOOD_LIST.map(([n]) => n);
export const LOG_EMOJI = Object.fromEntries([...BODY_GROUPS.flatMap(([, l]) => l), ...MOOD_LIST, ...DISCHARGE, ...DOWN_EXTRA, ...INTIMACY, ...INTAKE, ...SUPPS, ...DISRUPTORS, ['Spotting', '🔸']]);

// The check-in "brain": why a symptom shows up, phase by phase. ev = evidence label.
export const SYMPTOM_WHY = {
  Cramps: { ev: 'strong', why: 'Prostaglandins make the womb contract to shed its lining. More prostaglandins, stronger cramps.', luteal: 'Cramps before your period mean prostaglandins are already rising. Warmth now can soften the first days.' },
  'Ovulation pain': { ev: 'some', why: 'The follicle stretches and releases the egg, and a little fluid can irritate the belly lining. It usually passes within 1–2 days.' },
  'Pelvic pain': { ev: 'some', why: 'A dull pelvic ache is common around your period and ovulation.', other: 'Deep pelvic pain outside your period, or pain during sex, is worth checking with a doctor. Endometriosis often goes unnoticed for years.' },
  Headache: { ev: 'some', why: 'Falling estrogen can trigger headaches, especially just before and on the first days of your period.', ovulatory: 'The quick estrogen dip right after ovulation can bring a short headache.' },
  'Back pain': { ev: 'some', why: 'The same prostaglandins behind cramps can radiate into the lower back.' },
  'Joint pain': { ev: 'emerging', why: 'Estrogen is anti-inflammatory. When it is low, before and during your period, joints can feel stiffer.' },
  'Tender breasts': { ev: 'some', why: 'Progesterone and estrogen make breast tissue hold fluid in the second half of your cycle.' },
  Bloating: { ev: 'some', why: 'Hormone shifts make you hold more water and slow digestion, most of all in the days before your period.' },
  Nausea: { ev: 'some', why: 'Prostaglandins don’t only affect the womb; they can upset the stomach on the first days of your period.' },
  Constipation: { ev: 'strong', why: 'Progesterone relaxes smooth muscle, including your gut, so things slow down in the luteal phase.' },
  Diarrhea: { ev: 'strong', why: 'When your period starts, prostaglandins speed up the gut as well as the womb. Very common on day 1–2.' },
  Cravings: { ev: 'some', why: 'Your body burns more energy before your period and serotonin dips, so carbs and sweets call louder. The hunger is real.' },
  'Big appetite': { ev: 'some', why: 'In the luteal phase your resting energy use rises a little. Eating more now is your body asking, not a lack of discipline.' },
  Acne: { ev: 'some', why: 'Before your period, progesterone and testosterone make skin oilier, and breakouts often show on the jaw and chin.' },
  'Oily skin': { ev: 'some', why: 'Oil production rises in the second half of the cycle as progesterone climbs.' },
  'Dry skin': { ev: 'emerging', why: 'Low estrogen around your period means less skin moisture and a thinner barrier.' },
  'Hair shedding': { ev: 'emerging', why: 'Some extra shedding is normal. If it is a lot, low iron (ferritin) and thyroid are the first things to check.' },
  'Glowing skin': { ev: 'some', why: 'Rising estrogen boosts collagen and moisture, and many women see their best skin before ovulation.' },
  Energetic: { ev: 'some', why: 'Estrogen and testosterone rise towards ovulation, which is why energy often lifts in the first half of the cycle.' },
  Fatigue: { ev: 'some', why: 'Low hormones and blood loss make tiredness common during your period. Before it, progesterone is calming and can feel heavy.', other: 'If tiredness lasts across your whole cycle, ask for a ferritin (iron) test.' },
  Insomnia: { ev: 'some', why: 'Progesterone raises your body temperature by about 0.3 °C before your period, and warmer bodies sleep lighter.' },
  'Brain fog': { ev: 'emerging', why: 'Many women feel foggier when hormones are lowest or falling. Your abilities don’t change; your energy does.' },
  Dizziness: { ev: 'some', why: 'Blood loss, low iron or missed meals can all make you lightheaded.' },
  'Cold hands & feet': { ev: 'tcm', why: 'In Chinese medicine this is a sign of low Yang or Blood: your body needs warming food, warm feet and rest.' },
  'Feeling hot': { ev: 'some', why: 'After ovulation progesterone raises your core temperature. In Chinese medicine, heat calls for cooling foods like mung beans and leafy greens.' },
  'Night sweats': { ev: 'some', why: 'Hormone swings before your period can unsettle temperature control at night. If it happens often, mention it to a doctor.' },
  Spotting: { ev: 'some', why: 'Light bleeding outside your period.' },
  Anxious: { ev: 'some', why: 'Falling progesterone before your period lowers its calming effect on the brain, so anxiety can rise.' },
  Stressed: { ev: 'some', why: 'Stress hormones and cycle hormones talk to each other. Stress feels heavier when estrogen is low.' },
  Irritable: { ev: 'some', why: 'Before your period serotonin dips with estrogen, which shortens your fuse. It is chemistry, not character.' },
  Angry: { ev: 'some', why: 'Anger often surfaces before your period, when hormones fall. It can also point to a boundary that needs saying.' },
  Sad: { ev: 'some', why: 'Low estrogen before and during your period can lower serotonin and mood.' },
  'Low mood': { ev: 'some', why: 'Mood often dips in the late luteal phase as hormones fall.', other: 'If low moods before your period feel crushing every cycle, talk to a doctor about PMDD. It is real and treatable.' },
  'Mood swings': { ev: 'some', why: 'Hormones fall fastest in the days before your period, and moods move with them.' },
  Tearful: { ev: 'some', why: 'Feelings sit closer to the surface when hormones are low. Tears are a release, not a weakness.' },
  Sensitive: { ev: 'some', why: 'Before your period many women feel more sensitive to noise, criticism and other people’s moods.' },
  Unmotivated: { ev: 'some', why: 'Energy drops when hormones are low. Plan lighter tasks and save big pushes for your follicular days.' },
  Indifferent: { ev: 'emerging', why: 'Feeling flat can follow low energy, poor sleep or hormonal birth control.' },
  Calm: { ev: 'some', why: 'Progesterone has a calming, sedating effect after ovulation.' },
  Happy: { ev: 'some', why: 'Rising estrogen supports serotonin and dopamine. Notice when happiness peaks for you.' },
  Confident: { ev: 'some', why: 'Estrogen and testosterone peak around ovulation, bringing confidence and drive.' },
  Sexy: { ev: 'some', why: 'Desire often peaks around ovulation, when estrogen and testosterone are highest.' },
  Social: { ev: 'some', why: 'Many women feel most social in the first half of their cycle.' },
  Creative: { ev: 'emerging', why: 'Some women feel most creative when hormones are low and the mind turns inward.' },
};
export const FLUIDS = ['Dry', 'Sticky', 'Creamy', 'Watery', 'Egg white'];
export const SEX = ['None', 'Protected', 'Unprotected'];
export const LIBIDO = ['Low', 'Medium', 'High'];

export const GOALS = [
  'Understand my hormones', 'Predict my period', 'Balance with TCM', 'Eat for my cycle',
  'Ease PMS', 'Clearer skin', 'Better sleep', 'Balance my mood', 'Trying to conceive',
];

// Traditional Chinese Medicine view of each phase.
// In TCM the cycle is a tide of Yin and Yang: Blood moves out, Yin rebuilds,
// Yin transforms into Yang at ovulation, then Yang warms and Qi must flow freely.
export const TCM = {
  menstrual: {
    stage: 'Blood phase', element: 'Water', elementGlyph: '水', organ: 'Kidney', yin: 0.55,
    essence: 'Yang turns back to Yin. The body empties and Blood must move freely and smoothly — warmth helps it flow.',
    principle: 'Move & warm the Blood',
    tea: { name: 'Ginger & red date tea', why: 'Warms the womb and gently moves Blood; red dates nourish what is lost.' },
    foods: ['Ginger', 'Red dates (jujube)', 'Black beans', 'Bone broth', 'Stewed apple', 'Raw honey', 'Cinnamon'],
    avoid: ['Raw & cold food', 'Iced drinks', 'Cold smoothies', 'Late nights'],
    point: { code: 'SP6', name: 'Sanyinjiao', where: 'Four finger-widths above the inner ankle bone, just behind the shin.', does: 'Meeting point of Spleen, Liver and Kidney — eases cramps and calms the lower belly.', secs: 90 },
    ritual: 'Keep your feet and lower back warm. A ginger foot soak before bed is the classic TCM period ritual.',
  },
  follicular: {
    stage: 'Yin phase', element: 'Wood', elementGlyph: '木', organ: 'Liver', yin: 0.85,
    essence: 'Yin and Blood rebuild after your period, like sap rising in spring. Nourish deeply so there is plenty to grow from.',
    principle: 'Nourish Yin & Blood',
    tea: { name: 'Goji & chrysanthemum', why: 'Goji nourishes Liver Blood and Yin; chrysanthemum keeps things light and clear.' },
    foods: ['Goji berries', 'Black sesame', 'Eggs', 'Dark leafy greens', 'Mulberries', 'Seaweed', 'Mung beans'],
    avoid: ['Over-exercising to exhaustion', 'Skipping meals', 'Processed food'],
    point: { code: 'KI3', name: 'Taixi', where: 'In the hollow between the inner ankle bone and the Achilles tendon.', does: 'Source point of the Kidney — builds Yin and steady energy.', secs: 60 },
    ritual: 'Go to bed before 11pm — in TCM, Blood returns to the Liver during sleep to be restored.',
  },
  ovulatory: {
    stage: 'Yin to Yang', element: 'Fire', elementGlyph: '火', organ: 'Heart', yin: 0.5,
    essence: 'Yin reaches its fullest point and transforms into Yang — the turning of the tide. Energy is outward, bright and warm.',
    principle: 'Support the transformation',
    tea: { name: 'Rose & hawthorn tea', why: 'Rose gently moves Qi and lifts the Heart; hawthorn keeps circulation smooth.' },
    foods: ['Walnuts', 'Lotus seeds', 'Cherries', 'Lamb or lentils', 'Berries', 'Bitter greens'],
    avoid: ['Overheating', 'Very spicy food', 'Stress overload'],
    point: { code: 'CV4', name: 'Guanyuan', where: 'Four finger-widths below your navel, on the midline.', does: 'The "gate of origin" — strengthens the lower belly and supports the shift to Yang.', secs: 60 },
    ritual: 'Gentle movement and laughter keep Heart Qi open. Share your warmth — this is your social, fiery season.',
  },
  luteal: {
    stage: 'Yang phase', element: 'Earth', elementGlyph: '土', organ: 'Spleen & Liver', yin: 0.25,
    essence: 'Yang warms the body (your temperature rises). Liver Qi must flow freely — when it stagnates, PMS, breast tenderness and irritability appear.',
    principle: 'Warm Yang & soothe Liver Qi',
    tea: { name: 'Rose & orange-peel tea', why: 'Rose and dried tangerine peel (chen pi) move stuck Liver Qi and ease bloating.' },
    foods: ['Sweet potato', 'Pumpkin', 'Squash', 'Root veg', 'Cinnamon', 'Fennel', 'Radish'],
    avoid: ['Greasy & fried food', 'Excess sugar', 'Alcohol', 'Holding in frustration'],
    point: { code: 'LV3', name: 'Taichong', where: 'On the top of the foot, in the dip between the big and second toe bones.', does: 'Smooths Liver Qi — the go-to point for PMS, irritability and tension.', secs: 90 },
    ritual: 'Move stuck Qi: walk, stretch your sides, sigh it out. Warm, cooked meals keep the Spleen strong against bloating — especially in the days before your period.',
  },
};

// Daily rituals library (TCM-inspired), tagged by the phases they suit.
export const RITUALS = [
  { id: 'foot-soak', name: 'Ginger foot soak', phases: ['menstrual', 'luteal'], mins: 15, glyph: '姜',
    steps: ['Simmer 5 slices of fresh ginger in 1 litre of water for 10 minutes.', 'Pour into a basin and top up with warm water.', 'Soak your feet for 15 minutes until you feel warm through.', 'Dry well and put on socks.'],
    why: 'Draws warmth down to the feet and lower belly — classic for cramps and cold hands and feet.' },
  { id: 'belly-massage', name: 'Warm belly massage', phases: ['menstrual', 'luteal'], mins: 5, glyph: '暖',
    steps: ['Rub your palms together until warm.', 'Place them below your navel and breathe slowly.', 'Massage in slow clockwise circles for 3 minutes.', 'Rest your hands there for 10 breaths.'],
    why: 'Moves Qi and Blood in the lower Dantian and relaxes the uterus.' },
  { id: 'liver-stretch', name: 'Side-body stretch', phases: ['luteal', 'ovulatory'], mins: 5, glyph: '肝',
    steps: ['Stand tall, reach your right arm overhead and lean left. 5 breaths.', 'Switch sides. 5 breaths.', 'Tap firmly along your ribs on both sides for 30 seconds.', 'Finish with three long sighs out through the mouth.'],
    why: 'The Liver and Gallbladder channels run along the sides of the body. Opening them eases tension and irritability.' },
  { id: 'early-sleep', name: 'Early-to-bed sleep', phases: ['follicular', 'menstrual', 'luteal'], mins: 30, glyph: '眠',
    steps: ['Dim lights and put screens away by 10pm.', 'Sip a warm, caffeine-free tea.', 'Be in bed by 11pm, before Gallbladder and Liver hours (11pm–3am).'],
    why: 'In TCM, Blood returns to the Liver during deep night sleep to be cleansed and restored.' },
  { id: 'congee', name: 'Warm morning fruit', phases: ['menstrual', 'follicular', 'luteal'], mins: 10, glyph: '暖',
    steps: ['Gently stew a chopped apple or pear with a splash of water.', 'Add red dates, goji, cinnamon and a slice of ginger.', 'Top with raw honey and a few walnuts. Eat warm.'],
    why: 'Warm, naturally sweet food builds Qi and Blood without taxing digestion.' },
  { id: 'heart-breath', name: 'Heart-opening breath', phases: ['ovulatory', 'follicular'], mins: 5, glyph: '心',
    steps: ['Sit tall, palms resting on your chest.', 'Inhale for 4, feeling the chest widen.', 'Exhale for 6 with a soft "haaa" — the Heart healing sound.', 'Repeat for 5 minutes.'],
    why: 'The Heart houses the Shen (spirit). Calm breath keeps your bright ovulatory energy grounded.' },
];

// Partner mode: what the people close to her see for each phase.
export const SUPPORT = {
  menstrual: {
    feel: 'Energy is at its lowest and cramps, back ache or tiredness are common. She may want quiet, warmth and fewer plans.',
    partner: {
      do: ['Take something off her plate without being asked', 'Bring a hot water bottle or heat pack', 'Plan a cosy night in — film, blanket, warm home-cooked food', 'Keep the house warm and offer warm drinks'],
      avoid: ['Pushing big plans or late nights', 'Taking low energy personally', 'Iced drinks and raw, cold food (TCM: cold slows the flow)'],
      gifts: ['Hot water bottle', 'Dark chocolate', 'Ginger & red date tea', 'Fluffy socks', 'Magnesium bath salts'],
      say: 'No plans needed tonight — I’ll bring dinner and the heat pack. You just rest.',
      date: 'Sofa, blankets and her comfort film',
    },
    friend: {
      do: ['Check in with a low-pressure message', 'Offer a slow walk or a coffee instead of a night out', 'Drop off snacks'],
      plan: 'Low-key catch-up at home',
      say: 'Thinking of you — want me to drop off chocolate and gossip later? 🍫',
    },
  },
  follicular: {
    feel: 'Energy and mood are climbing. She is likely curious, optimistic and up for something new.',
    partner: {
      do: ['Suggest trying something new together', 'Back her new ideas and plans', 'Get active together — a hike, a class, a dance', 'Make space for her to be spontaneous'],
      avoid: ['Shooting down ideas', 'Defaulting to the same old routine'],
      gifts: ['A class or workshop for two', 'Fresh flowers', 'A book on something she’s into', 'Tickets to something new'],
      say: 'There’s a new place I want to take you this week — you pick the night.',
      date: 'Try a new restaurant, class or day trip',
    },
    friend: {
      do: ['Invite her to try something new', 'Brainstorm plans or projects together', 'Book that thing you keep talking about'],
      plan: 'New café, pottery class or a spontaneous day out',
      say: 'Ok I’m booking us something new this week — are you in? ✨',
    },
  },
  ovulatory: {
    feel: 'This is often her most confident, social and energetic window. She is likely glowing and up for connection.',
    partner: {
      do: ['Plan a proper date night', 'Compliment her — she’ll feel it', 'Say yes to social plans', 'Have the important conversations now — communication flows'],
      avoid: ['Cancelling plans last minute', 'Staying in every night'],
      gifts: ['A dinner reservation', 'Something to wear out', 'Her favourite flowers', 'A surprise night out'],
      say: 'Dress up — I’m taking you out this weekend.',
      date: 'Dinner out, dancing or an event',
    },
    friend: {
      do: ['Get the group together', 'Plan the big night out', 'Take photos — she’ll be glowing'],
      plan: 'Dinner, drinks or a party',
      say: 'Group dinner this weekend? You’re in charge of the vibe 💃',
    },
  },
  luteal: {
    feel: 'Progesterone is calming at first, then hormones drop before her period. She may feel more sensitive, bloated or easily overwhelmed in the last days.',
    partner: {
      do: ['Be patient and extra gentle', 'Help with chores and logistics', 'Keep her favourite snacks stocked', 'Listen more than you fix', 'Give her space when she asks for it'],
      avoid: ['Saying “is it your period?”', 'Surprise plans or chaos', 'Debating small things'],
      gifts: ['Her favourite comfort snack', 'A massage', 'Rose & orange-peel tea', 'A long bath setup', 'Sweet potato fries 😉'],
      say: 'Long day? I’ve got dinner sorted — want a massage after?',
      date: 'Home-cooked comfort food and an early night',
    },
    friend: {
      do: ['Keep plans small and close', 'Validate, don’t lecture', 'Send something that makes her laugh'],
      plan: 'Walk and talk, or a quiet night in',
      say: 'No pressure to reply — just sending love and a meme 🫶',
    },
  },
};

// Structured, evidence-graded nutrition guide per phase.
// ev: 'strong' (consistent trials / official guidance), 'some' (small or mixed trials),
//     'emerging' (plausible, little direct data), 'tcm' (traditional Chinese medicine).
export const NUTRITION = {
  menstrual: {
    focus: 'Replace what you lose, calm cramps, stay warm.',
    why: 'You lose roughly 15–20 mg of iron each period, and low iron is one of the most common causes of fatigue in women. Anti-inflammatory fats and magnesium may ease cramps.',
    energy: 'Appetite is usually normal. Eat regularly — skipping meals makes fatigue and cramps worse.',
    plate: [['Cooked veg & greens', 40], ['Iron-rich protein', 30], ['Roots & stewed fruit', 20], ['Nuts, seeds & fats', 10]],
    needs: [
      { n: 'Iron', target: '18 mg / day', why: 'Rebuilds what bleeding takes. Heme iron (red meat, fish) absorbs best; pair plant iron with vitamin C.', foods: ['Red meat', 'Lentils', 'Spinach', 'Sardines', 'Pumpkin seeds', 'Beetroot'], ev: 'strong' },
      { n: 'Vitamin C', target: 'With every iron meal', why: 'Can multiply absorption of plant iron.', foods: ['Peppers', 'Citrus', 'Kiwi', 'Strawberries', 'Broccoli'], ev: 'strong' },
      { n: 'Omega-3', target: '2 portions oily fish / week', why: 'Small trials show less period pain with fish oil.', foods: ['Salmon', 'Sardines', 'Walnuts', 'Chia', 'Flax'], ev: 'some' },
      { n: 'Magnesium', target: '310–320 mg / day', why: 'Relaxes smooth muscle; small trials suggest cramp relief.', foods: ['Dark chocolate 70%+', 'Almonds', 'Spinach', 'Black beans', 'Avocado'], ev: 'some' },
      { n: 'Ginger', target: '1–2 g / day', why: 'Several trials find ginger eases menstrual pain about as well as common painkillers.', foods: ['Fresh ginger', 'Ginger tea'], ev: 'some' },
      { n: 'Warming foods', target: 'Every meal', why: 'TCM keeps the womb warm so Blood flows smoothly.', foods: ['Soups & stews', 'Stewed fruit', 'Red dates', 'Cinnamon'], ev: 'tcm' },
    ],
    day: [
      { meal: 'Breakfast', what: 'Warm Beet & Apple Bowl with ginger & pumpkin seeds', recipe: 'raw-beet-slaw' },
      { meal: 'Lunch', what: 'Iron Glow Lentil Soup with a squeeze of lemon', recipe: 'iron-lentil-soup' },
      { meal: 'Snack', what: 'Magnesium Bliss Bites or 2 squares dark chocolate', recipe: 'magnesium-bites' },
      { meal: 'Dinner', what: 'Salmon, roast sweet potato & wilted greens', recipe: null },
      { meal: 'Drink', what: 'Ginger & red date tea, plenty of warm water', recipe: null },
    ],
    limit: [
      { x: 'Raw & cold food and drinks', why: 'TCM: cold slows Blood flow and can worsen cramps. Choose warm, cooked, natural meals during your period.' },
      { x: 'Alcohol', why: 'Dehydrates and can intensify cramps and low mood.' },
    ],
  },
  follicular: {
    focus: 'Build — protein, fibre and fresh, colourful food.',
    why: 'Rising estrogen supports energy, insulin sensitivity and muscle building. A great time for lighter, fresher meals and plenty of protein.',
    energy: 'Appetite tends to be lower and steadier. Focus on quality and protein at every meal.',
    plate: [['Raw veg & salad', 45], ['Protein', 30], ['Fruit', 15], ['Fermented & seeds', 10]],
    needs: [
      { n: 'Protein', target: '1.2–1.6 g / kg', why: 'Supports muscle and recovery while energy is high.', foods: ['Eggs', 'Chicken', 'Greek yoghurt', 'Wild fish', 'Lentils'], ev: 'strong' },
      { n: 'Fibre', target: '25–30 g / day', why: 'Feeds the gut bacteria that help regulate estrogen.', foods: ['Berries', 'Beans', 'Broccoli', 'Flax', 'Apples'], ev: 'some' },
      { n: 'Probiotics', target: 'Daily', why: 'Fermented foods support a diverse gut microbiome.', foods: ['Raw sauerkraut', 'Kimchi', 'Kefir', 'Raw milk', 'Yoghurt'], ev: 'emerging' },
      { n: 'B vitamins', target: 'Daily', why: 'Needed to turn food into energy.', foods: ['Eggs', 'Leafy greens', 'Avocado', 'Sunflower seeds'], ev: 'strong' },
      { n: 'Nourish Yin & Blood', target: 'Most days', why: 'TCM rebuilds Yin after the period.', foods: ['Goji berries', 'Black sesame', 'Seaweed', 'Mulberries'], ev: 'tcm' },
    ],
    day: [
      { meal: 'Breakfast', what: 'Veggie omelette with avocado & raw sauerkraut', recipe: null },
      { meal: 'Lunch', what: 'Spring Green Bowl with eggs & kimchi', recipe: 'spring-green-bowl' },
      { meal: 'Snack', what: 'Greek yoghurt, flax & berries', recipe: null },
      { meal: 'Dinner', what: 'Citrus Salmon Salad', recipe: 'citrus-salmon-salad' },
      { meal: 'Drink', what: 'Goji & chrysanthemum tea', recipe: null },
    ],
    limit: [
      { x: 'Ultra-processed snacks', why: 'Crowd out the fibre and protein your body uses best now.' },
      { x: 'Skipping meals', why: 'TCM: Yin and Blood need steady nourishment to rebuild.' },
    ],
  },
  ovulatory: {
    focus: 'Light, fibre-rich and antioxidant-packed.',
    why: 'Estrogen peaks. Fibre and cruciferous vegetables help your liver and gut process hormones, and antioxidants support the egg and your skin.',
    energy: 'Appetite is often at its lowest around ovulation — lighter meals feel good.',
    plate: [['Raw & cruciferous veg', 45], ['Protein', 25], ['Fruit & berries', 20], ['Seeds & fats', 10]],
    needs: [
      { n: 'Fibre', target: '25–30 g / day', why: 'Helps clear used estrogen through the gut.', foods: ['Raspberries', 'Lentils', 'Chia', 'Pears', 'Artichoke'], ev: 'some' },
      { n: 'Cruciferous veg', target: '1–2 portions / day', why: 'Contain compounds that support liver hormone processing.', foods: ['Broccoli', 'Brussels sprouts', 'Cauliflower', 'Kale', 'Rocket'], ev: 'emerging' },
      { n: 'Antioxidants', target: '5+ colours / day', why: 'Protect cells, skin and eggs from oxidative stress.', foods: ['Berries', 'Tomatoes', 'Green tea', 'Peppers', 'Pomegranate'], ev: 'some' },
      { n: 'Zinc', target: '8 mg / day', why: 'Involved in ovulation and skin health.', foods: ['Pumpkin seeds', 'Shellfish', 'Chickpeas', 'Beef', 'Cashews'], ev: 'some' },
      { n: 'Hydration', target: '2+ litres', why: 'Supports cervical fluid and energy.', foods: ['Water', 'Cucumber', 'Watermelon', 'Herbal tea'], ev: 'emerging' },
      { n: 'Gentle cooling', target: 'Balance', why: 'TCM: Yang is rising — balance heat with lighter, fresh foods.', foods: ['Cucumber', 'Mung beans', 'Leafy greens', 'Lotus seeds'], ev: 'tcm' },
    ],
    day: [
      { meal: 'Breakfast', what: 'Raw Berry Chia Bowl', recipe: 'berry-quinoa-bowl' },
      { meal: 'Lunch', what: 'Living Green Salad', recipe: 'living-green-salad' },
      { meal: 'Snack', what: 'Pumpkin seeds & a pear', recipe: null },
      { meal: 'Dinner', what: 'Glow Stir-Fry with broccoli & sprouts', recipe: 'cruciferous-stir-fry' },
      { meal: 'Drink', what: 'Rose & hawthorn tea, lots of water', recipe: null },
    ],
    limit: [
      { x: 'Very spicy, greasy food', why: 'TCM: adds heat when Yang is already rising.' },
      { x: 'Lots of alcohol', why: 'Burdens the liver while it processes peak estrogen.' },
    ],
  },
  luteal: {
    focus: 'Steady blood sugar, calm mood, beat bloating.',
    why: 'Progesterone raises body temperature and metabolism slightly (studies estimate ~3–10%), so hunger is real. Complex carbs, protein and calcium help keep cravings and PMS in check.',
    energy: 'You may genuinely need a little more — an extra balanced snack is reasonable. Don’t fight hunger with willpower; plan for it.',
    plate: [['Roots & squash', 30], ['Veg', 30], ['Protein', 25], ['Nuts, seeds & fats', 15]],
    needs: [
      { n: 'Calcium', target: '1,000–1,200 mg / day', why: 'The most consistent evidence of any nutrient for reducing PMS symptoms.', foods: ['Raw milk', 'Kefir', 'Yoghurt', 'Almonds', 'Sardines', 'Tahini'], ev: 'strong' },
      { n: 'Slow carbs', target: 'Every meal', why: 'Steady blood sugar means fewer cravings and mood dips; may support serotonin.', foods: ['Sweet potato', 'Squash', 'Beetroot', 'Chickpeas', 'Dates'], ev: 'some' },
      { n: 'Vitamin B6', target: '1.3 mg / day (food)', why: 'Mixed trials suggest help with PMS mood symptoms.', foods: ['Chickpeas', 'Bananas', 'Turkey', 'Salmon', 'Potatoes'], ev: 'some' },
      { n: 'Magnesium', target: '310–320 mg / day', why: 'May ease bloating, breast tenderness and sleep.', foods: ['Pumpkin seeds', 'Dark chocolate', 'Spinach', 'Cashews', 'Black beans'], ev: 'some' },
      { n: 'Potassium', target: 'Plenty', why: 'Balances sodium and helps with water retention.', foods: ['Bananas', 'Avocado', 'Coconut water', 'Beans', 'Spinach'], ev: 'emerging' },
      { n: 'Move Liver Qi', target: 'Daily', why: 'TCM: smooth Qi flow prevents PMS, tension and bloating.', foods: ['Rose tea', 'Tangerine peel', 'Radish', 'Fennel', 'Lemon'], ev: 'tcm' },
    ],
    day: [
      { meal: 'Breakfast', what: 'Yoghurt with banana, raw honey, tahini & walnuts', recipe: null },
      { meal: 'Lunch', what: 'Sweet Potato Comfort Bowl', recipe: 'sweet-potato-bowl' },
      { meal: 'Snack', what: 'Magnesium Bliss Bites + a glass of kefir', recipe: 'magnesium-bites' },
      { meal: 'Dinner', what: 'Turkey or wild fish with roasted squash & a big salad (warm greens in the last days)', recipe: null },
      { meal: 'Drink', what: 'Rose & orange-peel tea; peppermint for bloating', recipe: null },
    ],
    limit: [
      { x: 'Salty, processed food', why: 'Sodium worsens water retention and bloating.' },
      { x: 'Refined sugar & alcohol', why: 'Blood-sugar crashes amplify irritability and cravings.' },
      { x: 'Raw & cold food in the last 2–3 days', why: 'TCM: start eating warm and cooked before your period arrives, to prepare the womb.' },
    ],
  },
};

// Food fixes for logged symptoms.
export const SYMPTOM_FOODS = {
  Cramps: { foods: ['Ginger tea', 'Salmon', 'Dark chocolate', 'Pumpkin seeds'], tip: 'Ginger, omega-3 and magnesium have the best small-trial support. Keep your belly warm.', ev: 'some' },
  Bloating: { foods: ['Peppermint tea', 'Bananas', 'Cucumber', 'Fennel'], tip: 'Cut back on salt and fizzy drinks; potassium-rich foods help balance water.', ev: 'emerging' },
  Cravings: { foods: ['Greek yoghurt', 'Dates + almonds', 'Apple + nut butter', 'Dark chocolate'], tip: 'Pair carbs with protein so blood sugar stays steady. Hunger in the luteal phase is real.', ev: 'some' },
  Fatigue: { foods: ['Lentils + lemon', 'Red meat', 'Spinach', 'Eggs'], tip: 'Think iron + vitamin C. If tiredness lasts, ask for a ferritin test.', ev: 'strong' },
  Acne: { foods: ['Pumpkin seeds', 'Salmon', 'Berries', 'Green tea'], tip: 'Lower-sugar, lower-dairy days and zinc-rich foods may help hormonal breakouts.', ev: 'emerging' },
  Headache: { foods: ['Water', 'Spinach', 'Almonds', 'Banana'], tip: 'Hydrate first; magnesium-rich foods may help hormone-related headaches.', ev: 'some' },
  Insomnia: { foods: ['Kiwi', 'Tart cherries', 'Warm raw milk & honey', 'Pumpkin seeds'], tip: 'A light, naturally sweet snack before bed — banana or a few dates — can help.', ev: 'emerging' },
  Constipation: { foods: ['Prunes', 'Kiwi', 'Chia pudding', 'Warm water'], tip: 'Progesterone slows digestion — fibre plus plenty of fluid.', ev: 'strong' },
  'Tender breasts': { foods: ['Flax seeds', 'Leafy greens', 'Herbal tea'], tip: 'Going easy on salt and wearing a supportive bra are the most common advice.', ev: 'emerging' },
  Nausea: { foods: ['Ginger', 'Banana', 'Peppermint tea'], tip: 'Small, frequent, plain meals.', ev: 'some' },
  'Back pain': { foods: ['Turmeric milk', 'Salmon', 'Ginger'], tip: 'Anti-inflammatory foods plus heat on the lower back.', ev: 'emerging' },
  Dizziness: { foods: ['Water + pinch of salt', 'Lentils', 'Dates'], tip: 'Hydrate and eat regularly; check iron if it repeats.', ev: 'some' },
};

export const EVIDENCE = {
  strong: { label: 'Strong evidence', short: 'Strong' },
  some: { label: 'Some evidence', short: 'Some' },
  emerging: { label: 'Emerging', short: 'Emerging' },
  tcm: { label: 'Traditional (TCM)', short: 'TCM' },
};

// Whole-body relief guide per symptom: body, food link (SYMPTOM_FOODS), TCM, red flags.
export const RELIEF = {
  'Ovulation pain': {
    why: 'A one-sided twinge, cramp or dull ache low in your belly as the follicle stretches and releases the egg (“mittelschmerz”). A little fluid released with the egg can irritate the belly lining. It usually lasts minutes to 1–2 days and can switch sides from month to month.',
    steps: [
      { t: 'Heat on the sore side', d: 'A hot water bottle or heat pad for 15–20 minutes relaxes the muscles around the ovary.', ev: 'some' },
      { t: 'Pain relief with food', d: 'Ibuprofen or naproxen calm the prostaglandins behind the twinge — take with food, if they are safe for you.', ev: 'some' },
      { t: 'Warm bath with magnesium salts', d: '15 minutes in warm water with Epsom or magnesium flakes to soften the cramp.', ev: 'emerging' },
      { t: 'Gentle movement', d: 'A slow walk, child’s pose or lying on your side with knees pulled in often eases it fast.', ev: 'emerging' },
      { t: 'Ginger or chamomile tea', d: 'Warm, anti-inflammatory and calming for the lower belly.', ev: 'emerging' },
      { t: 'Light, warm meals', d: 'Skip big heavy meals and fizzy drinks that add bloating on top of the twinge.', ev: 'emerging' },
      { t: 'Press LV3 (Taichong)', d: 'On the top of the foot between the big and second toe, 1–2 minutes each side, to “move” stuck energy.', ev: 'tcm', to: 'point/luteal' },
    ],
    tcm: 'Chinese medicine sees this as a brief “stuck” moment while the body pushes the egg out. Warmth and gentle movement help it flow.',
    doctor: 'Sharp or severe one-sided pain, pain with fever, vomiting or fainting, or pain lasting more than 2 days.',
  },
  Cramps: {
    why: 'Prostaglandins make the uterus contract to shed its lining; higher levels mean stronger cramps.',
    steps: [
      { t: 'Heat on your lower belly or back', d: 'A heat pad or hot water bottle for 20+ minutes. Reviews of many trials find heat eases period pain about as well as ibuprofen.', ev: 'strong' },
      { t: 'Anti-inflammatory pain relief early', d: 'Ibuprofen or naproxen work best taken at the first sign of pain, with food (if they are safe for you).', ev: 'strong' },
      { t: 'Gentle movement', d: 'Walking, stretching or yoga can ease pain — even 10 minutes.', ev: 'some' },
      { t: 'Ginger tea', d: '1–2 g of ginger a day; small trials compare it to common painkillers.', ev: 'some' },
      { t: 'Press SP6', d: 'Four finger-widths above the inner ankle bone, 1–3 minutes each side. Small, low-quality trials.', ev: 'tcm', to: 'point/menstrual' },
    ],
    tcm: 'Cramps are seen as stuck Qi and Blood, often with Cold. Keep warm, avoid raw and cold food and drinks, try a ginger foot soak.',
    doctor: 'Pain that stops normal life, gets worse over the years, or comes with pain during sex or bowel movements — endometriosis is common and under-diagnosed.',
  },
  'PMS mood': {
    why: 'The late-luteal drop in estrogen and progesterone affects serotonin, which can bring irritability, low mood and anxiety.',
    steps: [
      { t: 'Move most days', d: 'Regular aerobic exercise is one of the most recommended lifestyle steps for PMS.', ev: 'some' },
      { t: 'Calcium-rich foods', d: '1,000–1,200 mg/day — the most consistent nutrient evidence for PMS.', ev: 'strong' },
      { t: 'Protect sleep', d: 'Poor sleep amplifies irritability. Same bedtime, cool room.', ev: 'some' },
      { t: 'Go easy on alcohol late luteal', d: 'It can worsen anxiety, low mood and sleep.', ev: 'emerging' },
      { t: 'Name it', d: 'Writing "this is day 26 talking" helps many women separate hormones from real problems.', ev: 'emerging' },
    ],
    tcm: 'Liver Qi stagnation — move it with walking, side stretches, rose tea and letting feelings out.',
    doctor: 'If mood symptoms are severe, affect relationships or work, or include hopelessness, ask about PMDD. It is common and treatable.',
  },
  Bloating: {
    why: 'Progesterone slows digestion and hormone shifts cause water retention before your period.',
    steps: [
      { t: 'Less salt, more potassium', d: 'Swap salty snacks for banana, avocado, cucumber or coconut water.', ev: 'emerging' },
      { t: 'Peppermint or fennel tea', d: 'Traditionally used to ease gas; peppermint relaxes the gut.', ev: 'some' },
      { t: 'Walk after meals', d: '10 minutes helps move gas and digestion.', ev: 'some' },
      { t: 'Smaller, warm meals', d: 'Cooked food with ginger, fennel or cinnamon is easier to digest than large cold meals.', ev: 'tcm' },
    ],
    tcm: 'Spleen Qi needs warmth to transform fluids — choose cooked food, ginger and fennel, and fewer raw salads and cold drinks.',
    doctor: 'Bloating that lasts all month, gets steadily worse, or comes with weight loss or early fullness.',
  },
  Insomnia: {
    why: 'After ovulation progesterone raises night-time body temperature by about 0.3–0.5°C, and sleep is often worst in the 5–7 days before your period.',
    steps: [
      { t: 'Cool bedroom', d: 'Around 16–18°C, light bedding. Your body needs to cool down to fall asleep.', ev: 'some' },
      { t: 'Warm shower before bed', d: 'The temperature drop afterwards helps you fall asleep.', ev: 'some' },
      { t: 'Morning daylight', d: '10 minutes outside early in the day helps set your sleep clock.', ev: 'some' },
      { t: 'Magnesium-rich evening snack', d: 'Pumpkin seeds, banana or a little dark chocolate.', ev: 'emerging' },
    ],
    tcm: 'Heart and Liver Blood calm the Shen (spirit). Sleep before 11pm, chamomile or jujube (red date) tea.',
    doctor: 'Insomnia most nights for 3+ months, or loud snoring and gasping.',
  },
  Acne: {
    why: 'Androgens and the late-luteal fall in estrogen increase oil production, so breakouts often appear on the jaw and chin before a period.',
    steps: [
      { t: 'Gentle, consistent skincare', d: 'Don’t over-scrub. Salicylic acid or benzoyl peroxide on active spots.', ev: 'strong' },
      { t: 'Lower-sugar days', d: 'High-glycaemic diets are linked to more acne.', ev: 'some' },
      { t: 'Zinc-rich foods', d: 'Pumpkin seeds, chickpeas, shellfish.', ev: 'some' },
      { t: 'Hands off', d: 'Picking spreads inflammation and causes marks.', ev: 'strong' },
    ],
    tcm: 'Seen as Heat in the Blood or Stomach — fewer fried, spicy and sugary foods; mung beans and green tea cool.',
    doctor: 'Painful cystic acne, scarring, or acne with irregular periods and extra hair growth (ask about PCOS).',
  },
  Headache: {
    why: 'The drop in estrogen just before your period can trigger headaches and menstrual migraine.',
    steps: [
      { t: 'Hydrate first', d: 'A big glass of water, then reassess.', ev: 'some' },
      { t: 'Regular meals', d: 'Skipping meals is a common trigger.', ev: 'some' },
      { t: 'Magnesium-rich foods', d: 'Some evidence for menstrual migraine prevention.', ev: 'some' },
      { t: 'Dark, quiet rest', d: 'With a cool cloth on the forehead or neck.', ev: 'emerging' },
    ],
    tcm: 'Often Liver Yang rising — press LV3 on the foot, avoid skipping meals and late nights.',
    doctor: 'A sudden "worst ever" headache, headaches with vision or speech changes, or migraine with aura if you take the combined pill.',
  },
  Fatigue: {
    why: 'Low hormones during your period, iron loss and poor late-luteal sleep all drain energy.',
    steps: [
      { t: 'Iron + vitamin C', d: 'Lentils with lemon, red meat, spinach with peppers.', ev: 'strong' },
      { t: 'Daylight in the morning', d: '10 minutes outside helps set your body clock and energy.', ev: 'some' },
      { t: 'Lower the bar', d: 'Move non-essential tasks to your follicular phase.', ev: 'emerging' },
    ],
    tcm: 'Qi and Blood deficiency — red dates, goji, bone broth, stewed fruit and early nights.',
    doctor: 'Ongoing exhaustion, breathlessness or very heavy periods — ask for a ferritin (iron stores) test.',
  },
  'Tender breasts': {
    why: 'Estrogen and progesterone stimulate breast tissue in the luteal phase.',
    steps: [
      { t: 'Supportive bra', d: 'Including a soft one for sleep.', ev: 'some' },
      { t: 'Go easy on salt', d: 'Commonly advised to ease fluid retention; evidence is mixed.', ev: 'emerging' },
      { t: 'Warm or cool compress', d: 'Whichever feels better.', ev: 'emerging' },
    ],
    tcm: 'The Liver channel runs through the breasts — tenderness points to Liver Qi stagnation. Rose tea and side stretches.',
    doctor: 'A new lump, pain in one spot that doesn’t change with your cycle, or nipple discharge.',
  },
};

// "Gottes Nahrung": food as it was created — the base of every Nourish plan.
export const GOTTES = {
  title: 'Natural food',
  sub: 'Food as it was created — whole, natural, alive.',
  principles: [
    { t: 'Unprocessed & natural', d: 'Whole foods in their original form. No additives, artificial sweeteners, preservatives or refined oils.' },
    { t: 'Raw & living — outside your period', d: 'Fresh fruit, vegetables, sprouts, nuts and seeds. During your period, switch to warm and cooked.' },
    { t: 'Few grains', d: 'Roots, squash, fruit and legumes carry the carbs instead.' },
    { t: 'Raw & fermented', d: 'Raw honey, raw sauerkraut and kimchi for natural enzymes and probiotics.' },
    { t: 'Clean animal foods', d: 'Raw milk, kefir, pasture eggs, wild fish, grass-fed meat.' },
    { t: 'Organic & seasonal', d: 'Local, in season, as close to the earth as possible.' },
  ],
  tcm: 'Chinese medicine: during your period (and the few days before), avoid raw and cold food. Eat warm and cooked — still natural and unprocessed.',
};

// Remedies (Hausmittel) — each tied to a TCM organ/element so it connects to the cycle.
export const REMEDIES = [
  { id: 'lemon-water', name: 'Morning Lemon Water', glyph: '檸', organ: 'Liver', element: 'Wood', nature: 'Lukewarm', phases: ['menstrual', 'follicular', 'ovulatory', 'luteal'], days: 28,
    why: 'A 28-day morning ritual — the length of a cycle. Sour taste belongs to Wood and the Liver in Chinese medicine; lukewarm water is gentle on the stomach and gut.',
    ingredients: ['Juice of ½ fresh lemon (or a lime)', '300 ml lukewarm water'],
    steps: ['Drink it first thing, before breakfast.', 'Keep it lukewarm, never ice-cold — kinder to your stomach and, in TCM, to your womb.', 'Start on day 1 of your cycle and keep going for 28 days.'],
    weeks: [
      { w: 1, add: 'Pinch of cayenne', gain: 'Better hydration, gentle digestion boost. Cayenne warms and gets circulation flowing.' },
      { w: 2, add: 'Pinch of good salt', gain: 'More energy, more hydrated skin. Salt supports electrolytes, nerves and muscles.' },
      { w: 3, add: 'Keep going', gain: 'Antioxidant protection rises.' },
      { w: 4, add: 'Coconut water or 1 tsp apple cider vinegar', gain: 'Supports detox. Coconut water is a natural electrolyte drink; apple cider vinegar can soften blood-sugar spikes and supports digestion.' },
    ] },
  { id: 'lung-elixir', name: 'Honey-Garlic Lung Elixir', glyph: '肺', organ: 'Lung', element: 'Metal', nature: 'Warming', phases: ['menstrual', 'follicular', 'ovulatory', 'luteal'],
    why: 'Raw honey, garlic, ginger and turmeric — a pungent, warming jar for the Lung (Metal element). Let garlic rest after pressing so its allicin can form.',
    ingredients: ['20 g raw honey (manuka is ideal)', '1 tsp ginger powder', '1 tsp turmeric powder', '2–8 cloves raw garlic, pressed', '1 tsp black seed oil'],
    steps: ['Press the garlic and leave it for 10 minutes.', 'Mix everything in a small jar and close it.', 'Let it rest overnight — it will smell strong when you open it.', 'Take a spoonful at a time.'] },
  { id: 'circulation-shot', name: 'Circulation Shot', glyph: '心', organ: 'Heart', element: 'Fire', nature: 'Warming', phases: ['menstrual', 'ovulatory', 'luteal'],
    why: 'Olive oil, cayenne, chia and fresh lemon. Cayenne gets blood flowing — in TCM, moving Blood is exactly what your period needs; the Heart sends Blood to the womb.',
    ingredients: ['1 tbsp extra-virgin olive oil', 'Pinch of cayenne', '1 tsp chia seeds', 'Juice of ½ lemon', 'A little lukewarm water'],
    steps: ['Stir chia into lemon juice and water.', 'Let it swell for 10 minutes.', 'Add olive oil and cayenne, stir and drink.'] },
  { id: 'gut-smoothie', name: 'Raw Gut Smoothie', glyph: '脾', organ: 'Spleen', element: 'Earth', nature: 'Cooling · raw', raw: true, phases: ['follicular', 'ovulatory', 'luteal'],
    why: 'Kefir or raw milk for probiotics, green banana for prebiotics, raw yolks, cinnamon and turmeric — a gut-building raw smoothie for your raw-first days.',
    ingredients: ['200 ml kefir or raw milk', '1 green-ish banana', 'Optional: 2 raw egg yolks', 'Pinch of cinnamon & turmeric', '1 tsp raw honey', '2 tbsp berries (blueberry, raspberry, blackberry or elderberry)'],
    steps: ['Add everything to a blender.', 'Blend until creamy.', 'During your period and the days before, swap for a warm drink instead — TCM keeps cold away then.'] },
  { id: 'carrot-salad', name: 'Raw Carrot Salad', glyph: '蘿', organ: 'Liver', element: 'Wood', nature: 'Cooling · raw', raw: true, phases: ['follicular', 'ovulatory', 'luteal'],
    why: 'A daily raw carrot is a popular folk remedy said to bind excess estrogen in the gut — little research, but it is fibre-rich. The Liver (Wood) processes hormones.',
    ingredients: ['1 raw carrot, grated or peeled into ribbons', '1 tsp coconut oil or olive oil', '1 tsp apple cider vinegar', 'Pinch of sea salt'],
    steps: ['Grate or ribbon the carrot.', 'Toss with oil, vinegar and salt.', 'Eat between meals, daily. Pause during your period and the 3 days before (warm days) — swap for cooked carrots.'] },
  { id: 'heart-foods', name: 'Heart Support', glyph: '紅', organ: 'Heart', element: 'Fire', nature: 'Daily foods', phases: ['ovulatory', 'luteal', 'menstrual', 'follicular'],
    why: 'Foods and nutrients for heart and circulation: magnesium, omega-3, CoQ10, vitamin D3 + K2, selenium and B vitamins.',
    ingredients: ['Pomegranate', 'Raw cacao', 'Beetroot', 'Raw garlic', 'Turmeric', 'Extra-virgin olive oil', 'Black seed oil', 'Wild fish (omega-3)'],
    steps: ['Add one or two of these foods to your day.', 'Pomegranate and cacao support the heart every day.', 'Talk to your doctor before adding supplements, especially with heart conditions or medication.'] },
];

// Daily focus: 8 windows across the cycle (scaled to each woman's cycle).
// Research note: abilities don't reliably change across the cycle (2025 meta-analysis, 102 studies);
// energy, mood, symptoms and social drive do — so this plans around energy, not capability.
export const DAY_GUIDE = {
  'flow-start': { title: 'Rest & reflect', energy: 'Lowest', tackle: ['Clear one small, easy task — then stop', 'Review last month: what worked, what didn’t', 'Cancel or move one non-essential plan'],
    best: ['Reflection', 'Journaling', 'Solo time', 'Gentle walks'], ease: 'Big launches, intense training and packed social plans',
    why: 'Hormones are at their lowest and cramps and fatigue peak on days 1–2. Rest is productive now.' },
  'flow-end': { title: 'Ease back in', energy: 'Returning', tackle: ['Plan the month ahead — goals and priorities', 'Sort your inbox and to-do list', 'Light movement: a walk or stretch'],
    best: ['Planning', 'Admin', 'Setting intentions'], ease: 'Overloading your calendar too fast',
    why: 'Bleeding eases and estrogen starts to rise — energy comes back gradually.' },
  'rising': { title: 'Start & learn', energy: 'Rising', tackle: ['Start the project you’ve been putting off', 'Learn something new — a course, a skill, a book', 'Brainstorm ideas and write them all down'],
    best: ['New projects', 'Learning', 'Creativity', 'Strength training'], ease: 'Detail-heavy finishing work — save it for your luteal phase',
    why: 'Rising estrogen tends to lift mood, motivation and openness to new things.' },
  'building': { title: 'Build momentum', energy: 'High', tackle: ['Push your hardest work forward', 'Have the meeting or call you need', 'Try for a personal best in training'],
    best: ['Deep work', 'Collaboration', 'Challenging workouts'], ease: 'Saying yes to everything just because you feel great',
    why: 'Estrogen climbs toward its peak; many women feel their most energetic and resilient.' },
  'peak': { title: 'Connect & speak up', energy: 'Peak', tackle: ['Pitch, present, negotiate or ask for what you want', 'Network — reach out to 3 people', 'Have the important conversation'],
    best: ['Communication', 'Dates', 'Content & photos', 'Socialising'], ease: 'Over-committing your next two weeks',
    why: 'Estrogen and testosterone peak around ovulation, often bringing more confidence, libido and social drive.' },
  'settle': { title: 'Steady focus', energy: 'Steady', tackle: ['Work through your most important project step by step', 'Tidy up loose ends from your busy week', 'Steady, moderate training'],
    best: ['Focused work', 'Routines', 'Cooking at home'], ease: 'Starting too many new things at once',
    why: 'Progesterone rises and has a calming effect — a good window for steady, grounded work.' },
  'focus': { title: 'Finish & organise', energy: 'Moderate', tackle: ['Finish and ship what you started', 'Admin, editing, numbers and details', 'Declutter one space at home'],
    best: ['Completing tasks', 'Detail work', 'Organising', 'Nesting'], ease: 'Late nights and high-stress plans',
    why: 'Body temperature and appetite rise slightly; many women prefer structured, familiar tasks now.' },
  'premenstrual': { title: 'Simplify & protect', energy: 'Lower', tackle: ['Do only your top 1–2 priorities', 'Add buffer time between plans', 'Prepare for your period: warm food, supplies, an easy calendar'],
    best: ['Boundaries', 'Self-care', 'Quiet wins', 'Early nights'], ease: 'Big decisions when you feel irritable — sleep on them',
    why: 'Estrogen and progesterone fall; PMS, sensitivity and poorer sleep are most common in these last days.' },
};

// The hormones that run a woman's body — what they do and how they show up in the cycle.
// s: one-line overview · range: typical adult female amounts · ev: evidence for the "support it" line
export const HORMONE_LIBRARY = [
  { n: 'Oestrogen', g: 'Ovaries', s: 'Energy, mood, skin & bones', range: 'Estradiol about 30 pg/mL on your period, 200–400 at its peak before ovulation, 100–200 in the second half', ev: 'some', role: 'Your main female hormone. It rebuilds the womb lining each month and also acts on your brain, mood, skin, hair, bones, heart, blood vessels, breasts, urinary tract and fertility.', cycle: 'Rises through the follicular phase and peaks 1–2 days before ovulation. It dips after the egg is released, then has a second, smaller rise in the second half of your cycle before falling before your period.', support: 'Fibre and cruciferous veg (broccoli, cabbage, rocket) help your gut clear used estrogen; a daily raw carrot is a popular extra.' },
  { n: 'Progesterone', g: 'Ovaries (yellow body)', s: 'Calm, sleep & warmth', range: 'Under 1 ng/mL before ovulation, about 5–20 ng/mL a week after it', ev: 'some', role: 'Made by the “yellow body” (corpus luteum) left behind after the egg is released. It prepares and holds the womb lining for a possible pregnancy, calms the nervous system and raises your body temperature by about 0.3–0.5 °C.', cycle: 'Only rises after ovulation. It peaks about 7 days later, then falls before your period — that drop starts the bleed.', support: 'Ovulating regularly is what makes it. Enough food, eggs, vitamin C, zinc, magnesium and low stress support that.' },
  { n: 'FSH', g: 'Pituitary gland', s: 'Wakes up your eggs', range: 'About 3–10 IU/L on your period, a short spike to 10–20 at ovulation', ev: 'some', role: 'Follicle-stimulating hormone — the “wake-up call” for your ovaries. Your brain sends FSH to tell a small group of follicles (tiny sacs that each hold an egg) to start growing. The strongest one becomes the egg you release, and as it grows it makes estrogen.', cycle: 'Rises at the very end of one cycle and the start of the next, during your period, to start a new egg growing. A small spike follows at ovulation.', support: 'Steady sleep, enough calories and protein, and less stress — your brain sends strong signals when it feels safe and fed.' },
  { n: 'LH', g: 'Pituitary gland', s: 'Releases the egg', range: 'About 2–10 IU/L most of the month, a surge to 20–80 IU/L before ovulation', ev: 'some', role: 'Luteinising hormone — the “release” signal. A sudden LH surge tells the ripe follicle to burst open and release its egg. Ovulation tests measure this surge.', cycle: 'Surges about 24–36 hours before ovulation, then drops back.', support: 'Manage stress and eat enough — high stress and under-eating can blunt or delay the surge.' },
  { n: 'Testosterone', g: 'Ovaries & adrenal glands', s: 'Drive, libido & muscle', range: 'About 15–70 ng/dL, slightly higher around ovulation', ev: 'some', role: 'Women make it in small amounts. It supports sex drive, motivation, muscle and bone strength, and helps make red blood cells.', cycle: 'Rises a little around ovulation — that’s part of why libido and confidence peak then.', support: 'Strength training, zinc (oysters, red meat, pumpkin seeds) and healthy fats.' },
  { n: 'Prolactin', g: 'Pituitary gland', s: 'Milk, rest & recovery', range: 'About 5–25 ng/mL; higher at night and after stress', ev: 'emerging', role: 'Best known for making breast milk after birth. Outside pregnancy, too much of it can quietly switch off ovulation.', cycle: 'Slightly higher in the second half of your cycle. Stress, poor sleep and some medicines raise it and can disturb ovulation.', support: 'Rest, deep sleep, B6-rich foods (eggs, fish, banana) and gentle evenings.' },
  { n: 'SHBG', g: 'Liver', s: 'Carries your hormones', range: 'About 20–130 nmol/L', ev: 'some', role: 'A protein that carries estrogen and testosterone in the blood. Only the unbound part can act, so SHBG decides how strongly you feel your hormones.', cycle: 'Stays fairly steady across the month. High insulin lowers it, which leaves more free testosterone (think acne).', support: 'Stable blood sugar, enough protein and a healthy liver.' },
  { n: 'Insulin', g: 'Pancreas', s: 'Your blood-sugar key', range: 'Fasting about 2–10 µIU/mL in healthy women', ev: 'strong', role: 'Moves sugar from your blood into your cells for energy and stores the rest.', cycle: 'Your cells are a little less insulin-sensitive in the second half of your cycle, so cravings and dips are more common then.', support: 'Protein with every meal, strength training and a short walk after meals.' },
  { n: 'Cortisol', g: 'Adrenal glands', s: 'Stress & morning energy', range: 'About 10–20 µg/dL in the morning, under 5 at night', ev: 'some', role: 'Your daily stress and energy hormone. It peaks about 30 minutes after waking to get you going, keeps blood sugar up and calms inflammation — then should fall low by night so you can sleep.', cycle: 'You’re more sensitive to stress in the days before your period. Long-term stress can delay ovulation and worsen PMS.', support: 'Morning daylight, nature, slow breathing, yoga, enough sleep and magnesium.' },
  { n: 'Adrenaline', g: 'Adrenal glands', s: 'Fight or flight', range: 'Very low at rest; spikes within seconds when you’re startled or stressed', ev: 'some', role: 'The fast “fight or flight” signal: heart and breathing speed up and sugar is released for quick energy.', cycle: 'Constant alerts, rushing and scrolling keep it switched on, which wears you out.', support: 'Phone-free time, slow breathing with long exhales, time outside.' },
  { n: 'Thyroid hormones', g: 'Thyroid gland', s: 'Your body’s thermostat', range: 'TSH about 0.5–4 mIU/L; free T4 about 0.8–1.8 ng/dL', ev: 'some', role: 'Set your metabolism — how fast you use energy, make heat and burn fuel.', cycle: 'Stay steady across the month. A low thyroid can cause irregular or heavy periods, tiredness and cold hands and feet.', support: 'Enough carbs and calories, selenium (Brazil nuts), iodine (fish, seaweed) and iron.' },
  { n: 'Melatonin', g: 'Pineal gland', s: 'Darkness & deep sleep', range: 'Under 10 pg/mL by day, rising to about 50–150 pg/mL at night', ev: 'some', role: 'The darkness signal. It rises after sunset, makes you sleepy and lowers body temperature. It’s also an antioxidant found in the fluid around your eggs.', cycle: 'Sleep often gets lighter in the days before your period, so darkness matters even more then.', support: 'Darkness at night, warm low light after sunset, morning daylight to time it right.' },
  { n: 'Serotonin', g: 'Brain & gut', s: 'Mood & calm', range: 'Not measured in a normal blood test', ev: 'some', role: 'A messenger for mood, calm and digestion — and the building block for melatonin. Most of it is made in the gut, but the serotonin that shapes mood is made in the brain.', cycle: 'Estrogen supports it, so it can dip as estrogen falls before your period — part of PMS low mood.', support: 'Daylight, movement, protein (tryptophan) with slow carbs, and a healthy gut.' },
  { n: 'Active vitamin D', g: 'Skin, then liver & kidneys', s: 'Sunshine hormone', range: 'Blood test (25-OH-D): about 30–60 ng/mL (75–150 nmol/L) is a good level', ev: 'some', role: 'Your skin makes vitamin D from sunlight; the liver and kidneys turn it into the active hormone (calcitriol). It controls calcium for strong bones and supports immunity and mood.', cycle: 'Low levels are linked to irregular cycles, worse PMS and lower fertility.', support: 'Midday sun on your skin in spring and summer, oily fish, egg yolks, butter — and a test in late winter.' },
];

// Daily hormone habits — the positive side of what harms women's health, plus fertility fundamentals.
export const HABITS = [
  { id: 'phone-free', g: 'protect', t: 'Phone-free first & last hour', why: 'Constant scrolling and alerts keep stress hormones switched on.' },
  { id: 'calm', g: 'protect', t: '10 minutes of calm', why: 'Chronic stress raises cortisol, which can delay ovulation and worsen PMS.' },
  { id: 'coffee', g: 'protect', t: 'Coffee or tea with food, not instead of it', why: 'Enjoy it — just not on an empty stomach or as a replacement for sleep.' },
  { id: 'sleep', g: 'protect', t: '7–9 hours of sleep', why: 'Sleep sets melatonin, cortisol and every other hormone rhythm.' },
  { id: 'real-food', g: 'protect', t: 'Real food — nothing ultra-processed', why: 'Whole, natural food steadies blood sugar and insulin.' },
  { id: 'alcohol-free', g: 'protect', t: 'Alcohol-free day', why: 'Frequent alcohol burdens the liver, which clears used estrogen.' },
  { id: 'no-blue', g: 'protect', t: 'No bright screens after dark', why: 'Blue light at night suppresses melatonin.' },
  { id: 'move', g: 'protect', t: 'Move your body', why: 'Activity — especially strength training — improves insulin sensitivity.' },
  { id: 'nature', g: 'protect', t: 'Time in nature', why: 'Daylight and green space lower stress and support serotonin.' },
  { id: 'clean', g: 'protect', t: 'Natural cosmetics & no synthetic perfume', why: 'Many synthetic fragrances and chemicals can disrupt hormones.' },
  { id: 'warm-feet', g: 'fertile', t: 'Warm feet, warm womb', why: 'Socks and warmth — classic Chinese-medicine care for the womb.' },
  { id: 'egg-yolks', g: 'fertile', t: 'Egg yolks or liver today', why: 'Cholesterol is the building block of progesterone; yolks add choline. Keep liver to a small portion about once a week.' },
  { id: 'warm-soup', g: 'fertile', t: 'A warm soup or broth', why: 'Nourishing and easy to digest — TCM builds Blood with warmth.' },
  { id: 'magnesium-bath', g: 'fertile', t: 'Long hot magnesium bath', why: 'Relaxes muscles and the nervous system; magnesium for sleep. After ovulation, keep it warm rather than hot.' },
  { id: 'phone-away', g: 'fertile', t: 'Phone & laptop away from your belly', why: 'Keep devices off your lap and out of your front pockets.' },
  { id: 'dance', g: 'fertile', t: 'Dance', why: 'Joyful movement lowers cortisol.' },
  { id: 'snuggle', g: 'fertile', t: 'Snuggles & touch', why: 'Oxytocin calms stress and supports connection.' },
  { id: 'beauty', g: 'fertile', t: 'Surround yourself with beauty', why: 'Flowers, music, art — pleasure is regulating.' },
  { id: 'lemon', g: 'fertile', t: 'Whole lemon drink', why: 'Hydration and vitamin C to start the day.' },
  { id: 'intuition', g: 'fertile', t: 'Listen to your intuition', why: 'Notice what your body is asking for today.' },
  { id: 'pray', g: 'fertile', t: 'Prayer or intention', why: 'A quiet moment for your body, your future and your future children.' },
  { id: 'slow', g: 'fertile', t: 'Slow down — especially on your period', why: 'Rest during bleeding is part of a healthy cycle.' },
  { id: 'track', g: 'fertile', t: 'Track your cycle', why: 'Knowing your rhythm is the foundation of everything else.' },
];

// Fertility foods & lifestyle.
export const FERTILITY_FOODS = [
  { f: 'Eggs', why: 'Cholesterol for progesterone, choline for a baby’s brain.' },
  { f: 'Raw carrot', why: 'A folk favourite said to help clear excess estrogen through the gut.' },
  { f: 'Vitamin D (sunlight)', why: 'Optimise levels for egg quality.' },
  { f: 'Raw honey', why: 'Gentle natural sugars for steady energy.' },
  { f: 'High-fat raw dairy', why: 'Full-fat dairy is linked with fewer anovulatory cycles. Once pregnant, choose pasteurised (listeria risk).' },
  { f: 'Red meat', why: 'Bioavailable heme iron and L-carnitine for egg quality.' },
  { f: 'Liver', why: 'Nature’s prenatal multivitamin — vitamin A, folate, B12, iron. Small portion about once a week: too much vitamin A is risky in pregnancy.' },
  { f: 'Butter', why: 'Fat-soluble vitamins A, D, E and K2.' },
  { f: 'Oysters', why: 'The richest source of zinc.' },
  { f: 'Sardines', why: 'Omega-3s to calm pelvic inflammation.' },
  { f: 'Strength training', why: 'Improves insulin sensitivity.' },
  { f: 'Dancing', why: 'Lowers cortisol.' },
];

// Movement by cycle window. Ratings: 3 = best time, 2 = good, 1 = lighter / gentle version, 0 = skip, rest instead.
// Evidence is emerging and mixed (e.g. follicular-weighted strength training studies; McNulty 2020 meta-analysis
// found only small performance dips in the early follicular phase) — energy and how you feel always win.
export const MOVES = [
  { k: 'lift', n: 'Heavy lifting', d: 'Low reps, heavy weights, new personal bests' },
  { k: 'hiit', n: 'HIIT & sprints', d: 'Short, all-out intervals' },
  { k: 'sport', n: 'Cardio & sport', d: 'Running, cycling, dance, team sports, tennis' },
  { k: 'pilates', n: 'Pilates & moderate strength', d: 'Controlled, moderate loads, core' },
  { k: 'yoga', n: 'Yoga & stretching', d: 'Flow yoga early in the cycle, yin & restorative later' },
  { k: 'meditate', n: 'Meditation & breathwork', d: 'Stillness, journaling, slow breathing' },
  { k: 'walk', n: 'Walks & rest', d: 'Nature walks, sauna, early nights' },
];
export const MOVE_GUIDE = {
  'flow-start': { title: 'Rest & restore', r: { lift: 0, hiit: 0, sport: 1, pilates: 1, yoga: 2, meditate: 3, walk: 3 }, tip: 'Hormones are at their lowest and your body is shedding. Walks, yin yoga and meditation — a natural time to turn inward. Skip the PR attempts.' },
  'flow-end': { title: 'Ease back in', r: { lift: 1, hiit: 1, sport: 2, pilates: 2, yoga: 3, meditate: 2, walk: 3 }, tip: 'As bleeding eases, start moving more: flowing yoga, pilates, light strength. Iron-rich food helps your energy come back.' },
  'rising': { title: 'Build strength', r: { lift: 2, hiit: 2, sport: 3, pilates: 2, yoga: 2, meditate: 1, walk: 2 }, tip: 'Rising estrogen improves recovery. A great window to try a new class and ramp up your training volume.' },
  'building': { title: 'Lift heavy', r: { lift: 3, hiit: 3, sport: 3, pilates: 2, yoga: 1, meditate: 1, walk: 2 }, tip: 'A good window for heavy lifting if you feel strong — some small studies that put more strength training into the follicular phase saw bigger gains.' },
  'peak': { title: 'Peak power', r: { lift: 3, hiit: 3, sport: 3, pilates: 2, yoga: 1, meditate: 1, walk: 2 }, tip: 'Estrogen and testosterone peak: energy and confidence are often high. Warm up well — ligaments are a little looser around ovulation.' },
  'settle': { title: 'Steady strength', r: { lift: 2, hiit: 2, sport: 2, pilates: 3, yoga: 2, meditate: 2, walk: 2 }, tip: 'Progesterone rises and your body temperature climbs. Keep lifting at moderate weights, take longer rests, drink more water.' },
  'focus': { title: 'Endurance & flow', r: { lift: 2, hiit: 1, sport: 2, pilates: 3, yoga: 2, meditate: 2, walk: 3 }, tip: 'Steady efforts beat all-out ones: pilates, hiking, swimming, steady cardio. Your body burns more fat for fuel now.' },
  'premenstrual': { title: 'Slow down', r: { lift: 1, hiit: 0, sport: 1, pilates: 2, yoga: 3, meditate: 3, walk: 3 }, tip: 'Energy drops before your period. Yin yoga, stretching, walks and meditation calm cramps and moods — rest is training too.' },
};

// Why someone uses the app — only 'conceive' shows pregnancy & fertility content.
export const PURPOSES = [
  { k: 'know', t: 'Understand my body', s: 'Periods, rhythm & biological clock — no fertility content', photo: 'Oestrogen', img: 'images/purpose-body.jpg', pos: '50% 62%' },
  { k: 'conceive', t: 'Trying to get pregnant', s: 'Fertile window, best days, preparing my body', photo: 'Prolactin', img: 'images/purpose-conceive.jpg', pos: '62% 42%' },
  { k: 'menopause', t: 'Menopause', s: 'Perimenopause & menopause support', photo: 'Serotonin', soon: true },
];
// What someone wants help with; each has a tailored tip per phase.
export const FOCUS = [
  { k: 'pms', t: 'Ease PMS & cramps', photo: 'Progesterone' },
  { k: 'skin', t: 'Clearer skin', photo: 'Active vitamin D' },
  { k: 'sleep', t: 'Better sleep', photo: 'Melatonin' },
  { k: 'mood', t: 'Balanced mood', photo: 'Serotonin' },
  { k: 'energy', t: 'More energy', photo: 'Adrenaline' },
  { k: 'eat', t: 'Eat for my cycle', photo: 'Insulin' },
  { k: 'tcm', t: 'Chinese medicine', photo: 'Thyroid hormones' },
  { k: 'hormones', t: 'Understand my hormones', photo: 'LH' },
  { k: 'body', t: 'Snatched, toned body', photo: 'Testosterone' },
  { k: 'bloat', t: 'Less bloating', photo: 'Cortisol' },
  { k: 'regular', t: 'A regular period', photo: 'FSH' },
];
export const TIPS = {
  body: {
    menstrual: 'Gentle walks and stretching. Protein at every meal keeps the muscle you built.',
    follicular: 'Energy is climbing: a good time to add weight or reps to your strength sessions.',
    ovulatory: 'Peak energy: push your heaviest lifts and sprints. Warm up well.',
    luteal: 'Keep lifting at a steady weight, eat a little more and choose protein plus roots over sugar.',
  },
  bloat: {
    menstrual: 'Warm, cooked food and ginger or fennel tea settle your belly.',
    follicular: 'Fermented food (sauerkraut, kefir, raw yoghurt) supports your gut for the weeks ahead.',
    ovulatory: 'Lots of water and fibre help clear extra estrogen.',
    luteal: 'Progesterone slows digestion: less salt, more potassium (avocado, banana, greens), slow walks after meals.',
  },
  regular: {
    menstrual: 'Log every bleed day. Warm, iron-rich meals refill what you lose.',
    follicular: 'Eat enough. Skipping meals or too little carbs can delay ovulation.',
    ovulatory: 'Notice clear, stretchy discharge: it is a sign you are ovulating.',
    luteal: 'Sleep and calm matter now. High stress can shorten this phase.',
  },
  pms: {
    menstrual: 'Heat on your belly and magnesium-rich food (dark chocolate, pumpkin seeds) take the edge off cramps.',
    follicular: 'Build next month’s buffer now: protein and iron at every meal make PMS softer later.',
    ovulatory: 'Plenty of fibre and water help clear extra estrogen — less bloating and tender breasts later.',
    luteal: 'Steady meals with protein, magnesium and B6 (salmon, bananas, seeds) at night — calm blood sugar means calmer PMS.',
  },
  skin: {
    menstrual: 'Skin is drier and more sensitive — rich moisturiser, no harsh scrubs or new products.',
    follicular: 'Rising estrogen gives your best skin — great days for a facial or trying something new.',
    ovulatory: 'Peak glow, but oil starts rising — cleanse gently at night and eat zinc (oysters, pumpkin seeds).',
    luteal: 'Progesterone makes skin oilier — cleanse twice, keep sugar low, treat spots early.',
  },
  sleep: {
    menstrual: 'You may need more sleep — go to bed earlier with a warm drink and a hot water bottle.',
    follicular: 'Sleep comes easiest now — keep a steady bedtime to bank energy for the weeks ahead.',
    ovulatory: 'Your body temperature starts to rise — keep the bedroom cool and dark.',
    luteal: 'Progesterone warms you up — cooler room, a magnesium bath and no screens the last hour.',
  },
  mood: {
    menstrual: 'Feeling inward is normal. Journal, rest and cancel what you can.',
    follicular: 'Optimism is rising — plan, start, say yes to new things.',
    ovulatory: 'Confidence peaks — have the important conversation now.',
    luteal: 'Mood can dip as hormones fall — daylight walks, protein and extra kindness to yourself.',
  },
  energy: {
    menstrual: 'Low energy is normal — gentle walks, iron-rich food and early nights.',
    follicular: 'Energy is climbing — your best time to start training harder.',
    ovulatory: 'Peak energy — lift heavy, sprint, be social.',
    luteal: 'Steady efforts beat sprints. Eat a little more — your body burns more energy now.',
  },
  eat: {
    menstrual: 'Warm, iron-rich meals: soups, red meat, beetroot and bone broth.',
    follicular: 'Fresh and raw: crisp salads, eggs, citrus and fermented foods.',
    ovulatory: 'Light and colourful: berries, salads, oysters and lots of fibre.',
    luteal: 'Grounding carbs: sweet potato, roots and squash, plus magnesium.',
  },
  tcm: {
    menstrual: 'Keep your feet and lower back warm, sip ginger tea, no iced drinks.',
    follicular: 'Rebuild: bed before 11pm, goji berries and red dates, gentle movement.',
    ovulatory: 'Stay cool and flowing: fresh fruit, time outside, lots of water.',
    luteal: 'Keep energy moving: daily walks, stretching and warming spices.',
  },
  hormones: {
    menstrual: 'Estrogen and progesterone are at their lowest — a reset. Notice how you feel each day.',
    follicular: 'Estrogen is rising — watch your mood, energy and confidence lift.',
    ovulatory: 'LH surges and estrogen peaks — you may notice clear, stretchy discharge and more energy.',
    luteal: 'Progesterone takes over — calmer, warmer and hungrier. All normal.',
  },
};
// Only shown to people trying to conceive.
export const TTC_TIPS = {
  menstrual: 'Get ready for this cycle: folate, iron and omega-3 — start a prenatal if you haven’t yet.',
  follicular: 'Your fertile window opens about 5 days before ovulation — eggs, oily fish and leafy greens support egg quality.',
  ovulatory: 'Your most fertile days — sex today and tomorrow gives the best chance.',
  luteal: 'The two-week wait: stay warm, nourished and gentle. Test if your period is late.',
};

// "What to eat" by phase and food group. Built on natural, unprocessed food: raw-first, warm & cooked
// around the period, raw dairy welcome, no oats or tofu, few grains (sourdough is fine), coffee or matcha always fine.
export const EAT_CATS = [
  { k: 'protein', t: 'Protein', g: '🥩' }, { k: 'veg', t: 'Veggies', g: '🥦' }, { k: 'fats', t: 'Healthy fats', g: '🥑' },
  { k: 'carbs', t: 'Carbs', g: '🍠' }, { k: 'fruit', t: 'Fruit', g: '🍓' }, { k: 'dairy', t: 'Raw dairy', g: '🥛' }, { k: 'drinks', t: 'Coffee & drinks', g: '☕' }, { k: 'supps', t: 'Supplements', g: '💊' },
];
const F = s => s.split('|').map(x => x.trim()).map(x => [x.slice(0, x.indexOf(' ')), x.slice(x.indexOf(' ') + 1)]);
export const EAT_GUIDE = {
  menstrual: { goal: 'Replenish & warm', why: 'Estrogen and progesterone are at their lowest and you lose iron with every bleed. Warm, cooked, mineral-rich food refills you and eases cramps.', cats: {
    protein: ['Iron and B12 from animal foods replace what you lose.', F('🥩 Grass-fed beef | 🍲 Bone broth | 🐟 Wild salmon | 🦪 Mussels | 🥚 Pasture eggs | 🍗 Chicken thighs | 🐑 Lamb | 🫀 Liver')],
    veg: ['Cook them — soft, warm, low-oxalate vegetables are easy to digest.', F('🎃 Pumpkin | 🥕 Roasted carrots | 🍄 Mushrooms | 🧅 Leeks & onions | 🥒 Cooked courgette | 🍅 Stewed tomatoes | 🫑 Roasted peppers')],
    fats: ['Warming fats calm the inflammation behind cramps.', F('🧈 Butter & ghee | 🥚 Egg yolks | 🐟 Oily fish | 🫒 Olive oil | 🌰 Walnuts | 🥥 Coconut oil')],
    carbs: ['Gentle, cooked carbs keep your energy up without spikes.', F('🍞 Toasted sourdough | 🍠 Sweet potato | 🎃 Squash | 🥔 Potatoes | 🫘 Black beans | 🌰 Chestnuts | 🥕 Parsnips')],
    fruit: ['Stewed, warm fruit is easy on your belly.', F('🍎 Stewed apple | 🍐 Baked pear | 🔴 Red dates | 🍒 Warm cherry compote | 🟤 Dried figs')],
    dairy: ['Warm raw milk soothes and brings calcium and magnesium.', F('🥛 Warm raw milk | 🧈 Raw butter | 🧀 Raw cheese | 🍶 Kefir at room temperature')],
    drinks: ['Coffee is fine — enjoy it after breakfast rather than with your iron-rich meals, as it can slow iron absorption. Hot drinks move blood and ease cramps.', F('☕ Coffee with breakfast | 🫚 Ginger tea | 🍵 Red date tea | 🍫 Hot cacao | 🌿 Raspberry leaf tea | 🍲 Warm broth')],
    supps: ['Replace what bleeding takes and ease cramps.', F('🩸 Iron bisglycinate (if periods are heavy) | 🌙 Magnesium glycinate | 🐟 Omega-3 | 🍊 Vitamin C with iron | 🫚 Ginger capsules | 💪 Creatine 3–5 g')],
  } },
  follicular: { goal: 'Support rising estrogen', why: 'Estrogen climbs steadily toward ovulation, which is why your energy and mood lift now. Fresh produce, quality protein and fermented foods fuel the rise.', cats: {
    protein: ['Protein builds the follicle that becomes your egg.', F('🥚 Eggs | 🐟 Wild fish | 🍗 Chicken | 🥩 Lean beef | 🦐 Prawns | 🐑 Lamb | 🧀 Cottage cheese')],
    veg: ['Gentle, low-oxalate veggies are easy on your gut and still bring fibre and colour while estrogen rises.', F('🥒 Cucumber | 🥬 Butter lettuce | 🥒 Courgette | 🫑 Bell peppers | 🍅 Tomatoes | 🥕 Raw carrots | 🫒 Olives')],
    fats: ['Healthy fats are the raw material of your hormones.', F('🥑 Avocado | 🫒 Olive oil | 🌰 Flax & pumpkin seeds | 🥥 Coconut | 🥜 Almonds')],
    carbs: ['Light, steady carbs match your rising energy.', F('🍞 Sourdough | 🍠 Sweet potato | 🫘 Lentils | 🥔 Baby potatoes | 🍌 Banana | 🌾 Buckwheat')],
    fruit: ['Fresh, raw fruit — vitamin C helps you absorb iron.', F('🍊 Citrus | 🥝 Kiwi | 🍓 Berries | 🍋 Lemon | 🍑 Stone fruit | 🍍 Pineapple | 🍏 Green apple')],
    dairy: ['Fermented raw dairy feeds the gut that clears used estrogen.', F('🍶 Raw kefir | 🥛 Raw milk | 🧀 Raw cheese | 🥣 Raw yoghurt')],
    drinks: ['Your energy is rising — coffee or matcha both fit. Matcha gives a smoother lift thanks to L-theanine.', F('🍵 Matcha | ☕ Coffee | 🍋 Lemon water | 🌿 Nettle tea | 🥤 Green juice')],
    supps: ['Build strength and support rising estrogen.', F('💪 Creatine 3–5 g | ☀️ Vitamin D3 + K2 | 🧬 B-complex | 🦠 Probiotic | ⚪ Zinc')],
  } },
  ovulatory: { goal: 'Shine at your peak', why: 'Estrogen peaks and your egg is released. Light, raw, colourful food, zinc and fibre support you — and help clear the extra estrogen.', cats: {
    protein: ['Zinc and lighter proteins for your peak.', F('🦪 Oysters | 🐟 Salmon | 🦐 Shellfish | 🥚 Eggs | 🍗 Chicken | 🐟 Sardines')],
    veg: ['Colourful, hydrating veg — plus lightly cooked broccoli or kale to help clear extra estrogen.', F('🍅 Tomatoes | 🥒 Cucumber | 🫑 Red peppers | 🥬 Romaine lettuce | 🥒 Courgette ribbons | 🍆 Grilled aubergine')],
    fats: ['Light fats and antioxidants.', F('🥑 Avocado | 🫒 Olive oil | 🌻 Sesame & sunflower seeds | 🥥 Coconut | 🐟 Oily fish')],
    carbs: ['Fibre-rich carbs keep you light.', F('🍞 Sourdough | 🫘 Chickpeas | 🌽 Sweetcorn | 🥔 Potatoes | 🍌 Banana | 🍠 Sweet potato')],
    fruit: ['Raw and hydrating.', F('🍓 Strawberries | 🫐 Blueberries | 🍉 Watermelon | 🥭 Mango | 🍒 Cherries | 🍇 Grapes')],
    dairy: ['Light and cooling.', F('🥣 Raw yoghurt | 🍶 Kefir | 🧀 Fresh goat cheese | 🥛 Raw milk smoothie')],
    drinks: ['Peak energy — an iced matcha or coffee is perfect. Hydrate well.', F('🧊 Iced matcha | ☕ Coffee | 🥥 Coconut water | 💧 Mineral water | 🌺 Hibiscus tea')],
    supps: ['Support your peak and help clear extra estrogen.', F('💪 Creatine 3–5 g | 🐟 Omega-3 | ⚪ Zinc | 🍊 Vitamin C | 🌻 Vitamin E')],
  } },
  luteal: { goal: 'Steady & ground', why: 'Progesterone rises and your body burns a little more energy. Grounding cooked food, complex carbs and magnesium keep your blood sugar and mood steady.', cats: {
    protein: ['Steady protein keeps cravings calm.', F('🥩 Beef | 🦃 Turkey | 🐟 Wild salmon | 🥚 Eggs | 🐑 Lamb | 🍗 Chicken')],
    veg: ['Roasted, low-oxalate veg ease bloating and feel grounding.', F('🎃 Squash | 🥕 Roasted carrots | 🍄 Mushrooms | 🧅 Leeks | 🫑 Roasted peppers | 🍆 Aubergine | 🥒 Courgette')],
    fats: ['Magnesium and omega-3 for calmer PMS.', F('🌻 Sunflower & sesame seeds | 🌰 Walnuts | 🧈 Butter | 🫒 Olive oil | 🥑 Avocado')],
    carbs: ['Complex carbs lift serotonin and calm cravings.', F('🍞 Sourdough | 🍠 Sweet potato | 🎃 Squash | 🥔 Potatoes | 🫘 Chickpeas | 🌰 Chestnuts | 🍌 Banana')],
    fruit: ['Sweet but steady.', F('🍐 Pears | 🍎 Apples | 🫐 Berries | 🍌 Bananas | 🟤 Dates | 🍊 Oranges')],
    dairy: ['Calcium eases PMS.', F('🥛 Raw milk | 🧀 Raw cheese | 🥣 Raw yoghurt | 🧈 Raw butter')],
    drinks: ['Keep your coffee — pair it with food to steady blood sugar. A warm matcha latte with raw milk is a calm alternative.', F('☕ Coffee with food | 🍵 Matcha latte with raw milk | 🍫 Raw cacao | 🌼 Chamomile | 🫚 Ginger tea')],
    supps: ['Calm PMS, stress and sleep.', F('🌙 Magnesium glycinate | 🌿 Ashwagandha (skip if trying to conceive) | 🧬 Vitamin B6 | 🥛 Calcium | 💪 Creatine 3–5 g | 🐟 Omega-3')],
  } },
};

// Blood-sugar tricks — from the user's book "Krankheitslügen entlarvt" (pp. 165–168).
// eff = how much each trick flattens the typical after-meal glucose rise in the app's illustration.
export const SUGAR_TRICKS = [
  { k: 'fibre', w: 'before', t: 'Veg, sauerkraut or kimchi first, carbs last', g: '🫐', n: 'Fibre first', eff: .4, d: 'Start with veg, fermented veg or protein and eat starchy carbs last. In small studies this food order lowered the after-meal sugar rise by about a third or more — fewer cravings, less insulin. A fibre starter like psyllium 10–15 minutes before also helps.' },
  { k: 'move', w: 'before', t: '10 squats or a 5-min walk', g: '🚶‍♀️', n: 'Move before you eat', eff: .25, d: 'A walk round the block, squats, push-ups, yoga — moving switches on GLUT4, which moves sugar into your muscles even without insulin. A 10–15 minute walk right after the meal works best.' },
  { k: 'acv', w: 'before', t: '1 tbsp in a glass of warm water', g: '🍎', n: 'Apple cider vinegar', eff: .2, d: 'A glass of lukewarm water with about 1 tablespoon of apple cider vinegar before the meal can soften the blood-sugar rise. Always diluted — it is hard on teeth.' },
  { k: 'tea', w: 'with', t: 'Green tea, matcha or hibiscus with the meal', g: '🍵', n: 'The right teas', eff: .1, d: 'Water, green tea, matcha or hibiscus. Green tea and matcha are rich in polyphenols that may help insulin work; hibiscus may lower blood pressure and blood fats.' },
  { k: 'berberine', w: 'before', t: 'Only if it suits you · not in pregnancy · ask your doctor if on meds', g: '🌿', n: 'Berberine', eff: .25, d: 'A plant compound used for centuries in Chinese medicine. Start small to see how you feel; if it suits you, about 500 mg before a meal, up to 2–3 times a day. Not when pregnant, breastfeeding or trying to conceive. On metformin or other medication? Talk to your doctor first.' },
  { k: 'd3mg', w: 'daily', t: 'D3 in the morning, magnesium at night', g: '☀️', n: 'Vitamin D3 + magnesium', eff: .1, d: 'Magnesium is the key mineral, together with vitamin D3 — both are linked to better insulin sensitivity, especially if you are low. Keep supplement magnesium to about 350 mg a day.' },
  { k: 'minerals', w: 'daily', t: 'Oysters, fish, pumpkin seeds', g: '⚪', n: 'Chromium, omega-3, zinc', eff: .1, d: 'Chromium helps insulin work at the cell, omega-3 calms inflammation and blood fats, zinc helps your body make and release insulin.' },
  { k: 'spices', w: 'with', t: 'Cinnamon, ginger or turmeric on your food', g: '🫚', n: 'Spices', eff: .1, d: 'Cinnamon, ginger, turmeric, black seed (nigella) and a pinch of cayenne — warming, anti-inflammatory and may gently lower blood sugar.' },
];

// ---------- Tea guide: the best teas for each problem ----------
// Each tea: [emoji, name, what it does, how to make it, evidence, caution or ''].
export const TEA_GUIDE = [
  { k: 'cramps', g: '🔥', n: 'Cramps', teas: [
    ['🫚', 'Ginger', 'Lowers the prostaglandins behind period pain. In studies it worked about as well as ibuprofen for some women.', '4–5 slices fresh ginger, 10 min. 2–3 cups a day from the day before your period.', 'some', ''],
    ['🌼', 'Chamomile', 'Relaxes the womb muscle and calms the nerves around the pain.', '1 tbsp flowers, covered, 5–10 min. Sip warm.', 'emerging', 'Skip if allergic to ragweed or daisies.'],
    ['🌿', 'Fennel', 'Eases cramps and bloating together.', '1 tsp crushed seeds, 10 min.', 'some', ''],
    ['🪵', 'Cinnamon', 'Warming; eased pain and bleeding in small studies.', '1 cinnamon stick, simmer 10 min.', 'emerging', ''] ] },
  { k: 'heavy', g: '🩸', n: 'Heavy bleeding & low iron', teas: [
    ['🌱', 'Nettle leaf', 'Mineral-rich; traditionally used to rebuild after bleeding.', '2 tsp dried leaf, 10 min. Drink between meals.', 'emerging', ''],
    ['🍃', 'Lady’s mantle', 'Traditional women’s herb, used to calm heavy flow.', '1–2 tsp, 10 min, during the period.', 'emerging', 'Not in pregnancy.'],
    ['🔴', 'Ginger & red dates', 'Classic TCM drink to warm and “build blood”.', '3 red dates + 3 slices ginger, simmer 15 min.', 'tcm', ''] ] },
  { k: 'bloating', g: '🎈', n: 'Bloating & water', teas: [
    ['🌱', 'Peppermint', 'Relaxes the gut and lets trapped gas go.', '1 tbsp leaves, 5–7 min, after meals.', 'some', 'Skip if you have reflux.'],
    ['🌼', 'Dandelion leaf', 'A gentle natural diuretic for premenstrual water.', '1–2 tsp, 10 min, in the morning.', 'emerging', 'Skip if allergic to ragweed or on water tablets.'],
    ['🌿', 'Fennel', 'Calms gas and cramps together.', '1 tsp crushed seeds, 10 min.', 'some', ''] ] },
  { k: 'pms', g: '🌧️', n: 'PMS & mood', teas: [
    ['🍋', 'Lemon balm', 'Calms restlessness and lifts the mood.', '1 tbsp leaves, covered, 10 min.', 'emerging', ''],
    ['🌹', 'Rose', 'In TCM it moves stuck liver qi: tender breasts and irritability.', '5–6 dried buds, 5 min.', 'tcm', ''],
    ['🌼', 'Chamomile', 'Gently calming, eases tension and sleep before the period.', '1 tbsp flowers, 10 min, in the evening.', 'emerging', 'Skip if allergic to ragweed or daisies.'] ] },
  { k: 'sleep', g: '🌙', n: 'Sleep', teas: [
    ['🌼', 'Chamomile', 'Apigenin in chamomile helps you fall asleep.', '1 tbsp, 10 min, 1 hour before bed.', 'some', 'Skip if allergic to ragweed or daisies.'],
    ['🌸', 'Lavender & lemon balm', 'Calms a busy mind at night.', '1 tsp each, 7 min.', 'emerging', ''],
    ['🪵', 'Warm milk with cinnamon', 'Warm raw milk is soothing and adds calcium and tryptophan.', 'Warm, with a pinch of cinnamon or nutmeg and honey.', 'emerging', ''] ] },
  { k: 'stress', g: '🪷', n: 'Stress & anxiety', teas: [
    ['🍋', 'Lemon balm', 'Lowered stress and restlessness in small trials.', '1 tbsp, 10 min. Afternoon or evening.', 'emerging', ''],
    ['🌿', 'Holy basil (tulsi)', 'An adaptogen that helps the body handle stress.', '1–2 tsp, 5–7 min.', 'emerging', 'Not when pregnant or trying to conceive.'],
    ['🍵', 'Green tea', 'L-theanine gives calm focus without the jitters.', '80 °C water, 2–3 min.', 'some', ''] ] },
  { k: 'energy', g: '⚡', n: 'Energy & focus', teas: [
    ['🍵', 'Matcha', 'Steady energy for hours: caffeine with calming L-theanine.', '1 tsp whisked in 80 °C water or warm milk.', 'some', ''],
    ['🌿', 'Ginseng or tulsi', 'Traditional tonics for tired days.', '1–2 tsp, 10 min, before noon.', 'tcm', 'Not in pregnancy, when trying to conceive or with blood thinners.'],
    ['☕', 'Your coffee', 'Enjoy it. Best after breakfast, not on an empty stomach.', 'With food or a little milk.', 'some', ''] ] },
  { k: 'skin', g: '✨', n: 'Hormonal acne & hair', teas: [
    ['🌱', 'Spearmint', '2 cups a day lowered free testosterone in women with PCOS and excess hair.', '1 tbsp leaves, 5–7 min, twice a day.', 'some', ''],
    ['🍵', 'Green tea', 'Calms inflammation and oil. Also works on the skin as a compress.', '80 °C water, 2–3 min.', 'emerging', ''],
    ['🌼', 'Burdock & nettle', 'Traditional skin-clearing herbs.', '1 tsp each, 10 min.', 'tcm', ''] ] },
  { k: 'headache', g: '🤕', n: 'Headache', teas: [
    ['🌱', 'Peppermint', 'Cooling and relaxing for tension headaches.', '1 tbsp leaves, 5–7 min.', 'emerging', ''],
    ['🌼', 'Chrysanthemum', 'TCM tea for headaches from “heat”, like before the period.', '5–6 flowers, 5 min.', 'tcm', ''],
    ['🫚', 'Ginger', 'Eases headache with nausea.', '4 slices, 10 min.', 'emerging', ''] ] },
  { k: 'nausea', g: '🤢', n: 'Nausea & digestion', teas: [
    ['🫚', 'Ginger', 'The best-studied tea for nausea.', '4–5 slices, 10 min. Small sips.', 'strong', ''],
    ['🌱', 'Peppermint', 'Settles the stomach after meals.', '1 tbsp, 5 min.', 'some', ''] ] },
  { k: 'ovulation', g: '🥚', n: 'Ovulation pain', teas: [
    ['🌼', 'Chamomile', 'Calms the twinge and relaxes the lower belly.', '1 tbsp, 10 min.', 'emerging', 'Skip if allergic to ragweed or daisies.'],
    ['🫚', 'Ginger', 'Anti-inflammatory and warming.', '4 slices, 10 min.', 'emerging', ''] ] },
  { k: 'fertility', g: '🌸', n: 'Trying to conceive', teas: [
    ['🌱', 'Nettle', 'Minerals and iron to nourish the body before pregnancy.', '2 tsp, 10 min, daily.', 'emerging', ''],
    ['🍃', 'Red raspberry leaf', 'Traditional womb tonic in the first half of the cycle.', '1–2 tsp, 10 min, until ovulation.', 'emerging', 'Stop after ovulation and in early pregnancy.'],
    ['🔴', 'Ginger & red dates', 'Warms the womb and builds blood in TCM.', '3 dates + 3 ginger slices, 15 min.', 'tcm', ''] ] },
];

// Onboarding: birth control and the 90-day plan. Each issue maps to one research-backed
// action per month (3 months ≈ 3 cycles) and a realistic result.
export const BIRTH_CONTROL = [
  { k: 'none', t: 'No', s: 'Natural cycle' },
  { k: 'pill', t: 'The pill', s: 'Combined or mini pill', h: true },
  { k: 'hiud', t: 'Hormonal IUD', s: 'Mirena, Kyleena and similar', h: true },
  { k: 'other', t: 'Implant, shot, ring or patch', s: 'Other hormonal methods', h: true },
  { k: 'copper', t: 'Copper IUD', s: 'No hormones' },
];
export const BC_PLAN = [
  { k: 'stop', t: 'Yes, help me come off it' },
  { k: 'think', t: 'I’m thinking about it' },
  { k: 'stay', t: 'I’m staying on it' },
];
export const ROADMAP = {
  offpill: { o: 'Your natural cycle back', t: 'Come off birth control', g: '🌱', ev: 'strong',
    m: ['Talk to your doctor, choose your stop day and switch to condoms. Eat folate, B6, B12, zinc and magnesium from food: eggs, liver, greens, seeds, raw milk.',
        'Your first real period usually comes 4–8 weeks after stopping. Log it, and watch for clear, stretchy discharge: your first ovulations.',
        'Most cycles settle within 3 months. Skin can flare for a while, so keep the skin steps going. No period by now? See your doctor.'],
    r: 'Most women have a natural period again within 3 months of stopping.' },
  comeback: { o: 'Your period back', t: 'Get your period back', g: '🩸', ev: 'some',
    m: ['Take a pregnancy test first. Then eat three real meals a day with enough carbs and fat, and swap hard training for walks.',
        'Bed by 11pm, daylight in the morning, less stress. Your brain only restarts the cycle when it feels safe and fed.',
        'Still no period after 3 months? See a doctor to check thyroid, prolactin and PCOS.'],
    r: 'When food, rest and stress are fixed, many women see their period return within a few months.' },
  pms: { o: 'Less PMS & cramps', t: 'Ease PMS & cramps', g: '🌙', ev: 'some',
    m: ['Track symptoms daily so you can see your pattern.', 'Add magnesium and B6 foods (seeds, salmon, bananas), heat on your belly and daily movement.', 'Compare with month 1: your plan now warns you 2 days before your hard days.'],
    r: 'Magnesium and B6 eased PMS within 2–3 cycles in trials.' },
  skin: { o: 'Clearer skin', t: 'Clearer skin', g: '✨', ev: 'some',
    m: ['Low-sugar meals with protein and fat, and zinc foods (oysters, pumpkin seeds).', 'Gentle cleansing twice a day in the second half of your cycle, when oil rises.', 'Skin renews about every 4–6 weeks, so month 3 is when you see it.'],
    r: 'A low-sugar diet cut acne spots in 12 weeks in a controlled trial.' },
  body: { o: 'Toned, snatched body', t: 'Snatched, toned body', g: '🔥', ev: 'strong',
    m: ['Strength training 2–3 times a week and protein at every meal (about 1.6 g per kg of body weight).', 'Add weight in your follicular and ovulation weeks, hold steady before your period.', 'Daily walks and good sleep: muscle shows and bloat drops.'],
    r: 'Strength training with enough protein builds visible muscle in 8–12 weeks.' },
  bloat: { o: 'Flatter belly, less bloat', t: 'Less bloating', g: '🫧', ev: 'some',
    m: ['Warm, cooked meals and slow eating; fermented food daily.', 'Less salt and more potassium in your luteal week.', 'A 10-minute walk after meals.'],
    r: 'Fibre, fermented food and walks after meals ease bloating within weeks.' },
  sleep: { o: 'Deeper sleep', t: 'Better sleep', g: '😴', ev: 'strong',
    m: ['Same bedtime and wake time every day, morning daylight.', 'Cool, dark room in your luteal phase, no screens the last hour.', 'Your rhythm is set: sleep follows by itself.'],
    r: 'A steady sleep schedule and morning light improve sleep within 2–4 weeks.' },
  mood: { o: 'Steadier mood', t: 'Balanced mood', g: '🌤️', ev: 'strong',
    m: ['A daily walk outside and protein at breakfast.', 'Plan lighter days before your period and tell the people close to you.', 'See your mood pattern across 3 cycles.'],
    r: 'Regular movement lifts mood about as much as some first-line treatments.' },
  energy: { o: 'More energy', t: 'More energy', g: '⚡', ev: 'some',
    m: ['Iron-rich meals around your period and a steady breakfast.', 'Push in your high-energy weeks, rest in your low ones.', 'You know your energy calendar by heart.'],
    r: 'Steady blood sugar and refilled iron lift energy within 1–2 months.' },
  eat: { o: 'Eating with your cycle', t: 'Eat for my cycle', g: '🥗', ev: 'some',
    m: ['Warm, iron-rich food on your period; fresh and raw in your first half.', 'Roots, squash and magnesium before your period.', 'Seasonal food from where you live, every week.'],
    r: 'Whole, unprocessed food supports steady hormones and energy.' },
  tcm: { o: 'A warm, smooth flow', t: 'Chinese medicine', g: '☯️', ev: 'tcm',
    m: ['Keep your belly and feet warm; nothing iced around your period.', 'Ginger, red dates and goji to rebuild after bleeding.', 'Acupressure and rituals for each inner season.'],
    r: 'In Chinese medicine, a warm and steady body brings a smooth, pain-free flow.' },
  hormones: { o: 'Balanced hormones', t: 'Understand my hormones', g: '🧬', ev: 'strong',
    m: ['Log your period and how you feel.', 'See your estrogen and progesterone pattern day by day.', 'After 3 cycles, predictions are based on your own body.'],
    r: 'Three logged cycles show your personal pattern.' },
  regular: { o: 'A regulated cycle', t: 'A regular period', g: '🗓️', ev: 'some',
    m: ['Eat enough and keep a steady sleep time.', 'Lower stress in your second half; walks over hard training if your cycle is long.', 'Three cycles logged: we can see if it is getting more regular.'],
    r: 'Enough food, sleep and less stress help cycles settle within a few months.' },
};

// ---- 90-day plan: the method behind Reset → Rebuild → Glow ----
export const PLAN_METHOD = [
  { k: 'Reset', d: 'Days 1–30', g: '🌱', line: 'Calm your system and learn your rhythm.', pts: [
    ['📓', 'Track', 'Log your period and how you feel. Ten seconds a day.'],
    ['🍲', 'Real meals', 'Three warm, whole meals with protein at breakfast. No skipping.'],
    ['🌅', 'Sleep anchor', 'Same bedtime and wake time, daylight in the first hour.'],
    ['🍬', 'Steady sugar', 'Fewer sugar spikes and processed food so hormones can settle.']] },
  { k: 'Rebuild', d: 'Days 31–60', g: '🔥', line: 'Feed your hormones and work with your phases.', pts: [
    ['🗓️', 'Sync your weeks', 'Push in your high-energy weeks, slow down before your period.'],
    ['🥩', 'Hormone minerals', 'Iron, zinc and magnesium from food: meat, eggs, seeds, greens, raw milk.'],
    ['🏋️', 'Strength', 'Two or three strength sessions a week, heavier in your first half.'],
    ['🌬️', 'Lower stress', 'Ten minutes a day of breathing, a walk or quiet.']] },
  { k: 'Glow', d: 'Days 61–90', g: '✨', line: 'The results show on the outside.', pts: [
    ['🪞', 'Skin renewed', 'Skin turns over every 4–6 weeks, so this is the cycle you see it.'],
    ['💇‍♀️', 'New growth', 'Hair grows about 1 cm a month; the new growth is stronger.'],
    ['🔮', 'Your own pattern', 'Three cycles logged: predictions are now based on your body.'],
    ['♾️', 'Your rhythm', 'It isn’t a plan any more. It’s how you live.']] },
];
export const GLOW_RESULTS = [
  { g: '✨', t: 'Glowing skin', s: 'A warmer, healthier tone from colourful whole food and steady sleep.', ev: 'some' },
  { g: '🪞', t: 'More symmetry', s: 'Less puffiness and inflammation, so your face looks more even and defined.', ev: 'emerging' },
  { g: '🎨', t: 'Contrast & colour', s: 'Rested eyes, rosier lips and cheeks: the contrast that reads as young and healthy.', ev: 'some' },
  { g: '💇‍♀️', t: 'Thicker hair', s: 'Enough iron and protein means less shedding and stronger new growth.', ev: 'some' },
];
// Short, real findings for the research wall. Each is one study or review.
export const RESEARCH_WALL = [
  { n: '6 wks', t: 'More fruit and veg gave faces a visibly healthier, golden glow.', src: 'Whitehead et al. 2012 · PLoS ONE', more: 'About three extra portions a day raised skin carotenoids, and strangers rated those faces as healthier and more attractive.', ev: 'some', big: 1 },
  { n: '12 wks', t: 'A low-sugar diet cut acne spots.', src: 'Smith et al. 2007 · Am J Clin Nutr', more: 'A low-glycaemic-load diet reduced acne lesions compared with a usual diet in a controlled trial.', ev: 'some' },
  { n: '↑', t: 'Faces were rated more attractive in the fertile phase.', src: 'Roberts et al. 2004 · Proc R Soc B', more: 'Photos of the same women taken near ovulation were picked as more attractive than photos from other days.', ev: 'emerging' },
  { n: '◐', t: 'Soft-tissue symmetry peaked around ovulation.', src: 'Manning et al. 1996 · Ethol Sociobiol', more: 'Small measurements of ears and fingers were most symmetrical near ovulation. A small study, so read it as a hint.', ev: 'emerging' },
  { n: '😴', t: 'After short sleep, faces looked less healthy and less attractive.', src: 'Axelsson et al. 2010 · BMJ', more: 'The same people were photographed after a normal night and after sleep loss; raters could tell.', ev: 'some', big: 1 },
  { n: '◑', t: 'Stronger facial contrast reads as younger.', src: 'Porcheron et al. 2013 · PLoS ONE', more: 'Contrast between eyes, lips and skin falls with age, and faces with more of it are judged younger.', ev: 'some' },
  { n: '2–3', t: 'Cycles of magnesium + B6 eased PMS.', src: 'Fathizadeh et al. 2010 · Iran J Nurs Midwifery Res', more: 'Women taking magnesium with vitamin B6 had fewer PMS symptoms than with placebo.', ev: 'some' },
  { n: '1.6 g', t: 'Protein per kg a day maximised strength-training gains.', src: 'Morton et al. 2018 · Br J Sports Med', more: 'A meta-analysis of 49 trials: gains in muscle levelled off around 1.6 g of protein per kg of body weight.', ev: 'strong', big: 1 },
  { n: 'Fe', t: 'Low iron is linked to hair shedding in women.', src: 'Trost et al. 2006 · J Am Acad Dermatol', more: 'A review of studies: low ferritin is common in women with hair loss, and refilling iron is a first step.', ev: 'some' },
  { n: '83%', t: 'of women conceived within a year of stopping the pill.', src: 'Girum & Wasie 2018 · Contracept Reprod Med', more: 'A review of 22 studies: the pill leaves no lasting delay, and fertility comes back quickly after stopping.', ev: 'strong', big: 1 },
];

// Tea profiles, one per herb: what is in it, its nature in Chinese medicine, where it fits in the cycle,
// what studies found and who should skip it. Matched to a tea by the herb's name (see teaProfiles in app.js).
// t: TCM temperature (hot / warm / neutral / cool / cold), o: organs, p: best phases.
export const TEA_PROFILES = {
  ginger: { n: 'Ginger', c: [['Gingerols', 'Calm the prostaglandins behind cramps'], ['Shogaols', 'Form when ginger is heated, warming'], ['Zingiberene', 'Settles the stomach']],
    t: 'warm', o: 'Spleen · Stomach · Lung', p: ['menstrual', 'luteal'],
    study: 'In a trial with 150 students, 250 mg ginger four times a day for the first 3 days of the period eased pain as well as ibuprofen and mefenamic acid. Reviews agree it beats placebo for period pain and is one of the best-proven remedies for nausea.',
    cite: 'Ozgoli 2009 · Daily 2015 (meta-analysis)', caution: 'Large amounts with blood thinners: ask your doctor.' },
  chamomile: { n: 'Chamomile', c: [['Apigenin', 'Binds the same calming receptors as sleep pills, gently'], ['α-Bisabolol', 'Anti-inflammatory'], ['Chamazulene', 'Gives the blue oil, soothing']],
    t: 'neutral', o: 'Liver · Heart', p: ['luteal', 'menstrual'],
    study: 'Women who drank one cup a day for two weeks slept better and felt less low than those who did not. Small Iranian trials also found it eased period pain more than placebo.',
    cite: 'Chang & Chen 2016 · Jenabi 2010', caution: 'Skip if allergic to ragweed or daisies. Talk to your doctor if you take warfarin.' },
  fennel: { n: 'Fennel', c: [['Anethole', 'Relaxes the smooth muscle of womb and gut'], ['Fenchone', 'Eases trapped gas'], ['Flavonoids', 'Antioxidant']],
    t: 'warm', o: 'Liver · Kidney · Spleen · Stomach', p: ['menstrual', 'luteal'],
    study: 'In a trial with 30 young women, fennel worked about as well as mefenamic acid for period pain, a little slower to start.',
    cite: 'Namavar Jahromi 2003', caution: 'Anethole acts a little like estrogen: skip large amounts in pregnancy or with estrogen-sensitive conditions.' },
  cinnamon: { n: 'Cinnamon', c: [['Cinnamaldehyde', 'Warming, eases cramping'], ['Polyphenols', 'Help steady blood sugar'], ['Eugenol', 'Mild pain relief']],
    t: 'hot', o: 'Kidney · Spleen · Heart · Liver', p: ['menstrual', 'luteal'],
    study: 'In a trial with 76 students, cinnamon in the first 3 days of the period eased pain, bleeding and nausea compared with placebo.',
    cite: 'Jaafarpour 2015', caution: 'For daily use pick Ceylon cinnamon; cassia has more coumarin, which strains the liver in large amounts.' },
  nettle: { n: 'Nettle leaf', c: [['Iron', 'Rebuilds stores after bleeding'], ['Calcium & magnesium', 'Calm muscles and nerves'], ['Vitamin K', 'Helps normal clotting']],
    t: 'cool', o: 'Liver · Kidney', p: ['menstrual', 'follicular'],
    study: 'No trials on nettle tea and iron yet. It is chosen for its minerals, and the plant iron is better absorbed with vitamin C, so add a squeeze of lemon.',
    cite: 'Traditional European use', caution: 'Mildly diuretic. On blood thinners or water tablets? Ask your doctor.' },
  'lady’s mantle': { n: 'Lady’s mantle', c: [['Ellagitannins', 'Astringent, gently tightens tissue'], ['Flavonoids', 'Antioxidant'], ['Salicylic acid', 'Traces, mildly soothing']],
    t: 'cool', o: 'Liver', p: ['menstrual'],
    study: 'Used in European folk medicine for heavy and painful periods for centuries. There are no clinical trials yet.',
    cite: 'Traditional European use', caution: 'Not in pregnancy. Very heavy bleeding needs a doctor, not tea.' },
  'red dates': { n: 'Red dates', c: [['Natural sugars', 'Gentle energy'], ['Vitamin C', 'Helps absorb iron'], ['Saponins', 'Calming in TCM']],
    t: 'warm', o: 'Spleen · Stomach', p: ['menstrual', 'follicular'],
    study: 'Da Zao has been used to “build blood” and calm the mind for about 2000 years. Modern research is early.',
    cite: 'Shen Nong Ben Cao Jing (classic TCM)', caution: '' },
  peppermint: { n: 'Peppermint', c: [['Menthol', 'Relaxes gut muscle, cools'], ['Menthone', 'Eases gas'], ['Rosmarinic acid', 'Antioxidant']],
    t: 'cool', o: 'Lung · Liver', p: ['follicular', 'ovulatory'],
    study: 'Peppermint oil capsules are strongly proven for bloating and gut cramps (IBS). The tea is milder; rubbed on the temples, the oil eased tension headaches as well as paracetamol.',
    cite: 'Ford 2008 (meta-analysis) · Göbel 1996', caution: 'Skip with reflux or heartburn.' },
  dandelion: { n: 'Dandelion leaf', c: [['Potassium', 'Replaces what water loss takes'], ['Sesquiterpene lactones', 'Bitter, support digestion'], ['Inulin', 'Feeds good gut bacteria (root)']],
    t: 'cold', o: 'Liver · Stomach', p: ['follicular', 'ovulatory'],
    study: 'In a small study, dandelion leaf raised how often people passed water within 5 hours of the first dose.',
    cite: 'Clare 2009', caution: 'Cold in TCM: best in the first half, not during your period. Skip with ragweed allergy or water tablets.' },
  'lemon balm': { n: 'Lemon balm', c: [['Rosmarinic acid', 'Slows the breakdown of the calming GABA'], ['Citral', 'Gives the lemon scent, calming'], ['Flavonoids', 'Antioxidant']],
    t: 'cool', o: 'Heart · Liver', p: ['luteal'],
    study: 'In a trial with 100 girls, lemon balm capsules eased PMS symptoms over 3 cycles. A single dose made adults calmer under stress.',
    cite: 'Akbarzadeh 2015 · Kennedy 2004', caution: 'With thyroid medication, ask your doctor first.' },
  rose: { n: 'Rose', c: [['Geraniol & citronellol', 'The scent, calming'], ['Polyphenols', 'Antioxidant'], ['Vitamin C', 'In the petals']],
    t: 'warm', o: 'Liver · Spleen', p: ['luteal', 'menstrual'],
    study: 'In a trial with 130 teenage girls, two cups of rose tea a day from a week before the period eased pain, distress and anxiety for up to 6 months.',
    cite: 'Tseng 2005', caution: '' },
  lavender: { n: 'Lavender', c: [['Linalool', 'Calms the nervous system'], ['Linalyl acetate', 'Relaxing'], ['Coumarins', 'Mild']],
    t: 'cool', o: 'Liver · Heart', p: ['luteal'],
    study: 'New mothers who drank lavender tea for two weeks felt less tired and low. Lavender oil capsules are well studied for anxiety.',
    cite: 'Chen & Chen 2015 · Kasper 2010', caution: '' },
  milk: { n: 'Warm milk', c: [['Tryptophan', 'Building block of serotonin and melatonin'], ['Calcium', 'Eased PMS in trials'], ['Fat & protein', 'Keep blood sugar steady overnight']],
    t: 'neutral', o: 'Spleen · Lung', p: ['luteal', 'menstrual'],
    study: 'Women with more calcium from food had less PMS in a 10-year study, and calcium eased mood and bloating in trials.',
    cite: 'Bertone-Johnson 2005 · Thys-Jacobs 1998', caution: '' },
  tulsi: { n: 'Holy basil', c: [['Eugenol', 'Anti-inflammatory'], ['Ursolic acid', 'Supports the stress response'], ['Rosmarinic acid', 'Antioxidant']],
    t: 'warm', o: 'Lung · Heart', p: ['follicular', 'luteal'],
    study: 'A review of 24 studies found tulsi helped with stress, blood sugar and mood, with no serious side effects.',
    cite: 'Jamshidi & Cohen 2017 (review)', caution: 'Lowered fertility in animal studies: skip when trying to conceive or pregnant.' },
  'green tea': { n: 'Green tea', c: [['EGCG', 'Antioxidant, calms oil and inflammation'], ['L-theanine', 'Calm, alert focus'], ['Caffeine', 'About 30 mg a cup']],
    t: 'cool', o: 'Heart · Lung · Stomach', p: ['follicular', 'ovulatory'],
    study: 'L-theanine with caffeine sharpened attention in trials. Green tea extract reduced spots on the nose and chin of adult women after 4 weeks.',
    cite: 'Giesbrecht 2010 · Lu & Hsu 2016', caution: 'Low iron? Enjoy it between meals rather than with them.' },
  matcha: { n: 'Matcha', c: [['L-theanine', 'Smooths out the caffeine'], ['Caffeine', 'About 60 mg a teaspoon'], ['EGCG', 'You drink the whole leaf, so more of it']],
    t: 'cool', o: 'Heart · Lung · Stomach', p: ['follicular', 'ovulatory'],
    study: 'Because you drink the whole leaf, matcha gives more L-theanine and antioxidants than steeped tea. The caffeine and theanine pair improved attention and mood in trials.',
    cite: 'Dietz 2017 · Giesbrecht 2010', caution: '' },
  ginseng: { n: 'Ginseng', c: [['Ginsenosides', 'Support energy and stress hormones'], ['Polysaccharides', 'Support immunity'], ['Gintonin', 'Nerve signalling']],
    t: 'warm', o: 'Spleen · Lung', p: ['menstrual', 'follicular'],
    study: 'Korean red ginseng eased fatigue in adults with long-term tiredness in a 4-week trial.',
    cite: 'Kim 2013', caution: 'Not in pregnancy, when trying to conceive or with blood thinners.' },
  coffee: { n: 'Coffee', c: [['Caffeine', 'About 80–100 mg a cup'], ['Chlorogenic acids', 'Antioxidants'], ['Trigonelline', 'Gives the roast aroma']],
    t: 'warm', o: 'Heart', p: ['follicular', 'ovulatory', 'luteal', 'menstrual'],
    study: 'After a bad night, black coffee before breakfast raised the blood sugar response to that breakfast. With or after food, it’s a happy ritual.',
    cite: 'Smith 2020', caution: '' },
  spearmint: { n: 'Spearmint', c: [['Carvone', 'The scent'], ['Rosmarinic acid', 'Antioxidant'], ['Flavonoids', 'Linked to lower free testosterone']],
    t: 'cool', o: 'Lung · Liver', p: ['luteal', 'follicular'],
    study: 'In a trial with 42 women with PCOS and extra hair, two cups a day for a month lowered free and total testosterone.',
    cite: 'Grant 2010', caution: '' },
  burdock: { n: 'Burdock', c: [['Inulin', 'Feeds good gut bacteria'], ['Arctiin', 'Anti-inflammatory'], ['Polyphenols', 'Antioxidant']],
    t: 'cold', o: 'Lung · Stomach', p: ['follicular', 'ovulatory'],
    study: 'A traditional “blood-cleansing” herb in Europe and Asia. Studies on skin are early.',
    cite: 'Traditional use', caution: 'Cold in TCM: best in the first half of your cycle.' },
  chrysanthemum: { n: 'Chrysanthemum', c: [['Luteolin', 'Anti-inflammatory'], ['Apigenin', 'Calming'], ['Chlorogenic acid', 'Antioxidant']],
    t: 'cool', o: 'Lung · Liver', p: ['ovulatory', 'luteal'],
    study: 'Ju Hua is the classic TCM tea to “clear heat” from the head: hot headaches, tired red eyes.',
    cite: 'Classic TCM', caution: 'Skip if allergic to daisies.' },
  raspberry: { n: 'Red raspberry leaf', c: [['Fragarine', 'Tones the womb muscle'], ['Tannins', 'Astringent'], ['Vitamin C & minerals', 'Nourishing']],
    t: 'neutral', o: 'Liver · Kidney', p: ['menstrual', 'follicular'],
    study: 'Mostly studied late in pregnancy for labour, with small effects. Its use as a womb tonic before pregnancy is traditional.',
    cite: 'Simpson 2001', caution: 'Stop after ovulation when trying, and in early pregnancy.' },
  hibiscus: { n: 'Hibiscus', c: [['Anthocyanins', 'Give the red colour, antioxidant'], ['Organic acids', 'Tart and cooling'], ['Vitamin C', 'Supports skin']],
    t: 'cool', o: 'Heart · Liver', p: ['ovulatory', 'follicular'],
    study: 'Three cups a day for 6 weeks lowered blood pressure in adults with mildly high readings.',
    cite: 'McKay 2010', caution: 'Lowers blood pressure. Not in pregnancy.' },
};

// Nutrients and supplements: food first, a supplement when there's a reason. Doses are the ones used in trials.
// d: [amount, label] rows for the spec sheet, f: food sources, p: best phases, low: signs you may be low, test: what to ask for.
export const NUTRIENTS = [
  { id: 'magnesium', n: 'Magnesium', g: '🌰', for: 'PMS, cramps, sleep', ev: 'some', p: ['luteal', 'menstrual'],
    d: [['200–250 mg', 'a day in trials'], ['Glycinate', 'gentlest form'], ['Evening', 'calms before sleep']],
    why: 'Relaxes muscles, including the womb, and calms the nervous system. Levels tend to dip in the second half of the cycle.',
    f: [['Pumpkin seeds', '30 g ≈ 150 mg'], ['Raw cacao or dark chocolate', '30 g ≈ 65 mg'], ['Almonds', '30 g ≈ 80 mg'], ['Spinach, cooked', '½ cup ≈ 78 mg'], ['Buckwheat', '1 cup ≈ 86 mg']],
    low: 'Cramps, twitching eyelids, poor sleep, chocolate cravings before your period.', test: 'Blood tests miss most of it; go by symptoms.',
    study: '200 mg a day eased water retention, breast tenderness and bloating in the second and later cycles. In a Cochrane review, magnesium relieved period pain better than placebo, and 250 mg with 40 mg B6 eased PMS more than either alone.',
    cite: 'Walker 1998 · Proctor 2001 (Cochrane) · Fathizadeh 2010',
    caution: 'Citrate and oxide can loosen stools. Kidney disease: ask your doctor first.' },
  { id: 'b6', n: 'Vitamin B6', g: '🍌', for: 'PMS mood, nausea', ev: 'some', p: ['luteal'],
    d: [['10–50 mg', 'a day, short term'], ['P-5-P', 'active form'], ['Morning', 'with food']],
    why: 'Helps your body make serotonin and dopamine, which steady your mood when hormones fall before your period.',
    f: [['Salmon', '100 g ≈ 0.6 mg'], ['Chicken', '100 g ≈ 0.5 mg'], ['Pistachios', '30 g ≈ 0.5 mg'], ['Banana', '1 ≈ 0.4 mg'], ['Chickpeas', '1 cup ≈ 1.1 mg']],
    low: 'Low mood and irritability before your period, cracked lips.', test: 'Rarely needed.',
    study: 'A review of 9 trials found B6 eased PMS symptoms, especially low mood. Most trials used 50–100 mg, more than you need long term.',
    cite: 'Wyatt 1999 (BMJ review)',
    caution: 'Europe’s safe upper limit from supplements is 12 mg a day. Tingling hands or feet means stop. Higher doses only with your doctor.' },
  { id: 'iron', n: 'Iron', g: '🩸', for: 'Fatigue, heavy periods, hair', ev: 'strong', p: ['menstrual', 'follicular'],
    d: [['Ferritin', 'test first'], ['Every 2nd day', 'absorbs better'], ['+ Vitamin C', 'doubles uptake']],
    why: 'You lose iron every period. Low stores (ferritin) bring tiredness, hair shedding and breathlessness long before anaemia shows up.',
    f: [['Liver', '100 g ≈ 6–9 mg'], ['Red meat', '100 g ≈ 2.5 mg'], ['Oysters & mussels', '100 g ≈ 5–7 mg'], ['Lentils, cooked', '1 cup ≈ 6.6 mg'], ['Pumpkin seeds', '30 g ≈ 2.5 mg']],
    low: 'Tired all month, hair shedding, cold hands, craving ice, heavy or long periods.', test: 'Ferritin and a blood count. Many experts aim for ferritin above 30–50 µg/L.',
    study: 'Women who were tired but not anaemic, with ferritin under 50, had about half the fatigue after 12 weeks of iron. One dose every other day is absorbed better than daily doses.',
    cite: 'Vaucher 2012 · Stoffel 2017',
    caution: 'Only supplement when a test shows you’re low: too much iron harms. Take it an hour apart from coffee, tea or milk. Keep away from children.' },
  { id: 'vitamin-d', n: 'Vitamin D', g: '☀️', for: 'Mood, cramps, immunity', ev: 'some', p: ['menstrual', 'follicular', 'ovulatory', 'luteal'],
    d: [['1000–2000 IU', 'a day in winter'], ['D3', 'best form'], ['With fat', 'at a meal']],
    why: 'More a hormone than a vitamin. Your skin makes it from midday sun; north of the Alps it can’t from about October to March.',
    f: [['Midday sun on skin', '15–20 min in summer'], ['Herring or sardines', '100 g ≈ 200–600 IU'], ['Egg yolks', '2 ≈ 80 IU'], ['Grass-fed butter', 'small amounts']],
    low: 'Low winter mood, aching bones, getting ill often.', test: '25(OH)D blood test. Aim for 30–50 ng/mL (75–125 nmol/L).',
    study: 'Women with more vitamin D and calcium from food had less PMS over 10 years. In a trial, women low in vitamin D had less period pain after one high dose before their period.',
    cite: 'Bertone-Johnson 2005 · Lasco 2012',
    caution: 'Above 4000 IU a day only with a blood test and your doctor.' },
  { id: 'omega-3', n: 'Omega-3', g: '🐟', for: 'Cramps, mood, skin', ev: 'some', p: ['menstrual', 'luteal'],
    d: [['1–2 g', 'EPA + DHA a day'], ['Fish oil', 'or algae oil'], ['With meals', 'no fishy burps']],
    why: 'Calms the inflammation behind cramps and supports the brain and skin.',
    f: [['Sardines', '100 g ≈ 1.5 g'], ['Wild salmon', '100 g ≈ 1.8 g'], ['Mackerel', '100 g ≈ 2.5 g'], ['Pasture eggs', 'some DHA'], ['Walnuts, flax', 'plant ALA']],
    low: 'Dry skin, strong cramps, low mood.', test: 'Omega-3 index, if you want to know.',
    study: 'Fish oil eased period pain more than placebo, and women needed fewer painkillers. 1–2 g a day lowered depression, anxiety and bloating before the period.',
    cite: 'Rahbar 2012 · Sohrabi 2013',
    caution: 'On blood thinners or before surgery, ask your doctor.' },
  { id: 'zinc', n: 'Zinc', g: '🦪', for: 'Hormonal acne, cramps', ev: 'some', p: ['luteal', 'follicular'],
    d: [['15–25 mg', 'a day'], ['Gluconate', 'or picolinate'], ['Evening', 'not with iron']],
    why: 'Calms skin inflammation and oil, helps heal spots and supports ovulation.',
    f: [['Oysters', '6 ≈ 30 mg'], ['Beef', '100 g ≈ 5 mg'], ['Pumpkin seeds', '30 g ≈ 2.2 mg'], ['Cheese', '30 g ≈ 1 mg']],
    low: 'Spots that heal slowly, white spots on nails, getting ill often.', test: 'Blood zinc is a rough guide.',
    study: '30 mg zinc a day cleared inflammatory acne in a trial against an antibiotic; it worked, though a little less. People with acne tend to have lower zinc.',
    cite: 'Dréno 2001 · Yee 2020 (meta-analysis)',
    caution: 'Over 25 mg a day for months can cause low copper. Take on a full stomach to avoid nausea.' },
  { id: 'calcium', n: 'Calcium', g: '🥛', for: 'PMS mood & bloating', ev: 'strong', p: ['luteal'],
    d: [['1000–1200 mg', 'a day, food first'], ['≤ 500 mg', 'per dose'], ['Raw milk', 'easiest source']],
    why: 'Calcium levels shift across the cycle, and low calcium looks a lot like PMS.',
    f: [['Raw milk', '1 glass ≈ 300 mg'], ['Hard cheese', '30 g ≈ 300 mg'], ['Yogurt or kefir', '1 cup ≈ 300 mg'], ['Sardines with bones', '100 g ≈ 380 mg'], ['Tahini', '2 tbsp ≈ 130 mg']],
    low: 'Low mood, cravings, bloating and cramps before your period.', test: 'Blood calcium stays steady even when intake is low; count your food instead.',
    study: 'In a trial with 466 women, 1200 mg calcium a day cut PMS symptoms by about half by the third cycle, compared with a third on placebo.',
    cite: 'Thys-Jacobs 1998',
    caution: 'History of kidney stones: ask your doctor before supplements. Food calcium is fine.' },
  { id: 'inositol', n: 'Myo-inositol', g: '🌾', for: 'PCOS, irregular cycles', ev: 'some', p: ['follicular', 'ovulatory', 'luteal', 'menstrual'],
    d: [['2 g', 'twice a day'], ['+ 200 µg', 'folate'], ['3 months', 'to see change']],
    why: 'Helps your cells hear insulin again. With PCOS that can lower testosterone and bring back ovulation.',
    f: [['Citrus fruit', 'orange, grapefruit'], ['Beans', 'cooked'], ['Buckwheat', ''], ['Cantaloupe', '']],
    low: 'Irregular cycles, acne and hair growth from PCOS.', test: 'For PCOS: fasting insulin, testosterone, LH/FSH and an ultrasound.',
    study: 'A review of trials in women with PCOS found myo-inositol improved insulin, hormone levels and ovulation, with very few side effects.',
    cite: 'Unfer 2017 (meta-analysis)',
    caution: 'Mild nausea or loose stools at higher doses.' },
  { id: 'vitex', n: 'Chasteberry', g: '🫐', for: 'PMS, breast tenderness', ev: 'strong', p: ['follicular', 'ovulatory', 'luteal', 'menstrual'],
    d: [['20 mg', 'extract a day'], ['Morning', 'every day'], ['3 cycles', 'to judge it']],
    why: 'Vitex agnus-castus gently lowers prolactin and supports progesterone in the second half of the cycle.',
    f: [['A herb, not a food', 'take a standardised extract']],
    low: 'PMS with tender breasts, irritability and a short luteal phase.', test: 'Prolactin and progesterone (day 21 of a 28-day cycle) if you want to check.',
    study: 'In a trial with 170 women, 52% had their PMS halved after 3 cycles, against 24% on placebo. Irritability, mood, anger, headache and breast fullness all improved.',
    cite: 'Schellenberg 2001 (BMJ)',
    caution: 'Not with the pill or other hormonal birth control, in pregnancy, IVF or with dopamine medicines.' },
];

// The science behind each home remedy: active compounds, what studies found, who should be careful.
export const REMEDY_SCIENCE = {
  'lemon-water': { ev: 'emerging', c: [['Vitamin C', 'About 10 mg in half a lemon'], ['Citrate', 'Raises citrate in urine, protects against kidney stones'], ['Hesperidin', 'Citrus flavonoid, supports blood vessels']],
    study: 'Lemon juice raises citrate in urine, which helps prevent kidney stones. A spoon of vinegar with a meal softened the blood sugar rise after it (week 4).',
    cite: 'Penniston 2007 · Östman 2005', caution: 'Acid softens tooth enamel: drink with a straw or rinse with water after, and wait 30 minutes before brushing.' },
  'lung-elixir': { ev: 'emerging', c: [['Allicin', 'Forms when garlic is pressed and rested'], ['Honey', 'Coats the throat, antibacterial'], ['Thymoquinone', 'From black seed oil, anti-inflammatory']],
    study: 'A review found honey eased cough and cold symptoms better than usual care. In a small trial, people taking garlic every day caught fewer colds.',
    cite: 'Abuelgasim 2021 (review) · Lissiman 2014 (Cochrane)', caution: 'Start with 2 cloves: raw garlic can upset the stomach. On blood thinners, ask your doctor. Never give honey to babies under 1.' },
  'circulation-shot': { ev: 'emerging', c: [['Capsaicin', 'From cayenne, warms and widens blood vessels'], ['Olive polyphenols', 'Protect the heart and vessels'], ['Chia fibre & ALA', 'Plant omega-3, steadies blood sugar']],
    study: 'In a large Spanish trial, a diet rich in extra-virgin olive oil lowered heart attacks and strokes by about 30%. Capsaicin improved blood flow in small studies.',
    cite: 'Estruch 2018 (PREDIMED)', caution: 'Cayenne can burn with reflux or on an empty sensitive stomach.' },
  'gut-smoothie': { ev: 'some', c: [['Kefir cultures', 'Dozens of live bacteria and yeasts'], ['Resistant starch', 'From green banana, feeds good bacteria'], ['Anthocyanins', 'From berries, antioxidant']],
    study: 'People who ate fermented foods like kefir every day for 10 weeks had a more diverse gut and lower levels of 19 inflammation markers.',
    cite: 'Wastyk 2021 (Stanford)', caution: 'Raw egg yolks and raw milk: choose very fresh, from healthy animals, and skip both in pregnancy.' },
  'carrot-salad': { ev: 'emerging', c: [['Insoluble fibre', 'Carries used hormones out through the gut'], ['Falcarinol', 'Natural compound in raw carrots'], ['Beta-carotene', 'Turns into vitamin A for skin']],
    study: 'No trials on carrots and hormones yet. Women who ate more fibre had lower estrogen levels across the cycle, because fibre helps the gut clear what the liver has used.',
    cite: 'Gaskins 2009 (BioCycle)', caution: '' },
  'heart-foods': { ev: 'some', c: [['Cacao flavanols', 'Gently lower blood pressure'], ['Beetroot nitrates', 'Turn into nitric oxide, widen vessels'], ['Omega-3', 'From wild fish, steadies the heart rhythm']],
    study: 'Cacao flavanols lowered blood pressure a little in a Cochrane review. Beetroot juice lowered the top number by about 4 mmHg.',
    cite: 'Ried 2017 (Cochrane) · Siervo 2013 (meta-analysis)', caution: 'Beetroot can turn urine pink, which is harmless. On heart or blood-thinning medicine, ask your doctor before supplements.' },
};
