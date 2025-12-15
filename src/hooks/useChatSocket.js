import {useEffect, useRef, useState} from 'react';

const WS_URL = 'wss://chat.longapp.site/chat/chat';

export const useChatSocket = ()=>{
    const socketRef = useRef(null); // luu ket noi

    const [messages, setMessages] = useState([]); // list tin nhan
    const [isReady, setIsReady] = useState(false); // trang thai ket noi

    useEffect(()=>{
        // 1. Tao ket noi WebSocket
        const socket = new WebSocket(WS_URL);
        socketRef.current = socket;

        // khi ket noi thanh cong
        socket.onopen = ()=>{
            console.log('WebSocket da ket noi');
            setIsReady(true)
        };

        // 2. Lang nghe tin nhan tu server
        socket.onmessage = (event)=>{
            const response = JSON.parse(event.data); // String -> Object
            console.log('Tin nhan moi:', response);
            setMessages((prev) => [...prev, response]);
        };

        // Khi mat ket noi
        socket.onclose = ()=>{
            console.log('WebSocket da ngat ket noi');
            setIsReady(false);
        };

        return ()=>{
            socket.close();
        };
    }, []);

    // 3. Ham gui tin nhan
    const sendData = (eventName, dataPayload)=>{
        if(socketRef.current && socketRef.current.readyState === WebSocket.OPEN){
            const payload = {
                action: "onchat",
                data: {
                    event: eventName,
                    data: dataPayload
                }
            };
            socketRef.current.send(JSON.stringify(payload)); // Object -> String
        }else{
            console.error('WebSocket chua san sang de gui tin nhan');
        }
    };
    return {isReady, messages, sendData};
};