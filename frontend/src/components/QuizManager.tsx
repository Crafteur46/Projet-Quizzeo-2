import React, { useState, useEffect } from 'react';
import { authFetch } from '../utils/authFetch';
import { Button, Modal, Form, ListGroup, Alert, Row, Col } from 'react-bootstrap';

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
    const [showModal, setShowModal] = useState(false);
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

            if (themesData.length > 0) {
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

    const handleShowModal = (quiz: Quiz | null = null) => {
        if (quiz) {
            setEditingQuiz(quiz);
            setFormData({
                title: quiz.title,
                themeId: quiz.theme.id,
                questionIds: quiz.questions.map(q => q.id),
            });
        } else {
            setEditingQuiz(null);
            setFormData(initialFormState);
            if (themes.length > 0) {
                setFormData(prev => ({ ...prev, themeId: themes[0].id }));
            }
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingQuiz(null);
        setFormData(initialFormState);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingQuiz ? 'PUT' : 'POST';
        const url = editingQuiz ? `/api/quizzes/${editingQuiz.id}` : '/api/quizzes';

        try {
            const response = await authFetch(url, {
                method,
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'La sauvegarde du quizz a échoué.');
            }

            fetchData();
            handleCloseModal();
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
            <Button onClick={() => handleShowModal()} className="mb-3">Gérer les Quizz</Button>

            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingQuiz ? 'Modifier' : 'Créer'} un Quizz</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Titre du Quizz</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Thème</Form.Label>
                            <Form.Select
                                value={formData.themeId}
                                onChange={e => setFormData({ ...formData, themeId: Number(e.target.value), questionIds: [] })}
                            >
                                {themes.map(theme => (
                                    <option key={theme.id} value={theme.id}>{theme.name}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Questions</Form.Label>
                            <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px' }}>
                                {filteredQuestions.map(question => (
                                    <Form.Check
                                        key={question.id}
                                        type="checkbox"
                                        label={question.label}
                                        checked={formData.questionIds.includes(question.id)}
                                        onChange={() => handleQuestionSelection(question.id)}
                                    />
                                ))}
                            </div>
                        </Form.Group>
                        <Button variant="primary" type="submit">Sauvegarder</Button>
                    </Form>
                    <hr />
                    <h5>Quizz Existants</h5>
                    {loading ? <p>Chargement...</p> :
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
                                            <Button variant="outline-primary" size="sm" onClick={() => handleShowModal(quiz)} className="me-2">Modifier</Button>
                                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(quiz.id)}>Supprimer</Button>
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    }
                </Modal.Body>
            </Modal>
        </>
    );
};

export default QuizManager;
