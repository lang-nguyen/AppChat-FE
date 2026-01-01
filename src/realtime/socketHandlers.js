import { addMessage, setPeople, setChatHistory, setOnlineStatus } from "../state/chat/chatSlice";
import { setUser, setError, clearError, setRegisterSuccess } from "../state/auth/authSlice";

export const handleSocketMessage = (response, dispatch) => {
    switch (response.event) {
        case "LOGIN":
        case "RE_LOGIN": {
            if (response.status === "success") {
                if (response.data?.RE_LOGIN_CODE) {
                    localStorage.setItem("re_login_code", response.data.RE_LOGIN_CODE);
                    localStorage.setItem("user_name", response.data.user || "User");
                }
                dispatch(setUser(response.data));
                dispatch(clearError());
            } else {
                dispatch(setError(response.mes || "Đăng nhập thất bại"));
            }
            break;
        }

        case "REGISTER": {
            if (response.status === "success") {
                dispatch(setRegisterSuccess(true));
                dispatch(clearError());
            } else {
                dispatch(setRegisterSuccess(false));
                dispatch(setError(response.mes || "Đăng ký lỗi"));
            }
            break;
        }

        case "SEND_CHAT":
            dispatch(addMessage(response.data));
            break;

        case "GET_USER_LIST":
            dispatch(setPeople(response.data));
            break;

        case "GET_PEOPLE_CHAT_MES":
        case "GET_ROOM_CHAT_MES":
            dispatch(setChatHistory({
                messages: Array.isArray(response.data) ? response.data : [],
                page: response.page || 1
            }));
            break;

        case "CREATE_ROOM":
        case "JOIN_ROOM":
            if (response.status === 'success') {
            }
            break;

        case "CHECK_USER_ONLINE":
            if (response.status === 'success' && response.data) {
                dispatch(setOnlineStatus({
                    user: response.data.user,
                    isOnline: response.data.status
                }));
            }
            break;

        case "CHECK_USER_EXIST":
            if (response.status === 'success') {
                console.log("Check User Exist: Tồn tại", response.data);
            } else {
                dispatch(setError("Người dùng không tồn tại hoặc lỗi kiểm tra."));
            }
            break;

        default:
            console.warn("Unknown event:", response.event);
            break;
    }
};