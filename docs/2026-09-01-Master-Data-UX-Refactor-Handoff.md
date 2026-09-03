# Project Scheduler — Master Data UX Refactor Handoff

## Project

Live preview:  
https://221twoseven.github.io/Project-Scheduler/preview/#/

Repository:  
https://github.com/221twoseven/Project-Scheduler

The application is becoming the authoritative source of truth for company operational data. SharePoint lists are the persistent data stores.

The system includes:
- Projects
- Clients
- Employees / people
- Staff availability
- Calendar / scheduling information
- Additional shared operational data over time

The basic administrative application view will eventually be restricted to admin users, although permissions are not yet implemented.

## Problem

`Clients` and `People & Availability` currently open as modals.

The underlying forms function, but their presentation does not communicate the importance of the information they contain. They feel like temporary settings dialogs rather than canonical company records.

This is primarily an information-architecture and interaction-model problem, not a styling problem.

These datasets should feel like first-class entities within the application.

The goal is to move from:

**modal → editable batch form → save/cancel**

to:

**persistent application location → record index → selected record → explicit edit state**

The interface should communicate that these records are consequential, persistent, shared company data.

---

# Core Application Model

Treat the major areas conceptually as:

- **Timeline** = operational workspace
- **Projects** = operational records
- **People / Clients** = master company data

Projects already establish a useful precedent: opening a project creates a distinct application location rather than simply placing an editing dialog over the timeline.

Extend that same principle to Clients and People.

Potential route structure:

```text
#/                     Timeline

#/project/:id          Project

#/people               People
#/people/:id           Individual person, if appropriate

#/clients              Clients
#/clients/:id          Individual client, if appropriate
```

Individual record URLs are desirable if they fit cleanly with the existing architecture, but they are not mandatory for this pass. A persistent master/detail layout under `/people` or `/clients` is acceptable.

Do not over-engineer routing solely to achieve this.

---

# Navigation / Naming

The current `Resources` concept undersells the importance of these datasets.

Rename the relevant navigation/grouping to:

**Company Data**

Within it:

- People
- Clients

Potential future structure:

```text
Company Data
    People
    Clients
    Departments
    Project Types
    Calendar / Holidays
    etc.
```

Rename:

**People & Availability → People**

Availability should become information belonging to a person rather than appearing as a separate peer concept in the navigation.

---

# People Page

Create a dedicated People page.

The default state should be primarily **read-oriented**, not edit-oriented.

Suggested information architecture:

```text
All Projects  ›  People

People                                      + Add Person
Company roster, roles, departments and availability

18 people · SharePoint · Synced [time]

Search people…          Department: All     Status: Active

NAME              ROLE                  DEPARTMENTS      AVAILABILITY
Robert Maciel     Lead Technical...     Design, DFAB     Available
Kate Smith        Production Manager    Production       Available
Peter Jones       Technical Director    Design, Shop     Sep 8–12 OOO
...
```

The exact columns should be informed by the existing data model rather than invented unnecessarily.

Clicking/selecting a person should show that person's canonical record.

A master/detail layout is preferred if it fits the current UI:

```text
┌───────────────────────────┬──────────────────────────────┐
│ PEOPLE                    │ ROBERT MACIEL                │
│                           │ Lead Technical Designer      │
│ Robert Maciel             │                              │
│ Kate Smith                │ Work email                   │
│ Peter Jones               │ ...                          │
│ ...                       │                              │
│                           │ Role                         │
│                           │ ...                          │
│                           │                              │
│                           │ Departments                  │
│                           │ Design · DFAB                │
│                           │                              │
│                           │ Availability                 │
│                           │ No upcoming time off         │
│                           │                              │
│                           │                       Edit   │
└───────────────────────────┴──────────────────────────────┘
```

This is conceptual, not a mandate for this exact visual arrangement.

The important hierarchy is:

**People index → selected person → explicit Edit action**

---

# Read Mode vs Edit Mode

This distinction is critical.

Do NOT simply move the existing editable form onto a full page.

