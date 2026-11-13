# The Art of Peace UX design proposals

## Direction

Keep the warm paper, dark ink, serif typography, sea-green accent, and quiet horizon. The visual direction is working. I would now give the book an interaction that grows from its subject: people can stay with a thought, question it, and bring another thought alongside it.

My recommendation is **Proposal 3, Passages in conversation**, supported by the restrained navigation in **Proposal 1, The open book**. This makes the book's tensions tangible while preserving a comfortable reading experience. Readers can consider a principle together with the passage that qualifies it, then return to their place.

The four proposals below represent different priorities. Each can stand on its own. The examples use the [current manuscript](../manuscript.md); new interface wording and editorial connections are proposed additions. This document is for design review, before changing the reader.

## What feels generic today

The current experience has a title page, a chapter list, a contents drawer, previous and next links, and reading preferences. Those are useful foundations, but nearly all would work unchanged for any short book.

The manuscript gives us more specific possibilities:

| Character of this book | Opportunity for the experience |
| --- | --- |
| Short, numbered passages | Let a reader stay with, cite, or return to a particular thought |
| Principles that limit one another | Place related passages in conversation |
| Freedom to disagree | Give questioning a place without demanding public participation |
| Practical attention to difficult encounters | Offer a few deliberate paths through a reader's situation |
| The morning swim and the shore | Use the horizon as a quiet aid to orientation |

I would make these choices visible through behaviour. Adding decorative controls or renaming familiar buttons would contribute less.

## Proposal 1 The open book

### The experience

The reader feels that they have opened a particular volume and can find their way around it. The experience is continuous and spacious, with a small amount of orientation in the margins.

On entering the book, the large title page gives way to the opening text. A narrow chapter guide sits beside the reading column on a wide screen. Its thirteen positions are labelled with Roman numerals, and the current chapter is identified in words. The thin horizon becomes a locator with thirteen positions, replacing the current percentage-like progress line.

These positions show where the reader is. They do not mark chapters as completed. Reaching the end of a page says little about whether a thought has been understood.

On a phone, a single line above the text reads **III · On boundaries**. Tapping it opens the existing contents drawer. There is no miniature diagram squeezed beside the paragraphs.

### A reader journey

A reader follows a link to III.5. The passage is positioned below the header, with its chapter title visible. Its numeral is a clear link control. A compact action labelled **Keep my place here** is available beside the reference, with the browser-only storage explanation at the moment it is used.

On returning to the title page, the reader sees **Return to III.5** and a short excerpt. They can also begin again. The saved place does not take over the page or redirect them automatically.

At the end of the chapter, the next chapter's name and first sentence appear together. This provides a literary transition instead of an isolated navigation button. The sentence is taken from the manuscript.

### Sketch

```text
The Art of Peace                         Contents   Aa

I
II       CHAPTER III
III      On boundaries
IV
…        III.5                       Keep my place here
         A shared boundary needs a shared hearing.
         The fence between two gardens ...

         III.6
         Explain the purpose of a rule ...

         Continue with On strength
         Cultivate enough strength to protect a refusal.
```

### What makes it specific

The numbered passages become the reader's handles on the book. The shore motif helps locate a chapter, and a remembered sentence becomes the way back into the text.

### Tradeoffs and limits

This is the smallest departure from the current experience. It improves the sense of a volume and makes returning more deliberate, but it contributes less to the book's intellectual character than Proposal 3.

The margin must remain quiet. Current-chapter labels should update without repeated screen-reader announcements, and every marker must also be an ordinary chapter link. Keep native scrolling and browser history. Physical page-turn effects, scroll snapping, and timed transitions would make this short book harder to move through.

**First prototype:** one chapter, a direct link to III.5, explicit place keeping, and the transition into Chapter IV. Relative implementation effort is small to moderate, using the existing templates and storage behaviour.

## Proposal 2 Ways through the book

### The experience

Readers can enter with a question as well as through the first chapter. A secondary title-page link, **Find a way in**, opens a short list of situations. Each leads to an authored sequence of three or four passages across the book.

These paths give a reader several things to consider. They do not diagnose their circumstances or promise a resolution. A reader can inspect the complete sequence before beginning and leave it at any point.

### Four possible paths

| Reader's entry | Passage sequence | Purpose |
| --- | --- | --- |
| Before a difficult conversation | VIII.1 → V.4 → VIII.3 → IX.2 | Clarify the purpose, understand the concern, examine the need, and slow an irreversible response |
| When disagreement feels personal | II.4 → III.2 → III.4 | Separate scrutiny of a claim, freedom of conscience, and conduct that threatens someone |
| After a promise has been broken | VII.6 → VII.8 → XII.5 | Examine the failure, pace trust according to conduct, and look for evidence of change |
| When a relationship must change | II.8 → XII.6 → XII.4 | Consider separation, settle obligations, and distinguish repair from forgiveness |

