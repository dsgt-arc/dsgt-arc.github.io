# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) and other coding agents when working in this repository.

## Project Overview

This is the website for **DS@GT Applied Research Competitions (ARC)**, a student-run research group at Georgia Tech. It is a **Hugo** static site using the **hugo-bearblog** theme, with local layout overrides and custom assets. The site is deployed to **Cloudflare** for the `dsgt-arc.org` domain.

## Common Commands

```bash
# Initialize the theme submodule after cloning
git submodule update --init --recursive

# Local development server (includes draft content)
hugo server -D

# Build production site (outputs to /public)
hugo
```

## Local Setup Requirements

Before doing any meaningful work locally:

1. Install **Hugo**.
2. Initialize the theme submodule:
   ```bash
   git submodule update --init --recursive
   ```

Without the submodule, `themes/hugo-bearblog/` will be empty and the site will not render correctly.

## Architecture

### Site Configuration
- **`/hugo.toml`** - Main Hugo configuration
  - `baseURL = "https://dsgt-arc.org/"`
  - theme is `hugo-bearblog`
  - the top nav is partly driven by front matter (`menu = 'main'`) and partly by explicit menu config
  - Goldmark is configured with `unsafe = true`, so raw HTML in markdown is allowed
- **`/wrangler.toml`** - Cloudflare deployment configuration; static assets are served from `./public`

### Content Structure
- **`/content/`** - Markdown pages (homepage, publications, FAQ, recruitment pages, history, impact, contact)
- **`/archetypes/default.md`** - Default TOML front matter template for new content

Most pages are standard Hugo content pages with TOML front matter such as:

```toml
+++
title = 'Page Title'
menu = 'main'
weight = 10
+++
```

Navigation order is generally controlled by `weight`.

### Data-Driven Content
- **`/data/publications.yml`** - Structured YAML database of publications

Publication entries may include:
- title
- authors
- year
- venue
- short_venue
- url_paper
- url_code
- url_slides
- abstract
- keywords
- bibtex

### Custom Layouts and Overrides
These files override or extend the Bear Blog theme:

- **`/layouts/_default/publications.html`** - Custom layout for the publications page
- **`/layouts/partials/list-publications.html`** - Renders publications grouped by year and venue from YAML data
- **`/layouts/partials/custom_head.html`** - Injects custom CSS and JS through Hugo's asset pipeline
- **`/layouts/partials/header.html`** - Custom header including the theme toggle button
- **`/layouts/shortcodes/img.html`** - Custom image shortcode with resize and WebP conversion

When editing shared UI, check whether behavior comes from the theme or from one of these local overrides.

### Assets
- **`/assets/css/custom.css`** - Custom styles for theme colors, responsive videos, captioned images, and tables
- **`/assets/js/theme-toggle.js`** - JavaScript for light/dark theme switching
- **`/assets/images/`** - Images processed through Hugo's asset pipeline
- **`/static/`** - Static files copied as-is into the final build

## Theme

The Hugo theme is managed as a git submodule:
- **`/themes/hugo-bearblog/`**

Important notes:
- The theme directory may appear empty in a fresh clone until submodules are initialized.
- Local files under `/layouts/` and `/assets/` are the first places to check before changing theme behavior directly.

## Deployment

The repository is configured for deployment via **Cloudflare**.

- Hugo builds the site into **`/public`**.
- `wrangler.toml` points Cloudflare at `./public`.
- Custom domain routing is configured for:
  - `dsgt-arc.org`
  - `www.dsgt-arc.org`

There is currently **no in-repo GitHub Actions deployment workflow**, so do not assume CI-based deployment from `.github/workflows/`.

## Key Workflows

### Adding or Editing Content Pages
Create or edit markdown files in `/content/`.

Use TOML front matter and, when appropriate:
- `menu = 'main'` to place the page in navigation
- `weight = ...` to control nav ordering

Because Hugo is configured with `goldmark.renderer.unsafe = true`, raw HTML such as embedded iframes may be used in markdown content.

### Adding Publications
Edit:
- **`/data/publications.yml`**

Add new entries near the top using the existing schema.

Important caveat:
- **`/layouts/partials/list-publications.html` currently hardcodes the years 2025, 2024, 2023, and 2022.**
- If a new publication year is added to the YAML file, the template must also be updated or those entries will not render.

### Using the Custom Image Shortcode
Use:

```markdown
{{< img src="/images/example.jpg" alt="Description" >}}
```

Images should live in:
- **`/assets/images/`**

The shortcode resolves the asset with Hugo resources and applies resizing/conversion.

## Light/Dark Mode Toggle

The site includes a theme toggle button in the header.

Relevant files:
- **`/layouts/partials/header.html`** - Toggle button markup
- **`/assets/js/theme-toggle.js`** - Theme state handling, localStorage persistence, and OS preference support
- **`/assets/css/custom.css`** - CSS variables for light/dark palettes

Behavior summary:
- theme preference is stored in `localStorage`
- OS preference is respected by default
- the active theme is set via `data-theme` on the root `<html>` element

## Known Repo Quirks

- **`/CNAME`** and **`/static/CNAME`** both exist.
  - `static/CNAME` is the file Hugo will publish into the built site.
  - The root-level `CNAME` may be redundant.
- The repo name is `dsgt-arc.github.io`, but deployment is currently configured around a custom domain on Cloudflare rather than GitHub Pages.
- The README still references older GitHub Pages-related Hugo docs; current deployment config lives in `wrangler.toml`.

## Practical Guidance for Agents

When making changes:
- Prefer editing files under `/content/`, `/data/`, `/layouts/`, and `/assets/` before touching the theme submodule.
- If a UI change does not appear, check whether a local layout override is shadowing the theme.
- If publication data is updated but the page does not change, inspect `layouts/partials/list-publications.html` for hardcoded year logic.
- If the site fails to render locally, verify Hugo is installed and the theme submodule is initialized.
