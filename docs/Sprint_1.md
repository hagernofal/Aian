# AIAN — Sprint 1 Rough Outline

## 1. Sprint Goal

By the end of Sprint 1, the team should be able to run all three services locally and complete the full **platform setup flow**:

1. Start the frontend client.
2. Start the backend server.
3. Start PostgreSQL.
4. Register a user account.
5. Log in.
6. Start organization setup.
7. Choose a billing cycle and complete a payment flow.
8. Create the organization after payment confirmation.
9. Select the supported provider for each Eye.
10. Finish organization setup.
11. Open the Owner dashboard.
12. View all four Eyes and their connection status.
13. Open an Eye and start its connection flow, without implementing real OAuth yet.
14. Invite employees.
15. Assign roles and access levels.
16. Create custom roles.
17. Assign permissions to custom roles.
18. Enforce role/permission access validation in backend requests.

The sprint does **not** include real OAuth integrations, provider data syncing, knowledge processing, RAG, AI analysis, or Eye monitoring.

---

# 2. Final Local Development Architecture

```text
aian/
├── client/                 # Next.js frontend
├── server/                 # NestJS backend
├── docs/                   # Product, API, DB, sprint docs
├── docker-compose.yml      # Local PostgreSQL and optional local services
├── .env.example
└── README.md
```

The services run independently:

```text
Next.js client
http://localhost:3000

NestJS server
http://localhost:1234

PostgreSQL database
localhost:5432
```

The frontend never connects directly to PostgreSQL.

```text
Client
  ↓ HTTP requests
Server
  ↓ Prisma
PostgreSQL
```

For deployment, the same structure remains valid:

```text
Client deployment
  ↓ API URL environment variable
Server deployment
  ↓ DATABASE_URL environment variable
PostgreSQL deployment
```

The database may run:

* On the same machine as the backend, using a different port.
* On a separate database server.
* Through a managed PostgreSQL provider.

Prisma does not need special architecture for this. It only needs a valid `DATABASE_URL` in the backend environment.

Example local backend environment:

```env
DATABASE_URL="postgresql://aian_user:aian_password@localhost:5432/aian_db?schema=public"
PORT=1234
CLIENT_URL="http://localhost:3000"
```

Example production backend environment:

```env
DATABASE_URL="postgresql://username:password@database-host:5432/aian_db?schema=public"
PORT=1234
CLIENT_URL="https://app.example.com"
```

---

# 3. Main Sprint Sections

```text
Sprint 1
│
├── Section 1: Repository, environments, and team standards         >> completed.
├── Section 2: Client foundation and design system                  >> Maula
├── Section 3: Server foundation and API standards                  >> Amir
├── Section 4: PostgreSQL, Prisma, migrations, and seed data        >> Amir
├── Section 5: Authentication and session management                >> Azzazy
├── Section 6: Roles, permissions, and authorization guards         >> Azzazy
├── Section 7: Billing selection and payment flow foundation        >> Maula
├── Section 8: Organization creation and onboarding flow            >> Hager
├── Section 9: Eye/provider selection and connection placeholders   >> Hager
├── Section 10: Owner dashboard                                     >> Donia
├── Section 11: Member invitations and role management              >> Donia
├── Section 12: Custom roles and permission management              >> Azzazy
├── Section 13: Testing, documentation, and final integration
└── Section 14: Sprint demo and definition of done
```

---

# 4. Section 1 — Repository, Environments, and Team Standards

## Goal

Create a clean project that every team member can clone, configure, and run without manually guessing anything.

## Required Structure

```text
aian/
├── client/
├── server/
├── docs/
│   ├── database/
│   ├── api/
│   ├── product/
│   └── sprints/
├── docker-compose.yml
├── .gitignore
├── .env.example
├── README.md
└── package.json
```

## Required Deliverables

* Root project README.
* Setup instructions for client, server, and database.
* `.env.example` files for client and server.
* Git branch naming convention.
* Pull request template.
* Code formatting rules.
* Linting rules.
* Shared naming conventions.
* API response conventions.
* Docker Compose configuration for PostgreSQL.

## Suggested Branch Naming

```text
feature/auth-register
feature/organization-onboarding
feature/roles-permissions
fix/login-validation
chore/setup-prisma
docs/sprint-1-plan
```

