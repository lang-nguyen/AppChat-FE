// Xử lý tin nhắn đến
export const handleSocketMessage = (response, dispatchers) => {
    // dispatchers là một object chứa các hàm setState từ Context truyền qua
    const { setMessages, setPeople, setUser, setError, setRegisterSuccess } = dispatchers;

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

                setUser({
                    ...response.data, // Copy tất cả những gì server trả về
                    name: currentName // bo sung name
                });

                setError("");
            } else {
                setError(response.mes || "Đăng nhập thất bại");
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
                setUser({
                    ...response.data,
                    name: serverUser || localUser || "User"
                });

                setError("");
            } else {
                console.log("Re-login thất bại, mã hết hạn hoặc lỗi.");
                localStorage.removeItem('re_login_code');
                setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
                // Đảm bảo user là null để PrivateRoute đá về Login
                setUser(null);
            }
            break;

        case "REGISTER":
            if (response.status === "success") {
                // Set state báo đăng ký thành công
                if (setRegisterSuccess) setRegisterSuccess(true);
            } else {
                setError(response.mes || "Đăng ký lỗi");
                if (setRegisterSuccess) setRegisterSuccess(false);
            }
            break;

        case "SEND_CHAT":
            // Thêm tin nhắn mới vào danh sách
            setMessages((prev) => [...prev, response.data]);
            break;

        case "GET_USER_LIST":
            setPeople(response.data);
            break;

        case "LOGOUT":
            // Xóa thông tin đăng nhập local
            localStorage.removeItem('re_login_code');
            localStorage.removeItem('user_name');
            // Reset state user về null để kích hoạt chuyển hướng
            setUser(null);
            setMessages([]); // Clear tin nhắn cũ
            break;

        case "CHECK_USER_EXIST":
            if (dispatchers.setCheckUserResult) {
                dispatchers.setCheckUserResult(response.data);
            }
            break;

        default:
            console.warn("Unknown event:", response.event);
            break;
    }
};