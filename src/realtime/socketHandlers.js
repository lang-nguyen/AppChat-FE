import { addMessage, setPeople } from "../state/chat/chatSlice";
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
            // Thêm tin nhắn mới vào danh sách
            dispatch(addMessage(response.data));
            break;

        case "GET_USER_LIST":
            dispatch(setPeople(response.data));
            break;

        default:
            console.warn("Unknown event:", response.event);
            break;
    }
};