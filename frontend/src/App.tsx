import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import QuizPage from './pages/QuizPage';
import CreateQuizPage from './pages/CreateQuizPage';
import HallOfFamePage from './pages/HallOfFamePage';
import MyQuizzesPage from './pages/MyQuizzesPage';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/quiz/:id" element={<QuizPage />} />
          <Route path="/create-quiz" element={<CreateQuizPage />} />
          <Route path="/hall-of-fame" element={<HallOfFamePage />} />
            <Route path="/my-quizzes" element={<MyQuizzesPage />} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;
