import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Form, Input, Button, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login } from '../apollo-client';
import { useMutation } from '@apollo/client';
import { LOGIN } from '../mutation';


const StyledFromWrap = styled.div`
  padding: 20px;
  margin: 100px auto;
  width: 50%;
  background: floralwhite;
`;

const Login: React.FC = () => {
  const onFinish = (values: any) => {
    console.log('Received values of form: ', values);
  };

  const [login, { data, loading, error }] = useMutation(LOGIN);

  useEffect(() => {
    login({ variables: { input: { email: 'abeltran.develop@gmail.com', password: '12345@bC' } }})
      .then(data => console.log(data))
      .catch(error => console.log(error))

  }, [])

  //
  // const onLogin = (email: string, password: string) => {
  //   login(email, password).then(data => console.log(data)).catch(error => console.log(error));
  // }

  return (
    <StyledFromWrap>
      <Form
        initialValues={{
          remember: true
        }}
        onFinish={onFinish}
      >
        <Form.Item
          name="username"
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
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>
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
  