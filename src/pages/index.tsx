import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal
} from 'antd';
import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import AppLayout from '../components/app-layout';
import ElectionCard from '../components/election-card';
import PaginationCard from '../components/pagination';
import { useRouter } from 'next/router';
import { getElections } from '../operation/election.query';
import { NextPage } from 'next';
import { createElection } from '../operation/election.mutation';

const App: NextPage = () => {
  const [elections, setElections] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoad, setIsLoad] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const itemsPerPage = 10;

  useEffect(() => {
    localStorage.removeItem('guest');
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    setIsPageLoading(true);
    // Defensive: Only fetch if window is defined and token is present
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        getElections()
          .then((data: any) => setElections(data?.getElections || []))
          .catch((error: Error) => message.error(error?.message))
          .finally(() => setIsPageLoading(false));
      } else {
        setIsPageLoading(false);
      }
    } else {
      setIsPageLoading(false);
    }
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
    console.log(maxSelected);
    createElection(name, maxSelected)
      .then(() => {
        setIsModalOpen(false);

        form.resetFields();
        setIsLoad(!isLoad);
      })
      .catch((error: Error) => message.error(error?.message));
  };

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  if (isPageLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(21,24,26,0.85)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
        <style jsx global>{`
          .ant-spin-dot-item {
            background-color: #fcbb1d !important;
          }
        `}</style>
      </div>
    );
  }

  return (
    <AppLayout>
      <div>
        <div className="w-full max-w-full mt-6 md:w-full md:flex-none">
          <div
            className="relative flex flex-col min-w-0 break-words border-0 shadow-soft-xl rounded-2xl bg-clip-border"
            style={{ backgroundColor: '#15181a' }}>
            <div className="p-6 px-4 pb-0 mb-0 border-b-0 rounded-t-2xl" style={{ backgroundColor: '#15181a' }}>
              <Button
                type="primary"
                onClick={showModal}
                className="font-bold px-4 rounded bg-[#fcbb1d] text-[#15181a] border-none hover:bg-[#fcbb1d] hover:bg-opacity-70 hover:text-[#15181a]"
              >
                Tạo bầu cử
              </Button>
            </div>

            <Modal
              title="Tạo cuộc bầu cử"
              open={isModalOpen}
              onCancel={handleCancel}
              className={'dark-modal'}
              footer={[
                <Button
                  form="CreateForm"
                  key="submit"
                  htmlType="submit"
                  style={{ backgroundColor: '#fcbb1d', borderColor: '#fcbb1d', color: '#15181a' }}
                  className="font-bold px-4 rounded"
                >
                  Tạo bầu cử
                </Button>
              ]}
            >
              <Form
                {...{ labelCol: { span: 8 }, wrapperCol: { span: 16 } }}
                form={form}
                name="control-hooks"
                id="CreateForm"
                initialValues={{ name: '', maxSelected: 5 }}
                onFinish={onFinish}
              >
                <Form.Item
                  name="name"
                  label="Tên cuộc bầu cử"
                  rules={[{ required: true }]}
                >
                  <Input/>
                </Form.Item>
                <Form.Item
                  name="maxSelected"
                  label="Số lượng được chọn"
                  rules={[{ required: true }]}
                >
                  <InputNumber min={1} max={10}/>
                </Form.Item>
              </Form>
            </Modal>

            <div className="flex-auto p-4 pt-6" style={{ backgroundColor: '#15181a' }}>
              <ul className="pl-0 mb-0 rounded-lg">
                {elections
                  ?.slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                  )
                  .map((election: any) => (
                    <ElectionCard
                      key={election.id}
                      isLoad={isLoad}
                      setIsLoad={setIsLoad}
                      election={election}
                    />
                  ))}
              </ul>
            </div>
          </div>
        </div>

        {elections.length >= 10 && (
          <div className="mt-5 p-4">
            <PaginationCard
              currentPage={currentPage}
              total={elections.length}
              itemsPerPage={itemsPerPage}
              onChange={handleChangePage}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default App;
