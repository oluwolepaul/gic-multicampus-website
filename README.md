# GIC Multi-campus Website

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
- `images/` — supplied visual assets

## Run locally

Serve the repository directory with a static HTTP server, then open `index.html`. For example, with Python installed: `python -m http.server 8080`. Review external links and campus/event details before deployment. Content is a dated snapshot and must be maintained.

## Status and limitations

This repository contains the website implementation from the local project record. Static hosting is sufficient. Any external forms, giving destinations or media services retain their own availability and configuration requirements.

## Engineering discussion

This project provides examples of connecting user journeys to data, handling state and failure paths, and working within platform constraints. It was developed with AI-assisted tooling. Features are described from source and project records; unmeasured business outcomes, usage counts and performance claims are intentionally omitted.

## Rights and configuration

Published with the project owner's permission. Brand assets and third-party components retain their respective rights. See any included license and third-party notices. Public visibility does not grant a new license to third-party artwork or content. Runtime credentials and private customer information are not included.

This portfolio snapshot uses optimized copies of the site's images to keep the repository lightweight.
