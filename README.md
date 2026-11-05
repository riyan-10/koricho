# Koricho — The crunch u will miss

First working version of Koricho's main brand website. A buildless static site: HTML, CSS, JavaScript, locally hosted GSAP, and locally hosted fonts.

## Run locally

Run `npm run dev` from this directory, then open http://127.0.0.1:4173. Run `npm run check` for the JavaScript syntax check. No dependency installation or compilation is required.

## Implemented

- Supplied logo and confirmed tagline, cream/cocoa brand direction.
- Responsive hero with scroll-linked food movement.
- Original GPU-rendered banana film: continuously deforming peel ribbons, solid curved fruit segments, photographic raw/crisp textures, and surface lettering. No pinned scroll distance; photographic fallback when WebGL is unavailable.
- Illustrated lower-temperature/ingredient-care chapter, with source-linked research and no invented oil-reduction percentage.
- Automatic once-per-visit crunch animation on viewport entry, with synthesized sound enabled by default, synchronized to the break. Browser activation rules apply; a contextual sound activation control appears when needed.
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

The hero CTA was removed and replaced with a quiet editorial note. Each storytelling chapter now has distinct artwork. The banana film runs for approximately 8.9 seconds after its stage is at least 55% in view; leaving the scene pauses it, returning resumes it, and a manual pause/replay control remains available. Browser tab visibility also pauses/resumes the film. The crunch runs once when at least 65% of its stage is visible, leaving the chip broken. Reduced-motion mode shows the final banana composition immediately and omits the automatic crunch. Product cards/dialogs retain their original catalogue cutouts.

## Revision 3

Replaced all vector fruit in the ingredient and process chapters. The banana uses Three.js 0.180.0, locally hosted, with continuous peel deformation, capped solid slices, photographed-material textures, and embossed surface text. Peel endpoints are precomputed and interpolated; the scene renders only while its finite timeline advances, plus resize. It pauses outside the viewport or when the browser tab is hidden. Mobile GPU pixel ratio is capped. Sweet potato process imagery is an explicit photographic ingredient composition. Jackfruit imagery is constrained to its own grid track and its caption sits below it. Sound preference defaults to on, with a browser-compatible first-interaction unlock and delayed activation control if needed.
