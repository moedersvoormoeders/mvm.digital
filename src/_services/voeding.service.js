import config from "config";
import { authHeader } from "../_helpers/auth-header";
import { authService } from "../_services/auth.service";
import { getCircularReplacer } from "../_helpers/json";

const lookUpNumber = (mvmNummer) => {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };

  return fetch(
    `${config.apiUrl}/v1/voeding/klant/${mvmNummer}`,
    requestOptions
  ).then(handleResponse);
};

const lookPageUpNumber = (mvmNummer, page) => {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };

  return fetch(
    `${config.apiUrl}/v1/voeding/klant/${mvmNummer}/gekregen?page=${page}&page_size=10`,
    requestOptions
  ).then(handlePagedResponse);
};

const lookUpZohoNumber = (mvmNummer) => {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };

  return fetch(
    `${config.apiUrl}/zoho/voeding/?mvmNummer=${mvmNummer}`,
    requestOptions
  ).then(handleResponse);
};

const saveForNumber = (mvmNummer, data) => {
  const requestOptions = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(data, getCircularReplacer()),
  };

  return fetch(
    `${config.apiUrl}/v1/voeding/klant/${mvmNummer}`,
    requestOptions
  ).then(handleResponse);
};

const deleteRow = (mvmNummer, id) => {
  const requestOptions = {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...authHeader(),
    },
  };

  return fetch(
    `${config.apiUrl}/v1/voeding/klant/${mvmNummer}/gekregen/${id}`,
    requestOptions
  ).then(handleResponse);
};

const saveRow = (mvmNummer, data) => {
  const requestOptions = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(data, getCircularReplacer()),
  };

  return fetch(
    `${config.apiUrl}/v1/voeding/klant/${mvmNummer}/gekregen/${
      data.ID ? data.ID : 0
    }`,
    requestOptions
  ).then(handleResponse);
};

const getObjectOptions = () => {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };

  return fetch(`${config.apiUrl}/v1/voeding/objects`, requestOptions).then(
    handleResponse
  );
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

const handlePagedResponse = (response) => {
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

    const totalEntries = parseInt(
      response.headers.get("Num-Total-Entries"),
      10
    );

    return { data, totalEntries };
  });
};

export const voedingService = {
  lookUpNumber,
  lookUpZohoNumber,
  saveForNumber,
  lookPageUpNumber,
  saveRow,
  getObjectOptions,
  deleteRow,
};