The passage order is an editorial choice to review. Each path also links to the surrounding chapters, so a selected passage remains part of the book.

### A reader journey

Someone chooses **Before a difficult conversation**. They see the four passage references and a short introduction explaining the sequence. VIII.1 appears first, in the ordinary reading typography. Below it, a sentence connects the next step: **Now consider how the other person understands the matter.**

The reader can continue to V.4, open VIII.1 in its chapter, or return to the path overview. At the end, the sequence simply ends. It does not ask whether the reader has successfully resolved their problem.

### Sketch

```text
Before a difficult conversation
Four passages to consider

VIII.1     V.4     VIII.3     IX.2

Before a difficult meeting, decide what must
be protected and what you are merely accustomed
to possessing. ...

Read in On diplomacy

Now consider how the other person understands
the matter.

Continue to V.4                         All four passages
```

### What makes it specific

This gives the strategic side of the book a practical form. Chapter boundaries become permeable, and the author can guide a reader through the relationship between several principles.

### Tradeoffs and limits

The risk is making the book feel like a collection of remedies. Keep paths few, thoughtfully named, and secondary to reading the book. Do not ask a reader to describe a personal dispute in a form. Do not generate a path from inferred emotions or browsing history.

Paths require editorial maintenance when passages change. Their introductions must remain visibly separate from the manuscript, and their links must preserve the reader's return to the path. On mobile, use a short vertical sequence rather than a horizontally scrolling carousel.

**First prototype:** the difficult-conversation path, with its four passages and a complete-sequence view. Relative implementation effort is moderate; editorial judgment is the larger ongoing responsibility.

## Proposal 3 Passages in conversation

### The experience

At a few carefully chosen passages, the margin offers **Read beside** followed by another passage's reference and a short description. Opening it brings the second passage alongside the first, with a sentence explaining why the author has connected them.

This is the strongest expression of the book's central idea. A reader can hold two concerns together without being asked to flatten either into a slogan.

### Three example conversations

| First passage | Read beside | The connection to examine |
| --- | --- | --- |
| III.2, the reach of a personal boundary | III.4, the difference between criticism and intimidation | Freedom of conscience and protection from threatening conduct both need attention |
| V.4, understanding another person's concern | V.5, recognising deliberate harm | Understanding can guide protection without requiring an innocent explanation |
| X.1, remaining open to correction | X.7, persisting in a well-founded objection | Humility can involve changing a judgment or continuing to question the group |

The descriptions in this table are editorial summaries. In the interface, the book passages themselves appear in full and retain their references.

### A reader journey

A reader reaches III.2, which says that personal discomfort does not confer authority over another person's conscience. Beside the passage is **Read beside III.4 · When conduct becomes threatening**.

Opening the connection reveals III.4. A small heading, **Why these belong together**, introduces this proposed editorial note:

> A boundary can overreach. A threat can also hide behind a claim of free inquiry. Consider what the person is doing, and whose freedom the response would restrict.

On a wide screen, the second passage occupies a margin panel while the first remains readable at its original width. If there is not enough room, the panel becomes an inline section below the original passage. On a phone, it always opens inline. Closing it restores focus to its trigger and leaves the reading position intact.

### Sketch

```text
On boundaries

III.2                              READ BESIDE
Your body, attention, and           III.4
private life are yours to govern.   When conduct becomes threatening
Your discomfort does not grant
you the same authority over         Distinguish an unwelcome opinion
another person's conscience. ...    from a threat ...

                                   Why these belong together
                                   [A short editorial connection]

                                   Read in chapter     Close
```

### What makes it specific

The interface participates in the argument. It gives a principle its necessary companion at the moment a reader might otherwise take it too far. This suits both the practical precision and the reflective quality of the manuscript.

### Tradeoffs and limits

The chief risk is overexplaining the book. Start with three connections across the entire manuscript. Do not attach a related-content block to every passage. The connection is an invitation; the surrounding text remains complete without opening it.

Pairs should be named for the question they illuminate. Avoid labelling every pair as opposing views or implying that a harmful action deserves equal standing with an objection to it. These particular pairings explore qualifications within the author's own thought.

A shared link to a pair should open a dedicated static page containing both passages and the editorial note. The marginal panel is an enhancement of that link. Browser Back, ordinary link sharing, keyboard use, and reading without JavaScript therefore retain a clear destination.

**First prototype:** III.2 beside III.4, including desktop, mobile, the dedicated pair page, and return to the original passage. Relative implementation effort is moderate. The continuing cost is selecting and writing a small number of worthwhile connections.

## Proposal 4 The reader's margin

### The experience

The book leaves a private space for the reader's own thought. Beside each passage, a quiet **Leave a thought** action opens a plain text field. The prompt is deliberately open: **What would you add, question, or try?**

The reader can also keep a passage without writing. A **Your margin** view gathers their saved passages and notes, with links back to the surrounding text. This becomes their own way of returning to the book.

