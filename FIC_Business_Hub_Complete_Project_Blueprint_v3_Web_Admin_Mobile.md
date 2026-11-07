# FIC BUSINESS HUB

## Complete Project Blueprint & Development Specification

**Document type:** Consolidated BRD + PRD + SRS + Solution
Architecture + Technical Design + UX Specification + Data/API Design +
Security + QA + Deployment + Roadmap\
**Version:** 3.0 (Web + Admin + React Native Mobile Application)\
**Status:** Updated Architecture Baseline – Mobile Application Added\
**Prepared for:** FIC Business Hub\
**Technology direction:** MERN + TypeScript + Turborepo + pnpm + Motion for React + React Native CLI\
**Date:** November 2026

------------------------------------------------------------------------

# Document Control

  Field                  Details
  ---------------------- ----------------------------------------------------------
  Project                FIC Business Hub
  Document               Complete Project Blueprint & Architecture Baseline
  Version                3.0
  Status                 Updated Architecture Baseline – Mobile Application Added
  Owner                  FIC (Federation of Indian Chambers / Business Hub Governance)
  Primary applications   Member Web (`apps/web`), Admin Web (`apps/admin`), Member Mobile (`apps/mobile`)
  Backend                Shared Modular Monolith API (`apps/backend`)
  Primary database       MongoDB (Mongoose ODM)
  Architecture           Turborepo + pnpm monorepo with centralized dynamic RBAC
  Core Governance Model  FIC Intermediary Governance (Direct partnerships retired to prevent business bypass)

## Document Evolution & Key Architectural Updates (v1.0 → v3.0)

1. **FIC Intermediary Governance Enforcement**: Standalone unmediated "Partnerships" have been permanently removed from the application architecture to prevent direct member-to-member bypass. All B2B trade inquiries, supplier discovery, subcontractor sourcing, and OEM tie-ups flow through the **Universal Services Marketplace**, **Enterprise Scaling Desk**, and **Facilitated Meetings Desk**. The legacy `/partnerships` route permanently redirects to `/my-requests`.
2. **Distinct Advisory Desks**:
   - **Business Ideas & Incubation Desk (`/business-ideas`)**: Focuses on **Stage 0 → 1** pre-launch concept validation, bilateral NDA protection, automated 3-metric feasibility scoring (Market Viability, Technical Feasibility, Commercial Scalability), and mentor review notes.
   - **Business Development & Enterprise Scaling (`/business-development`)**: Focuses on **Stage 1 → 10** operational bottleneck turnaround for existing operational enterprises, factory floor lean optimization, cloud ERP modernization, regional distributor channel expansion, and phased diagnostic roadmaps.
3. **Dedicated Student & Mentor Ecosystem**: Full specialized portals for:
   - **Student Talent & Skill Development (`/skill-development`)**: Masterclass discovery filtered by domain and language (Tamil, English, etc.), and 1-on-1 consultation booking.
   - **Mentor / Trainer Workspace (`/my-services`, `/my-requests`)**: Streamlined masterclass video upload form (Topic Domain, Language, Video File Upload, Duration, Curriculum), teaching services catalog, and consultation management (`Accept`, `Reject`, `Reschedule`, `Complete & Log Audit`).
4. **Motion for React Design System**: Migration to official `motion/react` v12+, standardized motion tokens, and layout-level zero-opacity protection to guarantee 100% viewport visibility on route navigation.
5. **React Native CLI Mobile Application**: Added `apps/mobile` as a native Android/iOS member app using React Native CLI + TypeScript, sharing the existing backend APIs, identity, dynamic configuration, membership/KYC rules and FIC intermediary governance. The Admin Portal remains web-only.
6. **Warm Ivory & Soft Sand Luxury Theme**: Sophisticated multi-color Warm Ivory (`#FAF7F2`) surface with deep Earth Brown text (`#51463F`, `#453A33`) exceeding WCAG AAA contrast (> 7.5:1 ratio).

------------------------------------------------------------------------

# 1. Executive Summary

FIC Business Hub is a membership-based, intermediary-governed business,
professional and opportunity ecosystem. It brings eligible individuals,
MSMEs, manufacturers, freelancers, investors, mentors and students into
one trusted platform so they can discover capabilities, offer verified
services, validate business ideas, request enterprise scaling advisory,
access confidential private deal rooms, schedule expert consultations,
and engage in skill development.

The platform is neither a passive business directory nor an open,
unmoderated marketplace. **FIC acts as the sole coordinating intermediary
for all member-to-member business interactions.** Public listings never
expose private contact details or company identities; all inquiries,
tenders, and introductions are reviewed, verified, and facilitated
directly through FIC governance to protect the business model and
prevent off-platform bypass.

The monorepo encompasses two web applications, one React Native mobile application and one shared backend API:
1. **FIC Business Hub Member Portal (`apps/web`):** Public marketing landing,
   dynamic registration, authenticated member workspace, universal services
   marketplace, incubation desk, enterprise scaling desk, private deal room,
   and student/mentor portals (Port 5173).
2. **FIC Admin Portal (`apps/admin`):** Super Admin, Admin, and Verification
   Executive operations workspace for KYC approvals, marketplace listing audits,
   scaling roadmaps, and meeting moderation (Port 5174).
3. **Shared Backend API (`apps/backend`):** High-performance Express + TypeScript
   modular monolith connected to MongoDB (Port 5000).
4. **FIC Business Hub Mobile App (`apps/mobile`):** Native Android and iOS member application built with React Native CLI (bare workflow) and TypeScript. It consumes the same versioned backend APIs and business rules as the member website. It is a member-facing app; the Admin Portal remains a web application.

The member workspace is dynamically configured from a single source of truth
(`apps/web/src/services/dashboardConfig.ts`). Upon authentication, members
receive role-tailored navigation, KPIs, action cards, and specialized tracks
optimized for their specific industry track.

------------------------------------------------------------------------

# 2. Business Requirements Document (BRD)

## 2.1 Business vision

**Vision:** Bring every eligible enterprise, professional, innovator and
student into one trusted ecosystem and empower them to discover, offer
and execute business opportunities through FIC intermediary governance.

**Positioning statement:**\
"One Platform. Unlimited Opportunity Ecosystem."

## 2.2 Business objectives

-   Build a broad membership ecosystem for individuals and organizations aged 18 and above.
-   Allow members to both publish verified service capabilities and submit requirements.
-   Make approved services discoverable across all 10 business sectors via a Universal Marketplace.
-   Enforce FIC-mediated business introductions and eliminate direct unmoderated bypass.
-   Provide a dedicated **Incubation Desk** for early-stage (0 → 1) business ideas with structured feasibility scoring.
-   Provide an **Enterprise Scaling Desk** for operational (1 → 10) businesses facing bottlenecks.
-   Enable a **Confidential Private Deal Room** for institutional investment and capital syndication under strict non-disclosure.
-   Provide an integrated **Student & Mentor Ecosystem** for academic guidance, skill development masterclasses, and paid faculty consultations.
-   Deliver dynamic, role-tailored member dashboards from a unified code architecture.
-   Provide robust operations tooling for FIC staff to moderate requests, assign specialists, and manage KYC verification.

## 2.3 Target audiences

The platform must not be limited to the examples below. Categories and
subcategories must be configurable.

-   Business owners and entrepreneurs
-   Startup founders and business idea owners
-   Manufacturers, textile and garment businesses
-   Retailers, wholesalers, distributors and traders
-   Investors and funding seekers
-   Freelancers, developers and IT professionals
-   Students, teachers, mentors and trainers
-   Consultants and professional service providers
-   Agriculture and allied-business participants
-   Healthcare and wellness professionals
-   Creative and media professionals
-   Job seekers, unemployed individuals and retired professionals
-   Skilled workers and other eligible individuals

## 2.4 Business model

### Membership pricing -- current approved direction

  Membership period                   Fee
  --------------------- -----------------
  First year                          ₹99
  Second year onwards     ₹5,999 per year

-   The same membership fee applies across categories.
-   The first-year ₹99 offer must be clearly described as a first-year
    introductory offer.
-   Do not show fake crossed-out prices, fake savings or countdown
    timers.
-   Final tax treatment, GST display, invoice format, refunds,
    cancellation, renewal reminders and auto-renewal policy require FIC
    approval.
-   Payment does not itself activate full dashboard access.
-   KYC resubmission after rejection or additional-document request must
    not trigger a second membership charge.

### Potential future revenue

Membership fees are the currently defined revenue model. Other models
such as sponsored listings, premium promotion, business consultancy fees
or transaction fees must not be enabled until FIC defines pricing,
terms, operational ownership and legal treatment.

## 2.5 FIC intermediary model

FIC coordinates member-to-member requests. Public members see service
information but not provider identity or private contact information. A
member submits a request to FIC. FIC reviews the request, collects
requirements, identifies suitable providers internally, contacts the
provider and coordinates next steps.

The product must clearly explain what FIC does and does not guarantee. A
request, introduction or meeting must not be represented as a guarantee
of service delivery, funding, investment, partnership or business
success.

## 2.6 Business scope

### In scope for the planned product

-   Public landing page and information pages
-   Native Android and iOS FIC Business Hub member application built with React Native CLI
-   Signup, login and age eligibility validation
-   Dynamic main category and subcategory selection
-   Dynamic registration forms
-   Membership payment and renewal management
-   Category-specific KYC
-   Admin KYC review and resubmission
-   Dynamic member dashboard
-   Universal service discovery
-   Service listing submission and approval
-   FIC-mediated service requests
-   Business ideas and opportunities
-   Business development and scaling requests
-   Private investment-readiness and funding-interest workflows
-   Business tie-ups and partnerships
-   Business networking
-   Mentoring operations
-   Admin operations, reporting and audit trails
-   Notifications and member communication

### Out of scope until separately approved

-   Direct member-to-member contact disclosure
-   Unmoderated public member directory
-   Direct student-to-mentor payments
-   FIC custody of investment funds
-   Securities trading, public investment exchange or deposit-taking
-   Lending, investment solicitation or regulated financial activities
    without required legal approvals
-   Guaranteed funding, guaranteed returns or guaranteed business
    outcomes
-   Automatic legal, tax or investment advice
-   Any unapproved payment split, escrow or wallet model

## 2.7 Business success measures

Proposed metrics, not guaranteed targets: - Registration completion
rate - Payment success rate - KYC submission and approval turnaround
time - Active paid members - Membership renewal rate - Number of
approved service listings - Service request volume -
Request-to-provider-match rate - Request completion rate - Business
development requests handled - Partnership/networking introductions -
Member satisfaction and complaint rate - Mentor session completion and
feedback metrics

Metric definitions and reporting windows must be documented before
dashboards are treated as authoritative.

------------------------------------------------------------------------

# 3. Product Requirements Document (PRD)

## 3.1 Product structure

### Website 1: FIC Business Hub

Suggested domain: `www.ficapp.in`

Contains: - Public landing and informational pages - Get Started
introduction - Signup and login - Dynamic registration - Membership
checkout - KYC upload and application tracking - Member dashboard -
Universal marketplace - Service request experience - Business ideas and
business development - Investment and funding interest - Partnerships
and networking - Mentoring - Notifications, profile and support

### Website 2: FIC Admin Portal

Suggested domain: `admin.ficapp.in`

Contains: - Super Admin workspace - Admin workspace - Verification
Executive workspace - Category and subcategory management - Dynamic form
and dashboard configuration - Member and membership operations - KYC
verification - Service listing moderation - Request and opportunity
management - Investment/funding request review - Mentor operations -
Reports, complaints and audit logs

