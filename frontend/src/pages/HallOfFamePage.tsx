import React, { useEffect, useState } from 'react';
import { Container, Table, Spinner, Alert, Card, Button, Accordion } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// New interfaces to match the updated backend response
interface QuizScore {
  quizId: number;
  quizTitle: string;
  score: number;
}

interface HallOfFameEntry {
  userId: number;
  email: string;
  scores: QuizScore[];
}

const HallOfFamePage: React.FC = () => {
  // State updated to use the new interface
  const [hallOfFameData, setHallOfFameData] = useState<HallOfFameEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    const fetchHallOfFame = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3001/api/quizzes/hall-of-fame/global', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('La récupération du Hall of Fame a échoué');
        }

        const data = await response.json();
        setHallOfFameData(data); // Set the new data structure
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchHallOfFame();
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <Container className="mt-5 text-center">
        <Card className="p-4">
          <Card.Body>
            <Card.Title as="h2">Accès non autorisé</Card.Title>
            <Card.Text>
              Vous devez être connecté pour voir le Hall of Fame.
            </Card.Text>
            <Link to="/login">
              <Button variant="primary" className="me-2">Connexion</Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary">Inscription</Button>
            </Link>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header as="h2" className="text-center">Hall of Fame</Card.Header>
        <Card.Body>
          {loading && (
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Chargement...</span>
              </Spinner>
            </div>
          )}

          {error && <Alert variant="danger">{error}</Alert>}

          {!loading && !error &&
            (hallOfFameData.length > 0 ? (
              <Accordion defaultActiveKey="0">
                {hallOfFameData.map((entry, index) => (
                  <Accordion.Item eventKey={String(index)} key={entry.userId}>
                    <Accordion.Header>
                      <span className="fw-bold me-3">#{index + 1}</span>
                      {entry.email}
                    </Accordion.Header>
                    <Accordion.Body>
                      <Table striped bordered hover responsive size="sm">
                        <thead>
                          <tr>
                            <th>Titre du Quiz</th>
                            <th>Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entry.scores.map((quizScore) => (
                            <tr key={quizScore.quizId}>
                              <td>
                                <Link to={`/quizzes/${quizScore.quizId}`}>{quizScore.quizTitle}</Link>
                              </td>
                              <td>{quizScore.score}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            ) : (
              <div className="text-center">Aucun score enregistré pour le moment.</div>
            ))}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default HallOfFamePage;
