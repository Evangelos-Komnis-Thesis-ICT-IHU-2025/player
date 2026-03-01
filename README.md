# player

## Scope
Node.js/TypeScript service that hosts launch UI and SCO content:
- fetches launch context from engine
- downloads/extracts package zip into local cache
- serves course entrypoint/content files
- injects SCORM API adapters (`window.API`, `window.API_1484_11`)
- forwards commit/terminate calls to engine runtime endpoints
- emits `SCORM_PLAYER_TERMINATED` message to parent window on session end

## Runtime
- Default HTTP port: `3000`

## Routes
- `GET /health`
- `GET /launch/:launchId?token=...`
- `GET /content/:launchId/*`
- `POST /internal/launch/:launchId/commit?token=...`
- `POST /internal/launch/:launchId/terminate?token=...`

## Architecture
```mermaid
graph LR
  Browser[Browser iframe] --> LaunchPage[Player Launch HTML]
  LaunchPage --> ScormApi[SCORM 1.2 / 2004 API bridge]
  ScormApi --> InternalRoutes[internal launch routes]
  InternalRoutes --> Engine[Engine API :8080]
  LaunchPage --> ContentRoutes[content routes]
  ContentRoutes --> Cache[Package Cache /data/packages]
  Cache --> MinIO[Zip source via presigned URL]
```

## Design Patterns
- `Command Handler`: render launch / commit / terminate write flows are delegated to dedicated handlers.
- `State`: launch session lifecycle (`ACTIVE -> TERMINATING -> TERMINATED`) is centralized in `LaunchSessionService`.
- `Builder`: launch page model composition is handled by `LaunchPageViewModelBuilder`.
- `Decorator`: `ObservedEngineClient` wraps engine calls with operation-level observability logs.

## Request Flow (Launch to Terminate)
```mermaid
sequenceDiagram
  participant B as Browser
  participant P as Player
  participant E as Engine

  B->>P: GET /launch/{launchId}?token=...
  P->>E: GET /api/v1/launches/{launchId}
  E-->>P: launch context + content source URL
  P-->>B: launch HTML + iframe /content/{launchId}/{entrypoint}

  loop commit interval or LMSCommit/Commit
    B->>P: POST /internal/launch/{launchId}/commit
    P->>E: POST /api/v1/runtime/launches/{launchId}/commit
    E-->>P: commit ack
  end

  B->>P: POST /internal/launch/{launchId}/terminate
  P->>E: POST /api/v1/launches/{launchId}/terminate
  P-->>B: hide iframe + postMessage(SCORM_PLAYER_TERMINATED)
```

## Parent Window Event
```js
window.addEventListener("message", (event) => {
  if (event.data?.type === "SCORM_PLAYER_TERMINATED") {
    // redirect or update LMS UI
  }
});
```

## Build
```bash
docker build -t scorm-player:local .
```

## Run with Full Stack
```bash
cd ../central-docker-infrastructure/infrastructure
docker compose up --build
```
