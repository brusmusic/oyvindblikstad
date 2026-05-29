from pathlib import Path
from html import escape
import re

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path("/Users/oyvindblikstad/Documents/reworld_kosmosministeren_prototype/bokserie")
OUT = ROOT / "reworld"

SERIES = [
    {
        "slug": "friends",
        "title": "Why Can't Everyone Just Be Friends?",
        "theme": "Konflikt, utenforskap, dehumanisering, makt og fred.",
        "movement": "Skolegård -> feed -> sivilisasjon.",
        "question": "Hvorfor kan ikke alle bare være venner?",
        "books": [
            ("Barn", SOURCE / "ny_runde_kosmosministeren_oppdatert/bok_1_streken_i_skolegarden.md"),
            ("Ungdom", SOURCE / "ny_runde_kosmosministeren_oppdatert/bok_2_skygger_i_feeden.md"),
            ("Voksen", SOURCE / "ny_runde_kosmosministeren_oppdatert/bok_3_voksne_rom_barns_regning.md"),
        ],
    },
    {
        "slug": "build",
        "title": "Why Can't We Build It Together?",
        "theme": "Samarbeid, medvirkning, institusjoner, fellesskap og makt i byggverk.",
        "movement": "Hytte -> digital ungdomsby -> kulturhus.",
        "question": "Hvorfor kan vi ikke bygge det sammen?",
        "books": [
            ("Barn", SOURCE / "why_cant_we_build_it_together/bok_1_den_halve_hytta.md"),
            ("Ungdom", SOURCE / "why_cant_we_build_it_together/bok_2_byen_i_serverrommet.md"),
            ("Voksen", SOURCE / "why_cant_we_build_it_together/bok_3_grunnmuren.md"),
        ],
    },
    {
        "slug": "need",
        "title": "Why Do We Need Each Other?",
        "theme": "Sårbarhet, avhengighet, omsorg, luft, vann, natur, beredskap og livsgrunnlag.",
        "movement": "Klasserom -> felles luft -> felles kroppssystem.",
        "question": "Hvorfor trenger vi hverandre?",
        "books": [
            ("Barn", SOURCE / "why_do_we_need_each_other/bok_1_pusten_i_klasserommet.md"),
            ("Ungdom", SOURCE / "why_do_we_need_each_other/bok_2_lufta_mellom_oss.md"),
            ("Voksen", SOURCE / "why_do_we_need_each_other/bok_3_det_felles_kroppssystemet.md"),
        ],
    },
]

COUNCIL = [
    "Kristendommens representant",
    "Islams representant",
    "Buddhismens representant",
    "Platons representant",
    "Kants representant",
    "Vitenskapens representant",
    "Psykologiens representant",
    "Barnets representant",
    "Maktkritikeren",
    "Fredsbyggeren",
    "Kosmosministeren",
]

COUNCIL_EN = [
    "Christian voice",
    "Muslim voice",
    "Buddhist voice",
    "Platonic voice",
    "Kantian voice",
    "Scientific voice",
    "Psychological voice",
    "The child's voice",
    "The power critic",
    "The peacebuilder",
    "The Cosmos Minister",
]