---

# 5. Section 2 — Client Foundation and Design System

## Goal

Create the Next.js project so all future pages follow the same layout, colors, typography, component behavior, validation behavior, and loading/error patterns.

## Client Technology Direction

```text
Next.js
TypeScript
Tailwind CSS
Component library or internal component system
React Hook Form
Zod
API client layer
```

## Initial Client Structure

```text
client/
├── app/
│   ├── (public)/
│   │   ├── login/
│   │   └── register/
│   ├── (onboarding)/
│   │   ├── billing/
│   │   ├── organization/
│   │   ├── providers/
│   │   └── completion/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── eyes/
│   │   ├── members/
│   │   ├── roles/
│   │   └── settings/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   ├── forms/
│   ├── onboarding/
│   ├── dashboard/
│   ├── eyes/
│   ├── members/
│   └── roles/
├── lib/
│   ├── api/
│   ├── auth/
│   ├── constants/
│   ├── validations/
│   └── utils/
├── hooks/
├── types/
└── styles/
```

## Common UI Components Required Before Feature Pages

```text
Button
Input
PasswordInput
Select
Checkbox
Switch
Badge
Card
Modal
Dialog
DropdownMenu
Tabs
Table
Pagination
Toast
Alert
EmptyState
LoadingState
ErrorState
PageHeader
Sidebar
Topbar
FormField
PermissionGuard
```

## Design System Setup

Before feature pages, define:

```text
Primary color
Secondary color
Success color
Warning color
Error color
Neutral colors
Typography scale
Spacing scale
Border radius
Shadow rules
Button variants
Input states
Responsive breakpoints
```

The team should not create random colors, spacing values, or button styles inside individual pages.

---

# 6. Section 3 — Server Foundation and API Standards

## Goal

Create a NestJS backend that starts reliably, validates environment variables, connects to PostgreSQL through Prisma, and returns predictable API responses.

## Initial Server Structure

```text
server/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   ├── common/
│   │   ├── decorators/
│   │   ├── dto/
│   │   ├── enums/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── middleware/
│   │   ├── pipes/
│   │   ├── types/
│   │   └── utils/
│   ├── prisma/
│   ├── auth/
│   ├── users/
│   ├── organizations/
│   ├── memberships/
│   ├── roles/
│   ├── permissions/
│   ├── billing/
│   ├── onboarding/
│   ├── eyes/
│   ├── providers/
│   ├── integrations/
│   └── health/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── test/
├── .env.example
└── package.json
```

## Backend Foundation Requirements

* Global API prefix: `/api/v1`.
* Global DTO validation.
* Global error handler.
* Request logging.
* CORS configured for client URL.
* Environment variable validation.
* Prisma connection lifecycle handling.
* Health endpoint.
* postman collection / documentation.
* Authentication guard foundation.
* Permission guard foundation.
* Standard response shape.

## Standard Successful Response Shape

```json
{
  "success": true,
  "message": "Organization created successfully.",
  "data": {}
}
```

## Standard Error Response Shape

```json
{
  "success": false,
  "message": "Validation failed.",
  "error": {
    "code": "VALIDATION_ERROR",
    "fields": {
      "email": ["Email must be valid."],
      "password": ["Password must contain at least 8 characters."]
    }
  },
  "requestId": "request-uuid"
}
```

## Required Error Categories

```text
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
CONFLICT
PAYMENT_REQUIRED
PAYMENT_FAILED
INVALID_STATE
INTERNAL_SERVER_ERROR
```

---

# 7. Section 4 — PostgreSQL, Prisma, Migrations, and Seed Data

## Goal

Make the database reliable, reproducible, and ready for all Sprint 1 features.

## Prisma Responsibilities

Prisma will:

* Connect NestJS to PostgreSQL.
* Define the database models.
* Generate the Prisma client.
* Create versioned migrations.
* Run seed data.
* Provide typed database access.

## Required Prisma Commands

```text
npx prisma migrate dev
npx prisma generate
npx prisma db seed
npx prisma studio
```

## Sprint 1 Database Tables

