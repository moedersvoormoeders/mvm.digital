import config from 'config';
import { authHeader } from '../_helpers/auth-header';
import { authService } from "../_services/auth.service"

const lookUpNumber = (mvmNummer) => {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch(`${config.apiUrl}/zoho/sinterklaas/?mvmNummer=${mvmNummer}`, requestOptions).then(handleResponse);

}

const saveKinderenForNumber = (mvmNummer, kinderen) => {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            ...authHeader(),
        },
        body: JSON.stringify({ kinderen }, getCircularReplacer())
    };

    return fetch(`${config.apiUrl}/v1/sinterklaas/klant/${mvmNummer}`, requestOptions).then(handleResponse);
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

export const sinterklaasService = {
    lookUpNumber,
    saveKinderenForNumber,
};

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
