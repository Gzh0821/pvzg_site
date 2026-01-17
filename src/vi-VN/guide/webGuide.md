---
title: Hướng Dẫn Phát Triển Website
icon: laptop-code
pageInfo: false
index: true
order: 5
---

Chào mừng bạn đến với dự án mã nguồn mở "PvZ2 Gardendless"! Dù bạn là dev mới vào nghề hay đã cày code lâu năm, chúng mình đều hoan nghênh bạn đóng góp code, gửi issues hoặc góp ý kiến.
Dưới đây là hướng dẫn phát triển nhanh gọn, giúp các bạn newbie có thể nhảy vào dự án ngay.

## 1. Chuẩn Bị

Trước khi bắt đầu, bạn cần setup một số thứ cơ bản. Với hệ điều hành `Windows`, mình khuyên bạn dùng `PowerShell` trong `Windows Terminal` để chạy lệnh, có thể mở bằng click chuột phải.

### 1.1 Cài đặt VScode, Git và Node.js

#### VScode

VScode là một trình soạn thảo code nhẹ nhàng, hỗ trợ nhiều ngôn ngữ lập trình. Trong phát triển dự án, mình recommend dùng VScode để viết code.

- Tải và cài VScode: [Trang chủ VScode](https://code.visualstudio.com/)
- Đọc [tài liệu VScode](https://code.visualstudio.com/docs) để tìm hiểu thêm cách sử dụng.
- Nên cài các plugin: `Vue - Official`, `ESLint`, `GitLens`... để code nhanh hơn.

#### Git

Git là công cụ quản lý phiên bản dự án. Trong phát triển, chúng ta sẽ dùng Git để pull code và push các thay đổi.

- Tải và cài Git: [Trang chủ Git](https://git-scm.com/), với Windows, mình recommend tải `64-bit Git for Windows Setup`.
- Trong quá trình cài đặt, bạn có thể để mặc định.
- Nên chọn `Use Visual Studio Code as Git's default editor` cho editor mặc định.
- Nên chọn `Git from the command line and also from 3rd-party software` cho cấu hình biến môi trường.
- Sau khi cài xong, chạy lệnh sau trong terminal để check cài đặt thành công chưa:

```bash
git --version
```

#### Node.js

VuePress là một static website generator dựa trên Node.js, nên bạn cần cài Node.js.

- Tải và cài Node.js: [Trang chủ Node.js](https://nodejs.org/)
- Sau khi cài xong, chạy lệnh sau để confirm cài đặt thành công:

```bash
node --version
npm --version
```

### 1.2 Cài đặt Corepack

Corepack là một package manager của Node.js, giúp bạn cài và quản lý dependencies nhanh hơn.

- Chạy lệnh sau để kích hoạt Corepack:

```bash
corepack enable
```

## 2. Fork dự án

### 2.1 Tạo tài khoản GitHub

Trước khi tham gia dự án, bạn cần đăng ký một tài khoản GitHub.

### 2.2 Fork dự án

Khi tham gia dự án trên GitHub, bạn có thể fork (copy một bản của dự án về tài khoản của mình) để phát triển.

1. Truy cập [dự án pvzg_site](https://github.com/Gzh0821/pvzg_site).
2. Click nút `Fork` ở góc trên bên phải của trang để copy dự án về repo GitHub của bạn.
3. Vào repo dự án mà bạn vừa fork.

## 3. Clone dự án về máy

Sau khi fork dự án, bạn cần clone code dự án về máy tính local. `VScode` có tính năng clone repositories. Bạn có thể check tài liệu của nó để biết thêm, hoặc dùng terminal:

1. Mở terminal. Với Windows, hãy dùng `Windows Terminal` hoặc terminal có sẵn trong `VScode`.

2. Ở đường dẫn bạn muốn đặt dự án, chạy lệnh sau để clone dự án về local:

```bash
git clone https://github.com/YOUR_USERNAME/pvzg_site.git
```

Nhớ thay `YOUR_USERNAME` bằng username GitHub của bạn nha.

3. Vào thư mục dự án, trong đó phải có file `package.json`:

```bash
cd pvzg_site
```

4. Mở thư mục dự án bằng `VScode`. Sau đó, bạn có thể dùng `VScode` để nhập lệnh và viết file:

```bash
code .
```

## 4. Cài đặt dependencies

Sau khi vào thư mục dự án, bạn cần cài các package dependencies mà dự án yêu cầu. Tất cả các lệnh tiếp theo phải được nhập trong đường dẫn thư mục dự án.

- Dùng `Corepack` để cài `pnpm`, và dùng `pnpm` để cài dependencies:

```bash
corepack install
# Check xem pnpm đã được cài đúng trong dự án chưa
pnpm -v
# Cài dependencies
pnpm install
```

## 5. Chạy môi trường development

Sau khi cài xong dependencies, bạn có thể start môi trường development của dự án và xem website chạy trên local.

- Dùng lệnh sau để start development server:

```bash
pnpm docs:dev
```

Sau khi start thành công, bạn có thể truy cập `http://localhost:8080` trong browser để xem website đang development.

## 6. Bắt đầu chỉnh sửa

Giờ bạn có thể sửa và tối ưu code rồi đấy.

### 6.1 File Markdown

Markdown là một ngôn ngữ markup nhẹ nhàng. Bạn có thể tìm hiểu thêm qua [Markdown Guide](https://www.markdownguide.org/).

Nội dung trang của dự án chủ yếu được viết bằng Markdown, với đuôi `.md`. Bạn có thể tìm các file trang của dự án trong thư mục `src`.

Dự án này được phát triển bằng `Vuepress`. Về cách dùng `Vuepress`, bạn có thể check [tài liệu chính thức Vuepress](https://vuepress.vuejs.org/) để biết thêm.

Format của file `.md` như sau:

```markdown
<!-- Các mục cấu hình -->
---
title: tiêu đề trang
index: false
...
---
<!-- HTML components -->
<script />
<Catalog />

> [!info]
> thông tin ở đây...

### Tiêu đề

Nội dung...
```

### 6.2 Cung cấp bản dịch

Trong thư mục `src`, bạn có thể tìm thấy thư mục `en`, chứa các trang tiếng Anh của website này. Bạn có thể tham khảo các file trong thư mục này và dịch sang ngôn ngữ khác.

Với công việc dịch thuật, bạn chỉ cần sửa các file `.md` trong thư mục ngôn ngữ tương ứng, như `ru-RU`, `pt-BR`. Bạn cần giữ cấu trúc file và tên trong thư mục nhất quán với `en`.

Với các mục cấu hình trong file `.md`, chỉ cần sửa `title`, còn `HTML component` thì giữ nguyên không đổi.
Mình khuyên bạn nên check xem trang hiển thị đúng không mỗi khi thay đổi nha.

## 7. Submit thay đổi và tạo Pull Request

Khi bạn đã hoàn thành sửa code và test thành công, bạn có thể submit thay đổi và tạo Pull Request.

### 7.1 Submit thay đổi và push lên GitHub

Mình recommend bạn dùng `VScode` để submit. Chỉ cần điền thông tin commit trong `Source Control` ở bên trái `VScode`, rồi click Submit, và click Synchronize Changes.

Để submit bằng terminal:

1. Add code đã sửa vào Git:

```bash
git add .
```

2. Commit thay đổi:

```bash
git commit -m "Mô tả thay đổi của bạn"
```

3. Push thay đổi local lên repo GitHub của bạn:

```bash
git push origin main
```

### 7.2 Tạo Pull Request

1. Vào trang repo GitHub của bạn.
2. Click nút `Compare & pull request` ở trên đầu trang.
3. Điền mô tả thay đổi và submit Pull Request.

Chúng mình sẽ review Pull Request của bạn sớm nhất có thể và phản hồi hoặc merge theo nhu cầu.

## 8. Submit Issues

Nếu bạn gặp vấn đề trong quá trình phát triển, bạn có thể feedback qua hệ thống Issues của GitHub.

1. Truy cập [trang Issues của dự án](https://github.com/Gzh0821/pvzg_site/issues).

2. Click nút `New issue`.

3. Điền mô tả vấn đề và submit.

## 9. Tham gia thảo luận

Chúng mình hoan nghênh tất cả mọi người tham gia thảo luận dự án! Bạn có thể liên lạc với chúng mình theo các cách sau:

- Tham gia Discussions trên GitHub.

- Tham gia thảo luận trên server Discord.

Cảm ơn bạn đã ủng hộ và đóng góp cho dự án này, chúng mình rất mong được hợp tác cùng bạn để cải thiện dự án!
