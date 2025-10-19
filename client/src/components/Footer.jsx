import React, { useEffect, useState } from 'react';

function Footer() {
  const [version, setVersion] = useState('');

  useEffect(() => {
    fetch('/api/version')
      .then((res) => res.json())
      .then((data) => setVersion(data.version))
      .catch(() => setVersion('unknown'));
  }, []);

  return (
    <footer className="text-center py-3 mt-5 border-top">
      <small className="text-muted">Notes App v{version}</small>
    </footer>
  );
}

export default Footer;
