
import { setUser, setError, clearError, setRegisterSuccess } from "../state/auth/authSlice";
import { addMessage, setPeople, setMessages, setChatHistory, setOnlineStatus, updateRoomData } from "../state/chat/chatSlice";

// Xử lý tin nhắn đến
export const handleSocketMessage = (response, dispatch) => {
    switch (response.event) {
        case "AUTH":
            // Server bao loi authen, co the do goi API can login ma user chua login
            console.warn("Authentication Error:", response.mes);
            break;

        case "LOGIN":
            if (response.status === "success") {
                console.log("Đăng nhập thành công, Code:", response.data?.RE_LOGIN_CODE);

                // luu code vao localStorage
                if (response.data.RE_LOGIN_CODE) {
                    localStorage.setItem('re_login_code', response.data.RE_LOGIN_CODE);
                }
                // lay user name da luu o localStorage
                const currentName = localStorage.getItem('user_name') || "User";

                dispatch(setUser({
                    ...response.data, // Copy tất cả những gì server trả về
                    name: currentName // bo sung name
                }));

                dispatch(clearError());
            } else {
                dispatch(setError(response.mes || "Đăng nhập thất bại"));
            }
            break;

        case "RE_LOGIN":
            if (response.status === "success") {
                if (response.data?.RE_LOGIN_CODE) {
                    localStorage.setItem('re_login_code', response.data.RE_LOGIN_CODE);
                }

                // Ưu tiên lấy tên từ Server trả về, nếu không có thì giữ nguyên tên cũ trong LocalStorage
                const serverUser = response.data.user;
                const localUser = localStorage.getItem('user_name');

                // Chỉ cập nhật vào storage nếu server thực sự trả về tên mới
                if (serverUser) {
                    localStorage.setItem('user_name', serverUser);
                }
                // Set State (Kết hợp dữ liệu server và tên đang có)
                // Dùng (serverUser || localUser) để đảm bảo không bị mất tên
                dispatch(setUser({
                    ...response.data,
                    name: serverUser || localUser || "User"
                }));

                dispatch(clearError());
            } else {
                console.log("Re-login thất bại, mã hết hạn hoặc lỗi.");
                localStorage.removeItem('re_login_code');
                dispatch(setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."));
                // Đảm bảo user là null để PrivateRoute đá về Login
                dispatch(setUser(null));
            }
            break;

        case "REGISTER": {
            if (response.status === "success") {
                // Set state báo đăng ký thành công
                dispatch(setRegisterSuccess(true));
            } else {
                dispatch(setError(response.mes || "Đăng ký lỗi"));
                dispatch(setRegisterSuccess(false));
            }
            break;
        }

        case "SEND_CHAT":
            // Không log để tránh spam console
            dispatch(addMessage(response.data));
            break;

        case "GET_USER_LIST":
            dispatch(setPeople(response.data));
            break;


        case "LOGOUT":
            // Xóa thông tin đăng nhập local
            localStorage.removeItem('re_login_code');
            localStorage.removeItem('user_name');
            // Reset state user về null để kích hoạt chuyển hướng
            dispatch(setUser(null));
            dispatch(setMessages([])); // Clear tin nhắn cũ
            break;

        case "GET_PEOPLE_CHAT_MES":
        case "GET_ROOM_CHAT_MES": {
            if (response.status !== 'success') {
                console.error(`[Socket] Lấy lịch sử chat thất bại (${response.event}):`, response.mes);
                return;
            }

            // Server không trả về page number cho event này, nên lấy từ Redux state hoặc biến global
            const currentPage = window.__chatPendingPage || 1;

            // Phân tách dữ liệu: 1-1 trả về mảng trực tiếp, Room trả về object chứa chatData
            let messages = [];
            if (response.event === "GET_ROOM_CHAT_MES") {
                messages = Array.isArray(response.data?.chatData) ? response.data.chatData : [];

                // Cập nhật thông tin phòng (thành viên, trưởng nhóm)
                if (response.data?.name && (response.data?.userList || response.data?.own)) {
                    dispatch(updateRoomData({
                        name: response.data.name,
                        own: response.data.own,
                        userList: response.data.userList
                    }));
                }
            } else {
                // People Chat (1-1) thường trả về mảng messages trực tiếp
                messages = Array.isArray(response.data) ? response.data : [];
            }

            console.log(`[Socket] Nhận lịch sử chat (${response.event}) - Page: ${currentPage}, Count: ${messages.length}`);

            dispatch(setChatHistory({
                messages,
                page: currentPage
            }));
            break;
        }

        case "CREATE_ROOM":
            if (response.status === 'success') {
                console.log(`[Socket] Tạo phòng thành công:`, response.data);
            } else {
                console.error(`[Socket] Tạo phòng thất bại:`, response.mes);
            }
            break;

        case "JOIN_ROOM":
            if (response.status === 'success') {
                console.log(`[Socket] Join phòng thành công:`, response.data);
                // Cập nhật danh sách thành viên
                if (response.data?.name && (response.data?.userList || response.data?.own)) {
                    dispatch(updateRoomData({
                        name: response.data.name,
                        own: response.data.own,
                        userList: response.data.userList
                    }));
                }
            } else {
                console.error(`[Socket] Join phòng thất bại:`, response.mes);
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