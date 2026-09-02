# Copy inventory — coach marks & helper text (v1.16.0, 2026-09-02 — owner revision APPLIED)

Every piece of instructional copy in the app, organized so you can edit language in
place. **How to use this:** change any "current text" line here (or mark it up
however you like) and send the file back — each entry names where it lives, so the
swap is mechanical. Character counts aren't hard limits, but tour bodies read best
under ~220 characters and placeholders under ~60.

---

## 0. Demo preamble slides (developer login only — v1.16.0)

Shown only when a **developer** opens Help ▸ Take a tour (everyone else goes straight
to the tour, unchanged). Four modal slides distilled from the 09-03 demo preamble;
the last button reads **Start the tour** and runs the normal chained tour. Bold
below renders bold in the slide. Buttons: **Skip** · **Back** · **Next**. Keys:
← → / Enter advance, Esc closes.

| # | Title | Body |
|---|---|---|
| 1 | From planning tool to hub | The Scheduler began as a Gantt planning tool: enter projects, assign people, see workload across a department. ¶ The work since has turned it into a company-wide system. The Gantt chart is still the center — but underneath it is a **shared source of truth** for our project, client, personnel, availability and scheduling data. |
| 2 | Enter it once | Today the information that runs our projects is spread across PM spreadsheets, staffing and time-off documents, Teams lists, Excel workbooks and SharePoint lists — much of it entered four or five times just to stay current. ¶ This isn't another document on the pile: the app is connected to our company data in Microsoft 365. **Enter information once, maintain it in one place, and it becomes useful everywhere.** A PM changes a project date — it's the same date on every schedule, calendar and dashboard. |
| 3 | Who it's for | **Management** — the company-wide view: what's happening, what's coming, where resources are committed, where we may have capacity or staffing issues. ¶ **Project Managers** — where a project enters the schedule: the timeline, milestones and dates other departments plan around. ¶ **Technical Design** — a planning and working tool: what we're responsible for, when, and how it's distributed. ¶ **Shop & production** — visibility: what's coming, when it moves through the shop, who's involved. ¶ These aren't four separate schedules — everyone sees **different views of the same information**. |
| 4 | What it isn't | This is not an ERP, and it doesn't replace estimating, accounting, purchasing or HR. You'll see personnel and project information only as far as it affects planning and scheduling — no budgets, no purchase orders. ¶ It exists to answer four questions: **What are we working on? When is it happening? Who is working on it? And what does everyone need to know to plan around it?** ¶ Rather than tour features in the abstract, let's walk through the app the way you'll actually use it. |

## 1. The tour — home page (Global Gantt)

Shown by Help ▸ Take a tour, and once automatically on a first visit. STEP counts
run across both halves (7 here + 6 on the project page = 13).

