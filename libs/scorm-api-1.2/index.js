(function (global) {
  function createScorm12Api(bridge) {
    var state = {};
    var initialized = false;
    var terminated = false;
    var lastError = "0";

    function ok() {
      lastError = "0";
      return "true";
    }

    function fail(code) {
      lastError = code;
      return "false";
    }

    return {
      LMSInitialize: function () {
        if (initialized) {
          return ok();
        }
        initialized = true;
        return ok();
      },
      LMSFinish: function () {
        if (!initialized || terminated) {
          return fail("301");
        }
        terminated = true;
        if (bridge && typeof bridge.onTerminate === "function") {
          bridge.onTerminate({ ...state });
        }
        return ok();
      },
      LMSGetValue: function (key) {
        if (!initialized) {
          return "";
        }
        return state[key] !== undefined ? String(state[key]) : "";
      },
      LMSSetValue: function (key, value) {
        if (!initialized || terminated) {
          return fail("301");
        }
        state[key] = value;
        if (bridge && typeof bridge.onSetValue === "function") {
          bridge.onSetValue(String(key), value);
        }
        return ok();
      },
      LMSCommit: function () {
        if (!initialized || terminated) {
          return fail("301");
        }
        if (bridge && typeof bridge.onCommit === "function") {
          bridge.onCommit({ ...state });
        }
        return ok();
      },
      LMSGetLastError: function () {
        return lastError;
      },
      LMSGetErrorString: function () {
        return "No error";
      },
      LMSGetDiagnostic: function () {
        return "";
      }
    };
  }

  global.createScorm12Api = createScorm12Api;
})(window);
