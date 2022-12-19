## Notes

- hack: ci uses .env.example
- ignoring playwright configuration error: HTML reporter output folder clashes with the tests output folder

## Dev Setup

- .eslintrc.js: prettier
- package.json: prettier, eslintIgnore
- pnpm add -D prettier prettier-plugin-tailwindcss eslint-config-prettier
- .gitignore: tailwind
- pnpm add -D @types/node
- pnpm add -D tailwindcss
- pnpm exec tailwindcss init
- tailwind.congif.js
- root.tsx: import tailwindStylesheetUrl from "./styles/tailwind.css";
- pnpm add -D npm-run-all
- pnpm add -D @tailwindcss/forms
- tailwind.config.js plugins: require('@tailwindcss/forms')
- pnpm add -D @tailwindcss/typography
- tailwind.config.js plugins: require('@tailwindcss/typography')
- pnpm add @headlessui/react
- pnpm add @heroicons/react
- pnpm add zod
- pnpm add clsx
- pnpm add -D supabase
- pnpm supabase init
- pnpm add @supabase/supabase-js
- pnpm install @supabase/auth-helpers-remix
- pnpm add remeda
- pnpm add tiny-invariant

## Github

- secrets: SUPABASE_ACCESS_TOKEN, PROD_SUPABASE_PROJECT_ID, PROD_SUPABASE_DB_PASSWORD, STAGING_SUPABASE_PROJECT_ID, STAGING_SUPABASE_DB_PASSWORD
- [Supabase CLI github action](https://github.com/marketplace/actions/supabase-cli-action)
- [Supabase action example repo](https://github.com/supabase/supabase-action-example)

## Vercel

- https://access-remix.vercel.app/
- https://access-remix-staging.vercel.app/
- env vars: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- integrations: none

## Supabase

- Authentication | Email Template
- Authentication | URL Configuration
- [Supabase managing envs](https://supabase.com/docs/guides/cli/managing-environments)

## Supabase CLI

[Install via NPM](https://github.com/supabase/cli),
[Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)

- pnpm add -D supabase
- pnpm supabase -h
- pnpm supabase login
- pnpm supabase init
- pnpm supabase start | stop | status
- pnpm supabase db diff --use-migra --file [file_name]
- pnpm supabase db reset --debug
- pnpm supabase gen types typescript --local > db_types.ts
- pnpm supabase db branch create | delete | list | switch
- pnpm supabase link -p [db password] --project-ref [string]
- pnpm supabase db push -p [db password]
- pnpm supabase migration list
- pnpm supabase migration new <migration name>
- pnpm supabase db lint -s public
- psql: \i supabase/seed.sql
- studio url: http://localhost:54323
- inbucket url: http://localhost:54324
- psql postgresql://postgres:postgres@localhost:54322/postgres

## Reset Prod DB (hacky and risky)

- drop schema public cascade;
- create schema public;
- truncate supabase_migrations.schema_migrations;
- truncate auth.users cascade;
- truncate auth.schema_migrations;
- \i supabase/seed.sql

## pgTap

- [pgTap official docs](https://pgtap.org/)
- [Supabase db testing guide](https://supabase.com/docs/guides/database/testing)
- [pgTap supabase docs](https://supabase.com/docs/guides/database/extensions/pgtap)
- [usebasejump pgtap blog](https://usebasejump.com/blog/testing-on-supabase-with-pgtap)
- [Basejump repo](https://github.com/usebasejump/basejumpw)
- pnpm supabase test db

## Playwright

- pnpm dlx create-playwright
- sudo -E env PATH="$PATH" pnpm playwright install-deps
- [jest expect](https://jestjs.io/docs/expect)
- [remix playwright vitest example](https://github.com/jacob-ebey/remix-vitest)
- pnpm playwright test
- pnpm playwright show-report e2e-results/playwright-report

# Welcome to Remix!

- [Remix Docs](https://remix.run/docs)

## Deployment

After having run the `create-remix` command and selected "Vercel" as a deployment target, you only need to [import your Git repository](https://vercel.com/new) into Vercel, and it will be deployed.

If you'd like to avoid using a Git repository, you can also deploy the directory by running [Vercel CLI](https://vercel.com/cli):

```sh
npm i -g vercel
vercel
```

It is generally recommended to use a Git repository, because future commits will then automatically be deployed by Vercel, through its [Git Integration](https://vercel.com/docs/concepts/git).

## Development

To run your Remix app locally, make sure your project's local dependencies are installed:

```sh
npm install
```

Afterwards, start the Remix development server like so:

```sh
npm run dev
```

Open up [http://localhost:3000](http://localhost:3000) and you should be ready to go!

If you're used to using the `vercel dev` command provided by [Vercel CLI](https://vercel.com/cli) instead, you can also use that, but it's not needed.
