# 07: Provision Payload CMS on the VPS

**What to build:** Stand up a headless Payload CMS on the VPS per ADR-0001 (Node + PostgreSQL + SSL), reachable at an admin URL the owner can log into. Provisioning method is the owner's choice: either they set it up via **Coolify** (already on the server) or share server credentials for manual provisioning. This is a human-in-the-loop step ('/wizard'-style); the agent's job is to script/reliably reproduce the setup.

**Blocked by:** None (can start immediately) — but blocked on the owner choosing Coolify vs. credentials.

**Status:** **Done — closed 2026-10-21.** Live at https://payload.wasigranel.com/admin (HTTP 200, SSL), Postgres `wasi-payload-db`, Coolify-managed. Credentials outside the repo (`~/.env.vps` + VPS `/opt/wasi-granel/apps/cms/.env`).

- [x] Payload is running and the admin UI answers at its URL.
- [x] PostgreSQL is configured and Payload persists to it.
- [x] SSL is configured for the API/admin host.
- [x] Access credentials are stored securely and documented for the owner (not committed).
