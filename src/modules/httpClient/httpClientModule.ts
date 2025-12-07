import axios, {AxiosInstance, AxiosResponse} from 'axios';
import axiosRetry from 'axios-retry';
import {DependencyManager} from '../../dependencyManager';
import HttpStatusCode from '../httpClient/httpStatusCodes';
import {HttpParams, HttpResponse, IHttpClient} from '../httpClient/interfaces';

enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    PATCH = 'PATCH',
}

export const httpClientModuleInitialize = (
  dependencyManager: DependencyManager,
): void => {
  const axiosInstance = createAxiosInstance();
  configRetryStrategy(axiosInstance);
  configRequestInterceptor(axiosInstance);
  configResponseInterceptor(axiosInstance);
  const httpClient = getHttpClient(axiosInstance);
  dependencyManager.register('httpClient', httpClient);
};

/**
 * @description creates a new instance of axios
 **/
const createAxiosInstance = () => {
  const API_BASE_HOST = (import.meta as any).env.VITE_API_BASE_URL;
  return axios.create({
    baseURL: `${API_BASE_HOST}`,
    withCredentials: false,
  });
};

/**
 * @description retry strategy for axios
 **/
const configRetryStrategy = (axiosInstance: AxiosInstance) => {
  axiosRetry(axiosInstance, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
  });
};

/**
 * @description intercept every request and add custom headers
 **/
const configRequestInterceptor = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.request.use(request => {
    if (request.headers === undefined) {
      request.headers = {};
    }
    request.headers['Authorization'] = 'Bearer ' + localStorage.getItem('token');
    if (request.data) {
    }
    return request;
  });
};

/**
 * @description intercept every response and check if it has error
 **/
const configResponseInterceptor = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.response.use(
    response => {
      if (!response) {
        redirectToErrorScreen();
        return Promise.reject(undefinedResponseError);
      } else if (isServerError(response)) {
        redirectToErrorScreen();
        return Promise.reject(toHttpResponse(response));
      } else if (isBusinessError(response)) {
        return Promise.reject(toHttpResponse(response));
      } else {
        return Promise.resolve(toHttpResponse(response));
      }
    },
    error => {
      if (isServerError(error.response)) {
        redirectToErrorScreen(error);
      }
      if (error.response.status === HttpStatusCode.UNAUTHORIZED) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(toGeneralErrorResponse(error.response));
    },
  );
};

/**
 * @description redirects to error screen
 **/
const redirectToErrorScreen = (error?: any): void => {
  //TODO: Implement error screen
};

/**
 * @description redirects to network screen
 **/
const redirectToNetworkErrorScreen = (error?: any): void => {
  //TODO: Implement network error screen
};

/**
 * @description creates http response
 **/
const createHttpResponse = (
  code: number,
  data: any,
  error: any,
  status: boolean,
): HttpResponse => {
  return {
    code,
    data,
    error: {
      message:
        error instanceof Object
          ? JSON.stringify(error)
          : error === undefined
          ? 'Undefined error'
          : error,
    },
    status,
  } as HttpResponse;
};

/**
 * @description http response in case of undefined response of part of axios
 **/
const undefinedResponseError: HttpResponse = createHttpResponse(
  -1,
  {},
  'Undefined response',
  false,
);

/**
 * @description converts axios response to http response
 **/
const toHttpResponse = (response: AxiosResponse): HttpResponse => {
  const data = response.data;
  try {
    return createHttpResponse(data.status, data.result, data.msg, data.success);
  } catch (_) {
    return createHttpResponse(
      response.status,
      response.data,
      response.statusText,
      false,
    );
  }
};

/**
 * @description creates general error response
 **/
const toGeneralErrorResponse = (error: AxiosResponse): HttpResponse =>
  createHttpResponse(error.status, error.data, error.statusText, false);

/**
 * @description check if response is server error
 **/
