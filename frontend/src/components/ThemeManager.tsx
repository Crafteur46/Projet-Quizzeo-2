import React, { useState, useEffect } from 'react';
import { authFetch } from '../utils/authFetch';
import { Button, Modal, Form, ListGroup, InputGroup, FormControl } from 'react-bootstrap';

interface Theme {
  id: number;
  name: string;
}

const ThemeManager: React.FC = () => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
        const response = await fetch('/api/quizzes/themes'); // This is a public route, no auth needed
        if (!response.ok) {
            throw new Error('Failed to fetch themes');
        }
        const data = await response.json();
        setThemes(data);
    } catch (error) {
        console.error(error);
    }
  };

  const handleCreateTheme = async () => {
    if (!newThemeName) return;
    try {
      await authFetch('/api/quizzes/themes', {
        method: 'POST',
        body: JSON.stringify({ name: newThemeName }),
      });
      setNewThemeName('');
      fetchThemes();
    } catch (error) {
      console.error('Failed to create theme:', error);
    }
  };

  const handleUpdateTheme = async () => {
    if (!editingTheme) return;
    try {
      await authFetch(`/api/quizzes/themes/${editingTheme.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: editingTheme.name })
      });
      setEditingTheme(null);
      fetchThemes();
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

  const handleDeleteTheme = async (id: number) => {
    try {
      await authFetch(`/api/quizzes/themes/${id}`, {
        method: 'DELETE',
      });
      fetchThemes();
    } catch (error) {
      console.error('Failed to delete theme:', error);
    }
  };

  return (
    <>
      <Button onClick={() => setShowModal(true)} variant="primary" className="mb-3">Gérer les thèmes</Button>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Gestion des thèmes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nouveau thème</Form.Label>
            <InputGroup>
              <FormControl
                placeholder="Nom du thème"
                value={newThemeName}
                onChange={(e) => setNewThemeName(e.target.value)}
              />
              <Button variant="outline-secondary" onClick={handleCreateTheme}>Créer</Button>
            </InputGroup>
          </Form.Group>

          <ListGroup>
            {themes.map(theme => (
              <ListGroup.Item key={theme.id}>
                {editingTheme?.id === theme.id ? (
                  <InputGroup>
                    <FormControl
                      value={editingTheme.name}
                      onChange={(e) => setEditingTheme({ ...editingTheme, name: e.target.value })}
                    />
                    <Button variant="outline-secondary" onClick={handleUpdateTheme}>Sauvegarder</Button>
                    <Button variant="outline-danger" onClick={() => setEditingTheme(null)}>Annuler</Button>
                  </InputGroup>
                ) : (
                  <div className="d-flex justify-content-between align-items-center">
                    {theme.name}
                    <div>
                      <Button variant="link" onClick={() => setEditingTheme(theme)}>Modifier</Button>
                      <Button variant="link" className="text-danger" onClick={() => handleDeleteTheme(theme.id)}>Supprimer</Button>
                    </div>
                  </div>
                )}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ThemeManager;
