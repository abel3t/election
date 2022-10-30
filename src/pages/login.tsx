import React, { useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useRouter } from 'next/router';
import { login } from '../operation/auth.mutation';

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
    <div className="container px-6 py-48 h-full">
      <div className="flex justify-center items-center flex-wrap h-full g-6 text-gray-800">
        <div className="md:w-8/12 lg:w-5/12 lg:ml-20">
          <Form
            initialValues={{
              remember: true
            }}
            onFinish={onFinish}
          >
            <Form.Item
              className="mb-6"
              name="email"
              rules={[
                {
                  required: true,
                  message: 'Please input your Username!'
                }
              ]}
            >
              <Input
                type="text"
                className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                placeholder="Email address"
              />
            </Form.Item>
            <Form.Item
              className="mb-6"
              name="password"
              rules={[
                {
                  required: true,
                  message: 'Please input your Password!'
                }
              ]}
            >
              <Input
                type="password"
                className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                placeholder="Password"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              className="inline-block px-7 bg-blue-600 text-white font-medium text-sm leading-snug uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out w-full"
              data-mdb-ripple="true"
              data-mdb-ripple-color="light"
            >
              Log in
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
