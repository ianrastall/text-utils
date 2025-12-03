# **Global Orthographic Standards: A Comprehensive Treatise on the Typographic, Historical, and Computational Dimensions of Quotation Marks**

## **Executive Summary: The Semiotics of Enclosure**

The graphic representation of direct speech, citation, and irony constitutes one of the most complex and fragmented domains of global typography. While the Latin alphabet provides a nearly universal substrate for Western communication, the auxiliary symbols used to demarcate "voice"—the quotation marks—exhibit a radical diversity that reflects centuries of diverging national print traditions, the mechanical constraints of the typewriter era, and the modern challenges of digital text encoding.

This report provides an exhaustive, expert-level analysis of the usage of "smart quotes" (typographically distinct, directional, and curved marks) versus "straight quotes" (vertical, nondirectional marks inherited from ASCII standards) across the world's major linguistic spheres. It explores the Unicode definitions, the precise spacing rules that govern readability, the nesting hierarchies used for complex citations, and the algorithmic logic employed by modern software to render these characters.

The distinction between the "straight quote" and the "smart quote" is not merely an aesthetic preference; it is a fundamental functional distinction in the architecture of digital text. Straight quotes (' and "), remnants of the mechanical typewriter's need to conserve physical keys, are ambiguous characters that serve multiple semantic roles—marking measurement, coding syntax, and speech. Smart quotes, by contrast, are specific Unicode characters that carry directionality (opening vs. closing) and are encoded to reflect the rich diversity of human typesetting history.1 This report argues that the correct deployment of these marks is a critical component of linguistic localization and professional typography.

## **I. The Anatomy of the Quotation: Glyphs, History, and Unicode**

To comprehend the fragmented landscape of international quotation, one must first deconstruct the glyphs themselves. Unlike alphabetic characters, which generally retain a stable phonetic value across languages (the letter 'm' represents a bilabial nasal sound in English, French, and German), quotation marks are abstract symbols whose function is entirely context-dependent. A glyph that signals the *end* of a conversation in Berlin may signal the *start* of one in London.

### **1.1 The Historical Evolution: From Diple to Guillemet**

The origin of the quotation mark lies in the ancient practice of textual annotation. In early Greek manuscripts, a symbol known as the *diple* (\>), resembling a sideways chevron, was used in the margins to draw attention to noteworthy passages. As the practice of manuscript copying evolved into the age of the printing press, these marginalia migrated into the text block itself to denote citations or direct speech.4

In the Romance languages (French, Italian, Spanish), this chevron shape evolved into the *guillemet*, named after the French printer Guillaume Le Bé, though he did not invent them. These marks (« and ») retained the angularity of the original *diple*.5 In the Germanic and Saxon traditions, the marks evolved differently, taking on the shape of commas suspended in the white space of the page, leading to the curved "speech marks" common in English and German today.

### **1.2 The "Smart" Quote Families**

The contemporary typographic landscape is dominated by three primary families of quotation marks, each defined by its visual form and historical lineage: the **Curved (Comma) Family**, the **Angular (Guillemet) Family**, and the **Corner Bracket Family**.6

#### **1.2.1 The Curved "Comma" Quotes**

These marks are the most recognizable in the Anglosphere, resembling commas or inverted commas. They are characterized by their "blob-like" head and a curved tail.

* **Upper 66 (“):** A double mark with the bulbs at the bottom and tails curving upward and to the left. Used as an opening quote in English and a closing quote in German.  
* **Upper 99 (”):** A double mark with the bulbs at the top and tails curving downward. Used as a closing quote in English and a universal quote in Swedish/Finnish.  
* **Lower 99 („):** A double mark placed on the baseline. Used as an opening quote in German, Polish, and Romanian.  
* **Upper 9 (’):** The standard closing single quote, which also serves as the typographic apostrophe.6

#### **1.2.2 The Angular "Guillemet" Quotes**

Distinguished by their geometric precision, these marks sit centered on the x-height of the typeface.

* **Left-Pointing («):** The standard opening mark in French, Italian, and Russian.  
* **Right-Pointing (»):** The standard closing mark in French, Italian, and Russian.  
* **Inverted Usage:** In German book typography, the direction is reversed, with » opening the quote and « closing it—a stylistic choice meant to draw the eye inward toward the text.

#### **1.2.3 The Corner Brackets**

Used primarily in East Asian typography, these brackets are designed to function within the grid-based layout of logographic scripts.

* **Left Corner Bracket (「):** Opening mark.  
* **Right Corner Bracket (」):** Closing mark.

### **1.3 Unicode Reference Table**

The following table details the primary Unicode codepoints relevant to smart quotation research. It is crucial to note that while the *characters* are standardized, their *usage* is defined by language-specific orthography.7

| Glyph | Unicode Name | Codepoint | Primary Usage Context |
| :---- | :---- | :---- | :---- |
| “ | LEFT DOUBLE QUOTATION MARK | U+201C | English Open, German Close |
| ” | RIGHT DOUBLE QUOTATION MARK | U+201D | English Close, Swedish/Finnish Open & Close |
| „ | DOUBLE LOW-9 QUOTATION MARK | U+201E | German/Polish/Romanian Open |
| « | LEFT-POINTING DOUBLE ANGLE QUOTATION MARK | U+00AB | French/Russian Open, German Close (Book) |
| » | RIGHT-POINTING DOUBLE ANGLE QUOTATION MARK | U+00BB | French/Russian Close, German Open (Book) |
| ‘ | LEFT SINGLE QUOTATION MARK | U+2018 | English Open (Single) |
| ’ | RIGHT SINGLE QUOTATION MARK | U+2019 | English Close (Single), Apostrophe |
| ‚ | SINGLE LOW-9 QUOTATION MARK | U+201A | German Open (Single) |
| ‹ | SINGLE LEFT-POINTING ANGLE QUOTATION MARK | U+2039 | French Secondary Open |
| › | SINGLE RIGHT-POINTING ANGLE QUOTATION MARK | U+203A | French Secondary Close |
| 「 | LEFT CORNER BRACKET | U+300C | CJK Open |
| 」 | RIGHT CORNER BRACKET | U+300D | CJK Close |

## **II. The Anglosphere: The Dominance of the 66-99 Standard and the Apostrophe Crisis**

In the English-speaking world, the standard for "smart quotes" is the usage of the upper-comma style marks. While the glyphs are shared, the specific application reveals a divide between the United States and the United Kingdom/Commonwealth, further complicated by the pervasive issue of "dumb" quotes in digital media.

### **2.1 The Transatlantic Divide: Hierarchy and Placement**

While both major dialects of English utilize the same character set, their preference for primary versus secondary quotes and their punctuation placement rules differ significantly, often causing friction in international publishing.

#### **2.1.1 United States: The Double Standard**

American English strictly prescribes **double quotation marks** (“...”) for the primary level of quotation. Single quotation marks (‘...’) are reserved exclusively for quotes within quotes (nested quotes).

* **The Typesetters' Rule:** A defining feature of American typography is the placement of periods and commas *inside* the closing quotation mark, regardless of the logical relationship between the punctuation and the quoted content.  
  * *Usage:* “The algorithm is flawed,” he said.  
  * *Rationale:* This convention dates back to the era of movable type. Period and comma pieces were small and fragile; placing them inside the larger, robust quotation mark piece protected them from damage during the layout and printing process.1

#### **2.1.2 United Kingdom: The Single Preference**

British English usage is more fluid. Historically, and in many contemporary book publishing houses (such as Oxford University Press), **single quotation marks** (‘...’) are preferred for the primary level, with double marks (“...”) used for nesting.

* **Logical Punctuation:** British English often employs "logical punctuation," where the period or comma sits *outside* the quotation marks unless it is part of the original quoted material.  
  * *Usage:* He called the method ‘flawed’.  
* **The Shift:** It is important to note that British newspapers and mass media are increasingly adopting the double-quote standard, likely due to the influence of American digital platforms and the visual weight double quotes provide in headline typography.10

### **2.2 The "Smart" vs. "Dumb" Quote Struggle**

A significant aspect of English typography—and indeed, global digital text—is the battle against "dumb quotes" (straight quotes). In high-quality typesetting, straight quotes (" and ') are considered orthographic errors. They are relics of the typewriter era, where physical space on the keyboard was limited, forcing the conflation of opening/closing quotes and the apostrophe into single keys.1

#### **2.2.1 The Apostrophe Ambiguity**

The apostrophe presents a unique challenge in English computing. Typographically, the apostrophe is identical to the closing single quote (’, U+2019). However, because keyboards output the straight single quote ('), software must algorithmically decide whether to convert it to an opening quote (‘) or a closing quote/apostrophe (’).

* **The Leading Apostrophe Error:** Algorithms typically assume a quote following a space is an *opening* quote. This fails when an apostrophe appears at the start of a word to indicate omitted letters, such as in *’Tis* (It is) or *’20s* (1920s).  
  * *Result:* Software incorrectly renders this as *‘Tis* (Opening quote), which is typographically wrong. The correct glyph is ’Tis (Closing quote/Apostrophe). This error is pervasive in digital content management systems and requires manual intervention or sophisticated OpenType context detection to fix.1

#### **2.2.2 The Measurement Conflict**

In engineering and geographic contexts, straight quotes are often used to represent feet (minutes) and inches (seconds).

* *Example:* 5' 11" (Five feet, eleven inches).  
* *Typographic Correctness:* Strictly speaking, these should be **primes** (′ U+2032 and ″ U+2033). However, primes are difficult to access on standard keyboards.  
* *The "Smartening" Hazard:* If a document containing measurements is passed through a "smart quote" algorithm, the software will often convert the measurements into speech marks, resulting in *5’ 11”*. This is incorrect and can cause confusion in technical specifications. Developers must explicitly disable smart quote replacement for code blocks and technical data.1

## **III. The Germanic Tradition: The Low-High Inversion and the "Möwchen"**

German typography presents one of the most complex landscapes for smart quotes in Europe. It is characterized by a "low-high" placement that is the inverse of the English visual standard, and a competing "chevron" style used in book printing that differs from the French standard.6

### **3.1 Standard German: The 99-66 Style (Gänsefüßchen)**

In standard German (Deutschland and Österreich), the most common form of quotation mark in handwriting, newspapers, and general education is the **Anführungszeichen**, affectionately known as *Gänsefüßchen* ("little geese feet").

* **The Mechanics:** The quote begins on the baseline with a "low 99" double comma („, U+201E) and ends at the cap-height with a "high 66" double comma (“, U+201C).  
* **Visual Logic:** „Text“.  
* **The Trap for Typesetters:** The closing character in German (“) is identical to the *opening* character in English. This leads to frequent errors by non-German designers who mistakenly use the English closing quote (”) to end a German quote. The result („Text”) is considered a typographic solecism in Germany (though standard in Poland).6

### **3.2 The "Möwchen" (Little Gulls): German Book Style**

In literary publishing (*Belletristik*) and high-end typography, German favors angular quotes. However, unlike the French style, German guillemets point **inwards** toward the text, creating a "containing" effect.

* **Opening:** Right-pointing double angle (», U+00BB).  
* **Closing:** Left-pointing double angle («, U+00AB).  
* **Visual Logic:** »Text«.  
* **Aesthetic Rationale:** Typographers argue that this style disrupts the vertical flow of the text less than the "high-low" comma style, which creates visual noise at the baseline. It is the preferred style for dense novels and philosophical texts.10

### **3.3 The Swiss German Exception: A Unified Standard**

Switzerland sits at the intersection of German, French, and Italian linguistic spheres. To navigate this multilingual environment, Swiss typography developed a unified standard that defies the rules of its German neighbor.

* **The Style:** Swiss German uses guillemets for all quotation.  
* **The Direction:** Unlike Germany, Swiss guillemets point **outwards**, identical to the French style.  
* **Visual Logic:** «Text».  
* **Comparison:**  
  * Germany (Book): »Text« (Inward)  
  * Switzerland: «Text» (Outward)  
  * Standard German: „Text“ (Low-High)  
    This distinction is rigorously maintained in Swiss media (e.g., Neue Zürcher Zeitung). Using "German style" quotes for a Swiss audience is considered a hallmark of poor localization and a failure to respect Swiss cultural identity.10

## **IV. The Romance Sphere: The Reign of the Guillemet and the Space**

The *Guillemet* is the defining quotation mark of the Romance languages, though the influence of English digital dominance is eroding its usage in informal contexts. The critical differentiator in this region is not just the glyph, but the **spacing** around it.5

### **4.1 French: The Syntax of Spacing (L'Espace Fine)**

French typography is unique in its rigorous spacing rules. The *Imprimerie Nationale* prescribes that guillemets must be separated from the enclosed text by a space. This is not merely an aesthetic choice but a grammatical one.

* **Glyphs:** « (U+00AB) and » (U+00BB).  
* **Spacing Rule:** A quotation is formatted as « Text », not «Text».  
* **The Technical Challenge:** Technically, the space used must be a **non-breaking space** (NBSP, U+00A0) or, preferably, a **narrow non-breaking space** (NNBSP, U+202F, *espace fine insécable*).  
  * *Why?* A standard space (U+0020) might allow the closing guillemet to wrap to the next line alone, or the opening guillemet to sit at the end of a line, separating it from the text it introduces. The non-breaking space prevents this "orphaning."  
  * *Digital Consequence:* Many word processors automatically insert a standard NBSP (U+00A0) when a user types a guillemet in French mode. However, typographic purists argue for the "thin space" (U+202F). This character is often missing in basic fonts or unavailable on mobile keyboards, leading to inconsistent rendering where the space appears too wide, creating "gappy" text.21

### **4.2 Italian: Tradition vs. Modernity**

Italian typography traditionally uses the *caporali* (guillemets, «...»). This remains the standard for printed books and major newspapers like *Corriere della Sera*.

* **Digital Drift:** In online media and informal writing, Italian has seen a significant shift toward English-style double quotes (“...”) or even straight quotes. This is largely driven by keyboard layouts; the standard Italian keyboard does not have dedicated keys for « and », forcing users to use Alt-codes or autocorrect features.  
* **Nesting:** When nesting is required, Italian typically employs double quotes inside guillemets: «Il disse: “Vado via”». This differs from the French usage of single guillemets (‹...›) for secondary quotes.14

### **4.3 Spanish: The RAE vs. The Internet**

The *Real Academia Española* (RAE) strictly recommends the use of angular quotes («...») as the primary symbol for Spain and Latin America.

* **Hierarchy:**  
  1. Latin/Spanish quotes (*comillas latinas*): «...»  
  2. English double quotes (*comillas inglesas*): “...”  
  3. Single quotes (*comillas simples*): ‘...’  
* **Usage:** *«Antonio me dijo: “Vaya 'cacharro' que se ha comprado Julián”».*  
* **Current Trend:** Despite RAE recommendations, English-style quotes are pervasive in Latin American digital media and increasingly common in Spain. Major newspapers like *El País* have shifted towards English quotes in headlines to save horizontal space, influencing the reading habits of the public.10

### **4.4 Portuguese: The Transatlantic Divide**

Portuguese exhibits a clear split between its European and American variants, mirroring the divergence seen in other aspects of the language.

* **European Portuguese (Portugal):** Adheres to the angular tradition «...». Similar to Spanish and Italian conventions, quoting in Portugal is a matter of *caporali*.26  
* **Brazilian Portuguese:** Has largely adopted the English double quote style “...” as the primary standard.  
  * *Reasoning:* The influence of American typewriter layouts and early computer systems in Brazil was stronger than in Portugal. Consequently, the guillemet is now considered obsolete in Brazil, appearing only in very specific decorative or archaic contexts.26

## **V. The Nordic and Finno-Ugric Anomalies: The "99-99" Phenomenon**

Scandinavian and Finnish typography presents some of the most idiosyncratic usage of smart quotes in the world, specifically the usage of the "Closing Quote" for both opening and closing.

### **5.1 Swedish and Finnish: The "Right-Right" Convention**

In Swedish and Finnish, the standard "smart" quote usage involves utilizing the **closing** English quote (Right Double Quotation Mark, U+201D, ”) for **both** the opening and the closing of the quote. This is often referred to as the "99-99" style.

* **Glyphs:** ” (U+201D) opens, ” (U+201D) closes.  
* **Visual Logic:** ”Text”.  
* **Philosophical Rationale:** This convention simplifies the visual flow. By avoiding the "low" quotes of German (which interfere with the baseline) or the "66" of English (which create visual asymmetry), the "99-99" style offers a clean, modernist aesthetic often associated with Nordic functionalism.  
* **Variation:** Finnish sometimes utilizes guillemets (»...»), referencing a right-pointing convention for both opening and closing. This is considered archaic or decorative but is still understood.14

### **5.2 Norwegian: The Guillemet Stronghold**

Unlike its Swedish neighbor, Norway strongly favors the guillemet («...»), creating a sharp typographic border in Scandinavia.

* **Usage:** «Text».  
* **Handwriting vs. Print:** While Norwegians may use the 99-66 (German style) or generic straight quotes in handwriting („...“), professional typesetting strictly demands guillemets.  
* **Spacing:** A crucial distinction from French is that Norwegian quotes do **not** take extra spaces inside the marks. It is «Text», not « Text ». This absence of space aligns Norwegian visually with Swiss German rather than French.31

### **5.3 Danish: The Germanic Influence**

Danish follows the German "book style" (inward pointing guillemets »...«) or the German low-high style („...“) depending on the publisher. This distinguishes it clearly from the Swedish ”...” and the Norwegian «...». The choice often depends on the formality of the text, with »...« preferred in literature.35

## **VI. Central and Eastern Europe: The Slavic Mixed Zone**

The Slavic languages and their neighbors utilize a mix of French and German influences, often resulting in complex nesting rules and the usage of the "Polish Style" (99-99 with low opening).

### **6.1 Polish: The 99-99 Low-High Standard**

Polish typography utilizes a unique combination that visually resembles the German opening but the English closing (or, more accurately, a specific Polish closing).

* **Standard Usage:** Open „ (U+201E, low 99\) and Close ” (U+201D, high 99).  
* **The Conflict:** This differs from German, which closes with the high 66 (“). Polish uses the English closing quote glyph ” but pairs it with the German opening glyph „.  
* **Visual Logic:** „Text”.  
* **Nesting:** For secondary quotes, Polish typically uses French guillemets «...» (outward pointing).10

### **6.2 Romanian: Official vs. Digital**

Romanian typography officially recognizes the „...“ (99 low, 99 high) style, effectively identical to the Polish standard.

* **Glyphs:** „ (U+201E) and ” (U+201D).  
* **Historical Note:** Snippets indicate the Romanian Academy officially recognizes this version. However, due to font limitations in the early digital era, straight quotes or incorrect German quotes („...“) are often found.  
* **Nesting:** Romanian uses French guillemets «...» for the secondary level, creating a hierarchy of „...«...»...”.4

### **6.3 Russian and the Cyrillic Sphere**

Russian typography is heavily standardized around the guillemet. This is likely a legacy of the 18th and 19th-century French cultural influence on the Russian court and academia, which was codified into Soviet typographical standards.

* **Primary Level:** Guillemets «...» (outward pointing).  
* **Secondary Level (Nested):** German-style "paws" „...“ (low 99, high 66).  
* **Nesting Example:** «Kirill said: „I am reading Pushkin.“»  
* **Spacing:** Like Norwegian and Swiss German, Russian guillemets do not use spaces. «Text» is the correct form.  
* **Handwriting:** In handwriting, Russians typically use the „...“ style because guillemets are difficult to write cursively. This creates a disconnect where the handwritten form differs from the printed form.4

### **6.4 Dutch: A Case Study in Typographic Anarchy**

The Dutch language presents a fascinating case of non-standardization. Snippets indicate a chaotic mix of styles in the Netherlands and Belgium.

* **The Styles:**  
  1. English High-High: “...” or ‘...’ (Increasingly common in digital media and general fiction).  
  2. German Low-High: „...“ or „...” (Traditional, used in older books and some newspapers like *NRC Handelsblad*).  
  3. Guillemets: «...» (Rare in the Netherlands, more common in Belgium due to French influence).  
* **The Trend:** There is a strong drift toward the English single or double quote ’...’ or ”...” as the de facto standard, driven by the English-centric nature of Dutch digital culture.11

## **VII. East Asian Logographic Systems (CJK): Vertical Origins**

Chinese, Japanese, and Korean (CJK) scripts originated in vertical writing traditions (Tategaki), which necessitated different punctuation marks. While horizontal writing is now the norm for web and business, the punctuation retains unique characteristics, particularly the "Full-width" sizing and the usage of "Corner Brackets".7

### **7.1 The Corner Bracket System (Kagi-kakko)**

The primary quotation marks in Traditional Chinese and Japanese are the **Corner Brackets** (Hook Brackets).

* **Glyphs:** 「 (U+300C) and 」 (U+300D).  
* **Double Brackets:** Used for nested quotes or book titles. 『 (U+300E) and 』 (U+300F).  
* **The Rotation Factor:** These characters are designed to work in both vertical and horizontal text.  
  * *Horizontal:* 「Text」  
  * *Vertical:* The brackets automatically rotate or are designed to frame the vertical column from the top-right and bottom-left.  
* **Why not Curly Quotes?** Western curly quotes “ and ” do not rotate well. When rotated 90 degrees for vertical text, they look like floating commas and lose their "enclosing" visual gestalt. This is why 「...」 remains dominant in regions that retain strong vertical writing cultures.41

### **7.2 Chinese: The Simplified vs. Traditional Split**

A major divergence exists between Simplified Chinese (Mainland China) and Traditional Chinese (Taiwan/Hong Kong/Macau) regarding quotation marks in horizontal text.

* **Simplified Chinese (Horizontal):** Has largely adopted Western-style "smart quotes."  
  * *Primary:* “... ” (Double quotes).  
  * *Secondary:* ‘...’ (Single quotes).  
  * *Note:* These are "Full-width" versions (“ U+201C and ” U+201D), meaning they occupy the same square space as a Hanzi character to maintain grid alignment.  
* **Traditional Chinese:** Retains the Corner Brackets 「...」 as the primary standard for *both* horizontal and vertical text. Western quotes are rare in formal typesetting in Taiwan and Hong Kong, viewed as a Mainland or Western imposition.4

### **7.3 Japanese: Strict Adherence**

Japanese adheres strictly to Corner Brackets (「...」) for dialogue and quotations in both orientations.

* **Novelty Usage:** Western-style quotes (“...”) are sometimes used for aesthetic effect in headlines or to denote foreign concepts, but 「 remains the grammatical standard.  
* **Spacing:** Punctuation in Japanese takes a full em-square. Therefore, a quote 「 is not just a line; it includes the whitespace buffer around it to ensure character spacing remains uniform. Using a Western half-width quote “ in Japanese text disrupts the grid (*genkō yōshi*) and is considered a typesetting error.41

### **7.4 Korean: A Hybrid System**

Korean usage is influenced by both traditional Chinese conventions and modern Western/American standards, as well as the political divide between North and South.

* **South Korea:** Generally uses Western-style double quotes “...” for dialogue and single quotes ‘...’ for thoughts or emphasis. However, corner brackets 「...」 are frequently used in legal texts, academic lists, and to denote artistic works (similar to how italics are used for titles in English).47  
* **North Korea:** Typically uses guillemets 《...》 (Double Angle Brackets) for primary quotations, a usage distinct from the South and likely influenced by Soviet/Russian orthography conventions during the mid-20th century.49

## **VIII. The Technography of Quotation: Algorithms and Encoding**

Understanding the glyphs is only half the battle; the "How" of smart quotes lies in the software algorithms that replace user input. This is where the conflict between the "dumb" typewriter keyboard and the "smart" typographic screen plays out.

### **8.1 The "Smartening" Algorithm**

Keyboards generally do not have dedicated keys for “, ”, «, or „. Users type the generic straight quote ("). Word processors (Microsoft Word, Google Docs, Adobe InDesign) intercept this keystroke and apply logic to substitute a smart quote.

**The Basic Logic:**

1. **Detection:** The software listens for the " keystroke.  
2. **Context Check:**  
   * If the quote follows a **space** or a **dash** or the **start of a paragraph**, it is assumed to be an **Opening Quote**.  
   * If the quote follows a **letter**, **number**, or **punctuation mark**, it is assumed to be a **Closing Quote**.  
3. **Language Check:** The software checks the document's language metadata (e.g., lang="de").  
   * If en-US: Insert “ (Open) or ” (Close).  
   * If de-DE: Insert „ (Open) or “ (Close).

**The Failure Cases:**

* **The "Rock 'n' Roll" Error:** When an apostrophe is used to truncate the start of a word (*'n'*), the algorithm sees a space before the apostrophe and inserts an *opening* single quote (‘n’). The correct glyphs are closing quotes/apostrophes (’n’). This is widely seen in amateur typography (e.g., *‘Tis the season* instead of *’Tis the season*).  
* **Language Mismatch:** If a user types German text in a document set to "English," the software will insert English quotes “... ” instead of German „... “. This is a common issue in multilingual documents where the language tag is not updated for specific paragraphs.2

### **8.2 Full-Width Forms and Unicode Normalization**

In CJK computing, users may accidentally type "Full-width" quotes (＂, U+FF02) instead of standard quotes. These look identical to straight quotes but are much wider and are distinct Unicode characters.

* *U+FF02 FULLWIDTH QUOTATION MARK:* ＂  
* *U+0022 QUOTATION MARK:* "

**The Search Engine Problem:** Search engines and databases often struggle with these distinctions. A query for "Smart Quotes" (using ASCII quotes) might not match a document containing "Smart Quotes" (using Curly quotes) or ＂Smart Quotes＂ (using Full-width quotes).

* **Solution:** Backend systems must employ "Unicode Normalization" (specifically NFKC \- Normalization Form Compatibility Composition) to fold all these variants into a canonical form for indexing, while preserving the correct display form for the user.12

### **8.3 Programming and Syntax Errors**

In programming languages (Python, Java, JSON), the straight quote (" or ') is a syntactic delimiter for strings.

* **The "Copy-Paste" Bug:** A developer copying code from a blog post or a Word document that has been "smartened" will paste curly quotes (“ and ”) into their IDE.  
* **The Crash:** Most compilers do not recognize curly quotes as valid string delimiters. The code will fail with a "Syntax Error" or "Invalid Character" error.  
* **Mitigation:** Technical writers must disable smart quotes in their editors or use code blocks that enforce a monospace font and disable typographic replacements.1

## **IX. Summary Data Tables**

The following tables synthesize the primary and secondary usage conventions discussed, serving as a quick reference for localization experts.

### **Table 9.1: Primary Quotation Marks by Language**

| Language | Primary Opening | Primary Closing | Visual Style | Unicode Sequence |
| :---- | :---- | :---- | :---- | :---- |
| **English (US)** | “ | ” | 66-99 High | U+201C... U+201D |
| **English (UK)** | ‘ | ’ | 6-9 High | U+2018... U+2019 |
| **German (Std)** | „ | “ | 99-66 Low-High | U+201E... U+201C |
| **German (Book)** | » | « | Chevrons In | U+00BB... U+00AB |
| **Swiss German** | « | » | Chevrons Out | U+00AB... U+00BB |
| **French** | « | » | Chevrons Spaced | U+00AB \+ NBSP... NBSP \+ U+00BB |
| **Italian** | « | » | Chevrons Out | U+00AB... U+00BB |
| **Spanish** | « | » | Chevrons Out | U+00AB... U+00BB |
| **Polish** | „ | ” | 99-99 Low-High | U+201E... U+201D |
| **Romanian** | „ | ” | 99-99 Low-High | U+201E... U+201D |
| **Russian** | « | » | Chevrons Out | U+00AB... U+00BB |
| **Swedish/Finn** | ” | ” | 99-99 High-High | U+201D... U+201D |
| **Norwegian** | « | » | Chevrons Out | U+00AB... U+00BB |
| **Japanese** | 「 | 」 | Corner Brackets | U+300C... U+300D |
| **Chinese (Trad)** | 「 | 」 | Corner Brackets | U+300C... U+300D |
| **Chinese (Simp)** | “ | ” | 66-99 High (Full) | U+201C... U+201D |

### **Table 9.2: Secondary (Nested) Quotation Marks**

| Language | Secondary Open | Secondary Close | Notes |
| :---- | :---- | :---- | :---- |
| **English (US)** | ‘ | ’ | Single quotes inside double. |
| **English (UK)** | “ | ” | Double quotes inside single. |
| **German** | ‚ | ‘ | Single low-9 opening, single high-6 closing. |
| **French** | ‹ | › | Single guillemets (often unsupported, replaced by “...”). |
| **Russian** | „ | “ | German-style "paws" used inside guillemets. |
| **Polish** | « | » | French-style guillemets used inside paws. |
| **Japanese** | 『 | 』 | White corner brackets inside hollow corner brackets. |

## **X. Conclusion: The Future of the Quote**

The landscape of quotation marks is a testament to the resilience of local typographic cultures against the homogenizing force of globalized technology. While the ASCII "straight quote" threatens to standardize punctuation into a single ambiguous vertical bar, the continued use of Guillemets in Russia and Norway, the 99-99 style in Sweden, and the Corner Brackets in Asia demonstrates that orthography is deeply tied to national identity.

For editors, developers, and designers, "Smart Quotes" are not merely a formatting option but a requirement for literacy in a given script. The "Straight Quote" is a tool of the programmer; the "Smart Quote" is the tool of the writer. Understanding that a German closing quote is an English opening quote, or that a French quote requires a specific type of whitespace, is essential for professional communication in a multilingual world. As digital platforms become more sophisticated, we can expect—and should demand—that our tools respect these differences, preserving the visual richness of human language in the digital age.

#### **Works cited**

1. Straight and curly quotes \- Butterick's Practical Typography, accessed December 2, 2025, [https://practicaltypography.com/straight-and-curly-quotes.html](https://practicaltypography.com/straight-and-curly-quotes.html)  
2. What are curly quotes and can I use them in my code? \- Unix & Linux Stack Exchange, accessed December 2, 2025, [https://unix.stackexchange.com/questions/704762/what-are-curly-quotes-and-can-i-use-them-in-my-code](https://unix.stackexchange.com/questions/704762/what-are-curly-quotes-and-can-i-use-them-in-my-code)  
3. Quotation marks and apostrophes \- Iljitsch van Beijnum, accessed December 2, 2025, [http://www.iljitsch.com/article.php?id=1112](http://www.iljitsch.com/article.php?id=1112)  
4. Quotation mark \- Wikipedia, accessed December 2, 2025, [https://en.wikipedia.org/wiki/Quotation\_mark](https://en.wikipedia.org/wiki/Quotation_mark)  
5. Guillemet \- Wikipedia, accessed December 2, 2025, [https://en.wikipedia.org/wiki/Guillemet](https://en.wikipedia.org/wiki/Guillemet)  
6. Manual: Quotation Marks \- type.today, accessed December 2, 2025, [https://type.today/en/journal/quotes](https://type.today/en/journal/quotes)  
7. Unicode.Category.QuoteMarks \- Hexdocs, accessed December 2, 2025, [https://hexdocs.pm/ex\_unicode/Unicode.Category.QuoteMarks.html](https://hexdocs.pm/ex_unicode/Unicode.Category.QuoteMarks.html)  
8. ASCII and Unicode quotation marks, accessed December 2, 2025, [https://www.cl.cam.ac.uk/\~mgk25/ucs/quotes.html](https://www.cl.cam.ac.uk/~mgk25/ucs/quotes.html)  
9. Quotation marks \- EU Vocabularies \- Publications Office of the EU \- European Union, accessed December 2, 2025, [https://op.europa.eu/en/web/eu-vocabularies/formex/physical-specifications/character-encoding/quotation-marks](https://op.europa.eu/en/web/eu-vocabularies/formex/physical-specifications/character-encoding/quotation-marks)  
10. Map of quotation marks in European languages \- Jakub Marian, accessed December 2, 2025, [https://jakubmarian.com/map-of-quotation-marks-in-european-languages/](https://jakubmarian.com/map-of-quotation-marks-in-european-languages/)  
11. Map: How to use quotation marks : r/europe \- Reddit, accessed December 2, 2025, [https://www.reddit.com/r/europe/comments/9sblqs/map\_how\_to\_use\_quotation\_marks/](https://www.reddit.com/r/europe/comments/9sblqs/map_how_to_use_quotation_marks/)  
12. The “Smart Quote” Struggle | MSK Library Blog, accessed December 2, 2025, [https://library.mskcc.org/blog/2023/11/the-smart-quote-struggle/](https://library.mskcc.org/blog/2023/11/the-smart-quote-struggle/)  
13. What are smart quotes and why are they better than normal quotes? : r/writing \- Reddit, accessed December 2, 2025, [https://www.reddit.com/r/writing/comments/5eo55e/what\_are\_smart\_quotes\_and\_why\_are\_they\_better/](https://www.reddit.com/r/writing/comments/5eo55e/what_are_smart_quotes_and_why_are_they_better/)  
14. Use of quotation marks in the different languages \- EU Vocabularies, accessed December 2, 2025, [https://op.europa.eu/en/web/eu-vocabularies/formex/physical-specifications/character-encoding/use-of-quotation-marks-in-the-different-languages](https://op.europa.eu/en/web/eu-vocabularies/formex/physical-specifications/character-encoding/use-of-quotation-marks-in-the-different-languages)  
15. Grimm Grammar : punctuation : Die Zeichensetzung \- COERLL, accessed December 2, 2025, [https://coerll.utexas.edu/gg/pr/mis\_01.html](https://coerll.utexas.edu/gg/pr/mis_01.html)  
16. Quotation marks : r/German \- Reddit, accessed December 2, 2025, [https://www.reddit.com/r/German/comments/nvr6us/quotation\_marks/](https://www.reddit.com/r/German/comments/nvr6us/quotation_marks/)  
17. What is the correct way to denote a quotation in German? \- German \- Stack Exchange, accessed December 2, 2025, [https://german.stackexchange.com/questions/117/what-is-the-correct-way-to-denote-a-quotation-in-german](https://german.stackexchange.com/questions/117/what-is-the-correct-way-to-denote-a-quotation-in-german)  
18. Working with Swiss Standard German text as a British designer | on-IDLE Blog, accessed December 2, 2025, [https://www.on-idle.com/blog/view/working-with-swiss-standard-german-text-as-a-british-designer](https://www.on-idle.com/blog/view/working-with-swiss-standard-german-text-as-a-british-designer)  
19. Double quotes in Switzerland for German texts (Guillemets/Gänsefüsschen), accessed December 2, 2025, [https://german.stackexchange.com/questions/1858/double-quotes-in-switzerland-for-german-texts-guillemets-g%C3%A4nsef%C3%BCsschen](https://german.stackexchange.com/questions/1858/double-quotes-in-switzerland-for-german-texts-guillemets-g%C3%A4nsef%C3%BCsschen)  
20. Understanding and Using Italian Quotation Marks (Fra Virgolette) \- ThoughtCo, accessed December 2, 2025, [https://www.thoughtco.com/fra-virgolette-italian-quotation-marks-2011397](https://www.thoughtco.com/fra-virgolette-italian-quotation-marks-2011397)  
21. Non-breaking space \- Wikipedia, accessed December 2, 2025, [https://en.wikipedia.org/wiki/Non-breaking\_space](https://en.wikipedia.org/wiki/Non-breaking_space)  
22. Why non-blanking spaces rendered as gray background? \- \#18 by rhimbo \- Ask LibreOffice, accessed December 2, 2025, [https://ask.libreoffice.org/t/why-non-blanking-spaces-rendered-as-gray-background/74422/18](https://ask.libreoffice.org/t/why-non-blanking-spaces-rendered-as-gray-background/74422/18)  
23. No-break space and narrow no-break space are replaced by space \- Discourse Meta, accessed December 2, 2025, [https://meta.discourse.org/t/no-break-space-and-narrow-no-break-space-are-replaced-by-space/169410](https://meta.discourse.org/t/no-break-space-and-narrow-no-break-space-are-replaced-by-space/169410)  
24. Spaces after « and before » should be nobreak in french · Issue \#1920 · typst/typst \- GitHub, accessed December 2, 2025, [https://github.com/typst/typst/issues/1920](https://github.com/typst/typst/issues/1920)  
25. 8.14 French and foreign-language quotations \- The Canadian Style \- TERMIUM Plus® \- Oficina de Traducciones, accessed December 2, 2025, [https://www.btb.termiumplus.gc.ca/tcdnstyl-chap?lang=spa\&lettr=indx204\&info0=8.14](https://www.btb.termiumplus.gc.ca/tcdnstyl-chap?lang=spa&lettr=indx204&info0=8.14)  
26. In what ways does Portuguese punctuation differ from that of English (if at all)? \- Quora, accessed December 2, 2025, [https://www.quora.com/In-what-ways-does-Portuguese-punctuation-differ-from-that-of-English-if-at-all](https://www.quora.com/In-what-ways-does-Portuguese-punctuation-differ-from-that-of-English-if-at-all)  
27. Guidance for Portuguese, Brazilian \- Proton Localization Community, accessed December 2, 2025, [https://localize.proton.me/t/guidance-for-portuguese-brazilian/116](https://localize.proton.me/t/guidance-for-portuguese-brazilian/116)  
28. Type of Quotation Marks Used in European Languages \[OC\] \[1000x696\] \- Reddit, accessed December 2, 2025, [https://www.reddit.com/r/MapPorn/comments/73blps/type\_of\_quotation\_marks\_used\_in\_european/](https://www.reddit.com/r/MapPorn/comments/73blps/type_of_quotation_marks_used_in_european/)  
29. Appendix:Finnish punctuation \- Wiktionary, the free dictionary, accessed December 2, 2025, [https://en.wiktionary.org/wiki/Appendix:Finnish\_punctuation](https://en.wiktionary.org/wiki/Appendix:Finnish_punctuation)  
30. Quotation marks by European country \[2048x1289\] : r/MapPorn \- Reddit, accessed December 2, 2025, [https://www.reddit.com/r/MapPorn/comments/46pvrn/quotation\_marks\_by\_european\_country\_2048x1289/](https://www.reddit.com/r/MapPorn/comments/46pvrn/quotation_marks_by_european_country_2048x1289/)  
31. NTNU English Style Guide, accessed December 2, 2025, [https://www.ntnu.edu/english-matters/ntnu-english-style-guide](https://www.ntnu.edu/english-matters/ntnu-english-style-guide)  
32. Norwegian Keyboard gives different character when press shift+2 (Requires " but get Double greater than symbol) Works fine in Note Pad .Does Not give desired character in Office 365 application \- Microsoft Learn, accessed December 2, 2025, [https://learn.microsoft.com/en-us/answers/questions/4912510/norwegian-keyboard-gives-different-character-when](https://learn.microsoft.com/en-us/answers/questions/4912510/norwegian-keyboard-gives-different-character-when)  
33. Who do you guys use « » instead of “ ” ? : r/Norway \- Reddit, accessed December 2, 2025, [https://www.reddit.com/r/Norway/comments/111n98z/who\_do\_you\_guys\_use\_instead\_of/](https://www.reddit.com/r/Norway/comments/111n98z/who_do_you_guys_use_instead_of/)  
34. How do quotation marks work? : r/norsk \- Reddit, accessed December 2, 2025, [https://www.reddit.com/r/norsk/comments/1kntwz2/how\_do\_quotation\_marks\_work/](https://www.reddit.com/r/norsk/comments/1kntwz2/how_do_quotation_marks_work/)  
35. Can someone explain quotation marks and why they're always different for some reason?, accessed December 2, 2025, [https://www.reddit.com/r/writing/comments/15xfgvj/can\_someone\_explain\_quotation\_marks\_and\_why/](https://www.reddit.com/r/writing/comments/15xfgvj/can_someone_explain_quotation_marks_and_why/)  
36. Dumb quotes... or maybe they are just smart-ass quotes \- Miloush.net, accessed December 2, 2025, [http://archives.miloush.net/michkap/archive/2007/02/20/1724946.html](http://archives.miloush.net/michkap/archive/2007/02/20/1724946.html)  
37. Style / Language / Romanian \- MusicBrainz, accessed December 2, 2025, [https://musicbrainz.org/doc/Style/Language/Romanian](https://musicbrainz.org/doc/Style/Language/Romanian)  
38. Is the quotation mark correct : r/learndutch \- Reddit, accessed December 2, 2025, [https://www.reddit.com/r/learndutch/comments/1p0sfas/is\_the\_quotation\_mark\_correct/](https://www.reddit.com/r/learndutch/comments/1p0sfas/is_the_quotation_mark_correct/)  
39. Map of quotation marks in European languages : r/MapPorn \- Reddit, accessed December 2, 2025, [https://www.reddit.com/r/MapPorn/comments/9ilz7o/map\_of\_quotation\_marks\_in\_european\_languages/](https://www.reddit.com/r/MapPorn/comments/9ilz7o/map_of_quotation_marks_in_european_languages/)  
40. CJK Symbols and Punctuation \- Wikipedia, accessed December 2, 2025, [https://en.wikipedia.org/wiki/CJK\_Symbols\_and\_Punctuation](https://en.wikipedia.org/wiki/CJK_Symbols_and_Punctuation)  
41. Japanese punctuation \- Wikipedia, accessed December 2, 2025, [https://en.wikipedia.org/wiki/Japanese\_punctuation](https://en.wikipedia.org/wiki/Japanese_punctuation)  
42. 9 Key Japanese Punctuation Marks That Will Make a Statement \- Rosetta Stone Blog, accessed December 2, 2025, [https://blog.rosettastone.com/japanese-punctuation/](https://blog.rosettastone.com/japanese-punctuation/)  
43. Horizontal and vertical writing in East Asian scripts \- Wikipedia, accessed December 2, 2025, [https://en.wikipedia.org/wiki/Horizontal\_and\_vertical\_writing\_in\_East\_Asian\_scripts](https://en.wikipedia.org/wiki/Horizontal_and_vertical_writing_in_East_Asian_scripts)  
44. Simplified vs. Traditional Chinese \- Eriksen Translations, accessed December 2, 2025, [https://eriksen.com/language/simplified-vs-traditional-chinese/](https://eriksen.com/language/simplified-vs-traditional-chinese/)  
45. All About Common Chinese Punctuation Marks \- ThoughtCo, accessed December 2, 2025, [https://www.thoughtco.com/chinese-punctuation-marks-2279717](https://www.thoughtco.com/chinese-punctuation-marks-2279717)  
46. Japanese Punctuation \- The Definitive Guide \- Tofugu, accessed December 2, 2025, [https://www.tofugu.com/japanese/japanese-punctuation/](https://www.tofugu.com/japanese/japanese-punctuation/)  
47. Korean Punctuation \- Essential Writing Symbols, accessed December 2, 2025, [https://www.90daykorean.com/korean-punctuation/](https://www.90daykorean.com/korean-punctuation/)  
48. Calcification on the use of 『 』,《》,「 」 : r/Korean \- Reddit, accessed December 2, 2025, [https://www.reddit.com/r/Korean/comments/rgyz3m/calcification\_on\_the\_use\_of/](https://www.reddit.com/r/Korean/comments/rgyz3m/calcification_on_the_use_of/)  
49. An Introduction to Korean Punctuation | FluentU, accessed December 2, 2025, [https://www.fluentu.com/blog/korean/korean-punctuation/](https://www.fluentu.com/blog/korean/korean-punctuation/)  
50. GREP French or Strait quotes into to Smart or Curly quotes \- Adobe Community | Inspiration, Tutorials & Resources, accessed December 2, 2025, [https://community.adobe.com/t5/indesign-discussions/grep-french-or-strait-quotes-into-to-smart-or-curly-quotes/m-p/14131486](https://community.adobe.com/t5/indesign-discussions/grep-french-or-strait-quotes-into-to-smart-or-curly-quotes/m-p/14131486)  
51. Converting ″Straight Quotes″ to “Curly Quotes” \- Stack Overflow, accessed December 2, 2025, [https://stackoverflow.com/questions/2202811/converting-straight-quotes-to-curly-quotes](https://stackoverflow.com/questions/2202811/converting-straight-quotes-to-curly-quotes)  
52. “＂” U+FF02 Fullwidth Quotation Mark Unicode Character \- Compart, accessed December 2, 2025, [https://www.compart.com/en/unicode/U+FF02](https://www.compart.com/en/unicode/U+FF02)  
53. Replacing smart quotes and smart apostrophies (Java in General forum at Coderanch), accessed December 2, 2025, [https://coderanch.com/t/752481/java/Replacing-smart-quotes-smart-apostrophies](https://coderanch.com/t/752481/java/Replacing-smart-quotes-smart-apostrophies)