# Security Policy

Security fixes target the current default branch.

Report vulnerabilities through GitHub private vulnerability reporting when available, or contact the owner privately. Include impact, affected routes, safe reproduction steps, and no real secrets or user data.

Deployers must configure a unique long `ADMIN_API_TOKEN`, use HTTPS, review migrations, keep dependencies current, and rotate the token after suspected exposure. The single-owner bearer model is not designed for untrusted multi-tenant administration.
