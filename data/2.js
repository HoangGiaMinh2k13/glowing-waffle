window.docs = window.docs || [];
window.docs.push({
  id: 2,
  text: `
# TOÁN 7 (TẬP MỘT) - KẾT NỐI TRI THỨC VỚI CUỘC SỐNG

* **Tổng Chủ biên:** Hà Huy Khoái
* **Chủ biên:** Nguyễn Huy Đoan
* **Nhà xuất bản:** Giáo dục Việt Nam
* **Phạm vi kiến thức:** Đại số và Thống kê (Chương I, II, V), Hình học (Chương III, IV).

---

## I. CHƯƠNG I: SỐ HỮU TỈ ($\mathbb{Q}$)

**Mục tiêu:** Giới thiệu tập hợp số hữu tỉ, các phép toán cơ bản và quy tắc liên quan.

| Chủ đề | Nội dung trọng tâm | Công thức/Quy tắc cơ bản |
| :--- | :--- | :--- |
| **Số Hữu Tỉ** | Số có thể viết dưới dạng phân số $\frac{a}{b}$ ($a, b \in \mathbb{Z}, b \ne 0$). | $\mathbb{Q} = \{ \frac{a}{b} \mid a, b \in \mathbb{Z}, b \ne 0 \}$ |
| **Phép toán** | Cộng, trừ, nhân, chia số hữu tỉ. Thứ tự thực hiện phép tính (Luỹ thừa $\to$ Nhân/Chia $\to$ Cộng/Trừ). | $\frac{a}{b} \pm \frac{c}{d} = \frac{ad \pm bc}{bd}$ |
| **Luỹ thừa** | Luỹ thừa với số mũ tự nhiên ($x^n$). Quy tắc tích và thương của hai luỹ thừa cùng cơ số. | $x^m \cdot x^n = x^{m+n}$ ; $(x^m)^n = x^{m \cdot n}$ |
| **Quy tắc** | **Quy tắc chuyển vế:** Khi chuyển một số hạng từ vế này sang vế kia, phải **đổi dấu** số hạng đó. | $x + a = b \iff x = b - a$ |

---

## II. CHƯƠNG II: SỐ THỰC ($\mathbb{R}$)

**Mục tiêu:** Mở rộng từ số hữu tỉ sang số vô tỉ và tập hợp số thực.

| Chủ đề | Nội dung trọng tâm | Kí hiệu / Định nghĩa |
| :--- | :--- | :--- |
| **Số thập phân** | Làm quen với **số thập phân vô hạn tuần hoàn** (có thể biểu diễn được dưới dạng số hữu tỉ). | $0.333... = 0.\overline{3} = \frac{1}{3}$ |
| **Số vô tỉ** | Số được viết dưới dạng số thập phân vô hạn **không tuần hoàn**. | $\sqrt{2} \approx 1.41421...$ (không tuần hoàn) |
| **Căn bậc hai** | **Căn bậc hai số học** của một số $a$ không âm là số $x \ge 0$ mà $x^2 = a$. | Kí hiệu: $\sqrt{a}$ |
| **Số Thực** | Tập hợp gồm tất cả các số hữu tỉ và số vô tỉ. | $\mathbb{R} = \mathbb{Q} \cup (\mathbb{R} \setminus \mathbb{Q})$ |
| **Trục số** | Mọi điểm trên trục số đều biểu diễn một số thực, và ngược lại. | |

---

## III. CHƯƠNG III: GÓC VÀ ĐƯỜNG THẲNG SONG SONG

**Mục tiêu:** Nghiên cứu các quan hệ góc và tính chất của đường thẳng song song trong hình học phẳng.

| Chủ đề | Nội dung trọng tâm | Tính chất/Định nghĩa |
| :--- | :--- | :--- |
| **Góc đặc biệt** | **Hai góc đối đỉnh** (bằng nhau); **Hai góc kề bù** (tổng bằng $180^\circ$). **Tia phân giác** chia góc thành hai góc bằng nhau. | Góc đối đỉnh: $\angle O_1 = \angle O_3$ |
| **Đường thẳng song song** | **Dấu hiệu nhận biết:** Hai đường thẳng bị cắt bởi đường thẳng thứ ba tạo ra các cặp góc so le trong, đồng vị, hoặc trong cùng phía **bằng nhau/bù nhau**. | So le trong: bằng nhau; Đồng vị: bằng nhau. |
| **Tiên đề Euclid** | Qua một điểm nằm ngoài một đường thẳng, chỉ có **một và chỉ một** đường thẳng đi qua điểm đó và song song với đường thẳng đã cho. |  |
| **Định lí** | Mệnh đề được suy ra từ các mệnh đề đúng (Tiên đề, Định nghĩa, Định lí đã biết). Gồm có **giả thiết** (cái đã cho) và **kết luận** (cái cần chứng minh). | |

---

## IV. CHƯƠNG IV: TAM GIÁC BẰNG NHAU

**Mục tiêu:** Nghiên cứu tổng ba góc của tam giác, các trường hợp bằng nhau và tính chất của tam giác cân.

| Chủ đề | Nội dung trọng tâm | Tiêu chí bằng nhau / Tính chất |
| :--- | :--- | :--- |
| **Tổng các góc** | Tổng ba góc của một tam giác luôn bằng **$180^\circ$**. | $\angle A + \angle B + \angle C = 180^\circ$ |
| **Trường hợp bằng nhau** | **c.c.c** (Cạnh-Cạnh-Cạnh), **c.g.c** (Cạnh-Góc-Cạnh), **g.c.g** (Góc-Cạnh-Góc). | $\triangle ABC = \triangle A'B'C'$ |
| **Tam giác vuông** | Các trường hợp bằng nhau đặc biệt: Cạnh huyền – góc nhọn; Cạnh huyền – cạnh góc vuông; Hai cạnh góc vuông; Góc nhọn – cạnh góc vuông. | |
| **Tam giác cân** | Tam giác có hai cạnh bằng nhau. Góc đối diện với hai cạnh bằng nhau thì **bằng nhau**. | Nếu $AB = AC$ thì $\angle B = \angle C$ |
| **Đường trung trực** | Đường thẳng vuông góc với đoạn thẳng tại **trung điểm** của nó. | Tập hợp các điểm cách đều hai mút của đoạn thẳng. |

---

## V. CHƯƠNG V: THU THẬP VÀ BIỂU DIỄN DỮ LIỆU

**Mục tiêu:** Học sinh nắm được cách thu thập, phân loại và biểu diễn dữ liệu bằng biểu đồ.

| Chủ đề | Nội dung trọng tâm | Mô tả / Ứng dụng |
| :--- | :--- | :--- |
| **Thu thập Dữ liệu** | Phân loại dữ liệu định tính và dữ liệu định lượng (rời rạc, liên tục). Phương pháp thu thập: quan sát, điều tra, phỏng vấn. | |
| **Biểu đồ Hình Quạt Tròn** | Dùng để biểu diễn tỉ lệ (%) của các phần so với toàn thể. | Tổng các tỉ lệ trong biểu đồ bằng $100\%$.  |
| **Biểu đồ Đoạn Thẳng** | Dùng để biểu diễn sự thay đổi (xu hướng) của một đại lượng theo thời gian (hoặc các tiêu chí được sắp xếp theo thứ tự). | Thường dùng để theo dõi sự tăng trưởng, biến động qua các mốc thời gian. |
`
});