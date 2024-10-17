import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer style={{
      borderTop: '1px solid #ddd',
      padding: '20px 0',
      boxShadow: '0 -2px 5px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
    }}>
      <Container>
        <p style={{ margin: '0' }}>
          <strong>Contact Us:</strong> <a href="mailto:contact@example.com">contact@example.com</a>
        </p>
        <p style={{ margin: '0' }}>
          <strong>Phone:</strong> +123 456 7890
        </p>
        <p style={{ margin: '0' }}>
          <strong>Address:</strong> 123 Movie St, Film City, FC 45678
        </p>
        <p style={{ margin: '0', fontSize: 'smaller' }}>
          &copy; {new Date().getFullYear()} Brio. All rights reserved.
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
