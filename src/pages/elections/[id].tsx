import { Button, Form, Input, message, Modal, Table, Tabs, Upload } from 'antd';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/app-layout';
import { getCandidates, getCodes, getElectionResult } from '../../operation/election.query';
import { useRouter } from 'next/router';
import { createCandidate, generateCodes } from '../../operation/election.mutation';
import axios from 'axios';

interface DataType {
  key: React.Key;
  index?: number;
  isUsed?: boolean;
  imageUrl?: string;
  name: string;
}

interface ResultDataType {
  key: React.Key;
  index?: number;
  imageUrl?: string;
  votes?: number;
  totalVotes?: number;
  name: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: 'ID',
    dataIndex: 'index',
    width: '30%'
  },
  {
    title: 'Ảnh',
    dataIndex: 'imageUrl',
    render: (url: string) => <img src={url} alt={'N/A'} width={80} height={80}/>
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
    dataIndex: 'isUsed',
    width: '30%',
    render: (isUsed) => <span>{isUsed ? 'Đã sử dụng' : 'Chưa sửa dụng'}</span>
  },
  {
    title: 'Lượt tải xuống',
    dataIndex: 'downloaded',
    width: '30%'
  }
];

const resultColumns: ColumnsType<ResultDataType> = [
  {
    title: 'ID',
    dataIndex: 'index',
    width: '30%'
  },
  {
    title: 'Ảnh',
    dataIndex: 'imageUrl',
    render: (url: string) => <img src={url} alt={'N/A'} width={80} height={80}/>
  },
  {
    title: 'Name',
    dataIndex: 'name',
    filterMode: 'tree',
    filterSearch: true,
    onFilter: (value: string, record) => record.name.includes(value),
    width: '30%'
  },
  {
    title: 'Số phiếu',
    dataIndex: ['votes', 'totalCodes'],
    render: (text, record) => <span>{record.votes}/{record.totalCodes}</span>,
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
    if (router.isReady) {
      setElectionId(router.query?.id as any);
    }
  }, [router.isReady]);

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
    { label: 'Kết quả', key: '3', children: <ResultComponent electionId={electionId} />}
  ];

  return (<AppLayout>
    <>
      <Tabs items={items}/>
    </>
  </AppLayout>);
};

const CandidateComponent = ({ electionId, candidates, isLoadCandidate, setIsLoadCandidate }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [headers, setHeaders] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      setHeaders({
        authorization: `Bearer ${token}`
      });
    }

  }, []);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const [form] = Form.useForm();

  const onFinish = ({ name }: any) => {
  const fmData = new FormData();
    const config = {
      headers
    };

    fmData.append("file", fileList[0].originFileObj as RcFile);
    return axios
      .post("http://localhost:8080/election/uploadFile", fmData, config)
      .then(res => {
        createCandidate(electionId, name, res.data.link)
          .then(() => setIsLoadCandidate(!isLoadCandidate))
          .catch((error: Error) => message.error(error.message));

        setIsModalOpen(false);

        form.resetFields();
        setFileList([]);
      })
      .catch(err=>{
        const error = new Error('Some error');
      });
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
              beforeUpload={() => false}
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

const ResultComponent = ({ electionId }: any) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    getElectionResult(electionId)
      .then((data) => {
        const newData = data.getElectionResult?.map((election: any, index: number) => ({ index: index + 1, ...election }));
        setData(newData|| [])
      })
      .catch((error: Error) => message.error(error.message));
  }, []);

  return (
    <div>
      <Table columns={resultColumns} dataSource={data}/>
    </div>
  );
}

export default ElectionDetailPage;
