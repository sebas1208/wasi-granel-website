# 05: Pull products from Dolibarr before it is sunset

**What to build:** Connect to the Dolibarr instance and export its product list (and any category structure) so nothing is lost when it's retired. Requires the Dolibarr URL and an API key / credentials from the owner; the export is normalized into the same contract shape (ticket 03) as the docx output.

**Blocked by:** None (can start immediately) — but needs Dolibarr credentials from the owner.

**Status:** ready-for-agent

- [ ] Dolibarr products are exported (API or DB dump) with name, category, price, and any variant/weight fields.
- [ ] The export is normalized into the shared contract shape.
- [ ] A note records the Dolibarr endpoint/version used and any products or fields that failed to map.
