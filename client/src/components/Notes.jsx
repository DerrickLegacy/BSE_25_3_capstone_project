/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Button,
} from 'reactstrap';
import { setCurrentNote, clearCurrentNote } from '../Actions';

function Notes() {
  const dispatch = useDispatch();
  const notes = useSelector((state) => state.notes || []);
  const currentNote = useSelector((state) => state.currentNote);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    dispatch({ type: 'FETCH_NOTES' });
  }, [dispatch]);

  const openModal = (note = null) => {
    console.log('Opening modal with note:', note);
    if (note) {
      setTitle(note.title);
      setContent(note.content || '');
      setIsEditing(true);
      dispatch(setCurrentNote(note));
    } else {
      setTitle('');
      setContent('');
      setIsEditing(false);
      dispatch(clearCurrentNote());
    }
    setFormError('');
    setIsModalOpen(true);
    console.log('Modal state set to open');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTitle('');
    setContent('');
    setIsEditing(false);
    setFormError('');
    dispatch(clearCurrentNote());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (!title.trim()) return; // Commented out client-side validation

    console.log('Form submitted:', { title, content, isEditing, currentNote });

    if (isEditing && currentNote) {
      // Keep existing flow for update
      console.log('Dispatching UPDATE_NOTE_SAGA');
      dispatch({
        type: 'UPDATE_NOTE_SAGA',
        payload: { id: currentNote.id, title, content },
      });
      closeModal();
      return;
    }

    // Create flow: call API directly so we can show server validation errors
    try {
      setFormError('');
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setFormError(data.error || 'Failed to create note');
        return; // keep modal open so user sees the error
      }

      // Success
      await response.json();
      // Refresh list
      dispatch({ type: 'FETCH_NOTES' });
      closeModal();
    } catch (err) {
      console.error('Create note failed:', err);
      setFormError('Network error. Please try again.');
    }
  };

  const handleDelete = (noteId) => {
    setNoteToDelete(noteId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (noteToDelete) {
      dispatch({ type: 'DELETE_NOTE', payload: noteToDelete });
      setShowDeleteModal(false);
      setNoteToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setNoteToDelete(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Container className="my-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>My Notes</h2>
            <Button color="primary" onClick={() => openModal()}>
              + New Note
            </Button>
            {process.env.NODE_ENV === 'development' && (
              <Button
                color="warning"
                size="sm"
                onClick={() => {
                  const error = new Error(
                    'Test frontend error for Sentry logging'
                  );
                  console.error('Test frontend error:', error);
                  window.Sentry?.captureException(error, {
                    tags: {
                      test: true,
                      component: 'Notes',
                      action: 'test-error',
                    },
                    extra: {
                      message:
                        'This is a test error to verify frontend Sentry integration',
                      timestamp: new Date().toISOString(),
                    },
                  });
                  console.log(
                    '✅ Test error sent to Sentry! Check your dashboard.'
                  );
                }}
                className="ms-2"
              >
                🧪 Test Error
              </Button>
            )}
          </div>
        </Col>
      </Row>

      <Row>
        {notes.length === 0 ? (
          <Col>
            <div className="text-center py-5">
              <h4 className="text-muted">No notes yet</h4>
              <p className="text-muted">
                Create your first note to get started!
              </p>
            </div>
          </Col>
        ) : (
          notes.map((note) => (
            <Col md={6} lg={4} key={note.id} className="mb-3">
              <Card className="h-100 shadow-sm">
                <CardBody className="d-flex flex-column">
                  <CardTitle tag="h5" className="text-truncate">
                    {note.title}
                  </CardTitle>
                  <CardText className="flex-grow-1">
                    {note.content && note.content.length > 100
                      ? `${note.content.substring(0, 100)}...`
                      : note.content || 'No content'}
                  </CardText>
                  <div className="mt-auto">
                    <small className="text-muted d-block mb-2">
                      {formatDate(note.updated_at)}
                    </small>
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        color="outline-primary"
                        onClick={() => openModal(note)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        color="outline-danger"
                        onClick={() => handleDelete(note.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {isModalOpen && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEditing ? 'Edit Note' : 'New Note'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  aria-label="Close"
                />
              </div>
              <form onSubmit={handleSubmit} noValidate>
                <div className="modal-body">
                  {formError && (
                    <div className="alert alert-danger" role="alert">
                      {formError}
                    </div>
                  )}
                  <div className="mb-3">
                    <label htmlFor="note-title" className="form-label">
                      Title
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="note-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter note title..."
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="note-content" className="form-label">
                      Content
                    </label>
                    <textarea
                      className="form-control"
                      id="note-content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Enter note content..."
                      rows={8}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {isEditing ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={cancelDelete}
                  aria-label="Close"
                />
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete this note? This action cannot
                  be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelDelete}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

export default Notes;
