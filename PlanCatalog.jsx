import React from 'react';

function PlanCatalog() {
  const plans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: '₹299/month',
      speed: 'Standard Speed',
      data: '100 GB',
      users: 'Single User',
      support: 'Email Support',
      color: '#f0f0f0'
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: '₹499/month',
      speed: 'High Speed',
      data: '500 GB',
      users: 'Multiple Users',
      support: '24/7 Support',
      color: '#e0f7fa'
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: '₹799/month',
      speed: 'Ultra Speed',
      data: '1 TB',
      users: 'Unlimited Users',
      support: 'Priority Support',
      color: '#fff3e0'
    }
  ];

  const handleSelect = (planName) => {
    alert(`🎯 You selected the ${planName}`);
  };

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>📦 Plan Catalog</h2>
      <div style={styles.grid}>
        {plans.map(plan => (
          <div key={plan.id} style={{ ...styles.card, backgroundColor: plan.color }}>
            <h3>{plan.name}</h3>
            <p style={styles.price}>{plan.price}</p>
            <ul style={styles.features}>
              <li><strong>Speed:</strong> {plan.speed}</li>
              <li><strong>Data:</strong> {plan.data}</li>
              <li><strong>Users:</strong> {plan.users}</li>
              <li><strong>Support:</strong> {plan.support}</li>
            </ul>
            <button style={styles.button} onClick={() => handleSelect(plan.name)}>
              Select Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    padding: '40px',
    backgroundColor: '#f9f9f9',
    fontFamily: 'Arial, sans-serif'
  },
  heading: {
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '26px'
  },
  grid: {
    display: 'flex',
    gap: '30px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  card: {
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '280px',
    textAlign: 'center'
  },
  price: {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '10px 0'
  },
  features: {
    listStyleType: 'none',
    padding: 0,
    marginBottom: '15px',
    textAlign: 'left'
  },
  button: {
    padding: '10px 15px',
    backgroundColor: '#2196f3',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  }
};

export default PlanCatalog;
