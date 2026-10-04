# 17: Harden VPS SSH access (rotate root password / key-only)

**What to build:** The root password was shared in plaintext chat, and key-based SSH is now working (`ssh wasi-vps`). Rotate the password and lock SSH down to key-only so the leaked credential can't be used.

**Blocked by:** None.

**Status:** ready-for-agent

- [ ] Rotate the root password to a new strong value (`passwd` as root on the VPS, or generate via `openssl rand -base64 24`).
- [ ] Update `/Users/savalos/Code/Wasi Granel/.env.vps` with the new password.
- [ ] Disable password auth: set `PasswordAuthentication no` (and `PermitRootLogin prohibit-password`) in `/etc/ssh/sshd_config`, then `systemctl reload sshd` — only after confirming key auth works.
- [ ] Verify: `ssh wasi-vps` still connects via key; password login is rejected.