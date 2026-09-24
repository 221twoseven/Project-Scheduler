# Project Scheduler — Project History

**Prepared:** 2026-09-03 · **Status:** internal project documentation

A concise record of how the TwoSeven Project Scheduler evolved from an experimental prototype into a developing company-wide operational system.

---

## Origin

- TwoSeven's need for better **project scheduling and capacity forecasting** predates the application.
- Project, staffing, installation, calendar, and related information has historically been distributed across numerous independently maintained documents and systems.
- The original developer created an **experimental scheduling prototype**, iterated through REV1–50.
- The prototype established:
  - the core Gantt-style scheduling concept;
  - backward scheduling from installation dates;
  - the initial UI and interaction language;
  - the single-file application architecture;
  - SharePoint/Microsoft Graph persistence;
  - Microsoft authentication.
- REV50 is preserved unchanged in the repository as the baseline for subsequent development.

## Productization

Beginning August 2026, the prototype was taken forward as a maintainable application intended for broader organizational use.

- Expanded and refined core **scheduling, forecasting, project-management, navigation, and interaction workflows**.
- Added major capabilities including:
  - identity and personalized views;
  - permissions;
  - company people and client management;
  - feedback/reporting;
  - onboarding and application guidance;
  - expanded SharePoint and Microsoft Graph integration.
- Migrated development into a **company-owned GitHub repository**.
- Established:
  - version control;
  - development and production environments;
  - regression testing;
  - automated deployment;
  - release management and rollback;
  - milestone and decision records;
  - architecture and contributor documentation.
- Preserved the inherited REV50 prototype as an immutable reference so inherited and subsequent work remain distinguishable.

## User-Informed Development

- Development has included repeated **testing and review with colleagues**, rather than relying solely on developer judgment.
- Testing has included:
  - exploratory “try to break it” sessions;
  - stakeholder walkthroughs and review;
  - live-use bug reports;
  - iterative re-testing after changes.
- Feedback and observations are translated into requirements, fixes, refinements, or documented decisions not to change behavior.
- Existing employee workflows are treated as **compatibility and adoption requirements** where appropriate.
- An in-app feedback system now provides an ongoing channel for bug reports and feature requests.

## Systems Consolidation

- The current operational environment includes roughly **14 independently maintained data sources**, including SharePoint lists and Excel documents stored in SharePoint.
- These contain overlapping project, client, staffing, calendar, installation, availability, and operational information, often without referencing one another.
- The Project Scheduler is being developed to become a **shared source of truth**, rather than another parallel tracking document.
- Current work includes:
  - inventorying existing systems;
  - identifying authoritative upstream records;
  - reconciling overlapping data;
  - preserving useful existing workflows;
  - integrating appropriate sources;
  - planning retirement of redundant manual records.
- Consolidation is ongoing; existing systems are not being retired until their replacement has been validated in live use.

## Attribution

- **Organizational need:** already recognized within TwoSeven.
- **Original developer:** application concept, REV1–50 prototype, core scheduling model, architecture, and initial design language.
- **TwoSeven colleagues:** existing workflows, operational knowledge, testing, feedback, requirements, and stakeholder direction.
- **Current development:** productization; substantial functional and UX development; user-testing administration and feedback synthesis; development infrastructure; release and documentation systems; organizational-data integration; systems consolidation; deployment; and ongoing product stewardship.

**The current effort is not the origin of the idea. Its contribution is carrying an experimental prototype into organizational use and building the product, development practices, and information systems required for it to become maintainable company infrastructure.**