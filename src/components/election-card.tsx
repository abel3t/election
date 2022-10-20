import React, { useState } from 'react';
import { Button, Col, Form, Input, InputNumber, message, Modal, Popconfirm, Row } from 'antd';
import Link from 'next/link';
import { cloneElection, updateElection } from '../operation/election.mutation';

const ElectionCard = ({ isLoad, setIsLoad, election }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    id,
    name: title,
    maxSelected: defaultMaxSelected
  } = election;

  const href = `/election/${election.id}`;

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
    <Row justify="space-around" align="middle">
      <Link href={href}>
        <Col span={8}>
          {title}
        </Col>
      </Link>
      <Col span={4}>
        <Popconfirm title="Bạn chắc chắn sao chép？" okText="Sao chép" cancelText="Trở lại"
                    onConfirm={handleCloneElection}>
          <Button>Sao chép</Button>
        </Popconfirm>

      </Col>
      <Col span={4}>
        <Button onClick={showModal}>Chỉnh sửa</Button>
      </Col>

      <Modal title="Basic Modal" open={isModalOpen} onCancel={handleCancel}
             footer={[
               <Button form="UpdateForm" key="submit" htmlType="submit">
                 Submit
               </Button>
             ]}
      >
        <Form {...{ labelCol: { span: 8 }, wrapperCol: { span: 16 } }} form={form} name="control-hooks" id="UpdateForm"
              onFinish={onFinish}>
          <Form.Item name="name" label="Tên cuộc bầu cử">
            <Input defaultValue={title}/>
          </Form.Item>
          <Form.Item name="maxSelected" label="Số lượng được chọn">
            <InputNumber min={1} max={10} defaultValue={defaultMaxSelected}/>
          </Form.Item>
        </Form>
      </Modal>
    </Row>
  );
};

export default ElectionCard;