```text
users
organizations
roles
permissions
role_permissions
organization_members
subscriptions
payments
eye_types
providers
eye_providers
organization_eyes
onboarding_progress
```

## Required Seed Data

### System Roles

```text
owner
admin
member
```

### Permissions

```text
organization.read
organization.update
organization.delete

billing.read
billing.manage

members.read
members.invite
members.update_role
members.remove

roles.read
roles.create
roles.update
roles.delete
roles.assign_permissions

eyes.read
eyes.manage

providers.read
providers.select

integrations.read
integrations.connect

dashboard.read
```

### Eye Types

```text
chat
meeting
task
coding
```

### Providers

```text
Slack
Microsoft Teams
Discord

Zoom
Google Meet
Microsoft Teams

Jira
Linear
ClickUp

GitHub
GitLab
Bitbucket
```

### V1 Available Provider Mapping

```text
Chat Eye → Slack
Meeting Eye → Zoom
Task Eye → Jira
Coding Eye → GitHub
```

All other provider mappings should exist but have:

```text
isActive = false
```

This allows the UI to show future providers as disabled or “Coming Soon” without allowing users to select them.

---

# 8. Section 5 — Authentication and Session Management

## User Journey

```text
Visitor opens application
    ↓
Visitor chooses Register
    ↓
Visitor submits name, email, password
    ↓
Backend validates input
    ↓
Backend creates user
    ↓
Backend creates authenticated session
    ↓
Frontend redirects user to billing/onboarding
```

## Frontend Pages

```text
/register
/login
/forgot-password            Optional for Sprint 1
/reset-password             Optional for Sprint 1
```

## Register Page Components

```text
Logo
Page title
Full name input
Email input
Password input
Confirm password input
Terms checkbox
Submit button
Login link
Inline field errors
Global form error
Loading state
```

## Required Backend Endpoints

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
POST /api/v1/auth/refresh
```

## Register Request

```json
{
  "fullName": "Amir Alsayed",
  "email": "amir@example.com",
  "password": "StrongPassword123!",
  "confirmPassword": "StrongPassword123!"
}
```

## Successful Register Response

```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "user": {
      "id": "user-uuid",
      "fullName": "Amir Alsayed",
      "email": "amir@example.com"
    }
  }
}
```

## Expected Error Cases

```text
Email already exists
Invalid email
Weak password
Passwords do not match
Missing required fields
Rate limit exceeded
```

---

# 9. Section 6 — Roles, Permissions, and Authorization

## Goal

Implement real backend authorization from Sprint 1, not only frontend hiding.

## Important Rule

Frontend permission checks improve the user experience.

Backend permission checks protect the system.

Every protected backend request must verify:

```text
1. User is authenticated.
2. User belongs to the target organization.
3. User has the required permission.
```

## Authorization Flow

```text
Request arrives
    ↓
JWT/session guard validates user
    ↓
Organization membership is loaded
    ↓
Role is loaded
    ↓
Role permissions are loaded
    ↓
Required permission is checked
    ↓
Allow request or return FORBIDDEN
```

## Example Permission Requirement

```text
POST /organizations/:organizationId/members

Required permission:
members.invite
```

## Custom Role Rules

The organization Owner or a permitted Admin can create custom roles.

Example:

```text
Role name: Senior Engineer

Permissions:
- dashboard.read
- eyes.read
- integrations.read
- members.read
- ai.use
```

A custom role must belong to one organization.

System roles such as `owner`, `admin`, and `member` remain global and cannot be deleted.

---

# 10. Section 7 — Billing Selection and Payment Flow Foundation

## Goal

Complete the product flow mentally and structurally by placing payment before organization creation.

Real payment provider implementation can be either:

```text
Option A: Fully implement one payment provider in Sprint 1.
Option B: Implement a payment adapter and mock checkout success for local development.
```

If the team can safely implement a provider in the sprint, use one provider only. If not, do not block organization work; build the exact backend interfaces and a local mock provider.

## User Journey

```text
Authenticated user
    ↓
Chooses monthly or yearly billing
    ↓
Starts checkout
    ↓
Payment provider confirms payment
    ↓
Backend verifies payment
    ↓
