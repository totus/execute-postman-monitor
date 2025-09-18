### execute-postman-monitor
Execute a Postman Monitor synchronously and surface the results in your workflow.

- Triggers a synchronous run via Postman API POST /monitors/{id}/run (no async=true).
- If the response is HTTP 202 (exceeded 300s) or lacks stats, it performs a single GET /monitors/{id} and uses lastRun details.
- Writes a workflow summary including the monitor name and execution statistics (assertions, requests, errors, timings, etc.).
- Exposes an output status and fails the step automatically when the monitor did not succeed.

Parameters:

| Name | Description | Required | Default |
|------|-------------|----------|---------|
| `postman-api-key` | Postman API Key used to authenticate against the Postman API. | True | None |
| `monitor-id` | ID of the Postman Monitor to run. | True | None |

Outputs:

| Name | Description |
|------|-------------|
| `status` | Postman monitor run status (success, failed, error, etc.). |

<details>
<summary>Example workflow file:</summary>

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
        uses: totus/execute-postman-monitor
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
</details>

#### License
MIT
