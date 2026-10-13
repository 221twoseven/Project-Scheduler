# The overall-span track: labelled, then left as is — v1.47.1 / v1.47.2 (2026-10-12)

**TODO item 8** (brief §7 Rollup, §8.2, §14). PRs #135 and #138.

## What happened

On a project's Gantt, a department row draws a faint track behind its bars, from its first
start to its last finish, gaps included. The brief asked to label it "Overall span" or drop
it.

- **v1.47.1 (PR #135):** the legend got an entry, "Overall span (gaps aren't work)", with
  a tooltip, wherever the track showed. It reached `/preview/` only.
- **v1.47.2 (PR #138), the same day:** the owner ruled the label redundant: the track
  explains itself, and "gaps aren't work" read as cryptic and already understood. The
  entry was removed before it reached production. The track is unchanged from v1.47.0.

The release notes fold both versions into the v1.47.0 entry ("v1.47.0–v1.47.2"), since the
team never saw the label.

## Lesson

A label that explains something people already read correctly adds noise. For copy on a
visible surface, show the owner the wording before building it.

## Follow-up

**Item 59:** the Meeting Sheet progress % and the project page's "Lead time" also run across
gaps. Whether they change is the owner's call.
