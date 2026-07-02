# Platform Database Schema — V1 Reference

This document is the **database design reference**, not an SQL tutorial. Every table below includes its exact purpose, primary key, foreign keys, constraints, a column-by-column structure, and an example record.

Use PostgreSQL. UUIDs are primary keys. `TIMESTAMPTZ` is used for dates. `JSONB` is reserved for provider-specific or flexible settings.

## V1 Rules

1. A user owns or belongs to organizations.
2. Each organization has one current subscription.
3. Each organization always has four Eye records: Chat, Meeting, Task, and Coding.
4. Each Eye can support many providers in the catalog, but in V1 only one provider per Eye is marked available and selectable.
5. An organization selects one provider for each Eye, then connects it through OAuth.
6. One organization Eye has one integration in V1.
7. Files live in object storage; the database stores file metadata only.

## Relationship Map

```text
users ──< organization_members >── organizations
                                  ├── subscriptions ──< payments
                                  ├── organization_eyes ──< integrations ──< integration_resources
                                  ├── organization_knowledge_files
                                  └── onboarding_progress

roles ──< organization_members
roles ──< role_permissions >── permissions

eye_types ──< eye_providers >── providers
eye_types ──< organization_eyes
providers ──< organization_eyes
providers ──< integrations
```

---

# 1. `users`

**Purpose:** One human account that can log in and belong to one or more organizations.

**Primary key:** `id`  
**Foreign keys:** None

| Column | Type | Required | Key / rule | Example |
|---|---|---:|---|---|
| `id` | UUID | Yes | PK, generated | `a12f...` |
| `full_name` | VARCHAR(150) | Yes |  | `Amir Alsayed` |
| `email` | VARCHAR(255) | Yes | UNIQUE | `amir@acme.com` |
| `password_hash` | TEXT | No | Never store plain password | `$argon2id$...` |
| `email_verified_at` | TIMESTAMPTZ | No |  | `2026-07-02T10:00:00Z` |
| `status` | `user_status` | Yes | default `pending_verification` | `active` |
| `created_at` | TIMESTAMPTZ | Yes | default now | `2026-07-01T09:00:00Z` |
| `updated_at` | TIMESTAMPTZ | Yes | default now | `2026-07-02T10:00:00Z` |

**Example record**

```json
{
  "id": "a12f1111-1111-4111-8111-111111111111",
  "full_name": "Amir Alsayed",
  "email": "amir@acme.com",
  "password_hash": "$argon2id$hashed-value",
  "email_verified_at": "2026-07-02T10:00:00Z",
  "status": "active"
}
```

---

# 2. `organizations`

**Purpose:** The customer workspace/company.

**Primary key:** `id`  
**Foreign key:** `created_by_user_id → users.id`

| Column | Type | Required | Key / rule | Example |
|---|---|---:|---|---|
| `id` | UUID | Yes | PK | `b22f...` |
| `name` | VARCHAR(150) | Yes |  | `Acme Engineering` |
| `slug` | VARCHAR(180) | Yes | UNIQUE | `acme-engineering` |
| `description` | TEXT | No |  | `Product engineering team` |
| `industry` | VARCHAR(100) | No |  | `Software` |
| `company_size` | VARCHAR(50) | No |  | `11-50` |
| `country` | VARCHAR(100) | No |  | `Egypt` |
| `timezone` | VARCHAR(100) | Yes | IANA timezone | `Africa/Cairo` |
| `logo_url` | TEXT | No |  | `https://cdn.../logo.png` |
| `status` | `organization_status` | Yes | lifecycle state | `pending_connections` |
| `created_by_user_id` | UUID | Yes | FK → `users.id` | `a12f...` |
| `created_at` | TIMESTAMPTZ | Yes |  | `2026-07-02T10:05:00Z` |
| `updated_at` | TIMESTAMPTZ | Yes |  | `2026-07-02T10:05:00Z` |

**Example record**

```json
{
  "id": "b22f2222-2222-4222-8222-222222222222",
  "name": "Acme Engineering",
  "slug": "acme-engineering",
  "timezone": "Africa/Cairo",
  "status": "pending_connections",
  "created_by_user_id": "a12f1111-1111-4111-8111-111111111111"
}
```

---

# 3. RBAC tables

## `roles`

