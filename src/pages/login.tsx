import React from 'react';
import styled from 'styled-components';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { login } from '../operation/auth.mutation';

const StyledFromWrap = styled.div`
  padding: 20px;
  margin: 100px auto;
  width: 50%;
  background: floralwhite;
`;

const Login: React.FC = () => {
  const router = useRouter();
  const onFinish = (values: any) => {
    login(values.email, values.password).then((data) => {
      localStorage.setItem('token', data.login?.token);
      localStorage.setItem('refreshToken', data.login?.refreshToken);

      const date = new Date();

      date.setHours(date.getHours() + 1);
      localStorage.setItem('expiredTime', date.toISOString());

      router.push('/');
    })
      .catch((error: Error) => message.error(error.message || 'Oops! Please try again!'));
  };

  return (
    <StyledFromWrap>
      <Form
        initialValues={{
          remember: true
        }}
        onFinish={onFinish}
      >
        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              message: 'Please input your Username!'
            }
          ]}
        >
          <Input prefix={<UserOutlined className="site-form-item-icon"/>} placeholder="Username"/>
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: 'Please input your Password!'
            }
          ]}
        >
          <Input
            prefix={<LockOutlined className="site-form-item-icon"/>}
            type="password"
            placeholder="Password"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-form-button">
            Log in
          </Button>
        </Form.Item>
      </Form>
    </StyledFromWrap>
  );
};

export default Login;
  