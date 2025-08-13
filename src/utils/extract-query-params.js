export function extractQueryParams(query) {
  if (!query || query === "?") return {};

  return query
    .substring(1)
    .split("&")
    .reduce((params, param) => {
      const [key, value] = param.split("=");
      if (key) {
        params[key] = value ? decodeURIComponent(value) : "";
      }
      return params;
    }, {});
}
