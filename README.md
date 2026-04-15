# website

This is the source code for the DS@GT ARC website, built with [Hugo](https://gohugo.io/).

Currently we use the [Bear Blog](https://themes.gohugo.io/themes/hugo-bearblog/) theme.

## quickstart

First initialize the theme submodule:

```bash
git submodule update --init --recursive
```

### Docker workflow

This repo includes a Docker-based dev workflow with Hugo hot reload.

Start the local dev server:

```bash
docker compose up --build
```

Then open <http://localhost:1313>.

Useful Docker commands:

```bash
# production build into ./public
docker compose run --rm site hugo

# production-like build with cleanup/minification
docker compose run --rm site hugo --gc --minify

# initialize/update the theme submodule from the container
docker compose run --rm --entrypoint git site submodule update --init --recursive

# run on a different host port
HUGO_HOST_PORT=8080 SITE_BASEURL=http://localhost:8080/ docker compose up --build
```

Notes:
- the working tree is mounted into the container for live edits
- the entrypoint script is also mounted into the dev container, so changes to it do not require a rebuild during local iteration
- Hugo runs with polling enabled so file changes are detected reliably from Docker bind mounts
- if `themes/hugo-bearblog/` is empty, the container fails fast with a clear message

### Host workflow

If you prefer to run Hugo directly on your machine, install Hugo first (for example with `brew install hugo` or `sudo apt install hugo`) and then run:

```bash
hugo server -D
```

For a production build:

```bash
hugo
```

## notes

- https://themes.gohugo.io/themes/hugo-bearblog/
- https://gohugo.io/getting-started/quick-start/
- https://gohugo.io/host-and-deploy/host-on-github-pages/