Default record presentation should read like:

> This is the company record for Robert Maciel.

rather than:

> Here are fields you can modify.

Fields should generally render as information in the default state.

An explicit `Edit` action should enter edit mode.

For example:

Read state:

```text
Role
Lead Technical Designer

Departments
Design · DFAB

Availability
No upcoming time off
```

Edit state:

```text
Role
[ Lead Technical Designer      ]

Departments
[ Design ] [ DFAB ]

Availability
...
    
Cancel                     Save Changes
```

Avoid showing form controls everywhere when nothing is being edited.

---

# Individual Record Actions

Move away from the current batch-management model where the entire roster/list behaves like one large editable form.

Prefer actions at the record level:

- Add Person
- Edit Person
- Archive / Deactivate Person

Likewise:

- Add Client
- Edit Client
- Archive Client

Do not casually delete company records if historical projects may reference them.

Where practical, use lifecycle concepts such as:

- Active
- Inactive
- Archived

rather than destructive deletion.

Existing SharePoint/data limitations may constrain this. Do not introduce breaking schema changes simply to achieve archival behavior without first assessing the existing model.

---

# Availability

Availability remains an important part of People, but should become subordinate to the person record rather than defining the page itself.

People should communicate primarily:

- Identity
- Role
- Department(s)
- Work/contact information where already stored
- Current availability
- Upcoming planned availability / OOO information

Preserve all current scheduling and availability functionality.

Do not lose existing functionality during the UX refactor.

---

# Clients Page

Create a dedicated Clients page using the same interaction grammar as People.

Example:

```text
All Projects  ›  Clients

Clients                                     + Add Client
Company client directory and project aliases

46 clients · SharePoint · Synced [time]

Search clients…

CLIENT                         ALIAS
American Museum of...          AMNH
Nike                           NKE
Van Cleef & Arpels             VCA
...
```

Selecting a client should display its record in read mode.

Conceptually:

```text
VAN CLEEF & ARPELS
VCA

Alias
VCA

Projects
12 total

Active Projects
3

                                  Edit
```

Only surface relational metrics such as project counts if they can be derived reliably from the existing data without introducing fragile logic.

The architecture should, however, leave room for richer relational information later.

---

# Relationships Are Important

These company-data entities are not isolated configuration values.

Eventually they should communicate their relationships to the rest of the system.

Examples:

For People:
- Assigned to X active projects
- Current project roles
- Upcoming OOO
- Department membership

For Clients:
- X projects total
- X active projects
- Recent projects

Do not fabricate data or force all of these into this implementation if the underlying relationships are not currently available.

The UX architecture should make them possible later.

---

# System-of-Record Cues

Use restrained cues that reinforce that this is authoritative shared data.

Examples:

```text
18 records · SharePoint · Synced 11:48 AM
```

or equivalent use of the application's existing sync indicator.

The goal is not to make the screens visually heavy.

Authority should come from:

1. Persistent navigation/location
2. Read-first record presentation
3. Explicit edit state
4. Individual record actions
5. Relationship/context visibility
6. Sync/source information
7. Appropriate lifecycle handling
8. Consequences around destructive changes

Reuse the existing design system wherever possible.

Do not create an entirely separate visual language for Company Data.

---

# Consequential Actions

Where existing project relationships can be determined, prevent obviously destructive operations.

For example, if an employee is actively assigned to projects, eventual deactivation UX could communicate:

```text
Peter is assigned to 6 active projects.

Reassign those responsibilities before deactivating this person.
```

This does not necessarily need to be implemented now if the data relationships or archival system do not support it.

However, avoid designing the new UI around casual `X` removal buttons.

---

# Preserve Existing Functionality

The current People and Client modals contain working behavior tied to SharePoint persistence.

Before refactoring:

1. Identify all current state used by the People modal.
2. Identify all current state used by the Client modal.
3. Identify their SharePoint read/write paths.
4. Identify any temporary/copy state used before Save.
5. Identify dependencies elsewhere in the app on these datasets.
6. Preserve all existing capabilities.

