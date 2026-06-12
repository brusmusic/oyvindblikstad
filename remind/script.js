const books = [
  {
    id: "children-01",
    level: "children",
    series: "Series 01",
    title: "Why Can't Everyone Just Be Friends?",
    subtitle: "The Line That Moved",
    path: "books/children/01_why_cant_everyone_just_be_friends.md",
    teaser: "A crack in the schoolyard becomes an invisible border. Some children get to play. Others wait to be invited.",
  },
  {
    id: "children-02",
    level: "children",
    series: "Series 02",
    title: "Why Can't We Build It Together?",
    subtitle: "The Open Hut",
    path: "books/children/02_why_cant_we_build_it_together.md",
    teaser: "A class is given a pile of wood and asked to build something together. The loudest voices shape the first plan.",
  },
  {
    id: "children-03",
    level: "children",
    series: "Series 03",
    title: "Why Do We Need Each Other?",
    subtitle: "The Air in the Room",
    path: "books/children/03_why_do_we_need_each_other.md",
    teaser: "A glass of water spills when the lights go out. The first question is not who did it, but what is needed now.",
  },
  {
    id: "youth-01",
    level: "youth",
    series: "Series 01",
    title: "Why Can't Everyone Just Be Friends?",
    subtitle: "Shadows in the Feed",
    path: "books/youth/01_why_cant_everyone_just_be_friends.md",
    teaser: "A seven-second clip turns Samir into a villain before anyone asks what happened before the camera started.",
  },
  {
    id: "youth-02",
    level: "youth",
    series: "Series 02",
    title: "Why Can't We Build It Together?",
    subtitle: "The City in the Server Room",
    path: "books/youth/02_why_cant_we_build_it_together.md",
    teaser: "A youth group designs a digital city for everyone, until the first testers reveal who was never imagined.",
  },
  {
    id: "youth-03",
    level: "youth",
    series: "Series 03",
    title: "Why Do We Need Each Other?",
    subtitle: "Shared Air",
    path: "books/youth/03_why_do_we_need_each_other.md",
    teaser: "An air-quality warning turns breathing into a shared lesson about risk, dependence, and invisible vulnerability.",
  },
  {
    id: "adult-01",
    level: "adult",
    series: "Series 01",
    title: "Why Can't Everyone Just Be Friends?",
    subtitle: "The Room That Paid for Silence",
    path: "books/adult/01_why_cant_everyone_just_be_friends.md",
    teaser: "A child's question enters an adult room full of borders, institutions, humiliation, profit, and fear.",
  },
  {
    id: "adult-02",
    level: "adult",
    series: "Series 02",
    title: "Why Can't We Build It Together?",
    subtitle: "The Foundation Room",
    path: "books/adult/02_why_cant_we_build_it_together.md",
    teaser: "A city plans a public house for everyone, but the process reveals who was invited after the foundations were drawn.",
  },
  {
    id: "adult-03",
    level: "adult",
    series: "Series 03",
    title: "Why Do We Need Each Other?",
    subtitle: "The Shared Body",
    path: "books/adult/03_why_do_we_need_each_other.md",
    teaser: "A city crisis exposes the systems people mistake for normal life: water, heat, care, transport, air, and trust.",
  },
  {
    id: "parenting-intro",
    level: "intro",
    series: "Series 04",
    title: "Hva er god barneoppdragelse?",
    subtitle: "Introduksjon",
    path: "books/parenting/00_intro.md",
    audio: "audio/parenting/00_intro.mp3",
    art: {
      src: "images/parenting/00_intro.jpg",
      alt: "A quiet symbolic image for the question of good parenting.",
    },
    teaser: "Et spørsmål om barn, grenser, frihet og voksne som må tåle å undersøke seg selv.",
  },
  {
    id: "parenting-children",
    level: "children",
    series: "Series 04",
    title: "Hva er god barneoppdragelse?",
    subtitle: "Tre gode historier for barn",
    path: "books/parenting/01_children.md",
    audio: "audio/parenting/01_children.mp3",
    art: {
      src: "images/parenting/01_children.jpg",
      alt: "A symbolic image for a children's book about care and boundaries.",
    },
    teaser: "Tre enkle historier om varme, grenser, reparasjon og hva voksne gjør når barn trenger hjelp.",
  },
  {
    id: "parenting-youth",
    level: "youth",
    series: "Series 04",
    title: "Hva er god barneoppdragelse?",
    subtitle: "Grenser som holder",
    path: "books/parenting/02_youth.md",
    audio: "audio/parenting/02_youth.mp3",
    art: {
      src: "images/parenting/02_youth.jpg",
      alt: "A symbolic image for a youth book about freedom and responsibility.",
    },
    teaser: "En ungdomsbok om tillit, motstand, skjermliv, ansvar og voksne som må være tydelige uten å eie barnet.",
  },
  {
    id: "parenting-adult",
    level: "adult",
    series: "Series 04",
    title: "Hva er god barneoppdragelse?",
    subtitle: "Kontakt, grense, reparasjon",
    path: "books/parenting/03_adult.md",
    audio: "audio/parenting/03_adult.mp3",
    art: {
      src: "images/parenting/03_adult.jpg",
      alt: "A symbolic image for an adult book about parenting and repair.",
    },
    teaser: "En voksen tekst om trygghet, makt, skam, reparasjon og hva barn trenger fra voksne som ikke alltid får det til.",
  },
  {
    id: "no-blank-question",
    level: "session",
    series: "Åpningsbok",
    title: "Det blanke spørsmålet",
    subtitle: "En åpen ReMind Council-sesjon",
    path: "books/no/det_blank_sporsmalet/det_blank_sporsmalet.md",
    audio: "audio/no/det_blank_sporsmalet/det_blanke_sporsmalet.mp3",
    art: {
      src: "images/no/det_blank_sporsmalet/cover.jpg",
      alt: "Forsidebilde for Det blanke spørsmålet.",
    },
    teaser: "Et blankt spørsmål legges på bordet, og rådet undersøker hva som kan åpne menneskers innsikt før ordene blir for raske.",
  },
  {
    id: "no-love-children",
    level: "children",
    series: "Serie 02",
    title: "Hva er kjærlighet egentlig?",
    subtitle: "Hjertet som ikke var en emoji",
    path: "books/no/hva_er_kjaerlighet_egentlig/bok_1_hjertet_som_ikke_var_en_emoji_barn.md",
    art: {
      src: "images/no/hva_er_kjaerlighet_egentlig/bok_1_hjertet_som_ikke_var_en_emoji_forside.jpg",
      alt: "Forsidebilde for barneboken om kjærlighet.",
    },
    teaser: "En barnebok om hva kjærlighet er når den ikke bare er et tegn, et ord eller noe man får.",
  },
  {
    id: "no-love-youth",
    level: "youth",
    series: "Serie 02",
    title: "Hva er kjærlighet egentlig?",
    subtitle: "Ikke eie meg",
    path: "books/no/hva_er_kjaerlighet_egentlig/bok_2_ikke_eie_meg_ungdom.md",
    art: {
      src: "images/no/hva_er_kjaerlighet_egentlig/bok_2_ikke_eie_meg_forside.jpg",
      alt: "Forsidebilde for ungdomsboken om kjærlighet.",
    },
    teaser: "En ungdomsbok om kjærlighet, frihet, grenser og forskjellen på nærhet og eierskap.",
  },
  {
    id: "no-love-adult",
    level: "adult",
    series: "Serie 02",
    title: "Hva er kjærlighet egentlig?",
    subtitle: "Kjærlighet som ansvar",
    path: "books/no/hva_er_kjaerlighet_egentlig/bok_3_kjaerlighet_som_ansvar_voksne.md",
    art: {
      src: "images/no/hva_er_kjaerlighet_egentlig/bok_3_kjaerlighet_som_ansvar_forside.jpg",
      alt: "Forsidebilde for voksenboken om kjærlighet.",
    },
    teaser: "En voksentekst om kjærlighet som handling, ansvar, frihet og sannhet uten eierskap.",
  },
  {
    id: "no-meaning-children",
    level: "children",
    series: "Serie 03",
    title: "Hva er meningen med livet?",
    subtitle: "Stjernen i lomma",
    path: "books/no/hva_er_meningen_med_livet/bok_1_stjernen_i_lomma_barn.md",
    teaser: "En barnebok om mening som noe lite man kan bære, dele og følge.",
  },
  {
    id: "no-meaning-youth",
    level: "youth",
    series: "Serie 03",
    title: "Hva er meningen med livet?",
    subtitle: "Når fremtiden blir stille",
    path: "books/no/hva_er_meningen_med_livet/bok_2_nar_fremtiden_blir_stille_ungdom.md",
    teaser: "En ungdomsbok om stillhet, fremtid, press og hvordan mening kan finnes uten ferdig fasit.",
  },
  {
    id: "no-meaning-adult",
    level: "adult",
    series: "Serie 03",
    title: "Hva er meningen med livet?",
    subtitle: "Ikke en fasit, men en retning",
    path: "books/no/hva_er_meningen_med_livet/bok_3_ikke_en_fasit_men_en_retning_voksne.md",
    teaser: "En voksentekst om mening som retning, ansvar og et liv som ikke kan reduseres til prestasjon.",
  },
  {
    id: "no-safe-self-children",
    level: "children",
    series: "Serie 04",
    title: "Hvordan bli trygg i seg selv?",
    subtitle: "Den lille stemmen",
    path: "books/no/hvordan_bli_trygg_i_seg_selv/bok_1_den_lille_stemmen_barn.md",
    art: {
      src: "images/no/hvordan_bli_trygg_i_seg_selv/bok_1_den_lille_stemmen_forside.jpg",
      alt: "Forsidebilde for barneboken om trygghet i seg selv.",
    },
    teaser: "En barnebok om den lille stemmen inni oss, og hvordan trygghet kan øves frem.",
  },
  {
    id: "no-safe-self-youth",
    level: "youth",
    series: "Serie 04",
    title: "Hvordan bli trygg i seg selv?",
    subtitle: "Ansiktet i speilet",
    path: "books/no/hvordan_bli_trygg_i_seg_selv/bok_2_ansiktet_i_speilet_ungdom.md",
    art: {
      src: "images/no/hvordan_bli_trygg_i_seg_selv/bok_2_ansiktet_i_speilet_forside.jpg",
      alt: "Forsidebilde for ungdomsboken om trygghet i seg selv.",
    },
    teaser: "En ungdomsbok om speil, blikk, uro og å bygge et sted inni seg selv som tåler verden.",
  },
  {
    id: "no-safe-self-adult",
    level: "adult",
    series: "Serie 04",
    title: "Hvordan bli trygg i seg selv?",
    subtitle: "Et hjem i seg selv",
    path: "books/no/hvordan_bli_trygg_i_seg_selv/bok_3_et_hjem_i_seg_selv_voksne.md",
    art: {
      src: "images/no/hvordan_bli_trygg_i_seg_selv/bok_3_et_hjem_i_seg_selv_forside.jpg",
      alt: "Forsidebilde for voksenboken om trygghet i seg selv.",
    },
    teaser: "En voksentekst om indre trygghet, erfaring, grenser og et hjem i seg selv.",
  },
  {
    id: "no-anxiety-children",
    level: "children",
    series: "Serie 05",
    title: "Hva er angst og depresjon?",
    subtitle: "Monsteret og teppet",
    path: "books/no/hva_er_angst_og_depresjon/bok_1_monsteret_og_teppet_barn.md",
    art: {
      src: "images/no/hva_er_angst_og_depresjon/bok_1_monsteret_og_teppet_forside.jpg",
      alt: "Forsidebilde for barneboken om angst og depresjon.",
    },
    teaser: "En barnebok om redsel, mørke, språk og voksne som ikke later som alt er enkelt.",
  },
  {
    id: "no-anxiety-youth",
    level: "youth",
    series: "Serie 05",
    title: "Hva er angst og depresjon?",
    subtitle: "Alarm og tåke",
    path: "books/no/hva_er_angst_og_depresjon/bok_2_alarm_og_taake_ungdom.md",
    art: {
      src: "images/no/hva_er_angst_og_depresjon/bok_2_alarm_og_taake_forside.jpg",
      alt: "Forsidebilde for ungdomsboken om angst og depresjon.",
    },
    teaser: "En ungdomsbok om alarm i kroppen, tåke i hodet og hvorfor hjelp ikke er svakhet.",
  },
  {
    id: "no-anxiety-adult",
    level: "adult",
    series: "Serie 05",
    title: "Hva er angst og depresjon?",
    subtitle: "Når alarm og mørke tar plass",
    path: "books/no/hva_er_angst_og_depresjon/bok_3_nar_alarm_og_moerke_tar_plass_voksne.md",
    art: {
      src: "images/no/hva_er_angst_og_depresjon/bok_3_nar_alarm_og_moerke_tar_plass_forside.jpg",
      alt: "Forsidebilde for voksenboken om angst og depresjon.",
    },
    teaser: "En voksentekst om lidelse, kropp, skam, hjelp og samfunnets språk for det vonde.",
  },
  {
    id: "no-selfworth-children",
    level: "children",
    series: "Serie 06",
    title: "Hva er selvtillit og selvfølelse?",
    subtitle: "To stemmer i magen",
    path: "books/no/hva_er_selvtillit_og_selvfoelelse/bok_1_to_stemmer_i_magen_barn.md",
    art: {
      src: "images/no/hva_er_selvtillit_og_selvfoelelse/bok_1_to_stemmer_i_magen_forside.jpg",
      alt: "Forsidebilde for barneboken om selvtillit og selvfølelse.",
    },
    teaser: "En barnebok om to stemmer: den som tør noe, og den som vet at du er verdifull uansett.",
  },
  {
    id: "no-selfworth-youth",
    level: "youth",
    series: "Serie 06",
    title: "Hva er selvtillit og selvfølelse?",
    subtitle: "Ikke bare flink",
    path: "books/no/hva_er_selvtillit_og_selvfoelelse/bok_2_ikke_bare_flink_ungdom.md",
    art: {
      src: "images/no/hva_er_selvtillit_og_selvfoelelse/bok_2_ikke_bare_flink_forside.jpg",
      alt: "Forsidebilde for ungdomsboken om selvtillit og selvfølelse.",
    },
    teaser: "En ungdomsbok om prestasjon, verdi og å være mer enn det man får til.",
  },
  {
    id: "no-selfworth-adult",
    level: "adult",
    series: "Serie 06",
    title: "Hva er selvtillit og selvfølelse?",
    subtitle: "Verdi uten bevis",
    path: "books/no/hva_er_selvtillit_og_selvfoelelse/bok_3_verdi_uten_bevis_voksne.md",
    art: {
      src: "images/no/hva_er_selvtillit_og_selvfoelelse/bok_3_verdi_uten_bevis_forside.jpg",
      alt: "Forsidebilde for voksenboken om selvtillit og selvfølelse.",
    },
    teaser: "En voksentekst om forskjellen på mestring og menneskeverd.",
  },
  {
    id: "no-selfimage-children",
    level: "children",
    series: "Serie 07",
    title: "Hvordan styrker jeg mitt selvbilde?",
    subtitle: "Speilet som lurte",
    path: "books/no/hvordan_styrker_jeg_mitt_selvbilde/bok_1_speilet_som_lurte_barn.md",
    art: {
      src: "images/no/hvordan_styrker_jeg_mitt_selvbilde/bok_1_speilet_som_lurte_forside.jpg",
      alt: "Forsidebilde for barneboken om selvbilde.",
    },
    teaser: "En barnebok om speil, sammenligning og å lære at et bilde ikke er hele sannheten.",
  },
  {
    id: "no-selfimage-youth",
    level: "youth",
    series: "Serie 07",
    title: "Hvordan styrker jeg mitt selvbilde?",
    subtitle: "Filteret",
    path: "books/no/hvordan_styrker_jeg_mitt_selvbilde/bok_2_filteret_ungdom.md",
    art: {
      src: "images/no/hvordan_styrker_jeg_mitt_selvbilde/bok_2_filteret_forside.jpg",
      alt: "Forsidebilde for ungdomsboken om selvbilde.",
    },
    teaser: "En ungdomsbok om filter, blikk, skam og et sannere bilde av seg selv.",
  },
  {
    id: "no-selfimage-adult",
    level: "adult",
    series: "Serie 07",
    title: "Hvordan styrker jeg mitt selvbilde?",
    subtitle: "Et sannere bilde",
    path: "books/no/hvordan_styrker_jeg_mitt_selvbilde/bok_3_et_sannere_bilde_voksne.md",
    art: {
      src: "images/no/hvordan_styrker_jeg_mitt_selvbilde/bok_3_et_sannere_bilde_forside.jpg",
      alt: "Forsidebilde for voksenboken om selvbilde.",
    },
    teaser: "En voksentekst om identitet, speiling, kropp, minne og å tåle å se seg selv mer sant.",
  },
  {
    id: "no-community-children",
    level: "children",
    series: "Serie 08",
    title: "Hvordan blir vi mer fellesskapsorienterte igjen?",
    subtitle: "Bordet som ble større",
    path: "books/no/hvordan_bli_mer_fellesskapsorienterte_igjen/bok_1_bordet_som_ble_storre_barn.md",
    teaser: "En barnebok om deling, lek, ansvar og hvordan et bord kan bli større uten at alle må bli like.",
  },
  {
    id: "no-community-youth",
    level: "youth",
    series: "Serie 08",
    title: "Hvordan blir vi mer fellesskapsorienterte igjen?",
    subtitle: "Ikke bare min profil",
    path: "books/no/hvordan_bli_mer_fellesskapsorienterte_igjen/bok_2_ikke_bare_min_profil_ungdom.md",
    teaser: "En ungdomsbok om profil, prestasjon, ensomhet, digitalt ansvar og små handlinger som gjør et vi mulig.",
  },
  {
    id: "no-community-adult",
    level: "adult",
    series: "Serie 08",
    title: "Hvordan blir vi mer fellesskapsorienterte igjen?",
    subtitle: "Fra jeg til vi",
    path: "books/no/hvordan_bli_mer_fellesskapsorienterte_igjen/bok_3_fra_jeg_til_vi_voksne.md",
    teaser: "En voksentekst om individ, fellesskap, foreldre, institusjoner, marked, omsorg, grenser og felles praksis.",
  },
  {
    id: "no-canon-friends",
    level: "children",
    series: "Serie 09",
    title: "ReMind barnebøker 2026",
    subtitle: "Hvorfor kan ikke alle bare være venner?",
    path: "books/no/reworld_canon_2026/01_hvorfor_kan_ikke_alle_bare_vaere_venner.md",
    teaser: "En norsk barnebok om konflikt, lek, grenser og spørsmålet som virker enkelt helt til voksne må svare.",
  },
  {
    id: "no-canon-build",
    level: "children",
    series: "Serie 09",
    title: "ReMind barnebøker 2026",
    subtitle: "Hvorfor kan vi ikke bygge det sammen?",
    path: "books/no/reworld_canon_2026/02_hvorfor_kan_vi_ikke_bygge_det_sammen.md",
    teaser: "En norsk barnebok om samarbeid, deltakelse og hvem som får være med før planen er bestemt.",
  },
  {
    id: "no-canon-need",
    level: "children",
    series: "Serie 09",
    title: "ReMind barnebøker 2026",
    subtitle: "Hvorfor trenger vi hverandre?",
    path: "books/no/reworld_canon_2026/03_hvorfor_trenger_vi_hverandre.md",
    teaser: "En norsk barnebok om avhengighet, omsorg, luft, vann og det vi deler uten å merke det.",
  },
];

