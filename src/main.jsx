import { createRoot } from 'react-dom/client'
import { Provider } from './store.jsx'
import App from './App.jsx'
import './styles.css'
createRoot(document.getElementById('root')).render(<Provider><App /></Provider>)
