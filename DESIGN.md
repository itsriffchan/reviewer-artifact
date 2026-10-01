# DESIGN.md

This document defines the visual language for the Centralized Academic Reviewer Website. Functional requirements remain in `SPEC.md`; implementation guidance remains in `IMPLEMENTATION_PLAN.md`.

## Design direction: Connected Learning

The interface uses a purple-and-green synapse concept: knowledge is represented as connected paths, progress as signals moving through a system, and each reviewer as a focused node in a larger academic network. This is a visual concept, not a branded or literal sci-fi theme.

The tone is **focused, curious, and precise**:

- academic content remains the visual priority;
- personality comes from connected-line motifs, purposeful color accents, and small tactile motion;
- solid surfaces and clear hierarchy replace glassmorphism and decorative blur;
- the interface should feel modern and distinct without becoming a game or a corporate dashboard.

## Color system

| Token | Value | Use |
| --- | --- | --- |
| Background primary | `#0B0914` | Main page canvas |
| Background secondary | `#12101D` | Navigation, footer, and quiet regions |
| Surface | `#181526` | Solid cards and quiz panels |
| Surface elevated | `#211C32` | Focused panels and selected controls |
| Border | `#2A2440` | Structural separation |
| Purple primary | `#8B5CF6` | Brand, active states, key actions |
| Purple bright | `#A78BFA` | Headings, links, secondary emphasis |
| Green primary | `#34D399` | Progress, completion, success, active signals |
| Green dark | `#059669` | High-contrast success state |

Purple is the dominant identity color. Green is an accent for movement, progress, and correctness. Semantic error, warning, and information colors remain distinct from both.

## Surface and depth rules

- Cards are opaque and clearly separated from the background.
- Do not use `backdrop-filter`, translucent panels, frosted glass, or glassmorphism.
- Use restrained borders, compact shadows, and a small hover lift to create depth.
- Glows are optional and localized to active or success states; never use large neon fields behind reading content.
- Rounded corners are functional and moderate; avoid unnecessary decorative pills.

## Synapse motif

Use sparse lines, nodes, dots, and connected progress cues as supporting decoration. They may appear in hero backgrounds, empty states, section dividers, or completion moments. Never place dense patterns behind question text or answer controls.

## Layout and accessibility

Lead with the task and the next useful action. Keep quiz screens calmer than discovery screens. Preserve responsive one-column flows on small screens, large touch targets, semantic controls, visible focus states, and sufficient contrast. Correctness must never rely on color alone; pair it with `✓ Correct`, `✕ Incorrect`, or `○ Unanswered`.

The visual refresh does not change the reviewer JSON contract, scoring rules, persistence behavior, or content-discovery architecture.
