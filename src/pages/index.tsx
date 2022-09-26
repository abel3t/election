import { Col, Input, Layout, Row } from 'antd';
import React from 'react';
import AppLayout from '../components/app-layout';
import ElectionCard from '../components/election-card';
import styled from 'styled-components';
import PaginationCard from '../components/pagination';

const StyledSearchAndCreateButton = styled(Row)`
  margin-bottom: 15px;
`;

const StyledPagination = styled(Row)`
  margin-top: 15px;
  .ant-col {
    display: flex;
    justify-content: flex-end;
  }
`

const App: React.FC = () => (
  <AppLayout>
    <>
      <StyledSearchAndCreateButton>
        <Col span={8} offset={10}>
          <Input placeholder="Basic usage" />
        </Col>
        <Col span={4} offset={2}>
          col-8
        </Col>
      </StyledSearchAndCreateButton>

      <div>

        <ElectionCard title="Lễ tối 23/01/129" href={"/election/1234"}/>
        <ElectionCard title="Lễ sáng 23/0123121/129" href={"/election/1234"}/>
        <ElectionCard title="Lễ tối 23/01/12123123" href={"/election/1234"}/>
        <ElectionCard title="Lễ trưa 12313 23/01/129" href={"/election/1234"}/>
        <ElectionCard title="Lễ sáng afasfasd 23/01/129" href={"/election/1234"}/>
      </div>

      <StyledPagination justify="end">
        <Col span={10}>
          <PaginationCard currentPage={1} total={50} />
        </Col>
      </StyledPagination>
    </>
  </AppLayout>
);

export default App;