// Moon page content: heart, mind and spirit for each moon phase and each inner season, the Moon's sign
// as emotional weather, affirmations, and stylised star shapes. Spiritual tradition for reflection.

// The 8 phases in order from new. [from, to] is the elongation (Moon's angle from the Sun) in degrees.
export const PHASE_GUIDE = [
  { k: 'new', name: 'New moon', at: [0, 22.5], theme: 'Begin', heart: 'Feelings sit low and quiet. It is fine to want space and fewer people.', mind: 'Your thoughts are seeds, not plans yet. Notice what keeps coming back.', spirit: 'Sit in the dark for a minute and ask what you truly want to grow.', ask: 'If nothing could go wrong this month, what would I start?', practice: 'Light a candle, breathe slowly five times, then write one wish in the present tense.' },
  { k: 'wax1', name: 'Waxing crescent', at: [22.5, 67.5], theme: 'Hope', heart: 'Hope comes back in small waves. Let yourself be a little excited.', mind: 'Good time to learn and gather. One small step beats a perfect plan.', spirit: 'Trust that tiny beginnings count. Water what you planted.', ask: 'What is one small step I can take today?', practice: 'Say your intention out loud once, then do the smallest version of it.' },
  { k: 'q1', name: 'First quarter', at: [67.5, 112.5], theme: 'Choose', heart: 'Doubt may show up. It is a sign you care, not a sign to stop.', mind: 'Decide. Pick the next step and let go of the options you do not need.', spirit: 'Courage is a feeling you grow by acting, not by waiting for it.', ask: 'Where am I holding back, and what am I afraid of?', practice: 'Stand tall, hand on your chest, and name one thing you choose today.' },
  { k: 'wax2', name: 'Waxing gibbous', at: [112.5, 157.5], theme: 'Refine', heart: 'Feelings grow stronger. Be gentle with yourself if you feel restless.', mind: 'Polish, adjust and edit. Details are where things come together.', spirit: 'Patience. What you are building is nearly ready to be seen.', ask: 'What needs a little more care before it is ready?', practice: 'Tidy one corner of your space while you think about your intention.' },
  { k: 'full', name: 'Full moon', at: [157.5, 202.5], theme: 'Feel', heart: 'Everything is louder: love, tears, joy. Let feelings move through you.', mind: 'Clarity arrives. You may suddenly see what is working and what is not.', spirit: 'Gratitude and release. Celebrate how far you came, then let go of what is heavy.', ask: 'What am I ready to let go of?', practice: 'Write what you release on paper, read it once, then tear it up or let the rain take it.' },
  { k: 'wan1', name: 'Waning gibbous', at: [202.5, 247.5], theme: 'Share', heart: 'A softer, warmer mood. Good for honest talks and saying thank you.', mind: 'Reflect on what you learned and pass it on. Teach, write, tell a friend.', spirit: 'Generosity fills you back up. Give without keeping score.', ask: 'What did this month teach me?', practice: 'Send one message of thanks to someone who helped you.' },
  { k: 'q3', name: 'Last quarter', at: [247.5, 292.5], theme: 'Release', heart: 'Old feelings can come up to be finished. Forgive, including yourself.', mind: 'Clear out. Cancel what drains you and close open loops.', spirit: 'Making space is sacred work. Less clutter, more room for you.', ask: 'What can I forgive or finish this week?', practice: 'Breathe in for 4, out for 8, and on each out-breath say "I let this go."' },
  { k: 'wan2', name: 'Waning crescent', at: [292.5, 337.5], theme: 'Rest', heart: 'Tender and tired is normal now. You do not have to explain needing rest.', mind: 'Dreamy and slow. Let your mind wander instead of pushing for answers.', spirit: 'Surrender. The quiet before the new moon is where new ideas are born.', ask: 'What do my body and heart need to rest well?', practice: 'Lie down, palms up, and let your breath slow for three minutes.' },
];
export const phaseGuideAt = e => PHASE_GUIDE.find(p => e >= p.at[0] && e < p.at[1]) || PHASE_GUIDE[0];

