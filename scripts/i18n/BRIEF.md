# Translation brief: Underskin (Spanish + Korean)

Underskin is a calm, premium cycle and hormone app for ambitious women. It helps her know when to push and when to slow down:
her cycle, hormones day by day, food for each phase (raw-first, whole food, Traditional Chinese Medicine), breathing,
rituals, a partner view, and "Letters From Your Body" (short, loving letters her body writes to her each morning).
The voice is a wise, warm friend: short sentences, plain words, never clinical, never preachy, never salesy.

## The one rule that matters most
It must read as if it were **written** in Spanish / Korean by a native writer with taste, not translated.
The owner's words: "very natural, touching words should not sound like AI or cringe."
If a literal translation sounds stiff, rewrite the sentence so it lands the same way for a native reader.
Shorter is better than longer. UI labels must stay short (buttons, tabs, pills are small).

## Korean (ko)
- Warm, everyday polite style: 해요체 (…해요, …예요, …세요). Never 합니다체 except fixed legal text. Never 반말.
- **Never use 당신.** Address her implicitly (Korean drops the subject) or with the name placeholder.
- Sound like a modern Korean wellness / beauty brand (soft, clean, a little poetic where the English is poetic). No translationese
  (avoid 것이다/~에 대한/~를 통해 chains, avoid overusing 당신의/여러분/우리의), no over-the-top 💕 sweetness beyond the English.
- Common health terms the way Korean women say them: 생리 (period), 생리 주기, 배란, 황체기, 난포기, 에스트로겐, 프로게스테론, PMS(생리 전 증후군),
  한의학 for Traditional Chinese Medicine. Food names as Koreans know them (케피어, 생우유 for raw milk).
- Buttons: short nouns or 해요체 verbs (저장, 시작하기, 더 보기). Section titles: short noun phrases.

## Spanish (es)
- Natural, friendly **tú**. Neutral international Spanish that reads well in Spain and Latin America (avoid vosotros and strongly
  regional slang; "celular/móvil" → prefer "teléfono").
- Warm but not saccharine; no "¡querida!" unless the English is that affectionate. Keep English brevity; avoid long noun chains.
- Health terms: regla/período (use "regla" in warm, everyday lines and "período" in neutral/info lines), ciclo, ovulación,
  fase folicular/lútea, estrógeno, progesterona, SPM, Medicina Tradicional China.
- Use correct ¿? ¡! and typographic quotes “ ” only if the English has quotes.

## Placeholders (must be kept exactly)
- `{0}`, `{1}` … are numbers, dates, month/weekday names or her name. Keep every one, move them where the grammar needs.
  A `{n}` next to "day", "min", "g", "mg" is a number. A `{n}` at the start of a greeting or after a comma is usually her name.
- `<t0>…</t0>` wraps a styled piece (bold, a coloured word, a link). Keep each tag pair, put the matching words inside, you may
  move it. Empty pairs like `<t0></t0>` are decorative dots: keep them where they are.
- `<x0/>` is an icon, picture or line break. Keep each one, normally in the same position (icons at the start stay at the start).
- Do not add or drop placeholders, do not translate inside the tag names.

## Keep as is
- Brand: Underskin, underskin™, Under the Skin. Units, doses and numbers exactly as given (never change a dose).
- Recipe and dish names: translate naturally (they are names of dishes, keep them appetizing, not literal).
- Country names, month names: translate normally.
- Emojis stay.

## Content rules (also in translation)
- No long dashes (— or –) anywhere. Use a comma, a colon or a new sentence.
- Never tell her to cut tea or coffee. Never add claims, warnings or advice that are not in the English.
- Supplement, herb and tea doses and cautions must stay exactly as safe as the English.

## Output
A JSON object: each English string exactly as given (the key) → its translation. Valid JSON, UTF-8, nothing else in the file.
