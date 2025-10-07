#!/bin/bash
# Setup Hasura permissions for production

HASURA_URL="${HASURA_URL:-http://localhost:8080}"
HASURA_SECRET="${HASURA_ADMIN_SECRET:-dev-admin-secret}"

echo "Setting up Hasura permissions..."

# Function to call Hasura metadata API
call_metadata_api() {
  curl -X POST "${HASURA_URL}/v1/metadata" \
    -H "Content-Type: application/json" \
    -H "x-hasura-admin-secret: ${HASURA_SECRET}" \
    -d "$1"
}

# 1. Create user role permissions for goals table
echo "Setting up goals table permissions..."
call_metadata_api '{
  "type": "pg_create_select_permission",
  "args": {
    "table": "goals",
    "role": "user",
    "permission": {
      "columns": ["id", "title", "created", "finished"],
      "filter": {
        "user_goals": {
          "user": {
            "sub": {
              "_eq": "X-Hasura-User-Sub"
            }
          }
        }
      }
    }
  }
}'

call_metadata_api '{
  "type": "pg_create_insert_permission",
  "args": {
    "table": "goals",
    "role": "user",
    "permission": {
      "check": {},
      "columns": ["title", "finished"]
    }
  }
}'

call_metadata_api '{
  "type": "pg_create_update_permission",
  "args": {
    "table": "goals",
    "role": "user",
    "permission": {
      "columns": ["title", "finished"],
      "filter": {
        "user_goals": {
          "user": {
            "sub": {
              "_eq": "X-Hasura-User-Sub"
            }
          }
        }
      }
    }
  }
}'

call_metadata_api '{
  "type": "pg_create_delete_permission",
  "args": {
    "table": "goals",
    "role": "user",
    "permission": {
      "filter": {
        "user_goals": {
          "user": {
            "sub": {
              "_eq": "X-Hasura-User-Sub"
            }
          }
        }
      }
    }
  }
}'

# 2. Create user role permissions for user_goals table
echo "Setting up user_goals table permissions..."
call_metadata_api '{
  "type": "pg_create_select_permission",
  "args": {
    "table": "user_goals",
    "role": "user",
    "permission": {
      "columns": ["user_id", "goal_id"],
      "filter": {
        "user": {
          "sub": {
            "_eq": "X-Hasura-User-Sub"
          }
        }
      }
    }
  }
}'

call_metadata_api '{
  "type": "pg_create_insert_permission",
  "args": {
    "table": "user_goals",
    "role": "user",
    "permission": {
      "check": {
        "user": {
          "sub": {
            "_eq": "X-Hasura-User-Sub"
          }
        }
      },
      "columns": ["goal_id"]
    }
  }
}'

# 3. Create user role permissions for goal_relations table
echo "Setting up goal_relations table permissions..."
call_metadata_api '{
  "type": "pg_create_select_permission",
  "args": {
    "table": "goal_relations",
    "role": "user",
    "permission": {
      "columns": ["parent_id", "child_id"],
      "filter": {
        "goalByParentId": {
          "user_goals": {
            "user": {
              "sub": {
                "_eq": "X-Hasura-User-Sub"
              }
            }
          }
        }
      }
    }
  }
}'

call_metadata_api '{
  "type": "pg_create_insert_permission",
  "args": {
    "table": "goal_relations",
    "role": "user",
    "permission": {
      "check": {
        "goalByParentId": {
          "user_goals": {
            "user": {
              "sub": {
                "_eq": "X-Hasura-User-Sub"
              }
            }
          }
        }
      },
      "columns": ["parent_id", "child_id"]
    }
  }
}'

call_metadata_api '{
  "type": "pg_create_delete_permission",
  "args": {
    "table": "goal_relations",
    "role": "user",
    "permission": {
      "filter": {
        "goalByParentId": {
          "user_goals": {
            "user": {
              "sub": {
                "_eq": "X-Hasura-User-Sub"
              }
            }
          }
        }
      }
    }
  }
}'

# 4. Setup user table permissions (read only own user)
echo "Setting up users table permissions..."
call_metadata_api '{
  "type": "pg_create_select_permission",
  "args": {
    "table": "users",
    "role": "user",
    "permission": {
      "columns": ["id", "sub", "email", "first_name", "last_name", "created"],
      "filter": {
        "sub": {
          "_eq": "X-Hasura-User-Sub"
        }
      }
    }
  }
}'

echo "✅ Hasura permissions setup complete!"
