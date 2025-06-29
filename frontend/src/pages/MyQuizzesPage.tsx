import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Quiz {
  id: number;
  title: string;
  theme: {
    name: string;
  };
  questionCount: number;
}

const MyQuizzesPage = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You must be logged in to see your quizzes.');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/quizzes/created', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setQuizzes(data);
        } else {
          setError('Failed to fetch quizzes');
        }
      } catch (err) {
        setError('An error occurred while fetching quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mes Quizzs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="border p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold">{quiz.title}</h2>
            <p className="text-gray-600">Theme: {quiz.theme.name}</p>
            <p className="text-gray-600">Questions: {quiz.questionCount}</p>
            <button 
              onClick={() => navigate(`/quiz/${quiz.id}`)} 
              className="mt-4 bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
            >
              Démarrer le quizz
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyQuizzesPage;