**Purpose:** Global system roles for V1. Do not use job titles such as senior/junior for authorization.

**PK:** `id` | **FKs:** None

| Column | Type | Required | Key / rule | Example |
|---|---|---:|---|---|
| `id` | UUID | Yes | PK | `r01...` |
| `key` | VARCHAR(50) | Yes | UNIQUE | `owner` |
| `name` | VARCHAR(100) | Yes |  | `Owner` |
| `description` | TEXT | No |  | `Full organization control` |
| `is_system_role` | BOOLEAN | Yes | default true | `true` |
| `created_at` | TIMESTAMPTZ | Yes |  | `2026-07-01T00:00:00Z` |

Seed rows: `owner`, `admin`, `member`.

## `permissions`

**Purpose:** Atomic actions a role can perform.

**PK:** `id` | **FKs:** None

| Column | Type | Required | Key / rule | Example |
|---|---|---:|---|---|
| `id` | UUID | Yes | PK | `p01...` |
| `key` | VARCHAR(100) | Yes | UNIQUE | `eyes.manage` |
| `name` | VARCHAR(150) | Yes |  | `Manage Eyes` |
| `description` | TEXT | No |  | `Configure and pause Eyes` |

Suggested V1 permissions: `billing.manage`, `members.invite`, `members.remove`, `members.change_role`, `eyes.manage`, `integrations.manage`, `knowledge.upload`, `settings.manage`, `ai.use`.

## `role_permissions`

**Purpose:** Bridge table: many roles can have many permissions.

**Primary key:** composite `(role_id, permission_id)`  
**Foreign keys:** `role_id → roles.id`, `permission_id → permissions.id`

| Column | Type | Required | Key / rule | Example |
|---|---|---:|---|---|
| `role_id` | UUID | Yes | PK + FK | owner role UUID |
| `permission_id` | UUID | Yes | PK + FK | billing.manage UUID |

**Example:** Owner + `billing.manage`; Admin + `eyes.manage`; Member + `ai.use`.

## `organization_members`

**Purpose:** Connects a user to an organization and gives that user a role.

**PK:** `id`  
**Foreign keys:** `organization_id → organizations.id`; `user_id → users.id`; `role_id → roles.id`; `invited_by_user_id → users.id`

| Column | Type | Required | Key / rule | Example |
|---|---|---:|---|---|
| `id` | UUID | Yes | PK | `m01...` |
| `organization_id` | UUID | Yes | FK | `b22f...` |
| `user_id` | UUID | Yes | FK | `a12f...` |
| `role_id` | UUID | Yes | FK | owner role UUID |
| `member_status` | `membership_status` | Yes | invited/active/deactivated | `active` |
| `invited_by_user_id` | UUID | No | FK | `a12f...` |
| `joined_at` | TIMESTAMPTZ | No |  | `2026-07-02T10:06:00Z` |
| `created_at` | TIMESTAMPTZ | Yes |  |  |
| `updated_at` | TIMESTAMPTZ | Yes |  |  |

**Unique rule:** `(organization_id, user_id)` — same user cannot join the same organization twice.

---

# 4. Billing tables

## `subscriptions`

**Purpose:** The current billing agreement. V1 has one subscription per organization and no plans table.

**PK:** `id`  
**Foreign key:** `organization_id → organizations.id`  
**Unique rules:** `organization_id`; `provider_subscription_id`

| Column | Type | Required | Key / rule | Example |
|---|---|---:|---|---|
| `id` | UUID | Yes | PK | `s01...` |
| `organization_id` | UUID | Yes | UNIQUE FK | `b22f...` |
| `billing_cycle` | `billing_cycle` | Yes | monthly/yearly | `monthly` |
| `status` | `subscription_status` | Yes | access state | `active` |
| `payment_provider` | VARCHAR(50) | Yes |  | `paymob` |
| `provider_customer_id` | VARCHAR(255) | No | external ID | `cus_123` |
| `provider_subscription_id` | VARCHAR(255) | No | UNIQUE external ID | `sub_123` |
| `current_period_start` | TIMESTAMPTZ | No |  | `2026-07-02T00:00:00Z` |
| `current_period_end` | TIMESTAMPTZ | No |  | `2026-08-02T00:00:00Z` |
| `cancel_at_period_end` | BOOLEAN | Yes | default false | `false` |
| `created_at` | TIMESTAMPTZ | Yes |  |  |
| `updated_at` | TIMESTAMPTZ | Yes |  |  |

