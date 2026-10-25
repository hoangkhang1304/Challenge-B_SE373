# Challenge B: Context management

Agent tự viết (Python + `requests`, gọi OpenRouter), model free `nvidia/nemotron-3-ultra-550b-a55b:free`
(fallback `nvidia/nemotron-3.5-lightning:free`). Model cũ `minimax/minimax-m3.1-flash:free` đã bị gỡ ngày 22/10/2026.

| File | Nội dung |
|---|---|
| `llm.py` | OpenRouter client + agent loop native tool calling, đo `usage.prompt_tokens` mỗi request |
| `b1_compact.py` | B1: session debug dài, compact theo pipeline slide 26 |
| `b2_codemode.py` | B2: cùng một câu hỏi trên 10 file log, so sánh native tool calling và Code Mode |
| `test_offline.py` | Kiểm tra logic không cần API (fake test suite, prune, compact hoãn, ground truth B2, `run_code`) |

```
python test_offline.py
python b1_compact.py        # COMPACT_AT=20000 là ngưỡng compact (token ước lượng)
python b2_codemode.py       # both | native | code
```
Key đặt trong `.env` (`OPENROUTER_API_KEY=...`) hoặc biến môi trường cùng tên. Đổi model bằng biến `MODEL`.
Model free giới hạn 50 request/ngày **theo tài khoản** (không theo key). Một lần chạy B1 tốn ~20 request, B2 ~6.

## Kết quả

| Bài | Yêu cầu (slide 32) | Kết quả | Log |
|---|---|---|---|
| B1 | Session dài được compact; agent vẫn nhớ lỗi, cách đã thử, bước tiếp | **7/7 check PASS**, context ~29,8k → ~0,5k token | `b1_output.txt` |
| B2 | Trả lời trên nhiều file log; raw log không vào context | Code Mode **5/5 đúng, 1.191 input token** (native: 1/5 đúng, 296.948 token) | `b2_output.txt` |

## B1: Compact

Kịch bản: lỗi race condition khi refresh token. `run_tests` in ~1.100 dòng log, chỉ có 3 test fail.
Các turn:
1. Chạy test, báo test fail và nguyên nhân. "Chưa sửa gì".
2. User bắt thử tăng `TOKEN_TTL` 900 → 3600 (vô ích).
3. Hỏi agent nhắc lại 4 ý: lỗi, cách đã thử, ràng buộc, bước tiếp.
4. Bảo agent sửa lỗi thật và chạy test.

Pipeline (slide 26), chạy trước mỗi lần gọi LLM:
1. **Observe:** ước lượng token của context (chars/4).
2. **Prune / truncate (slide 23)** khi vượt ngưỡng:
   - Log test chỉ giữ dòng `FAIL / AssertionError / Tests:`. Ví dụ 1.131 dòng còn 11 dòng.
   - Output thô được lưu vào `b1_archive/`.
   - File đã đọc ở turn cũ bị cắt (DROP, vì dễ đọc lại). File đọc trong turn hiện tại được giữ nguyên (KEEP), để agent còn sửa được.
3. **Thời điểm compact (slide 25):**
   - Giữa turn chỉ prune.
   - Checkpoint và bỏ history được hoãn tới đầu turn kế tiếp, tức ranh giới milestone, lúc agent chưa làm gì.
   - Nếu prune xong vẫn vượt ngưỡng thì checkpoint ngay, để tránh tràn context.
4. **Structured checkpoint (slide 22):**
   - Một lần gọi LLM điền JSON gồm `goal, current_state, constraints, findings, failed_attempts, files, next_action`. Transcript được bọc trong `<transcript>`, để model không trả lời tiếp hội thoại.
   - Thiếu `goal` hoặc `next_action` thì gọi lại, tối đa 3 lần. Vẫn hỏng thì chỉ prune, không xóa lịch sử.
   - Lưu vào `b1_archive/checkpoint_N.json`.
5. **Reinject:** system rules + checkpoint (ghi rõ `next_action` là kế hoạch, không phải lệnh) + message của turn hiện tại. Các turn cũ bị bỏ.
6. **Resume và validate:** 7 check tự động ở cuối script.

**Quyền theo turn (slide 31, permission check):** turn 1 và 3 không có tool `edit_file`. Lý do là model nemotron bỏ qua lệnh "Chưa sửa gì" và tự sửa bug ngay ở turn 1 (lần 8), nên harness phải chặn bằng quyền, không dựa vào việc model tự giác.

Kết quả mới nhất (`b1_output.txt`, lần 9), **7/7 check PASS**:
- Turn 1 vượt ngưỡng giữa turn, nên chỉ prune: **~29,8k → ~8,4k** token. Agent báo 3 test fail do race condition, không sửa gì.
- Đầu turn 2 chạy checkpoint (`b1_archive/checkpoint_1.json`): **~29,8k → ~0,5k** token. Turn 1 bị xóa khỏi context, ràng buộc backward compatible và kết luận race condition chỉ còn nằm trong checkpoint.
- Turn 2: tăng TTL lên 3600, agent báo "KHÔNG sửa được, vẫn 3 test fail".
- Turn 3 nhắc lại đúng cả 4 ý: race condition trong `refreshToken()`; tăng TTL thất bại; giữ backward compatible; bước tiếp là transaction + `SELECT ... FOR UPDATE`.
- Turn 4: lại vượt ngưỡng giữa turn, chỉ prune (~22,5k → ~6,8k). Agent bọc `refreshToken()` trong `db.tx` + `SELECT ... FOR UPDATE`, chữ ký giữ nguyên, test **0 failed**, không thử lại TTL. Các lần sửa lưu ở `b1_archive/edits.json`.
- 20 request, peak input 27,7k token.

