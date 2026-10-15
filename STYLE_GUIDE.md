# Style Guide: Restyle UI แอปจัดการอพาร์ทเมนท์

เอกสารส่งต่อสำหรับ AI/คนที่จะทำหน้าถัดไป ให้ได้หน้าตาและวิธีทำเหมือนกับที่ทำไปแล้ว
(`ListRoom`, `BillingForm`, `SettingApartment`, `AppSidebar`, `AppRoutes`)

## 0. บริบท

- Stack: React, antd v5 (ต้อง >= 5.10 เพื่อใช้ `styles={{}}`), `@ant-design/icons`,
  react-hook-form + zod, `@tanstack/react-query`, zustand (`persistMiddleware`), react-router-dom v6
- UI เป็นภาษาไทย ห้ามเปลี่ยนข้อความ เว้นแต่จำเป็น และต้องแจ้งทุกครั้ง
- เริ่มจากออกแบบ mockup แล้วค่อยนำสไตล์ไปใส่โค้ดจริงทีละไฟล์

## 1. หลักการทำงาน (สำคัญที่สุด)

1. **ห้ามเปลี่ยน logic**: state, effect, schema, mutation, handler, ชื่อ props คงเดิม
   ถ้าต้องเพิ่มหรือแก้ ให้บอกผู้ใช้ชัดๆ
2. ส่งไฟล์เต็ม (วางทับได้เลย) ไม่ใช่ diff
3. ถ้าไม่เห็นโค้ดของ component ที่ import มา (เช่น `RoomCard`, `NumericInputControllerPage`)
   **ห้ามเดา field มั่ว** ให้เขียนใหม่ในไฟล์เดียวกัน หรือส่ง props เดิมไปตรงๆ แล้วแจ้งว่าเป็นข้อสมมติ
   และรวมจุดเดา field ไว้ที่เดียว (เช่นฟังก์ชัน `isRoomAvailable`)
4. สไตล์อยู่ในไฟล์เดียว: inline style + ตัวแปร `css` (template string) เรนเดอร์ด้วย `<style>{css}</style>`
   และตัด import ไฟล์ `.css` เดิมออก (แจ้งผู้ใช้ให้เช็กว่า class เก่ายังถูกใช้ที่อื่นไหม)
5. ท้ายทุกงานสรุป 2 หัวข้อ: **ที่เปลี่ยน** และ **ที่ต้องตรวจเอง**
   ถ้ายังไม่ได้รันกับโปรเจกต์จริง ให้บอกตรงๆ

## 2. Design tokens

ประกาศเป็นออบเจ็กต์ `C` ต้นไฟล์

| บทบาท | ค่า |
|---|---|
| ink (sidebar / แบนเนอร์) | `#0F172A` |
| raised (พื้นรองบน ink) | `#1E2A4A` |
| page (พื้นหลังหน้า) | `#F4F5F9` |
| card | `#FFFFFF` |
| line (เส้นขอบ) | `#E6E8F0` |
| muted (ข้อความรอง) | `#5B6478` |
| sunken (พื้นช่อง/แถวย่อย) | `#F7F8FC` |
| **primary** | `#4F46E5` |
| primaryDeep | `#4338CA` |
| primarySoft | `#EEF0FF` (ขอบ `#C7CCF5`, ข้อความ `#3730A3`) |
| ว่าง / สำเร็จ | bg `#DCFCE7`, fg `#166534`, ตัวเลข `#15803D` |
| ไม่ว่าง / อันตราย | bg `#FFE4E9`, fg `#9F1239`, ตัวเลข `#BE123C` |
| ค่าน้ำ | `#2563EB` (soft `#E6EEFF`) |
| ค่าไฟ | `#B45309` (soft `#FEF1DC`) |
| บนพื้นเข้ม | ข้อความรอง `#A5B0C6`, ไอคอน `#A5B4FC`, ป้าย `#C7D2FE`, ปุ่มออกจากระบบ `#FB7185` |

**กฎปุ่ม:** ปุ่มหลักเป็น `#4F46E5` ตัวอักษรขาว น้ำหนัก 600 เสมอ (ผู้ใช้ย้ำแล้ว)
อย่าใช้ม่วงอ่อน `#818CF8` เป็นปุ่มหลัก

**ฟอนต์:** `'IBM Plex Sans Thai','Noto Sans Thai',system-ui,sans-serif`
(ผู้ใช้ต้องโหลดใน `index.html`)

**รูปทรง:** มุมโค้ง 20 (แบนเนอร์/section), 16 (การ์ดย่อย), 12 (ปุ่ม/ช่องกรอก), 10 (ไอคอนไทล์), 999 (ป้าย)
เส้นขอบ 1px สีเทาอ่อน ไม่ใช้ gradient ไม่ใช้เงาหนัก
(เงาใช้ได้เฉพาะแถบลอยด้านล่างและใบแจ้งยอด)

