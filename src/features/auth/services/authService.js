// Service Layer for Auth
// Giúp tách biệt logic gọi API/Socket khỏi Component
// Sau này nếu muốn đổi từ Socket sang REST API thì chỉ cần sửa file này

export const authService = {
    login: (actions, username, password) => {
        // Có thể thêm logic logging hoặc transform data ở đây
        actions.login(username, password);
    },

    register: (actions, username, password) => {
        actions.register(username, password);
    }
};
