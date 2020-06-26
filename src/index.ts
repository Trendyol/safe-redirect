import { Options } from "./interface";

export const redirect = (queryParamName: string, options?: Options) => {
  let value = getSafeValues(queryParamName);
  if (options?.extraQueryParams) {
    value = appendExtraQueryParams(value, options.extraQueryParams);
  }
  window.location.assign(value);
}

function getSafeValues(queryParamName: string) {
  const url = new URL(window.location.href);
  const callbackValue = url.searchParams.get(queryParamName);
  if (callbackValue) {
    const cbUrl = new URL(callbackValue, window.location.href);
    cbUrl.searchParams.forEach((value: string, key: string) => {
      url.searchParams.append(key, value);
      cbUrl.searchParams.delete(key);
    });

    url.searchParams.delete(queryParamName);
    return cbUrl.pathname + url.search;
  }
  return "/"
}

function appendExtraQueryParams(value: string, searchParam: string) {
  const url = new URL(value, window.location.href);
  const searchParams = new URLSearchParams(searchParam);
  searchParams.forEach((value: string, key: string) => {
    url.searchParams.append(key, value);
  });
  return url.pathname + url.search;
}