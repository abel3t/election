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
  generateCodes,
  stopVoting,
  startVoting
} from '../../operation/election.mutation';
import axiosInstance from '../../utils/axiosInstance';
import type { AxiosRequestConfig } from 'axios';
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
          <Tag className='bg-green-500 text-white border-none'>Đã sử dụng</Tag>
        ) : (
          <Tag className='bg-yellow-500 text-white border-none'>Chưa sử dụng</Tag>
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
    key: 'name',
    render: (name) => <div className="font-bold">{name}</div>
  },
  {
    title: <span className="font-bold">Số phiếu</span>,
    dataIndex: ['totalVotes', 'totalCodes'],
    key: 'votes-totalCodes',
    render: (_, record) => (
      <p>
        <span style={{ color: '#4aa8ff' }} className="text-4xl font-bold">
          {record.totalVotes}
        </span>
        <span className="font-bold">/</span>
        <span style={{ color: '#4aa8ff' }} className="text-2xl font-bold">
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
          <span style={{ color: '#4aa8ff' }} className="text-3xl font-bold">
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
  const [isPageLoading, setIsPageLoading] = useState(true);

  const router = useRouter();

  // Toggle voting state
  const handleToggleVoting = async () => {
    try {
      if (election?.status === 'Active') {
        await stopVoting(electionId);
        message.success('Đã dừng bầu cử thành công!');
      } else {
        await startVoting(electionId);
        message.success('Đã mở lại bầu cử thành công!');
      }
      // Refresh the codes and election data
      setIsLoadCode(!isLoadCode);
      // Refetch election info after voting state change
      getElection(electionId)
        .then((data) => setElection(data?.getElection))
        .catch((error: Error) => message.error(error.message));
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra khi thay đổi trạng thái bầu cử!');
    }
  };

  // Initial load: fetch all required data, then set isPageLoading to false
  useEffect(() => {
    if (!router.isReady) return;
    setElectionId(router.query?.id as any);
  }, [router.isReady]);

  useEffect(() => {
    if (!electionId) return;
    let didCancel = false;
    setIsPageLoading(true);
    Promise.all([
      getCodes(electionId),
      getElection(electionId),
      getCandidates(electionId)
    ])
      .then(([codesData, electionData, candidatesData]) => {
        if (didCancel) return;
        const newCodes = (codesData?.getCodes || []).map(
          (code: any, index: number) => ({ index: index + 1, ...code })
        );
        setCodes(newCodes);
        setElection(electionData?.getElection);
        const newCandidates = (candidatesData?.getCandidates || []).map(
          (candidate: any, index: number) => ({ index: index + 1, ...candidate })
        );
        setCandidates(newCandidates);
        setIsPageLoading(false);
      })
      .catch((error: Error) => {
        if (!didCancel) {
          message.error(error.message || 'Có lỗi xảy ra khi tải dữ liệu!');
          setIsPageLoading(false);
        }
      });
    return () => { didCancel = true; };
  }, [electionId]);

  // Fetch codes when tab changes to '2' (Mã bầu cử) or on demand, but do NOT fetch election info again
  useEffect(() => {
    if (!electionId || isPageLoading) return;
    if (tabChange === '2') {
      getCodes(electionId)
        .then((codesData) => {
          const newCodes = (codesData?.getCodes || []).map(
            (code: any, index: number) => ({ index: index + 1, ...code })
          );
          setCodes(newCodes);
        })
        .catch((error: Error) => message.error(error.message));
    }
  }, [tabChange, electionId, isLoadCode, isPageLoading]);

  // Fetch result data with interval only when tab is '4' (Kết quả), do NOT fetch election info again
  const [resultData, setResultData] = useState([]);
  const [resultElection, setResultElection] = useState({} as any);
  useEffect(() => {
    if (!electionId || tabChange !== '4') return;
    let resultInterval: NodeJS.Timeout;
    let isFetching = false;
    let isTabActive = true;
    let didCancel = false;

    const fetchResult = () => {
      if (!isTabActive || isFetching) return;
      isFetching = true;
      getElectionResult(electionId)
        .then((resultData) => {
          if (didCancel) return;
          const newData = resultData?.getElectionResult?.map(
            (election: any, index: number) => ({ index: index + 1, ...election })
          );
          setResultData(newData || []);
        })
        .catch((error: Error) => { if (!didCancel) message.error(error.message); })
        .finally(() => {
          isFetching = false;
        });
    };

    const handleVisibilityChange = () => {
      isTabActive = !document.hidden;
      if (isTabActive) {
        fetchResult();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    fetchResult();
    resultInterval = setInterval(fetchResult, 5000);
    return () => {
      didCancel = true;
      clearInterval(resultInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [tabChange, electionId]);

  // Fetch codes and result data once when tab changes to '3' (Báo cáo), do NOT fetch election info again
  useEffect(() => {
    if (!electionId || tabChange !== '3') return;
    let didCancel = false;
    Promise.all([
      getCodes(electionId),
      getElectionResult(electionId)
    ])
      .then(([codesData, resultDataRes]) => {
        if (didCancel) return;
        const newCodes = (codesData?.getCodes || []).map(
          (code: any, index: number) => ({ index: index + 1, ...code })
        );
        setCodes(newCodes);
        const newData = resultDataRes?.getElectionResult?.map(
          (election: any, index: number) => ({ index: index + 1, ...election })
        );
        setResultData(newData || []);
      })
      .catch((error: Error) => { if (!didCancel) message.error(error.message); });
    return () => { didCancel = true; };
  }, [tabChange, electionId]);

  // Only fetch candidates on initial load or when isLoadCandidate changes
  useEffect(() => {
    if (!electionId || isPageLoading) return;
    let didCancel = false;
    getCandidates(electionId)
      .then((data) => {
        if (didCancel) return;
        const newCandidates = (data?.getCandidates || []).map(
          (candidate: any, index: number) => ({
            index: index + 1,
            ...candidate
          })
        );
        setCandidates(newCandidates);
      })
      .catch((error: Error) => {
        if (!didCancel) {
          message.error(error.message || 'Có lỗi xảy ra khi tải ứng cử viên!');
        }
      });
    return () => { didCancel = true; };
  }, [electionId, isLoadCandidate, isPageLoading]);

  const items = [
    {
      label: 'Ứng cử viên',
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
          data={resultData}
          election={resultElection}
        />
      )
    },
    {
      label: 'Kết quả',
      key: '4',
      children: (
        <ResultComponent
          electionId={electionId}
          data={resultData}
          election={resultElection}
        />
      )
    }
  ];

  if (isPageLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#15181a',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Spin
          size="large"
          tip="Đang tải dữ liệu..."
        />
        <style jsx global>{`
        .ant-spin-dot-item {
          background-color: #4aa8ff !important;
        }
      `}</style>
      </div>
    );
  }

  return (
    <AppLayout>
      <>
        <style jsx global>{`
          .ant-tabs .ant-tabs-tab {
            color: #ffffff !important;
            background-color: transparent !important;
          }
          .ant-tabs .ant-tabs-tab:hover {
            color: #4aa8ff !important;
          }
          .ant-tabs .ant-tabs-tab.ant-tabs-tab-active {
            color: #4aa8ff !important;
          }
          .ant-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
            color: #4aa8ff !important;
          }
          .ant-tabs .ant-tabs-ink-bar {
            background-color: #4aa8ff !important;
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
            border-color: #4aa8ff !important;
          }
          .ant-select-focused .ant-select-selector {
            border-color: #4aa8ff !important;
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
            background-color: #4aa8ff !important;
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
        `}</style>
        <div className="my-2 text-3xl font-bold text-white mt-4 w-full text-center" style={{ backgroundColor: '#15181a' }}>{election.name}</div>

        {/* Status bar with live badge and toggle button */}
        <div className="flex items-center justify-between mb-4 px-2 py-2 rounded" style={{ backgroundColor: '#23272b' }}>
          <div className="flex items-center gap-3">
            {election && election.status === 'Active' ? (
              <span className="flex items-center gap-1">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-green-400 font-bold ml-1">Đang diễn ra</span>
                <span className="ml-2 px-2 py-0.5 rounded bg-green-900 text-green-300 text-xs font-semibold animate-pulse">LIVE</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="relative flex h-3 w-3">
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-gray-400"></span>
                </span>
                <span className="text-gray-400 font-bold ml-1">Đã đóng</span>
                <span className="ml-2 px-2 py-0.5 rounded bg-gray-700 text-gray-300 text-xs font-semibold">CLOSED</span>
              </span>
            )}
          </div>
          <div>
            {election && election.status === 'Active' && (
              <Popconfirm
                title="Bạn chắc chắn muốn dừng bầu cử?"
                okText="Dừng bầu cử"
                cancelText="Hủy"
                onConfirm={handleToggleVoting}
                overlayClassName="dark-popconfirm"
                cancelButtonProps={{
                  className: 'font-bold px-4 rounded bg-[#4aa8ff] text-[#15181a] hover:bg-[#4aa8ff] hover:bg-opacity-70 hover:text-[#15181a] focus:bg-[#4aa8ff] focus:text-[#15181a] border-none'
                }}
                okButtonProps={{
                  className: 'font-bold px-4 rounded bg-[#da0e0e] border-none text-[#ffffff] hover:bg-[#da0e0e] hover:bg-opacity-70 hover:text-[#ffffff] focus:bg-[#da0e0e] focus:text-[#ffffff]'
                }}
              >
                <Button
                  className="font-bold px-4 rounded border-none bg-[#da0e0e] text-[#ffffff] hover:bg-[#da0e0e] hover:bg-opacity-70 hover:text-[#ffffff] focus:bg-[#da0e0e] focus:text-[#ffffff]"
                >
                  🛑 Dừng bầu cử
                </Button>
              </Popconfirm>
            )}
            {election && election.status && election.status !== 'Active' && (
              <Popconfirm
                title="Bạn chắc chắn muốn mở lại bầu cử?"
                okText="Mở lại bầu cử"
                cancelText="Hủy"
                onConfirm={handleToggleVoting}
                overlayClassName="dark-popconfirm"
                cancelButtonProps={{
                  className: 'font-bold px-4 rounded bg-[#4aa8ff] border-none text-[#15181a] hover:bg-[#4aa8ff] hover:bg-opacity-70 hover:text-[#15181a] focus:bg-[#4aa8ff] focus:text-[#15181a]'
                }}
                okButtonProps={{
                  className: 'font-bold px-4 rounded bg-[#52c41a] border-none text-[#ffffff] hover:bg-[#52c41a] hover:bg-opacity-70 hover:text-[#ffffff] focus:bg-[#52c41a] focus:text-[#ffffff]'
                }}
              >
                <Button
                  className="font-bold px-4 rounded border-none bg-[#52c41a] text-[#ffffff] hover:bg-[#52c41a] hover:bg-opacity-70 hover:text-[#ffffff] focus:bg-[#52c41a] focus:text-[#ffffff]"
                >
                  ✅ Mở lại bầu cử
                </Button>
              </Popconfirm>
            )}
          </div>
        </div>

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

  const onFinish = async ({ name }: any) => {
    setIsSubmitting(true);
    const fmData = new FormData();
    const config = {
      headers
    };

    fmData.append('file', fileList[0].originFileObj as RcFile);
    try {
      const res = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_URL}/election/uploadFile`,
        fmData,
        config
      );
      const result = await createCandidate(electionId, name, res.data.link);
      // Check for GraphQL errors in result
      if (result?.errors && result.errors.length > 0) {
        message.error('Không thể tạo ứng cử viên');
        setIsSubmitting(false);
        return;
      }
      setIsLoadCandidate(!isLoadCandidate);
      setIsModalOpen(false);
      setIsSubmitting(false);
      form.resetFields();
      setFileList([]);
    } catch (error: any) {
      message.error(error?.message || 'Có lỗi xảy ra khi tạo ứng cử viên!');
      setIsSubmitting(false);
    }
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
        className="font-bold px-4 rounded mb-2 bg-[#4aa8ff] text-[#15181a] border-none hover:bg-[#4aa8ff] hover:bg-opacity-70 hover:text-[#15181a] focus:bg-[#4aa8ff] focus:text-[#15181a]"
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
            className="font-bold px-4 rounded bg-[#4aa8ff] text-[#15181a] border-none hover:bg-[#4aa8ff] hover:bg-opacity-70 hover:text-[#15181a] focus:bg-[#4aa8ff] focus:text-[#15181a]"
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

      <Table
        columns={columns}
        dataSource={candidates}
        className="candidate-table dark-pagination"
        pagination={candidates.length < 10 ? false : undefined}
      />
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
  const handleGenerateCodes = async () => {
    const amountText = prompt('Nhập số lượng mã bạn muốn tạo thêm!');

    const amount = Number.parseInt(amountText ?? '');
    if (amount) {
      try {
        const result = await generateCodes(electionId, amount);
        if (result?.errors && result.errors.length > 0) {
          message.error('Không thể tạo mã bầu cử');
          return;
        }
        setIsLoadCode(!isLoadCode);
      } catch (error: any) {
        message.error(error?.message || 'Có lỗi xảy ra khi tạo mã bầu cử!');
      }
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
    axiosInstance
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
        className="font-bold px-4 rounded mb-2 bg-[#4aa8ff] text-[#15181a] border-none hover:bg-[#4aa8ff] hover:bg-opacity-70 hover:text-[#15181a] focus:bg-[#4aa8ff] focus:text-[#15181a]"
      >
        Tạo mã bầu cử
      </Button>

      <Button
        onClick={handleDownloadCodes}
        className="font-bold px-4 rounded mb-2 ml-2 bg-[#4aa8ff] text-[#15181a] border-none hover:bg-[#4aa8ff] hover:bg-opacity-70 hover:text-[#15181a] focus:bg-[#4aa8ff] focus:text-[#15181a]"
      >
        Tải xuống
      </Button>


      {!!usedCodes?.length && (
        <Tag className="ml-2 border-none text-white bg-green-500" >
          Có {usedCodes.length} mã đã sử dụng
        </Tag>
      )}

      {!!unUsedCodes?.length && (
        <Tag className="ml-2 border-none bg-yellow-500 text-white">
          Có {unUsedCodes.length} mã chưa sử dụng
        </Tag>
      )}


      <div className='w-full overflow-x-scroll'>
        <Table
          columns={codeColumns}
          dataSource={codes}
          className="code-table dark-pagination"
          pagination={codes.length < 10 ? false : undefined}
        />
      </div>
    </div>
  );
};

const ReportComponent = ({ electionId, codes, data, election }: any) => {

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
    // Check if there's any meaningful data to export
    if (!data || data.length === 0) {
      message.error('Không có dữ liệu ứng cử viên để xuất!');
      return;
    }

    if (!codes || codes.length === 0) {
      message.error('Không có dữ liệu mã bầu cử để xuất!');
      return;
    }

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

    try {
      XLSX.writeFile(workbook, fileName);
      message.success('Xuất file Excel thành công!');
    } catch (error) {
      console.error('Export error:', error);
      message.error('Lỗi khi xuất file Excel!');
    }
  };

  const exportVoteRecordsOnly = () => {
    // Check if there's any vote data to export
    if (!data || data.length === 0) {
      message.error('Không có dữ liệu ứng cử viên để xuất!');
      return;
    }

    // Check if there are any actual votes
    const hasVotes = data.some((candidate: any) => candidate.votes && candidate.votes.length > 0);
    if (!hasVotes) {
      message.error('Không có dữ liệu phiếu bầu để xuất!');
      return;
    }

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

    try {
      XLSX.writeFile(workbook, fileName);
      message.success('Xuất dữ liệu phiếu bầu chi tiết thành công!');
    } catch (error) {
      console.error('Export error:', error);
      message.error('Lỗi khi xuất file Excel!');
    }
  };

  return (
    <div key={`report-component-${electionId}`} style={{ backgroundColor: '#15181a', color: 'white' }}>
      {/* Export Buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          onClick={exportVotingDataToExcel}
          className="font-bold px-4 rounded bg-[#4aa8ff] text-[#ffffff] border-none hover:bg-[#4aa8ff] hover:bg-opacity-75 hover:opacity-75 hover:text-[#ffffff] focus:bg-[#4aa8ff] focus:text-[#ffffff]"
        >
          📊 Xuất báo cáo đầy đủ
        </Button>
        <Button
          onClick={exportVoteRecordsOnly}
          className="font-bold px-4 rounded bg-[#4aa8ff] text-[#ffffff] border-none hover:bg-[#4aa8ff] hover:bg-opacity-75 hover:opacity-75 hover:text-[#ffffff] focus:bg-[#4aa8ff] focus:text-[#ffffff]"
        >
          📋 Xuất dữ liệu phiếu bầu
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card style={{ backgroundColor: '#2a2d30', borderColor: '#3a4044', borderRadius: '8px', overflow: 'hidden' }}>
          <Statistic
            title={<span style={{ color: '#ffffff' }}>Tổng số mã được tạo</span>}
            valueStyle={{ color: '#ffffff' }}
            value={totalCodes}
          />
        </Card>

        <Card style={{ backgroundColor: '#2a2d30', borderColor: '#3a4044', borderRadius: '8px', overflow: 'hidden' }}>
          <Statistic
            title={<span style={{ color: '#ffffff' }}>Số mã đã sử dụng</span>}
            value={usedCodes}
            valueStyle={{ color: '#00c951' }}
          />
        </Card>

        <Card style={{ backgroundColor: '#2a2d30', borderColor: '#3a4044', borderRadius: '8px', overflow: 'hidden' }}>
          <Statistic
            title={<span style={{ color: '#ffffff' }}>Số mã chưa sử dụng</span>}
            value={unusedCodes}
            valueStyle={{ color: '#efb100' }}
          />
        </Card>

        <Card style={{ backgroundColor: '#2a2d30', borderColor: '#3a4044', borderRadius: '8px', overflow: 'hidden' }}>
          <Statistic
            title={<span style={{ color: '#ffffff' }}>Tỷ lệ tham gia</span>}
            value={votingRate.toFixed(1)}
            suffix="%"
            valueStyle={{ color: '#4aa8ff' }}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title={<span style={{ color: '#ffffff' }}>Tiến độ bỏ phiếu</span>}
          style={{ backgroundColor: '#2a2d30', borderColor: '#3a4044', borderRadius: '8px', overflow: 'hidden' }}
        >
          <Progress
            percent={votingRate}
            strokeColor={{
              '0%': '#4aa8ff',
              '100%': '#2b7bbd',
            }}
            trailColor="#3a4044"
            format={(percent) => `${percent?.toFixed(1)}%`}
            style={{ marginBottom: '20px' }}
          />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span style={{ color: '#ffffff' }}>Đã bỏ phiếu:</span>
              <span style={{ color: '#ffffff' }} className="font-bold">{usedCodes} mã</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#ffffff' }}>Chưa bỏ phiếu:</span>
              <span style={{ color: '#ffffff' }} className="font-bold">{unusedCodes} mã</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#ffffff' }}>Tổng cộng:</span>
              <span style={{ color: '#ffffff' }} className="font-bold">{totalCodes} mã</span>
            </div>
          </div>
        </Card>

        <Card
          title={<span style={{ color: '#ffffff' }}>Thống kê chi tiết</span>}
          style={{ backgroundColor: '#2a2d30', borderColor: '#3a4044', borderRadius: '8px', overflow: 'hidden' }}
        >
          <div className="space-y-3">
            <div className="p-3 rounded" style={{ backgroundColor: '#3a4044' }}>
              <div className="flex justify-between items-center">
                <span style={{ color: '#ffffff' }}>Tổng số phiếu bầu:</span>
                <span style={{ color: '#4aa8ff' }} className="text-xl font-bold">{totalVotesFromResults}</span>
              </div>
            </div>

            <div className="p-3 rounded" style={{ backgroundColor: '#3a4044' }}>
              <div className="flex justify-between items-center">
                <span style={{ color: '#ffffff' }}>Số ứng cử viên:</span>
                <span style={{ color: '#4aa8ff' }} className="text-xl font-bold">{data.length}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const ResultComponent = ({ electionId, data, election }: any) => {

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
          className="font-bold px-4 rounded bg-[#4aa8ff] text-[#15181a] border-none hover:bg-[#4aa8ff] hover:bg-opacity-75 hover:opacity-75 hover:text-[#15181a] focus:bg-[#4aa8ff] focus:text-[#15181a]"
        >
          📊 Xuất kết quả
        </Button>
      </div>
      <div className='w-full overflow-x-scroll'>
        <Table
          columns={resultColumns}
          dataSource={data}
          className="result-table dark-pagination"
          pagination={data.length < 10 ? false : undefined}
        />
      </div>
    </div>
  );
};

const DeleteComponent = ({
  record,
  setIsLoadCandidate,
  isLoadCandidate
}: any) => {
  const handleDeleteCandidate = async () => {
    try {
      const result = await deleteCandidate(record.electionId, record.id);
      if (result?.errors && result.errors.length > 0) {
        message.error('Xoá ứng cử viên thất bại!');
        return;
      }
      message.success('Xoá ứng cử viên thành công!');
      setIsLoadCandidate(!isLoadCandidate);
    } catch (error) {
      message.error('Xoá ứng cử viên thất bại!');
    }
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
          style: { backgroundColor: '#4aa8ff', borderColor: '#4aa8ff', color: '#15181a' },
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
        className="font-bold px-4 rounded mb-2 bg-[#4aa8ff] text-[#15181a] border-none hover:bg-[#4aa8ff] hover:bg-opacity-70 hover:text-[#15181a] focus:bg-[#4aa8ff] focus:text-[#15181a]"
      >
        Chi tiết
      </Button>

      <Modal
        title={`Danh sách bỏ phiếu cho ${record.name}`}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        className='dark-modal p-0 rounded-md'
        style={{ border: '1px solid #3a4044' }}
        footer={[
          <Button
            key="submit"
            form="ResultDetail"
            className="font-bold px-4 rounded bg-[#4aa8ff] text-[#15181a] border-none hover:bg-[#4aa8ff] hover:bg-opacity-75 hover:opacity-75 hover:text-[#15181a] focus:bg-[#4aa8ff] focus:text-[#15181a]"
            onClick={() => setIsModalOpen(false)}
          >
            OK
          </Button>
        ]}
      >
        {!record?.votes?.length && (
          <div>Chưa có ai bỏ phiếu cho người này</div>
        )}

        <Timeline className='h-full overflow-y-auto'>
          {!!record?.votes?.length &&
            record?.votes.map((vote: any, index: number) => (
              <Timeline.Item key={index}>
                <span style={{ color: '#4aa8ff' }} className="font-bold text-xl">{vote?.text}</span>

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