**Access rule:** only `active` subscriptions unlock normal platform usage.

## `payments`

**Purpose:** Payment transaction history. One subscription has many payments.

**PK:** `id`  
**Foreign keys:** `organization_id → organizations.id`; `subscription_id → subscriptions.id`  
**Unique rule:** `provider_payment_id`

| Column | Type | Required | Key / rule | Example |
|---|---|---:|---|---|
| `id` | UUID | Yes | PK | `pay01...` |
| `organization_id` | UUID | Yes | FK | `b22f...` |
| `subscription_id` | UUID | Yes | FK | `s01...` |
| `payment_provider` | VARCHAR(50) | Yes |  | `paymob` |
| `provider_payment_id` | VARCHAR(255) | Yes | UNIQUE | `txn_123` |
| `amount_cents` | INTEGER | Yes | >= 0 | `2999` |
| `currency` | VARCHAR(10) | Yes |  | `USD` |
| `billing_cycle` | `billing_cycle` | Yes |  | `monthly` |
| `status` | `payment_status` | Yes | pending/paid/failed/refunded | `paid` |
| `paid_at` | TIMESTAMPTZ | No |  | `2026-07-02T10:04:00Z` |
| `failure_reason` | TEXT | No |  | `Card declined` |
| `provider_payload` | JSONB | No | webhook debug payload | `{"transaction_id":"txn_123"}` |
| `created_at` | TIMESTAMPTZ | Yes |  |  |
| `updated_at` | TIMESTAMPTZ | Yes |  |  |

---

# 5. Eye and provider catalog

This is the part that controls what can be shown in onboarding.

## `eye_types`

**Purpose:** The fixed Eye categories.

**PK:** `id` | **FKs:** None | **Unique:** `key`

| Column | Type | Required | Example |
|---|---|---:|---|
| `id` | UUID | Yes | `eye-chat-uuid` |
| `key` | VARCHAR(50) | Yes | `chat` |
| `name` | VARCHAR(100) | Yes | `Chat Eye` |
| `description` | TEXT | No | `Monitors organizational chat` |
| `is_active` | BOOLEAN | Yes | `true` |

Seed records: `chat`, `meeting`, `task`, `coding`.

## `providers`

**Purpose:** Every possible external provider, including future ones.

**PK:** `id` | **FKs:** None | **Unique:** `key`

| Column | Type | Required | Example |
|---|---|---:|---|
| `id` | UUID | Yes | `prov-slack-uuid` |
| `key` | VARCHAR(50) | Yes | `slack` |
| `name` | VARCHAR(100) | Yes | `Slack` |
| `oauth_supported` | BOOLEAN | Yes | `true` |
| `is_active` | BOOLEAN | Yes | `true` |
| `created_at` | TIMESTAMPTZ | Yes |  |
| `updated_at` | TIMESTAMPTZ | Yes |  |

`is_active` means the provider exists generally in the product catalog. It does **not** mean it is selectable for a particular Eye.

## `eye_providers`

**Purpose:** Defines valid provider choices for each Eye and controls V1 availability.

**Primary key:** composite `(eye_type_id, provider_id)`  
**Foreign keys:** `eye_type_id → eye_types.id`; `provider_id → providers.id`

| Column | Type | Required | Meaning | Example |
|---|---|---:|---|---|
| `eye_type_id` | UUID | Yes | PK + FK | Chat Eye UUID |
| `provider_id` | UUID | Yes | PK + FK | Slack UUID |
| `is_available_in_v1` | BOOLEAN | Yes | Can user select it now? | `true` |
| `is_enabled` | BOOLEAN | Yes | Admin/system kill switch | `true` |

### Required V1 behavior

Put **all planned options** in this table, but only one row per Eye has `is_available_in_v1 = true`.

| Eye | Provider | Available in V1 | What user sees |
|---|---|---:|---|
| Chat | Slack | true | Selectable |
| Chat | Microsoft Teams | false | Coming soon / disabled |
| Chat | Discord | false | Coming soon / disabled |
| Meeting | Zoom | true | Selectable |
| Meeting | Google Meet | false | Coming soon / disabled |
| Task | Jira | true | Selectable |
| Task | Linear | false | Coming soon / disabled |
| Coding | GitHub | true | Selectable |
| Coding | GitLab | false | Coming soon / disabled |

