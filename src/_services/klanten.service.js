import config from "config";
import { authHeader } from "../_helpers/auth-header";
import { authService } from "../_services/auth.service";

const lookUpNumber = (mvmNummer) => {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };

  return fetch(
    `${config.apiUrl}/zoho/klant/?mvmNummer=${mvmNummer}`,
    requestOptions
  ).then(handleResponse);
};

const search = (query) => {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };

  return fetch(
    `${config.apiUrl}/zoho/search/?query=${query}`,
    requestOptions
  ).then(handleResponse);
};

const getContacten = (mvmNummer) => {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };

  return fetch(
    `${config.apiUrl}/zoho/contacten/?mvmNummer=${mvmNummer}`,
    requestOptions
  ).then(handleResponse);
};

const handleResponse = (response) => {
  return response.text().then((text) => {
    const data = text && JSON.parse(text);
    if (!response.ok) {
      if (response.status === 401) {
        // auto logout if 401 response returned from api
        authService.logout();
        location.reload(true);
      }

      const error = (data && data.error) || response.statusText;
      return Promise.reject(error);
    }

    return data;
  });
};

export const klantenService = {
  lookUpNumber,
  getContacten,
  search,
};
