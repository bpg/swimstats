# Feature Specification: Swim Progress Tracker

**Feature Branch**: `001-swim-progress-tracker`  
**Created**: 2026-01-17  
**Status**: Draft  
**Input**: User description: "Build an application that can help me track progress of a competitive swimmer (my daughter) across the ages and seasons. It should track her current times across all competitive swimming disciplines for 25 and 50 meter courses (times), personal bests, and comparison against various time standards. Time standards can be added/removed/modified at any time, time standards are usually age-based. I also want to see graphs showing progress over time, and standing/difference against a specified standard."

**Context**: Canadian competitive swimmer  
**Platform**: Web application (browser-based, laptop/desktop primary use)  
**Scope**: Single swimmer initially, designed for easy expansion to multiple swimmers  
**Organization**: Course-centric (25m short course and 50m long course as primary data separation)

## User Scenarios & Testing *(mandatory)*

### User Story 0 - Select Course Context (Priority: P1)

As a swim parent, I want to select whether I'm viewing/entering data for the 25m (short course) or 50m (long course) season so that all information is relevant to the current competitive season.

**Why this priority**: The 25m and 50m seasons are fundamentally separate in competitive swimming - times are not comparable across course types. Making this selection explicit prevents confusion and mirrors how swimmers, coaches, and parents think about their data.

**Independent Test**: Can be fully tested by selecting a course type and verifying that all subsequent views (times, personal bests, comparisons, graphs) show only data for that course.

**Acceptance Scenarios**:

1. **Given** I open the application, **When** I start using it, **Then** I can clearly select whether I'm working with 25m or 50m data
2. **Given** I have selected 25m course, **When** I view any data (times, PBs, comparisons), **Then** I see only 25m data
3. **Given** I am viewing 25m data, **When** I want to see 50m data, **Then** I can easily switch course context
4. **Given** I switch from 25m to 50m context, **When** the view updates, **Then** all displayed data reflects the 50m course
5. **Given** I am entering a new time, **When** the entry form appears, **Then** it defaults to the currently selected course context

---

### User Story 1 - Record Swim Times (Priority: P1)

As a swim parent, I want to record my daughter's swim times from competitions and time trials so that I have an accurate history of all her performances.

**Why this priority**: Without the ability to record times, no other features (personal bests, comparisons, graphs) can function. This is the foundational data entry capability.

**Independent Test**: Can be fully tested by entering a swim time and verifying it appears in the swimmer's time history. Delivers immediate value by creating a permanent record of performances.

**Acceptance Scenarios**:

1. **Given** I am in the 25m or 50m course context, **When** I add a new time entry with event (stroke + distance), time, and date, **Then** the time is saved for the current course and appears in the swimmer's time history
2. **Given** I have entered times, **When** I view the time history for that event, **Then** I see all recorded times for the current course context, sorted by date with the most recent first
3. **Given** I made an error entering a time, **When** I edit or delete that time entry, **Then** the correction is saved and reflected throughout the system
4. **Given** I am entering a time, **When** I select an event, **Then** I can choose from all standard competitive swimming events (Freestyle, Backstroke, Breaststroke, Butterfly, IM at standard distances)

---

### User Story 2 - View Personal Bests (Priority: P1)

As a swim parent, I want to see my daughter's personal best times for each event so that I can quickly reference her fastest performances.

**Why this priority**: Personal bests are the most frequently referenced metrics in competitive swimming. Parents, coaches, and swimmers constantly need to know current best times for meet entries and goal-setting.

**Independent Test**: Can be fully tested by entering multiple times for the same event and verifying the system correctly identifies and displays the fastest time as the personal best.

**Acceptance Scenarios**:

1. **Given** multiple times have been recorded for an event in the current course, **When** I view personal bests, **Then** the system displays the fastest time for that event in the current course context
2. **Given** personal bests exist for multiple events, **When** I view the personal bests summary, **Then** I see all events with recorded times for the current course, showing the best time for each, organized by stroke
3. **Given** I enter a new time that is faster than the current personal best for that course, **When** I save the entry, **Then** the system updates the personal best and indicates it was a new best time
4. **Given** I switch between 25m and 50m course contexts, **When** I view personal bests, **Then** I see completely separate personal bests for each course (times are never mixed between courses)

---

### User Story 3 - Manage Time Standards (Priority: P2)

As a swim parent, I want to create and manage time standards (like regional qualifiers, club records, or motivational times) so that I can track my daughter's progress toward specific goals.