Organization setup becomes available
```

## Frontend Page

```text
/onboarding/billing
```

## Billing Page Components

```text
Monthly billing option
Yearly billing option
Price placeholder
Feature summary placeholder
Continue to payment button
Payment loading state
Payment failure state
```

## Required Backend Endpoints

```text
POST /api/v1/billing/checkout
POST /api/v1/billing/webhook
GET  /api/v1/billing/checkout-status/:checkoutId
```

## Important Backend Rule

The frontend redirect after payment is not trusted.

Only a verified backend webhook or verified provider API result can mark payment as successful.

---

# 11. Section 8 — Organization Creation and Onboarding

## User Journey

```text
Payment verified
    ↓
User enters organization details
    ↓
User selects providers for all four Eyes
    ↓
Backend creates organization in one transaction
    ↓
User becomes Owner
    ↓
System creates four organization Eyes
    ↓
System creates onboarding progress
    ↓
User reaches onboarding completion/dashboard
```

## Organization Creation Page

```text
/onboarding/organization
```

## Components

```text
Organization name input
Description textarea
Industry select
Company size select
Country select
Timezone select
Continue button
Back button
Validation errors
Loading state
```

## Provider Selection Page

```text
/onboarding/providers
```

## Components

```text
Chat Eye provider card group
Meeting Eye provider card group
Task Eye provider card group
Coding Eye provider card group
Coming Soon provider badges
Selected provider indicator
Continue button
Back button
```

## Required Backend Endpoints

```text
POST /api/v1/onboarding/organization
GET  /api/v1/onboarding/progress
PUT  /api/v1/onboarding/providers
POST /api/v1/onboarding/complete
```

## Provider Selection Request

```json
{
  "providers": [
    {
      "eyeType": "chat",
      "providerKey": "slack"
    },
    {
      "eyeType": "meeting",
      "providerKey": "zoom"
    },
    {
      "eyeType": "task",
      "providerKey": "jira"
    },
    {
      "eyeType": "coding",
      "providerKey": "github"
    }
  ]
}
```

## Invalid Provider Selection Response

```json
{
  "success": false,
  "message": "One or more selected providers are not available.",
  "error": {
    "code": "VALIDATION_ERROR",
    "fields": {
      "providers[0].providerKey": [
        "Microsoft Teams is not available for the Chat Eye in V1."
      ]
    }
  },
  "requestId": "request-uuid"
}
```

---

# 12. Section 9 — Eye Connection Placeholders

## Goal

Allow the owner to see each Eye and begin a connection action, but do not implement OAuth yet.

## Owner Dashboard Eye States

```text
Not configured
Ready to connect
Connection coming soon
Connected                 Not implemented in Sprint 1
Needs reauthorization     Not implemented in Sprint 1
```

## Eye Detail Page

```text
/dashboard/eyes/[eyeType]
```

## Components

```text
Eye name
Selected provider
Current status badge
Provider logo
Connection explanation
Connect button
Disabled sync controls
Disabled resource selection section
Coming soon notice
```

## Required Backend Endpoints

```text
GET /api/v1/organizations/:organizationId/eyes
GET /api/v1/organizations/:organizationId/eyes/:eyeType
POST /api/v1/organizations/:organizationId/eyes/:eyeType/request-connection
```

The last endpoint may simply record an audit/event placeholder or return:

```json
{
  "success": true,
  "message": "OAuth connection will be available in the integrations sprint.",
  "data": {
    "eyeStatus": "ready_to_connect"
  }
}
```

---

# 13. Section 10 — Owner Dashboard

## Goal

Give the Owner a working place to understand the organization setup state.

## Dashboard Page

```text
/dashboard
```

## Components

```text
Organization name
Organization status
Onboarding progress card
Subscription status card
Four Eye status cards
Quick action: manage members
Quick action: manage roles
Quick action: open organization settings
Recent activity placeholder
```

## Required Backend Endpoint

```text
GET /api/v1/dashboard/owner
```

## Dashboard Response Data

```text
Organization details
Current subscription status
Onboarding progress
Eye status list
Member count
Role count
```

---

# 14. Section 11 — Members and Invitations

## Goal

Allow the Owner or authorized Admin to manage employees.

## User Journey

```text
Owner opens Members page
    ↓
Owner clicks Invite Member
    ↓
