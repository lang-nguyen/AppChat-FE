
import { setUser, setError, clearError, setRegisterSuccess } from "../state/auth/authSlice";

import { addMessage, setPeople, setMessages, setChatHistory, setOnlineStatus, updateRoomData, clearPendingRoomCreation } from "../state/chat/chatSlice";

// Xử lý tin nhắn đến
export const handleSocketMessage = (response, dispatch, socketActions, socketRef, getState) => {
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
            console.log("SEND_CHAT response:", response);
            dispatch(addMessage(response.data));
            // Nếu gửi tin nhắn thành công, tự động refresh danh sách user
            // (để cập nhật danh sách ngay sau khi gửi contact request)
            if (response.status === 'success' || response.status === true) {
                console.log("SEND_CHAT thành công, tự động refresh danh sách user");
                // Delay để đảm bảo server đã cập nhật
                setTimeout(() => {
                    socketActions.getUserList(socketRef);
                }, 500);
                // Gọi thêm lần nữa sau 1.5s để đảm bảo
                setTimeout(() => {
                    socketActions.getUserList(socketRef);
                }, 1500);
            }
            break;

        case "GET_USER_LIST":
            if (response.status === 'success' && Array.isArray(response.data)) {
                dispatch(setPeople(response.data));
            } else {
                // Nếu lỗi (chưa login), không set để tránh overwrite list cũ
                console.warn("GET_USER_LIST thất bại:", response.mes || response.status);
            }
            break;

        case "LOGOUT":
            // Xóa thông tin đăng nhập local
            localStorage.removeItem('re_login_code');
            localStorage.removeItem('user_name');
            // Reset state user về null để kích hoạt chuyển hướng
            dispatch(setUser(null));
            dispatch(setMessages([])); // Clear tin nhắn cũ
            dispatch(setPeople([]));// Clear danh sách user
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
            console.log("Nhận response từ CREATE_ROOM:", response);
            if (response.status === 'success') {
                // Lấy thông tin tạo nhóm đang chờ từ Redux
                const state = getState ? getState() : null;
                const pendingRoom = state?.chat?.pendingRoomCreation;
                
                if (pendingRoom) {

                    console.log("Thông tin pending room:", pendingRoom);

                    const { roomName, selectedUsers, currentUserName } = pendingRoom;
                    
                    // 1. Join bản thân vào phòng
                    socketActions.joinRoom(socketRef, roomName);
                    console.log("Đã join bản thân vào phòng:", roomName);
                    
                    // 2. Join từng user đã chọn vào phòng
                    console.log("Đã join từng user đã chọn vào phòng:", selectedUsers);
                    selectedUsers.forEach((username) => {
                        socketActions.joinRoom(socketRef, roomName);
                    });
                    
                    // 3. Tạo và gửi tin nhắn thông báo
                    const userListText = selectedUsers.length > 0 
                        ? selectedUsers.join(', ') 
                        : 'không có ai';
                    const notificationMessage = `${currentUserName} đã tạo nhóm và thêm ${userListText} vào nhóm`;
                    
                    // Delay một chút để đảm bảo join xong
                    setTimeout(() => {
                        socketActions.sendChat(socketRef, roomName, notificationMessage, "room");
                    }, 500);
                    
                    // 4. Clear pending room creation
                    dispatch(clearPendingRoomCreation());
                }
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
            // response.status: 'success' chỉ cho biết request thành công
            // response.data.status: true/false mới cho biết user có tồn tại không
            console.log("Check User Exist - Full response:", response);
            const userExists = response.data?.status === true || response.data?.status === 'true';
            
            if (userExists) {
                console.log("Check User Exist: Tồn tại", response.data);
                // Nếu có callback pending cho contact check, gọi onSuccess
                if (window.__pendingContactCheck) {
                    // Kiểm tra username match hoặc không cần match (vì chỉ check 1 user tại 1 thời điểm)
                    const pendingCheck = window.__pendingContactCheck;
                    window.__pendingContactCheck = null; // Clear ngay để tránh gọi lại
                    pendingCheck.onSuccess();
                }
            } else {
                console.log("Check User Exist: Không tồn tại", response.data?.status, response.mes);
                // Nếu có callback pending cho contact check, gọi onError
                if (window.__pendingContactCheck) {
                    const pendingCheck = window.__pendingContactCheck;
                    window.__pendingContactCheck = null; // Clear ngay để tránh gọi lại
                    pendingCheck.onError();
                } else {
                    dispatch(setError("Người dùng không tồn tại hoặc lỗi kiểm tra."));
                }
            }
            break;

        default:
            console.warn("Unknown event:", response.event);
            break;
    }
};