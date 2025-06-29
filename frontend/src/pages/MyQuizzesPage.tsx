import React from 'react';
import { Container, Tabs, Tab } from 'react-bootstrap';
import ThemeManager from '../components/ThemeManager';
import QuestionManager from '../components/QuestionManager';
import QuizManager from '../components/QuizManager';

const MyQuizzesPage: React.FC = () => {
    return (
        <Container className="mt-5">
            <h1 className="mb-4 text-center">Gérer les quizzs</h1>
            <Tabs defaultActiveKey="quizzes" id="quiz-management-tabs" className="mb-3" fill>
                <Tab eventKey="themes" title="Thèmes">
                    <ThemeManager />
                </Tab>
                <Tab eventKey="questions" title="Questions">
                    <QuestionManager />
                </Tab>
                <Tab eventKey="quizzes" title="Quizz">
                    <QuizManager />
                </Tab>
            </Tabs>
        </Container>
    );
};

export default MyQuizzesPage;