const seriesAnchors = {
  "Series 01": {
    src: "/images/reworld-triptych-cover.jpg",
    alt: "Three symbolic ReMind images: a line, a structure, and ripples.",
  },
  "Series 02": {
    src: "/images/reworld-triptych-cover.jpg",
    alt: "Three symbolic ReMind images: a line, a structure, and ripples.",
  },
  "Series 03": {
    src: "/images/reworld-triptych-cover.jpg",
    alt: "Three symbolic ReMind images: a line, a structure, and ripples.",
  },
  "Series 04": {
    src: "images/parenting/00_intro.jpg",
    alt: "A quiet symbolic image for the question of good parenting.",
  },
  "no-blank": {
    src: "images/no/det_blank_sporsmalet/cover.jpg",
    alt: "Forsidebilde for Det blanke spørsmålet.",
  },
  "no-love": {
    src: "images/no/hva_er_kjaerlighet_egentlig/hva_er_kjaerlighet_egentlig_inngangsbilde.jpg",
    alt: "Inngangsbilde for bokserien Hva er kjærlighet egentlig.",
  },
  "no-meaning": {
    src: "images/series-03-ripples.jpg",
    alt: "Et symbolsk bilde av ringer i vann.",
  },
  "no-safe-self": {
    src: "images/no/hvordan_bli_trygg_i_seg_selv/hvordan_bli_trygg_i_seg_selv_inngangsbilde.jpg",
    alt: "Inngangsbilde for bokserien Hvordan bli trygg i seg selv.",
  },
  "no-anxiety": {
    src: "images/no/hva_er_angst_og_depresjon/hva_er_angst_og_depresjon_inngangsbilde.jpg",
    alt: "Inngangsbilde for bokserien Hva er angst og depresjon.",
  },
  "no-selfworth": {
    src: "images/no/hva_er_selvtillit_og_selvfoelelse/hva_er_selvtillit_og_selvfoelelse_inngangsbilde.jpg",
    alt: "Inngangsbilde for bokserien Hva er selvtillit og selvfølelse.",
  },
  "no-selfimage": {
    src: "images/no/hvordan_styrker_jeg_mitt_selvbilde/hvordan_styrker_jeg_mitt_selvbilde_inngangsbilde.jpg",
    alt: "Inngangsbilde for bokserien Hvordan styrker jeg mitt selvbilde.",
  },
  "no-community": {
    src: "images/series-02-structure.jpg",
    alt: "Et symbolsk bilde av en uferdig struktur under åpen himmel.",
  },
};

