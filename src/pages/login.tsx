import React, { useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useRouter } from 'next/router';
import { login } from '../operation/auth.mutation';
import NextImage from 'next/image';

const Login: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    localStorage.setItem('logIn', 'true');
  }, []);

  const onFinish = (values: any) => {
    login(values.email, values.password)
      .then((data) => {
        localStorage.setItem('token', data.login?.token);
        localStorage.setItem('refreshToken', data.login?.refreshToken);
        const date = new Date();
        date.setHours(date.getHours() + 23);
        localStorage.setItem('expiredTime', date.toISOString());
        localStorage.removeItem('logIn');
        router.push('/');
      })
      .catch((error: Error) =>
        message.error(error.message || 'Oops! Please try again!')
      );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#181c20]">
      <div
        className="rounded-xl p-8 bg-[#232526] border border-[#232526] shadow-lg w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-6">
          <NextImage src="/favicon.ico" alt="Logo" className="w-12 h-12 mb-2" width={48} height={48} />
          <h2 className="text-2xl font-semibold text-[#4aa8ff] mb-1">Đăng nhập</h2>
        </div>
        <Form
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            label={<span className="text-gray-300">Email</span>}
            name="email"
            className="mb-4"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập Email!'
              }
            ]}
          >
            <Input
              type="text"
              style={{ backgroundColor: '#232526', color: '#fff', borderColor: '#3a4044', padding: '16px 18px' }}
              className="w-full rounded focus:outline-none focus:ring-2 focus:ring-[#4aa8ff]"
              placeholder="Nhập email của bạn"
              autoComplete="email"
            />
          </Form.Item>
          <Form.Item
            label={<span className="text-gray-300">Mật khẩu</span>}
            name="password"
            className="mb-6"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập mật khẩu!'
              }
            ]}
          >
            <Input.Password
              style={{ backgroundColor: '#232526', color: '#fff', borderColor: '#3a4044', padding: '16px 18px' }}
              className="w-full rounded focus:outline-none focus:ring-2 focus:ring-[#4aa8ff] placeholder-gray-400 my-input focus:border-none mb-1"
              placeholder="Nhập mật khẩu"
              autoComplete="false"
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            style={{ background: '#4aa8ff', border: 'none', color: '#3a4044', fontWeight: 600 }}
            className="w-full py-6 rounded text-base flex items-center justify-center mt-10"
          >
            <span>Đăng nhập</span>
          </Button>
        </Form>
      </div>
    </div>
  );
}

export default Login;