### Mobile application: FIC Business Hub

A dedicated Android and iOS application for members, built with React Native CLI (not Expo managed workflow, not a WebView wrapper). It provides the member-facing registration, membership, KYC, dashboard, marketplace, requests, mentoring, meetings, notifications and profile journeys through the shared backend. Native app store distribution, push notifications, deep links, device permissions and mobile release management are in scope.

### Shared backend

Suggested domain: `api.ficapp.in`

One backend serves both websites. Do not create separate backend
applications for each category.

## 3.1.1 Native Mobile Application – Product Requirements

### Platforms and technology

- Build a dedicated **React Native CLI (bare React Native) + TypeScript** application for Android and iOS.
- Do not use Expo managed workflow, a WebView wrapper, Flutter, or React Native Web as a substitute.
- Use React Navigation with a typed navigation tree; use native stack navigation and bottom tabs where appropriate.
- Use the same Express API, MongoDB-backed records, membership rules, KYC decisions, dynamic category configuration and FIC intermediary governance as the web member portal.
- The mobile app is a member application only. Super Admin, Admin and Verification Executive continue using `apps/admin`; do not build a separate native admin app in this scope.
- Select mutually compatible stable React Native, Android Gradle Plugin, Gradle, Kotlin, JDK, Xcode and iOS deployment-target versions at implementation time. Record the chosen compatibility matrix; do not blindly pin outdated versions from examples.

### Mobile information architecture

Use a role/category-aware navigation structure resolved from the authenticated member and published dashboard configuration.

Suggested primary bottom navigation:
- Home
- Marketplace
- My Requests
- Notifications
- Profile

Additional modules should open from dashboard shortcuts or a secondary menu and remain permission-aware:
- Business Ideas
- Scaling (only where applicable)
- Investment
- Meetings
- My Services (where applicable)
- Skill Development (student track)

Do not add a Partnerships tab or direct member-to-member partnership feature. All business requests and introductions remain FIC-mediated.

### Mobile feature scope

1. Public welcome, sign in, registration and age eligibility.
2. Dynamic category and exactly-one-primary-subcategory selection.
3. Dynamic registration forms, common address capture and validation.
4. Membership plan display, secure checkout handoff and payment status.
5. KYC checklist, camera/gallery/document picker upload, submission tracking and resubmission.
6. Dynamic role/subcategory-specific dashboard, KPI cards and action shortcuts.
7. Universal Marketplace with search, filters, privacy-safe service details and Request through FIC.
8. My Requests with Marketplace Requests, Student Requests or Mentor Requests as appropriate to the member role; status history and FIC communications.
9. Business Ideas / Incubation submission and tracking.
10. Enterprise Scaling request and roadmap tracking where the member configuration allows it.
11. Investment/funding interest submission and private status tracking; no public exposure of sensitive amounts or profiles.
12. Meetings list, request/scheduling status and confirmed meeting details.
13. Student Skill Development: masterclass discovery by topic/language and 1-on-1 mentor consultation request.
14. Mentor workspace: teaching service management, masterclass video upload where supported, incoming student requests, accept/reject/reschedule/complete audit actions.
15. My Services: create, edit, submit and track the member's own service listings.
16. Notifications with read/unread state and deep links to the relevant screen.
17. Profile, membership status, KYC status, payment history and account settings.
18. Support, complaint submission and legal/privacy pages.

### Mobile-specific UX

- Design mobile-first native screens, not compressed desktop pages.
- Support Android back behaviour, safe areas, keyboard avoidance, accessible touch targets, loading/skeleton states, empty states, retry states and offline/error messaging.
- Use responsive layouts for small and large phones and tablets.
- Support system font scaling and screen readers.
- Provide pull-to-refresh only where it is useful and safe.
- Use native share sheet for sharing permitted public referral/invitation links if that feature is enabled.
- Do not display private provider identity/contact details, confidential investment data or internal FIC notes to unauthorized members.
- Respect the same FIC brand system: Warm Ivory / Soft Sand base, deep earth-brown text and coral, amber, teal and violet accents with accessible contrast.

### Native device capabilities

- Camera and photo-library access for KYC documents and permitted profile uploads.
- Document picker for PDF/JPG/PNG and other explicitly allowed file types.
- Secure OS-backed token storage (Keychain on iOS and Android Keystore-backed storage through a maintained secure-storage library).
- Push notifications through Firebase Cloud Messaging (Android) and APNs (iOS), normally integrated through FCM where appropriate.
- Deep links / Universal Links / Android App Links for notification and email destinations.
- Optional biometric unlock only as a convenience layer after server authentication; never use biometrics as a replacement for backend authorization.
- Network status awareness and safe retry handling; do not silently queue payments or sensitive KYC actions for later submission.

### Mobile payment rules

- Membership checkout must use the approved payment provider's supported mobile SDK or secure hosted checkout flow.
- Never collect or store raw card, UPI PIN, banking credentials or payment secrets in the app.
- The app must never mark a payment as successful based only on a client callback. Backend webhook verification remains the source of truth.
- Handle app interruption, payment cancellation, pending state, duplicate callbacks, retry and reconciliation.
- Do not introduce an in-app wallet, money custody, investment transfer or unapproved payment split.

### Mobile session and access rules

- Apply the same activation gate as web: account ACTIVE AND payment PAID AND KYC APPROVED AND membership ACTIVE.
- Enforce authorization on backend APIs; hiding a screen is not security.
- Handle access/refresh token rotation, expiry, logout, revoked sessions and account suspension.
- Clear local sensitive caches and tokens on logout or account revocation.
- Avoid storing KYC documents or confidential investment data in unencrypted app storage.

### Mobile acceptance criteria

- Android and iOS builds install and launch on supported OS versions.
- Registration, payment status, KYC, dashboard, marketplace, requests and profile use live shared APIs, not mock-only data.
- Dynamic category/subcategory and role-based features match the web portal.
- Push notification permission is requested contextually; notifications navigate to the correct authorized screen.
- Uploads handle permissions denied, cancellation, file-size/type validation and network failure.
- Session expiry, logout, account suspension and KYC changes are handled correctly.
- No direct partnership bypass, provider identity leakage or unauthorized financial disclosure exists.
- Accessibility, device-size, performance, security and store-release checks pass.

## 3.2 Landing page

### Hero section

Suggested headline: **One Platform. Unlimited Business Opportunities.**

Suggested supporting copy:\
"Connect with business opportunities, discover professional services,
explore investments, build partnerships and grow your business with
FIC."

Primary CTA: **Get Started**\
Secondary CTA: **Explore Opportunities**

### Landing page sections

1.  Hero
2.  About FIC Business Hub
3.  Who Can Join?
4.  Business Ideas and Opportunities
5.  Business Development and Scaling
6.  Services Marketplace
7.  Investment and Funding Connections
8.  Business Tie-ups and Partnerships
9.  Networking
10. How FIC Works
11. Membership
12. FAQs
13. Contact and Support
14. Footer and legal links

Design must be professional, clear, responsive and accessible. Avoid
presenting every feature in the hero area.

## 3.3 Get Started introduction page

When a visitor clicks Get Started, show a simple, pleasant introduction
page before registration.

Suggested heading: "Welcome to FIC Business Hub"\
Suggested supporting copy: "Your next business opportunity starts here."

Explain briefly: - Join the business ecosystem. - Discover services and
opportunities. - Share your business requirements. - Connect through
FIC. - Explore partnerships and investment opportunities.

Display: - First-year membership: ₹99 - Renewal from second year
onwards: ₹5,999/year - Validity and renewal terms - Applicable tax
treatment - Refund/cancellation terms - Support and legal links

CTA: **Continue Registration**

## 3.4 Registration journey

1.  Basic account details.
2.  Verify age eligibility (18+).
3.  Select exactly one primary main category.
4.  Load subcategories for that category.
5.  Select exactly one primary subcategory.
6.  Load the dynamic details form.
7.  Validate and save registration details.
8.  Collect first-year membership payment.
9.  Verify payment server-side.
10. Present dynamic KYC requirements.
11. Submit KYC application.
12. Show application tracking.
13. Admin reviews documents.
14. Member supplies corrections/additional documents if requested.
15. Once all access conditions are met, activate the member dashboard.

The final UX may split these into screens or steps, but the business
sequence and state rules must remain consistent.

## 3.5 Initial main categories

The initial ten categories are:

1.  Business & Entrepreneurship
2.  Manufacturing & Industrial
3.  Technology & Digital
4.  Education & Knowledge
5.  Professional & Personal Services
6.  Agriculture & Natural Resources
7.  Investment & Finance
8.  Healthcare & Wellness
9.  Creative, Media & Lifestyle
10. Employment, Community & Social Development

Examples of subcategories:

  -----------------------------------------------------------------------
  Main category                       Illustrative subcategories
  ----------------------------------- -----------------------------------
  Business & Entrepreneurship         Business owner, startup founder,
                                      entrepreneur, retailer, wholesaler,
                                      distributor, trader, franchise
                                      owner, business idea owner

  Manufacturing & Industrial          Textile manufacturer, garment
                                      manufacturer, factory owner,
                                      industrial supplier, machinery
                                      manufacturer, food processor

  Technology & Digital                Software developer, IT
                                      professional, freelancer, AI
                                      professional, cybersecurity,
                                      digital marketing, technology
                                      startup

  Education & Knowledge               Student, teacher / professor,
                                      mentor / trainer, tutor, researcher,
                                      educational consultant

  Professional & Personal Services    Consultant, lawyer, accountant,
                                      architect, designer, photographer,
                                      mechanic, electrician, technician,
                                      skilled professional

  Agriculture & Natural Resources     Farmer, landowner, dairy,
                                      fisheries, livestock,
                                      agri-business, agri-consultant

  Investment & Finance                Investor, startup investor, funding
                                      seeker, financial consultant,
                                      investment professional

  Healthcare & Wellness               Doctor, nurse, clinic, hospital,
                                      healthcare professional, wellness
                                      and fitness professional

  Creative, Media & Lifestyle         Artist, musician, actor, content
                                      creator, fashion designer, event
                                      organizer, writer

  Employment, Community & Social      Job seeker, fresher, unemployed
  Development                         individual, retired professional,
                                      volunteer, NGO, social worker
  -----------------------------------------------------------------------

These are seed records, not hardcoded application enums. Admin must be
able to add, edit, deactivate and reorder categories and subcategories.

A user has exactly one primary main category. Multiple subcategories may
be allowed only within that same category when configuration permits.

## 3.6 Dynamic details forms

Forms must be configuration-driven.

Example fields: - Textile manufacturer: business name, manufacturing
type, products, capacity, experience, location, applicable
registrations. - Student: education level, institution, course, skills,
career interests and mentoring needs. - Investor: preferred sectors,
investment range, investment readiness and preferred business stage. -
Freelancer: skills, experience, portfolio, services and availability.

Supported field types: - Text and textarea - Number and currency range -
Email, phone and URL - Date - Single-select dropdown - Multi-select -
Radio - Checkbox - File upload - Address/location fields - Conditional
sections - Repeatable groups, if needed

Every field configuration should support: - Stable field key - Label and
help text - Field type - Required/optional - Validation rules - Options
or option source - Conditional visibility - Display order -
Sensitive-data classification - Version and publication state

Do not execute arbitrary JavaScript from database form configurations.
Use a safe, predefined rule schema.

## 3.7 Membership and KYC

Payment statuses: - PENDING - PAID - FAILED - REFUNDED -
PARTIALLY_REFUNDED, only if provider and policy support it