const isServerError = (response: AxiosResponse): boolean => {
  return (
    response.status >= HttpStatusCode.INTERNAL_SERVER_ERROR ||
    response.data?.code >= HttpStatusCode.INTERNAL_SERVER_ERROR
  );
};

/**
 * @description check if response is business error
 **/
const isBusinessError = (response: AxiosResponse): boolean => {
  return (
    response.status >= HttpStatusCode.BAD_REQUEST ||
    response.data?.code >= HttpStatusCode.BAD_REQUEST
  );
};

/**
 * @param {string}  url url to request
 * @param {object}  params key value pair of params
 * @returns {string} url concatenated with query params
 **/
const getFullUrl = (url = '', params?: HttpParams) => {
  let queryParams = '';
  if (params && Object.keys(params).length > 0) {
    queryParams = `?${Object.keys(params)
      .map(key => `${key}=${params[key]}`)
      .join('&')}`;
  }
  return `${url}${queryParams}`;
};

/**
 * @param {AxiosInstance}  axiosInstance axios instance
 * @param {HttpMethod}  httpMethod http method to use
 * @param {string}  url url to request
 * @param {object}  params key value pair of params
 * @param {object}  headers key value pair of headers
 * @param {string}  contentType content type of request
 * @returns {string} url concatenated with query params
 **/
const executeApiCall = async (
  axiosInstance: AxiosInstance,
  httpMethod: HttpMethod,
  url = '',
  params = {},
  headers = {},
  contentType = 'application/json',
): Promise<HttpResponse> => {
  let customHeaders = {
    headers: {
      Accept: 'application/json',
      ...headers,
    },
  };

  // Solo agregar Content-Type si no es FormData
  if (!(params instanceof FormData)) {
    customHeaders.headers['Content-Type'] = contentType;
  }

  if (httpMethod === HttpMethod.GET) {
    return axiosInstance.get(getFullUrl(url, params), customHeaders);
  }

  if (httpMethod === HttpMethod.DELETE) {
    return axiosInstance.delete(getFullUrl(url, params), customHeaders);
  }

  if (httpMethod === HttpMethod.PUT) {
    return axiosInstance.patch(getFullUrl(url), params, customHeaders);
  }

  if (httpMethod === HttpMethod.PATCH) {
    return axiosInstance.patch(getFullUrl(url), params, customHeaders);
  }

  return axiosInstance.post(getFullUrl(url), params, customHeaders);
};

/**
 * @param {AxiosInstance} axiosInstance axios instance
 * @returns {IHttpClient} http client
 **/
const getHttpClient = (axiosInstance: AxiosInstance): IHttpClient => {
  return {
    get: (
      url = '',
      params = {},
      headers = {},
      contentType = 'application/json',
    ) => {
      return executeApiCall(
        axiosInstance,
        HttpMethod.GET,
        url,
        params,
        headers,
        contentType,
      );
    },
    post: (
      url = '',
      params = {},
      headers = {},
      contentType = 'application/json',
    ) => {
      return executeApiCall(
        axiosInstance,
        HttpMethod.POST,
        url,
        params,
        headers,
        contentType,
      );
    },
    put: (
      url = '',
      params = {},
      headers = {},
      contentType = 'application/json',
    ) => {
      return executeApiCall(
        axiosInstance,
        HttpMethod.PUT,
        url,
        params,
        headers,
        contentType,
      );
    },
    delete: (
      url = '',
      params = {},
      headers = {},
      contentType = 'application/json',
    ) => {
      return executeApiCall(
        axiosInstance,
        HttpMethod.DELETE,
        url,
        params,
        headers,
        contentType,
      );
    },
    patch: (
      url = '',
      params = {},
      headers = {},
      contentType = 'application/json',
    ) => {
      return executeApiCall(
        axiosInstance,
        HttpMethod.PATCH,
        url,
        params,
        headers,
        contentType,
      );
    },
  };
};
