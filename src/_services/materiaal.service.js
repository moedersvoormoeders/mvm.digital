import config from 'config';
import { authHeader } from '../_helpers/auth-header';
import { authService } from "../_services/auth.service"

const lookUpNumber = (mvmNummer) => {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${config.apiUrl}/v1/materiaal/klant/${mvmNummer}`, requestOptions).then(handleResponse);
}

const saveForNumber = (mvmNummer, data) => {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...authHeader(),
        },
        body: JSON.stringify(data, getCircularReplacer())
    };

    return fetch(`${config.apiUrl}/v1/materiaal/klant/${mvmNummer}`, requestOptions).then(handleResponse);
}


const getObjectOptions = () => {
    const requestOptions = {
        method: 'GET',
        headers: authHeader(),
    };

    return fetch(`${config.apiUrl}/v1/materiaal/objects`, requestOptions).then(handleResponse);

}


const handleResponse = (response) => {
    return response.text().then(text => {
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
}

const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
};

export const materiaalService = {
    lookUpNumber,
    getObjectOptions,
    saveForNumber,
};
