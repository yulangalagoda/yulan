# Content model

Every database that feeds yulan.me, and which part of the site each one owns.

Notion parent: **Yulan.me - Site Source**
`https://app.notion.com/p/36056d8311d281ac9971e1e3384be214`

## Why the new databases exist

The original ten databases covered the *records* on the site (roles, projects,
skills, credentials) but none of the *copy around them*. Section headings,
leads, button labels, the navigation, per-route SEO and the entire Lab
instrument list lived only in the components. That made the content hostage to
the markup: any UI change risked losing it, and the same Lab list was
maintained in three separate files that could silently drift apart.

The eight databases below close that gap. Nothing was deleted; the existing ten
are untouched.

## Wired up (site reads these today)

| Database | Data source id | Owns |
| --- | --- | --- |
| Profile | `2f865e15-b4d8-4d8d-9c36-a0dd01cf81a8` | Hero, About, Contact and Site Meta body copy; logo, portrait, CV |
| Experience | `a21988da-c5d1-4229-845a-9eb2b0d5988f` | Roles, bullets, stack tags |
| Education | `5c00c7a7-3634-4450-8a7c-0a0742a4d59c` | Qualifications, feeds two hero facts |
| Skills | `8ab86c74-b616-48ae-8e99-a92b2f974976` | Skill chips and their categories |
| Certifications | `d4ec61d9-d78b-456f-8621-8727fc0bea97` | Credential cards, issuer badges, verify links |
| Projects | `8fa4ac5a-3029-498c-b224-fff1fe3ef6e6` | Selected work rows and every `/work/<slug>/` page |
| Research & Publications | `58d47117-229c-461d-9b50-af4754cb22a9` | Research rows, DOIs, the ORCID record |
| Side Worlds | `a7e3e4bf-c10d-445b-82e1-148f41664dba` | Companion sites (Rampe, The Meridian) |
| Badges | `36756d83-11d2-80fb-960c-000bd090d868` | The issuer badge wall |
| Social Links | `c99406d7-73cb-4b1d-a15a-68bae2d79831` | Profile links and the contact pills |

## New, populated, not yet wired

The site still renders its own hardcoded copies of all of this. These rows are
the authority; the components have not been switched over yet.

| Database | Data source id | Owns | Replaces |
| --- | --- | --- | --- |
| Site Sections | `5a4ccfae-5225-4dc4-8168-3719e8d7e872` | Eyebrow, heading, lead, meta and footnote for every section | Literals in every section component |
| Lab Instruments | `a24084af-95c4-49c7-afd5-fba8fc158127` | The ten instruments: code, slug, both blurbs, tags, featured flag | `app/lab/page.tsx`, `components/LabTeaser.tsx`, `app/page.tsx` |
| Capabilities | `49776f85-189c-4566-a747-2b4f8651ad03` | The three "What I do" focus areas | `AREAS` in `components/WhatIDo.tsx` |
| Hero Facts | `de85f8ef-6786-4726-8abf-92ba38377031` | The four credential tiles under the hero | `FACTS` in `components/Hero.tsx` |
| Navigation | `6715586d-1a46-4a9d-9895-1a4de701be64` | Header, footer, palette and mobile-bar links | `NAV` in `components/Header.tsx` |
| Page Meta | `69f65862-ff92-4dcc-a09e-b77c0504e39c` | Per-route title, description, canonical, OG image | `metadata` exports in each route |
| Writing | `07f9fba5-1294-4fd5-876f-10507e3df59d` | The book: blurb, pull quote, DOI, read and repo links | `components/Writing.tsx`, `app/writing/page.tsx` |
| Calls to Action | `44aa9707-4a23-4c19-ae5a-32af6b2e432e` | Every button label and destination | Inline literals across components |

## Conventions

- **Visible** gates rendering on every database. Unchecked means the row is
  skipped, not deleted.
- **Order** is ascending. Ties fall back to Notion's own row order.
- **Editor Note** is never rendered. Use it for context for the next editor.
- Placeholders in `{braces}` are resolved at build time, not literal text:
  `{cvPath}`, `{slug}`, `{certCount}`, `{skillCount}`, `{projectCount}`.
- Middot-separated tag strings (`ISO 27001 · Sentinel · VAPT`) are a single
  text field where the site renders them as one line, and a multi-select where
  it renders them as individual chips.
- House rule: no em-dashes or en-dashes in any copy field.

## Known gaps

- The nine Lab instrument *pages* still hold their own long-form explanation in
  the route files. Only their titles and card blurbs are in Notion. Moving the
  body copy needs a rich-text field or a Notion page body per instrument.
- Page Meta descriptions for the nine `/lab/<tool>/` routes are still in the
  route files; the rows exist with titles and canonicals so they can be filled
  in without a schema change.
- The book appears in both **Writing** (presentation) and **Research &
  Publications** (the DOI record for ORCID). That duplication is deliberate:
  they serve different consumers.
