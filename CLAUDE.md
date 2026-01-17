# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the website for **DS@GT Applied Research Competitions (ARC)**, a student-run research group at Georgia Tech. Built with Hugo static site generator using the hugo-bearblog theme, deployed via Cloudflare Pages to dsgt-arc.org.

## Common Commands

```bash
# Local development server (includes draft content)
hugo server -D

# Build production site (outputs to /public)
hugo
```

## Architecture

### Content Structure
- **`/content/`** - Markdown pages (homepage, publications, faq, recruitment pages, etc.)
- **`/data/publications.yml`** - Structured YAML database of all publications (2022-2025) with fields for title, authors, year, venue, URLs, abstract, keywords, and bibtex

### Custom Layouts
- **`/layouts/_default/publications.html`** - Single-column layout for publications page
- **`/layouts/partials/list-publications.html`** - Renders publications grouped by year and venue from YAML data
- **`/layouts/shortcodes/img.html`** - Custom image shortcode with auto-resizing and WebP conversion

### Assets
- **`/assets/css/custom.css`** - Custom styles for responsive videos, captioned images, and tables
- **`/assets/js/theme-toggle.js`** - JavaScript for light/dark theme switching
- **`/assets/images/`** - Images processed through Hugo's asset pipeline (optimized, fingerprinted)
- **`/static/`** - Static files copied as-is to build output

### Theme
Hugo-bearblog theme is managed as a git submodule in `/themes/hugo-bearblog/`. Customizations are made via layout overrides and custom CSS injection through `/layouts/partials/custom_head.html`.

### Light/Dark Mode Toggle
The site includes a theme toggle button in the header (upper right corner). Implementation:
- **`/layouts/partials/header.html`** - Contains the toggle button
- **`/assets/js/theme-toggle.js`** - Handles theme switching, persists preference in localStorage, and respects OS color scheme preference

## Key Workflows

### Adding Publications
Edit `/data/publications.yml` - add new entries at the top following the existing YAML schema. Publications automatically render on the publications page grouped by year and venue.

### Adding Content Pages
Create markdown files in `/content/` with TOML front matter (+++...+++). Use the archetype in `archetypes/default.md` as a template.

### Using Custom Image Shortcode
```markdown
{{< img src="/images/example.jpg" alt="Description" >}}
```
Images placed in `/assets/images/` are automatically optimized.
