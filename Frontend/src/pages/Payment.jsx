import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import qrCode from "../assets/qr_code.png";

function PaymentPortal() {
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setPaymentSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    }, 15000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', borderRadius: '8px', background: '#fff', color: '#000', textAlign: 'center' }}>
      <h2>Payment Portal</h2>
      {!paymentSuccess ? (
        <>
          <p>Scan the QR code below to complete your payment:</p>
          <div style={{ margin: '20px 0' }}>
            <img src={ qrCode } alt="QR Code" style={{ width: '200px', height: '200px' }} />
          </div>
          <p>Waiting for payment confirmation...</p>
        </>
      ) : (
        <p style={{ color: 'green', fontWeight: 'bold' }}>
          Payment Successful! Redirecting to homepage...
        </p>
      )}
    </div>
  );
}

export default PaymentPortal;