This solves the requirement: **many choices are modeled now, but only the supported V1 choice can be selected.**

Example rows:

```json
[
  {"eye_type_id":"chat-uuid","provider_id":"slack-uuid","is_available_in_v1":true,"is_enabled":true},
  {"eye_type_id":"chat-uuid","provider_id":"teams-uuid","is_available_in_v1":false,"is_enabled":true}
]
```

---

# 6. Organization Eye setup and OAuth

## `organization_eyes`

**Purpose:** The actual four Eyes owned by one organization.

**PK:** `id`  
**Foreign keys:** `organization_id → organizations.id`; `eye_type_id → eye_types.id`; `selected_provider_id → providers.id`  
**Unique rule:** `(organization_id, eye_type_id)`

| Column | Type | Required | Meaning | Example |
|---|---|---:|---|---|
| `id` | UUID | Yes | PK | `oe-chat-01` |
| `organization_id` | UUID | Yes | FK | `b22f...` |
| `eye_type_id` | UUID | Yes | FK | Chat Eye UUID |
| `selected_provider_id` | UUID | No | FK; null before selection | Slack UUID |
| `status` | `eye_status` | Yes | Eye health | `disconnected` |
| `is_enabled` | BOOLEAN | Yes | Admin pause switch | `true` |
| `sync_schedule` | VARCHAR(50) | Yes | V1 schedule key | `hourly` |
| `last_successful_sync_at` | TIMESTAMPTZ | No |  | `2026-07-02T10:00:00Z` |
| `next_scheduled_sync_at` | TIMESTAMPTZ | No |  | `2026-07-02T11:00:00Z` |
| `settings` | JSONB | Yes | Eye-specific settings | `{"ignore_bots":true}` |
| `created_at` | TIMESTAMPTZ | Yes |  |  |
| `updated_at` | TIMESTAMPTZ | Yes |  |  |

**Important application validation:** selected provider must have a matching enabled `eye_providers` row, and that row must be `is_available_in_v1 = true` in V1.

## `integrations`

**Purpose:** The OAuth connection for one organization Eye.

**PK:** `id`  
**Foreign keys:** `organization_eye_id → organization_eyes.id`; `provider_id → providers.id`; `connected_by_user_id → users.id`  
**Unique rule:** `organization_eye_id` (one connection per Eye in V1)

| Column | Type | Required | Meaning | Example |
|---|---|---:|---|---|
| `id` | UUID | Yes | PK | `int-slack-01` |
| `organization_eye_id` | UUID | Yes | UNIQUE FK | `oe-chat-01` |
| `provider_id` | UUID | Yes | FK | Slack UUID |
| `status` | `integration_status` | Yes | OAuth state | `connected` |
| `external_account_id` | VARCHAR(255) | No | Workspace/account ID | `T12345` |
| `external_account_name` | VARCHAR(255) | No | Workspace name | `Acme Workspace` |
| `access_token_encrypted` | TEXT | Yes | encrypted, never raw | `encrypted-value` |
| `refresh_token_encrypted` | TEXT | No | encrypted | `encrypted-value` |
| `token_expires_at` | TIMESTAMPTZ | No |  | `2026-07-03T10:00:00Z` |
| `scopes` | JSONB | Yes | granted OAuth scopes | `["channels:read"]` |
| `connected_by_user_id` | UUID | No | FK | owner UUID |
| `connected_at` | TIMESTAMPTZ | Yes |  |  |
| `last_sync_at` | TIMESTAMPTZ | No |  |  |
| `last_error_message` | TEXT | No |  | `Token expired` |
| `created_at` | TIMESTAMPTZ | Yes |  |  |
| `updated_at` | TIMESTAMPTZ | Yes |  |  |

## `integration_resources`

**Purpose:** Provider resources discovered after OAuth; admin selects what to monitor.

**PK:** `id`  
**Foreign key:** `integration_id → integrations.id`  
**Unique rule:** `(integration_id, external_resource_id)`

