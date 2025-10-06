# Manual Hasura Permissions Setup

Since automated setup requires the admin secret, here are the manual steps to configure permissions in Hasura Console:

## Goals Table Permissions

1. Go to **Data** → **goals** → **Permissions**
2. Click **"user"** role
3. **Row Select Permission:**
   ```json
   {
     "user_goals": {
       "user_id": {
         "_eq": "X-Hasura-User-Id"
       }
     }
   }
   ```
4. **Column Select:** Check `id`, `title`, `created`, `finished`
5. Click **"admin"** role
6. **Row Select Permission:** Leave empty (allows all rows)
7. **Column Select:** Check all columns

## User_goals Table Permissions

1. Go to **Data** → **user_goals** → **Permissions**
2. **user role:**
   - **Row Select:** `{"user_id":{"_eq":"X-Hasura-User-Id"}}`
   - **Column Select:** `user_id`, `goal_id`
3. **admin role:**
   - **Row Select:** Empty
   - **Column Select:** All columns

## Goal_relations Table Permissions

1. Go to **Data** → **goal_relations** → **Permissions**
2. **user role:**
   - **Row Select:**
     ```json
     {
       "_or": [
         {
           "parent_id": {
             "_in": "select goal_id from user_goals where user_id = X-Hasura-User-Id"
           }
         },
         {
           "child_id": {
             "_in": "select goal_id from user_goals where user_id = X-Hasura-User-Id"
           }
         }
       ]
     }
     ```
   - **Column Select:** `parent_id`, `child_id`
3. **admin role:**
   - **Row Select:** Empty
   - **Column Select:** All columns

## Testing

After setup, test with:

**User query (with JWT token):**
```graphql
query GetMyGoals {
  user_goals {
    goal {
      id
      title
    }
  }
}
```

**Admin query (with admin secret):**
```graphql
query GetAllGoals {
  goals {
    id
    title
  }
}
```