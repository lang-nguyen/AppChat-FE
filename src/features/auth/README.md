# Auth Module Documentation

Document này mô tả cấu trúc và luồng dữ liệu của module `Auth` (Đăng nhập/Đăng ký).

## 📂 Cấu trúc thư mục

Module được chia theo kiến trúc **Separation of Concerns** (Phân tách trách nhiệm):

| Thư mục | Vai trò | Ví dụ |
|:---|:---|:---|
| **`pages/`** | **Router Targets**: Chứa các trang chính, được gọi bởi `App.jsx`. Chỉ chịu trách nhiệm bố cục (Layout) và gọi Form. | `LoginPage`, `RegisterPage` |
| **`login/`** | **Feature Login**: Chứa toàn bộ logic và UI của tính năng đăng nhập. | `LoginForm`, `LoginFields`, ... |
| **`register/`** | **Feature Register**: Chứa toàn bộ logic và UI của tính năng đăng ký. | `RegisterForm`, `RegisterFields`, ... |
| **`hooks/`** | **Logic Layer**: Custom Hooks quản lý State, Validation và Logic nghiệp vụ. | `useAuthForm` |
| **`services/`** | **API Layer**: Tầng giao tiếp với Server (Socket/REST). Component không gọi trực tiếp Socket. | `authService` |
| **`components/`** | **Shared UI**: Các component dùng chung cho cả Login và Register. | `SocketStatus`, `AuthError` |

---

## 🔄 Luồng dữ liệu (Data Flow)

Để dễ debug, hãy đi theo luồng dữ liệu sau:

1.  **UI Event**: Người dùng bấm "Đăng nhập" tại `LoginForm`.
2.  **Hook**: `useAuthForm` bắt sự kiện -> Validate dữ liệu.
3.  **Service**: Nếu OK, Hook gọi `authService.login()`.
4.  **Socket**: Service gọi `socketActions.login()`.
5.  **Response**: Socket nhận phản hồi -> Update Context -> Hook nhận State mới -> UI cập nhật.

## 🛠 Cách Debug

- **Lỗi hiển thị**: Kiểm tra trong folder `login/components` hoặc `register/components`.
- **Lỗi logic form (không gõ được, validate sai)**: Kiểm tra `hooks/useAuthForm.js`.
- **Lỗi gọi server (không gửi được req)**: Kiểm tra `services/authService.js`.