Membership statuses: - PENDING - ACTIVE - EXPIRED - CANCELLED -
SUSPENDED

KYC statuses: - NOT_STARTED - PENDING - UNDER_REVIEW -
ADDITIONAL_DOCUMENT_REQUIRED - APPROVED - REJECTED

Account statuses: - ACTIVE - SUSPENDED - BLOCKED

Full access requires: - Account ACTIVE - Payment PAID - KYC APPROVED -
Membership ACTIVE

A renewal must not bypass an account block, suspension or revoked KYC
decision. Define how an approved KYC application is rechecked if
documents expire or a material profile change occurs.

## 3.8 Dynamic Role-Based Member Dashboard

One unified, dynamic frontend dashboard architecture driven by a single source
of truth (`apps/web/src/services/dashboardConfig.ts`), avoiding disparate codebases.

### Centralized Navigation & Roles
The top navigation header dynamically adapts according to the member's subcategory:

1. **Default Business Track (Business Owner, MSME, Manufacturer, Freelancer, Trader)**:
   - Header Tabs: `Dashboard`, `Marketplace`, `Business Ideas`, `Scaling`, `Investment`, `Meetings`, `My Requests`, `My Services`.
2. **Student Track**:
   - Header Tabs: `Dashboard`, `Marketplace`, `Business Ideas`, `Investment`, `Meetings`, `My Requests`, `Skill Development`.
3. **Mentor / Trainer Track**:
   - Header Tabs: `Dashboard`, `Marketplace`, `Business Ideas`, `Investment`, `Meetings`, `My Requests`, `My Services`.
4. **Professor / Faculty Track**:
   - Header Tabs: `Dashboard`, `Marketplace`, `Business Ideas`, `Investment`, `Meetings`, `My Requests`, `My Services`.

### Dashboard Architecture Components
- **Welcome & Identity Hero**: Displays member fullName, dynamic subcategory badge, account status, membership validity pill, and KYC verification status.
- **Dynamic KPI Stat Cards**: 4 responsive stat cards tailored to the member's subcategory (e.g. Registered Students, My Teaching Services, Client Inquiries, Active Deal Rooms).
- **Opportunity Actions & Services**: High-impact shortcut grid (7 to 8 actions) linking to core modules, explicitly labeled as *"Moderated by FIC Intermediary Governance"*.
- **Specialized Track Card**: A high-touch spotlight banner with key domain metrics (e.g. Student Talent Accelerator, Universal Service Marketplace Showcase).

## 3.9 Universal Services Marketplace (`/marketplace`)

Every eligible member can discover all approved, active services across **10 business sectors**
(Business & Entrepreneurship, Manufacturing, Technology, Education, Professional Services,
Agriculture, Investment & Finance, Healthcare, Creative Media, Employment & Community).

### Privacy & Governance Protocol
- Public listings **never** expose provider personal name, company name, private phone, private email, or direct contact links.
- Backend strictly enforces field-level privacy at the API layer.
- Member-to-member communication is coordinated directly by FIC Officers to eliminate spam and bypass.
- Public fields: Service title, category, subcategory, verified deliverables list, industry tags, FIC verification badge, response timeframe, and *"Request Service through FIC"* CTA.

## 3.10 Service Request Workflow

Lifecycle:
`SUBMITTED` → `UNDER_REVIEW` → `REQUIREMENTS_COLLECTED` → `ASSIGNED_TO_PROVIDER` → `PROPOSAL_SHARED` → `ACCEPTED` → `IN_PROGRESS` → `COMPLETED` → `CANCELLED` / `DISPUTED`.

1. Member submits a requirement for an approved marketplace service.
2. Request appears in member's **My Requests** desk (`/my-requests?tab=services`).
3. FIC Desk evaluates scope, confirms member eligibility, and coordinates with the service provider.
4. Proposal and deliverables are shared under FIC moderation.

## 3.11 Advisory Desks: Business Ideas vs Enterprise Scaling

The platform clearly distinguishes between early-stage innovation and existing business turnaround:

### 3.11.1 Business Ideas & Incubation Desk (`/business-ideas`) — *Stage 0 → 1*
Designed for innovators, students, researchers, and early entrepreneurs validating a **new concept**:
- **Form Inputs**: Idea Title, Detailed Concept Description, Target Market / Geography, Current Maturity Stage (*Idea on Paper, Prototype/MVP, Early Traction, Growth*), and Support Needed (*Idea Validation, Business Plan Preparation, Technology/MVP Development, Mentoring & Advisory, Regulatory Setup, Go-to-Market Strategy*).
- **IP Protection Guarantee**: Submissions are protected by strict bilateral non-disclosure protocols and reviewed only by accredited FIC consultants.
- **Feasibility Scoring Engine**: Submissions receive an automated diagnostic evaluation across:
  - *Market Viability (out of 100)*
  - *Technical Feasibility (out of 100)*
  - *Commercial Scalability (out of 100)*
- **Tracking Lifecycle**: `UNDER_REVIEW` → `FEASIBILITY_ANALYSIS` → `ADVISORY_SCHEDULED` → `APPROVED_INCUBATION`.
- **Review Notes & Next Steps**: Members receive diagnostic notes and structured next steps from senior incubation specialists.

### 3.11.2 Business Development & Enterprise Scaling (`/business-development`) — *Stage 1 → 10*
Designed for **established operational businesses, MSMEs, and factories** facing operational bottlenecks:
- **Form Inputs**: Enterprise Name, Required Growth Area (*Strategic Business Planning & Turnaround, Technology Modernization & Cloud Systems, Regional Expansion & Distributor Channel Onboarding, Operational & Factory Floor Lean Optimization, New Entity Setup*), Current Operational Bottlenecks, and Target Objectives / Milestones.
- **Specialist Assignment**: FIC assigns senior Domain Directors (e.g. Technology & Cloud Modernization Wing, FMCG & Commercial Retail Syndication).
- **Diagnostic Roadmaps & Milestones**: Specialists formulate phased transformation roadmaps:
  - *Phase 1: Diagnostic Assessment & Architecture Audit*
  - *Phase 2: Modernization Execution & Vendor Coordination*
  - *Phase 3: Performance Verification & Go-Live*
- **Tracking Lifecycle**: `DIAGNOSTIC_PENDING` → `SPECIALIST_ASSIGNED` → `ROADMAP_PREPARED` → `EXECUTION_IN_PROGRESS`.

## 3.12 Confidential Investment & Private Deal Room (`/investment`)

An institutional capital channel connecting high-growth enterprises with accredited syndicates:
- **Expression of Interest (EOI)**: Private submission for both capital seekers (ticket size, business stage, pitch deck) and investors (investment appetite, preferred sectors, liquidity horizon).
- **Private Deal Room Opportunities Bulletin**: Pre-screened commercial deals vetted by the FIC Senior Deal Committee (e.g. Tier-1 automated spinning units, solar cold-chain logistics, ayurvedic extraction facilities).
- **Bilateral NDA Protection**: Deal rooms require signed non-disclosure agreements before confidential financial data rooms are unlocked.
- **Compliance Protocol**: FIC does not hold investor custody, collect public deposits, or operate an unregistered securities exchange; operations are strictly structured as private B2B intermediary coordination.

## 3.13 FIC Intermediary Governance & B2B Coordination (Retirement of Direct Partnerships)

### Business Justification
In earlier specifications, a standalone "Partnerships" module allowed direct company-to-company connections. This created an existential business vulnerability: once Company A and Company B connected directly, FIC was bypassed in all subsequent commercial transactions.

### Architectural Policy
1. **Complete Removal of Standalone Partnerships**: The "Partnerships" module, navigation tabs, action shortcuts, and creation endpoints have been completely eliminated from the member portal.
2. **Redirect Strategy**: The route `/partnerships` permanently redirects to `/my-requests`.
3. **Mediated B2B Trade & Expansion**: Genuine B2B business collaboration (OEM supply chains, distributor onboarding, vendor sourcing, subcontracting) is routed strictly through the **Universal Marketplace**, **Enterprise Scaling Desk**, and **Facilitated Meetings Desk**, where FIC Officers oversee eligibility, vetting, and execution.

## 3.14 Student & Mentor Ecosystem

A comprehensive, role-tailored ecosystem connecting students and academic mentees with verified industry mentors and faculty:

### 3.14.1 Student Skill Development Portal (`/skill-development`)
- **Masterclass Video Discovery**: Filter verified video masterclasses by Topic Domain (Java, Python, Web Development, Digital Marketing, Mathematics) and Language (Tamil, English, Hindi, Kannada, Telugu).
- **Curriculum & Syllabus Details**: Students inspect video duration, target learning outcomes, and mentor credentials.
- **1-on-1 Mentor Consultation Booking**: Students can directly request a 1-on-1 career or academic guidance session with the mentor, specifying preferred dates, times, and meeting agendas.

### 3.14.2 Mentor Workspace & Video Upload Form (`/my-services`)
- **Streamlined Video Upload Form**: Eliminates obsolete fields (stream URL, target level, embed links) and focuses on core essentials:
  1. *Subject / Topic Domain* (Required)
  2. *Language* (Required — Tamil, English, etc.)
  3. *Video Masterclass File* (Required — Drag-and-drop file upload supporting MP4, WebM, MOV)
  4. *Session Duration* (Minutes)
  5. *Curriculum & Topic Description* (Required)
- **Teaching Services Catalog**: Mentors publish structured consulting and coaching tracks into the marketplace.

### 3.14.3 Mentorship Consultations Management (`/my-requests`)
Role-based tab separation in `MyRequestsPage.tsx`:
- **Mentor View**:
  - Displays `Marketplace Requests` and `Student Requests`.
  - Mentors can execute direct actions:
    - **Accept & Schedule**: Specify confirmed date, time, meeting mode (Online/Offline), Google Meet URL, and mentor notes.
    - **Reject Request**: Provide constructive feedback reason.
    - **Propose Reschedule**: Suggest alternative dates and times with notes.
    - **Complete Session & Log Audit**: Record session summary, mentor notes, recommended materials, and follow-up guidance before closing the booking.
- **Student View**:
  - Displays `Marketplace Requests` and `Mentor Requests`.
  - Students track booking status (`PENDING`, `ACCEPTED`, `RESCHEDULE_PROPOSED`, `COMPLETED`), access meeting links, and accept or decline mentor reschedule proposals.

------------------------------------------------------------------------

# 4. Software Requirements Specification (SRS)

## 4.1 Actors

-   Visitor
-   Applicant/member
-   Super Admin
-   Admin
-   Verification Executive
-   Service provider (a member with approved service listings)
-   Investor-interest member
-   Funding-seeker member
-   Mentor
-   Student/mentee
-   FIC operations staff

A person may act as a service requester and provider through the same
member account. These capabilities are not separate system roles unless
permissions require them.