**Why this priority**: Time standards provide context and goals for swim times. Without standards, times are just numbers; with standards, parents can see meaningful progress toward qualifications.

**Independent Test**: Can be fully tested by creating a time standard with qualifying times for various events and age groups, then verifying the standard appears in the system and can be selected for comparisons.

**Acceptance Scenarios**:

1. **Given** I want to track progress toward a goal, **When** I create a new time standard with a name (e.g., "Swimming Canada Provincial 2026", "Ontario Age Group Champs"), **Then** the standard is created and available for adding qualifying times
2. **Given** I have created a time standard, **When** I add qualifying times for specific events and age groups, **Then** those times are saved and associated with the standard
3. **Given** a time standard exists, **When** I edit or update the qualifying times, **Then** the changes are saved and comparisons reflect the updated values
4. **Given** a time standard is no longer relevant, **When** I delete it, **Then** it is removed from the system and no longer available for comparisons
5. **Given** time standards are age-based, **When** I define a standard, **Then** I can specify different qualifying times for different age groups

---

### User Story 4 - Compare Times Against Standards (Priority: P2)

As a swim parent, I want to compare my daughter's times against a selected time standard so that I can see how close she is to achieving specific goals.

**Why this priority**: Comparisons give meaning to recorded times by showing progress toward goals. This is essential for motivation and planning.

**Independent Test**: Can be fully tested by selecting a time standard, then viewing a comparison that shows the swimmer's best times alongside the standard's qualifying times with the difference calculated.

**Acceptance Scenarios**:

1. **Given** personal bests exist and a time standard is selected, **When** I view the comparison, **Then** I see a side-by-side view of swimmer's times vs. standard times for each event
2. **Given** I am viewing a comparison, **When** a swimmer's time meets or beats the standard, **Then** it is visually highlighted as "achieved" or "qualified"
3. **Given** I am viewing a comparison, **When** a swimmer's time does not meet the standard, **Then** I see the time difference (how much faster they need to swim)
4. **Given** multiple time standards exist, **When** I want to compare against a different standard, **Then** I can easily switch between standards
5. **Given** the swimmer's age changes, **When** I view comparisons against age-based standards, **Then** the comparison uses the appropriate age group times

---

### User Story 5 - View Progress Graphs (Priority: P3)

As a swim parent, I want to see graphs showing my daughter's time progression over months and seasons so that I can visualize improvement trends.

**Why this priority**: Visualization helps identify trends that aren't obvious from raw numbers. While valuable, it builds on the data from P1 stories and is not required for basic tracking.

**Independent Test**: Can be fully tested by entering times for an event over multiple dates, then viewing a graph that shows time improvement over that period.

**Acceptance Scenarios**:

1. **Given** multiple times exist for an event, **When** I view the progress graph for that event, **Then** I see a line graph showing times (y-axis) over dates (x-axis)
2. **Given** I am viewing a progress graph, **When** times improve (get faster), **Then** the visual clearly shows downward progression (faster times = lower on graph)
3. **Given** a time standard is selected, **When** I view the progress graph, **Then** I see a horizontal reference line showing the standard's qualifying time for context
4. **Given** I want to analyze a specific period, **When** I filter by date range, **Then** the graph shows only times within that range
5. **Given** times exist across multiple seasons, **When** I view progress, **Then** I can see long-term improvement trends across years

---

### User Story 6 - View Standing Against Standard (Priority: P3)

As a swim parent, I want to see a dashboard showing my daughter's overall standing against a selected standard so that I can get a quick overview of qualification status across all events.

**Why this priority**: Provides a high-level summary view. Useful but less critical than the detailed comparisons in US4.

**Independent Test**: Can be fully tested by selecting a standard and viewing a summary that shows qualification status across all events with visual indicators.

**Acceptance Scenarios**:

1. **Given** a time standard is selected, **When** I view the standing dashboard, **Then** I see all events with indicators showing qualified/not-yet-qualified status
2. **Given** I am viewing the standing dashboard, **When** events are close to qualification (within a defined threshold), **Then** they are highlighted as "almost there"
3. **Given** I am viewing the standing dashboard, **When** I want details on a specific event, **Then** I can drill down to see the full comparison and history

---

### User Story 7 - Import Historical Results (Priority: P4 - Future)

As a swim parent, I want to import my daughter's historical swim results from online sources so that I don't have to manually enter years of past competition data.

**Why this priority**: This is a convenience feature that saves significant data entry time, but the application is fully functional without it. Additionally, the data source and technical approach are not yet determined. Marked as future/optional.