const seriesCatalog = [
  {
    id: "series-01",
    locale: "en",
    series: "Series 01",
    title: "Why Can't Everyone Just Be Friends?",
    movement: "Schoolyard -> feed -> civilization.",
    teaser: "Conflict, dignity, humiliation, power, dehumanization, and the possibility of peace.",
    bookIds: ["children-01", "youth-01", "adult-01"],
  },
  {
    id: "series-02",
    locale: "en",
    series: "Series 02",
    title: "Why Can't We Build It Together?",
    movement: "Hut -> digital city -> public house.",
    teaser: "Participation, design, institutions, access, and the difference between helping and shaping.",
    bookIds: ["children-02", "youth-02", "adult-02"],
  },
  {
    id: "series-03",
    locale: "en",
    series: "Series 03",
    title: "Why Do We Need Each Other?",
    movement: "Classroom -> shared air -> shared body.",
    teaser: "Dependence, care, invisible labor, ecology, infrastructure, and shared consequences.",
    bookIds: ["children-03", "youth-03", "adult-03"],
  },
  {
    id: "no-blank",
    locale: "no",
    series: "Åpningsbok",
    anchor: "no-blank",
    title: "Det blanke spørsmålet",
    movement: "Stillhet -> rådsmøte -> ett sant steg.",
    teaser: "Et åpent spørsmål til rådet, med lydbok, der tomrommet ikke fylles for raskt.",
    bookIds: ["no-blank-question"],
  },
  {
    id: "series-04",
    locale: "no",
    series: "Serie 01",
    anchor: "Series 04",
    title: "Hva er god barneoppdragelse?",
    movement: "Introduksjon -> barn -> ungdom -> voksne.",
    teaser: "Trygghet, kontakt, grenser, ansvar, reparasjon og gradvis frihet.",
    bookIds: ["parenting-intro", "parenting-children", "parenting-youth", "parenting-adult"],
  },
  {
    id: "no-love",
    locale: "no",
    series: "Serie 02",
    anchor: "no-love",
    title: "Hva er kjærlighet egentlig?",
    movement: "Barn -> ungdom -> voksne.",
    teaser: "Kjærlighet undersøkt som følelse, frihet, ansvar og grense.",
    bookIds: ["no-love-children", "no-love-youth", "no-love-adult"],
  },
  {
    id: "no-meaning",
    locale: "no",
    series: "Serie 03",
    anchor: "no-meaning",
    title: "Hva er meningen med livet?",
    movement: "Barn -> ungdom -> voksne.",
    teaser: "Mening undersøkt uten ferdig fasit, men med retning, ansvar og håp.",
    bookIds: ["no-meaning-children", "no-meaning-youth", "no-meaning-adult"],
  },
  {
    id: "no-safe-self",
    locale: "no",
    series: "Serie 04",
    anchor: "no-safe-self",
    title: "Hvordan bli trygg i seg selv?",
    movement: "Barn -> ungdom -> voksne.",
    teaser: "En serie om indre trygghet, uro, grenser og et hjem i seg selv.",
    bookIds: ["no-safe-self-children", "no-safe-self-youth", "no-safe-self-adult"],
  },
  {
    id: "no-anxiety",
    locale: "no",
    series: "Serie 05",
    anchor: "no-anxiety",
    title: "Hva er angst og depresjon?",
    movement: "Barn -> ungdom -> voksne.",
    teaser: "En serie om alarm, mørke, kropp, språk, hjelp og menneskeverd.",
    bookIds: ["no-anxiety-children", "no-anxiety-youth", "no-anxiety-adult"],
  },
  {
    id: "no-selfworth",
    locale: "no",
    series: "Serie 06",
    anchor: "no-selfworth",
    title: "Hva er selvtillit og selvfølelse?",
    movement: "Barn -> ungdom -> voksne.",
    teaser: "En serie om mestring, verdi og forskjellen på hva vi får til og hvem vi er.",
    bookIds: ["no-selfworth-children", "no-selfworth-youth", "no-selfworth-adult"],
  },
  {
    id: "no-selfimage",
    locale: "no",
    series: "Serie 07",
    anchor: "no-selfimage",
    title: "Hvordan styrker jeg mitt selvbilde?",
    movement: "Barn -> ungdom -> voksne.",
    teaser: "En serie om speil, filter, skam, kropp og et sannere bilde av seg selv.",
    bookIds: ["no-selfimage-children", "no-selfimage-youth", "no-selfimage-adult"],
  },
  {
    id: "no-community",
    locale: "no",
    series: "Serie 08",
    anchor: "no-community",
    title: "Hvordan blir vi mer fellesskapsorienterte igjen?",
    movement: "Barn -> ungdom -> voksne.",
    teaser: "En serie om fellesskap uten selvutslettelse, frihet med ansvar og små praksiser som gjør at flere hører til.",
    bookIds: ["no-community-children", "no-community-youth", "no-community-adult"],
  },
  {
    id: "no-canon-children",
    locale: "no",
    series: "Serie 09",
    anchor: "no-meaning",
    title: "ReMind barnebøker 2026",
    movement: "Venner -> bygge sammen -> trenge hverandre.",
    teaser: "Tre norske barnebøker fra ReMind-kanonen, samlet som en egen inngang.",
    bookIds: ["no-canon-friends", "no-canon-build", "no-canon-need"],
  },
];

