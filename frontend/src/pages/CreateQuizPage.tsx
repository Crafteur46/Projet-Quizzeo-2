import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Card, Row, Col, Spinner } from 'react-bootstrap';

interface QuestionFormData {
  label: string;
  answer1: string;
  answer2: string;
  answer3: string;
  answer4: string;
  correctAnswer: number | '';
}

const CreateQuizPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [themeName, setThemeName] = useState('');
  const [questions, setQuestions] = useState<QuestionFormData[]>(
    Array(10).fill(0).map(() => ({
      label: '',
      answer1: '',
      answer2: '',
      answer3: '',
      answer4: '',
      correctAnswer: '',
    }))
  );
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleQuestionChange = (index: number, field: keyof QuestionFormData, value: string | number) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const validateForm = () => {
    if (!title.trim()) {
      setError('Le titre du quiz est requis.');
      return false;
    }
    if (!themeName.trim()) {
      setError('Le nom du thème est requis.');
      return false;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.label.trim() || !q.answer1.trim() || !q.answer2.trim() || !q.answer3.trim() || !q.answer4.trim()) {
        setError(`La question ${i + 1} est incomplète. Tous les champs de réponse sont requis.`);
        return false;
      }
      if (q.correctAnswer === '') {
        setError(`Veuillez sélectionner la bonne réponse pour la question ${i + 1}.`);
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        title,
        theme: themeName,
        questions: questions.map(q => ({ ...q, correctAnswer: Number(q.correctAnswer) })),
      };

      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'La création du quiz a échoué.');
      }

      setSuccess('Quiz créé avec succès ! Vous allez être redirigé...');
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      setError(err.message || 'Une erreur inattendue est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col xs={12} md={10} lg={8}>
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">Créer un nouveau Quiz</h2>
              {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4" controlId="quizTitle">
                  <Form.Label><h3>Titre du Quiz</h3></Form.Label>
                  <Form.Control
                    type="text"
                    name="quizTitle"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Ex: Quiz sur la Révolution Française"
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="themeName">
                  <Form.Label><h3>Nom du Thème</h3></Form.Label>
                  <Form.Control
                    type="text"
                    name="themeName"
                    value={themeName}
                    onChange={(e) => setThemeName(e.target.value)}
                    required
                    placeholder="Ex: Histoire de France"
                  />
                </Form.Group>

                {questions.map((q, index) => (
                  <Card key={index} className="mb-3">
                    <Card.Header as="h5">Question {index + 1}</Card.Header>
                    <Card.Body>
                      <Form.Group className="mb-3">
                        <Form.Label>Intitulé de la question</Form.Label>
                        <Form.Control
                          type="text"
                          value={q.label}
                          onChange={(e) => handleQuestionChange(index, 'label', e.target.value)}
                          required
                          placeholder={`Question ${index + 1}`}
                        />
                      </Form.Group>
                      <Row>
                        {[1, 2, 3, 4].map(num => (
                          <Col md={6} key={num}>
                            <Form.Group className="mb-3">
                              <Form.Label>Réponse {num}</Form.Label>
                              <Form.Control
                                type="text"
                                value={q[`answer${num}` as keyof QuestionFormData] as string}
                                onChange={(e) => handleQuestionChange(index, `answer${num}` as keyof QuestionFormData, e.target.value)}
                                required
                              />
                            </Form.Group>
                          </Col>
                        ))}
                      </Row>
                      <Form.Group>
                        <Form.Label>Quelle est la bonne réponse ?</Form.Label>
                        <div>
                          {[1, 2, 3, 4].map(num => (
                            <Form.Check
                              key={num}
                              inline
                              type="radio"
                              id={`q${index}-correct-answer-${num}`}
                              label={`Réponse ${num}`}
                              name={`correctAnswer-${index}`}
                              checked={q.correctAnswer === num}
                              onChange={() => handleQuestionChange(index, 'correctAnswer', num)}
                              required
                            />
                          ))}
                        </div>
                      </Form.Group>
                    </Card.Body>
                  </Card>
                ))}

                <div className="d-grid mt-4">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Créer le Quiz'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateQuizPage;
