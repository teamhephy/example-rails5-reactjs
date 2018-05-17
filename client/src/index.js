import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
//Remove service worker as create react app’s use of service workers clashes with Rails’ routing
//import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
//registerServiceWorker();
