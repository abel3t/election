import { Button, Col, Form, Input, InputNumber, message, Modal, Row, Upload } from 'antd';
import React, { useEffect, useState } from 'react';
import AppLayout from '../components/app-layout';
import ElectionCard from '../components/election-card';
import styled from 'styled-components';
import PaginationCard from '../components/pagination';
import { useRouter } from 'next/router';
import { getElections } from '../operation/election.query';
import { NextPage } from 'next';
import { createElection } from '../operation/election.mutation';
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

const App: NextPage = () => {
  const [elections, setElections] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoad, setIsLoad] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    getElections()
      .then((data: any) => setElections(data?.getElections || []))
      .catch((error: Error) => message.error(error?.message));
  }, [isLoad]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated]);

  const onSignOut = () => {
    // signOut();
    router.push('/login');
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };


  const [form] = Form.useForm();

  const onFinish = ({ name, maxSelected }: any) => {
    createElection(name, maxSelected)
      .then(() => {
        setIsModalOpen(false);

        form.resetFields();
        setIsLoad(!isLoad);

      })
      .catch((error: Error) => message.error(error?.message));
  };


  return (
    <AppLayout>
      <>
        <StyledSearchAndCreateButton>
          <Col span={8} offset={10}>
            <Input placeholder="Basic usage"/>
          </Col>
          <Col span={4} offset={2}>
            <Button type="primary" onClick={showModal}>Create</Button>
          </Col>
        </StyledSearchAndCreateButton>

        <Modal title="Basic Modal" open={isModalOpen} onCancel={handleCancel}
               footer={[
                 <Button form="CreateForm" key="submit" htmlType="submit">
                   Submit
                 </Button>
               ]}
        >
          <Form {...{ labelCol: { span: 8 }, wrapperCol: { span: 16 } }} form={form} name="control-hooks" id="CreateForm"
                onFinish={onFinish}>
            <Form.Item name="name" label="Tên cuộc bầu cử" rules={[{ required: true }]}>
              <Input/>
            </Form.Item>
            <Form.Item name="maxSelected" label="Số lượng được chọn" rules={[{ required: true }]}>
              <InputNumber min={1} max={10} defaultValue={5} />
            </Form.Item>
          </Form>
        </Modal>

        <div>
          {
            elections?.map((election: any) => <ElectionCard key={election.id} isLoad={isLoad} setIsLoad={setIsLoad} election={election}/>)
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