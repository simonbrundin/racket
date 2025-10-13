# PRD Done Command

Marks a GitHub issue as completed/done.

## Usage

```
/done [issue-number]
```

Aliases: `done`, `prd-done`

## Parameters

- `issue-number` (optional): The GitHub issue number to close. If not provided, closes the most recently created issue.

## Examples

```
/done
/done 1
done 42
prd-done
```

## Implementation

```bash
#!/bin/bash
# Close GitHub issue command using GitHub API

# GitHub API configuration
REPO="simonbrundin/plan"
API_BASE="https://api.github.com/repos/$REPO"

# Get GitHub token (prefer GITHUB_TOKEN env var, fallback to gh auth token)
if [ -n "$GITHUB_TOKEN" ]; then
  TOKEN="$GITHUB_TOKEN"
else
  TOKEN=$(gh auth token 2>/dev/null)
fi

if [ -z "$TOKEN" ]; then
  echo "❌ No GitHub authentication found. Please set GITHUB_TOKEN or run 'gh auth login'"
  exit 1
fi

# Headers for API calls
AUTH_HEADER="Authorization: token $TOKEN"
ACCEPT_HEADER="Accept: application/vnd.github.v3+json"

if [ $# -eq 0 ]; then
  # No issue number provided, find the most recent open issue
  echo "🔍 Finding most recent open issue..."

  RESPONSE=$(curl -s -H "$AUTH_HEADER" -H "$ACCEPT_HEADER" \
    "$API_BASE/issues?state=open&sort=created&direction=desc&per_page=1")

  if echo "$RESPONSE" | jq -e '.[0]' >/dev/null 2>&1; then
    ISSUE_NUM=$(echo "$RESPONSE" | jq -r '.[0].number')
    echo "🎯 Found most recent open issue #$ISSUE_NUM"
  else
    echo "❌ Could not find any open issues"
    exit 1
  fi
else
  ISSUE_NUM=$1
  echo "🎯 Closing issue #$ISSUE_NUM"
fi

# Close the issue using GitHub API
RESPONSE=$(curl -s -X PATCH -H "$AUTH_HEADER" -H "$ACCEPT_HEADER" \
  -H "Content-Type: application/json" \
  -d '{"state": "closed"}' \
  "$API_BASE/issues/$ISSUE_NUM")

# Check if the request was successful
if echo "$RESPONSE" | jq -e '.number' >/dev/null 2>&1; then
  echo "✅ Successfully closed issue #$ISSUE_NUM"
else
  ERROR_MSG=$(echo "$RESPONSE" | jq -r '.message // "Unknown error"')
  echo "❌ Failed to close issue #$ISSUE_NUM: $ERROR_MSG"
  exit 1
fi
```

## Related Commands

- `/analyze-product` - Analyze product requirements
- Other PRD-related commands

## Notes

- Uses GitHub REST API directly (no gh CLI dependency)
- Requires GitHub token (GITHUB_TOKEN env var or gh auth token)
- Only closes issues, does not delete them
- Use with caution on production repositories