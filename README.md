# rmarston.com — Personal Portfolio

Personal career website for Robert Marston, DevOps Engineer & Cloud Architect.  
Live at **[rmarston.com](https://rmarston.com)** · Hosted on GitHub Pages · Edge-routed via Cloudflare.

## Stack

| Layer | Technology |
|---|---|
| Site | Static HTML/CSS (single-page portfolio) |
| Hosting | GitHub Pages |
| Domain | Cloudflare DNS + CNAME |
| Edge | Cloudflare Worker (`worker/index.ts`) |

## Local Development

Open `index.html` directly in a browser — no build step required for the portfolio page.

The `src/` directory contains a legacy Bootstrap/Pug build system (Start Bootstrap "Clean Blog" template) that is no longer used for the main site.

## Cloudflare Worker

The worker in `worker/index.ts` handles domain-level redirects.  
Deploy with [Wrangler](https://developers.cloudflare.com/workers/wrangler/):

```bash
npm install -g wrangler
wrangler deploy
```

## Contact

- Email: [marstonr6@gmail.com](mailto:marstonr6@gmail.com)
- LinkedIn: [linkedin.com/in/robertmarston](https://www.linkedin.com/in/robertmarston)
- GitHub: [github.com/marzton](https://github.com/marzton)
