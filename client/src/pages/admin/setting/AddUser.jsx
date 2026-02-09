import React, { useState } from "react";
import { Form, Input, Select, Checkbox, Button, Card, Row, Col, Typography, Space, Divider } from "antd";
import { UserOutlined, LockOutlined, TeamOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import PageHeader from "../../../components/common/PageHeader";
import RegisterForm from "./components/RegisterForm";
import { createUser } from "../../../service/api/login_register";
import persistMiddleware from "../../../service/zustand/middleware/persistMiddleware";

const { Title, Text } = Typography;
const { Option } = Select;

export default function AddUserPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState({
    selectAll: false,
    create: false,
    read: false,
    update: false,
  });

  const { user } = persistMiddleware();
  const profileId = user?.userPayLoad?.user?.id

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // TODO: เรียก API สำหรับสร้าง user

      const data = {
        ...values,
        permissions: permissions,
        profileId: profileId,
      }


      const res = await createUser(data);




      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success("สร้างผู้ใช้สำเร็จ");
      form.resetFields();
      setPermissions({
        selectAll: false,
        create: false,
        read: false,
        update: false,
      });
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการสร้างผู้ใช้");
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAllChange = (checked) => {
    setPermissions({
      selectAll: checked,
      create: checked,
      read: checked,
      update: checked,
    });
  };

  const handlePermissionChange = (permission, checked) => {
    const newPermissions = {
      ...permissions,
      [permission]: checked,
    };

    // ตรวจสอบว่าทุก permission ถูกเลือกหรือไม่
    const allChecked = newPermissions.create && newPermissions.read && newPermissions.update;
    newPermissions.selectAll = allChecked;

    setPermissions(newPermissions);
  };

  return (

    <RegisterForm
      form={form}
      handleSubmit={handleSubmit}
      handleSelectAllChange={handleSelectAllChange}
      handlePermissionChange={handlePermissionChange}
      permissions={permissions}
      loading={loading}
    />

  );
}
