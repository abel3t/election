import { Button, Form, Input, message, Modal, Popconfirm, Spin, Table, Tabs, Tag, Upload } from 'antd';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/app-layout';
import { getCandidates, getCodes, getElectionResult } from '../../operation/election.query';
import { useRouter } from 'next/router';
import { createCandidate, deleteCandidate, generateCodes } from '../../operation/election.mutation';
import axios, { AxiosRequestConfig } from 'axios';
import { LoadingOutlined } from '@ant-design/icons';

interface CandidateDataType {
  key: React.Key;
  index?: number;
  imageUrl?: string;
  name: string;
  id?: string;
  electionId?: string;
}

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
  totalCodes?: number;
  name: string;
}

const codeColumns: ColumnsType<DataType> = [
  {
    title: 'STT',
    dataIndex: 'index',
    width: '10%'
  },
  {
    title: 'Mã Bầu Cử',
    dataIndex: 'id',
    width: '40%'
  },
  {
    title: 'Trạng Thái',
    dataIndex: 'isUsed',
    width: '30%',
    render: (isUsed) => <span>{isUsed ?  <Tag color="orange">Đã sử dụng</Tag> : <Tag color="green">Chưa sửa dụng</Tag>}</span>
  },
  {
    title: 'Lượt tải xuống',
    dataIndex: 'downloaded',
    width: '20%'
  }
];

const resultColumns: ColumnsType<ResultDataType> = [
  {
    title: 'STT',
    dataIndex: 'index',
    width: '10%'
  },
  {
    title: 'Ảnh',
    dataIndex: 'imageUrl',
    width: '20%',
    render: (url: string) => <img src={url} alt={'N/A'} width={80} height={80}/>
  },
  {
    title: 'Họ và Tên',
    dataIndex: 'name',
    filterMode: 'tree',
    filterSearch: true,
    width: '40%'
  },
  {
    title: 'Số phiếu',
    dataIndex: ['votes', 'totalCodes'],
    render: (text, record) => <p><span className="text-green-700 text-4xl font-bold">{record.votes}</span>
      <span className="font-bold">/</span>
      <span className="text-yellow-600 text-2xl font-bold">{record.totalCodes}</span></p>,
    width: '15%'
  }
];

const ElectionDetailPage: React.FC = () => {
  const [electionId, setElectionId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [codes, setCodes] = useState([]);
  const [isLoadCode, setIsLoadCode] = useState(true);
  const [isLoadCandidate, setIsLoadCandidate] = useState(true);
  const [tabChange, setTabChange] = useState('1');

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
  }, [isLoadCandidate, electionId, tabChange]);

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
    { label: 'Kết quả', key: '3', children: <ResultComponent tabChange={tabChange} electionId={electionId}/> }
  ];

  return (<AppLayout>
    <>
      <Tabs items={items} onChange={(activeKey) => setTabChange(activeKey)}/>
    </>
  </AppLayout>);
};

