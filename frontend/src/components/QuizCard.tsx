import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';

interface QuizCardProps {
  id: number;
  title: string;
  theme: string;
  creator: string;
  questionCount: number;
}

const QuizCard: React.FC<QuizCardProps> = ({ id, title, theme, creator, questionCount }) => {
  return (
    <Card className="h-100">
      <Card.Body className="d-flex flex-column">
        <Card.Title>{title}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">Thème : {theme}</Card.Subtitle>
        <Card.Text>
          Créé par : {creator}<br />
          {questionCount} questions
        </Card.Text>
        <Link to={`/quiz/${id}`} className="mt-auto d-block w-100">
          <Button variant="primary" className="w-100">Commencer le Quiz</Button>
        </Link>
      </Card.Body>
    </Card>
  );
};

export default QuizCard;
