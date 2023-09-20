# Getting started

Recommended to use [bati](https://batijs.github.io)

```bash
pnpm install @auth/core vike-authjs
```

## Setting It Up

[Generate auth secret](https://generate-secret.vercel.app/32), then set it as an environment variable:

```
AUTH_SECRET=your_auth_secret
```

### On Production

Don't forget to trust the host.

```
AUTH_TRUST_HOST=true
```
