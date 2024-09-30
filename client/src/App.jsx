import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import AppRoutes from './routes/AppRoutes'
import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from 'react-toastify';

import "react-toastify/dist/ReactToastify.css";
function App() {

  return (
    <div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <AppRoutes />

    </div>
  )
}

export default App
