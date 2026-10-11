---
name: motion
description: visitask motion spec for principled functional animations where motion explains the product.
---

# visitask motion spec

Principle: motion explains the product. The spine assembles, the axis shows the ideal, the lime pulses where the body deviates. Nothing moves just to decorate.

## Tokens

| Token | Value |
|---|---|
| `--ease-out` | `cubic-bezier(.2,.7,.2,1)` (entrances, hover) |
| `--ease-in-out` | `ease-in-out` (loops only) |
| `--d-micro` | 120-250ms (hover, press, focus) |
| `--d-enter` | 600-750ms (entrance, charts) |
| `--stagger` | 60-80ms between siblings |
| Loop cap | 1 functional loop per region, 1.4-2.6s |

Only animate `transform` and `opacity` (plus `stroke-dashoffset`, `background-size` for the highlight wipe). Never animate width, height, top or left.

## Login: what animates (implemented in Spine.dc.html)

| # | Element | Motion | Timing |
|---|---|---|---|
| 1 | Header, eyebrow, H1, lead, fields, buttons, note | Rise: fade + 14px translateY | 0 -> 560ms, 60-80ms stagger |
| 2 | Lime highlight on "clearer." | Wipe left to right (background-size 0 -> 100%) | starts 800ms, 700ms long |
| 3 | Ink panel | Rise, same curve | starts 200ms |
| 4 | Vertebrae | Assemble bottom-up: fade + 18px translateY | 70ms apart, starts 100ms |
| 5 | Head | Settles last | 1100ms |
| 6 | Annotation leader lines | Draw (stroke-dashoffset) | 1500ms, 900ms long |
| 7 | Annotation labels | Fade in | 2000ms |
| 8 | Focus-rhythm bars | Grow from baseline (scaleY .04 -> 1) | 1300ms + 55ms each |
| 9 | Ideal axis | Dashes slowly travel (functional loop) | 1.4s linear, infinite |
| 10 | Cervical vertebrae (lime) | Soft opacity pulse = "needs attention" (functional loop) | 2.6s, starts 2200ms |

Total entrance is under ~2.5s and the form is usable from the first 300ms. Never block input on animation.

## Interaction states

| State | Motion |
|---|---|
| Field focus | Border to ink, 3px lime outline, 200ms; label stays still |
| Button hover | Background to `--ink-hover` 200ms; arrow slides 5px right |
| Button press | Scale .985, 120ms |
| Loading (after Sign In) | Label becomes "Signing in", arrow swaps for a 18px ring spinner (ink-on-lime, 700ms linear); button disabled, width unchanged |
| Error | Form shakes once (`.sp-shake`, 400ms, 6px), field border turns `--danger`, message fades in below with an icon. Focus moves to the first invalid field |
| Success | Spinner becomes a check that draws in 300ms; then the ink panel expands to fill the viewport (transform scale from its origin, 450ms) while the form fades out; the dashboard rises in |
| Passkey | Secondary button shows an inline "Waiting for device..." state with the same spinner |

## Reusable CSS

```css
.rise{animation:rise .75s cubic-bezier(.2,.7,.2,1) both;animation-delay:var(--d,0ms)}
@keyframes rise{from{opacity:0;transform:translateY(14px)}}

.mark{background:linear-gradient(#C6F432,#C6F432) no-repeat left center/0% 100%;
      animation:wipe .7s .8s cubic-bezier(.2,.7,.2,1) forwards}
@keyframes wipe{to{background-size:100% 100%}}

.v{transform-box:fill-box;transform-origin:center;animation:vIn .6s cubic-bezier(.2,.7,.2,1) both}
@keyframes vIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
.v.hot{animation:vIn .6s cubic-bezier(.2,.7,.2,1) both,pulse 2.6s 2.2s ease-in-out infinite}
@keyframes pulse{50%{opacity:.55}}

.axis{animation:dash 1.4s linear infinite}      /* stroke-dasharray 5 6 */
@keyframes dash{to{stroke-dashoffset:-22}}

.bar{transform-origin:bottom;animation:grow .7s cubic-bezier(.2,.7,.2,1) both}
@keyframes grow{from{transform:scaleY(.04);opacity:0}}

.sp-shake{animation:shake .4s}
@keyframes shake{20%{transform:translateX(-6px)}40%{transform:translateX(5px)}
                 60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}

@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation:none!important;transition:none!important}
  .mark{background-size:100% 100%} .lines path{stroke-dashoffset:0}
}
```

Apply stagger by setting `--d` inline: `style="--d:300ms"`. Set start states only inside keyframes (with `animation-fill-mode: both`) so content is visible when animation is disabled.

## Motion for the rest of the product

- **Page transitions**: content area fades and rises 8px (250ms); the ink rail never animates.
- **Numbers**: count up from 0 on first view only, 800ms ease-out, tabular mono figures so width does not jitter.
- **Charts**: bars grow from the baseline, lines draw left to right with stroke-dashoffset, 700ms, staggered 40-55ms.
- **Live session**: the spine updates by interpolating vertebra offsets (transform translateX) over 300ms; never snap. A lime vertebra pulses only while the deviation persists.
- **Alerts**: slide in from the top of the panel 12px + fade, 250ms; auto-dismiss never for posture warnings, always dismissible.
- **Toggles**: thumb slides 200ms ease-out.
- **Skeletons**: flat gray blocks with a single slow shimmer (1.6s); prefer skeletons over spinners for page-level loading.
- **Camera calibration**: the live spine figure eases toward the dashed axis as the user aligns; at success the axis flashes lime once (400ms).

## Do not

- No parallax, no cursor-following effects, no bouncy springs, no continuous glows.
- No more than 2 simultaneous looping animations on screen.
- No animation that delays access to a form, button or data.
- No autoplay motion without a reduced-motion fallback.
