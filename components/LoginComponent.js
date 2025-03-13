import React, { useEffect, useState } from 'react';

const LoginComponent = () => {
  const [clientSide, setClientSide] = useState(false);

  useEffect(() => {
    setClientSide(true);
  }, []);

  return (
    <div>
      {/* ...existing code... */}
      {clientSide && (
        <button onClick={handleLogin}>Login</button>
      )}
      {/* ...existing code... */}
    </div>
  );
};

const handleLogin = () => {
  // ...existing code...
};

export default LoginComponent;