const bookGrid = document.getElementById("bookGrid");
const seriesChooser = document.getElementById("seriesChooser");
const seriesChooserTitle = document.getElementById("seriesChooserTitle");
const seriesChooserKicker = document.getElementById("seriesChooserKicker");
const seriesChooserText = document.getElementById("seriesChooserText");
const seriesChoiceGrid = document.getElementById("seriesChoiceGrid");
const reader = document.getElementById("reader");
const readerTitle = document.getElementById("readerTitle");
const readerKicker = document.getElementById("readerKicker");
const readerBody = document.getElementById("readerBody");
const readerAudioMount = document.getElementById("readerAudioMount");
const videoViewer = document.getElementById("videoViewer");
const introVideo = document.getElementById("introVideo");
const languagePanel = document.getElementById("language-panel");
const pageLocale = document.body.dataset.reworldLocale || "en";
const assetBase = document.body.dataset.assetBase || "";
const ui = pageLocale === "no"
  ? {
      play: "Spill",
      pause: "Pause",
      loading: "Laster bok...",
      loadError: "Kunne ikke laste denne boken. Start lokal server fra prosjektmappen og prøv igjen.",
    }
  : {
      play: "Play",
      pause: "Pause",
      loading: "Loading book...",
      loadError: "Could not load this book. Start the local server from the project folder and try again.",
    };