Các check: compact trước turn nhắc lại; nhắc đúng bug, cách đã thử, ràng buộc, bước tiếp; không lặp lại cách tăng TTL; test pass.

Hạn chế còn lại:
- `goal` trong checkpoint lần 9 bị viết theo yêu cầu của turn 2 ("Increase TOKEN_TTL..."), chứ không phải mục tiêu chung. `failed_attempts` cũng chưa có TTL, vì lúc đó chưa thử. Các thông tin quan trọng vẫn có trong `constraints` và `findings`. Đây là rủi ro "thiếu trường quan trọng" của structured checkpoint (slide 21).
- Agent không revert `TOKEN_TTL` về 900 sau khi sửa xong. Không có check nào đòi điều này.
- Ước lượng chars/4 lệch so với `usage` thật khoảng 30% (turn 2 có request 25,7k token thật nhưng không kích hoạt compact). Production nên đếm token bằng tokenizer, hoặc dựa vào `usage` của request trước.
- Mỗi cấu hình mới chạy 1 lần với model free; kết quả có thể dao động.

### Lịch sử các lần chạy

| Lần | Model | Kết quả | Lỗi tìm ra và cách sửa |
|---|---|---|---|
| 1 | minimax | 4/6 (nhắc lại đúng, chưa sửa xong) | **Thrash:** prune cắt cả file của turn hiện tại, agent đọc lại rồi lại compact. Sửa: KEEP file của turn hiện tại. **Constraint sai:** checkpoint chép "Chưa sửa gì" thành constraint. Sửa: constraints chỉ gồm ràng buộc lâu dài. **Hallucinate:** checkpoint ghi TTL "đã revert" dù không revert (đúng rủi ro Summary ở slide 21). |
| 2–3 | minimax | 5/6 | **Checkpoint rỗng** mà lịch sử vẫn bị xóa. Sửa: validate + retry, hỏng thì không xóa lịch sử. Agent hết step khi tìm `pool.ts`. Sửa: `db.ts` khai báo `pool`, `read_file` báo các file có thật, `max_steps` 8 → 10. |
| 4 | minimax | 6/7 | Check "không lặp TTL" báo nhầm. Sửa: chỉ đếm edit thật sự đổi giá trị TTL. |
| 5 | minimax | 7/7 | — (`b1_output_run5.txt`) |
| 6–7 | nemotron-ultra | 6/7 | **Compact giữa turn 2** xóa bối cảnh của chính turn đó. Agent thấy `next_action` nên tự sửa bug trong turn 2, khiến turn 3 trả lời "bước tiếp: không cần". Thêm câu nhắc trong prompt không đủ. Sửa: giữa turn chỉ prune, checkpoint hoãn tới đầu turn kế tiếp. Ngoài ra checkpoint ở turn 4 hỏng 3 lần vì model trả lời tiếp hội thoại. Sửa: bọc transcript trong `<transcript>`. |
| 8 | nemotron-ultra | 5/7 | Model tự sửa bug ngay turn 1, chưa có compact nào. Turn 2 tăng TTL nên "pass", và checkpoint ghi đúng điều đó, làm turn 3 nhắc sai lỗi. Sửa: turn 1, 3 không có `edit_file`. |
| 9 | nemotron-ultra | **7/7** | — (`b1_output.txt`) |

## B2: Code Mode

10 file × 400 dòng log (297 KB). Câu hỏi: top 5 endpoint (path, gộp mọi HTTP method) có nhiều status 500 nhất. Ground truth tính bằng Python.

Kết quả mới nhất (`b2_output.txt`):

| Chế độ | Request | Tổng input token | Peak input | Ký tự tool → LLM | Đúng top 5 |
|---|---:|---:|---:|---:|---:|
| native (`read_file`) | 4 | 296.948 | 197.196 | 292.865 | 1/5 |
| Code Mode (`run_code`) | 2 | **1.191** | **714** | **123** | **5/5** |

- Code Mode ít hơn **~250 lần** về input token.
- Native còn trả lời sai: LLM tự đếm trên ~293k ký tự log thô và đếm nhầm. Code Mode ra đúng cả 5, kể cả 3 endpoint hòa nhau ở 42 lần.
- Log thô không đi vào context: script chạy trong subprocess (cwd = `b2_logs/`, timeout 30s, stdout bị cắt ở 2.000 ký tự), chỉ in kết quả cuối. Script model viết được in ra log, để kiểm tra.

Lỗi tìm ra và đã sửa:
- **Script crash khi in tiếng Việt:** stdout của subprocess trên Windows mặc định là cp1252, và `-I` bỏ qua `PYTHONIOENCODING`. Sửa: chạy với `-X utf8`.
- **Câu hỏi mơ hồ:** model gộp theo `GET /v1/payments`, còn ground truth gộp theo path, nên chấm 0/5 dù script đúng. Sửa: ghi rõ "endpoint là path, gộp mọi HTTP method".
- **Lần đầu (model minimax):** Code Mode hết step trước khi trả lời. Sửa: bước cuối tắt tool (`tool_choice: none`) để buộc trả lời. Log cũ: `b2_output_run1_native.txt`, `b2_output_run1_codemode.txt`.

Lưu ý (slide 31): subprocess không phải sandbox; production cần container, chặn network, permission check và giới hạn CPU/RAM.