**Independent Test**: Can be tested by triggering an import for a swimmer and verifying historical times appear in the system with correct events, times, and dates.

**Acceptance Scenarios**:

1. **Given** I want to import historical data, **When** I initiate an import and provide required identifiers (swimmer name, club, or registration number), **Then** the system retrieves available historical results
2. **Given** results have been retrieved, **When** I review the imported data, **Then** I can see a preview before confirming the import
3. **Given** I confirm the import, **When** processing completes, **Then** all imported times appear in the swimmer's history and personal bests are recalculated
4. **Given** some imported times conflict with existing entries (same event, same date), **When** conflicts are detected, **Then** I can choose to skip, overwrite, or keep both
5. **Given** the import source is unavailable or returns errors, **When** the import fails, **Then** I see a clear error message and no partial data is saved

**Open Questions** (to be resolved before implementation):

- Data source: Potential sources include provincial swimming databases, Swimming Canada results, or meet results aggregators
- Technical approach: Direct API (if available), authorized data export, or manual file upload as fallback
- Anti-scraping considerations: May require user to manually export/download their data from source sites

---

### Edge Cases

- What happens when no times have been recorded yet? Display helpful empty state with guidance on how to add first time
- What happens when a time standard has no qualifying time for a specific event? Show "N/A" for that event in comparisons
- How does the system handle times recorded before the swimmer's birthday when comparing age-based standards? Use the swimmer's age at the time of the swim for standard comparisons
- What happens when a swimmer ages into a new age group mid-season? Automatically apply appropriate age group standards based on swim date and swimmer's age at time of competition (following Swimming Canada age determination rules: age as of December 31 of the competition year)
- How are tied times handled for personal bests? Display the most recent occurrence as the personal best
- What happens if historical import retrieves hundreds of times? Show progress indicator and allow cancellation; process in batches to avoid browser timeouts
- What happens when user switches course context while entering data? Prompt to save or discard unsaved changes before switching

## Requirements *(mandatory)*

### Functional Requirements

**Course Context**

- **FR-001**: System MUST provide clear selection between 25m (short course) and 50m (long course) contexts
- **FR-002**: System MUST maintain the selected course context across all views until explicitly changed
- **FR-003**: System MUST filter all displayed data (times, personal bests, comparisons, graphs) to the selected course context
- **FR-004**: System MUST default new time entries to the currently selected course context
- **FR-005**: System MUST clearly indicate the current course context at all times

**Swimmer Profile**

- **FR-010**: System MUST store swimmer information including name, birth date, and gender
- **FR-011**: System MUST calculate swimmer's current age and age on any given date
- **FR-012**: System MUST support a single swimmer profile initially, with data model designed to accommodate multiple swimmers in future updates

**Time Entry**

- **FR-020**: System MUST allow recording swim times with: event (stroke + distance), time (in minutes:seconds.hundredths format), date of swim (course type determined by current context)
- **FR-021**: System MUST support all standard competitive swimming events:
  - Freestyle: 50m, 100m, 200m, 400m, 800m, 1500m
  - Backstroke: 50m, 100m, 200m
  - Breaststroke: 50m, 100m, 200m
  - Butterfly: 50m, 100m, 200m
  - Individual Medley: 200m, 400m
- **FR-022**: System MUST store times separately for 25m and 50m courses (times are never mixed or converted between courses)
- **FR-023**: System MUST allow editing and deleting recorded times
- **FR-024**: System MUST validate time format and reject invalid entries
- **FR-025**: System MUST allow optional notes/context for each time entry (e.g., "Regionals", "Time Trial")
- **FR-026**: System MUST support quick entry workflow optimized for entering multiple times in succession (e.g., after a meet)

**Personal Bests**

- **FR-030**: System MUST automatically track personal best times for each event and course type combination
- **FR-031**: System MUST update personal bests when a faster time is recorded
- **FR-032**: System MUST display personal bests organized by stroke and distance within the current course context
- **FR-033**: System MUST indicate when a newly entered time is a personal best

**Time Standards**

- **FR-040**: System MUST allow creating custom time standards with a name and description
- **FR-041**: System MUST allow defining qualifying times for each event within a standard
- **FR-042**: System MUST support age-group-based standards following Swimming Canada age brackets (10&Under, 11-12, 13-14, 15-17, Senior/Open)
- **FR-043**: System MUST allow editing and deleting time standards
- **FR-044**: System MUST allow importing time standards from structured data (for convenience when adding Swimming Canada or provincial standards)
- **FR-045**: System MUST support defining standards for either or both course types (25m/50m)
- **FR-046**: System MUST include pre-loaded time standards for all age groups and events:
  - Swimming Canada national standards (Provincial, Western/Eastern Canadian, Junior National, Senior National)
  - Swim Ontario provincial standards
