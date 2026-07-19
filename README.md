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

It's fully static, so any static file server works:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```
