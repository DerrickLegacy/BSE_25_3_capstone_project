import React from 'react';
import { Navbar, NavbarBrand } from 'reactstrap';
import logo from './logo.png';

function HeaderNavigation() {
  return (
    <Navbar href="/">
      <NavbarBrand>
        <img alt="" src={logo} />
      </NavbarBrand>
    </Navbar>
  );
}

export default HeaderNavigation;