// Her cycle as an inner season: emotions, mind and spirit (abilities stay the same; energy and mood move).
export const INNER_SEASON = {
  menstrual: { name: 'Inner winter', heart: 'Feelings run close to the surface. Tears and wanting to be alone are both welcome.', mind: 'Your inner critic is quieter now, and intuition gets louder. Listen to what you already know.', spirit: 'A time to turn inward, rest and dream. Say no without guilt.' },
  follicular: { name: 'Inner spring', heart: 'Lighter and more curious. A good time to feel playful again.', mind: 'Fresh ideas come easily. Brainstorm, start, try something new.', spirit: 'Say yes to what makes you feel alive. Let yourself begin again.' },
  ovulatory: { name: 'Inner summer', heart: 'Open, warm and connected. Feelings like to be shared.', mind: 'You find words easily. Speak up, ask, and have the conversation.', spirit: 'Shine and be seen. Your presence is a gift to the people around you.' },
  luteal: { name: 'Inner autumn', heart: 'Feelings get sharper. What annoys you is often pointing to a real need.', mind: 'Great for finishing, sorting and seeing what is not working.', spirit: 'Harvest and honesty. Notice what to keep and what to let fall away.' },
};
// moon phase and inner season moving the same way, or not
export function innerBlend(moonWaxing, phase) {
  const out = phase === 'follicular' || phase === 'ovulatory';
  if (moonWaxing && out) return 'Your cycle and the moon are both rising. Ride the energy and give yourself something to look forward to.';
  if (!moonWaxing && !out) return 'Your cycle and the moon are both turning inward. A double rest day for the heart: go slow and stay close to what feels safe.';
  if (out) return 'You feel bright while the moon wanes. Use your energy to finish and clear, not to start ten new things.';
  return 'The moon is growing while you turn inward. Plant quiet intentions now and act on them when your energy returns.';
}

// The sign the Moon is in today, as emotional weather.
export const MOON_SIGN_FEEL = {
  aries: ['Quick feelings, quick to pass', 'Move your body before you talk about something hard.'],
  taurus: ['Calm, cosy and steady', 'Comfort helps today: a warm meal, soft clothes, slow time.'],
  gemini: ['Curious and a little scattered', 'Write your thoughts down so they stop spinning.'],
  cancer: ['Tender and caring', 'Call someone who feels like home, or make your space feel safe.'],
  leo: ['Warm and wanting to be seen', 'Wear something that makes you feel lovely and let yourself be noticed.'],
  virgo: ['Thoughtful and a bit critical', 'Tidy one small thing, then let the rest be good enough.'],
  libra: ['Social and harmony-seeking', 'Notice when you say yes only to keep the peace.'],
  scorpio: ['Deep, intense and honest', 'Let a big feeling be big without acting on it right away.'],
  sagittarius: ['Restless and hopeful', 'Get outside or plan something that gives you a sense of freedom.'],
  capricorn: ['Serious and focused', 'Get one thing done, then rest. You do not have to earn rest.'],
  aquarius: ['Detached and thinking', 'Step back to see the bigger picture, then reconnect with one person.'],
  pisces: ['Dreamy, open and sensitive', 'Protect your energy: less noise, more water, music and sleep.'],
};

// Affirmation from the Moon's sign: [for inward days (period, luteal), for outward days (follicular, ovulation)]
export const MOON_AFFIRM = {
  aries: ['I can rest and still be brave.', 'I start before I feel ready.'],
  taurus: ['I am allowed to slow down and enjoy.', 'I build my life one steady step at a time.'],
  gemini: ['My mind can be quiet. I do not need every answer today.', 'My words open doors.'],
  cancer: ['I care for myself the way I care for others.', 'My softness is my strength.'],
  leo: ['I shine even when I am resting.', 'I am allowed to take up space.'],
  virgo: ['I am already enough, unfinished and all.', 'Small steady care creates big change.'],
  libra: ['My needs matter as much as anyone else’s.', 'I attract what feels balanced and kind.'],
  scorpio: ['I let go of what I have outgrown.', 'I trust my depth and my desire.'],
  sagittarius: ['Stillness is part of my journey.', 'I say yes to what makes me feel free.'],
  capricorn: ['Rest is part of how I reach my goals.', 'I climb at my own pace and I arrive.'],
  aquarius: ['I belong exactly as I am.', 'My ideas are needed in the world.'],
  pisces: ['I listen to my intuition and let it guide me.', 'My dreams are allowed to become real.'],
};

