# LangChat — Realtime Web Chat (Frontend)

LangChat là một web chat realtime. Repo này là phần **Front-end (FE)**, mục tiêu là xây UI chat + kiến trúc code rõ ràng để dễ mở rộng (auth, room, nhắn tin 1-1, phân trang lịch sử chat, reconnect).

FE giao tiếp với Backend bằng **WebSocket (WSS)** theo cơ chế **event-based**: client gửi “event + payload”, server phản hồi theo event tương ứng.

---

## Công nghệ sử dụng
- **React**: `19.2.0`
- **React DOM**: `19.2.0`
- **Vite**: `7.2.4`

> Phiên bản lấy từ `package.json`.

---

## Backend Realtime API (WebSocket)
### Endpoint
- **WSS URL**: `wss://chat.longapp.site/chat/chat`

### “API format” (cấu trúc JSON chuẩn khi gửi)
Mọi request từ FE → BE đều bọc trong 1 cấu trúc JSON thống nhất:

```json
{
  "action": "onchat",
  "data": {
    "event": "EVENT_NAME",
    "data": {}
  }
}
```

#### Ý nghĩa từng trường
- **action**: tên “channel/handler” phía server. Hiện tại luôn là `"onchat"`.
- **data**: phần nội dung request.
  - **data.event**: tên sự kiện cần thực hiện (ví dụ: `LOGIN`, `REGISTER`, `SEND_CHAT`…).
  - **data.data**: payload của sự kiện.
    - Có thể là object (vd `{ user, pass }`)
    - Hoặc có thể rỗng/không có tuỳ event (vd `LOGOUT`, `GET_USER_LIST`).

Nói cách khác: **`event` quyết định kiểu dữ liệu của `data.data`**. Đây là điểm chính của “event-based protocol”.

---

## Danh sách event hiện có (BE)
Các event dưới đây đều dùng chung format như trên, chỉ khác `event` và `data.data`.

### Auth
- `REGISTER`: tạo user mới (`{ user, pass }`)
- `LOGIN`: đăng nhập (`{ user, pass }`)
- `RE_LOGIN`: đăng nhập lại khi mất kết nối (`{ user, code }`)
- `LOGOUT`: đăng xuất (không cần payload)

### Room
- `CREATE_ROOM`: tạo phòng (`{ name }`)
- `JOIN_ROOM`: vào phòng (`{ name }`)
- `GET_ROOM_CHAT_MES`: lấy lịch sử chat của room có phân trang (`{ name, page }`)

### People (chat 1-1)
- `GET_PEOPLE_CHAT_MES`: lấy lịch sử chat với 1 user có phân trang (`{ name, page }`)
- `SEND_CHAT`: gửi tin nhắn (2 kiểu payload)
  - gửi vào room: `{ type: "room", to: "<roomName>", mes: "<text>" }`
  - gửi cho người: `{ type: "people", to: "<username>", mes: "<text>" }`

### User
- `CHECK_USER`: kiểm tra user tồn tại (`{ user }`)
- `GET_USER_LIST`: lấy danh sách user (không cần payload)

---

## Ví dụ request theo từng nhóm
### 1) REGISTER
```json
{
  "action": "onchat",
  "data": { "event": "REGISTER", "data": { "user": "long", "pass": "12345" } }
}
```

### 2) LOGIN
```json
{
  "action": "onchat",
  "data": { "event": "LOGIN", "data": { "user": "long", "pass": "12345" } }
}
```

### 3) RE_LOGIN (dùng code để tự khôi phục phiên)
```json
{
  "action": "onchat",
  "data": { "event": "RE_LOGIN", "data": { "user": "long", "code": "nlu_2055829137" } }
}
```

### 4) LOGOUT (event không cần payload)
```json
{
  "action": "onchat",
  "data": { "event": "LOGOUT" }
}
```

### 5) Gửi tin nhắn (2 kiểu)
Gửi room:
```json
{
  "action": "onchat",
  "data": { "event": "SEND_CHAT", "data": { "type": "room", "to": "abc", "mes": "helooooo" } }
}
```

Gửi người:
```json
{
  "action": "onchat",
  "data": { "event": "SEND_CHAT", "data": { "type": "people", "to": "ti", "mes": "helooooo" } }
}
```
---

## Kiến trúc source code (frontend)
Mục tiêu chính: UI không phải “cầm” WebSocket trực tiếp. Realtime được gom vào một lớp riêng để dễ reconnect, dễ mapping event, và dễ mở rộng.

```text
src/
  main.jsx                          # entry Vite: mount React root
  index.css                         # global styles

  app/                              # khung ứng dụng (root/providers/bootstrap)
    providers/                      # gom Provider (Redux/Router/Toast...) bọc toàn app
    bootstrap/                      # luồng khởi động: connect ws, re-login, preload...

  realtime/                         # tầng realtime/WebSocket (gateway)
                                    # ws client + protocol + các hàm gọi event (REGISTER/LOGIN/...)

  state/                            # quản lý state (dự kiến Redux ở phase sau)
    auth/                           # state đăng nhập/relogin code
    chat/                           # state chat (messages/conversations/paging...)
    ui/                             # state UI thuần

  features/                         # UI theo tính năng/màn hình
    auth/                           # màn login/register
    chat/                           # màn chat
      components/                   # component con của chat

  shared/                           # dùng chung
    components/                     # UI components tái sử dụng
    utils/                          # helpers (storage/logger/time...)
    constants/                      # hằng số dùng chung

  assets/                           # icons/images import từ code
    icons/
    images/
```

> Note: Một số folder có file `.gitkeep` để Git track folder rỗng trong giai đoạn dựng khung.

---

## Scripts
```bash
npm install
npm run dev
npm run build
npm run preview
```