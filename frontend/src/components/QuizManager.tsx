import React, { useState, useEffect } from 'react';
import { authFetch } from '../utils/authFetch';
import { Button, Form, ListGroup, Alert, Row, Col } from 'react-bootstrap';

interface Quiz {
    id: number;
    title: string;
    theme: { id: number; name: string };
    questions: { id: number; label: string }[];
}

interface Theme {
    id: number;
    name: string;
}

interface Question {
    id: number;
    label: string;
    themeId: number;
}

const QuizManager: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [themes, setThemes] = useState<Theme[]>([]);
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

    const initialFormState = {
        title: '',
        themeId: 0,
        questionIds: [] as number[],
    };
    const [formData, setFormData] = useState(initialFormState);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [quizzesRes, themesRes, questionsRes] = await Promise.all([
                authFetch('/api/quizzes/created'),
                fetch('/api/quizzes/themes'), // Public route
                authFetch('/api/quizzes/questions/created')
            ]);

            if (!quizzesRes.ok || !themesRes.ok || !questionsRes.ok) {
                throw new Error('Failed to fetch initial data');
            }

            const quizzesData = await quizzesRes.json();
            const themesData = await themesRes.json();
            const questionsData = await questionsRes.json();

            setQuizzes(quizzesData);
            setThemes(themesData);
            setAllQuestions(questionsData);

            if (themesData.length > 0 && !formData.themeId) {
                setFormData(prev => ({ ...prev, themeId: themesData[0].id }));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredQuestions = allQuestions.filter(q => q.themeId === formData.themeId);

    const handleEdit = (quiz: Quiz) => {
        setEditingQuiz(quiz);
        setFormData({
            title: quiz.title,
            themeId: quiz.theme.id,
            questionIds: quiz.questions.map(q => q.id),
        });
        setShowForm(true);
    };

    const handleAddNew = () => {
        setEditingQuiz(null);
        const newFormState = { ...initialFormState };
        if (themes.length > 0) {
            newFormState.themeId = themes[0].id;
        }
        setFormData(newFormState);
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingQuiz(null);
        setFormData(initialFormState);
    };

        const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let dataToSend = { ...formData };

        if (!editingQuiz) {
            const selectedTheme = themes.find(t => t.id === formData.themeId);
            if (!selectedTheme) {
                setError("Veuillez sélectionner un thème.");
                return;
            }
            const baseTitle = `Quiz sur le thème: ${selectedTheme.name}`;
            let newTitle = baseTitle;
            let counter = 2;
            while (quizzes.some(q => q.title === newTitle)) {
                newTitle = `${baseTitle} #${counter}`;
                counter++;
            }
            dataToSend.title = newTitle;
        }

        const method = editingQuiz ? 'PUT' : 'POST';
        const url = editingQuiz ? `/api/quizzes/${editingQuiz.id}` : '/api/quizzes';

        try {
            const response = await authFetch(url, {
                method,
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'La sauvegarde du quizz a échoué.');
            }

            fetchData();
            handleCancel();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this quiz?')) return;

        try {
            const response = await authFetch(`/api/quizzes/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete quiz');
            }

            fetchData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        }
    };

    const handleQuestionSelection = (questionId: number) => {
        setFormData(prev => {
            const questionIds = prev.questionIds.includes(questionId)
                ? prev.questionIds.filter(id => id !== questionId)
                : [...prev.questionIds, questionId];
            return { ...prev, questionIds };
        });
    };

    return (
        <>
            {error && <Alert variant="danger">{error}</Alert>}

            {!showForm && <Button onClick={handleAddNew} className="mb-3">Créer un nouveau quizz</Button>}

            {showForm && (
                <Form onSubmit={handleSubmit} className="mb-4 p-3 border rounded">
                    <h5 className="mb-3">{editingQuiz ? 'Modifier le quizz' : 'Créer un quizz'}</h5>
                    {editingQuiz && (
                        <Form.Group className="mb-3">
                            <Form.Label>Titre du Quizz</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </Form.Group>
                    )}
                    <Form.Group className="mb-3">
                        <Form.Label>Thème</Form.Label>
                        <Form.Select
                            value={formData.themeId}
                            onChange={e => setFormData({ ...formData, themeId: Number(e.target.value), questionIds: [] })}
                            disabled={themes.length === 0}
                        >
                            {themes.length > 0 ? themes.map(theme => (
                                <option key={theme.id} value={theme.id}>{theme.name}</option>
                            )) : <option>Veuillez d'abord créer un thème</option>}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Questions</Form.Label>
                        <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px' }}>
                            {filteredQuestions.length > 0 ? filteredQuestions.map(question => (
                                <Form.Check
                                    key={question.id}
                                    type="checkbox"
                                    label={question.label}
                                    checked={formData.questionIds.includes(question.id)}
                                    onChange={() => handleQuestionSelection(question.id)}
                                />
                            )) : <p>Aucune question disponible pour ce thème.</p>}
                        </div>
                    </Form.Group>
                    <div className="d-flex justify-content-end">
                        <Button variant="secondary" onClick={handleCancel} className="me-2">Annuler</Button>
                        <Button variant="primary" type="submit">Sauvegarder</Button>
                    </div>
                </Form>
            )}

            <hr />
            <h5>Quizz Existants</h5>
            {loading ? <p>Chargement...</p> : (
                <ListGroup>
                    {quizzes.map(quiz => (
                        <ListGroup.Item key={quiz.id}>
                            <Row className="align-items-center">
                                <Col>
                                    <strong>{quiz.title}</strong>
                                    <small className="d-block text-muted">Thème: {quiz.theme.name}</small>
                                    <small className="d-block text-muted">{quiz.questions?.length || 0} questions</small>
                                </Col>
                                <Col xs="auto">
                                    <Button variant="outline-primary" size="sm" onClick={() => handleEdit(quiz)} className="me-2">Modifier</Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(quiz.id)}>Supprimer</Button>
                                </Col>
                            </Row>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </>
    );
};

export default QuizManager;