// Stylised star shapes (0–100 box): stars [x, y, size] and lines between them.
export const STARS = {
  aries: { s: [[14, 62, 2], [46, 42, 3], [68, 36, 3.4], [84, 46, 2]], l: [[0, 1], [1, 2], [2, 3]] },
  taurus: { s: [[16, 22, 2.4], [40, 46, 2], [50, 54, 3.6], [58, 46, 2], [86, 18, 2.6], [56, 64, 1.8], [30, 72, 2]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6]] },
  gemini: { s: [[24, 16, 3.4], [30, 40, 2], [28, 66, 2.2], [20, 86, 2], [56, 18, 3], [62, 42, 2], [66, 66, 2.4], [74, 86, 2]], l: [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7], [1, 5]] },
  cancer: { s: [[50, 18, 2], [48, 46, 2.6], [22, 74, 2.2], [76, 80, 2.8], [52, 56, 1.6]], l: [[0, 1], [1, 4], [4, 2], [4, 3]] },
  leo: { s: [[24, 30, 2], [32, 20, 2.2], [44, 22, 2], [44, 40, 2.4], [36, 56, 3.6], [66, 50, 2.2], [86, 62, 2.8], [62, 70, 2]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 7], [7, 6], [6, 5], [5, 3]] },
  virgo: { s: [[14, 26, 2], [32, 34, 2.2], [48, 40, 2.4], [56, 58, 3.6], [74, 42, 2], [86, 30, 2], [40, 74, 2], [70, 76, 2]], l: [[0, 1], [1, 2], [2, 3], [2, 4], [4, 5], [3, 6], [3, 7]] },
  libra: { s: [[50, 18, 2.6], [24, 44, 3], [76, 40, 3], [30, 76, 2], [70, 72, 2]], l: [[0, 1], [0, 2], [1, 2], [1, 3], [2, 4]] },
  scorpio: { s: [[16, 24, 2], [22, 36, 2.4], [34, 44, 3.6], [44, 54, 2], [50, 68, 2], [60, 80, 2], [76, 82, 2], [86, 70, 2.6], [80, 60, 2]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8]] },
  sagittarius: { s: [[30, 30, 2.2], [44, 38, 2.6], [58, 30, 2.4], [62, 50, 2.8], [44, 58, 2.2], [30, 54, 2], [76, 42, 2], [72, 70, 2]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [3, 6], [3, 7]] },
  capricorn: { s: [[18, 26, 2.6], [24, 40, 2], [36, 70, 2.2], [56, 72, 2], [78, 56, 2.6], [86, 34, 2.4], [56, 44, 1.8]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 1]] },
  aquarius: { s: [[18, 34, 2], [34, 30, 2.6], [48, 40, 2.2], [60, 30, 2.4], [72, 44, 2], [44, 62, 2], [60, 74, 2], [80, 70, 2]], l: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6], [6, 7]] },
  pisces: { s: [[14, 26, 2], [24, 18, 2.2], [30, 30, 2], [32, 50, 2], [40, 70, 2.4], [56, 80, 3], [70, 70, 2], [84, 62, 2], [90, 72, 2]], l: [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 6]] },
};

