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

// Get all notes
function getNotes() {
  return fetch('/api/notes', {
    accept: 'application/json',
  })
    .then(checkStatus)
    .then(parseJSON);
}

// Create a new note
function createNote(note) {
  console.log('Client createNote called with:', note);
  return fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  })
    .then(checkStatus)
    .then(parseJSON);
}

// Update a note
function updateNote(id, note) {
  return fetch(`/api/notes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  })
    .then(checkStatus)
    .then(parseJSON);
}

// Delete a note
function deleteNote(id) {
  return fetch(`/api/notes/${id}`, {
    method: 'DELETE',
  })
    .then(checkStatus)
    .then(parseJSON);
}

const Client = { getNotes, createNote, updateNote, deleteNote };
export default Client;