let readerSize = 19;
let activeAudio = null;

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function resolveAsset(path) {
  if (!path || path.startsWith("/") || path.startsWith("http")) return path;
  return `${assetBase}${path}`;
}

function displaySeries(book) {
  if (pageLocale === "no" && book.series === "Series 04") return "Serie 01";
  return book.series;
}

function levelLabel(level) {
  if (pageLocale !== "no") return titleCase(level);
  const labels = {
    intro: "Intro",
    children: "Barn",
    youth: "Ungdom",
    adult: "Voksne",
    session: "Rådsmøte",
  };
  return labels[level] || titleCase(level);
}

function anchorForBook(book) {
  if (book.art) return book.art;
  const seriesEntry = seriesCatalog.find((item) => item.bookIds.includes(book.id));
  return seriesAnchors[seriesEntry?.anchor || book.series];
}

function renderSeries() {
  const visible = seriesCatalog.filter((item) => item.locale === pageLocale);
  bookGrid.innerHTML = visible.map((item) => {
    const anchor = seriesAnchors[item.anchor || item.series];
    return `
      <article class="series-card">
        <button class="series-entry" type="button" data-open-series="${item.id}">
          <span class="series-image">
            <img src="${resolveAsset(anchor.src)}" alt="${anchor.alt}" loading="lazy">
          </span>
          <span class="series-copy">
            <span class="book-meta">${item.series}</span>
            <span class="series-title">${item.title}</span>
            <span class="series-movement">${item.movement}</span>
            <span class="series-teaser">${item.teaser}</span>
          </span>
        </button>
      </article>
    `;
  }).join("");
}

