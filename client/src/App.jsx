import { ToastContainer } from 'react-toastify'
import './App.css'
import AppRoutes from './routes/AppRoutes'

import "react-toastify/dist/ReactToastify.css"
import { FileUploadProvider } from './service/context/FileUploadContext'


function App() {

  return (
    <div>
      <FileUploadProvider>
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
      </FileUploadProvider>

    </div>
  )
}

export default App