## 4.2 Functional requirements

  -----------------------------------------------------------------------
  ID                                  Requirement
  ----------------------------------- -----------------------------------
  FR-001                              The system shall provide a public
                                      FIC landing page.

  FR-002                              Get Started shall open the
                                      registration introduction page.

  FR-003                              The system shall enforce minimum
                                      age eligibility of 18 years.

  FR-004                              A member shall have exactly one
                                      primary main category.

  FR-005                              Subcategories shall load
                                      dynamically from the selected
                                      category.

  FR-006                              Registration detail forms shall be
                                      configuration-driven.

  FR-007                              The system shall display the
                                      approved membership price and
                                      terms.

  FR-008                              Payment shall be verified
                                      server-side.

  FR-009                              The system shall support
                                      category-specific KYC requirements.

  FR-010                              Full dashboard access shall require
                                      all activation conditions.

  FR-011                              Members shall be able to track KYC
                                      status and resubmit documents.

  FR-012                              Admin users shall review and decide
                                      KYC applications according to
                                      permissions.

  FR-013                              Super Admin shall manage categories
                                      and subcategories.

  FR-014                              Authorized admins shall configure
                                      registration forms and dashboards.

  FR-015                              The dashboard shall render from
                                      published configuration.

  FR-016                              Eligible members shall discover
                                      approved services across all
                                      categories.

  FR-017                              Public service APIs shall not
                                      expose provider identity/contact
                                      details.

  FR-018                              Members shall submit service
                                      requests to FIC.

  FR-019                              FIC staff shall coordinate requests
                                      with providers.

  FR-020                              Members shall submit business ideas
                                      and development requests.

  FR-021                              Members shall submit private
                                      investment-readiness information.

  FR-022                              Members shall submit private
                                      funding requests.

  FR-023                              FIC staff shall review and
                                      coordinate partnership/networking
                                      requests.

  FR-024                              Mentoring shall support session,
                                      attendance, feedback and payout
                                      workflows.

  FR-025                              The system shall provide
                                      notifications and status history.

  FR-026                              The system shall maintain audit
                                      records for sensitive
                                      administrative actions.

  FR-027                              Membership renewal shall not
                                      override account suspension/block
                                      or revoked eligibility.

  FR-028                              The system shall support
                                      configurable membership reminders.

  FR-029                              The system shall provide reporting
                                      for membership, KYC, services and
                                      requests.

  FR-030                              The system shall support
                                      configuration versioning and
                                      controlled publication.
  -----------------------------------------------------------------------

## 4.3 Non-functional requirements

These are proposed engineering targets and must be validated against
budget, hosting and expected traffic.

  -----------------------------------------------------------------------
  ID                                  Requirement
  ----------------------------------- -----------------------------------
  NFR-001                             Responsive design for mobile,
                                      tablet and desktop.

  NFR-002                             Target monthly availability: 99.9%,
                                      subject to infrastructure and
                                      support model.

  NFR-003                             Target p95 normal read API latency
                                      below 500 ms under agreed load.

  NFR-004                             Secure transport using HTTPS in all
                                      deployed environments.

  NFR-005                             Sensitive documents must be private
                                      and access-controlled.

  NFR-006                             Payment webhooks must be
                                      signature-verified and idempotent.

  NFR-007                             Public APIs must enforce data
                                      minimization and field-level
                                      access.

  NFR-008                             Administrative actions must be
                                      auditable.

  NFR-009                             System must support backup and
                                      tested recovery procedures.

  NFR-010                             UI should target WCAG 2.2 AA
                                      accessibility practices.

  NFR-011                             APIs must use pagination and
                                      bounded query parameters.

  NFR-012                             Logs must avoid passwords, OTPs,
                                      payment secrets and unnecessary
                                      sensitive data.

  NFR-013                             Configuration publication must be
                                      versioned and reversible where
                                      feasible.

  NFR-014                             Application must support automated
                                      unit, integration and end-to-end
                                      tests.
  -----------------------------------------------------------------------

## 4.4 Business rules

1.  Only users aged 18 or above may register.
2.  One account has exactly one primary main category.
3.  Subcategories must belong to the selected main category.
4.  Main categories and subcategories are database/configuration-driven.
5.  Membership first-year fee is ₹99; subsequent annual renewal fee is
    ₹5,999, subject to approved tax and terms.
6.  Payment does not grant full dashboard access by itself.
7.  KYC approval is mandatory for full access.
8.  KYC resubmission does not require another membership payment.
9.  Only active, approved and eligible service listings appear in the
    marketplace.
10. Marketplace discovery is universal across member categories.
11. Provider identity/contact details are not public.
12. Service and business introductions are coordinated through FIC.
13. Investment/funding information is restricted to authorized FIC
    personnel.
14. Student-to-mentor direct payment is not supported.
15. Membership renewal does not bypass account suspension/block or
    revoked KYC.
16. Configuration changes must not silently alter historical
    submissions.
17. Every sensitive status change must record actor, timestamp, reason
    and prior/new state.

## 4.5 Access decision logic

Full dashboard access:

`accountStatus == ACTIVE`\
AND `paymentStatus == PAID`\
AND `kycStatus == APPROVED`\
AND `membershipStatus == ACTIVE`

The backend must enforce this rule for protected APIs. Frontend route
guards are supplementary only.

## 4.6 State management

Keep account, payment, KYC, membership and listing states separate. Do
not compress them into one generic status.

Example: - Account: ACTIVE / SUSPENDED / BLOCKED - Payment: PENDING /
PAID / FAILED / REFUNDED - KYC: NOT_STARTED / PENDING / UNDER_REVIEW /
ADDITIONAL_DOCUMENT_REQUIRED / APPROVED / REJECTED - Membership: PENDING
/ ACTIVE / EXPIRED / CANCELLED / SUSPENDED - Service listing: DRAFT /
PENDING / APPROVED / REJECTED / SUSPENDED / ARCHIVED

Define allowed transitions and actor permissions in implementation.

------------------------------------------------------------------------

# 5. User Roles and Permissions

## 5.1 Super Admin

-   Platform-wide monitoring
-   Create/manage Admin accounts
-   Configure role permissions
-   Manage categories and subcategories
-   Configure membership plans and pricing
-   Configure registration forms and KYC requirements
-   Configure dashboard templates and widgets
-   Configure service categories
-   Manage system settings
-   View financial and operational reports
-   Review audit logs
-   Suspend/block accounts according to policy

## 5.2 Admin

-   Manage member operations
-   Review member profiles
-   Handle KYC according to assigned permissions
-   Approve/reject service listings
-   Manage service requests
-   Handle business development requests
-   Review investment/funding interest
-   Coordinate partnerships and networking
-   Manage mentor operations and payout workflow
-   Handle complaints and support
-   Manage renewals and membership operations
-   View permitted reports

## 5.3 Verification Executive

-   View assigned KYC cases
-   Inspect permitted documents
-   Approve, reject or request additional documents according to granted
    permissions
-   Add internal notes
-   Record verification reasons
-   Track assigned workload

No financial configuration, staff administration or Super Admin settings
unless explicitly granted.

## 5.4 Member

-   Manage own profile
-   View membership and payment history
-   Submit KYC and corrections
-   Create/manage own service listings
-   Discover all approved services
-   Submit service requests
-   Submit business ideas and development requests
-   Express investment interest or submit funding requirements
-   Request networking and partnerships
-   Use mentoring features where eligible
-   Communicate with FIC
-   Track own requests and notifications

## 5.5 RBAC principles

-   Deny by default.
-   Enforce permissions in backend middleware/service layer.
-   Scope member access to their own records unless an explicit FIC
    workflow grants access.
-   Separate system role from business category.
-   Audit privileged access and sensitive document views.
-   Do not trust role or user identifiers sent by the browser without
    server-side verification.

------------------------------------------------------------------------

# 6. Solution Architecture

## 6.1 Architecture style

Use a **modular monolith** initially. Keep domain modules separated
inside one backend deployment. Do not begin with microservices unless
scale, team ownership or operational needs justify them.

## 6.2 Monorepo structure

``` text
fic-business-hub/
├── apps/
│   ├── web/                         # Website 1: public + member
│   │   ├── public/
│   │   └── src/
│   │       ├── app/
│   │       ├── assets/
│   │       ├── components/
│   │       ├── features/
│   │       │   ├── landing/
│   │       │   ├── auth/
│   │       │   ├── registration/
│   │       │   ├── membership/
│   │       │   ├── kyc/
│   │       │   ├── dashboard/
│   │       │   ├── marketplace/
│   │       │   ├── services/
│   │       │   ├── business-development/
│   │       │   ├── investment/
│   │       │   ├── partnerships/
│   │       │   ├── networking/
│   │       │   ├── mentoring/
│   │       │   ├── notifications/
│   │       │   └── profile/
│   │       ├── hooks/
│   │       ├── layouts/
│   │       ├── routes/
│   │       ├── services/
│   │       ├── state/
│   │       ├── styles/
│   │       └── utils/
│   ├── admin/                        # Website 2: admin portal
│   │   └── src/
│   │       ├── app/
│   │       ├── components/
│   │       ├── features/
│   │       │   ├── dashboard/
│   │       │   ├── members/
│   │       │   ├── kyc/
│   │       │   ├── categories/
│   │       │   ├── configuration-builder/
│   │       │   ├── memberships/
│   │       │   ├── payments/
│   │       │   ├── services/
│   │       │   ├── requests/
│   │       │   ├── business-opportunities/
│   │       │   ├── investment-funding/
│   │       │   ├── partnerships/
│   │       │   ├── networking/
│   │       │   ├── mentoring/
│   │       │   ├── complaints/
│   │       │   ├── reports/
│   │       │   ├── staff/
│   │       │   └── audit-logs/
│   │       ├── layouts/
│   │       ├── routes/
│   │       └── services/
│   └── backend/                      # Shared API
│       └── src/
│           ├── config/
│           ├── database/
│           ├── common/
│           │   ├── constants/
│           │   ├── errors/
│           │   ├── middleware/
│           │   ├── utils/
│           │   ├── validators/
│           │   └── types/
│           ├── modules/
│           │   ├── auth/
│           │   ├── users/
│           │   ├── profiles/
│           │   ├── categories/
│           │   ├── subcategories/
│           │   ├── category-configurations/
│           │   ├── registration/
│           │   ├── dashboard/
│           │   ├── membership/
│           │   ├── payments/
│           │   ├── kyc/
│           │   ├── services/
│           │   ├── products/
│           │   ├── marketplace/
│           │   ├── connections/
│           │   ├── communication/
│           │   ├── business-ideas/
│           │   ├── business-development/
│           │   ├── investment/
│           │   ├── funding/
│           │   ├── partnerships/
│           │   ├── networking/
│           │   ├── mentoring/
│           │   ├── notifications/
│           │   ├── complaints/
│           │   ├── admin/
│           │   ├── reports/
│           │   └── audit-logs/
│           ├── integrations/
│           │   ├── payment-provider/
│           │   ├── email/
│           │   ├── sms/
│           │   ├── object-storage/
│           │   └── analytics/
│           ├── jobs/
│           ├── routes/
│           ├── app.ts
│           └── server.ts
├── packages/
│   ├── ui/
│   ├── shared-types/
│   ├── validators/
│   ├── api-client/                   # Typed API contracts/client shared where platform-neutral
│   ├── auth/
│   ├── eslint-config/
│   ├── typescript-config/
│   └── tailwind-config/
├── infrastructure/
│   ├── docker/
│   ├── aws/
│   └── monitoring/
├── docs/
│   └── FIC_BUSINESS_HUB_COMPLETE_PROJECT_BLUEPRINT.md
├── .env.example
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── turbo.json
└── README.md
```

The structure is a recommended target. Create folders progressively as
modules are implemented; avoid empty folders being mistaken for
completed features.

## 6.2.1 React Native CLI Mobile Application Architecture

`apps/mobile` is a separate native React Native CLI application inside the existing pnpm/Turborepo monorepo.

Recommended structure:

```text
apps/mobile/
├── android/                         # Native Android project
├── ios/                              # Native iOS project
├── src/
│   ├── app/                           # App.tsx, providers, bootstrap
│   ├── assets/
│   ├── components/                    # Native reusable UI
│   ├── features/
│   │   ├── auth/
│   │   ├── registration/
│   │   ├── membership/
│   │   ├── kyc/
│   │   ├── dashboard/
│   │   ├── marketplace/
│   │   ├── my-requests/
│   │   ├── business-ideas/
│   │   ├── scaling/
│   │   ├── investment/
│   │   ├── meetings/
│   │   ├── my-services/
│   │   ├── skill-development/
│   │   ├── mentoring/
│   │   ├── notifications/
│   │   └── profile/
│   ├── navigation/
│   ├── services/                      # API client, upload, push registration
│   ├── state/
│   ├── theme/
│   ├── types/
│   └── utils/
├── __tests__/
├── app.json
├── babel.config.js
├── metro.config.js
├── tsconfig.json
└── package.json
```

### React Native CLI setup standards

- Use the official React Native Community CLI / bare React Native workflow.
- Create and maintain the native app under `apps/mobile`; do not generate an Expo project.
- Use TypeScript from the initial scaffold.
- Configure Metro to resolve workspace packages safely in the pnpm monorepo. Verify symlink/workspace dependency resolution on both Android and iOS; do not assume the default Metro config works with pnpm.
- Keep native-only dependencies inside `apps/mobile` unless a package is explicitly compatible with the workspace and React Native.
- Use React Navigation, a typed API client, a predictable server-state/cache strategy, a form/validation strategy compatible with React Native, and secure token storage. Select libraries based on current compatibility and maintenance.
- Use `react-native-safe-area-context`, `react-native-screens` and `react-native-gesture-handler` where required by the selected navigation stack.
- Configure Android applicationId and iOS bundle identifier using FIC-approved reverse-domain identifiers; do not invent production identifiers.
- Keep development, staging and production API base URLs in build-time environment configuration. Never ship secrets in mobile bundles.
- Configure Android signing, iOS signing/provisioning, app icons, splash screens, permissions, privacy manifests and store metadata before release.
- Document the required local toolchain: Node.js LTS compatible with selected RN version, pnpm, JDK version required by the selected RN/Gradle matrix, Android Studio + Android SDK, Xcode/macOS for iOS builds, CocoaPods and supported physical devices/emulators.
- Pin exact compatible versions in the lockfile after compatibility verification and record upgrade procedures.

### Example initialization workflow

Run from the repository root after confirming the installed Node.js/pnpm versions and the React Native compatibility matrix:

```bash
# Scaffold using the official React Native Community CLI.
# Generate in a temporary directory if necessary, then move/configure
# the native project as apps/mobile without overwriting existing apps.
npx @react-native-community/cli@latest init FICBusinessHubMobile --version <approved-compatible-version>

# From the configured monorepo root:
pnpm install

# Start Metro from the mobile workspace using its package script:
pnpm --filter @fic/mobile start

# Android (Android Studio + SDK + emulator/device required):
pnpm --filter @fic/mobile android

# iOS (macOS + Xcode + CocoaPods required):
pnpm --filter @fic/mobile ios
```

Replace the placeholder version only after checking the official React Native release and environment compatibility. Adapt package scripts to the generated CLI project. Do not run scaffold commands over an existing project.

### Mobile workspace scripts

Provide app-local scripts for `start`, `android`, `ios`, `lint`, `typecheck` and tests. Add root Turbo tasks only after verifying they work with Metro and native build lifecycles. Native build outputs and Metro cache must not be committed.

## 6.3 Workspace configuration

`pnpm-workspace.yaml`:

``` yaml
packages:
  - "apps/*"
  - "packages/*"
```

Root `package.json` should: - Be private. - Pin the actual pnpm version
using the `packageManager` field. - Provide `dev`, `build`, `lint`,
`typecheck` and `clean` scripts. - Use a compatible Turborepo version.

Example root scripts:

``` json
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "clean": "turbo clean"
  }
}
```

Example `turbo.json`:

``` json
{
  "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    }
  }
}
```

Use compatible, currently supported dependency versions at
implementation time. Do not blindly copy old version numbers from
examples.

## 6.4 Backend module pattern

Each backend domain module should follow a consistent structure where
appropriate:

``` text
module-name/
├── module-name.model.ts
├── module-name.types.ts
├── module-name.validation.ts
├── module-name.repository.ts
├── module-name.service.ts
├── module-name.controller.ts
├── module-name.routes.ts
├── module-name.permissions.ts
└── module-name.test.ts
```

Do not force every module to contain unnecessary files. Keep business
logic out of controllers and enforce authorization in
services/repositories as appropriate.

## 6.5 Environments and domains

Example: - Local web: `http://localhost:5173` - Local admin:
`http://localhost:5174` - Local API: `http://localhost:5000` -
Production web: `https://www.ficapp.in` - Production admin:
`https://admin.ficapp.in` - Production API: `https://api.ficapp.in`

Configure ports explicitly. Production deployment, DNS, TLS, CORS and
cookie domains require environment-specific configuration.

------------------------------------------------------------------------

# 7. Dynamic Configuration Architecture

## 7.1 Configuration-driven components

The following must be database/configuration-driven: - Main categories -
Subcategories - Registration fields - Conditional questions - KYC
document requirements - Dashboard menus - Dashboard widgets - Category
features - Subcategory feature variations - Service categories -
Relevant filters and metadata

## 7.2 Configuration lifecycle

Suggested states: - DRAFT - IN_REVIEW - PUBLISHED - ARCHIVED

Publishing creates an immutable configuration version. Existing
registrations should retain the version used at submission. Changes
should be migrated explicitly, not silently.

## 7.3 Dashboard renderer

The dashboard engine should: 1. Read the member's primary category and
permitted subcategories. 2. Resolve the published category
configuration. 3. Resolve applicable subcategory features. 4. Apply
member permissions and account state. 5. Render only supported, approved
widget types. 6. Fetch data through authorized APIs. 7. Display a
graceful fallback for disabled or unavailable widgets.

Do not allow arbitrary code execution from dashboard configuration. Use
a registry of approved widget components.

------------------------------------------------------------------------

# 8. Data Architecture and MongoDB Collections

The following is a logical collection inventory. Final schema details,
indexes and retention rules must be reviewed before production.

  -----------------------------------------------------------------------
  Collection                          Purpose
  ----------------------------------- -----------------------------------
  users                               Authentication identity, account
                                      state, primary category reference

  memberProfiles                      Member profile and permitted
                                      business/professional details

  categories                          Main category records

  subcategories                       Subcategories linked to main
                                      categories

  categoryConfigurations              Versioned category behavior
                                      configuration

  registrationFormConfigurations      Dynamic form definitions and
                                      versions

  registrationSubmissions             Submitted form answers and config
                                      version

  dashboardConfigurations             Dashboard layouts and versions

  kycConfigurations                   Category/subcategory KYC rules

  kycApplications                     KYC case, status and decision
                                      history

  kycDocuments                        Private document metadata and
                                      storage references

  membershipPlans                     Membership pricing and terms
                                      versions

  memberships                         Member membership period and status

  payments                            Payment provider references and
                                      financial state

  paymentWebhookEvents                Idempotent webhook event records

  serviceListings                     Provider service listings and
                                      moderation status

  productListings                     Product listings, if enabled in
                                      approved scope

  businessIdeas                       Submitted business ideas

  businessDevelopmentRequests         Business support and scaling
                                      requests

  investmentProfiles                  Private investment readiness and
                                      preferences

  fundingRequests                     Private funding requirements

  investmentConnectionRequests        FIC-reviewed potential
                                      introductions

  partnershipRequests                 DEPRECATED & RETIRED (Direct partnerships
                                      eliminated to enforce FIC intermediary governance)

  teachingServices                    Accredited mentor teaching & advisory offerings

  learningVideos                      Uploaded masterclass videos with curriculum,
                                      language, and video stream metadata

  mentorshipRequests                  1-on-1 student consultation bookings with
                                      reschedule workflows and session completion audits

  networkingRequests                  Networking and introduction
                                      requests

  connectionRequests                  FIC-coordinated service, B2B trade, and
                                      connection request records

  conversations                       FIC-mediated conversation threads

  messages                            Messages and moderation metadata

  mentoringSessions                   Scheduled/managed mentoring
                                      sessions

  sessionAttendance                   Attendance and completion evidence

  studentReviews                      Student feedback and ratings

  mentorPerformance                   Performance snapshots and
                                      evaluation evidence

  mentorCommissionRules               Configurable payout rules

  mentorCommissionTransactions        Calculated and approved commission
                                      ledger

  mentorPayouts                       Payout execution and reconciliation

  notifications                       In-app and delivery notification
                                      records

  complaints                          Complaints and dispute handling

  auditLogs                           Security and administrative audit
                                      records
  -----------------------------------------------------------------------

Avoid duplicating the same request across multiple collections without a
clear domain reason. Decide whether to use a shared request model with
typed payloads or separate domain collections based on query, privacy
and lifecycle needs.

## 8.1 User record principles

A user should contain: - Stable user ID - Authentication identifiers -
Account status - Primary category ID - Primary subcategory ID -
Registration/configuration version references - Membership/KYC
references or derived state - Created/updated timestamps

Do not store a `categories` array that allows multiple primary
categories. `primaryCategoryId` must be singular. Subcategories must be
validated against it.

## 8.2 Indexing

Plan indexes for: - Unique normalized email/mobile where policy
requires - Primary category and subcategory references -
Account/KYC/membership statuses - Membership expiry dates - Listing
status/category/search fields - Request status/assigned staff/created
date - Payment provider transaction IDs and webhook event IDs - Audit
actor/resource/timestamp - Notification recipient/read status

Use compound indexes based on actual query patterns. Validate index
impact with production-like data.

## 8.3 File storage

Store KYC and sensitive proposal documents in private object storage,
not public static folders. MongoDB should store metadata and object
references, not necessarily file bytes.

Use: - Encryption in transit and at rest - Short-lived signed URLs -
MIME/type and size validation - Malware scanning where feasible - Access
audit logs - Retention and deletion policies - Restricted staff access

------------------------------------------------------------------------

# 9. API Specification

Use versioned REST APIs under `/api/v1`. Publish OpenAPI documentation.
All endpoints require explicit authentication and authorization
decisions. The React Native app consumes the same `/api/v1` contracts; do not create a separate mobile backend or duplicate business rules.

## 9.1 Public and authentication APIs

  ------------------------------------------------------------------------------------------------
  Method                  Endpoint                                         Purpose
  ----------------------- ------------------------------------------------ -----------------------
  GET                     `/api/v1/public/config`                          Public site
                                                                           configuration

  GET                     `/api/v1/categories`                             List published
                                                                           categories

  GET                     `/api/v1/categories/:categoryId/subcategories`   List subcategories

  GET                     `/api/v1/registration-form`                      Resolve form
                                                                           configuration

  POST                    `/api/v1/auth/register`                          Create
                                                                           account/application

  POST                    `/api/v1/auth/login`                             Login

  POST                    `/api/v1/auth/verify-otp`                        Verify OTP if enabled

  POST                    `/api/v1/auth/refresh`                           Refresh session/token

  POST                    `/api/v1/auth/logout`                            End session
  ------------------------------------------------------------------------------------------------

