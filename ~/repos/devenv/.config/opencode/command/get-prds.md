# Get PRDs Command

Fetches all open GitHub issues and allows selection of which one to work with.

## Usage

```
/get-prds
```

Aliases: `get-prds`, `prds`, `list-prds`

## Description

This command retrieves all open GitHub issues from the current repository and presents them in an interactive numbered list. The user can then select an issue to work with by entering its number.

## Examples

```
/get-prds
get-prds
prds
```

## Implementation

```bash
#!/bin/bash
# Get PRDs command - List and select GitHub issues using GitHub API

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

echo "🔍 Fetching open GitHub issues..."
echo

# Get all open issues with details using GitHub API
ISSUES_JSON=$(curl -s -H "$AUTH_HEADER" -H "$ACCEPT_HEADER" \
  "$API_BASE/issues?state=open&sort=created&direction=desc&per_page=20")

if ! echo "$ISSUES_JSON" | jq -e '.[0]' >/dev/null 2>&1; then
  echo "❌ No open issues found or API error"
  exit 0
fi

# Parse and display issues
echo "📋 Open Issues:"
echo "──────────────"
COUNT=1
declare -a ISSUE_NUMBERS

echo "$ISSUES_JSON" | jq -c '.[]' | while read -r issue; do
  ISSUE_NUM=$(echo "$issue" | jq -r '.number')
  ISSUE_TITLE=$(echo "$issue" | jq -r '.title')
  ISSUE_LABELS=$(echo "$issue" | jq -r '.labels | map(.name) | join(", ")')
  ISSUE_AUTHOR=$(echo "$issue" | jq -r '.user.login')
  ISSUE_CREATED=$(echo "$issue" | jq -r '.created_at' | cut -d'T' -f1)

  echo "$COUNT) #$ISSUE_NUM - $ISSUE_TITLE"
  echo "   Labels: ${ISSUE_LABELS:-none}"
  echo "   Created: $ISSUE_CREATED by $ISSUE_AUTHOR"
  echo

  ISSUE_NUMBERS[$COUNT]=$ISSUE_NUM
  ((COUNT++))
done

if [ $COUNT -eq 1 ]; then
  echo "❌ No issues to display"
  exit 0
fi

# Get user selection
echo "Enter the number of the issue you want to work with (1-$((COUNT-1))), or 'q' to quit:"
read -r SELECTION

if [[ "$SELECTION" =~ ^[Qq]$ ]]; then
  echo "👋 Exiting..."
  exit 0
fi

if ! [[ "$SELECTION" =~ ^[0-9]+$ ]] || [ "$SELECTION" -lt 1 ] || [ "$SELECTION" -ge "$COUNT" ]; then
  echo "❌ Invalid selection. Please enter a number between 1 and $((COUNT-1))"
  exit 1
fi

SELECTED_ISSUE=${ISSUE_NUMBERS[$SELECTION]}
echo "✅ Selected issue #$SELECTED_ISSUE"
echo

# Show issue details using GitHub API
echo "📖 Issue Details:"
echo "────────────────"

ISSUE_DETAILS=$(curl -s -H "$AUTH_HEADER" -H "$ACCEPT_HEADER" \
  "$API_BASE/issues/$SELECTED_ISSUE")

if echo "$ISSUE_DETAILS" | jq -e '.number' >/dev/null 2>&1; then
  echo "$ISSUE_DETAILS" | jq -r '
    "Title: \(.title)",
    "Labels: \(.labels | map(.name) | join(", "))",
    "",
    "Description:",
    (.body // "No description provided"),
    "",
    "Comments: \(.comments)",
    "State: \(.state)",
    "Created: \(.created_at)",
    "Updated: \(.updated_at)"
  '
else
  echo "❌ Could not fetch issue details"
fi

echo
echo "💡 You can now work with issue #$SELECTED_ISSUE"
echo "   Use 'done $SELECTED_ISSUE' to mark it as completed"
```

## Features

- Lists all open GitHub issues with numbers, titles, labels, and creation info
- Interactive selection by number
- Displays detailed information about the selected issue
- Shows comment count and full description
- Provides next steps (like using the `done` command)

## Related Commands

- `/done` - Mark an issue as completed
- `/analyze-product` - Analyze product requirements
- Other PRD-related commands

## Notes

- Uses GitHub REST API directly (no gh CLI dependency)
- Requires GitHub token (GITHUB_TOKEN env var or gh auth token)
- Limits to 20 most recent issues for performance
- Shows issue details including body and comments
- Provides guidance on next actions