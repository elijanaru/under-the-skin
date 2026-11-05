// World kitchen: eight food regions, two dishes for each phase of the cycle.
// Period and luteal dishes are always warm and cooked; follicular and ovulation lean raw and fresh.
// pic = a key in FOOD_PHOTOS (photos.js); g = what the dish gives her.
const d = (n, warm, pic, key, g, how) => ({ n, warm, pic, key, g, how });

export const PHASE_EAT = {
  menstrual: ['Warm & iron-rich', 'You lose iron and warmth. Broths, red meat and slow stews refill you and ease cramps.'],
  follicular: ['Fresh & light', 'Estrogen is rising. Fresh, raw and protein-rich food fits your new energy.'],
  ovulatory: ['Raw & colourful', 'Your peak. Colourful raw food, fibre and zinc help you clear extra estrogen.'],
  luteal: ['Cooked & grounding', 'You burn more energy now. Cooked, grounding food with magnesium and slow carbs keeps you steady.'],
};

export const WORLD = [
  { k: 'med', name: 'Mediterranean', pic: 'Olives', note: 'Olive oil, fish, herbs and sun-ripe produce', dishes: {
    menstrual: [d('Lamb & white bean stew', true, 'Spring lamb', ['Lamb', 'White beans', 'Rosemary'], ['Iron', 'Zinc'], 'Brown lamb with onion and garlic, add soaked white beans, rosemary and broth. Simmer for an hour until soft.'),
      d('Saffron fish & mussel soup', true, 'Mussels', ['Mussels', 'White fish', 'Fennel', 'Saffron'], ['Iron', 'B12'], 'Soften fennel and onion in olive oil, add saffron and broth, then the fish and mussels for the last 6 minutes.')],
    follicular: [d('Village salad with sheep cheese', false, 'Tomatoes', ['Tomato', 'Cucumber', 'Olives', 'Raw sheep cheese'], ['Calcium', 'Vitamin C'], 'Chunky tomato, cucumber and red onion, a slab of raw sheep cheese, olives, oregano and good olive oil.'),
      d('Grilled sardines with lemon', true, 'Sardines', ['Sardines', 'Lemon', 'Parsley'], ['Omega-3', 'Protein'], 'Grill whole sardines hot and fast, 3 minutes a side. Finish with lemon, parsley and sea salt.')],
    ovulatory: [d('Fennel, orange & pomegranate', false, 'Fennel', ['Fennel', 'Orange', 'Pomegranate', 'Mint'], ['Fibre', 'Vitamin C'], 'Shave fennel thin, add orange slices, pomegranate seeds, mint and olive oil.'),
      d('Octopus with olive oil & herbs', true, 'Octopus', ['Octopus', 'Olive oil', 'Oregano'], ['Zinc', 'B12'], 'Simmer octopus until tender, char briefly on a hot pan, dress with olive oil, lemon and oregano.')],
    luteal: [d('Roasted aubergine & chickpeas', true, 'Aubergine', ['Aubergine', 'Chickpeas', 'Tahini'], ['Magnesium', 'Fibre'], 'Roast aubergine and chickpeas with cumin until golden, drizzle with tahini and lemon.'),
      d('Peppers stuffed with lamb & herbs', true, 'Peppers', ['Peppers', 'Lamb mince', 'Parsley', 'Pine nuts'], ['B6', 'Protein'], 'Fill peppers with lamb, herbs and pine nuts, bake for 40 minutes in a little tomato sauce.')] } },

  { k: 'eastasia', name: 'East Asian', pic: 'Shiitake', note: 'Broths, ginger, mushrooms and steamed fish', dishes: {
    menstrual: [d('Ginger chicken & goji soup', true, 'Chicken', ['Chicken', 'Ginger', 'Goji', 'Red dates'], ['Iron', 'Warmth'], 'Simmer chicken pieces with lots of ginger, red dates and goji berries for 90 minutes. A classic warming soup after the period starts.'),
      d('Red date & black sesame porridge', true, 'Jujubes (daechu)', ['Red dates', 'Black sesame', 'A little rice'], ['Iron', 'Calcium'], 'Cook a small handful of rice very soft with red dates, stir in ground black sesame and a spoon of raw honey off the heat.')],
    follicular: [d('Salmon sashimi with daikon', false, 'Wild salmon', ['Wild salmon', 'Daikon', 'Seaweed'], ['Omega-3', 'Protein'], 'Very fresh salmon sliced thin on grated daikon, with seaweed and a little tamari and wasabi.'),
      d('Spring onion & egg stir-fry', true, 'Pasture eggs', ['Pasture eggs', 'Spring onion', 'Sesame oil'], ['Choline', 'Protein'], 'Scramble eggs softly in a hot wok with lots of spring onion, finish with sesame oil.')],
    ovulatory: [d('Cucumber & seaweed salad', false, 'Cucumbers', ['Cucumber', 'Wakame', 'Sesame', 'Rice vinegar'], ['Fibre', 'Iodine'], 'Smash cucumber, toss with soaked wakame, rice vinegar, sesame and a pinch of chili.'),
      d('Steamed fish with ginger', true, 'Cod', ['White fish', 'Ginger', 'Spring onion'], ['Protein', 'Iodine'], 'Steam the fish for 8 minutes on ginger, top with spring onion and pour over sizzling oil and tamari.')],
    luteal: [d('Shiitake & wakame miso soup', true, 'Shiitake', ['Shiitake', 'Wakame', 'Miso'], ['Magnesium', 'B vitamins'], 'Simmer shiitake in broth, add wakame, take off the heat and stir in miso so it stays alive.'),
      d('Pumpkin & chestnut stew', true, 'Pumpkin & winter squash', ['Pumpkin', 'Chestnuts', 'Ginger'], ['Slow carbs', 'Magnesium'], 'Braise pumpkin and peeled chestnuts with ginger and a little tamari until soft and glossy.')] } },

  { k: 'korea', name: 'Korean', pic: 'Napa cabbage', note: 'Ferments, soups, wild greens and rice', dishes: {
    menstrual: [d('Miyeok-guk seaweed soup', true, 'Seaweed (gim & miyeok)', ['Miyeok seaweed', 'Beef', 'Garlic'], ['Iron', 'Iodine'], 'Sauté beef and soaked seaweed in sesame oil, add water and garlic, simmer 30 minutes. In Korea it is eaten after giving birth and on birthdays to rebuild blood.'),
      d('Galbi-tang beef rib soup', true, 'Red meat', ['Beef short ribs', 'Korean radish', 'Jujubes'], ['Iron', 'Zinc'], 'Simmer ribs with radish, jujubes and garlic for 2 hours until the meat falls off the bone.')],
    follicular: [d('Bibimbap with spring namul', true, 'Spring wild greens (naengi, dallae, ssuk)', ['Wild greens', 'Egg', 'Rice', 'Gochujang'], ['Folate', 'Protein'], 'Blanched spring greens, a soft egg and a little rice, mixed with gochujang and sesame oil.'),
      d('Minari & perilla salad', false, 'Minari (water dropwort)', ['Minari', 'Perilla leaves', 'Sesame'], ['Folate', 'Vitamin K'], 'Toss fresh minari and torn perilla leaves with sesame oil, vinegar and a pinch of gochugaru.')],
    ovulatory: [d('Hoe-deopbap raw fish bowl', false, 'Aged kimchi (mugeunji)', ['Raw fish', 'Kimchi', 'Crisp greens'], ['Probiotics', 'Omega-3'], 'Fresh raw fish over crisp lettuce and a little rice, with kimchi and a spoon of chogochujang.'),
      d('Asian pear & cucumber salad', false, 'Asian pears (bae)', ['Asian pear', 'Cucumber', 'Pine nuts'], ['Fibre', 'Hydration'], 'Slice pear and cucumber thin, add pine nuts and a light vinegar dressing.')],
    luteal: [d('Doenjang-jjigae', true, 'Zucchini (aehobak)', ['Doenjang', 'Courgette', 'Mushrooms', 'A little tofu'], ['Magnesium', 'Probiotics'], 'Simmer doenjang in anchovy broth with courgette, mushrooms, onion and a few cubes of tofu.'),
      d('Roasted goguma', true, 'Sweet potatoes (goguma)', ['Korean sweet potato'], ['Slow carbs', 'B6'], 'Roast whole sweet potatoes at 200 °C for an hour until caramel-sweet. Eat warm with kimchi.')] } },

  { k: 'southasia', name: 'South Asian', pic: 'Mango', note: 'Spices, ghee, lentils and warming curries', dishes: {
    menstrual: [d('Mung dal with ghee & ginger', true, 'Parsley & coriander', ['Mung lentils', 'Ghee', 'Ginger', 'Turmeric'], ['Iron', 'Protein'], 'Simmer yellow mung lentils with turmeric, then pour over ghee sizzled with cumin, ginger and garlic.'),
      d('Slow lamb curry', true, 'Spring lamb', ['Lamb', 'Yoghurt', 'Cardamom', 'Cinnamon'], ['Iron', 'Zinc'], 'Brown lamb with whole spices, add yoghurt and a little water, cook covered on low for 2 hours.')],
    follicular: [d('Paneer tikka with mint', true, 'Mint', ['Fresh paneer', 'Yoghurt', 'Mint'], ['Protein', 'Calcium'], 'Marinate paneer in yoghurt and spices, grill until charred, serve with fresh mint chutney.'),
      d('Kachumber salad', false, 'Cucumbers', ['Cucumber', 'Tomato', 'Red onion', 'Lime'], ['Vitamin C', 'Hydration'], 'Finely chop cucumber, tomato and onion, add lime, coriander and roasted cumin.')],
    ovulatory: [d('Mango & lime salad', false, 'Mango', ['Mango', 'Lime', 'Chili', 'Coriander'], ['Vitamin C', 'Fibre'], 'Cubes of ripe mango with lime, a little chili, salt and coriander.'),
      d('Tandoori fish with lemon', true, 'Mackerel', ['Oily fish', 'Yoghurt', 'Lemon'], ['Omega-3', 'Vitamin D'], 'Coat fish in spiced yoghurt, roast very hot for 10 minutes, finish with lemon.')],
    luteal: [d('Sweet potato & chickpea curry', true, 'Sweet potatoes', ['Sweet potato', 'Chickpeas', 'Coconut milk'], ['Magnesium', 'B6'], 'Cook onion, ginger and spices, add sweet potato, chickpeas and coconut milk, simmer 25 minutes.'),
      d('Golden milk', true, 'Raw honey', ['Raw milk', 'Turmeric', 'Cinnamon', 'Raw honey'], ['Calm', 'Warmth'], 'Warm raw milk gently with turmeric, cinnamon and a pinch of pepper, sweeten with raw honey once off the heat.')] } },

  { k: 'latam', name: 'Latin American', pic: 'Avocado', note: 'Beans, corn, chili, lime and tropical fruit', dishes: {
    menstrual: [d('Black bean & beef stew', true, 'Red meat', ['Black beans', 'Beef', 'Orange zest'], ['Iron', 'Fibre'], 'Slow-cook beef with soaked black beans, onion, garlic, bay and orange zest for 2 hours.'),
      d('Chicken & corn soup', true, 'Chicken', ['Chicken', 'Corn', 'Coriander', 'Lime'], ['Protein', 'Warmth'], 'Simmer chicken with corn on the cob, potato and coriander. Squeeze lime over each bowl.')],
    follicular: [d('Ceviche with avocado', false, 'Avocado', ['Fresh white fish', 'Lime', 'Avocado', 'Red onion'], ['Protein', 'Good fats'], 'Cube very fresh fish, cover with lime for 15 minutes, add red onion, chili, coriander and avocado.'),
      d('Huevos rancheros', true, 'Pasture eggs', ['Pasture eggs', 'Tomato salsa', 'Beans'], ['Protein', 'Choline'], 'Fried eggs on warm beans with fresh tomato and chili salsa, a corn tortilla if you like.')],
    ovulatory: [d('Tropical fruit with chili & lime', false, 'Passionfruit', ['Papaya', 'Passionfruit', 'Pineapple', 'Lime'], ['Vitamin C', 'Enzymes'], 'Papaya, pineapple and passionfruit with lime juice and a pinch of chili salt.'),
      d('Guacamole with raw crudités', false, 'Avocado', ['Avocado', 'Lime', 'Raw vegetables'], ['Good fats', 'Fibre'], 'Mash avocado with lime, onion, chili and coriander. Dip crisp raw veg.')],
    luteal: [d('Pumpkin & chili soup', true, 'Pumpkin', ['Pumpkin', 'Chili', 'Raw cheese'], ['Slow carbs', 'Magnesium'], 'Simmer pumpkin with onion and a little chili, blend, top with crumbled raw cheese and pumpkin seeds.'),
      d('Sweet potato & black bean tacos', true, 'Sweet potatoes', ['Sweet potato', 'Black beans', 'Corn tortillas'], ['Magnesium', 'Fibre'], 'Roast cumin sweet potato, warm black beans, fold into small corn tortillas with lime crema.')] } },

  { k: 'mideast', name: 'Middle Eastern', pic: 'Pomegranate', note: 'Herbs, tahini, lentils, dates and spice', dishes: {
    menstrual: [d('Lamb & lentil harira', true, 'Red meat', ['Lamb', 'Lentils', 'Tomato', 'Cinnamon'], ['Iron', 'Protein'], 'Simmer lamb with lentils, tomato, celery and warm spices for an hour, finish with lemon and herbs.'),
      d('Shakshuka', true, 'Tomatoes', ['Pasture eggs', 'Tomato', 'Peppers', 'Cumin'], ['Protein', 'Iron'], 'Cook peppers and tomatoes with cumin and paprika into a thick sauce, poach eggs in it.')],
    follicular: [d('Big herb salad with pomegranate', false, 'Parsley', ['Parsley', 'Mint', 'Pomegranate', 'Lemon'], ['Vitamin C', 'Folate'], 'Mostly chopped parsley and mint, a little onion, pomegranate seeds, lemon and olive oil.'),
      d('Labneh with olive oil & za’atar', false, 'Greek yoghurt', ['Raw-milk labneh', 'Za’atar', 'Olive oil'], ['Probiotics', 'Calcium'], 'Strain raw yoghurt overnight into thick labneh, top with olive oil and za’atar.')],
    ovulatory: [d('Pomegranate & walnut salad', false, 'Pomegranate', ['Pomegranate', 'Walnuts', 'Rocket'], ['Fibre', 'Antioxidants'], 'Rocket, pomegranate seeds and toasted walnuts with a pomegranate molasses dressing.'),
      d('Grilled fish with sumac', true, 'Sardines', ['Oily fish', 'Sumac', 'Lemon'], ['Omega-3', 'Zinc'], 'Rub fish with sumac and olive oil, grill hot, serve with lemon and sliced red onion.')],
    luteal: [d('Smoky aubergine dip', true, 'Aubergine', ['Aubergine', 'Tahini', 'Garlic'], ['Magnesium', 'Fibre'], 'Char whole aubergine over a flame until soft, mash with tahini, garlic and lemon. Eat it warm.'),
      d('Red lentil soup with cumin', true, 'Lemons', ['Red lentils', 'Cumin', 'Lemon'], ['Magnesium', 'Protein'], 'Simmer red lentils with onion, carrot and cumin until creamy, blend and squeeze in lemon.')] } },

  { k: 'nordic', name: 'Nordic & Central European', pic: 'Wild salmon', note: 'Wild fish, berries, roots and cultured dairy', dishes: {
    menstrual: [d('Beef & root vegetable broth', true, 'Root vegetables', ['Beef bones', 'Carrot', 'Celeriac', 'Leek'], ['Iron', 'Minerals'], 'Simmer beef and marrow bones with roots and leek for 4 hours. Sip hot all day.'),
      d('Venison stew with lingonberries', true, 'Venison', ['Venison', 'Juniper', 'Lingonberries'], ['Iron', 'Zinc'], 'Brown venison, braise with onion, juniper and broth for 2 hours, serve with lingonberries.')],
    follicular: [d('Cured salmon with dill', false, 'Dill', ['Wild salmon', 'Dill', 'Sea salt'], ['Omega-3', 'Vitamin D'], 'Cure salmon for 2 days in salt, a little raw honey and dill, then slice thin.'),
      d('Radish & cucumber with kefir', false, 'Radishes', ['Radishes', 'Cucumber', 'Raw kefir'], ['Probiotics', 'Hydration'], 'Thin radish and cucumber in a cold kefir and dill dressing.')],
    ovulatory: [d('Herring with new potatoes', true, 'Matjes herring', ['Herring', 'New potatoes', 'Dill'], ['Omega-3', 'Vitamin D'], 'Mild herring with warm new potatoes, red onion, dill and a spoon of sour cream.'),
      d('Wild berries with raw cream', false, 'Bilberries', ['Bilberries', 'Raspberries', 'Raw cream'], ['Antioxidants', 'Fibre'], 'A bowl of wild berries with a pour of raw cream.')],
    luteal: [d('Roasted roots with goat cheese', true, 'Parsnips', ['Parsnips', 'Carrots', 'Goat cheese'], ['Slow carbs', 'Magnesium'], 'Roast parsnips and carrots with thyme until golden, crumble goat cheese over while hot.'),
      d('Creamy chanterelle soup', true, 'Chanterelles', ['Chanterelles', 'Butter', 'Raw cream'], ['Vitamin D', 'B vitamins'], 'Fry chanterelles in butter with shallot, add broth and cream, simmer gently.')] } },

  { k: 'westafrica', name: 'West African', pic: 'Peppers', note: 'Peppers, groundnuts, greens and fish', dishes: {
    menstrual: [d('Pepper soup with fish', true, 'Peppers', ['Fish', 'Scotch bonnet', 'Ginger', 'Herbs'], ['Iron', 'Warmth'], 'Simmer fish with ginger, a whole scotch bonnet and pepper-soup spices. Light, fiery and warming.'),
      d('Groundnut stew with chicken', true, 'Chicken', ['Chicken', 'Groundnut paste', 'Tomato'], ['Protein', 'Magnesium'], 'Brown chicken, add tomato, onion and peanut paste with broth, cook slowly until thick.')],
    follicular: [d('Chicken yassa with lemon & onion', true, 'Lemons', ['Chicken', 'Lemon', 'Onion', 'Mustard'], ['Protein', 'Vitamin C'], 'Marinate chicken in lemon, onion and mustard, grill, then soften the onions into a tangy sauce.'),
      d('Fresh tomato & onion salad', false, 'Tomatoes', ['Tomato', 'Onion', 'Lime', 'Chili'], ['Vitamin C', 'Lycopene'], 'Sliced tomatoes and onion with lime, chili and salt.')],
    ovulatory: [d('Mango, pineapple & lime', false, 'Mango', ['Mango', 'Pineapple', 'Lime'], ['Vitamin C', 'Fibre'], 'Ripe mango and pineapple with a squeeze of lime.'),
      d('Suya-spiced prawns', true, 'Prawns', ['Prawns', 'Suya spice', 'Red onion'], ['Zinc', 'Protein'], 'Coat prawns in ground peanut and chili suya spice, grill quickly, serve with raw onion and tomato.')],
    luteal: [d('Egusi stew with greens', true, 'Collards & mustard greens', ['Melon seeds', 'Greens', 'Beef'], ['Magnesium', 'Iron'], 'Cook ground melon seeds with palm oil, beef and greens into a thick, rich stew.'),
      d('Sweet potato & black-eyed peas', true, 'Sweet potatoes', ['Sweet potato', 'Black-eyed peas', 'Ginger'], ['Slow carbs', 'B6'], 'Simmer black-eyed peas with sweet potato, tomato, ginger and a little palm oil.')] } },
];
export const worldOf = k => WORLD.find(r => r.k === k);