SERIES_EN = [
    {
        "slug": "friends",
        "label": "Series 1",
        "title": "Why Can't Everyone Just Be Friends?",
        "question": "Why can't everyone just be friends?",
        "theme": "Conflict, exclusion, dehumanization, power and peace.",
        "movement": "Schoolyard -> feed -> civilization.",
        "books": [
            ("Kid", "The Line in the Schoolyard", "A crack in the asphalt becomes a border. The council asks who gets space, who defines the rules, and what repair means when apology is not magic."),
            ("Youth", "Shadows in the Feed", "A screenshot moves faster than truth. The council examines shame, activism, religion, identity and the difference between accountability and public destruction."),
            ("Adult", "Adult Rooms, Children's Bill", "The council turns toward adults: family, work, politics, war, media and institutions. The question becomes who pays when grown people avoid the cost of truth."),
        ],
    },
    {
        "slug": "build",
        "label": "Series 2",
        "title": "Why Can't We Build It Together?",
        "question": "Why can't we build it together?",
        "theme": "Cooperation, participation, institutions, shared spaces and power inside what we build.",
        "movement": "Cabin -> digital youth city -> cultural house.",
        "books": [
            ("Kid", "The Half Cabin", "A class tries to build something together. The project reveals who gets to shape the idea and who is only allowed to help after the decision has been made."),
            ("Youth", "The City in the Server Room", "Young people design a digital city. The council asks what kind of human view is being built into rules, ranking, access and hidden moderation."),
            ("Adult", "The Foundation", "A cultural house is planned as a shared institution. The council asks where power lives: in the architecture, the budget, the calendar or the keys."),
        ],
    },
    {
        "slug": "need",
        "label": "Series 3",
        "title": "Why Do We Need Each Other?",
        "question": "Why do we need each other?",
        "theme": "Vulnerability, dependence, care, air, water, nature, preparedness and the conditions for life.",
        "movement": "Classroom -> shared air -> shared body system.",
        "books": [
            ("Kid", "The Breath in the Classroom", "A glass of water, a short blackout and a wet floor become a lesson in blame, help and the invisible systems that hold people together."),
            ("Youth", "The Air Between Us", "A local alarm makes shared air impossible to ignore. The council asks why common life becomes real only when somebody starts coughing."),
            ("Adult", "The Shared Body System", "Water, infrastructure, budgets and crisis reveal the same truth: no person, city or nation stands outside the living system it depends on."),
        ],
    },
]


def inline(text: str) -> str:
    text = escape(text.strip())
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"\*(.+?)\*", r"<em>\1</em>", text)
    return text


def markdown_to_html(markdown: str) -> str:
    parts = []
    paragraph = []

    def flush():
        nonlocal paragraph
        if paragraph:
            parts.append(f"<p>{inline(' '.join(paragraph))}</p>")
            paragraph = []

    for raw in markdown.splitlines():
        line = raw.strip()
        if not line:
            flush()
            continue
        if line.startswith("# "):
            flush()
            continue
        if line.startswith("## "):
            flush()
            parts.append(f"<h3>{inline(line[3:])}</h3>")
            continue
        if line.startswith("### "):
            flush()
            parts.append(f"<h4>{inline(line[4:])}</h4>")
            continue
        paragraph.append(line)
    flush()
    return "\n".join(parts)


def book_title(markdown: str, fallback: str) -> str:
    for line in markdown.splitlines():
        if line.startswith("## "):
            title = line[3:].strip()
            return title.split(":", 1)[-1].strip()
    return fallback


def render_book(age: str, path: Path) -> str:
    markdown = path.read_text(encoding="utf-8")
    title = book_title(markdown, path.stem.replace("_", " ").title())
    body = markdown_to_html(markdown)
    return f"""
      <details class="book-panel" data-book-panel>
        <summary data-open-book>
          <span>{escape(age)}</span>
          <strong>{escape(title)}</strong>
        </summary>
        <article class="book-text">
          {body}
        </article>
      </details>
    """


def render_series(series) -> str:
    books = "\n".join(render_book(age, path) for age, path in series["books"])
    return f"""
    <section class="series-section" id="{series['slug']}">
      <div class="series-intro">
        <p class="eyebrow">Serie</p>
        <h2>{escape(series['title'])}</h2>
        <p class="question">{escape(series['question'])}</p>
        <p>{escape(series['theme'])}</p>
        <p class="movement">{escape(series['movement'])}</p>
      </div>
      <div class="book-stack">
        {books}
      </div>
    </section>
    """


