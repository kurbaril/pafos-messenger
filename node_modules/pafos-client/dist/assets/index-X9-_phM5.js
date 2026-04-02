import { r as reactExports, a as reactDomExports, b as getDefaultExportFromCjs, R as React$2, u as useNavigate, c as useLocation, L as Link, O as Outlet, d as useParams, e as Routes, f as Route, N as Navigate, B as BrowserRouter } from "./vendor-BJqaFZc1.js";
import { z as zt, R as ReactModal, F as Fe } from "./ui-DcJkT-1H.js";
import { l as lookup } from "./socket-BtypAtrY.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
var jsxRuntime = { exports: {} };
var reactJsxRuntime_production_min = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var f = reactExports, k = Symbol.for("react.element"), l = Symbol.for("react.fragment"), m$1 = Object.prototype.hasOwnProperty, n = f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, p = { key: true, ref: true, __self: true, __source: true };
function q(c, a, g) {
  var b, d = {}, e = null, h = null;
  void 0 !== g && (e = "" + g);
  void 0 !== a.key && (e = "" + a.key);
  void 0 !== a.ref && (h = a.ref);
  for (b in a) m$1.call(a, b) && !p.hasOwnProperty(b) && (d[b] = a[b]);
  if (c && c.defaultProps) for (b in a = c.defaultProps, a) void 0 === d[b] && (d[b] = a[b]);
  return { $$typeof: k, type: c, key: e, ref: h, props: d, _owner: n.current };
}
reactJsxRuntime_production_min.Fragment = l;
reactJsxRuntime_production_min.jsx = q;
reactJsxRuntime_production_min.jsxs = q;
{
  jsxRuntime.exports = reactJsxRuntime_production_min;
}
var jsxRuntimeExports = jsxRuntime.exports;
var client = {};
var m = reactDomExports;
{
  client.createRoot = m.createRoot;
  client.hydrateRoot = m.hydrateRoot;
}
const __vite_import_meta_env__$2 = {};
const createStoreImpl = (createState) => {
  let state;
  const listeners = /* @__PURE__ */ new Set();
  const setState = (partial, replace) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (!Object.is(nextState, state)) {
      const previousState = state;
      state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
      listeners.forEach((listener) => listener(state, previousState));
    }
  };
  const getState = () => state;
  const getInitialState = () => initialState;
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const destroy = () => {
    if ((__vite_import_meta_env__$2 ? "production" : void 0) !== "production") {
      console.warn(
        "[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected."
      );
    }
    listeners.clear();
  };
  const api = { setState, getState, getInitialState, subscribe, destroy };
  const initialState = state = createState(setState, getState, api);
  return api;
};
const createStore = (createState) => createState ? createStoreImpl(createState) : createStoreImpl;
var withSelector = { exports: {} };
var withSelector_production = {};
var shim$2 = { exports: {} };
var useSyncExternalStoreShim_production = {};
/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React$1 = reactExports;
function is$1(x, y) {
  return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
}
var objectIs$1 = "function" === typeof Object.is ? Object.is : is$1, useState = React$1.useState, useEffect$1 = React$1.useEffect, useLayoutEffect = React$1.useLayoutEffect, useDebugValue$2 = React$1.useDebugValue;
function useSyncExternalStore$2(subscribe, getSnapshot) {
  var value = getSnapshot(), _useState = useState({ inst: { value, getSnapshot } }), inst = _useState[0].inst, forceUpdate = _useState[1];
  useLayoutEffect(
    function() {
      inst.value = value;
      inst.getSnapshot = getSnapshot;
      checkIfSnapshotChanged(inst) && forceUpdate({ inst });
    },
    [subscribe, value, getSnapshot]
  );
  useEffect$1(
    function() {
      checkIfSnapshotChanged(inst) && forceUpdate({ inst });
      return subscribe(function() {
        checkIfSnapshotChanged(inst) && forceUpdate({ inst });
      });
    },
    [subscribe]
  );
  useDebugValue$2(value);
  return value;
}
function checkIfSnapshotChanged(inst) {
  var latestGetSnapshot = inst.getSnapshot;
  inst = inst.value;
  try {
    var nextValue = latestGetSnapshot();
    return !objectIs$1(inst, nextValue);
  } catch (error) {
    return true;
  }
}
function useSyncExternalStore$1(subscribe, getSnapshot) {
  return getSnapshot();
}
var shim$1 = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? useSyncExternalStore$1 : useSyncExternalStore$2;
useSyncExternalStoreShim_production.useSyncExternalStore = void 0 !== React$1.useSyncExternalStore ? React$1.useSyncExternalStore : shim$1;
{
  shim$2.exports = useSyncExternalStoreShim_production;
}
var shimExports = shim$2.exports;
/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var React = reactExports, shim = shimExports;
function is(x, y) {
  return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
}
var objectIs = "function" === typeof Object.is ? Object.is : is, useSyncExternalStore = shim.useSyncExternalStore, useRef = React.useRef, useEffect = React.useEffect, useMemo = React.useMemo, useDebugValue$1 = React.useDebugValue;
withSelector_production.useSyncExternalStoreWithSelector = function(subscribe, getSnapshot, getServerSnapshot, selector, isEqual) {
  var instRef = useRef(null);
  if (null === instRef.current) {
    var inst = { hasValue: false, value: null };
    instRef.current = inst;
  } else inst = instRef.current;
  instRef = useMemo(
    function() {
      function memoizedSelector(nextSnapshot) {
        if (!hasMemo) {
          hasMemo = true;
          memoizedSnapshot = nextSnapshot;
          nextSnapshot = selector(nextSnapshot);
          if (void 0 !== isEqual && inst.hasValue) {
            var currentSelection = inst.value;
            if (isEqual(currentSelection, nextSnapshot))
              return memoizedSelection = currentSelection;
          }
          return memoizedSelection = nextSnapshot;
        }
        currentSelection = memoizedSelection;
        if (objectIs(memoizedSnapshot, nextSnapshot)) return currentSelection;
        var nextSelection = selector(nextSnapshot);
        if (void 0 !== isEqual && isEqual(currentSelection, nextSelection))
          return memoizedSnapshot = nextSnapshot, currentSelection;
        memoizedSnapshot = nextSnapshot;
        return memoizedSelection = nextSelection;
      }
      var hasMemo = false, memoizedSnapshot, memoizedSelection, maybeGetServerSnapshot = void 0 === getServerSnapshot ? null : getServerSnapshot;
      return [
        function() {
          return memoizedSelector(getSnapshot());
        },
        null === maybeGetServerSnapshot ? void 0 : function() {
          return memoizedSelector(maybeGetServerSnapshot());
        }
      ];
    },
    [getSnapshot, getServerSnapshot, selector, isEqual]
  );
  var value = useSyncExternalStore(subscribe, instRef[0], instRef[1]);
  useEffect(
    function() {
      inst.hasValue = true;
      inst.value = value;
    },
    [value]
  );
  useDebugValue$1(value);
  return value;
};
{
  withSelector.exports = withSelector_production;
}
var withSelectorExports = withSelector.exports;
const useSyncExternalStoreExports = /* @__PURE__ */ getDefaultExportFromCjs(withSelectorExports);
const __vite_import_meta_env__$1 = {};
const { useDebugValue } = React$2;
const { useSyncExternalStoreWithSelector } = useSyncExternalStoreExports;
let didWarnAboutEqualityFn = false;
const identity = (arg) => arg;
function useStore(api, selector = identity, equalityFn) {
  if ((__vite_import_meta_env__$1 ? "production" : void 0) !== "production" && equalityFn && !didWarnAboutEqualityFn) {
    console.warn(
      "[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937"
    );
    didWarnAboutEqualityFn = true;
  }
  const slice = useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState,
    api.getServerState || api.getInitialState,
    selector,
    equalityFn
  );
  useDebugValue(slice);
  return slice;
}
const createImpl = (createState) => {
  if ((__vite_import_meta_env__$1 ? "production" : void 0) !== "production" && typeof createState !== "function") {
    console.warn(
      "[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`."
    );
  }
  const api = typeof createState === "function" ? createStore(createState) : createState;
  const useBoundStore = (selector, equalityFn) => useStore(api, selector, equalityFn);
  Object.assign(useBoundStore, api);
  return useBoundStore;
};
const create = (createState) => createState ? createImpl(createState) : createImpl;
const __vite_import_meta_env__ = {};
function createJSONStorage(getStorage, options) {
  let storage;
  try {
    storage = getStorage();
  } catch (_e) {
    return;
  }
  const persistStorage = {
    getItem: (name) => {
      var _a;
      const parse = (str2) => {
        if (str2 === null) {
          return null;
        }
        return JSON.parse(str2, void 0);
      };
      const str = (_a = storage.getItem(name)) != null ? _a : null;
      if (str instanceof Promise) {
        return str.then(parse);
      }
      return parse(str);
    },
    setItem: (name, newValue) => storage.setItem(
      name,
      JSON.stringify(newValue, void 0)
    ),
    removeItem: (name) => storage.removeItem(name)
  };
  return persistStorage;
}
const toThenable = (fn) => (input) => {
  try {
    const result = fn(input);
    if (result instanceof Promise) {
      return result;
    }
    return {
      then(onFulfilled) {
        return toThenable(onFulfilled)(result);
      },
      catch(_onRejected) {
        return this;
      }
    };
  } catch (e) {
    return {
      then(_onFulfilled) {
        return this;
      },
      catch(onRejected) {
        return toThenable(onRejected)(e);
      }
    };
  }
};
const oldImpl = (config, baseOptions) => (set, get, api) => {
  let options = {
    getStorage: () => localStorage,
    serialize: JSON.stringify,
    deserialize: JSON.parse,
    partialize: (state) => state,
    version: 0,
    merge: (persistedState, currentState) => ({
      ...currentState,
      ...persistedState
    }),
    ...baseOptions
  };
  let hasHydrated = false;
  const hydrationListeners = /* @__PURE__ */ new Set();
  const finishHydrationListeners = /* @__PURE__ */ new Set();
  let storage;
  try {
    storage = options.getStorage();
  } catch (_e) {
  }
  if (!storage) {
    return config(
      (...args) => {
        console.warn(
          `[zustand persist middleware] Unable to update item '${options.name}', the given storage is currently unavailable.`
        );
        set(...args);
      },
      get,
      api
    );
  }
  const thenableSerialize = toThenable(options.serialize);
  const setItem = () => {
    const state = options.partialize({ ...get() });
    let errorInSync;
    const thenable = thenableSerialize({ state, version: options.version }).then(
      (serializedValue) => storage.setItem(options.name, serializedValue)
    ).catch((e) => {
      errorInSync = e;
    });
    if (errorInSync) {
      throw errorInSync;
    }
    return thenable;
  };
  const savedSetState = api.setState;
  api.setState = (state, replace) => {
    savedSetState(state, replace);
    void setItem();
  };
  const configResult = config(
    (...args) => {
      set(...args);
      void setItem();
    },
    get,
    api
  );
  let stateFromStorage;
  const hydrate = () => {
    var _a;
    if (!storage) return;
    hasHydrated = false;
    hydrationListeners.forEach((cb) => cb(get()));
    const postRehydrationCallback = ((_a = options.onRehydrateStorage) == null ? void 0 : _a.call(options, get())) || void 0;
    return toThenable(storage.getItem.bind(storage))(options.name).then((storageValue) => {
      if (storageValue) {
        return options.deserialize(storageValue);
      }
    }).then((deserializedStorageValue) => {
      if (deserializedStorageValue) {
        if (typeof deserializedStorageValue.version === "number" && deserializedStorageValue.version !== options.version) {
          if (options.migrate) {
            return options.migrate(
              deserializedStorageValue.state,
              deserializedStorageValue.version
            );
          }
          console.error(
            `State loaded from storage couldn't be migrated since no migrate function was provided`
          );
        } else {
          return deserializedStorageValue.state;
        }
      }
    }).then((migratedState) => {
      var _a2;
      stateFromStorage = options.merge(
        migratedState,
        (_a2 = get()) != null ? _a2 : configResult
      );
      set(stateFromStorage, true);
      return setItem();
    }).then(() => {
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(stateFromStorage, void 0);
      hasHydrated = true;
      finishHydrationListeners.forEach((cb) => cb(stateFromStorage));
    }).catch((e) => {
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(void 0, e);
    });
  };
  api.persist = {
    setOptions: (newOptions) => {
      options = {
        ...options,
        ...newOptions
      };
      if (newOptions.getStorage) {
        storage = newOptions.getStorage();
      }
    },
    clearStorage: () => {
      storage == null ? void 0 : storage.removeItem(options.name);
    },
    getOptions: () => options,
    rehydrate: () => hydrate(),
    hasHydrated: () => hasHydrated,
    onHydrate: (cb) => {
      hydrationListeners.add(cb);
      return () => {
        hydrationListeners.delete(cb);
      };
    },
    onFinishHydration: (cb) => {
      finishHydrationListeners.add(cb);
      return () => {
        finishHydrationListeners.delete(cb);
      };
    }
  };
  hydrate();
  return stateFromStorage || configResult;
};
const newImpl = (config, baseOptions) => (set, get, api) => {
  let options = {
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => state,
    version: 0,
    merge: (persistedState, currentState) => ({
      ...currentState,
      ...persistedState
    }),
    ...baseOptions
  };
  let hasHydrated = false;
  const hydrationListeners = /* @__PURE__ */ new Set();
  const finishHydrationListeners = /* @__PURE__ */ new Set();
  let storage = options.storage;
  if (!storage) {
    return config(
      (...args) => {
        console.warn(
          `[zustand persist middleware] Unable to update item '${options.name}', the given storage is currently unavailable.`
        );
        set(...args);
      },
      get,
      api
    );
  }
  const setItem = () => {
    const state = options.partialize({ ...get() });
    return storage.setItem(options.name, {
      state,
      version: options.version
    });
  };
  const savedSetState = api.setState;
  api.setState = (state, replace) => {
    savedSetState(state, replace);
    void setItem();
  };
  const configResult = config(
    (...args) => {
      set(...args);
      void setItem();
    },
    get,
    api
  );
  api.getInitialState = () => configResult;
  let stateFromStorage;
  const hydrate = () => {
    var _a, _b;
    if (!storage) return;
    hasHydrated = false;
    hydrationListeners.forEach((cb) => {
      var _a2;
      return cb((_a2 = get()) != null ? _a2 : configResult);
    });
    const postRehydrationCallback = ((_b = options.onRehydrateStorage) == null ? void 0 : _b.call(options, (_a = get()) != null ? _a : configResult)) || void 0;
    return toThenable(storage.getItem.bind(storage))(options.name).then((deserializedStorageValue) => {
      if (deserializedStorageValue) {
        if (typeof deserializedStorageValue.version === "number" && deserializedStorageValue.version !== options.version) {
          if (options.migrate) {
            return [
              true,
              options.migrate(
                deserializedStorageValue.state,
                deserializedStorageValue.version
              )
            ];
          }
          console.error(
            `State loaded from storage couldn't be migrated since no migrate function was provided`
          );
        } else {
          return [false, deserializedStorageValue.state];
        }
      }
      return [false, void 0];
    }).then((migrationResult) => {
      var _a2;
      const [migrated, migratedState] = migrationResult;
      stateFromStorage = options.merge(
        migratedState,
        (_a2 = get()) != null ? _a2 : configResult
      );
      set(stateFromStorage, true);
      if (migrated) {
        return setItem();
      }
    }).then(() => {
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(stateFromStorage, void 0);
      stateFromStorage = get();
      hasHydrated = true;
      finishHydrationListeners.forEach((cb) => cb(stateFromStorage));
    }).catch((e) => {
      postRehydrationCallback == null ? void 0 : postRehydrationCallback(void 0, e);
    });
  };
  api.persist = {
    setOptions: (newOptions) => {
      options = {
        ...options,
        ...newOptions
      };
      if (newOptions.storage) {
        storage = newOptions.storage;
      }
    },
    clearStorage: () => {
      storage == null ? void 0 : storage.removeItem(options.name);
    },
    getOptions: () => options,
    rehydrate: () => hydrate(),
    hasHydrated: () => hasHydrated,
    onHydrate: (cb) => {
      hydrationListeners.add(cb);
      return () => {
        hydrationListeners.delete(cb);
      };
    },
    onFinishHydration: (cb) => {
      finishHydrationListeners.add(cb);
      return () => {
        finishHydrationListeners.delete(cb);
      };
    }
  };
  if (!options.skipHydration) {
    hydrate();
  }
  return stateFromStorage || configResult;
};
const persistImpl = (config, baseOptions) => {
  if ("getStorage" in baseOptions || "serialize" in baseOptions || "deserialize" in baseOptions) {
    if ((__vite_import_meta_env__ ? "production" : void 0) !== "production") {
      console.warn(
        "[DEPRECATED] `getStorage`, `serialize` and `deserialize` options are deprecated. Use `storage` option instead."
      );
    }
    return oldImpl(config, baseOptions);
  }
  return newImpl(config, baseOptions);
};
const persist = persistImpl;
const API_URL$1 = "https://pafos-messenger.onrender.com";
const fetchWithAuth = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL$1}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }
  return response.json();
};
const login = async (username, password) => {
  return fetchWithAuth("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
};
const register = async (username, password) => {
  return fetchWithAuth("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
};
const logout = async () => {
  return fetchWithAuth("/api/auth/logout", { method: "POST" });
};
const getMe = async () => {
  return fetchWithAuth("/api/auth/me");
};
const searchUsers = async (query) => {
  return fetchWithAuth(`/api/search/users?q=${encodeURIComponent(query)}`);
};
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_URL$1}/api/upload/image`, {
    method: "POST",
    body: formData,
    credentials: "include"
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Upload failed");
  }
  return response.json();
};
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_URL$1}/api/upload/file`, {
    method: "POST",
    body: formData,
    credentials: "include"
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Upload failed");
  }
  return response.json();
};
const uploadVoice = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_URL$1}/api/upload/voice`, {
    method: "POST",
    body: formData,
    credentials: "include"
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Upload failed");
  }
  return response.json();
};
const getNotifications = async () => {
  return fetchWithAuth("/api/notifications");
};
const markNotificationRead = async (notificationId) => {
  return fetchWithAuth(`/api/notifications/${notificationId}/read`, { method: "PUT" });
};
const markAllNotificationsRead = async () => {
  return fetchWithAuth("/api/notifications/read-all", { method: "PUT" });
};
const getUnreadCount = async () => {
  return fetchWithAuth("/api/notifications/unread/count");
};
const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      error: null,
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      checkAuth: async () => {
        set({ loading: true });
        try {
          const user = await getMe();
          set({ user, loading: false, error: null });
          return user;
        } catch (error) {
          set({ user: null, loading: false, error: error.message });
          return null;
        }
      },
      login: async (username, password) => {
        set({ loading: true, error: null });
        try {
          const user = await login(username, password);
          set({ user, loading: false });
          return user;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },
      register: async (username, password) => {
        set({ loading: true, error: null });
        try {
          const user = await register(username, password);
          set({ user, loading: false });
          return user;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },
      logout: async () => {
        try {
          await logout();
        } catch (error) {
          console.error("Logout error:", error);
        }
        set({ user: null, error: null });
      },
      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
        }));
      }
    }),
    {
      name: "pafos-auth",
      partialize: (state) => ({ user: state.user })
    }
  )
);
const useAuth = () => {
  const {
    user,
    loading,
    error,
    login: login2,
    register: register2,
    logout: logout2,
    checkAuth,
    updateUser,
    setUser
  } = useAuthStore();
  return {
    user,
    loading,
    error,
    login: login2,
    register: register2,
    logout: logout2,
    checkAuth,
    updateUser,
    setUser,
    isAuthenticated: !!user
  };
};
const useChatStore = create(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: null,
      messages: {},
      typingUsers: {},
      loading: false,
      error: null,
      setChats: (chats) => set({ chats }),
      addChat: (chat) => set((state) => ({
        chats: [chat, ...state.chats.filter((c) => c.id !== chat.id)]
      })),
      updateChat: (chatId, updates) => set((state) => ({
        chats: state.chats.map(
          (chat) => chat.id === chatId ? { ...chat, ...updates } : chat
        )
      })),
      removeChat: (chatId) => set((state) => ({
        chats: state.chats.filter((chat) => chat.id !== chatId),
        messages: {
          ...state.messages,
          [chatId]: void 0
        }
      })),
      setCurrentChat: (chatId) => set({ currentChatId: chatId }),
      setMessages: (chatId, messages, hasMore = false) => set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: {
            items: messages,
            hasMore,
            loaded: true
          }
        }
      })),
      addMessage: (message) => set((state) => {
        var _a;
        const chatMessages = ((_a = state.messages[message.chatId]) == null ? void 0 : _a.items) || [];
        const exists = chatMessages.some((m2) => m2.id === message.id);
        if (exists) return state;
        return {
          messages: {
            ...state.messages,
            [message.chatId]: {
              ...state.messages[message.chatId],
              items: [...chatMessages, message],
              loaded: true
            }
          }
        };
      }),
      updateMessage: (messageId, updates) => set((state) => {
        var _a, _b;
        const newMessages = { ...state.messages };
        for (const chatId in newMessages) {
          const index = (_b = (_a = newMessages[chatId]) == null ? void 0 : _a.items) == null ? void 0 : _b.findIndex((m2) => m2.id === messageId);
          if (index !== void 0 && index !== -1) {
            newMessages[chatId].items[index] = {
              ...newMessages[chatId].items[index],
              ...updates
            };
            break;
          }
        }
        return { messages: newMessages };
      }),
      deleteMessage: (messageId) => set((state) => {
        var _a, _b;
        const newMessages = { ...state.messages };
        for (const chatId in newMessages) {
          newMessages[chatId].items = ((_b = (_a = newMessages[chatId]) == null ? void 0 : _a.items) == null ? void 0 : _b.filter((m2) => m2.id !== messageId)) || [];
        }
        return { messages: newMessages };
      }),
      addReaction: (messageId, reaction) => set((state) => {
        var _a, _b, _c;
        const newMessages = { ...state.messages };
        for (const chatId in newMessages) {
          const message = (_b = (_a = newMessages[chatId]) == null ? void 0 : _a.items) == null ? void 0 : _b.find((m2) => m2.id === messageId);
          if (message) {
            const existingReaction = (_c = message.reactions) == null ? void 0 : _c.find((r) => r.emoji === reaction.emoji && r.userId === reaction.userId);
            if (!existingReaction) {
              message.reactions = [...message.reactions || [], reaction];
            }
            break;
          }
        }
        return { messages: newMessages };
      }),
      removeReaction: (messageId, emoji, userId) => set((state) => {
        var _a, _b, _c;
        const newMessages = { ...state.messages };
        for (const chatId in newMessages) {
          const message = (_b = (_a = newMessages[chatId]) == null ? void 0 : _a.items) == null ? void 0 : _b.find((m2) => m2.id === messageId);
          if (message) {
            message.reactions = (_c = message.reactions) == null ? void 0 : _c.filter((r) => !(r.emoji === emoji && r.userId === userId));
            break;
          }
        }
        return { messages: newMessages };
      }),
      setTypingUsers: (chatId, userId, isTyping) => set((state) => {
        const current = state.typingUsers[chatId] || [];
        let newTyping;
        if (isTyping && !current.includes(userId)) {
          newTyping = [...current, userId];
        } else if (!isTyping && current.includes(userId)) {
          newTyping = current.filter((id) => id !== userId);
        } else {
          return state;
        }
        return {
          typingUsers: {
            ...state.typingUsers,
            [chatId]: newTyping
          }
        };
      }),
      getTypingUsers: (chatId) => {
        const userIds = get().typingUsers[chatId] || [];
        return userIds;
      },
      clearTyping: (chatId) => set((state) => ({
        typingUsers: {
          ...state.typingUsers,
          [chatId]: []
        }
      })),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      reset: () => set({
        chats: [],
        currentChatId: null,
        messages: {},
        typingUsers: {},
        loading: false,
        error: null
      })
    }),
    {
      name: "pafos-chats",
      partialize: (state) => ({
        chats: state.chats,
        currentChatId: state.currentChatId
      })
    }
  )
);
const useSocket = () => {
  const { user } = useAuth();
  const socketRef = reactExports.useRef(null);
  const [isConnected, setIsConnected] = reactExports.useState(false);
  const {
    addMessage,
    updateMessage,
    deleteMessage: deleteMessageFromStore,
    addReaction: addReactionToStore,
    removeReaction: removeReactionFromStore,
    setTypingUsers
  } = useChatStore();
  reactExports.useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }
    const socket = lookup("wss://pafos-messenger.onrender.com", {
      transports: ["websocket"],
      withCredentials: true,
      auth: {
        sessionID: localStorage.getItem("sessionID")
      }
    });
    socketRef.current = socket;
    socket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
    });
    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });
    socket.on("newMessage", (message) => {
      var _a;
      addMessage(message);
      if (message.senderId !== user.id) {
        zt.success(`${message.sender.username}: ${(_a = message.content) == null ? void 0 : _a.substring(0, 50)}`);
      }
    });
    socket.on("messageEdited", (message) => {
      updateMessage(message.id, message);
    });
    socket.on("messageDeleted", ({ messageId }) => {
      deleteMessageFromStore(messageId);
    });
    socket.on("messageRead", ({ messageId, userId }) => {
      updateMessage(messageId, { readBy: [{ userId }] });
    });
    socket.on("typing:start", ({ userId, chatId }) => {
      setTypingUsers(chatId, userId, true);
    });
    socket.on("typing:stop", ({ userId, chatId }) => {
      setTypingUsers(chatId, userId, false);
    });
    socket.on("reactionAdded", ({ messageId, reaction }) => {
      addReactionToStore(messageId, reaction);
    });
    socket.on("reactionRemoved", ({ messageId, emoji, userId }) => {
      removeReactionFromStore(messageId, emoji, userId);
    });
    socket.on("userOnline", ({ userId }) => {
    });
    socket.on("userOffline", ({ userId }) => {
    });
    socket.on("chatUpdated", ({ chatId }) => {
      window.dispatchEvent(new CustomEvent("refreshChats"));
    });
    socket.on("newChat", ({ chatId }) => {
      window.dispatchEvent(new CustomEvent("refreshChats"));
    });
    socket.on("mention", ({ messageId, chatId, sender, content }) => {
      zt(
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
            "@",
            sender.username
          ] }),
          " mentioned you",
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-text-secondary", children: content })
        ] }),
        { duration: 5e3 }
      );
    });
    return () => {
      socket.disconnect();
    };
  }, [user]);
  const emit = (event, data, callback) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data, callback);
    }
  };
  const connect = () => {
    if (socketRef.current && !isConnected) {
      socketRef.current.connect();
    }
  };
  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };
  const sendMessage = (data, callback) => {
    emit("sendMessage", data, callback);
  };
  const editMessage = (data, callback) => {
    emit("editMessage", data, callback);
  };
  const deleteMessage = (data, callback) => {
    emit("deleteMessage", data, callback);
  };
  const markAsRead = (data, callback) => {
    emit("markAsRead", data, callback);
  };
  const markChatAsRead = (data, callback) => {
    emit("markChatAsRead", data, callback);
  };
  const startTyping = (chatId) => {
    emit("typing:start", { chatId });
  };
  const stopTyping = (chatId) => {
    emit("typing:stop", { chatId });
  };
  const addReaction = (data, callback) => {
    emit("addReaction", data, callback);
  };
  const removeReaction = (data, callback) => {
    emit("removeReaction", data, callback);
  };
  const updatePresence = (status) => {
    emit("presence:update", { status });
  };
  return {
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    markChatAsRead,
    startTyping,
    stopTyping,
    addReaction,
    removeReaction,
    updatePresence,
    emit
  };
};
const usePresence = () => {
  const { socket, isConnected, updatePresence: socketUpdatePresence } = useSocket();
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = reactExports.useState(/* @__PURE__ */ new Map());
  const [status, setStatus] = reactExports.useState("online");
  reactExports.useEffect(() => {
    if (isConnected && user) {
      socketUpdatePresence("online");
    }
  }, [isConnected, user, socketUpdatePresence]);
  reactExports.useEffect(() => {
    if (!socket) return;
    const handleUserOnline = ({ userId }) => {
      setOnlineUsers((prev) => {
        const newMap = new Map(prev);
        newMap.set(userId, { status: "online", lastSeen: /* @__PURE__ */ new Date() });
        return newMap;
      });
    };
    const handleUserOffline = ({ userId }) => {
      setOnlineUsers((prev) => {
        const newMap = new Map(prev);
        newMap.set(userId, { status: "offline", lastSeen: /* @__PURE__ */ new Date() });
        return newMap;
      });
    };
    const handlePresenceChanged = ({ userId, status: status2, lastSeen }) => {
      setOnlineUsers((prev) => {
        const newMap = new Map(prev);
        newMap.set(userId, { status: status2, lastSeen: new Date(lastSeen) });
        return newMap;
      });
    };
    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);
    socket.on("presence:changed", handlePresenceChanged);
    return () => {
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
      socket.off("presence:changed", handlePresenceChanged);
    };
  }, [socket]);
  const getUserStatus = reactExports.useCallback((userId) => {
    const presence = onlineUsers.get(userId);
    if (!presence) return { status: "offline", lastSeen: null, isOnline: false };
    const isOnline = presence.status === "online" && /* @__PURE__ */ new Date() - new Date(presence.lastSeen) < 5 * 60 * 1e3;
    return {
      status: isOnline ? "online" : presence.status,
      lastSeen: presence.lastSeen,
      isOnline
    };
  }, [onlineUsers]);
  const formatLastSeen2 = reactExports.useCallback((lastSeen) => {
    if (!lastSeen) return "never";
    const now = /* @__PURE__ */ new Date();
    const seen = new Date(lastSeen);
    const diff = now - seen;
    const minutes = Math.floor(diff / 6e4);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    return seen.toLocaleDateString();
  }, []);
  const setUserStatus = reactExports.useCallback((newStatus) => {
    setStatus(newStatus);
    socketUpdatePresence(newStatus);
  }, [socketUpdatePresence]);
  return {
    onlineUsers: Array.from(onlineUsers.entries()).map(([id, data]) => ({ userId: id, ...data })),
    getUserStatus,
    formatLastSeen: formatLastSeen2,
    status,
    setStatus: setUserStatus,
    isOnline: (userId) => getUserStatus(userId).isOnline
  };
};
const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = reactExports.useState([]);
  const [unreadCount, setUnreadCount] = reactExports.useState(0);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const fetchNotifications = reactExports.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);
  const fetchUnreadCount = reactExports.useCallback(async () => {
    if (!user) return;
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, [user]);
  const markAsRead = reactExports.useCallback(async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications(
        (prev) => prev.map(
          (n2) => n2.id === notificationId ? { ...n2, isRead: true } : n2
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, []);
  const markAllAsRead = reactExports.useCallback(async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(
        (prev) => prev.map((n2) => ({ ...n2, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }, []);
  const addNotification = reactExports.useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadCount((prev) => prev + 1);
    }
  }, []);
  reactExports.useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 3e4);
    return () => clearInterval(interval);
  }, [user, fetchNotifications, fetchUnreadCount]);
  reactExports.useEffect(() => {
    if (!user) return;
    const handleNewNotification = (event) => {
      const notification = event.detail;
      addNotification(notification);
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(notification.title, {
          body: notification.body,
          icon: "/icon-192.png"
        });
      }
    };
    window.addEventListener("newNotification", handleNewNotification);
    return () => window.removeEventListener("newNotification", handleNewNotification);
  }, [user, addNotification]);
  const requestPermission = reactExports.useCallback(async () => {
    if ("Notification" in window && Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  }, []);
  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    requestPermission
  };
};
function Layout() {
  const { user, logout: logout2 } = useAuth();
  const { status, setStatus } = usePresence();
  const { unreadCount } = useNotifications();
  const [showMenu, setShowMenu] = reactExports.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = async () => {
    await logout2();
    navigate("/login");
  };
  const getPageTitle = () => {
    if (location.pathname === "/profile") return "Profile";
    if (location.pathname === "/create-group") return "Create Group";
    return "PaFos";
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-screen flex flex-col bg-bg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "h-14 bg-surface border-b border-border flex items-center justify-between px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-xl font-bold text-primary", children: getPageTitle() }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setShowMenu(!showMenu),
              className: "flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-hover hover:bg-surface-active transition",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-2 h-2 rounded-full ${status === "online" ? "bg-success" : status === "away" ? "bg-warning" : status === "busy" ? "bg-error" : "bg-offline"}` }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm capitalize", children: status || "online" })
              ]
            }
          ),
          showMenu && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-0 top-full mt-2 w-32 bg-surface rounded-lg shadow-lg border border-border z-10", children: ["online", "away", "busy"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => {
                setStatus(s);
                setShowMenu(false);
              },
              className: `w-full text-left px-4 py-2 text-sm hover:bg-surface-hover transition first:rounded-t-lg last:rounded-b-lg ${status === s ? "text-primary" : "text-text"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block w-2 h-2 rounded-full mr-2 ${s === "online" ? "bg-success" : s === "away" ? "bg-warning" : "bg-error"}` }),
                s.charAt(0).toUpperCase() + s.slice(1)
              ]
            },
            s
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/notifications", className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-6 h-6 text-text-secondary hover:text-primary transition", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" }) }),
          unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full text-xs text-white flex items-center justify-center", children: unreadCount > 9 ? "9+" : unreadCount })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setShowMenu(!showMenu),
              className: "flex items-center gap-2",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: (user == null ? void 0 : user.avatarUrl) || "/default-avatar.png",
                  alt: "Avatar",
                  className: "w-8 h-8 rounded-full object-cover"
                }
              )
            }
          ),
          showMenu && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-0 top-full mt-2 w-48 bg-surface rounded-lg shadow-lg border border-border z-10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 border-b border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-text", children: user == null ? void 0 : user.username }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-secondary", children: (user == null ? void 0 : user.bio) || "No bio" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: "/profile",
                onClick: () => setShowMenu(false),
                className: "flex items-center gap-2 px-4 py-2 text-sm text-text hover:bg-surface-hover transition",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) }),
                  "Edit Profile"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: "/create-group",
                onClick: () => setShowMenu(false),
                className: "flex items-center gap-2 px-4 py-2 text-sm text-text hover:bg-surface-hover transition",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6v6m0 0v6m0-6h6m-6 0H6" }) }),
                  "Create Group"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: handleLogout,
                className: "w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-surface-hover transition rounded-b-lg",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" }) }),
                  "Logout"
                ]
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) })
  ] });
}
function Login() {
  const [isLogin, setIsLogin] = reactExports.useState(true);
  const [username, setUsername] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const { login: login2, register: register2 } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      zt.error("Please fill in all fields");
      return;
    }
    if (!isLogin && username.length < 2) {
      zt.error("Username must be at least 2 characters");
      return;
    }
    if (password.length < 4) {
      zt.error("Password must be at least 4 characters");
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await login2(username, password);
        zt.success("Welcome back!");
      } else {
        await register2(username, password);
        zt.success("Account created! Welcome to PaFos!");
      }
      navigate("/");
    } catch (error) {
      zt.error(error.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-bg to-surface p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-5xl mb-3", children: "💬" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-primary", children: "PaFos" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-secondary mt-2", children: "Modern messaging for friends" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface rounded-2xl shadow-xl p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setIsLogin(true),
            className: `flex-1 py-2 rounded-lg font-medium transition ${isLogin ? "bg-primary text-white" : "bg-surface-hover text-text-secondary hover:text-text"}`,
            children: "Sign In"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setIsLogin(false),
            className: `flex-1 py-2 rounded-lg font-medium transition ${!isLogin ? "bg-primary text-white" : "bg-surface-hover text-text-secondary hover:text-text"}`,
            children: "Sign Up"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-text-secondary mb-1", children: "Username" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: username,
              onChange: (e) => setUsername(e.target.value.toLowerCase()),
              className: "w-full px-4 py-2 bg-surface-hover border border-border rounded-lg text-text focus:border-primary focus:outline-none transition",
              placeholder: "cool_username",
              autoComplete: "username",
              disabled: loading
            }
          ),
          !isLogin && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-secondary mt-1", children: "Letters, numbers, and underscore only" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-text-secondary mb-1", children: "Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "password",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              className: "w-full px-4 py-2 bg-surface-hover border border-border rounded-lg text-text focus:border-primary focus:outline-none transition",
              placeholder: "••••••••",
              autoComplete: isLogin ? "current-password" : "new-password",
              disabled: loading
            }
          ),
          !isLogin && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-secondary mt-1", children: "At least 4 characters" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            disabled: loading,
            className: "w-full py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed",
            children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto" }) : isLogin ? "Sign In" : "Create Account"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 text-center text-xs text-text-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        isLogin ? "Don't have an account? " : "Already have an account? ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setIsLogin(!isLogin),
            className: "text-primary hover:text-primary-hover transition",
            children: isLogin ? "Sign Up" : "Sign In"
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center mt-6 text-xs text-text-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "PaFos Messenger • Private & Secure" }) })
  ] }) });
}
const formatMessageTime = (date) => {
  if (!date) return "Never";
  const now = /* @__PURE__ */ new Date();
  const msgDate = new Date(date);
  const diff = now - msgDate;
  const days = Math.floor(diff / (1e3 * 60 * 60 * 24));
  if (days === 0) {
    return msgDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (days === 1) {
    return "Yesterday";
  } else if (days < 7) {
    return msgDate.toLocaleDateString([], { weekday: "short" });
  } else {
    return msgDate.toLocaleDateString([], { day: "numeric", month: "short" });
  }
};
const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};
const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return "never";
  const now = /* @__PURE__ */ new Date();
  const seen = new Date(lastSeen);
  const diff = now - seen;
  const seconds = Math.floor(diff / 1e3);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (seconds < 10) {
    return "just now";
  } else if (seconds < 60) {
    return `${seconds} seconds ago`;
  } else if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (hours < 24) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (days < 7) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else {
    return seen.toLocaleDateString();
  }
};
const isVibrationSupported = () => {
  return "vibrate" in window.navigator;
};
const vibrate = (pattern = 50) => {
  if (!isVibrationSupported()) return;
  try {
    window.navigator.vibrate(pattern);
  } catch (error) {
    console.warn("Vibration failed:", error);
  }
};
const vibrateOnReaction = () => {
  vibrate(15);
};
let audioContext = null;
const initAudio = () => {
  if (!audioContext && window.AudioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};
const isSoundEnabled = () => {
  const settings = localStorage.getItem("pafos_settings");
  if (settings) {
    const parsed = JSON.parse(settings);
    return parsed.sound !== false;
  }
  return true;
};
const playBeep = (frequency = 800, duration = 0.1, volume = 0.3) => {
  if (!isSoundEnabled()) return;
  const ctx = initAudio();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.frequency.value = frequency;
  gain.gain.value = volume;
  oscillator.start();
  gain.gain.exponentialRampToValueAtTime(1e-5, ctx.currentTime + duration);
  oscillator.stop(ctx.currentTime + duration);
};
const playReactionSound = () => {
  playBeep(600, 0.05, 0.15);
};
function Message({ message, isOwn, showAvatar, onReact, onReply, onInfo }) {
  var _a, _b, _c, _d, _e;
  const [showReactions, setShowReactions] = reactExports.useState(false);
  const [showContextMenu, setShowContextMenu] = reactExports.useState(false);
  const [animateReaction, setAnimateReaction] = reactExports.useState(null);
  const [isHovered, setIsHovered] = reactExports.useState(false);
  const contextMenuRef = reactExports.useRef(null);
  useAuth();
  const reactions = ["👍", "❤️", "😂", "😮", "😢", "😡"];
  const handleReaction = (emoji) => {
    onReact(message.id, emoji);
    setAnimateReaction(emoji);
    vibrateOnReaction();
    playReactionSound();
    setTimeout(() => setAnimateReaction(null), 300);
  };
  const handleContextMenu = (e) => {
    e.preventDefault();
    setShowContextMenu(true);
  };
  reactExports.useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setShowContextMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
  const renderContent = () => {
    var _a2;
    if (message.isDeletedForUsers) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "italic text-text-secondary", children: isOwn ? "You deleted this message" : "Message deleted" });
    }
    if (message.fileUrl) {
      if (message.fileType === "image") {
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: message.fileUrl,
            alt: message.fileName,
            className: "max-w-[300px] max-h-[300px] rounded-lg cursor-pointer hover:opacity-90 transition",
            onClick: () => window.open(message.fileUrl, "_blank")
          }
        ) });
      }
      if (message.fileType === "voice") {
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "w-8 h-8 flex items-center justify-center bg-surface-hover rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-4 h-4 text-text", fill: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M8 5v14l11-7z" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: formatDuration(message.duration) })
        ] });
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-1 p-2 bg-surface-hover rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-8 h-8 text-text-secondary", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium truncate", children: message.fileName }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-text-secondary", children: [
            Math.round(message.fileSize / 1024),
            " KB"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            href: message.fileUrl,
            download: true,
            className: "text-primary hover:text-primary-hover text-sm",
            children: "Download"
          }
        )
      ] });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "whitespace-pre-wrap break-words", children: [
      message.quoted && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 pb-1 border-l-2 border-primary pl-2 text-xs text-text-secondary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
          "@",
          (_a2 = message.quoted.sender) == null ? void 0 : _a2.username
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate", children: message.quoted.content })
      ] }),
      message.content
    ] });
  };
  const reactionGroups = (_a = message.reactions) == null ? void 0 : _a.reduce((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `flex ${isOwn ? "justify-end" : "justify-start"} mb-2`,
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      onContextMenu: handleContextMenu,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex ${isOwn ? "flex-row-reverse" : "flex-row"} items-end gap-2 max-w-[75%]`, children: [
          showAvatar && !isOwn && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: ((_b = message.sender) == null ? void 0 : _b.avatarUrl) || "/default-avatar.png",
              alt: (_c = message.sender) == null ? void 0 : _c.username,
              className: "w-8 h-8 rounded-full object-cover flex-shrink-0"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: `px-3 py-2 rounded-2xl ${isOwn ? "bg-primary text-white rounded-br-sm" : "bg-surface text-text rounded-bl-sm"}`,
                onClick: () => onInfo == null ? void 0 : onInfo(message),
                children: [
                  !isOwn && showAvatar && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-text-secondary mb-1", children: [
                    "@",
                    (_d = message.sender) == null ? void 0 : _d.username
                  ] }),
                  renderContent(),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-1 mt-1 text-xs ${isOwn ? "text-primary-light" : "text-text-secondary"}`, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatMessageTime(message.createdAt) }),
                    isOwn && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: ((_e = message.readBy) == null ? void 0 : _e.length) > 0 ? "✓✓" : "✓" }),
                    message.editedAt && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "italic", children: "(edited)" })
                  ] })
                ]
              }
            ),
            reactionGroups && Object.keys(reactionGroups).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`, children: Object.entries(reactionGroups).map(([emoji, count]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "bg-surface-hover px-1.5 py-0.5 rounded-full text-xs", children: [
              emoji,
              " ",
              count
            ] }, emoji)) }),
            isHovered && !message.isDeletedForUsers && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: `absolute -top-10 ${isOwn ? "right-0" : "left-0"} flex gap-1 bg-surface rounded-full shadow-lg p-1 z-10`,
                onMouseEnter: () => setShowReactions(true),
                onMouseLeave: () => setShowReactions(false),
                children: [
                  reactions.map((emoji) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => handleReaction(emoji),
                      className: "w-8 h-8 hover:bg-surface-hover rounded-full transition-all text-lg hover:scale-110",
                      children: emoji
                    },
                    emoji
                  )),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => onReply == null ? void 0 : onReply(message),
                      className: "w-8 h-8 hover:bg-surface-hover rounded-full transition-all",
                      children: "↩️"
                    }
                  )
                ]
              }
            ),
            animateReaction && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `reaction-animate absolute -top-10 ${isOwn ? "right-0" : "left-0"} text-2xl pointer-events-none`, children: animateReaction })
          ] })
        ] }),
        showContextMenu && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            ref: contextMenuRef,
            className: "fixed z-20 bg-surface rounded-lg shadow-lg border border-border py-1",
            style: { top: "auto", left: "auto" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => {
                    onReply == null ? void 0 : onReply(message);
                    setShowContextMenu(false);
                  },
                  className: "w-full px-4 py-2 text-left text-sm hover:bg-surface-hover transition",
                  children: "Reply"
                }
              ),
              isOwn && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => {
                    setShowContextMenu(false);
                  },
                  className: "w-full px-4 py-2 text-left text-sm hover:bg-surface-hover transition",
                  children: "Edit"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => {
                    setShowContextMenu(false);
                  },
                  className: "w-full px-4 py-2 text-left text-sm text-error hover:bg-surface-hover transition",
                  children: "Delete"
                }
              )
            ]
          }
        )
      ]
    }
  );
}
if (typeof window !== "undefined") {
  ReactModal.setAppElement("#root");
}
function AvatarModal({ isOpen, onClose, src, alt }) {
  reactExports.useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    ReactModal,
    {
      isOpen,
      onRequestClose: onClose,
      overlayClassName: "fixed inset-0 bg-black/90 z-[1100] flex items-center justify-center",
      className: "relative outline-none max-w-[90vw] max-h-[90vh]",
      closeTimeoutMS: 200,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: src || "/default-avatar.png",
            alt: alt || "Avatar",
            className: "max-w-full max-h-[90vh] object-contain rounded-lg"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: onClose,
            className: "absolute -top-12 right-0 p-2 text-white hover:text-primary transition-colors",
            "aria-label": "Close",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
          }
        ),
        alt && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-8 left-0 right-0 text-center text-white text-sm", children: alt })
      ] })
    }
  );
}
function Avatar({
  src,
  alt,
  size = "md",
  onClick,
  className = "",
  showModal = true
}) {
  const [modalOpen, setModalOpen] = reactExports.useState(false);
  const sizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
    "2xl": "w-24 h-24",
    "3xl": "w-32 h-32"
  };
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (showModal && src && src !== "/default-avatar.png") {
      setModalOpen(true);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `
          avatar relative rounded-full overflow-hidden bg-surface-hover
          ${sizeClasses[size]} ${className}
          ${onClick || showModal && src ? "cursor-pointer hover:scale-105 transition-transform" : ""}
        `,
        onClick: handleClick,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: src || "/default-avatar.png",
            alt: alt || "Avatar",
            className: "w-full h-full object-cover",
            onError: (e) => {
              e.target.src = "/default-avatar.png";
            }
          }
        )
      }
    ),
    modalOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
      AvatarModal,
      {
        isOpen: modalOpen,
        onClose: () => setModalOpen(false),
        src,
        alt
      }
    )
  ] });
}
function MentionInput({ value, onChange, onSend, placeholder, disabled }) {
  const [showSuggestions, setShowSuggestions] = reactExports.useState(false);
  const [suggestions, setSuggestions] = reactExports.useState([]);
  const [mentionQuery, setMentionQuery] = reactExports.useState("");
  const [cursorPosition, setCursorPosition] = reactExports.useState(0);
  const textareaRef = reactExports.useRef(null);
  const suggestionRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleInput = (e) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    setCursorPosition(cursorPos);
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    if (lastAtIndex !== -1 && (lastAtIndex === 0 || textBeforeCursor[lastAtIndex - 1] === " ")) {
      const query = textBeforeCursor.slice(lastAtIndex + 1);
      if (query.length > 0) {
        setMentionQuery(query);
        fetchSuggestions(query);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
    onChange(newValue);
  };
  const fetchSuggestions = async (query) => {
    try {
      const users = await searchUsers(query);
      setSuggestions(users.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    }
  };
  const insertMention = (username) => {
    const textBeforeCursor = value.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    const textAfterCursor = value.slice(cursorPosition);
    const newText = textBeforeCursor.slice(0, lastAtIndex) + `@${username} ` + textAfterCursor;
    onChange(newText);
    setShowSuggestions(false);
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = lastAtIndex + username.length + 2;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !showSuggestions) {
      e.preventDefault();
      if (value.trim()) {
        onSend();
      }
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "textarea",
      {
        ref: textareaRef,
        value,
        onChange: handleInput,
        onKeyDown: handleKeyDown,
        placeholder,
        disabled,
        rows: 1,
        className: "w-full px-4 py-2 bg-surface-hover border border-border rounded-xl resize-none focus:border-primary focus:outline-none transition-colors text-text placeholder-text-muted",
        style: { minHeight: "44px", maxHeight: "120px" }
      }
    ),
    showSuggestions && suggestions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref: suggestionRef,
        className: "absolute bottom-full left-0 mb-1 w-64 bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-50",
        children: suggestions.map((user) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => insertMention(user.username),
            className: "w-full px-3 py-2 flex items-center gap-2 hover:bg-surface-hover transition-colors text-left",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { src: user.avatarUrl, alt: user.username, size: "sm" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium text-text", children: [
                  "@",
                  user.username
                ] }),
                user.bio && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-text-secondary truncate max-w-[180px]", children: user.bio })
              ] })
            ]
          },
          user.id
        ))
      }
    )
  ] });
}
function MediaUploader({ onUpload, disabled }) {
  const [uploading, setUploading] = reactExports.useState(false);
  const fileInputRef = reactExports.useRef(null);
  const imageInputRef = reactExports.useRef(null);
  const handleFileSelect = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      zt.error("File too large. Max 20MB");
      return;
    }
    setUploading(true);
    try {
      let result;
      if (type === "image") {
        if (!file.type.startsWith("image/")) {
          zt.error("Please select an image file");
          return;
        }
        result = await uploadImage(file);
      } else {
        result = await uploadFile(file);
      }
      onUpload(result);
      zt.success("File uploaded");
    } catch (error) {
      zt.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
      if (type === "image" && imageInputRef.current) {
        imageInputRef.current.value = "";
      }
      if (type === "file" && fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => {
          var _a;
          return (_a = imageInputRef.current) == null ? void 0 : _a.click();
        },
        disabled: disabled || uploading,
        className: "p-2 text-text-secondary hover:text-primary hover:bg-surface-hover rounded-full transition-all disabled:opacity-50",
        title: "Upload image",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              ref: imageInputRef,
              type: "file",
              accept: "image/*",
              onChange: (e) => handleFileSelect(e, "image"),
              className: "hidden",
              disabled: disabled || uploading
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => {
          var _a;
          return (_a = fileInputRef.current) == null ? void 0 : _a.click();
        },
        disabled: disabled || uploading,
        className: "p-2 text-text-secondary hover:text-primary hover:bg-surface-hover rounded-full transition-all disabled:opacity-50",
        title: "Upload file",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              ref: fileInputRef,
              type: "file",
              onChange: (e) => handleFileSelect(e, "file"),
              className: "hidden",
              disabled: disabled || uploading
            }
          )
        ]
      }
    ),
    uploading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-surface border border-border rounded-lg text-xs text-text-secondary flex items-center gap-2 whitespace-nowrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" }),
      "Uploading..."
    ] })
  ] });
}
function VoiceRecorder({ onSend, disabled }) {
  const [isRecording, setIsRecording] = reactExports.useState(false);
  const [recordingTime, setRecordingTime] = reactExports.useState(0);
  const [audioURL, setAudioURL] = reactExports.useState(null);
  const [uploading, setUploading] = reactExports.useState(false);
  const mediaRecorderRef = reactExports.useRef(null);
  const audioChunksRef = reactExports.useRef([]);
  const timerRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioURL) URL.revokeObjectURL(audioURL);
    };
  }, [audioURL]);
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 120) {
            stopRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1e3);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      zt.error("Could not access microphone");
    }
  };
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    setAudioURL(null);
    audioChunksRef.current = [];
  };
  const sendRecording = async () => {
    if (!audioURL) return;
    setUploading(true);
    try {
      const blob = await fetch(audioURL).then((r) => r.blob());
      const file = new File([blob], "voice.webm", { type: "audio/webm" });
      const result = await uploadVoice(file);
      onSend({
        type: "voice",
        url: result.url,
        duration: recordingTime,
        size: result.size
      });
      setAudioURL(null);
      audioChunksRef.current = [];
      zt.success("Voice message sent");
    } catch (error) {
      zt.error("Failed to send voice message");
    } finally {
      setUploading(false);
    }
  };
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  if (disabled) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
    !isRecording && !audioURL && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: startRecording,
        className: "p-2 text-text-secondary hover:text-primary hover:bg-surface-hover rounded-full transition-all",
        title: "Voice message",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" }) })
      }
    ),
    isRecording && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-full left-0 mb-2 p-3 bg-surface border border-border rounded-xl shadow-lg flex items-center gap-3 animate-fadeInUp", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2 h-2 bg-red-500 rounded-full animate-pulse" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-red-500", children: "REC" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text font-mono", children: formatTime(recordingTime) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: stopRecording,
          className: "px-3 py-1 bg-primary hover:bg-primary-hover text-white text-sm rounded-lg transition-colors",
          children: "Stop"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: cancelRecording,
          className: "p-1 text-text-secondary hover:text-error rounded-full transition-colors",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
        }
      )
    ] }),
    audioURL && !isRecording && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-full left-0 mb-2 p-3 bg-surface border border-border rounded-xl shadow-lg flex items-center gap-3 animate-fadeInUp", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("audio", { src: audioURL, controls: true, className: "h-8 w-40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-text-secondary text-sm", children: formatTime(recordingTime) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: sendRecording,
          disabled: uploading,
          className: "p-1 text-primary hover:text-primary-hover transition-colors disabled:opacity-50",
          children: uploading ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" }) })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: cancelRecording,
          className: "p-1 text-text-secondary hover:text-error rounded-full transition-colors",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
        }
      )
    ] })
  ] });
}
function MessageInput({ onSend, disabled, chatId }) {
  const [message, setMessage] = reactExports.useState("");
  reactExports.useRef(null);
  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2 p-3 bg-surface border-t border-border", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MediaUploader, { onUpload: (file) => onSend(file), disabled }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      MentionInput,
      {
        value: message,
        onChange: setMessage,
        onSend: handleSend,
        placeholder: "Type a message...",
        disabled
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(VoiceRecorder, { onSend: (voice) => onSend(voice), disabled }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: handleSend,
        disabled: disabled || !message.trim(),
        className: "p-2 bg-primary hover:bg-primary-hover rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" }) })
      }
    )
  ] });
}
function TypingIndicator({ users = [] }) {
  if (users.length === 0) return null;
  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0]} is typing...`;
    } else if (users.length === 2) {
      return `${users[0]} and ${users[1]} are typing...`;
    } else {
      return `${users.length} people are typing...`;
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "typing-indicator flex items-center gap-2 px-4 py-2 text-sm text-text-secondary animate-fadeIn", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "typing-dot w-2 h-2 bg-text-secondary rounded-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "typing-dot w-2 h-2 bg-text-secondary rounded-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "typing-dot w-2 h-2 bg-text-secondary rounded-full" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: getTypingText() })
  ] });
}
function ChatWindow({ chat }) {
  const { chatId } = useParams();
  const { user } = useAuth();
  const { socket, sendMessage, markAsRead, markChatAsRead, startTyping, stopTyping } = useSocket();
  const { getUserStatus, getUserLastSeen } = usePresence();
  const { messages, fetchMessages, addMessage, updateMessage, deleteMessage, hasMore, loadMore } = useChatStore();
  const [loading, setLoading] = reactExports.useState(false);
  const [typingUsers, setTypingUsers] = reactExports.useState([]);
  const messagesEndRef = reactExports.useRef(null);
  const messagesContainerRef = reactExports.useRef(null);
  const [isAtBottom, setIsAtBottom] = reactExports.useState(true);
  const currentChatId = chatId || (chat == null ? void 0 : chat.id);
  const chatMessages = messages[currentChatId] || [];
  reactExports.useEffect(() => {
    if (currentChatId) {
      fetchMessages(currentChatId);
    }
  }, [currentChatId]);
  reactExports.useEffect(() => {
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isAtBottom]);
  reactExports.useEffect(() => {
    if (currentChatId && chatMessages.length > 0) {
      const unreadMessages = chatMessages.filter(
        (msg) => msg.senderId !== (user == null ? void 0 : user.id) && !msg.isRead
      );
      if (unreadMessages.length > 0) {
        markChatAsRead(currentChatId);
        unreadMessages.forEach((msg) => markAsRead(msg.id));
      }
    }
  }, [currentChatId, chatMessages, user]);
  const handleScroll = reactExports.useCallback(async (e) => {
    const container = e.target;
    const isNearTop = container.scrollTop < 100;
    if (isNearTop && hasMore[currentChatId] && !loading) {
      setLoading(true);
      await loadMore(currentChatId);
      setLoading(false);
    }
    const isBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    setIsAtBottom(isBottom);
  }, [currentChatId, hasMore, loading, loadMore]);
  reactExports.useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (message) => {
      if (message.chatId === currentChatId) {
        addMessage(currentChatId, message);
        if (message.senderId !== (user == null ? void 0 : user.id)) {
          markAsRead(message.id);
        }
      }
    };
    const handleMessageEdited = (message) => {
      if (message.chatId === currentChatId) {
        updateMessage(currentChatId, message);
      }
    };
    const handleMessageDeleted = ({ messageId }) => {
      deleteMessage(currentChatId, messageId);
    };
    const handleTypingStart = ({ userId, chatId: typingChatId }) => {
      if (typingChatId === currentChatId && userId !== (user == null ? void 0 : user.id)) {
        setTypingUsers((prev) => [.../* @__PURE__ */ new Set([...prev, userId])]);
      }
    };
    const handleTypingStop = ({ userId, chatId: typingChatId }) => {
      if (typingChatId === currentChatId) {
        setTypingUsers((prev) => prev.filter((id) => id !== userId));
      }
    };
    socket.on("newMessage", handleNewMessage);
    socket.on("messageEdited", handleMessageEdited);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);
    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageEdited", handleMessageEdited);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
    };
  }, [socket, currentChatId, user, addMessage, updateMessage, deleteMessage, markAsRead]);
  const handleSendMessage = async (content, fileData = null, replyToId = null) => {
    if (!content && !fileData) return;
    await sendMessage(currentChatId, content, null, replyToId, fileData);
    stopTyping(currentChatId);
  };
  const handleTyping = (isTyping) => {
    if (isTyping) {
      startTyping(currentChatId);
    } else {
      stopTyping(currentChatId);
    }
  };
  if (!chat && !chatId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-full text-text-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-6xl mb-4", children: "💬" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg", children: "Select a chat to start messaging" })
    ] }) });
  }
  const chatName = (chat == null ? void 0 : chat.name) || "Chat";
  const chatAvatar = (chat == null ? void 0 : chat.avatar) || "/default-avatar.png";
  const isOnline = (chat == null ? void 0 : chat.type) === "PRIVATE" ? getUserStatus(chat.id) === "online" : null;
  const lastSeen = (chat == null ? void 0 : chat.type) === "PRIVATE" ? getUserLastSeen(chat.id) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full flex flex-col bg-bg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-14 bg-surface border-b border-border flex items-center px-4 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "back-button md:hidden",
          onClick: () => {
            var _a, _b;
            (_a = document.querySelector(".chat-sidebar")) == null ? void 0 : _a.classList.remove("hidden");
            (_b = document.querySelector(".chat-main")) == null ? void 0 : _b.classList.add("hidden");
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-6 h-6 text-text", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: chatAvatar,
          alt: chatName,
          className: "w-10 h-10 rounded-full object-cover"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-text", children: chatName }),
        (chat == null ? void 0 : chat.type) === "PRIVATE" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-secondary", children: isOnline ? "Online" : lastSeen ? `Last seen ${formatLastSeen(lastSeen)}` : "Offline" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "p-2 text-text-secondary hover:text-primary transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        ref: messagesContainerRef,
        onScroll: handleScroll,
        className: "flex-1 overflow-y-auto p-4 space-y-2",
        children: [
          loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "spinner w-6 h-6 border-2 border-primary border-t-transparent rounded-full" }) }),
          chatMessages.map((message, index) => {
            var _a;
            const showAvatar = index === 0 || ((_a = chatMessages[index - 1]) == null ? void 0 : _a.senderId) !== message.senderId;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              Message,
              {
                message,
                isOwn: message.senderId === (user == null ? void 0 : user.id),
                showAvatar,
                onReact: (emoji) => {
                },
                onReply: () => {
                },
                onInfo: () => {
                }
              },
              message.id
            );
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: messagesEndRef })
        ]
      }
    ),
    typingUsers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(TypingIndicator, { users: typingUsers.map((id) => "Someone") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      MessageInput,
      {
        onSend: handleSendMessage,
        onTyping: handleTyping
      }
    )
  ] });
}
const API_URL = "https://pafos-messenger.onrender.com";
const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  const response = await fetch(`${API_URL}/api/profile/avatar`, {
    method: "POST",
    credentials: "include",
    body: formData
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Upload failed");
  }
  return response.json();
};
function ProfileEditor() {
  const { user, updateProfile, updateAvatar } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = reactExports.useState({
    username: "",
    bio: "",
    phone: "",
    email: ""
  });
  const [loading, setLoading] = reactExports.useState(false);
  const [avatarPreview, setAvatarPreview] = reactExports.useState(null);
  const [uploadingAvatar, setUploadingAvatar] = reactExports.useState(false);
  const fileInputRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        bio: user.bio || "",
        phone: user.phone || "",
        email: user.email || ""
      });
      setAvatarPreview(user.avatarUrl);
    }
  }, [user]);
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      zt.error("Username is required");
      return;
    }
    if (formData.username.length < 2) {
      zt.error("Username must be at least 2 characters");
      return;
    }
    if (formData.username.length > 20) {
      zt.error("Username must be less than 20 characters");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      zt.error("Username can only contain letters, numbers and underscore");
      return;
    }
    setLoading(true);
    try {
      await updateProfile(formData);
      zt.success("Profile updated successfully");
      navigate("/");
    } catch (error) {
      zt.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      zt.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      zt.error("Image must be less than 5MB");
      return;
    }
    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
    try {
      const result = await uploadAvatar(file);
      if (result) {
        await updateAvatar(result.avatarUrl);
        zt.success("Avatar updated");
      }
    } catch (error) {
      zt.error("Failed to upload avatar");
      setAvatarPreview(user == null ? void 0 : user.avatarUrl);
    } finally {
      setUploadingAvatar(false);
    }
  };
  const handleRemoveAvatar = async () => {
    if (!confirm("Remove your avatar?")) return;
    setUploadingAvatar(true);
    try {
      await updateAvatar(null);
      setAvatarPreview(null);
      zt.success("Avatar removed");
    } catch (error) {
      zt.error("Failed to remove avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full overflow-y-auto bg-bg p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-text", children: "Edit Profile" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => navigate("/"),
          className: "px-4 py-2 text-text-secondary hover:text-text transition",
          children: "Cancel"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface rounded-xl p-6 mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: avatarPreview || "/default-avatar.png",
            alt: "Avatar",
            className: "w-24 h-24 rounded-full object-cover border-4 border-primary"
          }
        ),
        uploadingAvatar && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "spinner w-6 h-6 border-2 border-white border-t-transparent rounded-full" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              var _a;
              return (_a = fileInputRef.current) == null ? void 0 : _a.click();
            },
            className: "px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition",
            disabled: uploadingAvatar,
            children: "Upload Photo"
          }
        ),
        avatarPreview && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleRemoveAvatar,
            className: "px-4 py-2 bg-surface-hover hover:bg-error hover:text-white text-text rounded-lg transition",
            disabled: uploadingAvatar,
            children: "Remove"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          ref: fileInputRef,
          type: "file",
          accept: "image/*",
          onChange: handleAvatarChange,
          className: "hidden"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-secondary mt-3", children: "JPG, PNG or GIF. Max size 5MB." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "bg-surface rounded-xl p-6 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-text-secondary mb-1", children: "Username *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            name: "username",
            value: formData.username,
            onChange: handleChange,
            className: "w-full px-4 py-2 bg-surface-hover border border-border rounded-lg text-text focus:border-primary focus:outline-none transition",
            placeholder: "cool_username"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-secondary mt-1", children: "Letters, numbers, and underscore only. 2-20 characters." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-text-secondary mb-1", children: "Bio" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            name: "bio",
            value: formData.bio,
            onChange: handleChange,
            rows: "3",
            className: "w-full px-4 py-2 bg-surface-hover border border-border rounded-lg text-text focus:border-primary focus:outline-none transition resize-none",
            placeholder: "Tell something about yourself...",
            maxLength: "200"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-text-secondary mt-1", children: [
          formData.bio.length,
          "/200 characters"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-text-secondary mb-1", children: "Phone (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "tel",
            name: "phone",
            value: formData.phone,
            onChange: handleChange,
            className: "w-full px-4 py-2 bg-surface-hover border border-border rounded-lg text-text focus:border-primary focus:outline-none transition",
            placeholder: "+1 234 567 8900"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-text-secondary mb-1", children: "Email (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "email",
            name: "email",
            value: formData.email,
            onChange: handleChange,
            className: "w-full px-4 py-2 bg-surface-hover border border-border rounded-lg text-text focus:border-primary focus:outline-none transition",
            placeholder: "your@email.com"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "submit",
          disabled: loading,
          className: "w-full py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition disabled:opacity-50",
          children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto" }) : "Save Changes"
        }
      ) })
    ] })
  ] }) });
}
function GroupCreate() {
  const [groupName, setGroupName] = reactExports.useState("");
  const [description, setDescription] = reactExports.useState("");
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [searchResults, setSearchResults] = reactExports.useState([]);
  const [selectedMembers, setSelectedMembers] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [searching, setSearching] = reactExports.useState(false);
  const { createGroup } = useChatStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    const search = async () => {
      if (searchQuery.length >= 2) {
        setSearching(true);
        const results = await searchUsers(searchQuery);
        setSearchResults(results.filter((u) => u.id !== (user == null ? void 0 : user.id)));
        setSearching(false);
      } else {
        setSearchResults([]);
      }
    };
    const timeout = setTimeout(search, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, user]);
  const addMember = (member) => {
    if (selectedMembers.some((m2) => m2.id === member.id)) {
      zt.error("User already added");
      return;
    }
    setSelectedMembers([...selectedMembers, member]);
    setSearchQuery("");
  };
  const removeMember = (memberId) => {
    setSelectedMembers(selectedMembers.filter((m2) => m2.id !== memberId));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      zt.error("Group name is required");
      return;
    }
    if (groupName.length > 50) {
      zt.error("Group name must be less than 50 characters");
      return;
    }
    setLoading(true);
    try {
      const memberIds = selectedMembers.map((m2) => m2.id);
      const group = await createGroup(groupName.trim(), description.trim(), memberIds);
      zt.success("Group created successfully");
      navigate(`/chat/${group.chatId}`);
    } catch (error) {
      zt.error(error.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full overflow-y-auto bg-bg p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-text", children: "Create Group" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => navigate("/"),
          className: "px-4 py-2 text-text-secondary hover:text-text transition",
          children: "Cancel"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface rounded-xl p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-text mb-4", children: "Group Info" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-text-secondary mb-1", children: "Group Name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: groupName,
                onChange: (e) => setGroupName(e.target.value),
                className: "w-full px-4 py-2 bg-surface-hover border border-border rounded-lg text-text focus:border-primary focus:outline-none transition",
                placeholder: "Enter group name",
                maxLength: 50
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-text-secondary mb-1", children: "Description (optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                value: description,
                onChange: (e) => setDescription(e.target.value),
                rows: "3",
                className: "w-full px-4 py-2 bg-surface-hover border border-border rounded-lg text-text focus:border-primary focus:outline-none transition resize-none",
                placeholder: "What's this group about?",
                maxLength: 200
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface rounded-xl p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold text-text mb-4", children: [
          "Members (",
          selectedMembers.length + 1,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-2 bg-surface-hover rounded-lg mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: (user == null ? void 0 : user.avatarUrl) || "/default-avatar.png",
                alt: user == null ? void 0 : user.username,
                className: "w-10 h-10 rounded-full object-cover"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium text-text", children: [
                "@",
                user == null ? void 0 : user.username
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-secondary", children: "You (Owner)" })
            ] })
          ] }),
          selectedMembers.map((member) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-2 hover:bg-surface-hover rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: member.avatarUrl || "/default-avatar.png",
                  alt: member.username,
                  className: "w-10 h-10 rounded-full object-cover"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium text-text", children: [
                  "@",
                  member.username
                ] }),
                member.bio && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-secondary truncate max-w-[200px]", children: member.bio })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => removeMember(member.id),
                className: "text-error hover:text-error/80 transition",
                children: "Remove"
              }
            )
          ] }, member.id))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              placeholder: "Search users to add...",
              className: "w-full px-4 py-2 pl-10 bg-surface-hover border border-border rounded-lg text-text placeholder-text-secondary focus:border-primary focus:outline-none transition"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }),
          searching && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-3 top-1/2 -translate-y-1/2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "spinner w-4 h-4 border-2 border-primary border-t-transparent rounded-full" }) })
        ] }),
        searchResults.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 max-h-48 overflow-y-auto border border-border rounded-lg", children: searchResults.map((user2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => addMember(user2),
            className: "w-full flex items-center justify-between p-2 hover:bg-surface-hover transition",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "img",
                  {
                    src: user2.avatarUrl || "/default-avatar.png",
                    alt: user2.username,
                    className: "w-10 h-10 rounded-full object-cover"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium text-text", children: [
                    "@",
                    user2.username
                  ] }),
                  user2.bio && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-secondary truncate max-w-[200px]", children: user2.bio })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary text-sm", children: "Add" })
            ]
          },
          user2.id
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "submit",
          disabled: loading || !groupName.trim(),
          className: "w-full py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition disabled:opacity-50",
          children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto" }) : "Create Group"
        }
      )
    ] })
  ] }) });
}
function SearchResults({ results, activeTab, onSelectChat, onSelectUser }) {
  if (!results || results.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8 text-text-secondary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-12 h-12 mx-auto mb-2 text-text-muted", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No results found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Try a different search term" })
    ] });
  }
  const renderMessageResult = (msg) => {
    var _a, _b, _c;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => onSelectChat == null ? void 0 : onSelectChat({ id: msg.chat.id, name: msg.chat.name }),
        className: "w-full p-3 hover:bg-surface-hover rounded-lg transition-colors text-left",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { src: (_a = msg.sender) == null ? void 0 : _a.avatarUrl, alt: (_b = msg.sender) == null ? void 0 : _b.username, size: "md" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-baseline", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-text", children: [
                "@",
                (_c = msg.sender) == null ? void 0 : _c.username
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-text-muted", children: formatMessageTime(msg.createdAt) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-text-secondary truncate", children: [
              "in ",
              msg.chat.name
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-text mt-1 line-clamp-2", children: msg.content })
          ] })
        ] })
      },
      msg.id
    );
  };
  const renderChatResult = (chat) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      onClick: () => onSelectChat == null ? void 0 : onSelectChat(chat),
      className: "w-full p-3 hover:bg-surface-hover rounded-lg transition-colors text-left",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { src: chat.avatar, alt: chat.name, size: "md" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-text", children: chat.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-text-secondary truncate", children: chat.type === "PRIVATE" ? "Private chat" : "Group" }),
          chat.lastMessage && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-text-muted truncate mt-1", children: chat.lastMessage })
        ] })
      ] })
    },
    chat.id
  );
  const renderUserResult = (user) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      onClick: () => onSelectUser == null ? void 0 : onSelectUser(user),
      className: "w-full p-3 hover:bg-surface-hover rounded-lg transition-colors text-left",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { src: user.avatarUrl, alt: user.username, size: "md" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium text-text", children: [
            "@",
            user.username
          ] }),
          user.bio && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-text-secondary truncate", children: user.bio })
        ] })
      ] })
    },
    user.id
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: results.map((item) => {
    if (item.content !== void 0) return renderMessageResult(item);
    if (item.type === "PRIVATE" || item.type === "GROUP") return renderChatResult(item);
    if (item.username) return renderUserResult(item);
    return null;
  }) });
}
function App() {
  const { user, loading, checkAuth, logout: logout2 } = useAuth();
  const { socket, connect, disconnect } = useSocket();
  useNavigate();
  reactExports.useEffect(() => {
    checkAuth();
  }, []);
  reactExports.useEffect(() => {
    if (user) {
      connect();
    }
    return () => {
      if (user) {
        disconnect();
      }
    };
  }, [user]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center min-h-screen bg-bg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-secondary", children: "Loading PaFos..." })
    ] }) });
  }
  if (!user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Login, {});
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Routes, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Route, { path: "/", element: /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { socket, user, onLogout: logout2 }), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { index: true, element: /* @__PURE__ */ jsxRuntimeExports.jsx(ChatWindow, { socket, user }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "chat/:chatId", element: /* @__PURE__ */ jsxRuntimeExports.jsx(ChatWindow, { socket, user }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "profile", element: /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileEditor, { user }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "create-group", element: /* @__PURE__ */ jsxRuntimeExports.jsx(GroupCreate, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "search", element: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchResults, {}) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { path: "*", element: /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/", replace: true }) })
  ] });
}
if ("serviceWorker" in navigator && true) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(console.error);
  });
}
client.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React$2.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BrowserRouter, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Fe,
      {
        position: "top-right",
        toastOptions: {
          duration: 4e3,
          style: {
            background: "#1A1A1A",
            color: "#E5E5E5",
            borderRadius: "12px",
            border: "1px solid #2A2A2A"
          },
          success: {
            iconTheme: {
              primary: "#10B981",
              secondary: "#1A1A1A"
            }
          },
          error: {
            iconTheme: {
              primary: "#EF4444",
              secondary: "#1A1A1A"
            }
          }
        }
      }
    )
  ] }) })
);
//# sourceMappingURL=index-X9-_phM5.js.map
