# Advanced capabilities and service extraction

Optional providers are disabled by default. They must have a typed contract, bounded timeout, malformed-response validation, unavailable-provider mapping, and an explicit core-workflow isolation test.

## FastAPI extraction criteria

Introduce a separate FastAPI service only when a measured workload requires Python-native AI/data libraries, independent scaling/resource limits, or long-running execution. The decision must document the benefit, owner, cost, failure isolation, and removal path before adding a second runtime.

The current provider adapter remains inside Nitro. It can be removed by deleting its contract, adapter, tests, and configuration without changing task, library, reference, or SQLite compatibility behavior.
