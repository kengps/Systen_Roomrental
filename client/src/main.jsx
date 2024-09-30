import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import {Provider} from 'react-redux'
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./service/reducers/index";
import { composeWithDevTools } from "@redux-devtools/extension";

import { HelmetProvider } from "react-helmet-async";

const store = configureStore({reducer: rootReducer},composeWithDevTools)

import { BrowserRouter as Router } from "react-router-dom";
//useParams
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { ToastContainer } from 'react-toastify';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <HelmetProvider>
      <Router>
        
         <QueryParamProvider adapter={ReactRouter6Adapter}>
    
           <App />
        
      </QueryParamProvider>
         
      </Router>
    </HelmetProvider>
  </Provider>
);


// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'

// // import {Provider} from 'react-redux'

// // import { configureStore } from "@reduxjs/toolkit";

// // import rootReducer from "../service/reducers/index";

// // import { composeWithDevTools } from "redux-devtools-extension";

// const store = configureStore({reducer: rootReducer})

// ReactDOM.createRoot(document.getElementById('root')).render(
//   // <Provider store={store}>
//     <App />
//   // </Provider>
  
// )
