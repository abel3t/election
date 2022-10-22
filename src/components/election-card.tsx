import React, { useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm
} from 'antd';
import { cloneElection, updateElection } from '../operation/election.mutation';
import Link from 'next/link';

const ElectionCard = ({ isLoad, setIsLoad, election }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { id, name: title, maxSelected: defaultMaxSelected } = election;

  const href = `/elections/${election.id}`;

  const showModal = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  const [form] = Form.useForm();

  const onFinish = ({ name, maxSelected }: any) => {
    updateElection(id, name || title, maxSelected || defaultMaxSelected)
      .then(() => {
        setIsModalOpen(false);
        setIsLoad(!isLoad);

        form.resetFields();
      })
      .catch((error: Error) => {
        form.resetFields();
        message.error(error?.message);
      });
  };

  const handleCloneElection = () => {
    cloneElection(id)
      .then(() => {
        message.success('Sao chép thành công!');
        setIsLoad(!isLoad);
      })
      .catch((error: Error) => {
        console.log(error);
        message.error('Sao chép thất bại!');
      });
  };

  return (
    <li className="mt-4 mb-2">
      <div
        className="flex"
        style={{
          justifyContent: 'space-between',
          borderRadius: '0.7em',
          padding: '1.5em',
          boxShadow: '0 2px 8px 0 rgb(153 166 166 / 30%)'
        }}
      >
        <Link href={href}>
          <p
            className="font-bold text-gray-900 cursor-pointer"
            style={{ cursor: 'pointer', fontSize: '1.5em' }}
          >
            {title}
          </p>
        </Link>

        <div className="flex">
          <div className="text-sm text-gray-500 truncate dark:text-gray-400">
            <Popconfirm
              title="Bạn chắc chắn sao chép？"
              okText="Sao chép"
              cancelText="Trở lại"
              onConfirm={handleCloneElection}
              cancelButtonProps={{
                className:
                  'bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded'
              }}
              okButtonProps={{
                className:
                  'bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded'
              }}
            >
              <Button className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded">
                Sao chép
              </Button>
            </Popconfirm>
          </div>

          <div className="inline-flex ml-2 items-center text-base font-semibold text-gray-900 dark:text-white">
            <Button
              onClick={showModal}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded"
            >
              Chỉnh sửa
            </Button>
          </div>
        </div>
      </div>

      <Modal
        title="Chỉnh sửa bầu cử"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button form="UpdateForm" key="submit" htmlType="submit">
            Sửa
          </Button>
        ]}
      >
        <Form
          {...{ labelCol: { span: 8 }, wrapperCol: { span: 16 } }}
          form={form}
          name="control-hooks"
          id="UpdateForm"
          onFinish={onFinish}
        >
          <Form.Item name="name" label="Tên cuộc bầu cử">
            <Input defaultValue={title} />
          </Form.Item>
          <Form.Item name="maxSelected" label="Số lượng được chọn">
            <InputNumber min={1} max={10} defaultValue={defaultMaxSelected} />
          </Form.Item>
        </Form>
      </Modal>
    </li>
  );
};

export default ElectionCard;
