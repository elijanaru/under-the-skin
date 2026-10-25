// Content library: phases, workouts, recipes, articles, log options.

export const PHASE_ORDER = ['menstrual', 'follicular', 'ovulatory', 'luteal'];

// Phase colors for dark surfaces and for light (white) surfaces.
export const PHASE_COLOR = {
  dark:  { menstrual: '#f2f4ee', follicular: '#9fcf8c', ovulatory: '#d4ef9a', luteal: '#3f8a5c' },
  light: { menstrual: '#0d0f0d', follicular: '#7fb46a', ovulatory: '#b9dc6e', luteal: '#1f4a33' },
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
    superpower: { title: 'Communication', text: 'Confidence and verbal fluency peak. Perfect for pitching, presenting and honest conversations.' },
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
    steps: ['Blend liver, eggs, melted fat and salt (plus banana if using) until completely smooth.', 'Melt a little butter in a pan over medium heat.', 'Pour small rounds, cook until bubbles form and edges set, then flip.', 'Serve warm with raw honey and fruit — the easiest way to eat liver.'],
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
    steps: ['Blitz everything in a food processor until sticky.', 'Roll into 12 balls.', 'Chill for 20 minutes. Keeps 1 week in the fridge.'],
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
      'It also helps muscles recover and use carbohydrates efficiently — a great time to push strength goals.',
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

export const SYMPTOMS = ['Cramps', 'Ovulation pain', 'Bloating', 'Headache', 'Acne', 'Tender breasts', 'Back pain', 'Fatigue', 'Cravings', 'Nausea', 'Insomnia', 'Constipation', 'Dizziness'];
export const MOODS = ['Calm', 'Happy', 'Energetic', 'Confident', 'Social', 'Sensitive', 'Anxious', 'Irritable', 'Sad', 'Unmotivated'];
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
  { id: 'liver-stretch', name: 'Side-body Qi release', phases: ['luteal', 'ovulatory'], mins: 5, glyph: '肝',
    steps: ['Stand tall, reach your right arm overhead and lean left. 5 breaths.', 'Switch sides. 5 breaths.', 'Tap firmly along your ribs on both sides for 30 seconds.', 'Finish with three long sighs out through the mouth.'],
    why: 'The Liver and Gallbladder channels run along the sides of the body. Opening them eases tension and irritability.' },
  { id: 'early-sleep', name: 'Liver-hour sleep', phases: ['follicular', 'menstrual', 'luteal'], mins: 30, glyph: '眠',
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
      do: ['Take something off her plate without being asked', 'Bring a hot water bottle or heat pack', 'Plan a cosy night in — film, blanket, takeaway', 'Keep the house warm and offer warm drinks'],
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
    why: 'You lose roughly 15–20 mg of iron each period, and low iron is the most common cause of fatigue in women. Anti-inflammatory fats and magnesium may ease cramps.',
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
      { n: 'Fibre', target: '25–30 g / day', why: 'Feeds the gut bacteria that help regulate estrogen.', foods: ['Berries', 'Beans', 'Broccoli', 'Flax', 'Apples'], ev: 'strong' },
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
      { n: 'Fibre', target: '25–30 g / day', why: 'Helps clear used estrogen through the gut.', foods: ['Raspberries', 'Lentils', 'Chia', 'Pears', 'Artichoke'], ev: 'strong' },
      { n: 'Cruciferous veg', target: '1–2 portions / day', why: 'Contain compounds that support liver hormone processing.', foods: ['Broccoli', 'Brussels sprouts', 'Cauliflower', 'Kale', 'Rocket'], ev: 'emerging' },
      { n: 'Antioxidants', target: '5+ colours / day', why: 'Protect cells, skin and eggs from oxidative stress.', foods: ['Berries', 'Tomatoes', 'Green tea', 'Peppers', 'Pomegranate'], ev: 'some' },
      { n: 'Zinc', target: '8 mg / day', why: 'Involved in ovulation and skin health.', foods: ['Pumpkin seeds', 'Shellfish', 'Chickpeas', 'Beef', 'Cashews'], ev: 'some' },
      { n: 'Hydration', target: '2+ litres', why: 'Supports cervical fluid and energy.', foods: ['Water', 'Cucumber', 'Watermelon', 'Herbal tea'], ev: 'strong' },
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
      { meal: 'Dinner', what: 'Turkey or wild fish with roasted squash & a big raw salad', recipe: null },
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
      { t: 'Press LV3 (Taichong)', d: 'On the top of the foot between the big and second toe, 1–2 minutes each side, to “move” stuck energy.', ev: 'tcm', to: 'point/ovulatory' },
    ],
    tcm: 'Chinese medicine sees this as a brief “stuck” moment while the body pushes the egg out. Warmth and gentle movement help it flow.',
    doctor: 'Sharp or severe one-sided pain, pain with fever, vomiting or fainting, or pain lasting more than 2 days.',
  },
  Cramps: {
    why: 'Prostaglandins make the uterus contract to shed its lining; higher levels mean stronger cramps.',
    steps: [
      { t: 'Heat on your lower belly or back', d: 'A heat pad or hot water bottle for 20+ minutes. A 2026 review of 57 trials found heat reduces period pain.', ev: 'strong' },
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
    why: 'After ovulation progesterone raises night-time body temperature by about 0.3–0.7°C, and sleep is often worst in the 5–7 days before your period.',
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
  title: 'Gottes Nahrung',
  sub: 'Food as it was created — whole, natural, alive.',
  principles: [
    { t: 'Unprocessed & natural', d: 'Whole foods in their original form. No additives, sweeteners, preservatives or refined oils.' },
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
    ingredients: ['Juice of ½ fresh lemon (or a lime — milder, rich in potassium)', '300 ml lukewarm water'],
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
    why: 'A daily raw carrot binds and helps clear excess estrogen through the gut — a classic for PMS and estrogen balance. The Liver (Wood) processes hormones.',
    ingredients: ['1 raw carrot, grated or peeled into ribbons', '1 tsp coconut oil or olive oil', '1 tsp apple cider vinegar', 'Pinch of sea salt'],
    steps: ['Grate or ribbon the carrot.', 'Toss with oil, vinegar and salt.', 'Eat between meals, daily. Pause during your period (warm days) — swap for cooked carrots.'] },
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
export const HORMONE_LIBRARY = [
  { n: 'Oestrogen', g: 'Ovaries', role: 'Affects the urinary tract, heart and blood vessels, bones, muscles, breasts, skin, hair, mucous membranes, brain and fertility.', cycle: 'Rises through the follicular phase and peaks just before ovulation.', support: 'Fibre, cruciferous veg and a daily raw carrot help clear used estrogen.' },
  { n: 'Progesterone', g: 'Ovaries (corpus luteum)', role: 'Released after ovulation; prepares the body for a possible pregnancy and helps support one.', cycle: 'Dominates the luteal phase; calming and warming.', support: 'Eggs (cholesterol & choline), vitamin C, zinc, enough food and low stress.' },
  { n: 'FSH', g: 'Pituitary gland', role: 'Follicle-stimulating hormone — the “wake-up call” for your ovaries. Each month your brain sends FSH to the ovaries, telling a small group of follicles (tiny fluid sacs that each hold an egg) to start growing. The strongest one becomes the egg you release, and as it grows it makes estrogen.', cycle: 'Rises at the very start of your cycle, during your period, to start a new egg growing — then a small spike at ovulation. Without enough FSH, no egg matures and estrogen stays low.', support: 'Steady sleep, enough calories and protein, and less stress — your brain only sends strong signals when it feels safe and fed.' },
  { n: 'LH', g: 'Pituitary gland', role: 'Luteinising hormone — the “release” signal. A sudden LH surge tells the ripe follicle to burst open and release its egg (ovulation). This is the egg sign on your hormone chart.', cycle: 'Surges 24–36 hours before ovulation.', support: 'Manage stress — high cortisol can blunt the surge.' },
  { n: 'Testosterone', g: 'Ovaries & adrenal glands', role: 'Affects red blood cells, menstruation, tissue and bone mass, sex drive and fertility.', cycle: 'Peaks gently around ovulation — libido and confidence.', support: 'Strength training, zinc (oysters), healthy fats.' },
  { n: 'Prolactin', g: 'Pituitary gland', role: 'Enables breast milk production after birth.', cycle: 'Can rise with stress and poor sleep, disturbing ovulation.', support: 'Rest, B6-rich foods, gentle evenings.' },
  { n: 'SHBG', g: 'Liver', role: 'Carries oestrogen and testosterone through the blood and controls how much the tissues can use.', cycle: 'Shapes how strongly you feel your hormones.', support: 'Stable blood sugar and a healthy liver.' },
  { n: 'Insulin', g: 'Pancreas', role: 'Regulates blood sugar and stores excess glucose for energy.', cycle: 'You may be slightly less insulin-sensitive in the luteal phase.', support: 'Protein with every meal, strength training, walks after meals.' },
  { n: 'Cortisol', g: 'Adrenal glands', role: 'Prepares the “fight or flight” response — faster heart rate and breathing — and influences mood.', cycle: 'Chronic stress can delay ovulation and worsen PMS.', support: 'Dancing, nature, slowing down, magnesium baths.' },
  { n: 'Adrenaline', g: 'Adrenal glands', role: 'Prepares the body’s stress response by raising heart rate and releasing glucose.', cycle: 'Constant alerts and scrolling keep it switched on.', support: 'Phone-free time and deep breathing.' },
  { n: 'Thyroid hormones', g: 'Thyroid gland', role: 'Regulate metabolism — how the body uses energy, produces heat and consumes oxygen.', cycle: 'Low thyroid can cause irregular, heavy periods and cold hands and feet.', support: 'Enough carbs and calories, selenium, iodine (seaweed), raw honey.' },
  { n: 'Melatonin', g: 'Pineal gland', role: 'Essential for good sleep; relaxes the body and lowers body temperature.', cycle: 'Supports egg quality and calms luteal sleep.', support: 'Darkness at night, no blue light before bed, morning daylight.' },
  { n: 'Serotonin', g: 'Gut', role: 'Improves mood and digestion; precursor to melatonin.', cycle: 'Dips with estrogen before your period — hello PMS mood.', support: 'Daylight, movement, slow carbs, a healthy gut.' },
  { n: 'Active vitamin D', g: 'Kidneys', role: 'A steroid hormone (calcitriol) that regulates calcium and phosphorus — crucial for bones.', cycle: 'Linked to egg quality and fertility.', support: 'Sunlight, oily fish, egg yolks, butter.' },
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
  { id: 'egg-yolks', g: 'fertile', t: 'Egg yolks or liver today', why: 'Choline and cholesterol are building blocks for progesterone.' },
  { id: 'warm-soup', g: 'fertile', t: 'A warm soup or broth', why: 'Nourishing and easy to digest — TCM builds Blood with warmth.' },
  { id: 'magnesium-bath', g: 'fertile', t: 'Long hot magnesium bath', why: 'Relaxes muscles and the nervous system; magnesium for sleep.' },
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
  { f: 'Eggs', why: 'Choline and cholesterol for progesterone production.' },
  { f: 'Raw carrot', why: 'Helps clear excess estrogen through the gut.' },
  { f: 'Vitamin D (sunlight)', why: 'Optimise levels for egg quality.' },
  { f: 'Raw honey', why: 'Gentle sugars that support thyroid function.' },
  { f: 'High-fat raw dairy', why: 'Linked with lower rates of anovulatory cycles.' },
  { f: 'Red meat', why: 'Bioavailable heme iron and L-carnitine for egg quality.' },
  { f: 'Liver', why: 'Nature’s prenatal multivitamin — vitamin A, folate, B12, iron.' },
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
  'flow-start': { title: 'Rest & restore', r: { lift: 0, hiit: 0, sport: 1, pilates: 1, yoga: 2, meditate: 3, walk: 3 }, tip: 'Hormones are at their lowest and your body is shedding. Walks, yin yoga and meditation — intuition is strong now. Skip the PR attempts.' },
  'flow-end': { title: 'Ease back in', r: { lift: 1, hiit: 1, sport: 2, pilates: 2, yoga: 3, meditate: 2, walk: 3 }, tip: 'As bleeding eases, start moving more: flowing yoga, pilates, light strength. Iron-rich food helps your energy come back.' },
  'rising': { title: 'Build strength', r: { lift: 2, hiit: 2, sport: 3, pilates: 2, yoga: 2, meditate: 1, walk: 2 }, tip: 'Rising estrogen improves recovery. A great window to try a new class and ramp up your training volume.' },
  'building': { title: 'Lift heavy', r: { lift: 3, hiit: 3, sport: 3, pilates: 2, yoga: 1, meditate: 1, walk: 2 }, tip: 'Your best window for heavy lifting and new personal bests — studies that put more strength training into the follicular phase saw bigger gains.' },
  'peak': { title: 'Peak power', r: { lift: 3, hiit: 3, sport: 3, pilates: 2, yoga: 1, meditate: 1, walk: 2 }, tip: 'Estrogen and testosterone peak: strength, speed and confidence are high. Warm up well — ligaments are a little looser around ovulation.' },
  'settle': { title: 'Steady strength', r: { lift: 2, hiit: 2, sport: 2, pilates: 3, yoga: 2, meditate: 2, walk: 2 }, tip: 'Progesterone rises and your body temperature climbs. Keep lifting at moderate weights, take longer rests, drink more water.' },
  'focus': { title: 'Endurance & flow', r: { lift: 2, hiit: 1, sport: 2, pilates: 3, yoga: 2, meditate: 2, walk: 3 }, tip: 'Steady efforts beat all-out ones: pilates, hiking, swimming, steady cardio. Your body burns more fat for fuel now.' },
  'premenstrual': { title: 'Slow down', r: { lift: 1, hiit: 0, sport: 1, pilates: 2, yoga: 3, meditate: 3, walk: 3 }, tip: 'Energy drops before your period. Yin yoga, stretching, walks and meditation calm cramps and moods — rest is training too.' },
};