- **FR-047**: System MUST display only standards applicable to the current course context in comparisons

**Comparisons**

- **FR-050**: System MUST compare swimmer's personal bests against a selected time standard within the current course context
- **FR-051**: System MUST calculate and display time difference between swimmer's time and standard
- **FR-052**: System MUST visually indicate when a standard has been achieved
- **FR-053**: System MUST use age-appropriate standard times based on swimmer's age at time of swim
- **FR-054**: System MUST allow switching between different standards for comparison (within current course)

**Progress Visualization**

- **FR-060**: System MUST display line graphs showing time progression for any event within the current course context
- **FR-061**: System MUST show time standard reference lines on progress graphs when a standard is selected
- **FR-062**: System MUST allow filtering graphs by date range
- **FR-063**: System MUST display times with faster times shown lower on the y-axis (intuitive for improvement)
- **FR-064**: System MUST show data points with dates on hover/selection

**Data Management**

- **FR-070**: System MUST persist all data so it survives browser sessions and page refreshes
- **FR-071**: System MUST allow exporting all data for backup purposes (downloadable file)
- **FR-072**: System MUST allow importing previously exported data for restoration
- **FR-073**: System MUST work in modern web browsers (Chrome, Firefox, Safari, Edge)

**Historical Import (Future/Optional)**

- **FR-080**: System SHOULD support importing historical swim results from external sources
- **FR-081**: System SHOULD provide a preview of imported data before committing
- **FR-082**: System SHOULD detect and handle conflicts between imported and existing times
- **FR-083**: System SHOULD support manual file upload as a fallback import method (CSV or structured format)

### Key Entities

- **Swimmer**: The athlete being tracked; attributes include name, birth date, gender
- **Time Entry**: A recorded swim performance; attributes include event, course type, time value, date, optional notes; linked to Swimmer
- **Event**: A swimming discipline; attributes include stroke (Freestyle, Backstroke, Breaststroke, Butterfly, IM) and distance (50m, 100m, 200m, etc.)
- **Course Type**: The pool length; either 25m (short course) or 50m (long course)
- **Time Standard**: A named collection of qualifying times; attributes include name, description, course type applicability
- **Standard Time**: A qualifying time within a standard; attributes include event, time value, age group (min/max age); linked to Time Standard
- **Personal Best**: Derived from Time Entries; the fastest time for each event/course combination

### Assumptions

- Web-based application accessed via browser, optimized for laptop/desktop use
- Course-centric organization: 25m (short course) and 50m (long course) are treated as separate contexts reflecting the seasonal nature of competitive swimming
- Times from 25m and 50m courses are never mixed, compared, or converted - they are fundamentally different
- Initially tracks one Canadian competitive swimmer, but data architecture supports future expansion to multiple swimmers
- Times are primarily entered manually by the user; historical import is a future convenience feature
- Age groups in time standards follow Swimming Canada conventions (typically 10&Under, 11-12, 13-14, 15-17, Senior/Open)
- Swimming Canada national time standards are pre-loaded and may require periodic updates when Swimming Canada publishes new standards
- Users understand competitive swimming terminology (strokes, events, course types)
- Data is stored persistently (browser local storage or server-side) so it survives browser sessions
- Historical import feature (P4) depends on identifying a viable data source; may require manual CSV upload if automated retrieval is not feasible due to anti-scraping protections

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can record a new swim time in under 30 seconds
- **SC-002**: Users can enter multiple times from a meet (5+ events) in under 3 minutes using quick entry
- **SC-003**: Users can view personal bests for all events on a single screen
- **SC-004**: Users can create a complete time standard (all events for one age group) in under 5 minutes
- **SC-005**: Users can see comparison against a standard within 2 clicks from any screen
- **SC-006**: Progress graphs load and display within 2 seconds for up to 500 recorded times
- **SC-007**: System correctly identifies personal bests 100% of the time when new times are entered
- **SC-008**: Age-based standard comparisons correctly apply the swimmer's age at time of swim
- **SC-009**: All data persists correctly across application restarts with zero data loss
- **SC-010**: Users can export and re-import all their data without any loss or corruption
- **SC-011**: New users can understand how to add their first time without external documentation
