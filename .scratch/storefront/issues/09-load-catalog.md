# 09: Load the canonical catalog into Payload

**What to build:** Import the canonical catalog (ticket 06) — products, categories, and weight tiers, with images — into Payload so it is the live source of truth. Use Payload's import/seed mechanism or the admin API.

**Blocked by:** 06 (canonical catalog), 08 (Payload collections).

**Status:** ready-for-agent

- [ ] All categories are created in Payload.
- [ ] All products are created, linked to their categories and (for bulk) weight tiers, with images uploaded.
- [ ] A verification read-back confirms product count/categories match the canonical catalog exactly.
