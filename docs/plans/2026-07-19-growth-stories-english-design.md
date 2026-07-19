# Growth Stories English Edition Design

## Goal

Publish complete English editions of the four youth growth stories and make each article body follow the site's existing Chinese/English language switch.

The four stories are:

- Nate Shi — `it-takes-a-village`
- Ruorong Chen — `tea-connects-an-american-girl`
- Ruoyin Huang — `tea-kitchen-and-summer`
- Tianshi Zhang — `technology-ecology-stars`

The project letter, `summer-co-creation-camp-invitation`, remains unchanged.

## Editorial Direction

The English editions will use natural narrative English rather than literal sentence-by-sentence translation. Each translation must preserve the original facts, first-person perspective, emotional restraint, section order, quotations, and relationship between text and photographs.

Names and project terminology will be standardized as follows:

- 阿柑少年: R'gan Junior
- Nate: Nate Shi
- 陈若容: Ruorong Chen
- 黄若音: Ruoyin Huang
- 张天时: Tianshi Zhang

Chinese place names and community terms will be romanized or translated with brief contextual wording where needed for an international reader. The translation must not add achievements, claims, or biographical details that are absent from the source.

## Content Architecture

Each growth story keeps its existing Chinese HTML file and gains a parallel `.en.html` file. The English files preserve the same semantic markup, media order, media-group classes, image paths, width and height attributes, and lazy-loading behavior.

`VoiceStory.bodyHtml` becomes localized content with `zh` and `en` values. The four growth stories provide both values. The project letter may continue to use its Chinese body through a localized fallback so the type remains consistent.

`VoiceArticle` selects the correct body with the existing language context, sets the article body's `lang` attribute to `zh-CN` or `en`, and removes the notice that currently says the story is only available in Chinese.

## Translation Scope

The English edition includes:

- body paragraphs and headings;
- pull quotes and emphasized text;
- photo captions and dates;
- image alternative text;
- any inline labels that belong to the article content.

The cover metadata, title, description, author, and card labels already support both languages and may receive minor editorial corrections only when needed for consistency with the full translation.

## Presentation

The existing editorial layout is preserved. English and Chinese never appear together in the article body. Changing the global language switch immediately replaces the title, deck, byline, body, captions, image alternative text, source button, and next-story card without changing the URL.

## Verification

Automated tests will verify that:

- each of the four growth stories has a non-empty Chinese and English body;
- English mode renders representative English copy instead of the Chinese-only notice;
- Chinese mode continues to render the original Chinese copy;
- media groups and image references remain present for all four stories;
- the project letter remains functional.

The work is complete when the test suite, lint check, and production build pass and all four stories can switch between complete Chinese and English editions.
