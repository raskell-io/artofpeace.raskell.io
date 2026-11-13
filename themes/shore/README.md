# Shore

A Zola 0.22.1 theme for short books. Layout, Sass, reader controls, and print styles live here; the manuscript and its generator belong to the site.

The theme reads `data/book.json`. Its `sections` array contains `title`, `slug`, `roman`, `body`, and `passages`. A passage has an explicit `number` and Markdown `body`. Unnumbered opening and closing sections use `body`. Chapter pages select their section with `extra.book_index`.

The required configuration is `extra.author`, `author_url`, `author_id`, `edition`, and `subtitle`. A site provides its own favicon and `social.png`. The complete reading view and individual chapters use one shared rendering macro.

The Shoreline site frame and landing components live in `sass/_shoreline.scss`. The base template exposes `body_class`, `contents_link`, `footer_invitation`, and `footer_origin` blocks for the site's landing page. Book-specific introductory copy remains in the site templates. The shared footer uses `book.json`'s `passage_count` and `extra.footer_columns` (columns of groups with `title` and `items` containing `name` and `url`). `extra.footer_about` supplies the introduction. A site can override `partials/author-brand.html` and provide `extra.brand_styles` for its own author mark and type; `brand_id` distinguishes the header and footer SVG identifiers.

Reading works without JavaScript. The enhancement scripts provide a contents dialog, text size, appearance, optional local bookmarks, and print action. There are no network services, analytics, external fonts, or runtime package dependencies.

A site can supply `partials/chapter-art.html` for subject-specific SVG illustrations; the theme default is empty. Shared animation classes live in `sass/_chapter-art.scss`. `motion.js` manages the motion setting and pauses illustrations outside the viewport or in hidden tabs.
