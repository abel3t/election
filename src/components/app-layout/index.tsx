import { Layout } from 'antd';
import React from 'react';

const { Header, Footer, Content } = Layout;

type Props = {
  children: JSX.Element,
};

const AppLayout = ({ children }: Props) => (
  <Layout >
    <Header>
      Bầu Cử
    </Header>

    <div className="px-32 min-h-full" style={{minHeight: '84vh'}}>
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