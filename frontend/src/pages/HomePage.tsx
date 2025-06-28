import React from 'react';
import QuizCard from '../components/QuizCard';

const HomePage: React.FC = () => {
  return (
    <div>
      <h2>Available Quizzes</h2>
      <div className="quiz-list">
        {/* This will be populated with data from the API */}
        <QuizCard title="React Basics" theme="Programming" creator="Admin" />
      </div>
    </div>
  );
};

export default HomePage;