// Manifestation, after Neville Goddard's teaching in "Feeling is the Secret" (1944), retold in our own words:
// the wish is lived first as a feeling, as if it were already true. A spiritual practice for reflection.
export const MANIFEST = {
  scene: { name: 'One small scene', why: 'New beginnings start with a clear picture.',
    short: ['Pick a moment', 'Step inside', 'Add a sense', 'Loop, let go'], steps: ['Pick one tiny moment that could only happen once your wish is real, like a friend hugging you and saying "I am so happy for you".', 'Close your eyes and step inside it. See it from your own eyes, not from outside.', 'Add one sense: a voice, a touch, the light in the room.', 'Loop the moment until it feels natural, then let it go.'] },
  end: { name: 'Live in the end', why: 'Growing energy loves a clear direction.',
    short: ['Ask how it feels', 'Find it in your body', 'Act as her', 'Return to the feeling'], steps: ['Ask yourself: if this were already true, how would I feel right now?', 'Find that feeling in your body: relief, quiet pride, ease.', 'Take one small action today the way that version of you would.', 'Whenever doubt comes, return to the feeling, not to the how.'] },
  talk: { name: 'Change your inner talk', why: 'A day for choosing, so choose your words.',
    short: ['Listen inside', 'Catch one', 'Rewrite it', 'Keep it going'], steps: ['Notice the silent conversations you have in your head today.', 'Catch one that pulls you away from your wish.', 'Replay it as if the wish were done: what would you and the other person say now?', 'Keep the new conversation going in your mind for a minute.'] },
  feeling: { name: 'Feel it as done', why: 'The Moon is full of light. Let the feeling be full too.',
    short: ['Breathe', 'Say thank you', 'Feel it done', 'Let it go'], steps: ['Sit or lie down and breathe slowly for a minute.', 'Say "thank you" for your wish as if it already happened.', 'Stay with the warm, settled feeling of having it, not the wanting.', 'End by smiling and letting it go, the way you post a letter.'] },
  revision: { name: 'Revision', why: 'A waning Moon is for clearing what is old.',
    short: ['Pick a moment', 'Replay it better', 'Feel the new one', 'Sleep on it'], steps: ['Tonight, think of one moment from today that did not go the way you wanted.', 'Replay it from the start, but this time it goes the way you wish it had.', 'Feel the new version as real until the old one loses its sting.', 'Go to sleep with the new version in mind.'] },
  sats: { name: 'The drowsy moment', why: 'Rest makes the mind soft and open.',
    short: ['Get drowsy', 'Play your scene', 'Feel, don’t force', 'Drift off'], steps: ['In bed, let your body get heavy, as if you are about to fall asleep.', 'In that drowsy state, play your short scene of the wish come true.', 'Do not force it. Just feel it as real and natural.', 'Fall asleep inside the feeling.'] },
};
// moon phase → main practice; her cycle phase → the practice that suits her body now
export const MANIFEST_MOON = { new: 'scene', wax1: 'end', q1: 'talk', wax2: 'end', full: 'feeling', wan1: 'feeling', q3: 'revision', wan2: 'sats' };
export const MANIFEST_CYCLE = {
  menstrual: ['sats', 'During your period you sink into rest easily, so the drowsy moment before sleep comes almost by itself.'],
  follicular: ['scene', 'Fresh energy and new ideas: a good time to draw a clear new picture.'],
  ovulatory: ['end', 'You speak and act with ease now, so living as if it is done feels natural.'],
  luteal: ['revision', 'You notice what is not working now. Revision turns that clarity into something kind.'],
};

// One-word forecasts for the inner-weather tiles: heart, mind, spirit.
export const WX_MOON = {
  new: ['Quiet', 'Seeding', 'Stillness'], wax1: ['Hopeful', 'Gathering', 'Trust'], q1: ['Brave', 'Deciding', 'Courage'], wax2: ['Restless', 'Polishing', 'Patience'],
  full: ['Loud', 'Clear', 'Gratitude'], wan1: ['Warm', 'Reflective', 'Generous'], q3: ['Forgiving', 'Clearing', 'Space'], wan2: ['Tender', 'Dreamy', 'Surrender'],
};
export const WX_BODY = {
  menstrual: ['Raw', 'Intuitive', 'Inward', .25, 'Low'], follicular: ['Playful', 'Fresh', 'Alive', .7, 'Rising'],
  ovulatory: ['Open', 'Fluent', 'Radiant', .95, 'High'], luteal: ['Sharp', 'Sorting', 'Honest', .45, 'Easing'],
};
