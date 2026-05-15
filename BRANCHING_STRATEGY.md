# Branching Strategy

Once you have exported your project from AI Studio to your own Git repository (via GitHub or downloading a ZIP and initializing Git locally), we recommend following this branching strategy to manage your features and updates.

## Core Branches

1. **`main` (or `master`)**
   - This is the production-ready branch.
   - All code in this branch should be stable, tested, and deployable.
   - Direct commits to `main` should be restricted. All changes should come via Pull Requests (PRs).

2. **`develop`**
   - The integration branch for new features.
   - Represents the latest delivered development changes for the next release.
   - Developers merge their feature branches here for testing before they go to `main`.

## Supporting Branches

1. **Feature Branches (`feature/`)**
   - **Naming Convention:** `feature/<short-description>` (e.g., `feature/user-authentication`, `feature/payment-gateway`)
   - **Branch Off From:** `develop`
   - **Merge Back To:** `develop`
   - Use these branches to work on new features or additions in isolation. Once the feature is complete and tested, create a PR to merge it into `develop`.

2. **Bugfix Branches (`bugfix/`)**
   - **Naming Convention:** `bugfix/<issue-description>` (e.g., `bugfix/login-crash`)
   - **Branch Off From:** `develop`
   - **Merge Back To:** `develop`
   - Used to fix non-critical bugs found in the `develop` environment or pre-release testing.

3. **Hotfix Branches (`hotfix/`)**
   - **Naming Convention:** `hotfix/<short-description>` (e.g., `hotfix/production-api-fix`)
   - **Branch Off From:** `main`
   - **Merge Back To:** `main` AND `develop`
   - Used for critical bug fixes that need to be deployed to production immediately. 

4. **Release Branches (`release/`)**
   - **Naming Convention:** `release/v<semantic-version>` (e.g., `release/v1.2.0`)
   - **Branch Off From:** `develop`
   - **Merge Back To:** `main` AND `develop`
   - Used to prepare for a new production release. Allows for last-minute bug fixes and version number bumps without blocking ongoing development in `develop`.

## Workflow Summary
1. Pick up a task and create a `feature/` branch from `develop`.
2. Commit your changes iteratively.
3. Once the feature is complete, open a Pull Request against `develop`.
4. After code review and CI/CD checks, merge the feature into `develop`.
5. When preparing for release, branch `release/` from `develop`, stabilize it, and merge it into both `main` and `develop`.
