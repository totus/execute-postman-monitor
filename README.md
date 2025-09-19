# Execute Postman Monitor

Execute a Postman Monitor synchronously and surface the results in your workflow.

- Triggers a synchronous run via Postman API POST /monitors/{id}/run (no async=true).
- If the response is HTTP 202 (exceeded 300s) or lacks stats, it performs a single GET /monitors/{id} and uses lastRun details.
- Writes a workflow summary including the monitor name and execution statistics (assertions, requests, errors, timings, etc.).
- Exposes an output status and fails the step automatically when the monitor did not succeed.

Status badges:
- CI: ![CI](https://github.com/totus/execute-postman-monitor/actions/workflows/ci.yml/badge.svg)
- Release: ![Release](https://github.com/totus/execute-postman-monitor/actions/workflows/release.yml/badge.svg)

## Usage

Minimal example:

```yaml
name: API health check

on:
  workflow_dispatch:

jobs:
  run_monitor:
    runs-on: ubuntu-latest
    steps:
      - name: Execute Postman Monitor
        id: monitor
        uses: totus/execute-postman-monitor@v1
        with:
          postman-api-key: ${{ secrets.POSTMAN_API_KEY }}
          monitor-id: 12345678-abcd-ef01-2345-6789abcdef01

      - name: Use monitor result
        if: always()
        run: |
          echo "Monitor status: ${{ steps.monitor.outputs.status }}"
```

Notes:
- The step fails automatically when the monitor status is not `success`.
- A single retry is performed on Postman API rate limiting (HTTP 429).
- A detailed summary is written to the workflow summary tab after execution.

### Inputs

| Name | Description | Required | Default |
|------|-------------|----------|---------|
| `postman-api-key` | Postman API Key used to authenticate against the Postman API. | True | — |
| `monitor-id` | ID of the Postman Monitor to run. | True | — |
| `postman-host` | Override Postman API host (for testing or self-hosted gateways). | False | `https://api.getpostman.com` |

### Outputs

| Name | Description |
|------|-------------|
| `status` | Postman monitor run status (success, failed, error, etc.). |

### Advanced: custom Postman host (for testing)

The action accepts an optional `postman-host` input. This is primarily intended for tests: in CI we spin up a tiny mock server and point the action at it.

```yaml
- uses: totus/execute-postman-monitor@v1
  with:
    postman-api-key: dummy
    monitor-id: test-monitor
    postman-host: http://127.0.0.1:4010
```

## Versioning and Releases

- This repository uses semantic versioning with tags like `v1.2.3`.
- Consumers are encouraged to pin to the major version (`@v1`).
- A release workflow automatically creates GitHub Releases when a `vX.Y.Z` tag is pushed and moves the major tag (`vX`) to the latest release.

To publish a new version:
1. Merge your changes to the default branch.
2. Create and push a semver tag, for example:
   ```sh
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin refs/tags/v1.0.0
   ```
   The `Release` workflow will generate release notes and move the `v1` tag to this commit.

## Development

- The CI workflow runs:
  - actionlint to validate GitHub workflow syntax
  - an end-to-end test that executes this action against a local mock Postman API
- Local structure:
  - `action.yml` — composite action definition
  - `test/mock-postman.js` — simple HTTP server used in CI tests

## Inspiration and docs

- Creating and publishing actions: GitHub Docs
- Versioning guidance: Use major tags (e.g., `@v1`) for stable consumption

## License

MIT
