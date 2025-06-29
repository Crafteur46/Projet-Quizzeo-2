import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, ListGroup, ProgressBar, Alert, Spinner, Form, InputGroup } from 'react-bootstrap';

// Interfaces
interface Answer {
  id: number;
  text: string;
}

interface Question {
  id: number;
  label: string;
  answers: Answer[];
}

interface Quiz {
  id: number;
  title: string;
  questions: Question[];
}

interface AnswerFeedback {
  isCorrect: boolean;
  correctAnswer: string;
  score: number;
}

const QuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // State
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  
  // State for new gameplay mechanics
  const [answerMode, setAnswerMode] = useState<'cash' | 'carré' | 'duo' | null>(null);
  const [displayedAnswers, setDisplayedAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [cashAnswer, setCashAnswer] = useState('');
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);

  // Fetch quiz data
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/quizzes/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error('Impossible de charger le quiz. Il est possible qu\'il n\'existe pas ou que vous n\'ayez pas les droits.');
        }
        const data = await response.json();
        setQuiz(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchQuiz();
    }
  }, [id, token]);

  // Effect to prepare answers for 'carré' mode
    const handleModeSelect = async (mode: 'cash' | 'carré' | 'duo') => {
    setAnswerMode(mode);
    if ((mode === 'duo' || mode === 'carré') && quiz) {
      setLoading(true);
      try {
        const questionId = quiz.questions[currentQuestionIndex].id;
        const response = await fetch(`http://localhost:3001/api/quizzes/questions/${questionId}/propositions?mode=${mode}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error(`Impossible de charger les propositions pour le mode ${mode}.`);
        }
        const data = await response.json();
        setDisplayedAnswers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handlers
  const handleAnswerSelect = (answerId: number) => {
    if (!feedback) {
      setSelectedAnswer(answerId);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!quiz || answerMode === null) return;
    if (answerMode !== 'cash' && selectedAnswer === null) return;
    if (answerMode === 'cash' && cashAnswer.trim() === '') return;

    const submissionBody = {
        quizId: quiz.id,
        questionId: quiz.questions[currentQuestionIndex].id,
        mode: answerMode,
        ...(answerMode === 'cash'
            ? { answerText: cashAnswer }
            : { answerId: selectedAnswer }),
    };

    try {
      const response = await fetch('http://localhost:3001/api/quizzes/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submissionBody),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la soumission de la réponse.');
      }

      const result: AnswerFeedback = await response.json();
      setFeedback(result);
      if (result.isCorrect) {
        setScore(prevScore => prevScore + result.score);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleNextQuestion = () => {
    setFeedback(null);
    setSelectedAnswer(null);
    setAnswerMode(null);
    setCashAnswer('');
    if (currentQuestionIndex < quiz!.questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      setIsQuizFinished(true);
    }
  };

  // Render logic
  if (loading) {
    return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
  }

  if (!token) {
    return (
        <Container className="mt-5 text-center">
            <Alert variant="warning">Vous devez être connecté pour jouer à un quiz.</Alert>
            <Button onClick={() => navigate('/login')} variant="primary">Se connecter</Button>
        </Container>
    );
  }

  if (error) {
    return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
  }

  if (!quiz) {
    return <Container className="mt-5"><Alert variant="warning">Quiz non trouvé.</Alert></Container>;
  }

  if (isQuizFinished) {
    return (
      <Container className="mt-5">
        <Card className="text-center">
          <Card.Header as="h2">Quiz Terminé !</Card.Header>
          <Card.Body>
            <Card.Title>Votre score final est de : {score}</Card.Title>
            <Card.Text>Merci d'avoir joué !</Card.Text>
            <Button variant="primary" onClick={() => navigate('/')}>Retour à l'accueil</Button>
            <Button variant="secondary" onClick={() => navigate('/hall-of-fame')} className="ms-2">Tableau d'honneur</Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  const renderAnswerUI = () => {
    if (!answerMode) return null;

    switch (answerMode) {
      case 'cash':
        return (
          <InputGroup className="mt-3">
            <Form.Control
              placeholder="Votre réponse..."
              value={cashAnswer}
              onChange={(e) => setCashAnswer(e.target.value)}
              disabled={!!feedback}
            />
          </InputGroup>
        );
      case 'carré':
      case 'duo':
        return (
          <ListGroup className="mt-3">
            {displayedAnswers.map(answer => (
              <ListGroup.Item 
                key={answer.id} 
                action 
                onClick={() => handleAnswerSelect(answer.id)}
                active={selectedAnswer === answer.id}
                disabled={!!feedback}
              >
                {answer.text}
              </ListGroup.Item>
            ))}
          </ListGroup>
        );
      default:
        return null;
    }
  };

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header>
          <Card.Title as="h2">{quiz.title}</Card.Title>
          <ProgressBar now={progress} label={`${currentQuestionIndex + 1} / ${quiz.questions.length}`} />
        </Card.Header>
        <Card.Body>
          <Card.Subtitle className="mb-2 text-muted">Question {currentQuestionIndex + 1}</Card.Subtitle>
          <Card.Text as="h4">{currentQuestion.label}</Card.Text>
          
          {!feedback && !answerMode && (
            <div className="d-grid gap-2 d-md-flex justify-content-md-center mt-3">
              <Button variant="primary" size="lg" onClick={() => handleModeSelect('cash')}>Cash (5 pts)</Button>
              <Button variant="secondary" size="lg" onClick={() => handleModeSelect('carré')}>Carré (3 pts)</Button>
              <Button variant="info" size="lg" onClick={() => handleModeSelect('duo')}>Duo (1 pt)</Button>
            </div>
          )}

          {renderAnswerUI()}

        </Card.Body>
        <Card.Footer>
          {feedback && (
            <Alert variant={feedback.isCorrect ? 'success' : 'danger'}>
              {feedback.isCorrect ? `Correct ! Vous gagnez ${feedback.score} points.` : `Incorrect. La bonne réponse était : ${feedback.correctAnswer}`}
            </Alert>
          )}
          {!feedback && answerMode ? (
            <Button onClick={handleAnswerSubmit} disabled={(answerMode !== 'cash' && selectedAnswer === null) || (answerMode === 'cash' && cashAnswer.trim() === '')}>
              Valider
            </Button>
          ) : feedback ? (
            <Button onClick={handleNextQuestion}>Question Suivante</Button>
          ) : null}
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default QuizPage;
