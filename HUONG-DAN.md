# Website Nhơn Thịnh: deploy lên Vercel và chạy SEO

## Trong gói này có gì

| Thư mục | Dùng để |
|---|---|
| `site/` | Website đã build sẵn. **Đây là thư mục đưa lên Vercel.** |
| `source/` | File nguồn (`nhon-thinh.html`), script build và ảnh gốc. Chỉ dùng khi cần sửa nội dung rồi build lại. |

Mỗi trang có đường dẫn thật và nội dung đã render sẵn trong HTML, nên Google đọc được ngay:

- Tiếng Việt: `/`, `/dich-vu`, `/thuc-don`, `/su-kien`, `/gioi-thieu`, `/an-toan-thuc-pham`, `/tuyen-dung`, `/lien-he`
- Tiếng Anh: `/en`, `/en/services`, `/en/menu`, `/en/events`, `/en/about`, `/en/food-safety`, `/en/careers`, `/en/contact`

Mỗi trang đã có sẵn:

- Title, description, canonical, hreflang (vi / en / x-default).
- Ảnh xem trước khi chia sẻ link qua Zalo / Facebook (`og-image.jpg`).
- Schema `LocalBusiness` (tên, địa chỉ, số điện thoại, email, danh sách dịch vụ). Trang chủ có thêm `FAQPage`, các trang con có `BreadcrumbList`.
- `sitemap.xml` (20 trang), `robots.txt`, favicon, `404.html`.

Các trang `noindex` (Google không đưa lên kết quả tìm kiếm): trang "Nội dung cần bổ sung" và 3 trang case study minh họa.

---

## Bước 1: Đổi tên miền (nếu không dùng `nhonthinh.vn`)

Bỏ qua bước này nếu tên miền đúng là `nhonthinh.vn`.

1. Mở `source/nhon-thinh.html`, tìm dòng `siteUrl: 'https://nhonthinh.vn'` và đổi thành tên miền thật.
2. Build lại (cần cài Node.js 18 trở lên):
   ```bash
   cd source
   npm install
   npm run build
   ```

Lệnh build ghi lại toàn bộ HTML, `sitemap.xml`, `robots.txt` và `vercel.json` vào `site/`.

## Bước 2: Đưa lên Vercel

**Cách A: dùng dòng lệnh (nhanh nhất)**

```bash
cd site
npx vercel          # lần đầu: đăng nhập, chọn "Create new project", framework chọn "Other"
npx vercel --prod   # đưa bản chính thức lên
```

**Cách B: dùng GitHub (về sau sửa là tự cập nhật)**

1. Tạo repo GitHub và đẩy thư mục `site/` lên.
2. Vào vercel.com, chọn **Add New → Project**, rồi import repo đó.
3. Framework Preset chọn **Other**. Không cần Build Command; Output Directory để trống hoặc `.`.

Lưu ý: gói **Hobby** (miễn phí) của Vercel chỉ dành cho dự án cá nhân, phi thương mại. Website công ty nên dùng gói **Pro**.

## Bước 3: Gắn tên miền

1. Trên Vercel, vào **Project → Settings → Domains**, thêm `nhonthinh.vn` và `www.nhonthinh.vn`.
2. Vercel sẽ hiện bản ghi DNS cần tạo. Thường là một bản ghi `A` cho tên miền gốc và một `CNAME` cho `www`; hãy dùng đúng giá trị Vercel hiển thị. Tạo các bản ghi này ở nơi bạn mua tên miền (Mắt Bão, PA Việt Nam, iNET…).
3. Đặt `nhonthinh.vn` làm tên miền chính, `www` tự chuyển hướng về đó.
4. HTTPS được Vercel cấp tự động sau khi DNS có hiệu lực (từ vài phút đến vài giờ).

## Bước 4: Google Search Console

1. Vào search.google.com/search-console và chọn **Add property → Domain**, nhập `nhonthinh.vn`.
2. Google đưa một bản ghi `TXT`. Thêm bản ghi này vào DNS tên miền rồi bấm **Verify**.
3. Vào mục **Sitemaps** và gửi `https://nhonthinh.vn/sitemap.xml`.
4. Vào **URL Inspection**, dán link trang chủ và trang `/dich-vu`, rồi bấm **Request indexing** để Google vào sớm hơn.

Thông thường cần vài ngày đến vài tuần để trang bắt đầu xuất hiện trên Google.

## Bước 5: Google Business Profile (quan trọng nhất cho SEO địa phương)

