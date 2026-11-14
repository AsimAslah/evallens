# Security Policy

Security fixes target the current default branch.

Report vulnerabilities through GitHub private vulnerability reporting when available, or contact the owner privately. Include impact, affected routes, safe reproduction steps, and no real secrets or user data.

Deployers must configure a unique long `ADMIN_API_TOKEN`, use HTTPS, review migrations, keep dependencies current, and rotate the token after suspected exposure. The single-owner bearer model is not designed for untrusted multi-tenant administration.

Owner authorization uses a bearer token stored in browser session storage. This limits persistence but does not provide user identity, role separation, audit trails, or protection on a compromised browser. Rate limiting is per Worker isolate and is therefore best-effort rather than a global abuse-control guarantee.

Exports require owner authorization. CSV cells beginning with spreadsheet formula characters are prefixed before quoting to reduce formula-injection risk. User text is rendered through React rather than as raw HTML, SQL operations use bound parameters, and public queries require both publication and completed status.

External source links accept only HTTP or HTTPS. Screenshot evidence is restricted to PNG, JPEG, or WebP data URLs whose encoded MIME type matches the declared type, with per-file and request-body limits. The v1.0.0 package audit reported no known dependency vulnerabilities.
