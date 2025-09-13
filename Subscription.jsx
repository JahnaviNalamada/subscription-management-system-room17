import React, { useState } from 'react';

const plans = {
  Basic: { totalStorage: 100, usedStorage: 40, renewalDate: 'October 10, 2025' },
  Pro: { totalStorage: 500, usedStorage: 250, renewalDate: 'October 15, 2025' },
  Advanced: { totalStorage: 1000, usedStorage: 750, renewalDate: 'October 20, 2025' }
};

function SubscriptionDashboard() {
  const [selectedPlan, setSelectedPlan] = useState('Pro');

  const subscription = plans[selectedPlan];
  const usagePercent = (subscription.usedStorage / subscription.totalStorage) * 100;

  const handleUpgrade = () => alert('🔼 Upgrade flow triggered');
  const handleDowngrade = () => alert('🔽 Downgrade flow triggered');
  const handleCancel = () => alert('❌ Cancel flow triggered');

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h2 style={styles.heading}>📊 My Subscription</h2>

        <div style={styles.card}>
          <label>
            <strong>Select Plan:</strong>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              style={styles.select}
            >
              {Object.keys(plans).map((plan) => (
                <option key={plan} value={plan}>{plan}</option>
              ))}
            </select>
          </label>

          <p><strong>Renewal Date:</strong> {subscription.renewalDate}</p>
          <p><strong>Storage:</strong> {subscription.usedStorage} GB / {subscription.totalStorage} GB</p>

          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${usagePercent}%` }} />
          </div>

          <div style={styles.buttonGroup}>
            <button style={styles.upgrade} onClick={handleUpgrade}>Upgrade</button>
            <button style={styles.downgrade} onClick={handleDowngrade}>Downgrade</button>
            <button style={styles.cancel} onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    padding: '20px'
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
    width: '100%'
  },
  select: {
    margin: '10px 0',
    padding: '8px',
    width: '100%',
    borderRadius: '5px',
    border: '1px solid #ccc'
  },
  progressBar: {
    height: '20px',
    backgroundColor: '#ddd',
    borderRadius: '10px',
    overflow: 'hidden',
    margin: '10px 0'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50'
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    marginTop: '15px'
  },
  upgrade: {
    flex: 1,
    backgroundColor: '#2196f3',
    color: '#fff',
    border: 'none',
    padding: '10px',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  downgrade: {
    flex: 1,
    backgroundColor: '#ffeb3b',
    color: '#000',
    border: 'none',
    padding: '10px',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  cancel: {
    flex: 1,
    backgroundColor: '#f44336',
    color: '#fff',
    border: 'none',
    padding: '10px',
    borderRadius: '5px',
    cursor: 'pointer'
  }
};

export default SubscriptionDashboard;