## 9.2 Registration, membership and KYC

  ------------------------------------------------------------------------------------------
  Method                  Endpoint                                   Purpose
  ----------------------- ------------------------------------------ -----------------------
  POST                    `/api/v1/registration-submissions`         Submit dynamic
                                                                     registration

  GET                     `/api/v1/registration-submissions/me`      View own submission

  GET                     `/api/v1/membership/plans`                 View published plans

  POST                    `/api/v1/membership/checkout`              Create payment order

  POST                    `/api/v1/payments/webhooks/:provider`      Verified payment
                                                                     webhook

  GET                     `/api/v1/payments/me`                      Own payment history

  POST                    `/api/v1/kyc/applications`                 Submit KYC

  GET                     `/api/v1/kyc/applications/me`              View KYC status

  POST                    `/api/v1/kyc/applications/:id/documents`   Add/correct documents
  ------------------------------------------------------------------------------------------

## 9.3 Dashboard and marketplace

  --------------------------------------------------------------------------------------
  Method                  Endpoint                               Purpose
  ----------------------- -------------------------------------- -----------------------
  GET                     `/api/v1/dashboard/my-configuration`   Resolve dashboard
                                                                 configuration

  GET                     `/api/v1/dashboard/my-summary`         Member dashboard
                                                                 summary

  GET                     `/api/v1/marketplace/services`         Universal service
                                                                 discovery

  GET                     `/api/v1/marketplace/services/:id`     Privacy-safe service
                                                                 detail

  POST                    `/api/v1/services`                     Submit own service
                                                                 listing

  GET                     `/api/v1/services/me`                  Manage own listings

  POST                    `/api/v1/connections`                  Submit FIC-mediated
                                                                 service request
  --------------------------------------------------------------------------------------

## 9.4 Business opportunity & Mentoring APIs

  --------------------------------------------------------------------------------------------
  Method                  Endpoint                                     Purpose
  ----------------------- -------------------------------------------- -----------------------
  POST                    `/api/v1/business-ideas`                     Submit idea (0 → 1)

  GET                     `/api/v1/business-ideas/me`                  Own submitted ideas

  POST                    `/api/v1/business-development-requests`      Submit scaling request (1 → 10)

  GET                     `/api/v1/business-development-requests/me`   Own scaling requests

  POST                    `/api/v1/investment-profiles`                Submit private investment appetite

  POST                    `/api/v1/funding-requests`                   Submit funding requirement

  POST                    `/api/v1/partnership-requests`               *DEPRECATED* (HTTP 410 Gone / Intermediary Policy)

  GET                     `/api/mentoring/services`                    Browse mentor teaching offerings

  POST                    `/api/mentoring/services`                    Publish mentor teaching offering

  GET                     `/api/mentoring/videos`                      Browse masterclass videos (filter by domain & lang)

  POST                    `/api/mentoring/videos`                      Upload new masterclass video

  GET                     `/api/mentoring/videos/my`                   Own uploaded masterclass videos

  POST                    `/api/mentoring/requests`                    Book 1-on-1 consultation session

  GET                     `/api/mentoring/requests/student`            Student's active mentorship bookings

  GET                     `/api/mentoring/requests/mentor`             Mentor's incoming mentorship bookings

  PUT                     `/api/mentoring/requests/:id/accept`         Accept and schedule consultation

  PUT                     `/api/mentoring/requests/:id/reschedule`     Mentor proposes new schedule

  PUT                     `/api/mentoring/requests/:id/respond-reschedule` Student responds to reschedule

  PUT                     `/api/mentoring/requests/:id/complete`       Log completion audit and close session
  --------------------------------------------------------------------------------------------

## 9.5 Admin APIs

Examples: - `/api/v1/admin/members` - `/api/v1/admin/kyc` -
`/api/v1/admin/categories` - `/api/v1/admin/subcategories` -
`/api/v1/admin/configurations` -
`/api/v1/admin/dashboard-configurations` -
`/api/v1/admin/service-listings` - `/api/v1/admin/requests` -
`/api/v1/admin/investment` - `/api/v1/admin/funding` -
`/api/v1/admin/partnerships` - `/api/v1/admin/networking` -
`/api/v1/admin/mentoring` - `/api/v1/admin/reports` -
`/api/v1/admin/audit-logs`

These are endpoint groups, not a complete contract. For each implemented
endpoint define: - Method and path - Authentication requirement -
Permission - Request schema - Response schema - Validation and error
codes - Pagination/filter/sort - Idempotency where required - Audit
behavior - Rate limits

Never expose sensitive provider identity or investment details from
public endpoints.

------------------------------------------------------------------------

# 10. UI/UX Specification

## 10.0 Mobile Application UI/UX

- The React Native application must use native React Native components and platform conventions, not render the web portal inside a WebView.
- Maintain a shared FIC design token source for colours, typography, spacing, radii, elevation and status colours. Reuse platform-neutral tokens where practical; implement native components separately from React web components.
- Use a five-item bottom navigation (Home, Marketplace, My Requests, Notifications, Profile) with role-aware shortcuts for the remaining modules.
- Use native stack screens for detail/form flows and modal/bottom-sheet patterns for focused actions.
- Ensure forms have clear labels, inline validation, accessible errors, keyboard-aware scrolling, draft protection where safe and explicit submit confirmation for sensitive actions.
- Provide polished loading, empty, error, retry, permission-denied and offline states for every network-driven module.
- Keep all important text readable at common Android/iOS font scales; avoid clipped labels and fixed-height text containers.
- Respect safe areas, status/navigation bars, Android hardware back, iOS swipe-back and device orientation where supported.
- Web Motion for React (`motion/react`) is web-only. For mobile, use React Native's native Animated API or a compatible maintained animation library only where justified; do not import `motion/react` into the native app.

## 10.1 Design principles & Visual Identity

-   **Warm Ivory & Soft Sand Luxury Theme**: An earthy, warm, professional enterprise aesthetic avoiding harsh dark modes or stark pure black.
-   **WCAG AAA Contrast Standard**: All primary and secondary text uses Deep Earth Brown (`#51463F` and `#453A33`) exceeding 7.5:1 contrast ratios on ivory surfaces. No pale white text on light badges.
-   **Multi-Color Luxury Accents**:
    -   *Terracotta / Coral (`#E8795B`, `#C65638`)*: Primary brand emphasis, marketplace highlights.
    -   *Golden Amber (`#E5A23B`, `#D99B43`)*: Incubation ideas, validity indicators.
    -   *Forest Teal (`#3B9C91`, `#1C6960`)*: Private deal rooms, confidential investment badges.
    -   *Royal Violet (`#8064B1`, `#6E529F`)*: Scaling advisory, mentorship desk.
-   **Frosted Glass Card Surfaces**: White cards (`bg-white/80` or `bg-white/95`) with delicate sand borders (`#EDE2D7`) and soft depth elevation.
-   **Full Viewport Responsiveness**: High-density layouts spanning 320px to 1920px viewports without awkward empty margins.

## 10.2 Motion for React (`motion/react`) System

Standardized exclusively on **Motion for React** (`motion/react` v12+):
-   **Guaranteed Route Visibility**: Layout shells wrap routes without blocking initial zero-opacity transitions, eliminating blank-screen glitches during client-side tab switching.
-   **Motion Tokens**:
    -   *Durations*: Fast (150ms), Normal (260ms), Slow (400ms).
    -   *Springs*: Snappy (`stiffness: 380, damping: 28`), Gentle (`stiffness: 260, damping: 22`).
    -   *Easing*: Premium cubic-bezier curves (`[0.22, 1, 0.36, 1]`).
-   **Reusable Motion Primitives**: `AnimatedModal`, `AnimatedCard`, `AnimatedCounter`, `AnimatedProgress`, `ScrollReveal`, and `StaggerContainer`.

## 10.3 Centralized Role-Based Member Navigation

Navigation is dynamically generated via `getRoleNavigation(user)` in `apps/web/src/services/dashboardConfig.ts`:

-   **Business / MSME / Manufacturer / Freelancer (8 Core Modules)**:
    `Dashboard` • `Marketplace` • `Business Ideas` • `Scaling` • `Investment` • `Meetings` • `My Requests` • `My Services`
-   **Student (7 Core Modules)**:
    `Dashboard` • `Marketplace` • `Business Ideas` • `Investment` • `Meetings` • `My Requests` • `Skill Development`
-   **Mentor / Trainer (7 Core Modules)**:
    `Dashboard` • `Marketplace` • `Business Ideas` • `Investment` • `Meetings` • `My Requests` • `My Services`
-   **Professor / Faculty (7 Core Modules)**:
    `Dashboard` • `Marketplace` • `Business Ideas` • `Investment` • `Meetings` • `My Requests` • `My Services`

## 10.4 Admin Operations Navigation

-   Overview & Operations KPI Telemetry
-   Member Accounts & Profile Directory
-   KYC Verification & Document Approvals
-   Categories & Subcategories Manager
-   Registration Form Builder
-   Dashboard Configuration Manager
-   Membership Plans & Renewals
-   Payments & Fee Reconciliation
-   Marketplace Service Listings Moderation
-   Client Service Requests Coordinator
-   Business Ideas & Incubation Desk
-   Enterprise Scaling Requests & Roadmaps
-   Private Deal Room & Investment Inquiries
-   Mentorship & Masterclass Moderation
-   Complaints & Dispute Resolution
-   System Reports & Audit Logs
-   Staff & Permissions
-   Audit Logs
-   Settings

Navigation visibility must be permission-controlled.

------------------------------------------------------------------------

# 11. Key Business Workflows

## 11.1 Registration and activation

``` mermaid
flowchart TD
 A[Visitor opens landing page] --> B[Get Started]
 B --> C[Registration introduction and membership terms]
 C --> D[Basic registration]
 D --> E{Age 18 or above?}
 E -- No --> F[Stop registration]
 E -- Yes --> G[Select one main category]
 G --> H[Load subcategories]
 H --> I[Select permitted subcategory]
 I --> J[Load dynamic details form]
 J --> K[Submit registration details]
 K --> L[Create membership payment order]
 L --> M{Payment verified?}
 M -- No --> N[Show payment pending or failed]
 M -- Yes --> O[Create membership record]
 O --> P[Load dynamic KYC requirements]
 P --> Q[Submit KYC documents]
 Q --> R[Admin review]
 R --> S{KYC approved?}
 S -- No --> T[Request correction or reject]
 T --> Q
 S -- Yes --> U{Account and membership active?}
 U -- No --> V[Keep restricted status]
 U -- Yes --> W[Activate dynamic dashboard]
```

## 11.2 Universal service request

``` mermaid
flowchart TD
 A[Member browses all approved services] --> B[Select service]
 B --> C[Submit requirements]
 C --> D[FIC receives request]
 D --> E[FIC reviews and contacts requester]
 E --> F[Collect complete requirements]
 F --> G[Identify provider internally]
 G --> H[Contact provider]
 H --> I{Provider can proceed?}
 I -- No --> J[Find alternative or close request]
 I -- Yes --> K[Coordinate proposal]
 K --> L[Share next steps with requester]
 L --> M[Track progress]
 M --> N[Complete, cancel or dispute]
```

## 11.3 Investment/funding interest

``` mermaid
flowchart TD
 A[Member submits private investment or funding interest] --> B[Store restricted record]
 B --> C[Authorized FIC review]
 C --> D[Collect missing requirements]
 D --> E[Assess suitability and legal permissions]
 E --> F{Permitted introduction?}
 F -- No --> G[Hold, decline or request compliance review]
 F -- Yes --> H[Obtain appropriate consent]
 H --> I[Coordinate introduction]
 I --> J[Track outcome without handling funds unless separately approved]
```

## 11.4 KYC review

