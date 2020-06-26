export const redirect = (queryParamName: string) => {
  const value = getRedirectionQueryParam(queryParamName);
  window.location.assign(value);
}

const getRedirectionQueryParam = (queryParamName: string) => {
  const url = new URL(window.location.href);
  const callbackValue = url.searchParams.get(queryParamName);
  if (callbackValue) {
    const cbUrl = new URL(callbackValue, window.location.href);
    cbUrl.searchParams.forEach((value: string, key: string) => {
      if (key && value) {
        url.searchParams.append(key, value);
        cbUrl.searchParams.delete(key);
      }
    });

    url.searchParams.delete(queryParamName);
    return cbUrl.pathname + url.search;
  }
  return "/";
}