function openSeries(id) {
  const item = seriesCatalog.find((entry) => entry.id === id);
  if (!item) return;

  seriesChooserKicker.textContent = item.series;
  seriesChooserTitle.textContent = item.title;
  seriesChooserText.textContent = item.teaser;
  seriesChoiceGrid.innerHTML = item.bookIds.map((bookId) => {
    const book = books.find((entry) => entry.id === bookId);
    const label = levelLabel(book.level);
    return `
      <article class="choice-card" data-level="${book.level}">
        <p class="book-meta">${label}</p>
        <h3>${book.subtitle}</h3>
        <p>${book.teaser}</p>
        <button type="button" data-open-book="${book.id}">${pageLocale === "no" ? "Åpne bok" : "Open book"}</button>
      </article>
    `;
  }).join("");

  seriesChooser.classList.add("is-open");
  seriesChooser.setAttribute("aria-hidden", "false");
  document.body.classList.add("chooser-open");
}

function closeSeriesChooser() {
  seriesChooser.classList.remove("is-open");
  seriesChooser.setAttribute("aria-hidden", "true");
  document.body.classList.remove("chooser-open");
}

function renderBookCards(filter = "all") {
  const visible = filter === "all" ? books : books.filter((book) => book.level === filter);
  bookGrid.innerHTML = visible.map((book) => {
    const anchor = anchorForBook(book);
    return `
      <article class="book-card" data-level="${book.level}">
        <div class="book-card-layout">
          <div class="book-strip">
            <img src="${resolveAsset(anchor.src)}" alt="${anchor.alt}" loading="lazy">
          </div>
          <div class="book-copy">
            <p class="book-meta">${book.series} / ${titleCase(book.level)}</p>
            <h3>${book.title}</h3>
            <p><strong>${book.subtitle}</strong></p>
            <p>${book.teaser}</p>
          </div>
        </div>
        <button type="button" data-open-book="${book.id}">Open book</button>
      </article>
    `;
  }).join("");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function markdownToHtml(markdown) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let listType = null;

  function closeList() {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      closeList();
      continue;
    }

    const ordered = line.match(/^(\d+)\.\s+(.*)$/);
    if (ordered) {
      if (listType !== "ol") {
        closeList();
        html.push("<ol>");
        listType = "ol";
      }
      html.push(`<li>${formatInline(ordered[2])}</li>`);
      continue;
    }

    const unordered = line.match(/^[-*]\s+(.*)$/);
    if (unordered) {
      if (listType !== "ul") {
        closeList();
        html.push("<ul>");
        listType = "ul";
      }
      html.push(`<li>${formatInline(unordered[1])}</li>`);
      continue;
    }

    closeList();

    if (line.startsWith("# ")) {
      html.push(`<h1>${formatInline(line.slice(2))}</h1>`);
    } else if (line.startsWith("## ")) {
      html.push(`<h2>${formatInline(line.slice(3))}</h2>`);
    } else if (line.startsWith("### ")) {
      html.push(`<h3>${formatInline(line.slice(4))}</h3>`);
    } else {
      html.push(`<p>${formatInline(line)}</p>`);
    }
  }

  closeList();

  return html.join("");
}

