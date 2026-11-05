# Koricho — The crunch u will miss

First working version of Koricho's main brand website. A buildless static site: HTML, CSS, JavaScript, locally hosted GSAP, and locally hosted fonts.

## Run locally

Run `npm run dev` from this directory, then open http://127.0.0.1:4173. Run `npm run check` for the JavaScript syntax check. No dependency installation or compilation is required.

## Implemented

- Supplied logo and confirmed tagline, cream/cocoa brand direction.
- Responsive hero with scroll-linked food movement.
- Pinned banana-to-slices sequence; separate desktop and mobile choreography.
- Illustrated vacuum-frying chapter, with a moving sweet-potato chip and vapour motif.
- Click-to-crunch chip animation with optional synthesized sound, off by default.
- Scroll-driven jackfruit fan reveal.
- Three interactive product cards and accessible native product dialogs.
- Mobile navigation, contact telephone links, keyboard controls, reduced-motion support and persisted motion preference.
- Local WebP imagery, GSAP and fonts; no runtime dependency on a third-party CDN.

## Content status

The exact approved tagline is “The crunch u will miss”. This supersedes the alternative taglines in the supplied reference artwork and the earlier planning document.

The website uses concise draft marketing copy based on the three products and startup context supplied in chat, and Kochi/contact information from the supplied visiting card. Replace or expand the company story when the owner supplies final content.

Generated food assets are concept visuals. See ASSETS.md for the final prompt set and source provenance. Actual product/pack photographs, final ingredient lists, nutrition, allergens, pack sizes, and substantiated manufacturing/quality details remain to be supplied. No oil-reduction percentages, certifications, reviews, or nutritional claims have been invented.

Ecommerce, payments, order management, and checkout are outside this main-website phase. Product CTAs currently lead to telephone enquiries.

## Publishing

Site identity and static output directory are tracked in `.openai/hosting.json`. Use the Sites source and deployment workflow for this same project on subsequent edits; preserve the existing project ID and audience.

## Fonts and libraries

Bricolage Grotesque, DM Sans, Instrument Serif: local font files; their OFL licenses are included in `dist/assets/`. GSAP 3.14.2 and ScrollTrigger 3.14.2 are locally hosted. See their embedded license headers and https://gsap.com/standard-license/.
