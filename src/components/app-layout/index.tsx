import { Button, Layout } from 'antd';
import React from 'react';
import Link from 'next/link';

const { Header, Footer } = Layout;

type Props = {
  children: JSX.Element;
};

const AppLayout = ({ children }: Props) => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <Layout>
      <Header
        className="px-2 lg:px-32 font-bold text-2xl cursor-pointer flex"
        style={{ justifyContent: 'space-between', paddingTop: '12px' }}
      >
        <Link href="/">
          <a className="text-sm text-white text-3xl">Bầu Cử</a>
        </Link>
        <div>
          <Button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded"
            onClick={handleLogout}
          >
            Đăng Xuất
          </Button>
        </div>
      </Header>

      <div className="px-2 lg:px-32 min-h-full text-white bg-slate-800" style={{ minHeight: '84vh' }}>
        {children}
      </div>

      <Footer className="bg-slate-800 text-white">© 2022 - Bản quyền thuộc về LEC</Footer>
    </Layout>
  );
};

export default AppLayout;
