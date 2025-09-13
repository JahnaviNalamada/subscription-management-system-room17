import React from 'react';

function Recommendation({ currentUsage }) {
  const recommendedPlan = currentUsage > 300 ? 'Pro Plan' : 'Basic Plan';

  const message =
    recommendedPlan === 'Pro Plan'
      ? 'Based on your usage, we recommend upgrading to the Pro Plan for more speed and support.'
      : 'Your current usage fits well within the Basic Plan. You can save more by switching.';

  const handleExplore = () => {
    alert(`🔍 Exploring ${recommendedPlan} details...`);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.heading}>🔍 Our Recommendation</h2>
        <div style={styles.card}>
          <p><strong>Suggested Plan:</strong> {recommendedPlan}</p>
          <p>{message}</p>
          <button style={styles.button} onClick={handleExplore}>
            Explore {recommendedPlan}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '60vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: '40px'
  },
  container: {
    width: '100%',
    maxWidth: '500px'
  },
  heading: {
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '24px'
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  button: {
    marginTop: '15px',
    padding: '10px 15px',
    backgroundColor: '#4caf50',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  }
};

export default Recommendation;