| # | Highlights | Title | Body |
|---|---|---|---|
| 1 | The project list (sidebar) | Every job, one list | Projects stack here with their job codes and deadlines. Click a row to open its phases, the eye spotlights one job, the pencil edits it. The Department lens regroups everything by Department. |
| 2 | The timeline canvas | The timeline | Each bar is a phase of work. Click one for its details, drag it to move, grab an edge to resize, right-click for more. Red bars are installs. |
| 3 | The numbered date bar | Slide through time | Click and drag the numbered date bar left or right to move the timeline, up and down to zoom in or out. The Today button (or T) brings you back to today, and G jumps to any date. |
| 4 | The search box | Find things fast | Type here (or press /) to show only matching projects and phases. Filters narrows the view by status, client or person. Clear filters brings everything back. |
| 5 | My Dashboard button | Your plate | One click shows just your own work: phases, milestones, notes, time off, and a section for notes-to-self. |
| 6 | Help button | When you forget | Help holds the colour legend, every keyboard shortcut, and this tour — open it any time. |
| 7 | + New Project button (the hand-off step — only this button is clickable) | Start a project | Name it, pick its departments and set the install deadline; the schedule builds itself backward from that date. Click + New Project now to continue the tour on the project page. *(the tour card renders plain text — bold isn't available there)* |

## 2. The tour — project page (continues as steps 8–13)

Also available on its own from Help while on any project page. The draft page shows
the "Nothing is real yet" step; a saved project shows "Everything saves itself"
instead (so a full run is 6 steps, never both).

| # | Highlights | Title | Body |
|---|---|---|---|
| 8 | The breadcrumb trail | Where you are | All Projects, this job, and the phase when one is selected. Click a crumb to step back out. Esc, Done and the × do the same. |
| 9 | The header strip (client · code · install) | The job at a glance | Client, job code, install date and days out. These update as you edit. A warning appears if work runs past the install. |
| 10 | The schedule (Gantt/calendar) | The schedule | Every bar is a phase of work. Click one to edit it below, drag to move, grab an edge to resize, right-click to add a subtask, milestone or note. The calendar shows one band per phase — click a band to open it and see its subtasks. |
| 11 | The Gantt/Calendar toggle | Two views of the same dates | Gantt for the whole job at once, Calendar for week-by-week. G and C switch from the keyboard. |
| 12 | The bottom editor dock | The editor | With nothing selected you edit the project here — Setup, Team, Departments, Milestones and Notes. Select a phase and this becomes that phase's form. |
| 13a | Create project button (drafts only) | Nothing is real yet | This page is a draft kept in this tab. Drafts survive a page refresh. Create project files it to SharePoint. Cancel or the × closes without saving. |
| 13b | The ✓ Changes saved tag (saved pages only) | Everything saves itself | Edits file to SharePoint as you make them. The pill in the toolbar shows sync. Done takes you back to the timeline. |

Tour buttons: **Skip tour** · **Back** · **Next** (hidden on step 7, where the body
asks for the real click).

## 3. Field placeholders — project edit page

| Field | Placeholder |
|---|---|
| Project name | What the shop calls it |
| Client | Who it's for |
| Job code | H1-2049 |
| Phase name (in the phase form; shows the department name until you type) | *(the department's own name, e.g. "Technical Design")* |
| Free-text "Other" phase name | Process name (e.g. Vacuum Former) / process name |
| Phase notes | Anything we shouldn't forget |
| Milestone name (agenda row) | Client approval |
| Note text (agenda row) | Order acrylic |

Inline helper notes on this page:
- Departments section: "Right-click the chart to add one where you want it."
- Crew picker: "Leave empty to cover it with the project team."
- Empty agenda: "No milestones or notes yet. Right-click the chart on the day it
  happens, or use the buttons above." (viewers see only the first sentence)

## 4. Field placeholders — People page

| Field | Placeholder |
|---|---|
| Name | Name — suggests from the company Team |
| Nickname | Optional — how their name reads everywhere in the app |
| Driver checkbox (editor) | Drives for the company |
| Availability radios (editor) | Available / Not available / Out of office — automatic, from the date ranges below |
| Time-off field label + add button (editor) | Out of office / + Out of office *(owner ruling 2026-09-02: keep this name)* |
| Work email | Work email (for "me" features) |
| Search box | Search people… / Search clients… |
| Client alias | 2–3 letter job-code prefix |

Page subtitles: "The company roster — roles, departments and availability" /
"The company client directory and job-code aliases".

## 5. My Dashboard / Summary

| Where | Text |
|---|---|
| User Notes textarea | Anything you want to keep next to your schedule — saved to your staff row. |
| Thought-cloud popover: title field | Title |
| Thought-cloud popover: link field | Link (optional) |
| Thought-cloud popover: checkbox | Show on my Summary |
| Thought-cloud button hover | ❝ ❞ |
| Empty dock section | Nothing here right now. |

## 6. Toolbar & search

| Where | Text |
|---|---|
| Global search box | Search  / |
| Sign-in card | The shared shop schedule: every project, phase and deadline in one place. Sign in with your work account to see it. |
| Empty board card | Create your first project and the schedule builds itself backward from the deadline. Press N or use + New Project. |
| All-hidden card | The status filter is hiding every project. Click Clear filters in the toolbar to see them again. |
| No-match search card | The search filter matches no project or phase. Click Clear filters in the toolbar to see everything again. |
| Person-empty card (dashboard) | No visible phase has NAME on it yet. The × up top goes back to all projects. |
| Person-empty card (filter) | The person filter is on and no visible phase has NAME on it. Click Clear filters in the toolbar to see everyone. |

## 7. Bug report form

| Field | Placeholder / text |
|---|---|
| Description | What you did, what you expected, what you got instead |

## 8. App settings (developer page)

| Where | Text |
|---|---|
| Page subtitle | Developer switches. Everyone reads these at sign-in — a change reaches users on their next reload. |
| Viewer-permissions note | Each switch opens one edit door for non-admin users. All off = the v1.8.0 read-only viewer. |

---

*Coach copy revision has been tabled since 2026-08-28 (owner). This document lifts
that on your terms: edit anything above and the swap ships as a copy patch. New
steps and new fields keep landing with working draft copy, as before.*
