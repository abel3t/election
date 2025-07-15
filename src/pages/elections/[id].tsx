import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Progress,
  Spin,
  Statistic,
  Table,
  Tabs,
  Tag,
  Timeline,
  Upload
} from 'antd';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/app-layout';
import {
  getCandidates,
  getCodes,
  getElection,
  getElectionResult
} from '../../operation/election.query';
import { useRouter } from 'next/router';
import {
  createCandidate,
  deleteCandidate,
  generateCodes
} from '../../operation/election.mutation';
import axios, { AxiosRequestConfig } from 'axios';
import { LoadingOutlined } from '@ant-design/icons';
import NextImage from 'next/image';
import * as XLSX from 'xlsx';

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
  totalVotes?: number;
  name: string;
}

const codeColumns: ColumnsType<DataType> = [
  {
    title: <span className="font-bold">STT</span>,
    dataIndex: 'index',
    width: '10%',
    key: 'index'
  },
  {
    title: <span className="font-bold">ID</span>,
    dataIndex: 'id',
    width: '30%',
    key: 'text'
  },
  {
    title: <span className="font-bold">Mã Bầu Cử</span>,
    dataIndex: 'text',
    width: '15%',
    key: 'text'
  },
  {
    title: <span className="font-bold">Trạng Thái</span>,
    dataIndex: 'isUsed',
    width: '30%',
    key: 'isUsed',
    render: (isUsed) => (
      <span>
        {isUsed ? (
          <Tag style={{ backgroundColor: '#da0e0e', color: '#ffffff', border: 'none' }}>Đã sử dụng</Tag>
        ) : (
          <Tag style={{ backgroundColor: '#fcbb1d', color: '#15181a', border: 'none' }}>Chưa sử dụng</Tag>
        )}
      </span>
    )
  },
  {
    title: <span className="font-bold">Lượt tải xuống</span>,
    dataIndex: 'downloaded',
    width: '20%',
    key: 'downloaded'
  }
];

const resultColumns: ColumnsType<ResultDataType> = [
  {
    title: <span className="font-bold">STT</span>,
    dataIndex: 'index',
    width: '10%',
    key: 'index',
    render: (index) => <div className="font-bold">{index}</div>
  },
  {
    title: <p className="font-bold text-center w-full">Ảnh</p>,
    dataIndex: 'imageUrl',
    width: '20%',
    key: 'imageUrl',
    align: 'center',
    render: (url: string) => (
      <div className="flex justify-center items-center w-full">
        <img src={url} alt={'N/A'} width={80} height={80} />
      </div>
    )
  },
  {
    title: <span className="font-bold">Họ và Tên</span>,
    dataIndex: 'name',
    filterMode: 'tree',
    filterSearch: true,
    width: '40%',
    key: 'name',
    render: (name) => <div className="font-bold">{name}</div>
  },
  {
    title: <span className="font-bold">Số phiếu</span>,
    dataIndex: ['totalVotes', 'totalCodes'],
    key: 'votes-totalCodes',
    render: (_, record) => (
      <p>
        <span style={{ color: '#fcbb1d' }} className="text-4xl font-bold">
          {record.totalVotes}
        </span>
        <span className="font-bold">/</span>
        <span style={{ color: '#de9e03' }} className="text-2xl font-bold">
          {record.totalCodes}
        </span>
      </p>
    ),
    width: '15%'
  },
  {
    title: <span className="font-bold">Phần trăm</span>,
    dataIndex: ['totalVotes', 'totalCodes'],
    key: 'percentage',
    render: (_, record) => {
      const totalVotes = record.totalVotes || 0;
      const totalCodes = record.totalCodes || 0;
      const percentage = totalCodes > 0 ? ((totalVotes / totalCodes) * 100).toFixed(1) : '0.0';
      return (
        <p>
          <span style={{ color: '#fcbb1d' }} className="text-3xl font-bold">
            {percentage}%
          </span>
        </p>
      );
    },
    width: '12%'
  },
  {
    title: <span className="font-bold">Chi tiết</span>,
    dataIndex: '',
    key: 'x',
    width: '20%',
    render: (_, record) => <DetailComponent record={record} />
  }
];

