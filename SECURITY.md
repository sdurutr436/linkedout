# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.x (main) | ✅ |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

To report a security issue, email the maintainers directly or open a [GitHub Security Advisory](https://github.com/sdurutr436/linkedout/security/advisories/new) (private disclosure).

Include:
- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested mitigations

We aim to acknowledge reports within **48 hours** and provide a fix or workaround within **7 days** for critical issues.

## Security Architecture

LinkedOut stores credentials (LinkedIn, Infojobs) **locally** in a SQLite database on your machine or Docker volume. They are never transmitted to third parties.

Key mitigations in place:
- JWT session tokens (`HS256`), `HttpOnly` cookies, 7-day expiry
- Security headers on every response: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `CSP`, `Referrer-Policy`
- Rate limiting: 60 requests/min per IP on all API routes
- Passwords hashed with `bcrypt` (cost factor 12)
- CORS restricted to the configured `NEXT_PUBLIC_APP_URL`
- Trivy container scanning on every push to `main`
- Dependabot for automated dependency updates

## Responsible Use

This tool automates job applications using your own credentials on platforms you have accounts with. Ensure your use complies with the Terms of Service of LinkedIn, Infojobs, and any other platform you target.
