import ChatPage from './features/chat/ChatPage.jsx';
import LoginPage from './features/auth/LoginPage.jsx';
import RegisterPage from './features/auth/RegisterPage.jsx';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function App() {
    return (
        <BrowserRouter>
            {/* Thanh menu cố định */}
            <nav style={{ padding: 10, background: '#eee', marginBottom: 20 }}>
                <Link to="/" style={{ marginRight: 20 }}>Home (Login)</Link>
                <Link to="/chat">Chat Room</Link>
            </nav>

            {/* Khu vực thay đổi nội dung trang */}
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/chat" element={<ChatPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App