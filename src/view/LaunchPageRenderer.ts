import type { LaunchPageViewModel } from "./LaunchPageViewModel";

export class LaunchPageRenderer {
  render(viewModel: LaunchPageViewModel): string {
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(viewModel.courseTitle)}</title>
    <style>
      html, body { margin: 0; padding: 0; height: 100%; font-family: "Source Sans 3", sans-serif; background: #f6f8fa; }
      header { padding: 8px 12px; border-bottom: 1px solid #d0d7de; background: #ffffff; display: flex; justify-content: space-between; align-items: center; }
      .meta { font-size: 13px; color: #57606a; }
      .status-banner { display: none; padding: 10px 12px; border-bottom: 1px solid #d0d7de; background: #dafbe1; color: #1a7f37; font-size: 14px; }
      .status-banner.visible { display: block; }
      iframe { width: 100%; height: calc(100% - 42px); border: 0; background: white; }
    </style>
  </head>
  <body>
    <header>
      <div><strong>${escapeHtml(viewModel.courseTitle)}</strong></div>
      <div class="meta">Learner: ${escapeHtml(viewModel.userName)}</div>
    </header>
    <div id="launch-status" class="status-banner" role="status" aria-live="polite"></div>
    <iframe id="sco-frame" src="${encodeURI(viewModel.iframeSrc)}"></iframe>
    <script src="/libs/scorm-api-1.2/index.js"></script>
    <script src="/libs/scorm-api-2004/index.js"></script>
    <script>
      const launch = ${viewModel.initialPayloadJson};
      const state = { sequence: 0, payload: {}, terminating: false, terminated: false, commitTimer: null };

      function buildCommit() {
        return {
          sequence: ++state.sequence,
          clientTime: new Date().toISOString(),
          apiKind: launch.apiKind,
          payload: { ...state.payload }
        };
      }

      async function sendCommit(force = false) {
        if (!force && (state.terminating || state.terminated)) {
          return;
        }
        if (!force && Object.keys(state.payload).length === 0) {
          return;
        }
        try {
          const body = JSON.stringify(buildCommit());
          await fetch('/internal/launch/' + launch.launchId + '/commit?token=' + encodeURIComponent(launch.token), {
            method: "POST",
            headers: { "content-type": "application/json" },
            body
          });
        } catch (err) {
          console.warn("commit failed", err);
        }
      }

      function finalizeUiAfterTerminate() {
        const frame = document.getElementById("sco-frame");
        if (frame) {
          frame.setAttribute("src", "about:blank");
          frame.style.display = "none";
        }

        const statusBanner = document.getElementById("launch-status");
        if (statusBanner) {
          statusBanner.textContent = "Course session terminated. You can return to the LMS.";
          statusBanner.classList.add("visible");
        }

        try {
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({
              type: "SCORM_PLAYER_TERMINATED",
              launchId: launch.launchId,
              attemptId: launch.attemptId
            }, "*");
          }
        } catch (err) {
          console.warn("postMessage to parent failed", err);
        }
      }

      async function terminate() {
        if (state.terminating || state.terminated) {
          return;
        }
        state.terminating = true;
        await sendCommit(true);
        try {
          await fetch('/internal/launch/' + launch.launchId + '/terminate?token=' + encodeURIComponent(launch.token), {
            method: "POST"
          });
        } catch (err) {
          console.warn("terminate failed", err);
        } finally {
          state.terminating = false;
          state.terminated = true;
          if (state.commitTimer !== null) {
            clearInterval(state.commitTimer);
            state.commitTimer = null;
          }
          finalizeUiAfterTerminate();
        }
      }

      function onSetValue(key, value) {
        state.payload[key] = value;
      }

      if (launch.apiKind === "SCORM_12") {
        window.API = window.createScorm12Api({
          onSetValue,
          onCommit: () => sendCommit(true),
          onTerminate: () => terminate()
        });
      } else {
        window.API_1484_11 = window.createScorm2004Api({
          onSetValue,
          onCommit: () => sendCommit(true),
          onTerminate: () => terminate()
        });
      }

      state.commitTimer = setInterval(() => { void sendCommit(false); }, launch.commitIntervalMs);
      window.addEventListener("beforeunload", () => {
        if (state.terminated) {
          return;
        }
        const payload = JSON.stringify(buildCommit());
        navigator.sendBeacon('/internal/launch/' + launch.launchId + '/commit?token=' + encodeURIComponent(launch.token), payload);
      });
    </script>
  </body>
</html>`;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
