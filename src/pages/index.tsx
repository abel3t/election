import { Layout } from 'antd';
import React from 'react';

const { Header, Footer, Sider, Content } = Layout;

const App: React.FC = () => (
  <>
    <Layout>
      <Header>Header</Header>
      <Content>content</Content>
      <Footer>Footer</Footer>
    </Layout>
    </>
);

export default App;