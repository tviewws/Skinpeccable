function pesapalHeaders(token) {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function getTransactionStatus(axios, baseUrl, token, orderTrackingId) {
  return axios.get(
    `${baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

module.exports = { pesapalHeaders, getTransactionStatus };