1. Vào business.google.com, tạo hồ sơ tên **Nhơn Thịnh**, danh mục gần nhất là "Dịch vụ cung cấp đồ ăn" hoặc "Caterer".
2. Địa chỉ ghi đúng như trên website: Thửa đất số 1047, Tờ bản đồ 46, Khu phố Bình Chánh Đông, Phường Tân Hiệp, TP. Hồ Chí Minh.
3. Số điện thoại: 0906 811 569. Website: `https://nhonthinh.vn`.
4. Xác minh theo cách Google yêu cầu (video, điện thoại hoặc thư).
5. Đăng ảnh thật của bếp, xe giao, đội ngũ. Mời khách hàng quen để lại đánh giá trên Google.

Tên, địa chỉ và số điện thoại phải giống hệt nhau ở website, Google Business Profile, Facebook và Zalo OA. Google dùng sự thống nhất này để tin tưởng doanh nghiệp.

## Bước 6: Google Analytics (đo người gửi form, bấm gọi, bấm Zalo)

1. Tạo property GA4 ở analytics.google.com và lấy mã dạng `G-XXXXXXX`.
2. Trong `source/nhon-thinh.html`, sửa `analytics: { ga4: null }` thành `analytics: { ga4: 'G-XXXXXXX' }`.
3. Build lại và deploy lại (Bước 1, Bước 2).

Các sự kiện đã gắn sẵn: `quote_form_success`, `application_success`, `supplier_docs_request`, `click_phone`, `click_zalo`, `download_profile_vi`, `download_profile_en`. Website không gửi thông tin cá nhân của khách sang Analytics.

## Bước 7: Cho form báo giá gửi về email

Hiện form kiểm tra dữ liệu đầy đủ nhưng chưa gửi đi. Nếu khách bấm gửi, trang báo rõ là chưa kết nối và vẫn giữ nguyên thông tin đã nhập.

Cách đơn giản nhất là dùng **Web3Forms** (có gói miễn phí):

1. Vào web3forms.com, nhập email muốn nhận yêu cầu (ví dụ hello.nhonthinh@gmail.com) để lấy **Access Key**.
2. Trong `source/nhon-thinh.html`, sửa hai dòng:
   ```js
   formEndpoints: { quote: 'https://api.web3forms.com/submit', careers: 'https://api.web3forms.com/submit' },
   formAccessKey: 'ACCESS-KEY-CỦA-BẠN',
   ```
3. Build lại và deploy lại, rồi tự gửi thử một yêu cầu để kiểm tra email.

---

## Từ khóa đã gắn vào website

| Nhóm | Ví dụ từ khóa | Trang chính |
|---|---|---|
| Cốt lõi | suất ăn công nghiệp, cung cấp suất ăn công nghiệp | Trang chủ, Dịch vụ |
| Địa phương | suất ăn công nghiệp Bình Dương, suất ăn công nghiệp TP.HCM | Trang chủ, Liên hệ |
| Dịch vụ | nấu ăn công nghiệp, catering nhà máy, suất ăn trường học, tiệc tất niên công ty | Dịch vụ, Sự kiện |
| Niềm tin | an toàn thực phẩm suất ăn, lưu mẫu thức ăn, quy trình bếp ăn công nghiệp | An toàn thực phẩm |
| Tuyển dụng | tuyển phụ bếp, tuyển nhân viên bếp ăn công nghiệp | Tuyển dụng |

Kể từ 7/2025, Bình Dương đã sáp nhập vào TP.HCM. Website dùng cả hai cách gọi vì nhiều khách vẫn tìm theo "Bình Dương".

## Việc nên làm tiếp để SEO tốt hơn

- **Ảnh thật:** thay ảnh AI bằng ảnh thật của bếp và sự kiện. Google Business Profile cũng ưu tiên ảnh thật.
- **Xác nhận chứng nhận:** chỉ bật những giấy công ty đang có (`certifications` → `verified: true`).
- **Testimonial và sự kiện thật:** khi có đồng ý của khách, thêm vào `testimonials` và `events`, rồi tắt `demoContent`.
- **Mục Tin tức:** đã có sẵn khung; nên bật khi có người viết đều 2 bài/tháng (ví dụ "Thực đơn suất ăn công nhân cân đối dinh dưỡng", "Quy trình lưu mẫu thức ăn 24 giờ").
- **Link Facebook / LinkedIn / Messenger:** điền vào `social` để icon hoạt động và Google liên kết các hồ sơ với nhau.
