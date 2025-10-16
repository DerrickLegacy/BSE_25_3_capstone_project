/* eslint-disable prettier/prettier */
// React VersionFooter component
import { useEffect, useState } from 'react';

function Footer() {
    const [version, setVersion] = useState('');

    useEffect(() => {
        fetch('/version.json')
            // eslint-disable-next-line prettier/prettier
            .then((res) => {
                console.log(res.json)
            })
            .then((data) => setVersion(data.version))
            .catch(() => setVersion('staging-unknown'));
    }, []);

    return <footer>Version: {version}</footer>;
}

export default Footer;