| Column | Type | Required | Example |
|---|---|---:|---|
| `id` | UUID | Yes | `res-01` |
| `integration_id` | UUID | Yes | `int-slack-01` |
| `external_resource_id` | VARCHAR(255) | Yes | `C123456` |
| `resource_type` | VARCHAR(50) | Yes | `channel` |
| `name` | VARCHAR(255) | Yes | `engineering` |
| `metadata` | JSONB | Yes | `{"is_private":false}` |
| `is_selected` | BOOLEAN | Yes | `true` |
| `is_active` | BOOLEAN | Yes | `true` |
| `last_synced_at` | TIMESTAMPTZ | No |  |
| `created_at` | TIMESTAMPTZ | Yes |  |
| `updated_at` | TIMESTAMPTZ | Yes |  |

Examples: Slack channel, GitHub repository, Jira project, Zoom source.

---

# 7. Knowledge, onboarding, and sync

## `organization_knowledge_files`

**Purpose:** Uploaded company documents for initial knowledge processing.

**PK:** `id`  
**Foreign keys:** `organization_id → organizations.id`; `uploaded_by_user_id → users.id`  
**Unique rule:** `storage_key`

| Column | Type | Required | Example |
|---|---|---:|---|
| `id` | UUID | Yes | `file-01` |
| `organization_id` | UUID | Yes | `b22f...` |
| `uploaded_by_user_id` | UUID | No | `a12f...` |
| `original_file_name` | VARCHAR(255) | Yes | `Architecture.md` |
| `storage_key` | TEXT | Yes | `organizations/b22f/knowledge/file-01.md` |
| `mime_type` | VARCHAR(100) | Yes | `text/markdown` |
| `file_size_bytes` | BIGINT | Yes | `48201` |
| `status` | `knowledge_file_status` | Yes | `processed` |
| `processing_error` | TEXT | No | null |
| `uploaded_at` | TIMESTAMPTZ | Yes |  |
| `processed_at` | TIMESTAMPTZ | No |  |
| `created_at` | TIMESTAMPTZ | Yes |  |
| `updated_at` | TIMESTAMPTZ | Yes |  |

## `onboarding_progress`

**Purpose:** Allows onboarding to resume after the user leaves.

**PK:** `id`  
**Foreign key:** `organization_id → organizations.id`  
**Unique rule:** `organization_id`

| Column | Type | Required | Example |
|---|---|---:|---|
| `id` | UUID | Yes | `onboard-01` |
| `organization_id` | UUID | Yes | `b22f...` |
| `current_step` | VARCHAR(100) | Yes | `connect_eyes` |
| `completed_steps` | JSONB | Yes | `{"payment":true,"providers_selected":true}` |
| `is_completed` | BOOLEAN | Yes | `false` |
| `started_at` | TIMESTAMPTZ | Yes |  |
| `completed_at` | TIMESTAMPTZ | No |  |
| `updated_at` | TIMESTAMPTZ | Yes |  |

## `eye_sync_jobs`

**Purpose:** Queue/history for initial imports and later synchronization.

**PK:** `id`  
**Foreign keys:** `organization_eye_id → organization_eyes.id`; `integration_id → integrations.id`

| Column | Type | Required | Example |
|---|---|---:|---|
| `id` | UUID | Yes | `job-01` |
| `organization_eye_id` | UUID | Yes | `oe-chat-01` |
| `integration_id` | UUID | No | `int-slack-01` |
| `trigger_type` | `sync_trigger_type` | Yes | `initial` |
| `status` | `sync_job_status` | Yes | `running` |
| `started_at` | TIMESTAMPTZ | No |  |
| `finished_at` | TIMESTAMPTZ | No |  |
| `progress_percentage` | SMALLINT | Yes | `65` |
| `summary` | JSONB | Yes | `{"messages_imported":1200}` |
| `error_message` | TEXT | No | null |
| `created_at` | TIMESTAMPTZ | Yes |  |

---

# 8. Required creation sequence

After verified payment webhook, run one database transaction:

```text
1. Create organization
2. Create organization_members row: payer = owner
3. Create subscription
4. Create first payment
5. Create onboarding_progress
6. Create four organization_eyes rows:
   Chat, Meeting, Task, Coding
```

When provider selection happens, update each `organization_eyes.selected_provider_id`. Only providers allowed through `eye_providers.is_available_in_v1 = true` may be selected.

When OAuth succeeds, create `integrations`, import `integration_resources`, and create an initial `eye_sync_jobs` record.
