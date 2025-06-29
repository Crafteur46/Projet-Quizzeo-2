import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, ListGroup, Col, Row, Alert } from 'react-bootstrap';
import { authFetch } from '../utils/authFetch';

interface Question {
  id: number;
  label: string;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
  correctAnswer: number;
  themeId: number;
  theme: { name: string };
}

interface Theme {
  id: number;
  name: string;
}

const QuestionManager: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const initialFormState = {
    label: '',
    answer1: '',
    answer2: '',
    answer3: '',
    answer4: '',
    correctAnswer: 1,
    themeId: 0,
  };
  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [questionsRes, themesRes] = await Promise.all([
        authFetch('/api/quizzes/questions/created'),
        fetch('/api/quizzes/themes') // Public route
      ]);

      if (!questionsRes.ok || !themesRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const questionsData = await questionsRes.json();
      const themesData = await themesRes.json();

      setQuestions(questionsData);
      setThemes(themesData);
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

  const handleShowModal = (question: Question | null = null) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        label: question.label,
        answer1: question.answer1,
        answer2: question.answer2,
        answer3: question.answer3,
        answer4: question.answer4,
        correctAnswer: question.correctAnswer,
        themeId: question.themeId,
      });
    } else {
      setEditingQuestion(null);
      setFormData(initialFormState);
      if (themes.length > 0) {
        setFormData(prev => ({ ...prev, themeId: themes[0].id }));
      }
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingQuestion(null);
    setFormData(initialFormState);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingQuestion ? 'PUT' : 'POST';
    const url = editingQuestion ? `/api/quizzes/questions/${editingQuestion.id}` : '/api/quizzes/questions';

    try {
      const response = await authFetch(url, {
        method,
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save question');
      }

      fetchData();
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      const response = await authFetch(`/api/quizzes/questions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete question');
      }

      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'correctAnswer' || name === 'themeId' ? parseInt(value) : value }));
  };

  return (
    <>
      <Button onClick={() => handleShowModal()} className="mb-3">Gérer les Questions</Button>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingQuestion ? 'Modifier' : 'Créer'} une Question</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Question</Form.Label>
              <Form.Control type="text" name="label" value={formData.label} onChange={handleChange} required />
            </Form.Group>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Réponse 1</Form.Label>
                        <Form.Control type="text" name="answer1" value={formData.answer1} onChange={handleChange} required />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Réponse 2</Form.Label>
                        <Form.Control type="text" name="answer2" value={formData.answer2} onChange={handleChange} required />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Réponse 3</Form.Label>
                        <Form.Control type="text" name="answer3" value={formData.answer3} onChange={handleChange} required />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Réponse 4</Form.Label>
                        <Form.Control type="text" name="answer4" value={formData.answer4} onChange={handleChange} required />
                    </Form.Group>
                </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Bonne réponse</Form.Label>
              <div className="d-flex">
                {[1, 2, 3, 4].map(num => (
                  <Form.Check key={num} type="radio" name="correctAnswer" label={`Réponse ${num}`} value={num} checked={formData.correctAnswer === num} onChange={handleChange} className="me-3" />
                ))}
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Thème</Form.Label>
              <Form.Select name="themeId" value={formData.themeId} onChange={handleChange}>
                {themes.map(theme => (
                  <option key={theme.id} value={theme.id}>{theme.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Button variant="primary" type="submit">Sauvegarder</Button>
          </Form>
          <hr />
          <h5>Questions existantes</h5>
          {loading ? <p>Chargement...</p> :
            <ListGroup>
              {questions.map(q => (
                <ListGroup.Item key={q.id} className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{q.label}</strong>
                    <small className="d-block text-muted">Thème: {q.theme.name}</small>
                  </div>
                  <div>
                    <Button variant="outline-primary" size="sm" onClick={() => handleShowModal(q)} className="me-2">Modifier</Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(q.id)}>Supprimer</Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          }
        </Modal.Body>
      </Modal>
    </>
  );
};

export default QuestionManager;
