# UI Conventions Config

Edit this file to match your project's design system before running `/ui-audit`.

---

## allowed-fonts

Font utility classes that are permitted in this project. Any `font-*` class not listed here will be flagged.

```
font-heading
font-sans
font-mono
```

**Example (DecoyVerse):** Only `font-heading` for headings; `font-sans` for body text.

---

## allowed-colors

Color base names that are permitted. The audit checks the base name only — suffixes like `-400`, `-500/50` etc. are ignored.

```
gold
gray
white
black
transparent
current
inherit
```

**Example (DecoyVerse):** Accent is `gold-400/500/600`. Backgrounds use `gray-800/900`. Any other color base (e.g. `blue`, `red`, `green`, `purple`, `indigo`) will be flagged.

**Tip:** Add `slate`, `zinc`, `neutral` etc. if your project uses those gray variants.

---

## component-mappings

Maps raw HTML elements to the shared components that should be used instead. Format: `raw-tag -> ComponentName`.

```
button -> Button
input -> Input
select -> Select
textarea -> Textarea
a -> Link
img -> Image
```

**Note:** Only add mappings for elements your project has a shared component for. Remove entries that don't apply.

---

## extra-banned-patterns

Optional. Additional patterns to flag, one per line. These are literal string searches (not regex).

```
TODO: remove
console.log
debugger
```

**Leave empty if you have no extra patterns.**

---

## Notes for new projects

1. Copy this entire `.claude/skills/ui-audit/` directory into the new project's `.claude/skills/` folder
2. Edit this file to reflect that project's design tokens
3. Run `/ui-audit src/` or `/ui-audit [your source folder]`
