module.exports = (before, catchedCookies) => {
  const { clientSessionId, JSESSIONID, token, ...rest } = catchedCookies;
  const now = Date.now() - 1000;
  let result = '';

  if (before) {
    result = before + ' ';
  }

  if (JSESSIONID && clientSessionId) {
    result += `clientSessionId=${clientSessionId}; `;
    result += `JSESSIONID=${JSESSIONID}!${now}; `;
    result += `JSESSIONID=${JSESSIONID}; `;
    result += `ibrs-block-id=${catchedCookies['ibrs-block-id']}; `;
    result += `ibrs-efr-token=${catchedCookies['ibrs-efr-token']}; `;
    if (token) {
      result += `token=${token}; `;
    }
    if (Object.keys(rest).length > 0) {
      Object.entries(rest).forEach(([k, v]) => {
        result += `${k}=${v}; `;
      });
    }
  }
  return result;
};
