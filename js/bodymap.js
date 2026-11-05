// The body map around the floating figure: five parts of her body, what to do for each today, and what is going on there.
// [part, label, icon, short do, what is happening, [step 1, step 2], avoid, route, link label]
const P = (k, label, ic, d, what, steps, avoid, to, link) => ({ k, label, ic, d, what, steps, avoid, to, link });
export const BODY_MAP = {
  menstrual: [
    P('mind', 'Mind', 'mind', 'Rest your mind', 'Estrogen and progesterone are at their lowest. Many women see clearly now what is and is not working in their life.', ['Write one page: what to keep, what to drop', 'Say no to one extra task today'], 'Big decisions under pressure', 'brain', 'What your brain is doing'),
    P('heart', 'Heart', 'heart', 'Be gentle with you', 'Feelings sit closer to the surface and you tire faster. That is your body asking for quiet, not a weakness.', ['Breathe out longer than in, 5 minutes', 'Ask for a hug or a warm call'], 'Crowded, loud plans', 'breathe', 'Breathe with me'),
    P('gut', 'Food', 'bowl', 'Warm and iron-rich', 'You lose iron with the blood, and digestion is more sensitive while you bleed.', ['Bone broth, red meat or lentil soup', 'Stewed apple with cinnamon as a sweet'], 'Cold, raw food and iced drinks', 'do/eat', 'What to eat today'),
    P('womb', 'Womb', 'drop', 'Keep it warm', 'The lining is shedding. Prostaglandins make the womb squeeze, which is what you feel as cramps.', ['Heat on your belly for 20 minutes', 'Ginger tea, socks on, feet warm'], 'Cold feet and cold drinks', 'relief', 'Cramp relief'),
    P('legs', 'Move', 'leaf', 'Walk, stretch, rest', 'Energy is lowest on the first days. Your strength has not changed, effort just feels harder.', ['A slow 20 minute walk', 'Child’s pose and hip circles'], 'Hard intervals on heavy days', 'move', 'Move with your cycle'),
  ],
  follicular: [
    P('mind', 'Mind', 'mind', 'Learn something new', 'Rising estrogen lifts dopamine and serotonin. Curiosity, focus and memory get sharper.', ['Start the project you put off', 'Read or learn something hard'], 'Only routine all week', 'brain', 'What your brain is doing'),
    P('heart', 'Heart', 'heart', 'Say yes to people', 'Your mood lifts with estrogen. New people and places feel exciting instead of tiring.', ['Plan a trip or meet someone new', 'Write down three goals for this month'], 'Cancelling out of habit', 'do/friends', 'Friends this phase'),
    P('gut', 'Food', 'bowl', 'Fresh and light', 'Insulin works well now, and estrogen likes fibre and fermented food to help it clear.', ['A fresh salad with eggs or fish', 'Sauerkraut or kefir with a meal'], 'Skipping protein', 'do/eat', 'What to eat today'),
    P('womb', 'Womb', 'drop', 'Rebuild', 'Estrogen rebuilds the womb lining while one egg ripens in its follicle.', ['Eggs, meat or fish for protein and iron', 'Pumpkin seeds for zinc'], 'Skipping meals', 'hormones', 'Your hormones'),
    P('legs', 'Move', 'leaf', 'Train harder', 'You recover fast and handle hard sessions well in this phase.', ['Lift heavy or try intervals', 'Add one new move'], 'Only easy sessions', 'move', 'Move with your cycle'),
  ],
  ovulatory: [
    P('mind', 'Mind', 'mind', 'Speak up', 'Estrogen peaks. Words come easily and you read faces and moods well.', ['Have the big conversation', 'Pitch, present or record'], 'Hiding your idea', 'brain', 'What your brain is doing'),
    P('heart', 'Heart', 'heart', 'Connect', 'Estrogen and testosterone peak together. You feel social, warm and confident.', ['Dinner with friends or a date', 'Dance or sing out loud'], 'Staying home out of guilt', 'do/friends', 'Friends this phase'),
    P('gut', 'Food', 'bowl', 'Fibre and colour', 'Your liver is busy clearing the estrogen peak. Fibre and bitter greens help it along.', ['Raw veg, berries and flax', 'Plenty of water through the day'], 'Lots of alcohol', 'do/eat', 'What to eat today'),
    P('womb', 'Womb', 'drop', 'Egg release', 'LH surges and one egg is released. The fertile window is open. A twinge on one side is common.', ['Notice clear, stretchy fluid', 'Soft belly massage if it twinges'], 'Guessing about contraception', 'hormones', 'Your hormones'),
    P('legs', 'Move', 'leaf', 'Go for your best', 'This is your peak power. Ligaments may be a little looser, so warm up well.', ['Try a personal best', '10 minutes of warm-up with soft landings'], 'Skipping the warm-up', 'move', 'Move with your cycle'),
  ],
  luteal: [
    P('mind', 'Mind', 'mind', 'Finish and tidy', 'Progesterone calms the brain and makes detail work easier. Late in this phase focus can dip.', ['Finish what is open', 'Make a list and clear your desk'], 'Starting five new things', 'brain', 'What your brain is doing'),
    P('heart', 'Heart', 'heart', 'Protect your calm', 'Progesterone soothes you, but you react more to stress. As it falls, PMS moods can show up.', ['10 minutes of slow breathing', 'Cacao, nuts and seeds for magnesium'], 'Late-night arguments', 'breathe', 'Breathe with me'),
    P('gut', 'Food', 'bowl', 'Steady blood sugar', 'You burn a little more now and cravings rise. Steady meals stop the dips.', ['Eat every 3 to 4 hours', 'Root veg, rice and a square of dark chocolate'], 'Long gaps without food', 'do/eat', 'What to eat today'),
    P('womb', 'Womb', 'drop', 'Warm and nourish', 'Progesterone keeps the lining ready. If no pregnancy starts, it falls and your period comes.', ['Warm, cooked meals in the last days', 'A warm foot bath before bed'], 'Cold and raw food in the last 3 days', 'relief', 'PMS relief'),
    P('legs', 'Move', 'leaf', 'Steady, not max', 'You run warmer and tire sooner in the heat. Steady strength and pilates feel best.', ['Moderate strength or pilates', 'Train in the cooler hours'], 'Chasing a best in the heat', 'move', 'Move with your cycle'),
  ],
};
// where each part sits on the 340 x 300 map: [label x, label y, side, body point x, body point y]
export const BODY_PIN = { mind: [0, 34, 'l', 168, 58], heart: [0, 118, 'l', 168, 118], gut: [0, 214, 'l', 160, 150], womb: [340, 118, 'r', 176, 166], legs: [340, 232, 'r', 222, 204] };
