import { Layout } from 'antd';
import React from 'react';
import Link from 'next/link';

const { Header, Footer, Content } = Layout;

type Props = {
  children: JSX.Element,
};

const AppLayout = ({ children }: Props) => (
  <Layout>
    <Header className="px-2 lg:px-32 font-bold text-2xl cursor-pointer">
      <Link href="/">
        <a className="text-sm hover:text-gray-600 text-3xl">Bầu Cử</a>
      </Link>
    </Header>

    <div className="px-2 lg:px-32 min-h-full" style={{ minHeight: '84vh' }}>
      {
        children
      }
    </div>

    <Footer>
      © 2022 - Bản quyền thuộc về LEC
    </Footer>
  </Layout>
);

export default AppLayout;