### A reader journey

At IV.4, a reader considers how they respond when someone refuses their invitation. They write a sentence about something they want to notice in their own conduct. They save it and continue reading.

At X.7, they write an objection to the passage. The interface treats this exactly like the earlier note. There is no agreement score, sentiment label, or request to justify dissent.

On a later visit, **Your margin** shows both entries. The reader can edit or delete a note, open the original passage, or export their collection as Markdown. Deleting a note offers a short-lived Undo action.

### Sketch

```text
IV.4
When you hold power, give people a way to decline
your invitation. Then observe how you treat the
first person who uses it.

Leave a thought                         Keep this passage

What would you add, question, or try?
[                                                      ]
[                                                      ]

Saved on this device only. Browser data can be cleared.
Save thought                                      Cancel
```

### What makes it specific

The reader can disagree without becoming a public participant or asking the author for permission. The experience gives practical form to the book's invitation to keep what helps and question what does not.

### Tradeoffs and limits

This adds the greatest responsibility. Notes may be personal. Browser storage is not an encrypted private vault, and it may be lost when browser data is cleared. Explain those limits when someone first saves a thought. Provide export, individual deletion, and a clear way to erase the collection. Nothing should be sent to a server.

Store a passage reference, its edition, and a copy of the quoted text with each note. If a later manuscript changes the passage, retain the reader's original context and label the difference. Avoid silently attaching an old objection to new wording.

The default reading view stays quiet: no empty text fields under every paragraph. On mobile, a note opens immediately below its passage. With JavaScript unavailable, the whole book remains readable and downloadable; notes are an optional enhancement.

**First prototype:** one passage, note entry, a saved-margin view, export, and deletion. Relative implementation effort is the largest of the four, especially once edition changes and data loss are handled properly.

## Comparing the directions

| Direction | Main reader benefit | Distinctive moment | Principal risk | Relative effort |
| --- | --- | --- | --- | --- |
| 1 The open book | Comfortable reading and an exact way back | Returning through a remembered sentence | Remaining close to a conventional reader | Small to moderate |
| 2 Ways through the book | Finding relevant passages from a question | Crossing chapters along an authored path | Suggesting simple remedies for complex situations | Moderate |
| 3 Passages in conversation | Seeing a principle together with its limits | Holding two passages beside one another | Excessive commentary interrupting the text | Moderate |
| 4 The reader's margin | Keeping a personal response, including disagreement | Returning to one's own unfinished thought | Personal-data loss and editing complexity | Larger |

The effort descriptions are relative to the existing Zola site. They are not delivery estimates.

## Recommended first direction

I would lead with **Passages in conversation** and borrow two improvements from **The open book**: a clear current-chapter label and an explicit **Keep my place here** action. Keep the existing typography, colours, title composition, and continuous reading as the foundation.

The first design would have one central addition: III.2 can be read beside III.4. Extend that pattern to the other two pairings only after the first works comfortably on a phone and at enlarged text sizes.

I would introduce **Ways through the book** later if readers want help finding a passage from a situation. I would hold **The reader's margin** for a deliberate decision about personal note keeping. Combining every proposal now would create more interface than this short book needs.

## Implementation shape

Keep Zola and mise. The manuscript remains the sole source of book text. Add a small authored data file for pairings or paths, containing passage references, a title, and a short editorial explanation. The generator resolves those references against the manuscript and rejects missing ones.

Generate dedicated pair or path pages as ordinary HTML. The same content can be opened inline through a modest JavaScript enhancement. Keep the established chapter URLs and passage identifiers valid, and provide a direct return to the original reading context. Pair pages cite the book's current edition; a future public edition needs a stable revision identifier.

The book-specific connections and wording belong with the site. Reusable reading controls and panel behaviour belong in Shore. Reader notes, if chosen later, stay outside generated content, discovery files, and shared URLs.

## How to review the first prototype

Review it with these concrete tasks rather than a general request for impressions:

1. Open a direct link to III.2, identify the chapter, and continue reading.
2. Open III.4 beside it, explain why the two are connected, and return to exactly where you were.
3. Share the pair, then open the shared link in a fresh browser context.
4. Keep a place, leave the book, and return without searching for the passage.
5. Repeat the reading and comparison on a narrow phone screen, with enlarged text, and using only the keyboard.
6. Open the chapter and pair with JavaScript disabled; the complete text and ordinary navigation should remain available.

The first prototype succeeds if a reader can discover the relationship without a tutorial and can ignore it without losing anything essential. If the comparison makes the text harder to follow, shorten its commentary or move it to a dedicated page.

## Decision for the next build

Choose the experience to emphasise: a volume to inhabit, a manual to consult, principles to examine together, or a place to keep a personal response.

My choice is **principles to examine together**. It gives this book a recognisable interaction rooted in its own argument, while keeping the freedom to read in a simple, uninterrupted way.
