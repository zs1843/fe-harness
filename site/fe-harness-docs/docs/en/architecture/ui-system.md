# UI System

UI System Adapter is an optional protocol, not a default UI dependency. It depends on project-defined Design Token ground truth, but does not define tokens for the project.

## What It Solves

Real projects often choose TDesign, Vant, or other component libraries. Harness cannot import these libraries in Core, but needs to let Agents understand component semantics and token mappings.

UI System Adapter provides:

- Component semantics.
- Design Token mapping.
- Component usage constraints.
- Page transition and layout section descriptions.
- Visual adjustment record format.

## Why Not Auto-Add Production Dependencies

UI runtime is a project technical decision. Adapter installation is only evidence installation, and should not automatically modify production dependencies.

If a project decides to adopt a certain UI runtime, it needs to:

1. Lock production dependency versions.
2. Migrate component usage.
3. Verify pages and visuals.
4. Then remove old runtime.

## Design Token Authority

Projects own unique machine-readable Design Token sources. Adapter only explains how to map to component library variables.

When connecting existing projects, first perform read-only discovery to identify CSS Variables and high-frequency visual values, then have users confirm semantic tokens.

See [Design Token](./design-tokens.md) for detailed rules.