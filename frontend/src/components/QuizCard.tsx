import React from 'react';

interface QuizCardProps {
  title: string;
  theme: string;
  creator: string;
}

const QuizCard: React.FC<QuizCardProps> = ({ title, theme, creator }) => {
  return (
    <div className="quiz-card">
      <h3>{title}</h3>
      <p>Theme: {theme}</p>
      <p>Created by: {creator}</p>
      <button>Start Quiz</button>
    </div>
  );
};

export default QuizCard;