def render_no():
    OUT.mkdir(exist_ok=True)
    series_html = "\n".join(render_series(series) for series in SERIES)
    council_items = "\n".join(f"<li>{escape(item)}</li>" for item in COUNCIL)

    html = f"""<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ReWorld Council</title>
  <meta name="description" content="ReWorld Council er et digitalt bok- og refleksjonsunivers der barnespørsmål undersøkes av et råd av perspektiver.">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="site-header">
    <a class="brand" href="#top">ReWorld Council</a>
    <nav aria-label="Hovednavigasjon">
      <a href="#series">Bøker</a>
      <a href="#council">Rådet</a>
      <a href="#language">Språk</a>
      <a href="#manifest">Manifest</a>
      <a href="#method">Metode</a>
    </nav>
  </header>

  <main id="top">
    <section class="hero">
      <p class="eyebrow">Et barnespørsmål</p>
      <h1>Why can't everyone just be friends?</h1>
      <p class="lead">A child asks. A council listens. The answer is not simple enough to be false.</p>
      <p>ReWorld er et digitalt bok- og refleksjonsunivers om hvordan mennesker kan tenke sammen uten at én stemme må være konge.</p>
      <div class="hero-actions">
        <a href="#series">Begynn med bøkene</a>
        <a href="#council">Møt rådet</a>
      </div>
    </section>

    <section class="opening-question">
      <p>Ingen stemme skal være konge.</p>
      <p>Ingen sannhet skal brukes som våpen.</p>
      <p>Ingen vakre ord skal få skjule virkelig skade.</p>
    </section>

    <section class="quiet-room" aria-label="Prosjektets kjerne">
      <div>
        <p class="eyebrow">Kjernen</p>
        <h2>Leseren møter spørsmålet før systemet.</h2>
      </div>
      <ol>
        <li><span>01</span> Et barn stiller et spørsmål.</li>
        <li><span>02</span> Øyvinds klone undersøker det.</li>
        <li><span>03</span> Et digitalt råd av perspektiver drøfter det.</li>
        <li><span>04</span> Kosmosministeren modererer.</li>
        <li><span>05</span> Leseren inviteres inn for å tenke klarere.</li>
      </ol>
    </section>

    <section class="series-overview" id="series">
      <div class="section-head">
        <p class="eyebrow">Bokserier</p>
        <h2>Tre spørsmål. Tre aldersnivåer. Tre bevegelser fra nært til stort.</h2>
      </div>
      <div class="series-cards">
        <a href="#friends"><span>Serie 1</span><strong>Why Can't Everyone Just Be Friends?</strong><small>Skolegård -> feed -> sivilisasjon</small></a>
        <a href="#build"><span>Serie 2</span><strong>Why Can't We Build It Together?</strong><small>Hytte -> digital ungdomsby -> kulturhus</small></a>
        <a href="#need"><span>Serie 3</span><strong>Why Do We Need Each Other?</strong><small>Klasserom -> felles luft -> felles kroppssystem</small></a>
      </div>
    </section>

    {series_html}

    <section class="council" id="council">
      <div class="section-head">
        <p class="eyebrow">Main Council</p>
        <h2>Perspektiver, ikke herskere.</h2>
      </div>
      <p>Rådet finnes ikke for å vinne diskusjoner. Det finnes for å holde flere perspektiver åpne samtidig, og her finnes ikke ego, makt eller status.</p>
      <ul class="council-list">
        {council_items}
      </ul>
      <div class="minister">
        <h3>Kosmosministerens rolle</h3>
        <p>Kosmosministeren er moderator, ikke guru. Rollen er å åpne rommet, skille skade fra skam, hindre at dialog brukes til å forsinke beskyttelse, og avslutte med klarhet uten å late som alt er løst.</p>
      </div>
    </section>

    <section class="envoys">
      <div>
        <p class="eyebrow">Special Envoys</p>
        <h2>Gjestestemmer kalles inn når spørsmålet krever det.</h2>
      </div>
      <div class="envoy-grid">
        <article>
          <h3>The Ancestor</h3>
          <p>Brukes når spørsmålet trenger historisk hukommelse: Dette har mennesker prøvd før. Hva har vi glemt?</p>
        </article>
        <article>
          <h3>The Living World</h3>
          <p>Brukes når spørsmålet handler om natur, klima, kropp, luft, vann, jord og økologisk avhengighet.</p>
        </article>
      </div>
    </section>

    <section class="manifest" id="manifest">
      <p class="eyebrow">Manifest</p>
      <h2>ReWorld skal føles som et stille rådsmøte.</h2>
      <p>Nettsiden skal ikke først og fremst oppleves som en app, et AI-produkt eller en teknologidemonstrasjon. Den skal oppleves som et stille, alvorlig og tilgjengelig rom for spørsmål mennesker ofte unngår fordi de er for vanskelige, for politiske, for personlige eller for store.</p>
      <p>Språket skal være enkelt nok til at ungdom kan lese det, men dypt nok til at voksne må stoppe opp. Håp kommer etter sannhet, ikke i stedet for sannhet.</p>
    </section>

    <section class="language" id="language">
      <div>
        <p class="eyebrow">Språk</p>
        <h2>Oversettelse skal være tilgjengelig, men ærlig merket.</h2>
      </div>
      <div>
        <p>Dette er norsk originaltekst. Engelsk er standardsiden og brukes som master for videre automatisk oversettelse.</p>
        <div class="language-links">
          <a href="../">English master</a>
          <a href="https://translate.google.com/translate?sl=en&tl=zh-CN&u=https://oyvindblikstad.com/reworld/" target="_blank" rel="noopener">Chinese</a>
          <a href="https://translate.google.com/translate?sl=en&tl=es&u=https://oyvindblikstad.com/reworld/" target="_blank" rel="noopener">Spanish</a>
          <a href="https://translate.google.com/translate?sl=en&tl=hi&u=https://oyvindblikstad.com/reworld/" target="_blank" rel="noopener">Hindi</a>
          <a href="https://translate.google.com/translate?sl=en&tl=ar&u=https://oyvindblikstad.com/reworld/" target="_blank" rel="noopener">Arabic</a>
          <a href="https://translate.google.com/translate?sl=en&tl=fr&u=https://oyvindblikstad.com/reworld/" target="_blank" rel="noopener">French</a>
        </div>
      </div>
    </section>

    <section class="method" id="method">
      <p class="eyebrow">Behind the Council</p>
      <h2>Teknologien skal være synlig nok til å være ærlig, og usynlig nok til at teksten får virke.</h2>
      <p>ReWorld er foreløpig en statisk nettside med kuraterte tekster, bokserier, rådsmøter, manifest og metode. AI-delen er en del av kunstverket, men den skal ikke stjele hovedrollen fra spørsmålene, historiene og leserens egen refleksjon.</p>
    </section>
  </main>

  <div class="book-modal" id="bookModal" aria-hidden="true">
    <div class="book-modal-backdrop" data-close-book></div>
    <section class="book-modal-dialog" role="dialog" aria-modal="true" aria-label="Åpen bok">
      <button class="book-modal-close" type="button" data-close-book>Close</button>
      <div class="book-modal-content"></div>
    </section>
  </div>
  <button class="reader-button" type="button" aria-pressed="false" data-open-label="Lesemodus" data-close-label="Avslutt lesemodus">Lesemodus</button>
  <script src="script.js"></script>
</body>
</html>
"""

    no_out = OUT / "no"
    no_out.mkdir(parents=True, exist_ok=True)
    (no_out / "index.html").write_text(html.replace('href="style.css"', 'href="../style.css"').replace('src="script.js"', 'src="../script.js"'), encoding="utf-8")


