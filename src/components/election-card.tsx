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
    <li className="mt-4 mb-2">
      <div
        className="flex"
        style={{
          backgroundColor: '#15181a',
          justifyContent: 'space-between',
          borderRadius: '0.7em',
          padding: '1.5em',
          boxShadow: '0 2px 8px 0 rgb(153 166 166 / 30%)'
        }}
      >
        <Link href={href}>
          <p
            className="font-bold text-white cursor-pointer"
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
              overlayClassName="dark-popconfirm"
              cancelButtonProps={{
                style: { backgroundColor: '#fcbb1d', borderColor: '#fcbb1d', color: '#15181a' },
                className: 'font-bold px-4 rounded'
              }}
              okButtonProps={{
                style: { backgroundColor: '#fcbb1d', borderColor: '#fcbb1d', color: '#15181a' },
                className: 'font-bold px-4 rounded'
              }}
            >
              <Button style={{ backgroundColor: '#fcbb1d', borderColor: '#fcbb1d', color: '#15181a' }} className="font-bold px-4 rounded">
                Sao chép
              </Button>
            </Popconfirm>
          </div>

          <div className="inline-flex ml-2 items-center text-base font-semibold text-gray-900 dark:text-white">
            <Button
              onClick={showModal}
              style={{ backgroundColor: '#fcbb1d', borderColor: '#fcbb1d', color: '#15181a' }}
              className="font-bold px-4 rounded"
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
                style: { backgroundColor: '#fcbb1d', borderColor: '#fcbb1d', color: '#15181a' },
                className: 'font-bold px-4 rounded'
              }}
              okButtonProps={{
                style: { backgroundColor: '#da0e0e', borderColor: '#da0e0e', color: '#ffffff' },
                className: 'font-bold px-4 rounded'
              }}
            >
              <Button style={{ backgroundColor: '#da0e0e', borderColor: '#da0e0e', color: '#ffffff' }} className="font-bold px-4 rounded">
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
            style={{ backgroundColor: '#fcbb1d', borderColor: '#fcbb1d', color: '#15181a' }}
            className="font-bold px-4 rounded"
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
            color: #fcbb1d !important;
            background-color: rgba(252, 187, 29, 0.1) !important;
          }
          .dark-modal .ant-form-item-label > label {
            color: #ffffff !important;
          }
          .dark-modal .ant-input:focus,
          .dark-modal .ant-input-focused {
            border-color: #fcbb1d !important;
            box-shadow: 0 0 0 2px rgba(252, 187, 29, 0.2) !important;
          }
          .dark-modal .ant-input-number:focus,
          .dark-modal .ant-input-number-focused {
            border-color: #fcbb1d !important;
            box-shadow: 0 0 0 2px rgba(252, 187, 29, 0.2) !important;
          }
          .dark-popconfirm .ant-popover-content {
            background-color: #15181a !important;
            border: 1px solid #333 !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6) !important;
          }
          .dark-popconfirm .ant-popover-inner {
            background-color: #15181a !important;
            color: #ffffff !important;
          }
          .dark-popconfirm .ant-popover-title {
            background-color: #15181a !important;
            color: #ffffff !important;
            border-bottom: 1px solid #333 !important;
          }
          .dark-popconfirm .ant-popover-inner-content {
            background-color: #15181a !important;
            color: #ffffff !important;
          }
          .dark-popconfirm .ant-popconfirm-message {
            color: #ffffff !important;
          }
          .dark-popconfirm .ant-popconfirm-message-title {
            color: #ffffff !important;
          }
          .dark-popconfirm .ant-popconfirm-message-icon {
            color: #fcbb1d !important;
          }
          .dark-popconfirm .ant-popconfirm-buttons {
            margin-top: 8px !important;
          }
          .dark-popconfirm .ant-popover-arrow {
            border-color: #15181a !important;
          }
          .dark-popconfirm .ant-popover-arrow::before {
            background-color: #15181a !important;
            border-color: #333 !important;
          }
          .dark-popconfirm .ant-popover-arrow::after {
            background-color: #15181a !important;
          }
          .dark-popconfirm * {
            color: #ffffff !important;
          }
          .dark-popconfirm .anticon {
            color: #fcbb1d !important;
          }
          .dark-popconfirm .ant-popconfirm-message .anticon {
            color: #fcbb1d !important;
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
