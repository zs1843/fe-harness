# Design Principles

## Core Doesn't Understand Business

Core cannot contain product pages, domain states, API endpoints, brand values, or tokens. It only handles reusable mechanisms: configuration, command parsing, diagnostics, verification, reports, and safe writes.

The cost is needing more explicit configuration; the benefit is Harness won't be tied to a single business project.

## Project Facts Belong to the Project

`.fe-harness/project.yaml` is configuration owned by the target project. The project chooses profile, platform, stack, and maps symbolic verification steps to real commands.

Harness can provide templates and defaults, but cannot long-term hold real business facts for the project.

## Initialization Must Be Safe

When connecting an existing project, Harness must pre-check all target files. If there are real conflicts, stop writing. Existing identical files are preserved; different content is reported as project-maintained or conflict.

This principle prevents engineering tools from overwriting user-maintained rules under the name of "initialization".

## Capabilities Default to Lightweight, Expand as Needed

New projects by default only install the aggregated Consumer H5 Skill. Command-level Skills, OpenAPI, UI System, Design Token discovery, and visual baselines are enabled per task.

This isn't removing capabilities, but reducing default cognitive overhead.

## Verification Is Completion Evidence

Verification reports aren't formalistic steps, but task completion evidence. Failed commands, environment blockers, unconfigured capabilities, and business failures should be recorded separately.

Consumer H5's complete feature acceptance doesn't just check build and first screen, but requirement closure.