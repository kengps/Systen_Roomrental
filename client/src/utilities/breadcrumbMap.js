/**
 * Breadcrumb Title Mapping Utility
 * Maps route segments to Thai titles for breadcrumb navigation
 */

export const titleBreadcrumbMap = {
  // Admin Routes
  'admin': 'แอดมิน',
  'dashboard': 'แดชบอร์ด',
  'home': 'หน้าแรก',
  'mainpage': 'หน้าแรก',

  // Room Management
  'addroom': 'เพิ่มห้องพัก',
  'listroom': 'ห้องพัก',
  'rooms': 'ห้องพัก',
  'room': 'ห้องพัก',

  // User Management
  'tenantManagement': 'ผู้เช่า',
  'tenant': 'ผู้เช่า',
  'addUser': 'เพิ่มผู้ใช้งาน',
  'manageUser': 'จัดการผู้ใช้งาน',
  'settingUser': 'ตั้งค่าผู้ใช้',
  'user': 'ผู้ใช้',
  'unitMeter': 'หน่วยมิเตอร์',

  // Apartment Management
  'apartment': 'อพาร์ทเมนท์',
  'apartments': 'อพาร์ทเมนท์',
  'botTelegram': 'บอท',
  'log': 'บันทึกการอัปเดต',
  // Billing & Payment
  'billing': 'บิล',
  'bill': 'บิล',
  'payment': 'ชำระเงิน',
  'payments': 'ชำระเงิน',
  'rent': 'เช่า',

  // Services & Utilities
  'services': 'บริการ',
  'sevices': 'บริการ', // Note: keeping typo for backward compatibility
  'meters': 'มิเตอร์',
  'meter': 'มิเตอร์',

  // Banking
  'bank': 'ธนาคาร',
  'banks': 'ธนาคาร',
  'bankAccount': 'บัญชีธนาคาร',

  // Settings
  'setting': 'ตั้งค่า',
  'settings': 'ตั้งค่า',
  'stepper': 'stepper',

  // Tables & Data
  'table': 'ตาราง',
  'tables': 'ตาราง',

  // Other Options
  'option4': 'ตัวเลือก 4',
  'options': 'ตัวเลือก',

  // Member Routes
  'member': 'สมาชิก',
  'members': 'สมาชิก',
  'history': 'ประวัติ',
  'informations': 'ข้อมูล',
  'information': 'ข้อมูล',

  // Authentication
  'login': 'เข้าสู่ระบบ',
  'register': 'สมัครสมาชิก',
  'auth': 'การยืนยันตัวตน',

  // Common
  'create': 'สร้าง',
  'edit': 'แก้ไข',
  'update': 'อัปเดต',
  'delete': 'ลบ',
  'view': 'ดู',
  'list': 'รายการ',
  'detail': 'รายละเอียด',
  'profile': 'โปรไฟล์',
  'account': 'บัญชี',
  'system': 'ระบบ',
  'config': 'การตั้งค่า',
  'management': 'การจัดการ',
  'admin-panel': 'แผงควบคุม',
  'control-panel': 'แผงควบคุม'
};

/**
 * Get breadcrumb title for a route segment
 * @param {string} segment - Route segment
 * @returns {string} - Thai title for the segment
 */
export const getBreadcrumbTitle = (segment) => {
  return titleBreadcrumbMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
};

/**
 * Get all available breadcrumb mappings
 * @returns {Object} - Complete breadcrumb mapping object
 */
export const getAllBreadcrumbMappings = () => {
  return { ...titleBreadcrumbMap };
};

/**
 * Add custom breadcrumb mapping
 * @param {string} key - Route segment
 * @param {string} title - Thai title
 */
export const addBreadcrumbMapping = (key, title) => {
  titleBreadcrumbMap[key] = title;
};

/**
 * Remove breadcrumb mapping
 * @param {string} key - Route segment to remove
 */
export const removeBreadcrumbMapping = (key) => {
  delete titleBreadcrumbMap[key];
};

/**
 * Check if a route segment has a custom mapping
 * @param {string} segment - Route segment
 * @returns {boolean} - True if mapping exists
 */
export const hasBreadcrumbMapping = (segment) => {
  return segment in titleBreadcrumbMap;
};

export default titleBreadcrumbMap;
