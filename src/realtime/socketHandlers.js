import { handleAuth, handleLogin, handleReLogin, handleRegister, handleLogout } from "./handlers/authHandlers";
import { handleSendChat, handleGetChatHistory } from "./handlers/chatHandlers";
import { handleCreateRoom, handleJoinRoom } from "./handlers/roomHandlers";
import { handleGetUserList, handleCheckUserOnline, handleCheckUserExist } from "./handlers/userHandlers";

export const handleSocketMessage = (response, dispatch, socketActions, socketRef, getState) => {
    switch (response.event) {
        case "AUTH":
            handleAuth(response, dispatch);
            break;

        case "LOGIN":
            handleLogin(response, dispatch);
            break;

        case "RE_LOGIN":
            handleReLogin(response, dispatch);
            break;

        case "REGISTER":
            handleRegister(response, dispatch);
            break;

        case "SEND_CHAT":
            handleSendChat(response, dispatch, socketActions, socketRef);
            break;

        case "GET_USER_LIST":
            handleGetUserList(response, dispatch);
            break;

        case "LOGOUT":
            handleLogout(response, dispatch);
            break;

        case "GET_PEOPLE_CHAT_MES":
        case "GET_ROOM_CHAT_MES":
            handleGetChatHistory(response, dispatch);
            break;

        case "CREATE_ROOM":
            handleCreateRoom(response, dispatch, socketActions, socketRef, getState);
            break;

        case "JOIN_ROOM":
            handleJoinRoom(response, dispatch);
            break;

        case "CHECK_USER_ONLINE":
            handleCheckUserOnline(response, dispatch);
            break;

        case "CHECK_USER_EXIST":
            handleCheckUserExist(response, dispatch);
            break;

        default:
            console.warn("Unknown event:", response.event);
            break;
    }
};