import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';

const Header: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    };

    window.addEventListener('storage', handleStorageChange);
    handleStorageChange(); // Set initial state

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
      <Container>
        <Navbar.Brand as={Link} to="/">Quizzeo</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" eventKey="1">Accueil</Nav.Link>
            {isLoggedIn ? (
              <>
                <Nav.Link as={Link} to="/create-quiz" eventKey="3">Créer un Quiz</Nav.Link>
                <Nav.Link as={Link} to="/hall-of-fame" eventKey="4">Hall of Fame</Nav.Link>
                <Nav.Link as={Link} to="/my-quizzes" eventKey="8">Mes Quizzs</Nav.Link>
                <Nav.Link onClick={handleLogout} eventKey="5" style={{ cursor: 'pointer' }}>
                  Déconnexion
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" eventKey="6">Connexion</Nav.Link>
                <Nav.Link as={Link} to="/register" eventKey="7">Inscription</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
