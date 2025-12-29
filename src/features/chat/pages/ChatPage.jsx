import { useSocket } from "../../../app/providers/SocketProvider.jsx";
import { useState } from "react";
import styles from "./ChatPage.module.css";

const ChatPage = () => {
    const { isReady } = useSocket();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className={styles["chat-container"]}>
            <div className={`${styles["chat-sidebar"]} ${sidebarOpen ? styles.open : ""}`}>
                Sidebar ({isReady ? "Online" : "Offline"})
                <button onClick={() => setSidebarOpen((v) => !v)}>Toggle</button>
            </div>

            <div className={styles["chat-main"]}>Main</div>
        </div>
    );
};

export default ChatPage;