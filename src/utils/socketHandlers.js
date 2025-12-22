// Xử lý tin nhắn đến
export const handleSocketMessage = (response, dispatchers) => {
    // dispatchers là một object chứa các hàm setState từ Context truyền qua
    const { setMessages, setPeople, setUser, setError, setRegisterSuccess} = dispatchers;

    switch (response.event) {
        case "LOGIN":
        case "RE_LOGIN":
            if (response.status === "success") {
                if (response.data?.RE_LOGIN_CODE) {
                    localStorage.setItem('re_login_code', response.data.RE_LOGIN_CODE);
                    localStorage.setItem('user_name', response.data.user || "User");
                    setUser(response.data); // đã login
                    setError("");
                }
            } else {
                setError(response.mes || "Đăng nhập thất bại");
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

        default:
            console.warn("Unknown event:", response.event);
            break;
    }
};