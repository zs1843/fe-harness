# Design Token

Design Token is the unique machine-readable visual ground truth in Consumer H5 projects. It answers not "does this button look about right", but "which source is authoritative for colors, font sizes, spacing, border radius, shadows, layers, and animations".

## Token Ground Truth File

The default ground truth file is:

```text
docs/design/tokens.json
```

The explanation document is:

```text
docs/design/TOKENS.md
```

`tokens.json` holds machine-readable values; `TOKENS.md` only explains sources, naming, usage, and maintenance rules, without duplicating a second set of values.

## Source Priority

When different sources provide conflicting visual information, the priority is fixed as:

| Priority | Source | Why |
| --- | --- | --- |
| 1 | High-fidelity UI | Closest to final visual delivery, usually the direct basis for visual acceptance |
| 2 | RP | Describes page structure, interaction states, and local visual hints, lower than high-fidelity UI |
| 3 | User ad-hoc visual requirements | Users can override existing inputs, but must record the override reason |
| 4 | Project existing Token | Visual assets already launched or established, should not be easily overwritten by templates |
| 5 | `docs/DESIGN.md` principles | Design principles provide direction, but are usually less precise than specific tokens |
| 6 | Harness defaults | Only placeholders for empty projects, cannot claim to represent real business visuals |
| 7 | Agent inference | Lowest priority, can only be temporarily marked as inferred, awaiting confirmation |

The core of this ordering: sources closer to actual visual delivery and user explicit expression have higher weight; more generic and inferential sources have lower weight.

## Why Harness Defaults Cannot Become Real Tokens

Harness defaults only ensure empty projects have stable structure. They do not represent brand, product aesthetic, or UI designs.

If defaults are treated as real tokens, three problems arise:

- Pages appear to have a design system, but actually lack visual evidence.
- Agents continue expanding around placeholder values, increasing future replacement cost.
- During acceptance, it is impossible to explain where visual values originated.

Therefore, new project Token status should remain `pending_extraction`, waiting for real UI/RP/project styles to enter before extraction.

## How to Define Tokens

When defining tokens, first confirm the source, then write values.

Recommended steps:

1. Run `fe-harness design tokens inspect --json` to confirm the unique ground truth file and current status.
2. Check whether this task has high-fidelity UI, RP, user ad-hoc requirements, or existing project styles.
3. Determine each token's authority based on source priority.
4. Write semantic tokens in `docs/design/tokens.json`, not directly writing page-specific styles.
5. Explain naming, sources, and usage rules in `TOKENS.md`.
6. Run `fe-harness design tokens diff --json` to write differences to task snapshots and change history.

## What Are Semantic Tokens

Semantic tokens describe "purpose", not "color appearance".

Recommended:

```json
{
  "color": {
    "brandPrimary": {
      "value": "#2f6f73",
      "source": "ui",
      "status": "confirmed"
    },
    "textPrimary": {
      "value": "#202124",
      "source": "existing_project",
      "status": "confirmed"
    }
  }
}
```

Not recommended:

```json
{
  "color": {
    "green1": "#2f6f73",
    "darkText": "#202124"
  }
}
```

Semantic naming allows components and pages to express intent. `brandPrimary` can map to buttons, navigation, and emphasis states; `green1` only describes the color itself, unable to explain business meaning.

## Existing Project Token Discovery

When connecting to an existing project, do not directly overwrite existing styles with empty templates. First perform read-only discovery:

```bash
fe-harness design tokens discover --json
fe-harness design tokens inspect --json
```

Discovery scope includes Vue, CSS, SCSS, and Less under `src/`. Output candidates include:

- CSS Variables.
- High-frequency colors.
- Fonts and font sizes.
- Spacing.
- Border radius.
- Shadows.
- Dimensions.
- Layers.
- Animations.
- Breakpoints.

These candidates are not automatically confirmed tokens. They are merely evidence, requiring confirmation from UI/RP and users before writing to the unique ground truth.

## How to Record User Overrides

Users can explicitly override UI or existing tokens. For example, "change this primary button to a deeper green". Such overrides are valid, but must be recorded:

- Value before modification.
- Value after modification.
- Override source.
- Token version.
- Affected pages and components.
- Override reason.

This way, during subsequent visual regression or design review, it can be distinguished whether it was UI design change, project constraint change, or a one-time business requirement.

## Relationship with UI System Adapter

Design Token is project ground truth; UI System Adapter is mapping protocol.

For example, if a project chooses TDesign UniApp, the Adapter can explain how `brandPrimary` maps to component library variables or component semantics, but it cannot decide for the project what `brandPrimary` should be.

This boundary prevents UI runtime from hijacking the project visual system.

## Acceptance Boundary

When visual baseline is not established, do not claim "visual fidelity has been verified". At this point, you can say:

- Tokens have been extracted.
- Pages have been implemented according to tokens.
- Runtime or feature verification has passed.
- Visual baseline is not yet configured.

Only after establishing baseline and completing visual regression can screenshot differences be used as visual acceptance evidence.