This should primarily be a presentation / interaction / routing refactor.

Avoid unnecessary data-schema changes.

---

# Routing and Application Chrome

Review how the existing Project detail route behaves.

Use it as the precedent for creating a distinct application context.

When viewing:

```text
#/people
```

or:

```text
#/clients
```

timeline-specific controls that do not apply to that page should disappear.

Do not leave the user looking at a Company Data screen underneath a toolbar full of irrelevant timeline actions.

Retain appropriate global application chrome and navigation.

There should be a clear way back to the operational timeline.

A breadcrumb or equivalent navigation pattern would be appropriate:

```text
All Projects › People
```

```text
All Projects › Clients
```

Match the existing project's navigation language wherever possible.

---

# Modal Use Going Forward

Modals are still appropriate for bounded, temporary actions.

Examples:

- Add Person
- Edit Person
- Add Client
- Edit Client
- Confirmation
- Small contextual actions

They should no longer contain the entire People or Clients management environment.

In other words:

**The entity gets a page.  
The action may get a modal.**

If inline editing works better within the detail pane, that is also acceptable.

---

# Responsive Behavior

Maintain the application's current responsive behavior.

For a master/detail layout:

Desktop:
- list/table + persistent detail area is appropriate.

Narrow viewport:
- selecting a record may transition into the detail view rather than trying to maintain two cramped columns.

Do not force desktop tables into unusable mobile widths.

---

# Visual Direction

Stay within the existing Project Scheduler visual system.

Do not redesign the application aesthetically.

Specifically avoid:

- oversized dashboard cards
- excessive borders
- decorative enterprise UI
- gratuitous icons
- giant headings
- unnecessary whitespace
- making Company Data look like a different application

The pages should feel more authoritative because of **structure and interaction**, not because they are visually louder.

Continue the application's compact, information-dense character.

---

# Implementation Approach

Please:

1. Inspect the current implementation of the People and Client modals.
2. Inspect routing and the existing project-detail page behavior.
3. Identify the cleanest way to introduce `/people` and `/clients` without destabilizing the application.
4. Refactor the current modal content into dedicated application views.
5. Introduce read-first master/detail presentation.
6. Preserve all SharePoint persistence and current functionality.
7. Update navigation from Resources to Company Data where appropriate.
8. Rename People & Availability to People.
9. Ensure timeline-only controls do not appear when they are irrelevant.
10. Keep Add/Edit interactions appropriately scoped.
11. Verify navigation, editing, saving, cancellation, SharePoint sync, and return-to-timeline behavior.
12. Check for regressions anywhere existing client/person data is consumed.

Make changes incrementally and keep existing architectural patterns where they are sound.

---

# Acceptance Criteria

The work is successful when:

- Clicking `People` takes the user to a dedicated application page rather than opening the existing management modal.
- Clicking `Clients` does the same.
- Both pages feel like persistent company directories / datasets.
- Existing records are shown primarily in read mode.
- Editing requires an intentional user action.
- Add/edit functionality still works.
- SharePoint persistence still works.
- Existing project/client/person relationships continue working.
- Availability management still works.
- Navigation back to the timeline is obvious.
- Timeline-specific toolbar controls do not clutter Company Data pages.
- The pages use the existing Project Scheduler design system.
- The implementation does not introduce unnecessary data-model changes.
- Nothing suggests that these records are disposable temporary settings.
- The resulting UX establishes a reusable pattern for future company master-data sections.

---

# Larger Product Intent

This is part of a broader transition in the application.

The product began primarily as a scheduling/timeline tool, but it is becoming a company operational system whose underlying datasets are shared through SharePoint and consumed throughout the application.

The information architecture should therefore begin supporting a model closer to:

```text
TWOSEVEN

Timeline
My Dashboard
Projects

Company Data
    People
    Clients
```

Do not attempt a wholesale application redesign in this task.

The immediate goal is to establish **People and Clients as first-class, authoritative system entities** and create a UX pattern that can later be extended to other shared company data.