Owner enters email and selects role
    ↓
Backend creates invitation/member record
    ↓
Invitee receives invite later or is visible as pending
    ↓
Owner can change role, deactivate, or remove member
```

Email sending can be mocked in Sprint 1 if required. The membership workflow and authorization must still be real.

## Frontend Page

```text
/dashboard/members
```

## Components

```text
Members table
Search input
Role filter
Member status filter
Invite member button
Invite modal
Role select
Change role modal
Deactivate confirmation dialog
Remove member confirmation dialog
Empty state
Loading state
```

## Required Backend Endpoints

```text
GET    /api/v1/organizations/:organizationId/members
POST   /api/v1/organizations/:organizationId/members/invite
PATCH  /api/v1/organizations/:organizationId/members/:memberId/role
PATCH  /api/v1/organizations/:organizationId/members/:memberId/status
DELETE /api/v1/organizations/:organizationId/members/:memberId
```

---

# 15. Section 12 — Custom Roles and Permission Management

## Goal

Allow authorized users to create organization-specific roles such as Senior Engineer.

## Frontend Page

```text
/dashboard/roles
```

## Components

```text
Roles table
Role name
Role description
System/custom badge
Permission count
Create role button
Create role modal/page
Permission groups
Permission checkboxes
Edit role action
Delete role confirmation
```

## Required Backend Endpoints

```text
GET    /api/v1/organizations/:organizationId/roles
POST   /api/v1/organizations/:organizationId/roles
PATCH  /api/v1/organizations/:organizationId/roles/:roleId
DELETE /api/v1/organizations/:organizationId/roles/:roleId
GET    /api/v1/permissions
```

## Create Custom Role Request

```json
{
  "name": "Senior Engineer",
  "description": "Engineering access with dashboard and Eye visibility.",
  "permissionKeys": [
    "dashboard.read",
    "eyes.read",
    "integrations.read",
    "members.read"
  ]
}
```

## Required Protection Rules

```text
Only users with roles.create can create roles.
Only users with roles.update can edit custom roles.
Only users with roles.delete can delete custom roles.
System roles cannot be edited or deleted.
Owner role cannot be assigned by normal Admins unless explicitly permitted.
A role in use cannot be deleted until members are reassigned.
```

---

# 16. Section 13 — Testing, Documentation, and Final Integration

## Backend Tests

```text
Register user successfully
Reject duplicate email
Login successfully
Reject invalid password
Reject unauthenticated request
Reject cross-organization access
Create organization transaction successfully
Create exactly four Eyes
Reject unavailable provider selection
Create custom role
Assign custom role
Reject user without required permission
Invite member
Change member role
Reject deletion of system role
```

## Frontend Tests

```text
Register form validation
Login form validation
Organization form validation
Provider selection behavior
Disabled future provider behavior
Permission-based UI hiding
Member invitation form
Custom role permission selection
API error display
Loading states
```

## Documentation Required

```text
README setup guide
Environment variable guide
Database migration guide
Seed data guide
API endpoint documentation
Permission matrix
Sprint 1 user journey
Known limitations
```

---

# 17. Section 14 — Sprint 1 Definition of Done

Sprint 1 is complete when a new developer can:

```text
1. Clone the repository.
2. Configure environment files.
3. Start PostgreSQL.
4. Run Prisma migrations.
5. Run Prisma seeds.
6. Start NestJS server.
7. Start Next.js client.
8. Register an account.
9. Log in.
10. Select monthly or yearly billing.
11. Complete real or mocked verified payment.
12. Create organization details.
13. Select Slack, Zoom, Jira, and GitHub.
14. Finish onboarding.
15. Open Owner dashboard.
16. View all four Eyes.
17. Open an Eye connection placeholder.
18. Invite an employee.
19. Assign a system or custom role.
20. Create a custom role with permissions.
21. Verify backend blocks unauthorized requests.
22. Run tests successfully.
```

## Explicitly Out of Scope

```text
Real OAuth authorization
Provider token storage
Provider resource import
Slack/Zoom/Jira/GitHub syncing
Webhooks
Knowledge file upload
RAG
Embeddings
AI processing
Eye monitoring
Notifications
Real analytics
Production deployment automation
```