**ธีม antd ต่อหน้า:** ครอบทั้งหน้าด้วย `ConfigProvider` เพื่อไม่กระทบหน้าอื่นของแอป
และไม่ต้องตั้ง `size="large"` ทุกช่อง

```jsx
const theme = {
  token: { colorPrimary: '#4F46E5', borderRadius: 12, fontFamily: FONT, controlHeight: 44 },
};
<ConfigProvider theme={theme}>...</ConfigProvider>
```

## 3. Pattern ที่ใช้ซ้ำ

เขียนไว้ในแต่ละไฟล์เองได้ (ไม่ต้องแยกไฟล์ร่วม)

- **PageHeader**: แบนเนอร์ `#0F172A` มุม 20 padding 24×28 ไอคอน antd ในกรอบ 52px พื้น `#1E2A4A`
  h1 26px/700 สีขาว คำอธิบาย 14px `#A5B0C6` ปุ่มหรือป้ายอยู่ขวา (wrap ลงบรรทัดใหม่บนจอเล็ก)
  ใช้แทน `<PageHeader icon="emoji">` เดิม (เลิกใช้ emoji)
- **Section**: การ์ดขาว ขอบ `#E6E8F0` มุม 20 padding 24
  หัวเรื่อง 16px/700 พร้อมไอคอนในกรอบ 36px พื้น `#EEF0FF`
- **ฟอร์ม**: ใช้ `<Form.Item validateStatus help>` แสดง error จาก react-hook-form
  แทนการเขียน `<Text type="danger">` ซ้ำๆ
- **ปุ่มรอง**: พื้น `#EEF0FF` ขอบ `#C7CCF5` ข้อความ `#3730A3`
  ปุ่ม "เพิ่ม" ใช้ `type="dashed"` ปุ่มลบเป็นไอคอนพร้อม `aria-label`
- **Responsive**: ใช้ CSS (grid `auto-fit`/`auto-fill`, flex-wrap, `@media` ใน css string)
  **ห้ามใช้ `window.innerWidth` หรือ `'@media'` ใน inline style** (ใช้ไม่ได้จริง)
- **Accessibility**: ใช้ `<button>` จริง, `aria-label` ให้ปุ่มไอคอนล้วน,
  `aria-pressed`/`aria-expanded` เมื่อจำเป็น, สีสถานะต้องมีข้อความกำกับ, มี `:focus-visible`

## 4. รายไฟล์

### ListRoom.jsx (จัดการห้องพัก)
- logic เดิมครบ (`useListRoom`, `updatePrice` mutation, การเลือกห้อง/ชั้น)
- แบนเนอร์ + การ์ดสถิติ 4 ใบ (ทั้งหมด/ว่าง/ไม่ว่าง/อัตราเข้าพัก คำนวณจากข้อมูล)
- แถบเครื่องมือ: ค้นหาเลขห้อง, `Segmented` กรองสถานะ, checkbox เลือกทั้งหมด (เลือกเฉพาะห้องที่กรองแล้ว)
- ชั้นพับได้ (accordion เขียนเอง แทน antd `Collapse`) เปิดทุกชั้นเป็นค่าเริ่มต้น
- `RoomCard` เขียนใหม่ในไฟล์ (ปุ่มจริง: เลขห้อง, ราคา, ป้ายสถานะ, ช่องติ๊ก)
- แถบ action สีเข้ม sticky ด้านล่าง (ช่องราคา + ปุ่มอัปเดต) แสดงเมื่อมีห้องที่เลือก
- **ข้อสมมติ:** field ห้อง = `room.roomNumber`, `room.price`, สถานะจาก `isAvailable`/`available`/`status`
- ตัด `isMobile`/`isTablet` และ `handleSubmitFloor`/`amountInputs` (เดิมไม่ได้ใช้)

### BillingForm.jsx (ระบบแจ้งชำระเงิน)
- layout 2 คอลัมน์ (ฟอร์ม | ใบแจ้งยอด sticky) จอเล็กเรียงต่อกัน
  (เดิม `Col` รวมกันเกิน 24 จึงตกบรรทัด)
- ค่าน้ำ/ค่าไฟที่เขียนซ้ำ รวมเป็น `UtilityCard` ตัวเดียว (`kind="water"|"electric"`)
  ชื่อ field ประกอบจาก `utilities.${kind}FlatRate/Previous/Current/Rate` ตรงกับของเดิม
- ใบแจ้งยอดแยกเป็น `BillRow` + `Rule` ยอดรวมเป็นบล็อกม่วงอ่อน (ยอดต้องได้รับ) หรือเขียว (เครดิต)
- ใบแจ้งยอดห่อด้วย `printRef` เดิม ปุ่มบันทึกมี class `bf-no-print` ไม่ติดตอนพิมพ์
- **เพิ่ม:** คอลัมน์ลบส่วนลด เรียก `removeDiscount(record.id)` (เดิมรับ prop มาแต่ไม่ใช้) ต้องเช็ก signature
- **แก้บั๊ก:** modal "อื่นๆ" ใช้ `setIsOtherSelected`/`otherDescription`/`otherAmount`
  ที่ไม่เคยรับเป็น props จึงเพิ่มเข้า props (หน้าแม่ต้องส่งมาด้วย)

