// import React, { Component } from 'react';
// import { Navbar, NavbarBrand } from 'reactstrap';
// import logo from './logo.png';

// class HeaderNavigation extends Component {
//   render() {
//     return (
//       <Navbar href="/">
//         <NavbarBrand>
//           <img alt="" src={logo} />
//         </NavbarBrand>
//       </Navbar>
//     );
//   }
// }

// export default HeaderNavigation;

import React from 'react';
import { Navbar, NavbarBrand } from 'reactstrap';

function HeaderNavigation() {
  return (
    <Navbar className="bg-primary" dark expand="md">
      <NavbarBrand href="/" className="text-white">
        📝 Notes App
      </NavbarBrand>
    </Navbar>
  );
}

export default HeaderNavigation;
