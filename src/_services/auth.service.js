import config from "config";
import { authHeader } from "../_helpers/auth-header";
import * as minimatch from "minimatch";

let permissionsCache = null;

const login = (username, password) => {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  };

  return fetch(`${config.apiUrl}/login`, requestOptions)
    .then(handleResponse)
    .then((user) => {
      if (user.token) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      return user;
    });
};

const logout = () => {
  localStorage.removeItem("user");
};

const getRoles = () => {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };

  return fetch(`${config.apiUrl}/v1/auth/whoami/roles`, requestOptions).then(
    handleResponse
  );
};

// verb, path
const canIDo = async (needVerb, needPath) => {
  // allow nothing if not logged in
  if (!localStorage.key("user")) {
    return false;
  }

  if (!permissionsCache) {
    permissionsCache = await getRoles();
  }

  for (let role of permissionsCache) {
    let isVerb = false;
    let isPath = false;

    for (let verb of role.verbs) {
      if (verb.content === needVerb) {
        isVerb = true;
        break;
      }
    }

    if (!isVerb) {
      break;
    }

    for (let ep of role.endpoints) {
      if (minimatch(needPath, ep.content, { matchBase: true })) {
        isPath = true;
        break;
      }
    }

    if (isVerb && isPath) {
      return true;
    }
  }

  return false;
};

const check = () => {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };

  return fetch(`${config.apiUrl}/v1/auth/check`, requestOptions).then(
    handleResponse
  );
};

export const authService = {
  login,
  logout,
  check,
  canIDo,
};

const handleResponse = (response) => {
  return response.text().then((text) => {
    const data = text && JSON.parse(text);
    if (!response.ok) {
      if (response.status === 401) {
        // auto logout if 401 response returned from api
        logout();
        location.reload(true);
      }

      const error = (data && data.error) || response.statusText;
      return Promise.reject(error);
    }

    return data;
  });
};
