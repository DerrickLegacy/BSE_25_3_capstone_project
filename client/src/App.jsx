// import React, { Component } from 'react';
// import { Container } from 'reactstrap';

// import HeaderNavigation from './components/HeaderNavigation';
// import ConnectedSearch from './components/Search';

// import './index.css';

// class App extends Component {
//   render() {
//     return (
//       <div className="App my-4">
//         <Container>
//           <HeaderNavigation />
//           <ConnectedSearch className="jumbotron" />
//         </Container>
//       </div>
//     );
//   }
// }

// export default App;

import React from 'react';
import { Container } from 'reactstrap';

import HeaderNavigation from './components/HeaderNavigation';
import ConnectedSearch from './components/Search';

import './index.css';

function App() {
  return (
    <div className="App my-4">
      <Container>
        <HeaderNavigation />
        <ConnectedSearch className="jumbotron" />
      </Container>
    </div>
  );
}

export default App;