const ElectionDetailPage: React.FC = () => {
  const [electionId, setElectionId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [codes, setCodes] = useState([]);
  const [isLoadCode, setIsLoadCode] = useState(true);
  const [isLoadCandidate, setIsLoadCandidate] = useState(true);
  const [tabChange, setTabChange] = useState('1');
  const [election, setElection] = useState({} as any);

  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      setElectionId(router.query?.id as any);
    }
  }, [router.isReady]);

  useEffect(() => {
    if (electionId) {
      getCodes(electionId)
        .then((data) => {
          const newCodes = (data?.getCodes || []).map(
            (code: any, index: number) => ({ index: index + 1, ...code })
          );
          setCodes(newCodes);
        })
        .catch((error: Error) => message.error(error.message));

      getElection(electionId)
        .then((data) => setElection(data?.getElection))
        .catch((error: Error) => message.error(error.message));
    }
  }, [isLoadCode, electionId]);

  useEffect(() => {
    if (electionId) {
      getCandidates(electionId)
        .then((data) => {
          const newCandidates = (data?.getCandidates || []).map(
            (candidate: any, index: number) => ({
              index: index + 1,
              ...candidate
            })
          );
          setCandidates(newCandidates);
        })
        .catch((error: Error) => message.error(error.message));
    }
  }, [isLoadCandidate, electionId, tabChange]);

  const items = [
    {
      label: 'Người ứng cử',
      key: '1',
      children: (
        <CandidateComponent
          electionId={electionId}
          candidates={candidates}
          isLoadCandidate={isLoadCandidate}
          setIsLoadCandidate={setIsLoadCandidate}
        />
      )
    },
    {
      label: 'Mã bầu cử',
      key: '2',
      children: (
        <CodeComponent
          electionId={electionId}
          codes={codes}
          isLoadCode={isLoadCode}
          setIsLoadCode={setIsLoadCode}
        />
      )
    },
    {
      label: 'Báo cáo',
      key: '3',
      children: (
        <ReportComponent
          electionId={electionId}
          codes={codes}
          tabChange={tabChange}
        />
      )
    },
    {
      label: 'Kết quả',
      key: '4',
      children: (
        <ResultComponent tabChange={tabChange} electionId={electionId} />
      )
    }
  ];

  return (
    <AppLayout>
      <>
        <style jsx global>{`
          .ant-tabs .ant-tabs-tab {
            color: #ffffff !important;
            background-color: transparent !important;
          }
          .ant-tabs .ant-tabs-tab:hover {
            color: #fcbb1d !important;
          }
          .ant-tabs .ant-tabs-tab.ant-tabs-tab-active {
            color: #fcbb1d !important;
          }
          .ant-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
            color: #fcbb1d !important;
          }
          .ant-tabs .ant-tabs-ink-bar {
            background-color: #fcbb1d !important;
          }
          .ant-tabs .ant-tabs-nav::before {
            border-bottom: 1px solid #333 !important;
          }
          .ant-tabs .ant-tabs-content-holder {
            background-color: #15181a !important;
          }
          .ant-empty {
            color: #ffffff !important;
          }
          .ant-empty-description {
            color: #ffffff !important;
          }
          .ant-empty-normal {
            color: #ffffff !important;
          }
          .ant-empty-normal .ant-empty-description {
            color: #ffffff !important;
          }
          .ant-empty-image svg {
            fill: #666 !important;
          }
          .candidate-table .ant-empty,
          .code-table .ant-empty,
          .result-table .ant-empty {
            color: #ffffff !important;
          }
          .candidate-table .ant-empty-description,
          .code-table .ant-empty-description,
          .result-table .ant-empty-description {
            color: #ffffff !important;
          }
          /* Select component dark theme */
          .ant-select-selection-item {
            background-color: #2a2d30 !important;
            color: #ffffff !important;
            border-color: #333 !important;
          }
          .ant-select-selector {
            background-color: #2a2d30 !important;
            border-color: #333 !important;
          }
          .ant-select-arrow {
            color: #ffffff !important;
          }
          .ant-select:hover .ant-select-selector {
            border-color: #fcbb1d !important;
          }
          .ant-select-focused .ant-select-selector {
            border-color: #fcbb1d !important;
            box-shadow: 0 0 0 2px rgba(252, 187, 29, 0.2) !important;
          }
          .ant-select-dropdown {
            background-color: #15181a !important;
            border: 1px solid #333 !important;
          }
          .ant-select-item {
            background-color: #15181a !important;
            color: #ffffff !important;
          }
          .ant-select-item:hover {
            background-color: #2a2d30 !important;
          }
          .ant-select-item-option-selected {
            background-color: #fcbb1d !important;
            color: #15181a !important;
          }
          /* Card component dark theme */
          .ant-card {
            background-color: #2a2d30 !important;
            border-color: #3a4044 !important;
          }
          .ant-card-head {
            background-color: #2a2d30 !important;
            border-color: #3a4044 !important;
          }
          .ant-card-head-title {
            color: #ffffff !important;
          }
          .ant-card-body {
            background-color: #2a2d30 !important;
          }
          /* Progress component dark theme */
          .ant-progress-text {
            color: #ffffff !important;
          }
          /* Statistic component dark theme */
          .ant-statistic-title {
            color: #ffffff !important;
          }
          .ant-statistic-content {
            color: #fcbb1d !important;
          }
        `}</style>
        <div className="my-1 text-2xl font-bold text-white" style={{ backgroundColor: '#15181a' }}>{election.name}</div>
        <Tabs items={items} onChange={(activeKey) => setTabChange(activeKey)} className='font-bold' />
      </>
    </AppLayout>
  );
};

