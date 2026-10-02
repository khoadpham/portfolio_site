# Portfolio site

Static site, no build step.

- `index.html` is the portfolio and `about.html` is the About page.
- `ontra-ai-search-deck.html` is the Ontra AI Search case study slides.
- `prototypes/` holds the four prototypes linked from the deck (not indexed by search engines).
- `css/`, `js/`, and `images/` hold styles, the deck script, and WebP images.
- `_headers` sets security and caching headers (Cloudflare Pages and Netlify both read it).
- `robots.txt`, `sitemap.xml`, `404.html`, and `favicon.svg` round out the site.

To preview locally, open `index.html` in a browser. To deploy, point Cloudflare Pages or Netlify at this repo with no build command and the root folder as the output directory.
