import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import QuizCard from '../components/QuizCard';

interface Quiz {
  id: number;
  title: string;
  theme: { name: string };
  creator: { email: string };
  _count: { questions: number };
}

const HomePage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isLoggedIn = !!localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/quizzes', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.status === 401) {
          localStorage.removeItem('token');
          setError('Session expirée. Veuillez vous reconnecter.');
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'La récupération des quiz a échoué');
        }
        const data = await response.json();
        setQuizzes(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchQuizzes();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <Container className="mt-5 text-center">
        <h2>Bienvenue sur Quizzeo !</h2>
        <p>Pour accéder aux quizz et en créer de nouveaux, veuillez vous connecter ou vous inscrire.</p>
        <div className="mt-3">
          <Button onClick={() => navigate('/login')} variant="primary" className="me-2">Connexion</Button>
          <Button onClick={() => navigate('/register')} variant="secondary">Inscription</Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="align-items-center mb-4">
        <Col>
          <h2>Quiz disponibles</h2>
        </Col>
        <Col xs="auto">
          <Button onClick={() => navigate('/create-quiz')} variant="primary">Créer un Quiz</Button>
        </Col>
      </Row>
      
      {loading && (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
        <Row xs={1} md={1} lg={2} className="g-4">
          {quizzes.length > 0 ? (
            quizzes.map(quiz => (
              <Col key={quiz.id}>
                <QuizCard
                  id={quiz.id}
                  title={quiz.title}
                  theme={quiz.theme?.name || 'Thème non défini'}
                  creator={quiz.creator?.email || 'Créateur inconnu'}
                  questionCount={quiz._count?.questions || 0}
                />
              </Col>
            ))
          ) : (
            <Col>
              <p>Aucun quiz disponible. Pourquoi ne pas en créer un ?</p>
            </Col>
          )}
        </Row>
      )}
    </Container>
  );
};

export default HomePage;