const CandidateComponent = ({
  electionId,
  candidates,
  isLoadCandidate,
  setIsLoadCandidate
}: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [headers, setHeaders] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const columns: ColumnsType<CandidateDataType> = [
    {
      title: <span className="font-bold">STT</span>,
      dataIndex: 'index',
      width: '10%',
      key: 'index'
    },
    {
      title: <p className="font-bold text-center w-full">Ảnh</p>,
      width: '20%',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (url: string) => (
        <div className='flex justify-center items-center w-full'>
          <NextImage src={url} alt={'N/A'} width={80} height={80} />
        </div>
      )
    },
    {
      title: <span className="font-bold">Họ và Tên</span>,
      dataIndex: 'name',
      filterMode: 'tree',
      filterSearch: true,
      width: '40%',
      key: 'name'
    },
    {
      title: <span className="font-bold">Hành động</span>,
      dataIndex: '',
      key: 'x',
      width: '20%',
      render: (_, record) => (
        <DeleteComponent
          record={record}
          setIsLoadCandidate={setIsLoadCandidate}
          isLoadCandidate={isLoadCandidate}
        />
      )
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
      .post(
        `${process.env.NEXT_PUBLIC_API_URL}/election/uploadFile`,
        fmData,
        config
      )
      .then((res) => {
        createCandidate(electionId, name, res.data.link)
          .then(() => setIsLoadCandidate(!isLoadCandidate))
          .catch((error: Error) => message.error(error.message));

        setIsModalOpen(false);
        setIsSubmitting(false);

        form.resetFields();
        setFileList([]);
      })
      .catch((err) => {
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
      src = await new Promise((resolve) => {
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
  const antIcon = <LoadingOutlined style={{ fontSize: 18 }} spin />;

  return (
    <div key={`election-component-${electionId}`} style={{ backgroundColor: '#15181a', color: 'white' }}>
      <Button
        type="primary"
        onClick={showModal}
        className="font-bold px-4 rounded mb-2 bg-[#fcbb1d] text-[#15181a] border-none hover:bg-[#fcbb1d] hover:bg-opacity-70 hover:text-[#15181a] focus:bg-[#fcbb1d] focus:text-[#15181a]"
      >
        Tạo ứng cử viên
      </Button>
      <Modal
        title="Tạo ứng cử viên"
        open={isModalOpen}
        onCancel={handleCancel}
        className={'dark-modal'}
        style={{ border: '1px solid #3a4044' }}
        footer={[
          <Button
            form="CreateCandidateForm"
            key="submit"
            htmlType="submit"
            className="font-bold px-4 rounded bg-[#fcbb1d] text-[#15181a] border-none hover:bg-[#fcbb1d] hover:bg-opacity-70 hover:text-[#15181a] focus:bg-[#fcbb1d] focus:text-[#15181a]"
          >
            {isSubmitting && <Spin indicator={antIcon} />}
            {!isSubmitting && 'Gửi'}
          </Button>
        ]}
      >
        <Form
          {...{ labelCol: { span: 8 }, wrapperCol: { span: 16 } }}
          form={form}
          name="control-hooks"
          id="CreateCandidateForm"
          onFinish={onFinish}
        >
          <Form.Item name="name" label="Họ và tên" rules={[{ required: true }]}>
            <Input />
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

      <Table columns={columns} dataSource={candidates} className="candidate-table dark-pagination" />
    </div>
  );
};

const CodeComponent = ({
  electionId,
  codes,
  isLoadCode,
  setIsLoadCode
}: any) => {
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
      .get(
        `${process.env.NEXT_PUBLIC_API_URL}/election/${electionId}/codes/download`,
        config
      )
      .then((response) => {
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
    <div key={`code-component-${electionId}`} >
      <Button
        onClick={handleGenerateCodes}
        className="font-bold px-4 rounded mb-2 bg-[#fcbb1d] text-[#15181a] border-none hover:bg-[#fcbb1d] hover:bg-opacity-70 hover:text-[#15181a] focus:bg-[#fcbb1d] focus:text-[#15181a]"
      >
        Tạo mã bầu cử
      </Button>

      <Button
        onClick={handleDownloadCodes}
        className="font-bold px-4 rounded mb-2 ml-2 bg-[#fcbb1d] text-[#15181a] border-none hover:bg-[#fcbb1d] hover:bg-opacity-70 hover:text-[#15181a] focus:bg-[#fcbb1d] focus:text-[#15181a]"
      >
        Tải xuống
      </Button>

      {!!unUsedCodes?.length && (
        <Tag className="ml-2 border-none" style={{ backgroundColor: '#fcbb1d', color: '#15181a' }}>
          Có {unUsedCodes.length} mã chưa sử dụng
        </Tag>
      )}

      {!!usedCodes?.length && (
        <Tag className="ml-2 border-none" style={{ backgroundColor: '#da0e0e', color: '#ffffff' }}>
          Có {usedCodes.length} mã đã sử dụng
        </Tag>
      )}

      <div className='w-full overflow-x-scroll'>
        <Table columns={codeColumns} dataSource={codes} className="code-table dark-pagination" />
      </div>
    </div>
  );
};

const ReportComponent = ({ electionId, codes, tabChange }: any) => {
  const [data, setData] = useState([]);
  const [election, setElection] = useState({} as any);

  useEffect(() => {
    getElectionResult(electionId)
      .then((data) => {
        const newData = data?.getElectionResult?.map(
          (election: any, index: number) => ({ index: index + 1, ...election })
        );
        setData(newData || []);
      })
      .catch((error: Error) => message.error(error.message));

    // Get election details for the filename
    getElection(electionId)
      .then((data) => setElection(data?.getElection))
      .catch((error: Error) => message.error(error.message));
  }, [tabChange, electionId]);

  const totalCodes = codes.length;
  const usedCodes = codes.filter((code: any) => code.isUsed).length;
  const unusedCodes = codes.filter((code: any) => !code.isUsed).length;
  const votingRate = totalCodes > 0 ? (usedCodes / totalCodes) * 100 : 0;

  // Calculate total votes from all candidates
  const totalVotesFromResults = data.reduce((sum: number, candidate: any) => {
    return sum + (candidate.totalVotes || 0);
  }, 0);

  // Excel export functions
  const exportVotingDataToExcel = () => {
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Election Summary
    const summaryData = [
      { 'Thông Tin': 'Tổng Số Mã Được Tạo', 'Giá Trị': totalCodes },
      { 'Thông Tin': 'Số Mã Đã Sử Dụng', 'Giá Trị': usedCodes },
      { 'Thông Tin': 'Số Mã Chưa Sử Dụng', 'Giá Trị': unusedCodes },
      { 'Thông Tin': 'Tỷ Lệ Tham Gia (%)', 'Giá Trị': votingRate.toFixed(1) },
      { 'Thông Tin': 'Tổng Số Phiếu Bầu', 'Giá Trị': totalVotesFromResults },
      { 'Thông Tin': 'Số Ứng Cử Viên', 'Giá Trị': data.length },
      { 'Thông Tin': 'Thời Gian Xuất Báo Cáo', 'Giá Trị': new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) }
    ];

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tóm Tắt Bầu Cử');

    // Sheet 2: Voting Codes Status
    const codesData = codes.map((code: any, index: number) => ({
      'STT': index + 1,
      'Mã ID': code.id,
      'Mã Bầu Cử': code.text,
      'Trạng Thái': code.isUsed ? 'Đã sử dụng' : 'Chưa sử dụng',
      'Lượt Tải Xuống': code.downloaded || 0,
      'Thời Gian Tạo': code.createdAt ? new Date(code.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : 'N/A'
    }));

    const codesSheet = XLSX.utils.json_to_sheet(codesData);
    XLSX.utils.book_append_sheet(workbook, codesSheet, 'Trạng Thái Mã Bầu Cử');

    // Sheet 3: Candidates Results
    const candidatesData = data.map((candidate: any) => ({
      'STT': candidate.index,
      'Tên Ứng Cử Viên': candidate.name,
      'Tổng Số Phiếu': candidate.totalCodes || 0,
      'Số Phiếu Nhận Được': candidate.totalVotes || 0,
      'Tỷ Lệ (%)': candidate.totalCodes > 0 ? ((candidate.totalVotes / candidate.totalCodes) * 100).toFixed(1) : '0.0'
    }));

    const candidatesSheet = XLSX.utils.json_to_sheet(candidatesData);
    XLSX.utils.book_append_sheet(workbook, candidatesSheet, 'Kết Quả Ứng Cử Viên');

    // Sheet 4: Vote Overview (Grouped by Vote ID)
    const votesByCode: { [key: string]: any } = {};
    
    data.forEach((candidate: any) => {
      if (candidate.votes && candidate.votes.length > 0) {
        candidate.votes.forEach((vote: any) => {
          const voteId = vote.text;
          if (!votesByCode[voteId]) {
            votesByCode[voteId] = {
              voteId: voteId,
              timestamp: vote.createdAt,
              candidates: []
            };
          }
          votesByCode[voteId].candidates.push({
            name: candidate.name,
            id: candidate.id || 'N/A'
          });
        });
      }
    });

    const groupedRecords: any[] = [];
    Object.values(votesByCode).forEach((voteGroup: any, index: number) => {
      groupedRecords.push({
        'STT': index + 1,
        'Mã Phiếu': voteGroup.voteId,
        'Số Ứng Cử Viên Được Bầu': voteGroup.candidates.length,
        'Thời Gian Bỏ Phiếu': new Date(voteGroup.timestamp).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        'Ngày': new Date(voteGroup.timestamp).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        'Giờ': new Date(voteGroup.timestamp).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
      });
    });

    const groupedSheet = XLSX.utils.json_to_sheet(groupedRecords);
    XLSX.utils.book_append_sheet(workbook, groupedSheet, 'Tổng Quan Phiếu Bầu');

    // Sheet 5: Individual Vote Details
    const detailedRecords: any[] = [];
    data.forEach((candidate: any) => {
      if (candidate.votes && candidate.votes.length > 0) {
        candidate.votes.forEach((vote: any) => {
          detailedRecords.push({
            'STT': detailedRecords.length + 1,
            'Mã Phiếu': vote.text,
            'Ứng Cử Viên Được Bầu': candidate.name,
            'ID Ứng Cử Viên': candidate.id || 'N/A',
            'Thời Gian Bỏ Phiếu': new Date(vote.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
            'Ngày': new Date(vote.createdAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
            'Giờ': new Date(vote.createdAt).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
          });
        });
      }
    });

    const detailedSheet = XLSX.utils.json_to_sheet(detailedRecords);
    XLSX.utils.book_append_sheet(workbook, detailedSheet, 'Chi Tiết Theo Ứng Cử Viên');

    // Sheet 6: Vote Details by Code
    const summaryRecords: any[] = [];
    Object.values(votesByCode).forEach((voteGroup: any) => {
      voteGroup.candidates.forEach((candidate: any, index: number) => {
        summaryRecords.push({
          'Mã Phiếu': voteGroup.voteId,
          'Thứ Tự Trong Phiếu': index + 1,
          'Ứng Cử Viên': candidate.name,
          'ID Ứng Cử Viên': candidate.id,
          'Tổng Số Ứng Cử Viên Trong Phiếu': voteGroup.candidates.length,
          'Thời Gian Bỏ Phiếu': new Date(voteGroup.timestamp).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
        });
      });
    });

    const voteDetailSheet = XLSX.utils.json_to_sheet(summaryRecords);
    XLSX.utils.book_append_sheet(workbook, voteDetailSheet, 'Chi Tiết Theo Mã Phiếu');

    // Export the file
    const fileName = `BaoCao_BauCu_DayDu_${election.name || electionId}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    message.success('Xuất file Excel thành công!');
  };

  const exportVoteRecordsOnly = () => {
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Grouped by Vote ID (Easy to understand)
    const votesByCode: { [key: string]: any } = {};
    
    data.forEach((candidate: any) => {
      if (candidate.votes && candidate.votes.length > 0) {
        candidate.votes.forEach((vote: any) => {
          const voteId = vote.text;
          if (!votesByCode[voteId]) {
            votesByCode[voteId] = {
              voteId: voteId,
              timestamp: vote.createdAt,
              candidates: []
            };
          }
          votesByCode[voteId].candidates.push({
            name: candidate.name,
            id: candidate.id || 'N/A'
          });
        });
      }
    });

    // Create grouped data sheet
    const groupedRecords: any[] = [];
    Object.values(votesByCode).forEach((voteGroup: any, index: number) => {
      groupedRecords.push({
        'STT': index + 1,
        'Mã Phiếu': voteGroup.voteId,
        'Số Ứng Cử Viên Được Bầu': voteGroup.candidates.length,
        'Thời Gian Bỏ Phiếu': new Date(voteGroup.timestamp).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        'Ngày': new Date(voteGroup.timestamp).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        'Giờ': new Date(voteGroup.timestamp).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
      });
    });

    const groupedSheet = XLSX.utils.json_to_sheet(groupedRecords);
    XLSX.utils.book_append_sheet(workbook, groupedSheet, 'Tổng Quan Phiếu Bầu');

    // Sheet 2: Individual Vote Records (Detailed)
    const detailedRecords: any[] = [];
    data.forEach((candidate: any) => {
      if (candidate.votes && candidate.votes.length > 0) {
        candidate.votes.forEach((vote: any) => {
          detailedRecords.push({
            'STT': detailedRecords.length + 1,
            'Mã Phiếu': vote.text,
            'Ứng Cử Viên Được Bầu': candidate.name,
            'ID Ứng Cử Viên': candidate.id || 'N/A',
            'Thời Gian Bỏ Phiếu': new Date(vote.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
            'Ngày': new Date(vote.createdAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
            'Giờ': new Date(vote.createdAt).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
          });
        });
      }
    });

    const detailedSheet = XLSX.utils.json_to_sheet(detailedRecords);
    XLSX.utils.book_append_sheet(workbook, detailedSheet, 'Chi Tiết Theo Ứng Cử Viên');

    // Sheet 3: Vote Summary by Code (Shows all candidates for each vote)
    const summaryRecords: any[] = [];
    Object.values(votesByCode).forEach((voteGroup: any) => {
      voteGroup.candidates.forEach((candidate: any, index: number) => {
        summaryRecords.push({
          'Mã Phiếu': voteGroup.voteId,
          'Thứ Tự Trong Phiếu': index + 1,
          'Ứng Cử Viên': candidate.name,
          'ID Ứng Cử Viên': candidate.id,
          'Tổng Số Ứng Cử Viên Trong Phiếu': voteGroup.candidates.length,
          'Thời Gian Bỏ Phiếu': new Date(voteGroup.timestamp).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
        });
      });
    });

    const summarySheet = XLSX.utils.json_to_sheet(summaryRecords);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Danh Sách Theo Mã Phiếu');

    const fileName = `DuLieu_PhieuBau_ChiTiet_${election.name || electionId}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    message.success('Xuất dữ liệu phiếu bầu chi tiết thành công!');
  };

  return (
    <div key={`report-component-${electionId}`} style={{ backgroundColor: '#15181a', color: 'white' }}>
      {/* Export Buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          onClick={exportVotingDataToExcel}
          className="font-bold px-4 rounded bg-[#fcbb1d] text-[#ffffff] border-none hover:bg-[#fcbb1d] hover:bg-opacity-75 hover:opacity-75 hover:text-[#ffffff] focus:bg-[#fcbb1d] focus:text-[#ffffff]"
        >
          📊 Xuất Báo Cáo Đầy Đủ
        </Button>
        <Button
          onClick={exportVoteRecordsOnly}
          className="font-bold px-4 rounded bg-[#1890ff] text-[#ffffff] border-none hover:bg-[#1890ff] hover:bg-opacity-75 hover:opacity-75 hover:text-[#ffffff] focus:bg-[#1890ff] focus:text-[#ffffff]"
        >
          📋 Xuất Dữ Liệu Phiếu Bầu
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card style={{ backgroundColor: '#2a2d30', borderColor: '#3a4044' }}>
          <Statistic
            title={<span style={{ color: '#ffffff' }}>Tổng số mã được tạo</span>}
            value={totalCodes}
          />
        </Card>

        <Card style={{ backgroundColor: '#2a2d30', borderColor: '#3a4044' }}>
          <Statistic
            title={<span style={{ color: '#ffffff' }}>Số mã đã sử dụng</span>}
            value={usedCodes}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>

        <Card style={{ backgroundColor: '#2a2d30', borderColor: '#3a4044' }}>
          <Statistic
            title={<span style={{ color: '#ffffff' }}>Số mã chưa sử dụng</span>}
            value={unusedCodes}
            valueStyle={{ color: '#ff4d4f' }}
            className='text-[#ff4d4f]'
          />
        </Card>

        <Card style={{ backgroundColor: '#2a2d30', borderColor: '#3a4044' }}>
          <Statistic
            title={<span style={{ color: '#ffffff' }}>Tỷ lệ tham gia</span>}
            value={votingRate.toFixed(1)}
            suffix="%"
            valueStyle={{ color: '#fcbb1d' }}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title={<span style={{ color: '#ffffff' }}>Tiến độ bỏ phiếu</span>}
          style={{ backgroundColor: '#2a2d30', borderColor: '#3a4044' }}
        >
          <Progress
            percent={votingRate}
            strokeColor={{
              '0%': '#fcbb1d',
              '100%': '#de9e03',
            }}
            trailColor="#3a4044"
            format={(percent) => `${percent?.toFixed(1)}%`}
            style={{ marginBottom: '20px' }}
          />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span style={{ color: '#ffffff' }}>Đã bỏ phiếu:</span>
              <span style={{ color: '#52c41a' }} className="font-bold">{usedCodes} mã</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#ffffff' }}>Chưa bỏ phiếu:</span>
              <span style={{ color: '#ff4d4f' }} className="font-bold">{unusedCodes} mã</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#ffffff' }}>Tổng cộng:</span>
              <span style={{ color: '#fcbb1d' }} className="font-bold">{totalCodes} mã</span>
            </div>
          </div>
        </Card>

        <Card
          title={<span style={{ color: '#ffffff' }}>Thống kê chi tiết</span>}
          style={{ backgroundColor: '#2a2d30', borderColor: '#3a4044' }}
        >
          <div className="space-y-3">
            <div className="p-3 rounded" style={{ backgroundColor: '#3a4044' }}>
              <div className="flex justify-between items-center">
                <span style={{ color: '#ffffff' }}>Tổng số phiếu bầu:</span>
                <span style={{ color: '#fcbb1d' }} className="text-xl font-bold">{totalVotesFromResults}</span>
              </div>
            </div>

            <div className="p-3 rounded" style={{ backgroundColor: '#3a4044' }}>
              <div className="flex justify-between items-center">
                <span style={{ color: '#ffffff' }}>Số ứng cử viên:</span>
                <span style={{ color: '#fcbb1d' }} className="text-xl font-bold">{data.length}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const ResultComponent = ({ electionId, tabChange }: any) => {
  const [data, setData] = useState([]);
  const [election, setElection] = useState({} as any);

  useEffect(() => {
    getElectionResult(electionId)
      .then((data) => {
        const newData = data?.getElectionResult?.map(
          (election: any, index: number) => ({ index: index + 1, ...election })
        );
        setData(newData || []);
      })
      .catch((error: Error) => message.error(error.message));

    // Get election details for the filename
    getElection(electionId)
      .then((data) => setElection(data?.getElection))
      .catch((error: Error) => message.error(error.message));
  }, [tabChange, electionId]);

  const exportResultsToExcel = () => {
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Results Summary
    const resultsData = data.map((candidate: any) => ({
      'Thứ Hạng': candidate.index,
      'Tên Ứng Cử Viên': candidate.name,
      'Tổng Số Phiếu': candidate.totalCodes || 0,
      'Số Phiếu Nhận Được': candidate.totalVotes || 0,
      'Tỷ Lệ (%)': candidate.totalCodes > 0 ? ((candidate.totalVotes / candidate.totalCodes) * 100).toFixed(1) : '0.0'
    }));

    if (!resultsData || resultsData.length === 0) {
      message.error('Không có dữ liệu để xuất!');
      return;
    }

    const resultsSheet = XLSX.utils.json_to_sheet(resultsData);
    XLSX.utils.book_append_sheet(workbook, resultsSheet, 'Kết Quả Bầu Cử');

    // Sheet 2: Detailed Vote Records
    const voteRecords: any[] = [];
    data.forEach((candidate: any) => {
      if (candidate.votes && candidate.votes.length > 0) {
        candidate.votes.forEach((vote: any) => {
          voteRecords.push({
            'STT': voteRecords.length + 1,
            'Mã Phiếu': vote.text,
            'Ứng Cử Viên': candidate.name,
            'Thời Gian Bỏ Phiếu': new Date(vote.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
            'Ngày Bỏ Phiếu': new Date(vote.createdAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
            'Giờ Bỏ Phiếu': new Date(vote.createdAt).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
          });
        });
      }
    });

    if (voteRecords.length > 0) {
      const voteRecordsSheet = XLSX.utils.json_to_sheet(voteRecords);
      XLSX.utils.book_append_sheet(workbook, voteRecordsSheet, 'Chi Tiết Theo Ứng Cử Viên');
    }

    const fileName = `KetQua_BauCu_${election.name || electionId}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    try {
      XLSX.writeFile(workbook, fileName);
      message.success('Xuất kết quả bầu cử thành công!');
    } catch (error) {
      console.error('Export error:', error);
      message.error('Lỗi khi xuất file Excel!');
    }
  };

  return (
    <div key={`result-component-${electionId}`}>
      <div className="mb-4 flex justify-end">
        <Button
          onClick={exportResultsToExcel}
          className="font-bold px-4 rounded bg-[#fcbb1d] text-[#15181a] border-none hover:bg-[#fcbb1d] hover:bg-opacity-75 hover:opacity-75 hover:text-[#15181a] focus:bg-[#fcbb1d] focus:text-[#15181a]"
        >
          📊 Xuất Kết Quả
        </Button>
      </div>
      <div className='w-full overflow-x-scroll'>
        <Table columns={resultColumns} dataSource={data} className="result-table dark-pagination" />
      </div>
    </div>
  );
};

const DeleteComponent = ({
  record,
  setIsLoadCandidate,
  isLoadCandidate
}: any) => {
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

  return (
    <>
      <Popconfirm
        title="Bạn chắc chắn xoá ứng cử viên？"
        okText="Xoá"
        cancelText="Trở lại"
        onConfirm={handleDeleteCandidate}
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
        <a href="#" style={{ color: '#da0e0e' }} className="hover:opacity-80">
          Xoá
        </a>
      </Popconfirm>
    </>
  );
};

const DetailComponent = ({ record }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    console.log(record);
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        type="primary"
        onClick={showModal}
        className="font-bold px-4 rounded mb-2 bg-[#fcbb1d] text-[#15181a] border-none hover:bg-[#fcbb1d] hover:bg-opacity-70 hover:text-[#15181a] focus:bg-[#fcbb1d] focus:text-[#15181a]"
      >
        Chi tiết
      </Button>

      <Modal
        title={`Danh sách bỏ phiếu cho ${record.name}`}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        className={'dark-modal'}
        style={{ border: '1px solid #3a4044' }}
        footer={[
          <Button
            key="submit"
            form="ResultDetail"
            className="font-bold px-4 rounded bg-[#fcbb1d] text-[#15181a] border-none hover:bg-[#fcbb1d] hover:bg-opacity-75 hover:opacity-75 hover:text-[#15181a] focus:bg-[#fcbb1d] focus:text-[#15181a]"
            onClick={() => setIsModalOpen(false)}
          >
            OK
          </Button>
        ]}
      >
        <Timeline>
          {!record?.votes?.length && (
            <div>Chưa có ai bỏ phiếu cho người này</div>
          )}
          {!!record?.votes?.length &&
            record?.votes.map((vote: any, index: number) => (
              <Timeline.Item key={index}>
                <span style={{ color: '#fcbb1d' }} className="font-bold text-xl">{vote?.text}</span>

                <span className="text-lg" style={{ color: '#ffffff' }}>
                  &nbsp;vào lúc&nbsp;{' '}
                  <span className="font-bold">
                    {new Date(vote.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                  </span>
                </span>
              </Timeline.Item>
            ))}
        </Timeline>
      </Modal>
    </>
  );
};

export default ElectionDetailPage;
