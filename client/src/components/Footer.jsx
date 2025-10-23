import React, { useEffect, useState } from 'react';

function Footer() {
  const [version, setVersion] = useState('');

  useEffect(() => {
    fetch('/api/application-version')
      .then((res) => res.json())
      .then((data) => {
        const lastVersion = data.versions[data.versions.length - 1];
        console.log('Last App Version:', lastVersion);
        setVersion(lastVersion);
      })
      .catch((err) => {
        console.error('Error fetching version:', err);
        setVersion('unknown');
      });
  }, []);

  return (
    <footer className="text-center py-3 mt-5 border-top">
      <small className="text-muted">
        Notes AppLatest Version - <strong>{version}</strong>{' '}
      </small>
    </footer>
  );
}

export default Footer;
