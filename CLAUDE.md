@AGENTS.md

# Git Workflow

This project uses **GitHub Flow**.

- `main` is always deployable
- Create a feature branch from `main`: `git checkout -b feature/xxx`
- Commit changes to the feature branch
- Open a PR to merge back into `main`
- Delete the branch after merge

Never commit directly to `main`.
