// The body map around the floating figure: five parts of her body, what to do for each today, and what is going on there.
// [part, label, icon, short do, what is happening, [step 1, step 2], avoid, route, link label]
const P = (k, label, ic, d, what, steps, avoid, to, link) => ({ k, label, ic, d, what, steps, avoid, to, link });
export const BODY_MAP = {
  menstrual: [
    P('mind', 'Mind', 'mind', 'Journal 10 minutes', 'Estrogen and progesterone are at their lowest. Many women see clearly now what is and is not working in their life.', ['Write one page: what to keep, what to drop', 'Say no to one extra task today'], 'Big decisions under pressure', 'brain', 'What your brain is doing'),
    P('heart', 'Heart', 'heart', '5 min slow breathing', 'Feelings sit closer to the surface and you tire faster. That is your body asking for quiet, not a weakness.', ['Breathe in for 4, out for 6, for 5 minutes', 'Ask someone for a hug or a warm call'], 'Crowded, loud plans', 'breathe', 'Breathe with me'),
    P('gut', 'Food', 'bowl', 'Bone broth or beef stew', 'You lose iron with the blood, and digestion is more sensitive while you bleed. Warm, soft, cooked food is easiest.', ['Lunch: bone broth, beef stew or lentil soup', 'Sweet: stewed apple with cinnamon'], 'Salad, cold food and iced drinks', 'do/eat', 'What to eat today'),
    P('womb', 'Womb', 'drop', 'Heat pad, 20 min', 'The lining is shedding. Prostaglandins make the womb squeeze, which is what you feel as cramps. Heat relaxes it.', ['Hot water bottle on your belly, 20 minutes', 'Ginger tea and warm socks'], 'Cold feet and cold drinks', 'relief', 'Cramp relief'),
    P('legs', 'Move', 'leaf', 'Walk 20 min, stretch', 'Energy is lowest on the first days. Your strength has not changed, effort just feels harder.', ['A slow 20 minute walk outside', 'Child’s pose and hip circles, 5 minutes'], 'Gym intervals on heavy days', 'move', 'Move with your cycle'),
  ],
  follicular: [
    P('mind', 'Mind', 'mind', 'Start one new project', 'Rising estrogen lifts dopamine and serotonin. Curiosity, focus and memory get sharper.', ['Block 1 hour today for the project you put off', 'Learn something hard: a course, a book, a skill'], 'Only routine all week', 'brain', 'What your brain is doing'),
    P('heart', 'Heart', 'heart', 'Meet someone new', 'Your mood lifts with estrogen. New people and places feel exciting instead of tiring.', ['Say yes to one invitation this week', 'Plan a trip or a day out'], 'Cancelling out of habit', 'do/friends', 'Friends this phase'),
    P('gut', 'Food', 'bowl', 'Big salad with eggs', 'Insulin works well now, and estrogen likes fibre and fermented food to help it clear. Fresh and raw is welcome.', ['Lunch: big salad with eggs, avocado and olive oil', 'Sauerkraut or kefir with one meal'], 'Skipping protein', 'do/eat', 'What to eat today'),
    P('womb', 'Womb', 'drop', 'Eggs and red meat', 'Estrogen is building a new womb lining and ripening an egg. Protein, iron and zinc are what it builds with.', ['Breakfast: 2 eggs', 'Dinner: red meat or salmon, pumpkin seeds as a snack'], 'Skipping meals', 'hormones', 'Your hormones'),
    P('legs', 'Move', 'leaf', 'Gym: lift heavy', 'You recover fast and handle hard sessions well in this phase. Best time to build strength.', ['Gym: squats and deadlifts, 3 sets of 6 to 8', 'Or calisthenics: push-ups, pull-ups, pistol squats'], 'Only easy sessions', 'move', 'Move with your cycle'),
  ],
  ovulatory: [
    P('mind', 'Mind', 'mind', 'Have the big talk', 'Estrogen peaks. Words come easily and you read faces and moods well.', ['Ask for the raise, pitch the idea, have the talk', 'Record a video or present'], 'Hiding your idea', 'brain', 'What your brain is doing'),
    P('heart', 'Heart', 'heart', 'Plan a date or dinner', 'Estrogen and testosterone peak together. You feel social, warm and confident.', ['Book dinner with friends or a date', 'Dance or sing out loud'], 'Staying home out of guilt', 'do/friends', 'Friends this phase'),
    P('gut', 'Food', 'bowl', 'Salad, berries, flax', 'Your liver is busy clearing the estrogen peak. Fibre and bitter greens help it along.', ['Lunch: rocket salad with fish or chicken', 'Berries with 1 spoon of ground flax'], 'Lots of alcohol', 'do/eat', 'What to eat today'),
    P('womb', 'Womb', 'drop', 'Check your fluid', 'LH surges and one egg is released. The fertile window is open. A twinge on one side is common.', ['Clear and stretchy like raw egg white means fertile', 'Twinge on one side? A warm hand on it'], 'Guessing about contraception', 'hormones', 'Your hormones'),
    P('legs', 'Move', 'leaf', 'Sprints or a PB', 'This is your peak power. Ligaments may be a little looser, so warm up well.', ['Sprints: 8 × 20 seconds hard, 1 minute easy', 'Or try a personal best at the gym after a 10 min warm-up'], 'Skipping the warm-up', 'move', 'Move with your cycle'),
  ],
  luteal: [
    P('mind', 'Mind', 'mind', 'Finish one open task', 'Progesterone calms the brain and makes detail work easier. Late in this phase focus can dip.', ['Pick the task that has waited longest and finish it', 'Clear your desk and write tomorrow’s list'], 'Starting five new things', 'brain', 'What your brain is doing'),
    P('heart', 'Heart', 'heart', 'Breathe 10 min tonight', 'Progesterone soothes you, but you react more to stress. As it falls, PMS moods can show up.', ['10 minutes of slow breathing before bed', 'A handful of nuts or cacao for magnesium'], 'Late-night arguments', 'breathe', 'Breathe with me'),
    P('gut', 'Food', 'bowl', 'Sweet potato and chicken', 'You burn a little more now and cravings rise. Steady meals stop the dips.', ['Dinner: roast chicken with sweet potato or rice', 'Eat every 3 to 4 hours, dark chocolate is fine'], 'Long gaps without food', 'do/eat', 'What to eat today'),
    P('womb', 'Womb', 'drop', 'Warm soup, warm feet', 'Progesterone keeps the lining ready. If no pregnancy starts, it falls and your period comes. Warmth eases the way in.', ['Soup or stew instead of salad in the last days', 'A warm foot bath before bed'], 'Cold and raw food in the last 3 days', 'relief', 'PMS relief'),
    P('legs', 'Move', 'leaf', 'Pilates or 3 × 10 weights', 'You run warmer and tire sooner in the heat. Steady strength and pilates feel best.', ['Gym: 3 sets of 10, stop 2 reps before failure', 'Or 30 minutes of pilates in the cooler hours'], 'Chasing a best in the heat', 'move', 'Move with your cycle'),
  ],
};
// where each part sits on the 340 x 300 map: [label x, label y, side, body point x, body point y]
export const BODY_PIN = { mind: [0, 36, 'l', 168, 58], heart: [0, 128, 'l', 168, 118], gut: [0, 220, 'l', 160, 150], womb: [340, 82, 'r', 176, 166], legs: [340, 174, 'r', 222, 204] };
