
# 01 Organization Onboarding

> **Purpose**
>
> This document describes the complete V1 onboarding journey, from the moment a customer creates an account until the AI platform is fully initialized and ready to monitor the organization's data.

---

# 1. Core Concepts

The platform is built around four independent concepts.

```text
Platform
    │
    ▼
Account
    │
    ▼
Organization
    │
    ▼
Eyes
```

## Platform Account

A platform account belongs to one human.

It is used only to authenticate into the SaaS.

Typical fields:

- Name
- Email
- Password
- Google Sign In (future: Microsoft)

An account may belong to multiple organizations in the future, but V1 assumes one primary organization.

---

## Organization

An Organization is the customer.

Everything belongs to the organization:

- Members
- Subscription
- AI Eyes
- Integrations
- Knowledge Base
- Settings

---

## Members

Members belong to an organization.

Instead of job titles (Senior, Junior, Manager...), the platform uses RBAC.

### Roles

- Owner
- Admin
- Member

Owner has exclusive permissions:

- Delete organization
- Manage billing
- Transfer ownership
- Promote/Demote admins

Admins:

- Invite members
- Manage Eyes
- Configure integrations
- Upload knowledge

Members:

- Use AI
- View dashboards
- Access features permitted by admins

---

## Eyes

V1 contains four fixed Eyes.

- Chat Eye
- Meeting Eye
- Task Eye
- Coding Eye

Every Eye focuses on one domain only.

---

# 2. Complete User Journey

```text
Landing Page
    │
    ▼
Create Platform Account
    │
    ▼
Login
    │
    ▼
Choose Subscription
    │
    ▼
Choose Billing Cycle
    │
    ▼
Complete Payment
    │
    ▼
Create Organization
    │
    ▼
Become Organization Owner
    │
    ▼
Select Provider for Every Eye
    │
    ▼
Organization Created
    │
    ▼
Invite Team Members (Optional)
    │
    ▼
Connect Every Eye (OAuth)
    │
    ▼
Select Resources
    │
    ▼
Upload Organization Knowledge
    │
    ▼
Initial Synchronization
    │
    ▼
AI Initialization
    │
    ▼
Dashboard Ready
```

---

# 3. Step-by-Step Flow

## Step 1 — Create Platform Account

Purpose:

Allow a person to register in the platform.

Required information:

- Full Name
- Email
- Password

Future:

- Google Login
- Microsoft Login

Result:

A platform account is created.

---

## Step 2 — Login

The user signs into the platform.

If no organization exists, the onboarding wizard starts automatically.

---

## Step 3 — Choose Subscription

Before creating an organization, the customer selects a subscription.

Example:

Starter

- Chat Eye
- Meeting Eye
- Task Eye
- Coding Eye

Billing:

- Monthly
- Yearly

Even if V1 contains only one plan, the UI should support multiple plans later.

---

## Step 4 — Payment

The customer completes payment.

Only successful payment allows organization creation.

Benefits:

- Prevent orphan organizations.
- Every organization starts with an active subscription.
- Simpler billing logic.

---

## Step 5 — Create Organization

The customer provides:

- Organization Name
- Description
- Industry
- Company Size
- Timezone
- Country
- Logo (optional)

After creation:

- Organization is created.
- Subscription is linked.
- Creator becomes Owner automatically.

---

## Step 6 — Select Provider for Each Eye

Every Eye requires one provider.

### Chat Eye

Supported in V1

- Slack

Coming Soon

- Microsoft Teams
- Discord
- Google Chat

### Coding Eye

Supported

- GitHub

Coming Soon

- GitLab
- Bitbucket

### Task Eye

Supported

- Jira

Coming Soon

- Linear
- ClickUp

### Meeting Eye

Supported

- Zoom

Coming Soon

- Google Meet
- Microsoft Teams

At this point providers are only selected.

OAuth has not happened yet.

---

## Step 7 — Organization Created

Status:

Organization: Created

Eyes:

- Chat Eye (Disconnected)
- Coding Eye (Disconnected)
- Task Eye (Disconnected)
- Meeting Eye (Disconnected)

The user can now enter the dashboard.

---

## Step 8 — Invite Members (Optional)

The Owner may invite teammates.

Invitation requires:

- Name
- Email
- Role

Supported roles:

- Admin
- Member

Future:

Custom roles.

---

## Step 9 — Connect Eyes

Every Eye has its own page.

Example:

Chat Eye

Status:

Disconnected

Action:

Connect Slack

OAuth starts.

Same idea for every Eye.

---

## Step 10 — Select Resources

After OAuth succeeds, users choose exactly what AI monitors.

Chat Eye

- Channels
- Private channels (if allowed)

Coding Eye

- Repositories
- Branches

Task Eye

- Projects
- Boards

Meeting Eye

- Calendars
- Meeting sources

The platform should never monitor everything automatically.

---

## Step 11 — Upload Organization Knowledge

Purpose:

Bootstrap the AI before live monitoring.

Suggested limit:

- 5 files
- 100 MB

Supported:

- PDF
- DOCX
- Markdown
- TXT

Examples:

- Employee Handbook
- Coding Standards
- Architecture Documentation
- Business Rules
- Internal Wiki Export

These files become the initial RAG knowledge base.

---

## Step 12 — Initial Synchronization

The platform downloads historical data.

Examples:

GitHub

- Commits
- Pull Requests
- Issues

Slack

- Channels
- Messages

Jira

- Projects
- Issues
- Sprints

Zoom

- Meetings
- Transcripts

Display progress during sync.

---

## Step 13 — AI Initialization

After data collection:

- Parse documents
- Clean data
- Chunk content
- Generate embeddings
- Build knowledge index
- Build initial memory
- Prepare monitoring jobs

Only after this stage is AI considered ready.

---

## Step 14 — Dashboard

The first dashboard shows:

Organization Health

Eyes

- Chat Eye
- Coding Eye
- Task Eye
- Meeting Eye

Knowledge

- Files indexed
- Repositories
- Projects
- Meetings
- Channels

Last Sync

Current AI Status

---

# 4. Eye Health

Each Eye has a health state.

- Healthy
- Syncing
- Warning
- Disconnected
- Needs Reauthorization

This allows administrators to detect problems quickly.

---

# 5. Settings

## Organization

- Name
- Description
- Logo
- Timezone
- Language

## Members

- Invite
- Remove
- Change Role

## Integrations

- Reconnect OAuth
- Disconnect
- Refresh
- View Last Sync

## AI

- Sync Interval
- Retention
- Notifications
- Context Limits

## Eye Settings

Common:

- Enable/Disable
- Current Status
- Connected Provider
- Last Sync
- Manual Sync
- Knowledge Statistics

Eye-specific settings:

### Chat Eye

- Channels
- Ignore Channels
- Bot Filtering

### Meeting Eye

- Recording Policy
- Transcript Import
- Auto Summaries

### Task Eye

- Projects
- Status Filters
- Sprint Handling

### Coding Eye

- Repositories
- Branch Filters
- PR Comments
- Releases

---

# 6. Organization Lifecycle

```text
Account Created
        │
        ▼
Subscription Selected
        │
        ▼
Payment Completed
        │
        ▼
Organization Created
        │
        ▼
Providers Selected
        │
        ▼
Eyes Connected
        │
        ▼
Resources Selected
        │
        ▼
Knowledge Uploaded
        │
        ▼
Initial Synchronization
        │
        ▼
AI Initialization
        │
        ▼
Ready
```

---

# Design Principles

- The Organization is the customer.
- The Owner controls billing and organization management.
- Eyes are fixed in V1 to reduce complexity.
- Every Eye connects independently.
- OAuth is separate from provider selection.
- Historical synchronization happens once during onboarding.
- Organization knowledge provides initial context for AI.
- AI begins monitoring only after successful initialization.
- Every integration exposes its own health status.
- The onboarding process should be resumable at any point.
