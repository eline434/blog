# Bachelor's thesis log

Public process log for the bachelor's thesis, built with [Payload CMS](https://payloadcms.com) and Next.js.

- **Site:** everyone can read it, no account needed
- **Admin:** `/admin`, this is where the team writes

## Where does what go?

| Assignment | In the admin | On the site |
| --- | --- | --- |
| Research per pillar (text and visuals) | Log entries, type _Research_ | Log, filter on topic |
| Process of the result | Log entries, type _Process_ | Log |
| Feedback from client and experts | Log entries, type _Feedback report_ | Feedback |
| Guidance from AI | Log entries, type _AI use_ | AI use |
| Time tracking per day | Hours | Hours |
| Detailed planning | Planning | Planning |
| Team roles | Team | Team |

Add topics under **Settings → Topics**. They appear in every filter automatically. The project name, intro, client and coach are under **Settings → Project info**.

## Run it locally

You need Docker and Node `^22.23.4` or `>=24.22.1`.

```bash
cp .env.example .env      # then fill in PAYLOAD_SECRET: openssl rand -hex 32
npm install
npm run db:up             # starts Postgres in Docker
npm run db:migrate        # creates the tables and default topics
npm run dev               # http://localhost:3000
```

The local database is separate from the live site, so nothing you do here shows up online.

## Changing the content model

After changing a collection, create a migration and commit it. Vercel runs it on the next deploy.

```bash
npm run payload -- migrate:create describe-your-change
npm run db:migrate
npm run generate:types
```

## Deployment

Every push to `main` deploys to Vercel. The build runs the migrations first (`vercel-build` in `package.json`).

Environment variables on Vercel:

| Name | Where it comes from |
| --- | --- |
| `PAYLOAD_SECRET` | Set by hand, a long random string |
| `DATABASE_URL` | Neon integration |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store |
