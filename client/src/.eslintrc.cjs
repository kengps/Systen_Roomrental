module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { 
    react: { version: '18.2' },
    // เพิ่ม settings สำหรับ import plugin
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx']
      }
    }
  },
  plugins: ['react-refresh', 'import'],
  rules: {
    'no-undef': 'error', // แจ้งเตือนตัวแปรที่ไม่ได้ประกาศ
    'no-unused-vars': 'warn', // เอาออกตัวที่ซ้ำ
    'react/prop-types': 'off', // ย้ายเข้ามาใน rules
    // ตรวจสอบ missing imports
    'import/no-unresolved': 'error',
    'import/named': 'error',
    'import/default': 'error',
    'import/namespace': 'error',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}