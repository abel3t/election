import { Col, Input, message, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import AppLayout from '../components/app-layout';
import ElectionCard from '../components/election-card';
import styled from 'styled-components';
import PaginationCard from '../components/pagination';
import { useRouter } from 'next/router';
import { getElections } from '../operation/election.query';

const StyledSearchAndCreateButton = styled(Row)`
  margin-bottom: 15px;
`;

const StyledPagination = styled(Row)`
  margin-top: 15px;

  .ant-col {
    display: flex;
    justify-content: flex-end;
  }
`;

const App: React.FC = () => {
  const [elections, setElections] = useState([]);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    getElections().then((data: any) => setElections(data.getElections || [])).catch((error: Error) => message.error(error?.message));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated]);

  const onSignOut = () => {
    // signOut();
    router.push('/login');
  };

  return (
    <AppLayout>
      <>
        <StyledSearchAndCreateButton>
          <Col span={8} offset={10}>
            <Input placeholder="Basic usage"/>
          </Col>
          <Col span={4} offset={2}>
            <div>
              <button
                onClick={() =>
                  isAuthenticated
                    ? onSignOut()
                    : router.push('/login')
                }
              >
                {isAuthenticated ? 'Logout' : 'LogIn'}
              </button>
            </div>
          </Col>
        </StyledSearchAndCreateButton>

        <div>
          {
            elections?.map((election: any) => <ElectionCard key={election.id} title={election.name} href={`/elections/${election.id}`}/>)
          }
        </div>

        <StyledPagination justify="end">
          <Col span={10}>
            <PaginationCard currentPage={1} total={50}/>
          </Col>
        </StyledPagination>
      </>
    </AppLayout>
  );
};

export default App;