# The Art of Peace web edition

## Proposed experience

I would present the book at **artofpeace.raskell.io** as a quiet place for reading. The reader enters through a simple title page and can begin immediately, choose a chapter, or resume where they left off. The text should feel complete and finite, with a visible ending and enough space to pause.

The book's opening and closing return to Nago Bay. I would carry that connection into the design with a fine horizon line, warm paper, dark ink, and a restrained blue-green accent. The prose supplies the imagery. A generous reading column and careful typography should provide most of the visual character.

This document proposes a format. The address is a proposed destination; this work does not establish that it is configured or serving a website.

## The opening screen

Use the title, author, one short description, and a clear reading link:

> THE ART OF PEACE
>
> raskell
>
> On living together without thinking alike.
>
> Begin reading
>
> Contents

Place a thin horizon above or below the title. On a small screen, the beginning of the opening should be within easy reach. Keep the title page compact enough that it welcomes a returning reader as well as a first visit.

Show “First manuscript” quietly while the text remains in review. Identify a published revision with a date once a public edition exists.

## Reading and navigation

Make continuous scrolling the default. A short book benefits from letting a reader move at their own pace, stop midway through a passage, or read several chapters without an interruption. Add generous space at chapter boundaries and modest space between numbered passages.

Use a narrow header containing the title and a Contents control. The contents drawer lists the opening, all thirteen chapters, and the closing. Chapter links also work as ordinary links when scripting is unavailable. At a chapter's end, offer the next chapter and a return to contents.

Each passage gets a quiet reference such as **III.5** and a stable link, for example `/on-boundaries/#p5`. Readers can share a passage with its context and navigate onward. Keep the source numbering explicit, so a future edit cannot silently give an existing reference to a different passage. Once a public edition is cited, retain its text at an edition URL when a substantial revision is published.

Offer a complete-book route, `/read/`, alongside the chapter routes. Both views are generated from the same manuscript. The same passage should be addressable in the continuous view, for example `/read/#iii-5`.

An optional local bookmark can offer “Continue with On sharing” on a later visit. The reader controls whether a position is remembered and can clear it. Basic reading requires no account or saved data.

## Typography and colour

Use a literary serif for the body, with clear punctuation and comfortable lowercase forms. Use a restrained companion face for controls and passage numbers. Choose the actual font after comparing several chapters on desktop and phone; preserve a good system-font fallback.

Start with a body size near 20 pixels, line height near 1.65, and a column of roughly 60 characters. Allow readers to enlarge the text. On narrow screens, keep usable side margins and let paragraphs reflow naturally. Avoid justified text.

Proposed palette:

| Use | Light appearance | Dark appearance |
| --- | --- | --- |
| Background | Warm paper `#F5F1E8` | Deep ink `#171D1D` |
| Body text | Ink `#263332` | Warm paper `#EEEAE1` |
| Links and focus accents | Bay green `#35665F` | Pale sea green `#A2C9BF` |

Verify contrast in the implementation, including subdued labels and focus indicators. Respect the reader's preferred appearance and offer a small manual control. Decorative motion is unnecessary; any added transition should respect reduced motion.

## Reader controls

Keep the useful controls close and few: contents, text size, appearance, and a passage-link action. Give every control a text label accessible to assistive technology. A selected passage remains ordinary selectable text, with a nearby link back to its chapter.

Use semantic headings and a main reading region, a skip link, visible keyboard focus, and keyboard access to the contents drawer. Check that enlarging text never hides controls or forces horizontal reading. Avoid imposing timed transitions, automatic page turns, or a custom scroll mechanism.

The book can end with a quiet invitation to send a thoughtful response through the author's existing contact page. A discussion interface would require its own editorial and moderation decisions; it need not stand between the reader and the text.

## Editions and discovery

Generate the website, plain Markdown, and eventual EPUB and print PDF from the same source. The print edition can give each chapter a fresh page while keeping passages intact wherever practical. Confirm the page count after typesetting; the current manuscript does not imply an 80-page or 120-page edition.

Include an About page with the Nago Bay origin, author, literary influences, and edition information. Decide the public licence with the author before adding reuse terms. The text should be easy to read and cite whether or not a reader uses the visual interface.

When implementing, follow the existing raskell.io project instructions: readable HTML without JavaScript, a description and social card, real `robots.txt`, `sitemap.xml`, and `llms.txt` files, Book metadata naming the author as `https://raskell.io/#person`, and a quiet author link back to raskell.io. Register the book once in the main site's project data when a real destination is ready.

## First design to review

Start by rendering the title page and **On difference**. That chapter includes both short and longer passages, and its subject establishes the book's purpose. Review it at phone and desktop widths, with enlarged text and both colour appearances. Then extend the accepted design across the complete manuscript.

The first review should answer one question: does the page make it easy to stay with a thought? Its success depends on the reading experience, the chapter transitions, and the clarity of the words.
