# SOUQNA Staging

## Required environment
- DATABASE_URL: PostgreSQL connection string
- AUTH_SECRET: long random secret
- STORAGE_PROVIDER: local for a persistent server volume; object storage is required for serverless production

## First deployment
1. Provision PostgreSQL.
2. Set environment variables in the hosting platform.
3. Against the staging database, generate the first reviewed migration once with `npm run db:migrate -- --name initial` and commit it.
4. Subsequent staging/production releases run `npm run db:deploy`.
5. Run `npm run db:seed`.
6. Temporarily set BOOTSTRAP_OWNER_ENABLED=true and the protected owner name/phone/password.
7. Run `npm run owner:bootstrap` once.
8. Immediately disable/remove BOOTSTRAP_OWNER_* values.
9. Verify `/api/health` and `/api/ready`.

Never commit real credentials or owner bootstrap values.
