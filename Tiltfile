# Tiltfile for Plan project

# PostgreSQL development database with Docker
local_resource(
  'postgres',
  serve_cmd='docker run --rm -p 5432:5432 ' +
    '-e POSTGRES_USER=plan ' +
    '-e POSTGRES_PASSWORD=plan ' +
    '-e POSTGRES_DB=plan ' +
    '-v $(pwd)/deployment/overlays/prod/db/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql:ro ' +
    '-v $(pwd)/deployment/overlays/dev/db/seed-data.sql:/docker-entrypoint-initdb.d/02-seed.sql:ro ' +
    '-v plan-postgres-data:/var/lib/postgresql/data ' +
    '--name plan-dev-postgres ' +
    'postgres:16-alpine',
  readiness_probe=probe(
    period_secs=2,
    exec=exec_action(['docker', 'exec', 'plan-dev-postgres', 'pg_isready', '-U', 'plan'])
  ),
  labels=['database'],
)


# Frontend development server
local_resource(
  'bun dev',
  serve_cmd='cd frontend && bun run dev',
  serve_env={
    'PORT': '3000',
  },
  links=['http://localhost:3000'],
  labels=['frontend'],
)

# Frontend tests in watch mode
local_resource(
  'tests',
  serve_cmd='cd frontend && bun run test:watch',
  labels=['frontend'],
)