``` mermaid
flowchart TD
 A[Member submits KYC] --> B[Create review case]
 B --> C[Assign Verification Executive]
 C --> D[Document review]
 D --> E{Decision}
 E -- Approved --> F[Mark KYC approved]
 E -- More documents --> G[Notify member]
 G --> H[Member resubmits]
 H --> C
 E -- Rejected --> I[Record reason and notify member]
```

------------------------------------------------------------------------

# 12. Security and Privacy Requirements

## 12.1 Authentication and authorization

-   Hash passwords using a suitable modern password-hashing algorithm.
-   Use secure session or access/refresh-token architecture.
-   Protect cookies appropriately if cookie-based sessions are selected.
-   Add login, OTP and sensitive-action rate limits.
-   Use RBAC and deny-by-default authorization.
-   Validate all input on the server.
-   Apply secure headers and CORS allowlists.
-   Protect against common OWASP risks.
-   Avoid logging secrets, OTPs or full sensitive document contents.

## 12.2 Identity privacy

Public marketplace responses must be constructed using explicit
allowlisted fields. Do not serialize complete member documents and
attempt to remove private fields afterward.

Private provider identity should be available only to authorized FIC
staff who need it for a request.

Member-to-member messages and uploaded content may contain phone
numbers, emails or external links. Absolute prevention cannot be
guaranteed. Use: - Clear policy and warnings - Detection and moderation
where feasible - Restricted message visibility - Staff review and
reporting - Enforcement and audit process

FIC must still publish its own legitimate business identity, support and
legally required grievance contact details.

## 12.3 Financial and payment security

-   Use a compliant payment provider.
-   Do not store card credentials.
-   Verify webhook signatures.
-   Make webhook processing idempotent.
-   Reconcile provider events with internal payment records.
-   Keep immutable provider transaction references.
-   Separate payment success from KYC approval and dashboard activation.
-   Define refund, cancellation and chargeback handling.
-   Do not enable investment money custody or transfer without an
    approved legal and technical model.

## 12.4 Sensitive files

-   Private object storage.
-   Encryption at rest and in transit.
-   Short-lived signed download links.
-   Role-checked access.
-   Malware scanning where feasible.
-   File size/type validation.
-   Audit document access.
-   Retention and secure deletion policy.

------------------------------------------------------------------------

# 13. Indian Legal and Compliance Review

This section is a review checklist, not legal advice or a declaration of
compliance.

Obtain qualified Indian legal, CA and regulatory advice before launch.

Review applicability of: - Digital Personal Data Protection Act, 2023
and rules/commencement requirements applicable at launch - Information
Technology Act and applicable rules - Consumer Protection Act and
E-Commerce Rules, where applicable - GST registration, tax treatment,
invoicing and accounting - Payment aggregator/provider contractual and
regulatory requirements - KYC and record-retention obligations
applicable to FIC's actual business activities - Sector-specific
requirements for finance, healthcare, education and other regulated
areas - Investment solicitation, securities, lending, collective
investment, deposit-taking and financial-advisory boundaries -
Employment, contractor, mentor and service-provider agreements -
Grievance handling, refunds, cancellations and dispute resolution

Do not assume that describing FIC as an intermediary automatically
exempts it from legal responsibilities. Legal classification depends on
actual activities, contracts, money flows, representations and control.

------------------------------------------------------------------------

# 14. Mentoring and FIC-Funded Commission

## 14.1 Approved operating direction

-   Students request mentoring through FIC.
-   Students do not pay mentors directly.
-   FIC manages mentor selection, session tracking and quality
    evaluation.
-   FIC pays eligible mentors from an approved company budget.
-   Payout is subject to completed sessions, attendance, feedback,
    complaint checks, approval and reconciliation.

## 14.2 Suggested workflow

1.  Student requests mentoring.
2.  FIC reviews and assigns/coordinates mentor.
3.  Session is scheduled.
4.  Attendance and completion are recorded.
5.  Student submits feedback.
6.  FIC evaluates mentor performance.
7.  Eligible commission/payout is calculated using approved configurable
    rules.
8.  Authorized staff approve.
9.  Finance executes payout through approved provider/process.
10. Ledger and payout status are reconciled.

Commission percentages, score weights, payout rates and budget amounts
are not finalized. Store them as effective-dated configuration, with
approval history.

------------------------------------------------------------------------

# 15. Notifications and Communication

Support notification channels as configured: - In-app notifications -
Email - SMS - Other approved channels

Events may include: - Registration created - Payment success/failure -
KYC submitted - KYC additional documents requested - KYC
approved/rejected - Dashboard activated - Membership expiry reminders -
Service listing approved/rejected - Service request status changed -
Business request update - Meeting scheduled - Networking/partnership
update - Mentor session update - Complaint update

Use notification templates with versioning. Do not expose sensitive
information in notification previews. Provide user preferences where
appropriate and honor required transactional communications.

------------------------------------------------------------------------

# 16. Reporting and Analytics

## 16.1 Admin dashboard metrics

Potential KPIs: - Total registered members - Active members - Pending
KYC - Approved KYC - Expired memberships - Membership revenue - Payment
failures/refunds - Active service listings - Pending listing approvals -
Service requests by status - Business development requests -
Investment/funding interest counts - Partnership/networking requests -
Complaints and resolution time - Mentor sessions and payouts

Define each metric, filters, timezone, source of truth and calculation
before presenting it as a financial or operational fact.

## 16.2 Privacy

Reports must use role-appropriate aggregation. Restrict personally
identifiable and financial information. Export permissions must be
separately controlled and audited.

------------------------------------------------------------------------

# 17. Testing Strategy

## 17.1 Testing levels

-   Unit tests for business logic and validators
-   Integration tests for database and API modules
-   API contract tests
-   Frontend component tests
-   End-to-end user journeys
-   Role/permission tests
-   Security and privacy tests
-   Payment webhook tests
-   File upload tests
-   Performance/load tests
-   Backup and restore tests
-   Responsive and accessibility tests

## 17.2 Critical test scenarios

### Registration

-   Under-18 user cannot proceed.
-   User can select only one primary category.
-   Subcategories are limited to selected category.
-   Dynamic form changes correctly.
-   Required conditional fields validate correctly.
-   Configuration version is stored with submission.

### Payment

-   Successful provider webhook updates payment exactly once.
-   Duplicate webhook does not duplicate membership.
-   Frontend cannot forge payment success.
-   Failed payment does not activate membership.
-   KYC resubmission does not charge again.
-   Refund/chargeback updates access according to policy.

### KYC and access

-   Pending KYC cannot access protected dashboard APIs.
-   Approved KYC plus paid active membership grants access.
-   Suspended/blocked account cannot bypass restrictions.
-   Additional-document request allows resubmission.
-   Staff actions are audited.

### Marketplace privacy

-   Every eligible category can discover all approved services.
-   Inactive/unapproved services are hidden.
-   Public API never returns provider name/company/private contact.
-   Authorized FIC staff can access provider details for assigned work.
-   Search and filters do not leak hidden fields.

### Business and investment workflows

-   Requests are visible only to requester and authorized FIC staff.
-   Investment amounts are not exposed publicly.
-   Consent and staff actions are recorded.
-   No unapproved money-transfer functionality is available.

### Dashboard configuration

-   Correct category dashboard loads.
-   Subcategory features apply correctly.
-   Draft configuration is not public.
-   Published version is stable.
-   Old submissions remain associated with their original version.

## 17.3 Definition of Done

A feature is complete only when: - Requirements are documented. - UI and
backend are integrated. - Authorization is enforced. - Validation and
error handling exist. - Tests pass. - Privacy/security checks pass. -
Relevant API documentation is updated. - Acceptance criteria are met. -
No fake success or placeholder integration is represented as
production-ready.

------------------------------------------------------------------------

# 18. Deployment and Infrastructure

## 18.1 Suggested deployment topology

-   Android application: signed AAB/APK release through Google Play Console; internal testing track before production.
-   iOS application: signed archive through Xcode/App Store Connect; TestFlight before production. iOS builds require macOS/Xcode.
-   Mobile app distribution must use approved store accounts, bundle identifiers, signing credentials and release approvals.
-   Member website: static/web hosting behind CDN
-   Admin website: separately deployed web application
-   Backend: managed application/container hosting
-   MongoDB: managed MongoDB deployment
-   Redis: managed Redis if background jobs or caching require it
-   Object storage: private bucket for KYC and sensitive files
-   CDN: public assets only; never publicly cache private KYC documents
-   Monitoring: centralized logs, metrics, uptime and error tracking

## 18.2 Environment separation

Maintain separate: - Local development - Development/test - Staging -
Production

Use separate databases, storage buckets, credentials and
payment-provider modes. Production secrets must never be committed to
Git.

## 18.3 Environment variables

Provide `.env.example` with variable names and safe placeholders, for
example:

``` env
NODE_ENV=development
PORT=5000
MONGODB_URI=
REDIS_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
WEB_ORIGIN=http://localhost:5173
ADMIN_ORIGIN=http://localhost:5174
MOBILE_APP_ENV=development
MOBILE_API_BASE_URL=http://localhost:5000/api/v1
PAYMENT_PROVIDER_KEY=
PAYMENT_PROVIDER_SECRET=
PAYMENT_WEBHOOK_SECRET=
OBJECT_STORAGE_BUCKET=
OBJECT_STORAGE_REGION=
OBJECT_STORAGE_ACCESS_KEY=
OBJECT_STORAGE_SECRET_KEY=
EMAIL_PROVIDER_API_KEY=
SMS_PROVIDER_API_KEY=
```

Do not commit real values. Prefer a managed secret store in production.

## 18.4 CI/CD

Suggested pipeline: 1. Install dependencies using lockfile. 2. Lint. 3.
Typecheck. 4. Unit and integration tests. 5. Build all applications. 6.
Security/dependency checks. 7. Deploy to staging. 8. Run smoke tests. 9.
Obtain production approval. 10. Deploy production and verify health.

Use database migration/index rollout procedures and rollback plans.

------------------------------------------------------------------------

# 19. Implementation Roadmap

## Phase 0 -- Repository foundation

-   Inspect repository.
-   Create/validate Turborepo + pnpm.
-   Create apps/web, apps/admin, apps/mobile (React Native CLI) and apps/backend.
-   Create shared packages.
-   Configure TypeScript, linting, formatting and environment files.
-   Ensure `pnpm install`, `pnpm dev`, build and typecheck work.

**Exit criteria:** Clean monorepo foundation with both websites, the React Native CLI mobile workspace and backend booting/building independently where host platform requirements are available.

## Phase 1 -- Product and UI foundation

-   Confirm design system.
-   Shared UI components.
-   Public landing page.
-   Get Started introduction page.
-   Membership offer presentation.
-   Responsive layouts.

**Exit criteria:** Approved public journey and visual foundation.

## Phase 2 -- Dynamic configuration foundation

-   Category/subcategory data model.
-   Configuration versioning.
-   Registration form builder.
-   Safe field renderer.
-   Conditional logic.
-   Admin draft/preview/publish.

**Exit criteria:** A new configured category and form can be published
without writing category-specific frontend code, within the supported
component system.

## Phase 3 -- Registration, membership and KYC

-   Basic account registration and age check.
-   Category/subcategory selection.
-   Dynamic details form.
-   Payment order and webhook.
-   Membership lifecycle.
-   KYC upload and review.
-   Application tracking and resubmission.
-   Access activation rules.

**Exit criteria:** End-to-end registration works with real test
payment-provider integration and KYC review.

## Phase 4 -- Dynamic dashboard engine

