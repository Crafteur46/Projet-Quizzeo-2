import React, { useState } from 'react';
import './CreateQuizPage.css';

interface QuizFormData {
  themeId: number;
  questions: number[];
}

const CreateQuizPage: React.FC = () => {
  const [formData, setFormData] = useState<QuizFormData>({
    themeId: 0,
    questions: []
  });
  const [themes, setThemes] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Charger les thèmes disponibles
  React.useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await fetch('/api/themes');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setThemes(data);
      } catch (err) {
        console.error('Error fetching themes:', err);
      }
    };
    fetchThemes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create quiz');
      }

      setSuccess('Quiz created successfully!');
      setFormData({ themeId: 0, questions: [] });
    } catch (err: any) {
      setError(err.message || 'Error creating quiz. Please try again.');
    }
  };

  const handleThemeChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const themeId = parseInt(e.target.value);
    setFormData(prev => ({ ...prev, themeId, questions: [] }));

    if (isNaN(themeId) || !themeId) {
        setQuestions([]);
        return;
    }

    try {
        const response = await fetch(`/api/questions?themeId=${themeId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch questions');
        }
        const data = await response.json();
        setQuestions(data);
    } catch (err) {
        console.error('Error fetching questions:', err);
        setQuestions([]);
    }
  };

  const handleQuestionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const questionId = parseInt(e.target.value);
    if (!formData.questions.includes(questionId)) {
      setFormData(prev => ({
        ...prev,
        questions: [...prev.questions, questionId]
      }));
    }
  };

  return (
    <div className="create-quiz-container">
      <h2>Create a new Quiz</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <form onSubmit={handleSubmit} className="quiz-form">
        <div className="form-group">
          <label htmlFor="theme">Select Theme:</label>
          <select
            id="theme"
            value={formData.themeId}
            onChange={handleThemeChange}
            required
          >
            <option value="">Select a theme</option>
            {themes.map(theme => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Available Questions:</label>
          <select
            onChange={handleQuestionChange}
            required
          >
            <option value="">Select a question</option>
            {questions.map(question => (
              <option key={question.id} value={question.id}>
                {question.label}
              </option>
            ))}
          </select>
        </div>

        <div className="selected-questions">
          <h3>Selected Questions:</h3>
          <ul>
            {formData.questions.map(id => (
              <li key={id}>
                {questions.find(q => q.id === id)?.label}
              </li>
            ))}
          </ul>
        </div>

        <button type="submit" className="submit-btn">Create Quiz</button>
      </form>
    </div>
  );
};

export default CreateQuizPage;
