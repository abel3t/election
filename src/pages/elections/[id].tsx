import { Button, Form, Input, message, Modal, Table, Tabs, Upload } from 'antd';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import type { ColumnsType, TableProps } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/app-layout';
import { getCandidates, getCodes } from '../../operation/election.query';
import { useRouter } from 'next/router';
import { createCandidate, generateCodes } from '../../operation/election.mutation';

interface DataType {
  key: React.Key;
  index?: number;
  imageUrl?: string;
  name: string;
}

interface CodeDataType {
  key: React.Key;
  index?: number;
  isActive: boolean;
  downloaded: number;
  isUsed: boolean;
  name: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: 'ID',
    dataIndex: 'index',
    width: '30%'
  },
  {
    title: 'Image',
    dataIndex: 'imageUrl',
    width: '30%'
  },
  {
    title: 'Name',
    dataIndex: 'name',
    filterMode: 'tree',
    filterSearch: true,
    onFilter: (value: string, record) => record.name.includes(value),
    width: '30%'
  }
];

const codeColumns: ColumnsType<DataType> = [
  {
    title: 'ID',
    dataIndex: 'index',
    width: '30%'
  },
  {
    title: 'Mã Bầu Cử',
    dataIndex: 'id',
    width: '30%'
  },
  {
    title: 'Trạng Thái',
    dataIndex: 'isActive',
    width: '30%'
  },
  {
    title: 'Lượt tải xuống',
    dataIndex: 'downloaded',
    width: '30%'
  }
];

const ElectionDetailPage: React.FC = () => {
  const [electionId, setElectionId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [codes, setCodes] = useState([]);
  const [isLoadCode, setIsLoadCode] = useState(true);
  const [isLoadCandidate, setIsLoadCandidate] = useState(true);

  const router = useRouter();

  useEffect(() => {
    setElectionId(router.query?.id as any);
  }, []);

  useEffect(() => {
    if (electionId) {
      getCodes(electionId).then((data) => {
        const newCodes = (data?.getCodes || []).map((code: any, index: number) => ({ index: index + 1, ...code }));
        setCodes(newCodes);
      }).catch((error: Error) => message.error(error.message));
    }
  }, [isLoadCode, electionId]);

  useEffect(() => {
    if (electionId) {
      getCandidates(electionId).then((data) => {
        const newCandidates = (data?.getCandidates || []).map(
          (candidate: any, index: number) => ({ index: index + 1, ...candidate }));
        setCandidates(newCandidates);
      }).catch((error: Error) => message.error(error.message));
    }
  }, [isLoadCandidate, electionId]);

  const items = [
    {
      label: 'Người ứng cử',
      key: '1',
      children: <CandidateComponent electionId={electionId} candidates={candidates} isLoadCandidate={isLoadCandidate}
                                    setIsLoadCandidate={setIsLoadCandidate}/>
    }, // remember to pass the key prop
    {
      label: 'Mã bầu cử',
      key: '2',
      children: <CodeComponent electionId={electionId} codes={codes} isLoadCode={isLoadCode}
                               setIsLoadCode={setIsLoadCode}/>
    },
    { label: 'Kết quả', key: '3', children: 'Kết quả  ' }
  ];

  return (<AppLayout>
    <>
      <Tabs items={items}/>
    </>
  </AppLayout>);
};

const CandidateComponent = ({ electionId, candidates, isLoadCandidate, setIsLoadCandidate }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const [form] = Form.useForm();

  const onFinish = ({ name }: any) => {
    createCandidate(electionId, name)
      .then(() => setIsLoadCandidate(!isLoadCandidate))
      .catch((error: Error) => message.error(error.message));

    setIsModalOpen(false);

    form.resetFields();
    setFileList([]);
  };


  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const onChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const onPreview = async (file: UploadFile) => {
    let src = file.url as string;
    if (!src) {
      src = await new Promise(resolve => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj as RcFile);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        Create
      </Button>
      <Modal title="Basic Modal" open={isModalOpen} onCancel={handleCancel}
             footer={[
               <Button form="myForm" key="submit" htmlType="submit">
                 Submit
               </Button>
             ]}
      >
        <Form {...{ labelCol: { span: 8 }, wrapperCol: { span: 16 } }} form={form} name="control-hooks" id="myForm"
              onFinish={onFinish}>
          <Form.Item name="name" label="Họ và tên" rules={[{ required: true }]}>
            <Input/>
          </Form.Item>
          <Form.Item name="image" label="Hình">
            <Upload
              action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
              listType="picture-card"
              fileList={fileList}
              onChange={onChange}
              onPreview={onPreview}
            >
              {fileList.length < 1 && '+ Upload'}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <Table columns={columns} dataSource={candidates}/>
    </>
  );
};

const CodeComponent = ({ electionId, codes, isLoadCode, setIsLoadCode }: any) => {
  const handleGenerateCodes = () => {
    const amountText = prompt('Nhập số lượng mã bạn muốn tạo thêm!');

    const amount = Number.parseInt(amountText ?? '');
    if (amount) {
      generateCodes(electionId, amount)
        .then(() => setIsLoadCode(!isLoadCode))
        .catch((error: Error) => message.error(error.message));
    } else {
      message.error('Bạn phải nhập vào một số tự nhiên!');
    }
  };

  return (
    <div>
      <Button onClick={handleGenerateCodes}>Generate</Button>
      <Table columns={codeColumns} dataSource={codes}/>
    </div>
  );
};

export default ElectionDetailPage;
