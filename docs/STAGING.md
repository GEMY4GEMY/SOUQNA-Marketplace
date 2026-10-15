# SOUQNA Staging

## Required environment
- DATABASE_URL: PostgreSQL connection string
- AUTH_SECRET: long random secret
- STORAGE_PROVIDER: local for a persistent server volume; object storage is required for serverless production

## First deployment
1. Provision PostgreSQL.
2. Set environment variables in the hosting platform.
3. Run `npm run db:deploy`.
4. Run `npm run db:seed`.
5. Temporarily set BOOTSTRAP_OWNER_ENABLED=true and the protected owner name/phone/password.
6. Run `npm run owner:bootstrap` once.
7. Immediately disable/remove BOOTSTRAP_OWNER_* values.
8. Verify `/api/health` and `/api/ready`.

Never commit real credentials or owner bootstrap values.
