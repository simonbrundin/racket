#!/bin/bash

# Hasura endpoint and admin secret
HASURA_ENDPOINT="https://plan-hasura.simonbrundin.com"
ADMIN_SECRET="anK1bCPvR-3E9onUtqv-vQ7LNaf-grTzXs-hJ4-cEu"

echo "Applying permissions to Hasura..."

# Create select permissions for goals table - user role
curl -X POST "$HASURA_ENDPOINT/v1/metadata" \
  -H "Content-Type: application/json" \
  -H "X-Hasura-Admin-Secret: $ADMIN_SECRET" \
  -d '{
    "type": "pg_create_select_permission",
    "args": {
      "table": "goals",
      "role": "user",
      "permission": {
        "columns": ["id", "title", "created", "finished"],
        "filter": {
          "user_goals": {
            "user_id": {
              "_eq": "X-Hasura-User-Id"
            }
          }
        },
        "allow_aggregations": true
      }
    }
  }'

echo -e "\nApplied user permissions for goals table"

# Create select permissions for goals table - admin role
curl -X POST "$HASURA_ENDPOINT/v1/metadata" \
  -H "Content-Type: application/json" \
  -H "X-Hasura-Admin-Secret: $ADMIN_SECRET" \
  -d '{
    "type": "pg_create_select_permission",
    "args": {
      "table": "goals",
      "role": "admin",
      "permission": {
        "columns": ["id", "title", "created", "finished"],
        "filter": {},
        "allow_aggregations": true
      }
    }
  }'

echo -e "\nApplied admin permissions for goals table"

# Create select permissions for user_goals table - user role
curl -X POST "$HASURA_ENDPOINT/v1/metadata" \
  -H "Content-Type: application/json" \
  -H "X-Hasura-Admin-Secret: $ADMIN_SECRET" \
  -d '{
    "type": "pg_create_select_permission",
    "args": {
      "table": "user_goals",
      "role": "user",
      "permission": {
        "columns": ["user_id", "goal_id"],
        "filter": {
          "user_id": {
            "_eq": "X-Hasura-User-Id"
          }
        },
        "allow_aggregations": true
      }
    }
  }'

echo -e "\nApplied user permissions for user_goals table"

# Create select permissions for user_goals table - admin role
curl -X POST "$HASURA_ENDPOINT/v1/metadata" \
  -H "Content-Type: application/json" \
  -H "X-Hasura-Admin-Secret: $ADMIN_SECRET" \
  -d '{
    "type": "pg_create_select_permission",
    "args": {
      "table": "user_goals",
      "role": "admin",
      "permission": {
        "columns": ["user_id", "goal_id"],
        "filter": {},
        "allow_aggregations": true
      }
    }
  }'

echo -e "\nApplied admin permissions for user_goals table"

# Create select permissions for goal_relations table - user role
curl -X POST "$HASURA_ENDPOINT/v1/metadata" \
  -H "Content-Type: application/json" \
  -H "X-Hasura-Admin-Secret: $ADMIN_SECRET" \
  -d '{
    "type": "pg_create_select_permission",
    "args": {
      "table": "goal_relations",
      "role": "user",
      "permission": {
        "columns": ["parent_id", "child_id"],
        "filter": {
          "_or": [
            {
              "parent": {
                "user_goals": {
                  "user_id": {
                    "_eq": "X-Hasura-User-Id"
                  }
                }
              }
            },
            {
              "child": {
                "user_goals": {
                  "user_id": {
                    "_eq": "X-Hasura-User-Id"
                  }
                }
              }
            }
          ]
        },
        "allow_aggregations": true
      }
    }
  }'

echo -e "\nApplied user permissions for goal_relations table"

# Create select permissions for goal_relations table - admin role
curl -X POST "$HASURA_ENDPOINT/v1/metadata" \
  -H "Content-Type: application/json" \
  -H "X-Hasura-Admin-Secret: $ADMIN_SECRET" \
  -d '{
    "type": "pg_create_select_permission",
    "args": {
      "table": "goal_relations",
      "role": "admin",
      "permission": {
        "columns": ["parent_id", "child_id"],
        "filter": {},
        "allow_aggregations": true
      }
    }
  }'

echo -e "\nApplied admin permissions for goal_relations table"
echo -e "\nAll permissions applied successfully!"