function formatInline(value) {
  return escapeHtml(value).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remaining = String(safeSeconds % 60).padStart(2, "0");
  return `${minutes}:${remaining}`;
}

function clearAudioPlayer() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }
  readerAudioMount.innerHTML = "";
}

function renderAudioPlayer(book) {
  clearAudioPlayer();
  if (!book.audio) return;

  readerAudioMount.innerHTML = `
    <div class="audio-player">
      <audio preload="metadata" src="${resolveAsset(book.audio)}"></audio>
      <button class="audio-toggle" type="button" aria-label="${ui.play} audiobook">${ui.play}</button>
      <input class="audio-seek" type="range" min="0" max="100" value="0" step="0.1" aria-label="Audio position">
      <span class="audio-time">0:00 / 0:00</span>
    </div>
  `;

  const audio = readerAudioMount.querySelector("audio");
  const toggle = readerAudioMount.querySelector(".audio-toggle");
  const seek = readerAudioMount.querySelector(".audio-seek");
  const time = readerAudioMount.querySelector(".audio-time");
  let seeking = false;
  activeAudio = audio;

  function syncTime() {
    const duration = audio.duration || 0;
    const current = audio.currentTime || 0;
    seek.value = duration ? String((current / duration) * 100) : "0";
    time.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
  }

  toggle.addEventListener("click", async () => {
    if (audio.paused) {
      await audio.play();
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("play", () => {
    toggle.textContent = ui.pause;
    toggle.setAttribute("aria-label", "Pause audiobook");
  });

  audio.addEventListener("pause", () => {
    toggle.textContent = ui.play;
    toggle.setAttribute("aria-label", `${ui.play} audiobook`);
  });

  audio.addEventListener("loadedmetadata", syncTime);
  audio.addEventListener("timeupdate", () => {
    if (!seeking) syncTime();
  });
  audio.addEventListener("ended", syncTime);

  seek.addEventListener("input", () => {
    seeking = true;
    const duration = audio.duration || 0;
    const current = duration * (Number(seek.value) / 100);
    time.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
  });

  seek.addEventListener("change", () => {
    const duration = audio.duration || 0;
    audio.currentTime = duration * (Number(seek.value) / 100);
    seeking = false;
    syncTime();
  });
}

async function openBook(id) {
  const book = books.find((item) => item.id === id);
  if (!book) return;

  readerTitle.textContent = book.title;
  readerKicker.textContent = `${displaySeries(book)} / ${levelLabel(book.level)} / ${book.subtitle}`;
  renderAudioPlayer(book);
  readerBody.innerHTML = `<p>${ui.loading}</p>`;
  reader.classList.add("is-open");
  reader.setAttribute("aria-hidden", "false");
  document.body.classList.add("reader-open");

  try {
    const response = await fetch(resolveAsset(book.path));
    if (!response.ok) throw new Error(`Could not load ${book.path}`);
    const markdown = await response.text();
    const anchor = anchorForBook(book);
    readerBody.innerHTML = `
      <div class="reader-art">
        <img src="${resolveAsset(anchor.src)}" alt="${anchor.alt}" loading="lazy">
      </div>
      ${markdownToHtml(markdown)}
    `;
    readerBody.scrollTop = 0;
  } catch (error) {
    readerBody.innerHTML = `<p>${ui.loadError}</p><p>${escapeHtml(error.message)}</p>`;
  }
}

function closeReader() {
  reader.classList.remove("is-open");
  reader.setAttribute("aria-hidden", "true");
  document.body.classList.remove("reader-open");
  clearAudioPlayer();
}

function openVideoViewer() {
  if (!videoViewer) return;
  videoViewer.classList.add("is-open");
  videoViewer.setAttribute("aria-hidden", "false");
  document.body.classList.add("video-open");
}

function closeVideoViewer() {
  if (!videoViewer) return;
  videoViewer.classList.remove("is-open");
  videoViewer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("video-open");
  if (introVideo) introVideo.pause();
}

document.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-open-book]");
  if (openButton) {
    closeSeriesChooser();
    openBook(openButton.dataset.openBook);
  }

  const seriesButton = event.target.closest("[data-open-series]");
  if (seriesButton) {
    openSeries(seriesButton.dataset.openSeries);
  }

  if (event.target.closest("[data-close-series]")) {
    closeSeriesChooser();
  }

  if (event.target.closest("[data-close-reader]")) {
    closeReader();
  }

  if (event.target.closest("[data-open-video]")) {
    openVideoViewer();
  }

  if (event.target.closest("[data-close-video]")) {
    closeVideoViewer();
  }

  const panelButton = event.target.closest("[data-panel-toggle]");
  if (panelButton) {
    event.stopPropagation();
    document.getElementById(panelButton.dataset.panelToggle).classList.toggle("is-open");
  } else if (!event.target.closest(".language-panel")) {
    languagePanel?.classList.remove("is-open");
  }
});

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    renderBooks(button.dataset.filter);
  });
});