def render_en_book(age: str, title: str, summary: str) -> str:
    return f"""
      <article class="book-panel book-presentation">
        <button class="book-summary" type="button" data-open-book>
          <span>{escape(age)}</span>
          <h3>{escape(title)}</h3>
          <p>{escape(summary)}</p>
        </button>
        <article class="book-text">
          <h3>{escape(title)}</h3>
          <p>{escape(summary)}</p>
          <p>This English master page currently presents the series as curated book openings. The Norwegian original contains the full book text and remains available under the Norwegian page while the literary English edition is prepared.</p>
          <p class="book-link-note"><a href="no/">Open the Norwegian original</a></p>
        </article>
      </article>
    """


def render_en_series(series) -> str:
    books = "\n".join(render_en_book(*book) for book in series["books"])
    return f"""
    <section class="series-section" id="{series['slug']}">
      <div class="series-intro">
        <p class="eyebrow">{escape(series['label'])}</p>
        <h2>{escape(series['title'])}</h2>
        <p class="question">{escape(series['question'])}</p>
        <p>{escape(series['theme'])}</p>
        <p class="movement">{escape(series['movement'])}</p>
      </div>
      <div class="book-stack">
        {books}
      </div>
    </section>
    """


def render_en():
    OUT.mkdir(exist_ok=True)
    series_html = "\n".join(render_en_series(series) for series in SERIES_EN)
    council_items = "\n".join(f"<li>{escape(item)}</li>" for item in COUNCIL_EN)
    language_url = "https://oyvindblikstad.com/reworld/"

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ReWorld Council</title>
  <meta name="description" content="ReWorld Council is a digital book and reflection universe where children's questions are examined by a council of perspectives.">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="site-header">
    <a class="brand" href="#top">ReWorld Council</a>
    <nav aria-label="Main navigation">
      <a href="#series">Books</a>
      <a href="#council">Council</a>
      <a href="#language">Language</a>
      <a href="#manifest">Manifest</a>
      <a href="#method">Method</a>
    </nav>
  </header>

  <main id="top">
    <section class="hero">
      <p class="eyebrow">A child's question</p>
      <h1>Why can't everyone just be friends?</h1>
      <p class="lead">A child asks. A council listens. The answer is not simple enough to be false.</p>
      <p>ReWorld is a digital book and reflection universe about how people can think together without one voice becoming king.</p>
      <div class="hero-actions">
        <a href="#series">Begin with the books</a>
        <a href="#council">Meet the council</a>
      </div>
    </section>

    <section class="opening-question">
      <p>No voice shall be king.</p>
      <p>No truth shall be used as a weapon.</p>
      <p>No beautiful words shall be allowed to hide real harm.</p>
    </section>

    <section class="quiet-room" aria-label="The core of the project">
      <div>
        <p class="eyebrow">The core</p>
        <h2>The reader meets the question before the system.</h2>
      </div>
      <ol>
        <li><span>01</span> A child asks a question.</li>
        <li><span>02</span> Øyvind's clone examines it.</li>
        <li><span>03</span> A digital council of perspectives discusses it.</li>
        <li><span>04</span> The Cosmos Minister moderates.</li>
        <li><span>05</span> The reader is invited in, not to receive a final answer, but to think more clearly.</li>
      </ol>
    </section>

    <section class="series-overview" id="series">
      <div class="section-head">
        <p class="eyebrow">Book series</p>
        <h2>Three questions. Three age levels. Three movements from near to large.</h2>
      </div>
      <div class="series-cards">
        <a href="#friends"><span>Series 1</span><strong>Why Can't Everyone Just Be Friends?</strong><small>Schoolyard -> feed -> civilization</small></a>
        <a href="#build"><span>Series 2</span><strong>Why Can't We Build It Together?</strong><small>Cabin -> digital youth city -> cultural house</small></a>
        <a href="#need"><span>Series 3</span><strong>Why Do We Need Each Other?</strong><small>Classroom -> shared air -> shared body system</small></a>
      </div>
    </section>

    {series_html}

    <section class="council" id="council">
      <div class="section-head">
        <p class="eyebrow">Main Council</p>
        <h2>Perspectives, not rulers.</h2>
      </div>
      <p>The council does not exist to win discussions. It exists to keep several perspectives open at the same time, and here there is no ego, power or status.</p>
      <ul class="council-list">
        {council_items}
      </ul>
      <div class="minister">
        <h3>The Cosmos Minister's role</h3>
        <p>The Cosmos Minister is a moderator, not a guru. The role is to open the room, separate harm from shame, prevent dialogue from delaying protection, and close with clarity without pretending that everything has been solved.</p>
      </div>
    </section>

    <section class="envoys">
      <div>
        <p class="eyebrow">Special Envoys</p>
        <h2>Guest voices are called in when the question demands it.</h2>
      </div>
      <div class="envoy-grid">
        <article>
          <h3>The Ancestor</h3>
          <p>Used when the question needs historical memory: humans have tried this before. What have we forgotten?</p>
        </article>
        <article>
          <h3>The Living World</h3>
          <p>Used when the question concerns nature, climate, body, air, water, soil and ecological dependence.</p>
        </article>
      </div>
    </section>

    <section class="language" id="language">
      <div>
        <p class="eyebrow">Language</p>
        <h2>English is the master page. Other language paths should translate from English.</h2>
      </div>
      <div>
        <p>The Norwegian original is preserved as its own page. Automatic translations are available for access, but should be read as provisional until reviewed language editions exist.</p>
        <div class="language-links">
          <a href="no/">Norwegian original</a>
          <a href="https://translate.google.com/translate?sl=en&tl=zh-CN&u={language_url}" target="_blank" rel="noopener">Chinese</a>
          <a href="https://translate.google.com/translate?sl=en&tl=es&u={language_url}" target="_blank" rel="noopener">Spanish</a>
          <a href="https://translate.google.com/translate?sl=en&tl=hi&u={language_url}" target="_blank" rel="noopener">Hindi</a>
          <a href="https://translate.google.com/translate?sl=en&tl=ar&u={language_url}" target="_blank" rel="noopener">Arabic</a>
          <a href="https://translate.google.com/translate?sl=en&tl=fr&u={language_url}" target="_blank" rel="noopener">French</a>
          <a href="https://translate.google.com/translate?sl=en&tl=ru&u={language_url}" target="_blank" rel="noopener">Russian</a>
          <a href="https://translate.google.com/translate?sl=en&tl=uk&u={language_url}" target="_blank" rel="noopener">Ukrainian</a>
          <a href="https://translate.google.com/translate?sl=en&tl=am&u={language_url}" target="_blank" rel="noopener">Amharic</a>
        </div>
      </div>
    </section>

    <section class="manifest" id="manifest">
      <p class="eyebrow">Manifest</p>
      <h2>ReWorld should feel like a quiet council meeting.</h2>
      <p>The website should not primarily feel like an app, an AI product or a technology demonstration. It should feel like a quiet, serious and accessible room for questions people often avoid because they are too difficult, too political, too personal or too large.</p>
      <p>The language should be simple enough for young people to read, but deep enough for adults to stop. Hope comes after truth, not instead of truth.</p>
    </section>

    <section class="method" id="method">
      <p class="eyebrow">Behind the Council</p>
      <h2>The technology should be visible enough to be honest, and invisible enough for the text to work.</h2>
      <p>ReWorld is currently a static website with curated texts, book series, council meetings, manifest and method. The AI element is part of the artwork, but it should not steal the main role from the questions, the stories and the reader's own reflection.</p>
    </section>
  </main>

  <div class="book-modal" id="bookModal" aria-hidden="true">
    <div class="book-modal-backdrop" data-close-book></div>
    <section class="book-modal-dialog" role="dialog" aria-modal="true" aria-label="Open book">
      <button class="book-modal-close" type="button" data-close-book>Close</button>
      <div class="book-modal-content"></div>
    </section>
  </div>
  <button class="reader-button" type="button" aria-pressed="false" data-open-label="Reading mode" data-close-label="Exit reading mode">Reading mode</button>
  <script src="script.js"></script>
</body>
</html>
"""

    (OUT / "index.html").write_text(html, encoding="utf-8")


def main():
    render_no()
    render_en()


if __name__ == "__main__":
    main()
