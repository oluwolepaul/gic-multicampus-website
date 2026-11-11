# GIC Multi-campus Website

[Open the live website preview](https://oluwolepaul.github.io/gic-multicampus-website/) · [Website checks](https://github.com/oluwolepaul/gic-multicampus-website/actions)

Try switching campuses, filtering events, and opening ministry details. Run `node check-site.mjs` to validate the local page links and asset references.

A responsive church website that helps visitors explore campuses, events and ministries.

**HTML · CSS · JavaScript**

[Developer portfolio](https://github.com/oluwolepaul)

## Product features

- Campus discovery for Texas, New York and Lagos with distinct visitor actions.
- Campus-aware events with filters and flyer content.
- Ministry cards and detail dialogs with responsive layouts.
- Sermon discovery, giving links and contact journeys.

## Architecture

Static HTML pages → shared styling and JavaScript modules → campus/event data → external content and visitor actions.

## Code map

- `index.html`, `about.html` — core discovery pages
- `campus-data.js`, `event-data.js` — shared data
- `events.js`, `sermons.js` — feature modules
- `theme.css`, `site.css`, `site.js` — shared presentation
