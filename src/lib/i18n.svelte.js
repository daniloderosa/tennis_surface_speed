// Shared reactive language state (Svelte 5 runes)
const state = $state({ lang: "it" });

export function setLang(l) {
  state.lang = l;
  if (typeof document !== "undefined")
    document.documentElement.setAttribute("data-lang", l);
}

export function getLang() {
  return state.lang;
}

export function t(key) {
  return translations[state.lang]?.[key] ?? translations["it"]?.[key] ?? key;
}

// ── Translations ──────────────────────────────────────────────────────────────
const translations = {
  it: {
    // Hero
    hero_title: "Il tennis è diventato tutto uguale?",
    hero_subtitle:
      "Un'analisi grafica dell'omologazione delle superfici nel tennis.",
    hero_date: "Aprile 2026",
    hero_scroll: "Scorri",

    // Section labels
    section_speed: "La velocità dei tornei nel 2025",
    section_30years: "Trent'anni di velocità",
    section_rally: "Quanto durano gli scambi?",
    section_scatter: "Esplora i dati",

    // Bridge texts
    bridge1: `L'esistenza di superfici così diverse ha portato, nel corso dei decenni, allo sviluppo di giocatori specialisti su alcune superfici: c'era chi sapeva giocare bene "da fondo" e prediligeva la terra, e chi invece amava sfruttare la velocità dell'erba facendo serve&volley ad ogni punto.\n\nNegli ultimi 10-15 anni, però, nella comunità di appassionati si discute sempre più di una 'omologazione' delle superfici: i giocatori giocano tutti da fondo con molto topspin e il serve&volley è scomparso dal circuito (almeno fino a qualche anno fa), perché oggi le superfici sono tutte simili e quindi il modo di giocare può essere uno solo. È davvero così?\n\nJeff Sackmann, creatore del sito TennisAbstract, ha ideato un modo per misurare la velocità dei diversi tornei: il surface speed rating. Questo indice supera il problema che, se avessimo due giocatori molto forti al servizio, a prescindere dalla superficie ci ritroveremmo con un numero di ace o servizi vincenti molto più alto del normale.\n\nIl surface speed rating funziona così: per ogni partita, il modello stima quanti ace il servitore avrebbe fatto su una superficie teoricamente neutra - la media del tour in quell'anno - contro quel particolare avversario. Questo numero atteso tiene conto della qualità del servitore, della capacità di risposta del ricevitore, e di come entrambi si comportano storicamente. Poi confronta l'atteso con gli ace realmente prodotti. Se Wimbledon genera più ace del previsto, il suo rating sale sopra 1. Se il Roland Garros ne genera meno, il suo rating scende sotto 1. Il risultato è un numero indicizzato: 1 è la media del tour in quell'anno. Un rating di 1.25 significa che su quel campo vengono prodotti il 25% di ace in più del previsto; 0.75 significa il 25% in meno.`,

    bridge2: `Tranne per qualche eccezione (il torneo di Rio de Janeiro è sopra l'atteso, Indian Wells è un cemento molto lento (a causa dell'umidità), vediamo una situazione che potevamo immaginare: la terra è comunque piuttosto lenta, il cemento - nonostante molta differenza al suo interno - è la superficie 'media' e l'erba continua ad essere la più veloce.\n\nUn solo anno, però, ci aiuta poco a capire se effettivamente c'è un'omologazione delle tre superfici: per capire se la tesi regge, allarghiamo l'analisi agli ultimi trent'anni.`,

    bridge3: `Nel corso degli anni, le tre linee non convergono: l'erba e il cemento sono in modo costante più veloci della terra. L'ace rate, invece, mostra come si serve sempre meglio: se nei primi anni Novanta si faceva un ace circa ogni 15 punti, negli ultimi anni succede ogni 10 punti.\n\nMa la terra non si è velocizzata (continua a essere la solita superficie: un mix di mattoni e terracotta), sono cambiati i giocatori: più forti fisicamente, più bravi tecnicamente e, soprattutto, con delle racchette che permettono di tirare più forte (e quindi di fare più ace).\n\nChi sostiene la tesi dell'omologazione delle superfici porta come argomentazione la durata media degli scambi: per vedere se oggi si gioca in modo uguale si dovrebbe misurare quanto è lungo ogni scambio, invece di guardare semplicemente agli ace o a una misura derivata dagli ace.`,

    bridge4:
      "Il trend della durata degli scambi sembra effettivamente portare a una convergenza: sul cemento e sull'erba gli scambi sono più lunghi rispetto agli anni Novanta, avvicinandosi ai numeri della terra. A cosa è dovuto questo cambiamento?\n\n Secondo Sackmann (link), la risposta è semplice: le corde in poliestere. Il poliestere, introdotto nelle corde delle racchette negli anni Novanta, garantisce più topspin e potenza: i giocatori colpiscono la palla imprimendo molta rotazione, mantenendo però la sicurezza che la palla scenda prima della linea di fondo (il cosiddetto effetto Magnus). \n\nQuesto permette a chi colpisce di imprimere molta potenza mantenendo comunque un discreto controllo, con un risultato finale evidente a chi confronta il tennis di oggi con quello del passato: più scambi da fondo in cui la palla viene colpita 'violentemente' e scambi più lunghi. Unite questi ingredienti al miglioramento della preparazione atletica, tecnica e fisica degli atleti (visibile in tutti gli sport negli ultimi anni) e otterrete il tennis moderno.\n\n",

    // Dot plot step cards
    step_dot_0_text:
      "Ogni cerchio è un torneo. Più è alto il valore del rating, più ace sono stati registrati rispetto al previsto.",
    step_dot_0_subtext:
      "Passa il mouse o clicca su un cerchio per conoscere il suo rating.",
    step_dot_1_text:
      "In alcuni casi le tre superfici si sovrappongono: alcuni tornei su terra sono più veloci di tornei sul cemento (l'altitudine, per esempio, aumenta la velocità e favorisce gli ace), mentre l'erba è mediamente la più veloce.",

    // Animation step texts
    anim_clay1:
      "La terra rossa è la superficie più lenta del circuito: la terra rallenta molto la pallina, facendola alzare molto dopo il rimbalzo.",
    anim_hard1:
      "Il cemento ha un rimbalzo regolare e a media altezza, che permette ai giocatori di giocare una palla più piatta e con meno topspin.",
    anim_grass1:
      "Sull'erba la palla ha un rimbalzo basso e rapido, con la palla che schizza appena rimbalza, tenendo una traiettoria bassa.",

    anim_clay2:
      "Una palla che rimbalza alta e con tanta rotazione (topspin) porta i giocatori lontano dalla linea di fondo, allungando gli scambi.",
    anim_hard2:
      "È la superficie su cui si gioca di più, e quella più regolare: permette ai giocatori di stare vicini alla linea di fondo e di giocare una palla più piatta.",
    anim_grass2:
      "È la superficie su cui si gioca meno, e quella che alcuni giocatori saltano totalmente: non tutti sanno giocare su erba.",

    anim_cta: "↔ Trascina per confrontare le superfici",

    // Methodology
    metodo_title: "Metodologia",
    metodo_body:
      "Fonti: Tennis Abstract (link1) e il progetto Match Charting Project (link2) di Jeff Sackmann sono stati il cuore di questo articolo. Il progetto MCP è gestito da volontari che registrano per ciascuna partita i dati relativi a punti, servizi, scambi. Essendo un progetto volontario, non tutte le partite sono mappate e questo si potrebbe rispecchiare nella mancanza di alcuni dati (per esempio sull'erba negli anni Novanta).\n\nTesti: Danilo De Rosa\n\nCodice: Danilo De Rosa, con il supporto di Claude Code.\n\nSi ringrazia Salvatore Tramontano per l'aiuto e i consigli.",

    // Controls
    theme_light: "Chiaro",
    theme_dark: "Scuro",
    lang_it: "Italiano",
    lang_en: "English",

    // Chart labels
    axis_speed: "Surface Speed Rating",
    axis_rally: "Durata media degli scambi",
    axis_ace: "Ace Rate %",

    // Scatter multi-year
    scatter_year: "Anno",
    scatter_tournaments: "tornei",
    scatter_note:
      "Vengono esclusi i tornei con meno di 3 partite registrate. Per gli anni fino al 2010 il numero di tornei è ridotto perché il Match Charting Project aveva poche partite registrate per quel periodo.",

    // Surface labels
    label_clay: "Terra",
    label_hard: "Cemento",
    label_grass: "Erba",

    // Mode descriptions (SurfaceSpeedTrend)
    mode_speed_desc:
      "Ace rate aggiustato per la qualità dei giocatori, indicizzato alla media del tour (1 = media annuale). Misura la velocità fisica della superficie.",
    mode_ace_desc:
      "Percentuale di ace su tutti i punti giocati. Sale su tutte le superfici nel tempo: i giocatori servono meglio, non i campi cambiano.",

    // RallyTrend caption
    rally_caption:
      "La dimensione dei pallini è proporzionale al numero di partite registrate nel Match Charting Project per quell'anno e quella superficie.",
  },

  en: {
    // Hero
    hero_title: "Has tennis become all the same?",
    hero_subtitle:
      "A visual analysis of surface homogenisation in tennis.",
    hero_date: "April 2026",
    hero_scroll: "Scroll",

    // Section labels
    section_speed: "Tournament speed in 2025",
    section_30years: "Thirty years of speed",
    section_rally: "What really changes on court?",
    section_scatter: "Explore the data",

    // Bridge texts
    bridge1: `The existence of such different surfaces led, over the decades, to the rise of surface specialists: some players excelled from the baseline and preferred clay, while others loved exploiting the pace of grass with serve-and-volley at every point.\n\nOver the past 10–15 years, however, the fan community has increasingly debated a growing 'homogenisation' of surfaces: players all rally from the baseline with heavy topspin, and serve-and-volley has disappeared — because, if surfaces are all similar, there's only one way to play. Is that really the case?\n\nJeff Sackmann, creator of TennisAbstract, devised a way to measure the speed of different tournaments: the Surface Speed Rating. This index solves the problem that, if two heavy servers meet, the ace count would be inflated regardless of surface.\n\nThe surface speed rating works like this: for each match, the model estimates how many aces the server would have produced on a theoretically neutral surface — the tour average for that year — against that specific opponent. This expected figure accounts for server quality, returner ability, and both players' historical tendencies. It then compares expected to actual aces produced. If Wimbledon generates more aces than expected, its rating rises above 1. If Roland Garros generates fewer, its rating falls below 1. The result is an indexed number: 1 is the tour average for that year. A rating of 1.25 means 25% more aces than expected; 0.75 means 25% fewer.`,

    bridge2: `Let's zoom out: to understand whether surfaces have really converged over time, let's extend the analysis to the past thirty years.`,

    bridge3: `Over the years, the three lines do not converge: grass and hard courts are consistently faster than clay. Ace rate, meanwhile, shows how serving has improved: in the early 1990s a player hit an ace roughly every 20 points; in recent years it happens every 13.\n\nBut clay hasn't sped up (it remains the same surface: a mix of brick dust and terracotta) — the players have changed: physically stronger, technically sharper, and above all wielding rackets that let them hit harder (and therefore ace more).\n\nSo has nothing changed over the past few decades, and tennis remained the same? Obviously not — anyone who is a fan, or opens YouTube to watch a 1990s match, will notice how deeply the game has changed: more topspin, more baseline rallies, powerful shots and faster movement. A good summary of all this might be average rally length, which has grown steadily for all these reasons.`,

    bridge4: "hard, clay, grass — the labels remain.",

    // Dot plot step cards
    step_dot_0_text:
      "Each circle is a tournament. The further right, the more aces were recorded relative to expectations.",
    step_dot_0_subtext: "Hover or click a circle to see its rating.",
    step_dot_1_text:
      "In some cases the three surfaces overlap: some clay tournaments are faster than some hard-court events (the most common surface), while grass is on average the fastest.",

    // Animation step texts
    anim_clay1:
      "Clay is the slowest surface on the tour: it slows the ball significantly, sending it high after the bounce.",
    anim_hard1:
      "Hard courts produce a consistent, medium-height bounce that lets players hit a flatter ball with less topspin.",
    anim_grass1:
      "On grass the ball bounces low and fast, skidding through and staying low after the bounce.",

    anim_clay2:
      "A ball that bounces high with heavy spin (topspin) pushes players far behind the baseline, lengthening rallies.",
    anim_hard2: "[Hard court second box — placeholder text.]",
    anim_grass2: "[Grass second box — placeholder text.]",

    anim_cta: "↔ Drag to compare surfaces",

    // Outro
    outro_title: "The surface exists. Simplicity doesn't.",
    outro_p1:
      "Hard, clay, grass — the labels remain. But behind every tournament lies a cocktail of altitude, temperature, balls and court surface that defies easy categories. Gstaad is clay, but plays like hard. Indian Wells 2025 is hard, but rallies like Roland Garros.",
    outro_p2:
      "Meanwhile, the game changes: rallies lengthen on every surface. Not because surfaces are converging, but because players — stronger, fitter, more tactical — adapt to any pace.",
    outro_data: "Data",

    // Methodology
    metodo_title: "Methodology",
    metodo_body: "[Methodology text — to be added]",

    // Controls
    theme_light: "Light",
    theme_dark: "Dark",
    lang_it: "Italian",
    lang_en: "English",

    // Chart labels
    axis_speed: "Surface Speed Rating",
    axis_rally: "Average rally duration",
    axis_ace: "Ace Rate %",

    // Scatter multi-year
    scatter_year: "Year",
    scatter_tournaments: "tournaments",
    scatter_note:
      "Tournaments with fewer than 3 recorded matches are excluded. For years up to 2010, fewer tournaments are available because the Match Charting Project had limited coverage for that period.",

    // Surface labels
    label_clay: "Clay",
    label_hard: "Hard",
    label_grass: "Grass",

    // Mode descriptions (SurfaceSpeedTrend)
    mode_speed_desc:
      "Ace rate adjusted for player quality, indexed to the tour average (1 = annual average). Measures the physical speed of the surface.",
    mode_ace_desc:
      "Percentage of aces on all points played. Rising across all surfaces over time: players are serving better, not courts changing.",

    // RallyTrend caption
    rally_caption:
      "Dot size is proportional to the number of matches recorded in the Match Charting Project for that year and surface.",
  },
};
