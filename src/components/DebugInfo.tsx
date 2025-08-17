import React from 'react';

const DebugInfo: React.FC = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: '#f0f0f0', 
      padding: '10px', 
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000
    }}>
      <strong>Debug Info:</strong><br/>
      API URL: {apiUrl}<br/>
      Environment: {import.meta.env.MODE}<br/>
      <button 
        onClick={async () => {
          try {
            const response = await fetch(`${apiUrl}/reports/financial-data?year=2025&month=`);
            const data = await response.json();
            console.log('API Response:', data);
            alert('Check console for API response');
          } catch (error) {
            console.error('API Error:', error);
            alert('API Error: ' + error.message);
          }
        }}
        style={{ marginTop: '5px', padding: '2px 5px' }}
      >
        Test API
      </button>
    </div>
  );
};

export default DebugInfo;
