# Tiltfile for Plan project

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
