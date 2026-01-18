import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
//import './assets/styles.css' // Tạm thời đóng dòng này lại để tránh lỗi thiếu file css

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)