const CandidateComponent = ({ electionId, tabChange, candidates, isLoadCandidate, setIsLoadCandidate }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [headers, setHeaders] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const columns: ColumnsType<CandidateDataType> = [
    {
      title: 'STT',
      dataIndex: 'index',
      width: '10%'
    },
    {
      title: 'Ảnh',
      width: '20%',
      dataIndex: 'imageUrl',
      render: (url: string) => <img src={url} alt={'N/A'} width={80} height={80}/>
    },
    {
      title: 'Họ và Tên',
      dataIndex: 'name',
      filterMode: 'tree',
      filterSearch: true,
      width: '40%'
    },
    {
      title: 'Hành động',
      dataIndex: '',
      key: 'x',
      width: '20%',
      render: (_, record) => <DeleteComponent record={record} setIsLoadCandidate={setIsLoadCandidate}
                                              isLoadCandidate={isLoadCandidate}/>
    }
  ];

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
    setIsSubmitting(true);
    const fmData = new FormData();
    const config = {
      headers
    };

    fmData.append('file', fileList[0].originFileObj as RcFile);
    return axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}/election/uploadFile`, fmData, config)
      .then(res => {
        createCandidate(electionId, name, res.data.link)
          .then(() => setIsLoadCandidate(!isLoadCandidate))
          .catch((error: Error) => message.error(error.message));

        setIsModalOpen(false);
        setIsSubmitting(false);

        form.resetFields();
        setFileList([]);
      })
      .catch(err => {
        const error = new Error('Some error');
        setIsSubmitting(false);
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
  const antIcon = <LoadingOutlined style={{ fontSize: 18 }} spin/>;

  return (
    <>
      <Button type="primary" onClick={showModal}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded mb-2">
        Tạo ứng cử viên
      </Button>
      <Modal title="Tạo ứng cử viên" open={isModalOpen} onCancel={handleCancel}
             footer={[
               <Button form="CreateCandidateForm" key="submit" htmlType="submit"
                       className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded">
                 {
                   isSubmitting && <Spin indicator={antIcon}/>
                 }
                 {
                   !isSubmitting && 'Submit'
                 }
               </Button>
             ]}
      >
        <Form {...{ labelCol: { span: 8 }, wrapperCol: { span: 16 } }} form={form} name="control-hooks"
              id="CreateCandidateForm"
              onFinish={onFinish}>
          <Form.Item name="name" label="Họ và tên" rules={[{ required: true }]}>
            <Input/>
          </Form.Item>
          <Form.Item name="image" label="Hình ảnh" rules={[{ required: true }]}>
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
  const unUsedCodes = codes.filter((code: any) => !code.isUsed);
  const usedCodes = codes.filter((code: any) => code.isUsed);
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

  const config: AxiosRequestConfig = {
    headers: {
      authorization: `Bearer ${localStorage.getItem('token')}`
    },
    responseType: 'blob'
  };

  const handleDownloadCodes = () => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/election/${electionId}/codes/download`, config)
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'QR-Codes.pdf'); //or any other extension
        document.body.appendChild(link);
        link.click();
        setIsLoadCode(!isLoadCode);
      });
  };

  return (
    <div>
      <Button onClick={handleGenerateCodes}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded mb-2">Tạo mã bầu cử</Button>

      <Button onClick={handleDownloadCodes}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded mb-2">Tải xuống</Button>

      {
        unUsedCodes?.length && <Tag className="ml-2" color="green">Có {unUsedCodes.length} chưa sử dụng</Tag>
      }

      {
        usedCodes?.length && <Tag className="ml-2" color="orange">Có {usedCodes.length} đã sử dụng</Tag>
      }

      <Table columns={codeColumns} dataSource={codes}/>
    </div>
  );
};

const ResultComponent = ({ electionId, tabChange }: any) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    getElectionResult(electionId)
      .then((data) => {
        const newData = data?.getElectionResult?.map(
          (election: any, index: number) => ({ index: index + 1, ...election }));
        setData(newData || []);
      })
      .catch((error: Error) => message.error(error.message));
  }, [tabChange]);

  return (
    <div>
      <Table columns={resultColumns} dataSource={data}/>
    </div>
  );
};

const DeleteComponent = ({ record, setIsLoadCandidate, isLoadCandidate }: any) => {
  const handleDeleteCandidate = () => {
    deleteCandidate(record.electionId, record.id)
      .then(() => {
        message.success('Xoá ứng cử viên thành công!');
        setIsLoadCandidate(!isLoadCandidate);
      })
      .catch((error: Error) => {
        console.log(error);
        message.error('Xoá ứng cử viên thất bại!');
      });
  };

  return <>
    <Popconfirm title="Bạn chắc chắn xoá ứng cử viên？" okText="Xoá" cancelText="Trở lại"
                onConfirm={handleDeleteCandidate}
                cancelButtonProps={{ className: 'bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded' }}
                okButtonProps={{ className: 'bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded' }}
    >
      <a href="#" className="text-red-600 hover:text-red-700">Xoá</a>
    </Popconfirm>
  </>;
};

export default ElectionDetailPage;
