# Contract: Atomic storage batch

## Endpoint

`POST /api/storage/batch`

## Request

```json
{
  "operations": [
    { "type": "set", "key": "bitacora:t:task-1", "value": {} },
    { "type": "delete", "key": "bitacora:r:old-record" }
  ]
}
```

Rules:

- 1–50 operations.
- `key` must match the closed batch allowlist: exact `bitacora:index`, `bitacora:projects` or the assistance-settings key exported by the shared contract; or prefixes `bitacora:t:` and `bitacora:r:` followed by `^[A-Za-z0-9][A-Za-z0-9._:@-]{0,199}$`.
- `set` requires JSON-serializable `value`.
- Duplicate keys are rejected to avoid order-dependent requests.
- Unknown operation fields/types are rejected.
- No other KV key is accepted even if the single-key legacy endpoint currently accepts it.
- Contract tests include minimum/maximum suffixes, every allowed punctuation mark, leading punctuation, spaces, slash, backslash, Unicode, control characters and historical fixture IDs.

## Success

Status `200`:

```json
{
  "ok": true,
  "applied": 2
}
```

All operations commit in one repository transaction.

## Failure

- `400`: malformed body, empty/oversized batch, duplicate or forbidden key.
- `500`: repository failure.

Failure response:

```json
{
  "ok": false,
  "error": "actionable non-sensitive message"
}
```

No operation is visible after any failure.

## Compatibility

Existing GET/PUT/DELETE storage endpoints remain unchanged. Clients use batch only for multi-key invariants.
