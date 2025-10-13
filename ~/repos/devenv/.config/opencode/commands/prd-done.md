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
# Close GitHub issue command

if [ $# -eq 0 ]; then
  # No issue number provided, find the most recent open issue
  echo "Finding most recent open issue..."
  ISSUE_NUM=$(gh issue list --state open --limit 1 --json number | jq -r '.[0].number' 2>/dev/null)
  if [ -z "$ISSUE_NUM" ] || [ "$ISSUE_NUM" = "null" ]; then
    echo "❌ Could not find any open issues"
    exit 1
  fi
  echo "Closing most recent open issue #$ISSUE_NUM"
else
  ISSUE_NUM=$1
  echo "Closing issue #$ISSUE_NUM"
fi

# Close the issue
if gh issue close "$ISSUE_NUM" 2>/dev/null; then
  echo "✅ Successfully closed issue #$ISSUE_NUM"
else
  echo "❌ Failed to close issue #$ISSUE_NUM (may not exist or already closed)"
  exit 1
fi
```

## Related Commands

- `/analyze-product` - Analyze product requirements
- Other PRD-related commands

## Notes

- Requires `gh` CLI tool to be configured and authenticated
- Only closes issues, does not delete them
- Use with caution on production repositories