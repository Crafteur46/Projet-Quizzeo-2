import React, { useEffect, useState } from 'react';
import { Container, Table, Spinner, Alert, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

interface HallOfFameEntry {
  email: string;
  score: number;
}

const HallOfFamePage: React.FC = () => {
  const [scores, setScores] = useState<HallOfFameEntry[]>([]);
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
        setScores(data);
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

          {!loading && !error && (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Email</th>
                  <th>Score Total</th>
                </tr>
              </thead>
              <tbody>
                {scores.length > 0 ? (
                  scores.map((entry, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{entry.email}</td>
                      <td>{entry.score}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center">Aucun score enregistré pour le moment.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default HallOfFamePage;
