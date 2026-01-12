# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated testing with Playwright.

## Workflows

### 1. `playwright.yml` - Main Test Workflow
**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches  
- Daily at 2 AM UTC (scheduled)
- Manual trigger from GitHub UI

**Features:**
- Runs tests across all configured browsers (Chromium, Firefox, WebKit, Mobile Chrome)
- Parallel execution with matrix strategy
- Uploads test results and reports as artifacts
- Merges reports from all browsers
- Deploys HTML report to GitHub Pages (on main branch)

### 2. `playwright-manual.yml` - Manual Test Execution
**Triggers:**
- Manual trigger only (workflow_dispatch)

**Features:**
- Choose specific test file or run all tests
- Select browser(s) to test on
- Option to run in headed mode
- Flexible input parameters for targeted testing

**Usage:**
1. Go to Actions tab in GitHub
2. Select "Manual Playwright Tests"
3. Click "Run workflow"
4. Configure your options and run

### 3. `playwright-pr-comment.yml` - PR Test Results
**Triggers:**
- When main Playwright workflow completes on PR

**Features:**
- Posts test results summary as PR comment
- Shows pass/fail counts in a table
- Links to full test report
- Visual status indicators (✅/❌)

## Setup Requirements

### Repository Settings
1. **GitHub Pages**: Enable GitHub Pages in repository settings to view HTML reports
2. **Actions Permissions**: Ensure Actions have write permissions for artifacts and Pages

### Optional: Secrets
No secrets are required for basic functionality, but you can add:
- Custom tokens for enhanced permissions
- Notification webhooks
- External service integrations

## Viewing Results

### Test Reports
- **Artifacts**: Download from workflow run page
- **GitHub Pages**: Automatic deployment of HTML reports (main branch only)
- **PR Comments**: Summary posted automatically on pull requests

### Debugging Failed Tests
1. Check workflow logs for detailed error messages
2. Download test artifacts for screenshots/videos
3. Use manual workflow to run specific failing tests
4. Enable headed mode for visual debugging

## Customization

### Adding New Browsers
Edit the matrix strategy in `playwright.yml`:
```yaml
matrix:
  project: [chromium, firefox, webkit, 'Mobile Chrome', 'your-new-browser']
```

### Changing Triggers
Modify the `on:` section in any workflow file to adjust when tests run.

### Test Timeouts
Adjust `timeout-minutes` value if your tests need more time to complete.