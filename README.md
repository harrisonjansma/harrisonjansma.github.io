# harrisonjansma.github.io

Source for my personal website, **[harrisonjansma.com](https://harrisonjansma.com)**.

A static site — hand-written HTML, CSS, and a little JavaScript — hosted on
GitHub Pages. It presents who I am and the work I've shipped as a Machine
Learning Engineer and Data Science Manager working in generative AI.

## Structure

| Page | File | Purpose |
| --- | --- | --- |
| Home | `index.html` | Intro, focus areas, skills, and selected work |
| About | `about.html` | Background, career timeline, and FAQ |
| Projects | `archive.html` | Project cards across GenAI, credit ML, and earlier work |
| Huck | `huckleberry.html` | Photos of the best dog in the world |

Styling starts from a [Colorlib](https://colorlib.com/wp/template/personal/)
"Personal" template (`css/main.css`, CC BY 3.0) with a modernization layer
layered on top in **`css/refresh.css`** — updated typography, color, and
component polish without rebuilding the underlying markup.

## Local preview

The site uses GitHub Pages "clean URLs" (links like `href="projects"` with no
`.html`). Use the included `serve.py`, which resolves those the same way Pages
does, so navigation works locally:

```bash
python3 serve.py 8000
# then open http://localhost:8000
```

A plain `python3 -m http.server 8000` also works, but extensionless nav links
(About, Projects, Huck, and the project detail pages) will 404 because it serves
paths literally.
