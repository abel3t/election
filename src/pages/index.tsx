import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal
} from 'antd';
import React, { useEffect, useState } from 'react';
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

  const itemsPerPage = 10;

  useEffect(() => {
    localStorage.removeItem('guest');
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

  return (
    <AppLayout>
      <div>
        <div className="w-full max-w-full mt-6 md:w-full md:flex-none">
          <div
            className="relative flex flex-col min-w-0 break-words bg-slate-800 border-0 shadow-soft-xl rounded-2xl bg-clip-border">
            <div className="p-6 px-4 pb-0 mb-0 bg-slate-800 border-b-0 rounded-t-2xl">
              <Button
                type="primary"
                onClick={showModal}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded"
              >
                T???o b???u c???
              </Button>
            </div>

            <Modal
              title="T???o cu???c b???u c???"
              open={isModalOpen}
              onCancel={handleCancel}
              className={'dark-modal'}
              footer={[
                <Button
                  form="CreateForm"
                  key="submit"
                  htmlType="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded"
                >
                  T???o b???u c???
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
                  label="T??n cu???c b???u c???"
                  rules={[{ required: true }]}
                >
                  <Input/>
                </Form.Item>
                <Form.Item
                  name="maxSelected"
                  label="S??? l?????ng ???????c ch???n"
                  rules={[{ required: true }]}
                >
                  <InputNumber min={1} max={10}/>
                </Form.Item>
              </Form>
            </Modal>

            <div className="flex-auto p-4 pt-6 bg-slate-800">
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

        <div className="mt-5 p-4">
          <PaginationCard
            currentPage={currentPage}
            total={elections.length}
            itemsPerPage={itemsPerPage}
            onChange={handleChangePage}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default App;
