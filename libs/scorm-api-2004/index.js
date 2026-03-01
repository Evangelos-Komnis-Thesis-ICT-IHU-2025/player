(function (global) {
  function createScorm2004Api(bridge) {
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
      Initialize: function () {
        initialized = true;
        return ok();
      },
      Terminate: function () {
        if (!initialized || terminated) {
          return fail("301");
        }
        terminated = true;
        if (bridge && typeof bridge.onTerminate === "function") {
          bridge.onTerminate({ ...state });
        }
        return ok();
      },
      GetValue: function (key) {
        if (!initialized) {
          return "";
        }
        return state[key] !== undefined ? String(state[key]) : "";
      },
      SetValue: function (key, value) {
        if (!initialized || terminated) {
          return fail("301");
        }
        state[key] = value;
        if (bridge && typeof bridge.onSetValue === "function") {
          bridge.onSetValue(String(key), value);
        }
        return ok();
      },
      Commit: function () {
        if (!initialized || terminated) {
          return fail("301");
        }
        if (bridge && typeof bridge.onCommit === "function") {
          bridge.onCommit({ ...state });
        }
        return ok();
      },
      GetLastError: function () {
        return lastError;
      },
      GetErrorString: function () {
        return "No error";
      },
      GetDiagnostic: function () {
        return "";
      }
    };
  }

  global.createScorm2004Api = createScorm2004Api;
})(window);
