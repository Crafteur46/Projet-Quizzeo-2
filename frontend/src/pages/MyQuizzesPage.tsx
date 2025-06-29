import { Container, Row, Col } from 'react-bootstrap';
import ThemeManager from '../components/ThemeManager';
import QuestionManager from '../components/QuestionManager';
import QuizManager from '../components/QuizManager';



const MyQuizzesPage = () => {

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Espace Créateur</h1>

      <Row className="mb-4">
        <Col md="auto">
          <ThemeManager />
        </Col>
        <Col md="auto">
          <QuestionManager />
        </Col>
        <Col md="auto">
          <QuizManager />
        </Col>
      </Row>
    </Container>
  );
};

export default MyQuizzesPage;
