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
import {
  cloneElection,
  deleteElection,
  updateElection
} from '../operation/election.mutation';
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
      })
      .catch((error: Error) => {
        message.error(error?.message);
        setIsModalOpen(false);
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

  const handleDeleteElection = () => {
    deleteElection(id)
      .then(() => {
        message.success('Xoá thành công!');
        setIsLoad(!isLoad);
      })
      .catch((error: Error) => {
        console.log(error);
        message.error('Xoá thất bại!');
      });
  };

  return (
    <li className='my-3'>
      <div
        className="flex"
        style={{
          backgroundColor: '#15181a',
          justifyContent: 'space-between',
          borderRadius: '0.7em',
          boxShadow: '0 2px 8px 0 rgb(153 166 166 / 30%)'
        }}
      >
        <Link href={href}>
          <p
            className="font-bold text-white cursor-pointer w-full py-4 px-2 hover:opacity-75"
            style={{ cursor: 'pointer', fontSize: '1.5em' }}
          >
            {title}
          </p>
        </Link>

        <div className="flex items-center px-2">
          <div className="text-sm">
            <Popconfirm
              title="Bạn chắc chắn sao chép？"
              okText="Sao chép"
              cancelText="Trở lại"
              onConfirm={handleCloneElection}
              overlayClassName="dark-popconfirm rounded-md overflow-hidden"
              className='rounded-md overflow-hidden'
              cancelButtonProps={{
                style: { backgroundColor: '#4aa8ff', borderColor: '#4aa8ff', color: '#15181a' },
                className: 'font-bold px-4 rounded hover:opacity-75'
              }}
              okButtonProps={{
                style: { backgroundColor: '#4aa8ff', borderColor: '#4aa8ff', color: '#15181a' },
                className: 'font-bold px-4 rounded text-red hover:opacity-75'
              }}
            >
              <Button className="font-bold px-4 rounded bg-[#4aa8ff] text-[#15181a] border-none focus:bg-[#4aa8ff] focus:text-[#15181a] hover:bg-[#4aa8ff] hover:bg-opacity-70 hover:text-[#15181a]">
                Sao chép
              </Button>
            </Popconfirm>
          </div>

          <div className="inline-flex ml-2 items-center text-base font-semibold">
            <Button
              onClick={showModal}
              className="font-bold px-4 rounded bg-[#4aa8ff] text-[#15181a] border-none focus:bg-[#4aa8ff] focus:text-[#15181a] hover:bg-[#4aa8ff] hover:bg-opacity-70 hover:text-[#15181a]"
            >
              Chỉnh sửa
            </Button>
          </div>

          <div className="ml-2 text-sm text-gray-500 truncate dark:text-gray-400">
            <Popconfirm
              title="Bạn chắc chắn xoá？"
              okText="Xoá"
              cancelText="Trở lại"
              onConfirm={handleDeleteElection}
              overlayClassName="dark-popconfirm"
              cancelButtonProps={{
                style: { backgroundColor: '#4aa8ff', border: 'none', color: '#15181a' },
                className: 'font-bold px-4 rounded'
              }}
              okButtonProps={{
                style: { backgroundColor: '#da0e0e', border: 'none', color: '#15181a' },
                className: 'font-bold px-4 rounded'
              }}
            >
              <Button className="font-bold px-4 rounded bg-[#da0e0e] text-[#15181a] border-none hover:bg-[#da0e0e] hover:bg-opacity-70 hover:text-[#15181a] focus:bg-[#da0e0e] focus:text-[#15181a]">
                Xoá
              </Button>
            </Popconfirm>
          </div>
        </div>
      </div>

      <Modal
        title={<span style={{ color: '#ffffff' }}>Chỉnh sửa bầu cử</span>}
        open={isModalOpen}
        onCancel={handleCancel}
        className="dark-modal"
        style={{
          top: 20,
        }}
        bodyStyle={{
          backgroundColor: '#15181a',
          color: '#ffffff'
        }}
        maskStyle={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }}
        footer={[
          <Button 
            form="UpdateForm" 
            key="submit" 
            htmlType="submit"
            className="font-bold px-4 rounded bg-[#4aa8ff] text-[#15181a] border-none hover:bg-[#4aa8ff] hover:bg-opacity-75 hover:opacity-75 hover:text-[#15181a] focus:bg-[#4aa8ff] focus:text-[#15181a]"
          >
            Sửa
          </Button>
        ]}
      >
        <style jsx global>{`
          .dark-modal .ant-modal-content {
            background-color: #15181a !important;
            border: none !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6) !important;
            border: 1px solid #3a4044 !important;
            height: 30vh !important;
            top: 100px !important;
            overflow: hidden !important;
          }
          .dark-modal .ant-modal-header {
            background-color: #15181a !important;
            border-bottom: none !important;
            padding: 16px 24px !important;
          }
          .dark-modal .ant-modal-body {
            background-color: #15181a !important;
            padding: 24px !important;
          }
          .dark-modal .ant-modal-footer {
            background-color: #15181a !important;
            border-top: none !important;
            padding: 10px 16px 16px !important;
          }
          .dark-modal .ant-modal-close {
            color: #ffffff !important;
          }
          .dark-modal .ant-modal-close:hover {
            color: #4aa8ff !important;
            background-color: rgba(252, 187, 29, 0.1) !important;
          }
          .dark-modal .ant-form-item-label > label {
            color: #ffffff !important;
          }
          .dark-modal .ant-input:focus,
          .dark-modal .ant-input-focused {
            border-color: #4aa8ff !important;
            box-shadow: 0 0 0 2px rgba(252, 187, 29, 0.2) !important;
          }
          .dark-modal .ant-input-number:focus,
          .dark-modal .ant-input-number-focused {
            border-color: #4aa8ff !important;
            box-shadow: 0 0 0 2px rgba(252, 187, 29, 0.2) !important;
          }
        `}</style>
        <Form
          {...{ labelCol: { span: 8 }, wrapperCol: { span: 16 } }}
          form={form}
          name="control-hooks"
          id="UpdateForm"
          onFinish={onFinish}
        >
          <Form.Item 
            name="name" 
            label="Tên cuộc bầu cử"
          >
            <Input 
              defaultValue={title}
              style={{ 
                backgroundColor: '#2a2d30', 
                borderColor: '#333', 
                color: '#ffffff' 
              }}
            />
          </Form.Item>
          <Form.Item 
            name="maxSelected" 
            label="Số lượng được chọn"
          >
            <InputNumber 
              min={1} 
              max={10} 
              defaultValue={defaultMaxSelected}
              style={{ 
                backgroundColor: '#2a2d30', 
                borderColor: '#333', 
                color: '#ffffff',
                width: '100%'
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </li>
  );
};

export default ElectionCard;
