# Koricho — The crunch u will miss

First working version of Koricho's main brand website. A buildless static site: HTML, CSS, JavaScript, locally hosted GSAP, and locally hosted fonts.

## Run locally

Run `npm run dev` from this directory, then open http://127.0.0.1:4173. Run `npm run check` for the JavaScript syntax check. No dependency installation or compilation is required.

## Implemented

- Supplied logo and confirmed tagline, cream/cocoa brand direction.
- Responsive hero with scroll-linked food movement.
- Original automatic banana film: peel, slice, golden transformation, and chip-integrated lettering; separate desktop and mobile compositions. No pinned scroll distance.
- Illustrated lower-temperature/ingredient-care chapter, with source-linked research and no invented oil-reduction percentage.
- Automatic once-per-visit crunch animation on viewport entry, with optional synthesized sound, off by default.
- Fresh jackfruit origin composition, distinct from the catalog images.
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

## Revision 2 interaction details

The hero CTA was removed and replaced with a quiet editorial note. Each storytelling chapter now has distinct artwork. The banana film runs for approximately 6.6 seconds after its stage is at least 55% in view; leaving the scene pauses it, returning resumes it, and a manual pause/replay control remains available. Browser tab visibility also pauses/resumes the film. The crunch runs once when at least 65% of its stage is visible, leaving the chip broken. Reduced-motion mode shows the final banana composition immediately and omits the automatic crunch. Product cards/dialogs retain their original catalogue cutouts.
