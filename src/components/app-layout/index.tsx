import { Layout } from 'antd';
import React from 'react';
import styled from 'styled-components';

const { Header, Footer, Content } = Layout;

type Props = {
  children: JSX.Element,
};

const StyledContent = styled(Content)`
  padding: 10px 50px;
`

const AppLayout = ({ children }: Props) => (
  <Layout>
    <Header>
      Bầu Cử
    </Header>

    <StyledContent>
      {
        children
      }
    </StyledContent>

    <Footer>
      © 2022 - Bản quyền thuộc về LEC
    </Footer>
  </Layout>
);

export default AppLayout;