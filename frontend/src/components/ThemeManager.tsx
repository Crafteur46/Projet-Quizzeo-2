import React, { useState, useEffect } from 'react';
import { Button, Form, ListGroup, Alert, Col, Row } from 'react-bootstrap';
import { authFetch } from '../utils/authFetch';

interface Theme {
    id: number;
    name: string;
}

const ThemeManager: React.FC = () => {
    const [themes, setThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
    const [themeName, setThemeName] = useState('');
    const [showForm, setShowForm] = useState(false);

    const fetchThemes = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/quizzes/themes');
            if (!response.ok) throw new Error('Erreur lors de la récupération des thèmes');
            const data = await response.json();
            setThemes(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchThemes();
    }, []);

    const handleEdit = (theme: Theme) => {
        setEditingTheme(theme);
        setThemeName(theme.name);
        setShowForm(true);
    };

    const handleAddNew = () => {
        setEditingTheme(null);
        setThemeName('');
        setShowForm(true);
    };
    
    const handleCancel = () => {
        setShowForm(false);
        setEditingTheme(null);
        setThemeName('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const url = editingTheme ? `/api/quizzes/themes/${editingTheme.id}` : '/api/quizzes/themes';
        const method = editingTheme ? 'PUT' : 'POST';

        try {
            const response = await authFetch(url, {
                method,
                body: JSON.stringify({ name: themeName }),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'L\'opération a échoué.');
            }
            fetchThemes();
            handleCancel();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce thème ? Toutes les questions et quizz associés seront également supprimés.')) return;
        setError(null);
        try {
            const response = await authFetch(`/api/quizzes/themes/${id}`, { method: 'DELETE' });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'La suppression a échoué.');
            }
            fetchThemes();
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <>
            {error && <Alert variant="danger">{error}</Alert>}
            
            {!showForm && <Button onClick={handleAddNew} className="mb-3">Créer un nouveau thème</Button>}

            {showForm && (
                <Form onSubmit={handleSubmit} className="mb-4 p-3 border rounded">
                    <h5 className="mb-3">{editingTheme ? 'Modifier le thème' : 'Créer un thème'}</h5>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={2}>Nom</Form.Label>
                        <Col sm={10}>
                            <Form.Control
                                type="text"
                                value={themeName}
                                onChange={e => setThemeName(e.target.value)}
                                required
                            />
                        </Col>
                    </Form.Group>
                    <div className="d-flex justify-content-end">
                        <Button variant="secondary" onClick={handleCancel} className="me-2">Annuler</Button>
                        <Button variant="primary" type="submit">Sauvegarder</Button>
                    </div>
                </Form>
            )}

            <hr />

            <h5>Thèmes Existants</h5>
            {loading ? <p>Chargement...</p> : (
                <ListGroup>
                    {themes.map(theme => (
                        <ListGroup.Item key={theme.id} className="d-flex justify-content-between align-items-center">
                            {theme.name}
                            <div>
                                <Button variant="outline-primary" size="sm" onClick={() => handleEdit(theme)} className="me-2">Modifier</Button>
                                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(theme.id)}>Supprimer</Button>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </>
    );
};

export default ThemeManager;
