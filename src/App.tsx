import React from 'react';
import GridContainer from './containers/GridContainer';
import DefaultLayout from './layouts/Default';

import 'intro.js/introjs.css';
import 'intro.js/themes/introjs-dark.css';
import './App.scss';

// Plugins
import './plugins/chart';

function App() {
  return (
    <DefaultLayout>
      <GridContainer></GridContainer>
    </DefaultLayout>
  );
}

export default App;
