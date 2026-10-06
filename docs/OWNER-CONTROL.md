# SOUQNA Owner Control Model

## Highest authority
`SUPER_OWNER` is the platform ownership role.

Only SUPER_OWNER can:
- grant/revoke administrator-level access;
- manage ownership-sensitive system settings;
- change staff permissions and roles;
- access full commercial configuration;
- control locations/categories globally;
- review immutable-style audit history at application level.

Application rules must prevent ADMIN or lower roles from changing, suspending, deleting, or demoting the SUPER_OWNER.

## Staff roles
- ADMIN — marketplace operations, finance visibility, packages, moderation.
- MODERATOR — ads, users, reports.
- SUPPORT — support cases and limited user visibility.
- BUSINESS — dealer/business account.
- USER — standard marketplace account.

## Production owner bootstrap
Never hard-code owner passwords or credentials in Git.

The first production SUPER_OWNER must be created using a protected server-side bootstrap/migration process using deployment secrets. The bootstrap process should be disabled after first successful provisioning.

## Audit
Sensitive staff, moderation, finance, package, category, and configuration actions must create an AuditLog event.

## Deployment
- main: production-ready code only.
- develop: integration/staging.
- feature/*: isolated feature work.
- production secrets: deployment platform only.
