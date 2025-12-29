import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/theme.css'
import App from './app/App.jsx'
import {SocketProvider} from './app/providers/SocketProvider.jsx';
import { Provider } from 'react-redux';
import { store } from './app/store';


createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <SocketProvider>
      <App />
    </SocketProvider>
  </Provider>,
)
