function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const error = new Error(`HTTP Error ${response.statusText}`);
  error.status = response.statusText;
  error.response = response;
  console.log(error); // eslint-disable-line no-console
  throw error;
}

function parseJSON(response) {
  return response.json();
}

function search(query) {
  console.log('Client Query:', query); // eslint-disable-line no-console
  return fetch(`http://localhost:3001/api/books?firstName=${query}`, {
    accept: 'application/json',
  })
    .then(checkStatus)
    .then(parseJSON);
}

const Client = { search };
export default Client;