document.querySelectorAll("[data-size]").forEach((button) => {
  button.addEventListener("click", () => {
    readerSize += button.dataset.size === "up" ? 1 : -1;
    readerSize = Math.max(16, Math.min(25, readerSize));
    document.documentElement.style.setProperty("--reader-size", `${readerSize}px`);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeReader();
    closeSeriesChooser();
    closeVideoViewer();
  }
});

function drawCouncilField() {
  const canvas = document.getElementById("councilCanvas");
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * scale));
  canvas.height = Math.max(1, Math.floor(rect.height * scale));
  ctx.scale(scale, scale);

  const width = rect.width;
  const height = rect.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fbfaf7";
  ctx.fillRect(0, 0, width, height);

  const centerX = width * 0.72;
  const centerY = height * 0.47;
  const radius = Math.min(width, height) * 0.28;
  const labels = ["Child", "Science", "Faith", "Power", "Peace", "Nature", "Memory", "Dignity", "Blix"];
  const colors = ["#b38b45", "#455e7b", "#2e5d55", "#9b6040", "#6f7569"];

  ctx.strokeStyle = "rgba(46, 93, 85, 0.12)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 7; i += 1) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * (0.42 + i * 0.11), 0, Math.PI * 2);
    ctx.stroke();
  }

  labels.forEach((label, index) => {
    const angle = (Math.PI * 2 * index) / labels.length - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "rgba(22, 24, 22, 0.10)";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, 34, 0, Math.PI * 2);
    ctx.fillStyle = colors[index % colors.length];
    ctx.globalAlpha = 0.92;
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = "#fff";
    ctx.font = "700 11px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x, y);
  });

  ctx.beginPath();
  ctx.arc(centerX, centerY, 54, 0, Math.PI * 2);
  ctx.fillStyle = "#161816";
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "700 12px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("The", centerX, centerY - 9);
  ctx.fillText("Council", centerX, centerY + 9);
}

renderSeries();
drawCouncilField();
window.addEventListener("resize", drawCouncilField);
