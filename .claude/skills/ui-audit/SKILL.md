---
name: ui-audit
description: Use when auditing UI consistency, checking fonts and colors, finding inline styles, or ensuring design token compliance across a codebase. Scans React (.tsx/.jsx), Angular (.ts/.html), and Vue (.vue) files for font violations, off-palette colors, inline CSS, and misuse of raw HTML elements. Reports all issues with file:line references then optionally fixes them all at once.
allowed-tools: Read, Grep, Glob, Edit
---

## What This Skill Does

Scans a frontend codebase for UI inconsistencies and reports violations grouped by file. After showing the full report, asks whether to apply all fixes at once.

Checks for:
- Non-standard font classes (e.g. raw `font-sans` when `font-heading` is required)
- Off-palette colors (e.g. `text-red-500` when only `gold`/`gray` are allowed)
- Inline styles — `style={{...}}` in React/JSX, `style="..."` in HTML/Angular templates, `styles: [...]` in Angular `@Component` decorators
- Raw HTML elements where a shared component should be used (e.g. `<button` instead of `<Button`)

Works across React, Angular, and Vue projects. Design tokens are configured per-project in [ui-conventions.md](ui-conventions.md).

---

## Setup: Configure Design Tokens

Before running in a new project, edit [ui-conventions.md](ui-conventions.md) in this skill's directory to match that project's design system:

- `allowed-fonts` — Tailwind font classes that are permitted
- `allowed-colors` — Color prefixes that are permitted (e.g. `gold`, `gray`)
- `component-mappings` — Raw HTML tags that must be replaced with shared components
- `extra-banned-patterns` — Any project-specific patterns to flag (optional)

The default config ships with DecoyVerse values as an example.

---

## Steps

### 1. Load configuration

Read [ui-conventions.md](ui-conventions.md) to get:
- `allowed-fonts` list
- `allowed-colors` list
- `component-mappings` (raw tag → component name)
- `extra-banned-patterns` (optional)

If `$ARGUMENTS` is provided, use it as the scan root. If empty, ask the user which path to scan before proceeding.

### 2. Discover files

Use Glob to find all files matching these patterns under the scan root:
- `**/*.tsx`, `**/*.jsx`
- `**/*.ts`, `**/*.js` (skip `*.test.*`, `*.spec.*`, `*.d.ts`)
- `**/*.html`
- `**/*.vue`

Exclude: `node_modules/`, `dist/`, `build/`, `.next/`, `.nuxt/`, `coverage/`, `*.test.*`, `*.spec.*`

### 3. Scan each file

For each file, read its contents and check for the following. Record every violation as:
`[FILE:LINE] TYPE — description of the issue`

**Font violations**
- Search for `font-` class usage (in `className`, `class`, or template strings)
- Flag any `font-*` class not in `allowed-fonts`

**Color violations**
- Search for Tailwind color classes: `text-`, `bg-`, `border-`, `ring-`, `from-`, `to-`, `via-`
- Flag any color whose base name is not in `allowed-colors`
- Ignore utility suffixes like `-100` through `-950`, `/50`, etc. — check the base name only
- Skip semantic classes like `text-white`, `text-black`, `text-transparent`, `bg-transparent`

**Inline style violations**
- React/JSX: flag `style={{` anywhere
- HTML/Angular templates: flag `style="` attribute
- Angular decorators: flag `styles: [` inside `@Component`

**Raw element violations**
- For each entry in `component-mappings`, search for the raw HTML tag (e.g. `<button`, `<input`, `<a `, `<img`)
- Flag matches with the component name that should be used instead
- Skip occurrences inside comments

**Extra banned patterns**
- Run each pattern from `extra-banned-patterns` and flag matches

### 4. Output the report

Print the findings grouped by file. Use this format:

```
## UI Audit Report
Scanned: [path] | Files checked: [N] | Issues found: [N]

### [relative/path/to/File.tsx] — [N issues]
- [LINE] FONT     | used `font-mono`, expected one of: font-heading, font-sans
- [LINE] COLOR    | used `text-blue-500`, blue is not in allowed colors
- [LINE] INLINE   | inline style prop found: style={{ color: 'red' }}
- [LINE] ELEMENT  | raw <button> found, use <Button> component instead

### [relative/path/to/another.ts] — [N issues]
...

---
Total: [N] issues across [N] files.
No issues found in [N] files.
```

If zero issues are found, print:
```
No UI consistency issues found. All [N] files are clean.
```

### 5. Offer to fix

After the report (only if there are issues), ask:

> "Fix all [N] issues now? This will only modify `className`, `class`, `style` attributes, and Angular `styles:` arrays — no logic will be touched."

If the user confirms:
- Remove all `style={{...}}` props from JSX elements (replace with empty string or remove the prop entirely)
- Remove `style="..."` attributes from HTML elements
- Remove inline entries from Angular `styles: [...]` arrays (leave the array empty)
- Do NOT attempt to auto-replace fonts or colors — these require judgment. Instead, add a `// TODO: ui-audit` comment on flagged lines so the user can fix manually
- Do NOT touch raw element → component replacements automatically — flag these only

After fixing, summarize: "Fixed [N] inline style issues. [N] font/color/element issues marked with `// TODO: ui-audit` for manual review."

---

## Notes

- Never modify component logic, props interfaces, imports, or file structure
- Never rename or move files
- Skip `node_modules/`, `dist/`, `build/`, test files, and type declaration files
- If a file is too large to read in one pass, read it in chunks
- For Angular `@Component` files, check both the `.ts` file and any linked `.html` template
- When in doubt about whether a color is allowed, flag it — better to over-report than miss issues
