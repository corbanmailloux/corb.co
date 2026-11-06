# AGENTS.md

Personal site for Corban Mailloux (corb.co): a Hugo static site using the PaperMod theme, built and deployed by Netlify. There is no JS package manager, test suite, linter, or typechecker — the Hugo build is the verification.

## Commands

- Preview locally with drafts: `hugo server -D` (without `-D`, drafts are omitted).
- Production build, matching Netlify: `hugo --gc --minify`
- After a fresh clone, if `themes/PaperMod` is empty: `git submodule update --init --recursive`
- Create a post bundle with the post archetype: `hugo new content posts/<slug>`
  - Pass the directory, **not** `posts/<slug>/index.md`; the latter silently uses `archetypes/default.md` and omits cover/categories.

## Hugo and toolchain gotchas

- Site config is `hugo.yml` (not `config.toml`/`config.yml`). Pinned Hugo versions in `netlify.toml`; match that version locally to avoid build differences.
- This repo uses Hugo's newer underscore template directories: `layouts/_partials`, `layouts/_shortcodes`, `layouts/_markup`. Add new overrides there; Hugo 0.169 still maps legacy `layouts/partials/...` paths, but don't mix both conventions.
- `themes/PaperMod` is a pinned git submodule. Do not edit it — override templates under `layouts/` or add CSS to `assets/css/extended/custom.css` (PaperMod automatically concatenates every file in that directory).
- `public/`, `resources/`, and `.hugo_build.lock` are generated and git-ignored. Never edit or commit them.

## Content conventions

- Posts are leaf bundles: `content/posts/<slug>/index.md` with images beside it. Set `cover.relative: true` and reference the image by filename.
- Follow `archetypes/posts/index.md` for front matter (`description`, `summary`, `cover`, `tags`, `categories: ["Projects"]`). Preserve `aliases` when changing a post URL; existing posts keep old `/projects/...` URLs this way.
- Custom shortcodes:
  - `{{< banner color="blue" >}}...{{< /banner >}}` — `red` is the default.
  - `{{< fontawesome github >}}` — positional icon name; renders the theme's inline SVG.
  - `{{< image src="..." alt="..." >}}` — raw `<img>`; `src` is required, and `alt`/`class`/`width`/`height`/`title`/`loading` are optional.
  - PaperMod's `figure` and `youtube` shortcodes are also available.
- `layouts/_markup/render-link.html` opens every `http(s)` link in a new tab; don't add `target="_blank"` to Markdown links manually.
- `hugo.yml` enables `markup.goldmark.renderer.unsafe`, so raw HTML in content is rendered.

## Layout

- `hugo.yml` — site config, menus, PaperMod profile mode and cover behavior.
- `content/posts/` — project write-ups as page bundles; `content/about/`, `content/archives.md`, and `content/search.md` are the other pages.
- `layouts/` — local template overrides and shortcodes.
- `static/` — served as-is at the site root (icons, images, resume, `.well-known`).