-   Shared dashboard renderer.
-   Category dashboard configurations.
-   Subcategory features.
-   Permission-aware menus and widgets.
-   Dashboard data APIs.

**Exit criteria:** Multiple category experiences render through one
engine.

## Phase 5 -- Universal marketplace

-   Service listing creation.
-   Admin moderation.
-   Universal discovery.
-   Search and filters.
-   Privacy-safe public API.
-   FIC-mediated service requests.
-   Request tracking and communication.

**Exit criteria:** Cross-category discovery and provider privacy pass
tests.

## Phase 6 -- Business ecosystem modules

-   Business ideas.
-   Business development/scaling.
-   Investment interest.
-   Funding requests.
-   Partnerships.
-   Networking.
-   FIC coordination workflows.

**Exit criteria:** Requests are securely submitted, reviewed, assigned
and tracked.

## Phase 7 -- Mentoring and operations

-   Mentor/student workflows.
-   Session scheduling and attendance.
-   Feedback and performance.
-   Configurable FIC-funded payout.
-   Admin reports and complaints.

**Exit criteria:** No student-to-mentor checkout; approved payout
workflow is auditable.

## Phase 8 -- React Native Mobile Application

- Confirm mobile product scope and role-aware navigation.
- Scaffold `apps/mobile` using React Native CLI + TypeScript (bare workflow).
- Configure pnpm/Turborepo workspace and Metro monorepo resolution.
- Implement authentication, secure token storage and access gating.
- Implement dynamic registration, membership checkout handoff and KYC uploads.
- Implement dynamic dashboard and role-aware navigation.
- Implement Marketplace, My Requests, Business Ideas, Scaling, Investment, Meetings, My Services and Student/Mentor workflows according to permissions.
- Implement notifications, FCM/APNs, deep links and profile.
- Add native accessibility, device-size, offline/error and performance handling.
- Configure Android/iOS signing, icons, privacy permissions and store release pipelines.

**Exit criteria:** Android and iOS member apps pass end-to-end tests against the shared staging API, with push/deep-link, security and release checks completed.

## Phase 9 -- Hardening and launch

-   Security testing.
-   Privacy audit.
-   Performance/load testing.
-   Accessibility.
-   Backup and restore.
-   Legal/compliance sign-off.
-   Staging UAT.
-   Production deployment.

**Exit criteria:** Business, legal, security and technical owners
approve launch readiness.

------------------------------------------------------------------------

# 20. Project Management and Governance

## 20.1 Required project artifacts

This consolidated document is the baseline. For larger teams, split it
into: - BRD.md - PRD.md - SRS.md - SYSTEM_ARCHITECTURE.md -
DATABASE_SCHEMA.md - API_DOCUMENTATION.md - UI_UX_SPECIFICATION.md -
SECURITY_AND_PRIVACY.md - TESTING_STRATEGY.md -
DEPLOYMENT_AND_INFRASTRUCTURE.md - IMPLEMENTATION_ROADMAP.md -
OPEN_DECISIONS.md

Maintain one documentation index and version consistency.

## 20.2 Change control

Every material change should record: - Change ID - Requester - Reason -
Affected business rule - Affected UI/API/database/security/test areas -
Cost and schedule impact - Approval - Version and effective date

Do not change membership pricing, investment workflow, privacy policy or
KYC policy through an undocumented code change.

## 20.3 Traceability

Maintain a traceability matrix:

  ------------------------------------------------------------------------------------------------------
  Business       Product          API/data             UI                   Test case        Status
  requirement    requirement                                                                 
  -------------- ---------------- -------------------- -------------------- ---------------- -----------
  18+            Registration age Auth/registration    Signup               REG-AGE-001      Pending
  eligibility    check                                                                       

  One primary    Category         User/category        Signup               REG-CAT-001      Pending
  category       selection                                                                   

  Dynamic form   Configured       Form                 Registration         REG-FORM-001     Pending
                 fields           config/submission                                          

  Payment before Membership       Payment/membership   Checkout             PAY-001          Pending
  KYC            checkout                                                                    

  KYC approval   Activation gate  KYC/account          Tracking/dashboard   KYC-ACCESS-001   Pending
  for access                                                                                 

  Universal      Cross-category   Service listing      Marketplace          MKT-UNIV-001     Pending
  discovery      marketplace                                                                 

  Provider       Allowlisted      Marketplace API      Listing detail       PRIV-SVC-001     Pending
  privacy        response                                                                    

  FIC            Request workflow Requests/messages    Request tracking     REQ-FIC-001      Pending
  coordination                                                                               
  ------------------------------------------------------------------------------------------------------

Expand this matrix during detailed implementation.

------------------------------------------------------------------------

# 21. Acceptance Criteria -- Product-Level

The initial release is acceptable only when:

1.  A visitor can understand FIC's purpose and start registration.
2.  A person under 18 cannot register.
3.  A member can select exactly one primary category.
4.  Subcategories and details questions load dynamically.
5.  Admin can manage category and form configuration.
6.  The first-year ₹99 price and second-year ₹5,999 renewal are
    accurately disclosed according to approved tax/terms.
7.  Payment is verified server-side.
8.  KYC requirements are category/subcategory-aware.
9.  Full dashboard access is blocked until all activation conditions
    pass.
10. KYC correction does not create a duplicate membership charge.
11. A single dashboard engine renders different category experiences.
12. Members can discover approved services from all categories.
13. Public service APIs do not reveal provider identity/company/private
    contact details.
14. Service requests are routed through FIC.
15. Business development, investment interest, funding, partnership and
    networking requests can be securely submitted and tracked.
16. Investment and funding details remain private to authorized FIC
    staff.
17. Mentoring does not collect direct student-to-mentor payment.
18. Admin actions and sensitive data access are auditable.
19. Critical end-to-end, privacy and authorization tests pass.
20. Legal, tax, privacy and operational launch dependencies have been
    reviewed.
21. Android and iOS React Native CLI member applications pass supported-device end-to-end tests.
22. Mobile app uses the same backend authorization, membership, KYC, category configuration and FIC intermediary rules as web.
23. Push notifications, deep links, secure token storage, document uploads and payment handoff pass mobile security tests.

------------------------------------------------------------------------

# 22. Assumptions and Recommendations

These points are proposed unless explicitly approved by FIC:

-   The initial architecture is a modular monolith.
-   The first-year membership period begins on successful payment,
    subject to approved terms.
-   The member dashboard remains restricted while KYC is pending.
-   KYC rejection permits correction/resubmission without another
    membership charge.
-   Multiple subcategories may be allowed within one primary category if
    configured.
-   Service visibility requires provider eligibility, active membership,
    approved KYC and listing approval.
-   Service location is privacy-safe and configurable.
-   Category and dashboard configurations are versioned.
-   Investment/funding features initially manage private interest and
    introductions only.
-   Mentor payout rules are configurable and funded by FIC's approved
    budget.
-   Proposed uptime/performance/accessibility targets are engineering
    goals, not guarantees.

------------------------------------------------------------------------

# 23. Risks and Mitigations

  -----------------------------------------------------------------------
  Risk                    Impact                  Mitigation
  ----------------------- ----------------------- -----------------------
  Unclear business rules  Rework and disputes     Approve BRD and open
                                                  decisions before coding

  Dynamic engine          Delayed delivery        Build a safe, limited
  over-complexity                                 field/widget registry
                                                  first

  Privacy leakage         Legal and trust damage  Backend allowlists,
                                                  RBAC, privacy tests and
                                                  audit

  Investment regulatory   Severe legal risk       Limit initial feature
  exposure                                        to private interest
                                                  workflow pending advice

  Payment webhook errors  Incorrect membership    Signature verification,
                          state                   idempotency and
                                                  reconciliation

  KYC document exposure   Sensitive data breach   Private storage,
                                                  short-lived URLs and
                                                  access logs

  Configuration changes   Data corruption         Immutable versions and
  affect old users                                explicit migrations

  Uncontrolled scope      Cost and timeline       Phased roadmap and
                          growth                  change control

  Provider does not       Poor service experience SLA policy, escalation
  respond                                         and
                                                  alternative-provider
                                                  process

  Fake or misleading      Member harm             Moderation,
  listings                                        verification and
                                                  complaint workflow
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 24. Open Decisions Requiring FIC Approval

Do not invent answers to these questions. Record the final decision,
owner and approval date.

## Membership and finance

1.  Is ₹99 inclusive of GST or exclusive?
2.  Is ₹5,999 inclusive of GST or exclusive?
3.  Is renewal manual or automatic?
4.  What is the exact grace period after expiry?
5.  What is the refund/cancellation policy?
6.  What happens if payment succeeds but KYC is never completed?
7.  Are partial refunds or chargebacks supported?
8.  What invoice and accounting process will be used?

## Registration and KYC

9.  Which identity and business documents are mandatory for each
    subcategory?
10. Which categories require enhanced verification?
11. What is the expected KYC review SLA?
12. Can a member change their primary category later? If yes, what
    approval and migration process applies?
13. Are multiple subcategories allowed for every category or configured
    individually?

## Marketplace and service operations

14. Does FIC charge a coordination fee, service fee or commission? No
    fee should be assumed until approved.
15. What service-provider response SLA applies?
16. How are quotes, proposals, cancellation and disputes handled?
17. What information may be shared with the provider after requester
    consent?
18. Which locations may be displayed publicly?
19. What is the service listing validity and renewal policy?

## Investment and funding

20. What exact activities will FIC perform: interest collection,
    introductions, consultancy or regulated facilitation?
21. Will FIC ever receive, hold, transfer or disburse investment funds?
22. What legal/regulatory approvals and partner arrangements are
    required?
23. What suitability, consent, risk disclosure and record-retention
    process applies?
24. Can an investor's amount be shared with a potential funding seeker,
    and only under what consent?

## Mentoring

25. What is the mentor compensation model?
26. What are the approved performance measures and payout rules?
27. What is the review period and payout schedule?
28. Who approves mentor payouts and from which budget?

## Operations and technology

29. Which payment provider will be used?
30. Which email/SMS providers will be used?
31. Which cloud provider and region will host production data?
32. What are expected user volumes and launch geography?
33. What support hours and escalation SLA will FIC provide?
34. What languages are required at launch?
35. What data retention and deletion periods apply?

------------------------------------------------------------------------

# 25. Final Instruction to Antigravity / Development Team

Use this document as the baseline product and technical specification.

Before coding: 1. Inspect the existing repository. 2. Confirm the two
websites and one shared backend architecture. 3. Validate the monorepo
foundation. 4. Review this document with the FIC business owner. 5.
Resolve critical open decisions. 6. Produce a phased implementation plan
and traceability matrix.

Do not: - Build separate applications for each category. - Hardcode
category/subcategory lists into application logic. - Create separate
dashboard codebases for every category. - Restrict universal marketplace
visibility by a member's primary category. - Expose provider identity or
private contact details in public APIs. - Activate full dashboard access
based on payment alone. - Charge again for KYC resubmission. - Create
direct student-to-mentor payments. - Enable unapproved investment
transactions or money custody. - Claim that a feature is complete
without implementation and testing. - Replace existing working code
without inspection and approval.

Build incrementally, preserve existing work, use typed contracts,
validate at API boundaries, enforce authorization on the server, and
maintain tests and documentation.

**Product outcome:** A configurable, privacy-conscious FIC Business Hub
with a member website, admin website and native Android/iOS member app,
where eligible people can join, offer and discover services, submit
business opportunities, seek development support, express
investment/funding interest and build partnerships through FIC's
coordinated ecosystem.

**END OF DOCUMENT**