### SettingApartment.jsx (ตั้งค่าอพาร์ทเมนท์)
- logic เดิมครบ (zod schema, `useFieldArray`, effect จังหวัด/อำเภอ/ตำบลด้วย prevRef, `reset` ตอนโหลดข้อมูล)
- แบ่งเป็น 5 Section: ข้อมูลทั่วไป, เบอร์โทร, ข้อมูลที่ตั้ง, ตั้งค่าการวางบิล, การตรวจสอบ Slip
- แบนเนอร์โชว์ชื่ออพาร์ทเมนท์เป็นป้ายถ้ามี และตัดหัวข้อซ้ำที่เคยอยู่ในการ์ดออก
- `NumericInputControllerPage` ไม่เห็นโค้ด ส่ง props เดิมไปตรงๆ (ตัด style ฟอนต์ออก)
  ผู้ใช้ต้องเช็กความสูงช่องใน component นั้น (ควรเป็น 44px)

### AppSidebar.jsx
- โครงเดิม (`useMobile`, `Sider` เดสก์ท็อป, `Drawer` มือถือ, `resolveUserData`) คงไว้
- พื้น `#0F172A` โลโก้ "G" ในกรอบทึบ `#4F46E5` การ์ดโปรไฟล์ + ป้าย role
- เมนูใช้ `ConfigProvider` → `components.Menu` (`dark*` tokens) เฉพาะใน sidebar:
  มุม 12 สูง 44 ตัวที่เลือกพื้น `#1E2A4A`
- ปุ่มออกจากระบบสี `#FB7185` hover ด้วย CSS (เลิก `onMouseEnter/Leave`)
- ตัด `@mui/material` (`Box`) และ `AppSidebar.css`;
  ใช้ `Drawer` `styles` แทน `bodyStyle`/`headerStyle`/`maskStyle`
- คลิกเมนูครอบด้วย `startTransition` (ดูหัวข้อ 5)

### AppRoutes.jsx
- ไม่ใช่งาน UI ดูหัวข้อ 5

## 5. ปัญหา "กดเมนูครั้งแรกแล้วกระพริบ"

**สาเหตุ:** `<Suspense>` ตัวเดียวครอบ `<Routes>` ทั้งหมด พอเปิดหน้า lazy ครั้งแรก
ทั้งแอปรวม sidebar ถูกแทนที่ด้วย fallback แวบหนึ่ง (ครั้งต่อไปไฟล์ถูกแคชเลยไม่เกิด)

**วิธีแก้ที่ทำ**
1. ใส่ `<Suspense>` รายหน้าตั้งแต่ระดับ child ลงไป (ฟังก์ชัน `renderRoutes` แบบ recursive)
   เหลือ boundary ชั้นนอกไว้โหลด Layout ครั้งแรก
2. คลิกเมนูครอบด้วย `startTransition`

ยังไม่ได้ยืนยันบนแอปจริง ถ้ายังกระพริบให้เช็กว่าไฟล์ Layout ไม่ได้ครอบ sidebar ด้วย `Suspense`
และอาจ prefetch ไฟล์หน้าตอน hover เมนู

## 6. บั๊กในโค้ดเดิมที่พบ

- `ProtectedRoutes`: `const { ok, setOk } = useState(false)` ผิด ต้องใช้ `[ ]` และตัวแปรไม่ถูกใช้
- redirect login ไม่ตรงกัน: `ProtectedRoutes` ไป `/auth/login`, `RoleBasedRoute` ไป `/login`
- ข้อความ error ใน zod `billingSettings` เป็นชื่อ field อังกฤษ (`cutoffDate` ฯลฯ) ควรเป็นภาษาไทย
- มี `console.log` debug ค้างใน `SettingApartment` (คงไว้ตามเดิม)

## 7. ขั้นตอนเมื่อได้ไฟล์ใหม่

1. อ่านโค้ด แยกให้ออกว่าส่วนไหนคือ logic (ห้ามแตะ) ส่วนไหนคือการแสดงผล
2. วาง tokens (`C`, `FONT`, `theme`, `css`) ต้นไฟล์ แล้วสร้างชิ้นส่วนที่ใช้ซ้ำ (`PageHeader`, `Section` ฯลฯ)
3. แทน style เดิมทีละส่วน ตัด `clamp()` / `window.innerWidth` / gradient / emoji ออก
4. คง props, ชื่อ field ของ react-hook-form, handler ทั้งหมด
5. ตรวจเช็กลิสต์: ปุ่มหลัก `#4F46E5`, ช่องสูง 44px, มี `aria-label`, ไม่มี field ที่เดามั่ว
6. สรุปผลเป็น 2 หัวข้อ: "ที่เปลี่ยน" / "ที่ต้องตรวจเอง"
