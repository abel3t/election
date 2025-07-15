import { Alert, Button, message, Modal, Result, Spin, Table, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  checkCode, getElectionTitle,
  getMaxSelectedCandidate,
  getVotingCandidates
} from '../operation/vote.query';
import { createVotes } from '../operation/vote.mutation';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { LoadingOutlined } from '@ant-design/icons';

const columns = [
  {
    title: <span className="font-bold">STT</span>,
    dataIndex: 'index',
    width: '3%',
    key: 'index',
    render: (index: string) => <div className="text-md font-bold" style={{ color: '#ffffff' }}>{index}</div>
  },
  {
    title: <p className="font-bold text-center w-full">Ảnh</p>,
    width: '25%',
    dataIndex: 'imageUrl',
    key: 'imageUrl',
    render: (url: string) => (
      <div className='flex justify-center items-center w-full'>
        <Image src={url} alt={'N/A'} width={80} height={80} />
      </div>
    )
  },
  {
    title: <span className="font-bold">Họ và Tên</span>,
    dataIndex: 'name',
    width: '62%',
    key: 'name',
    render: (name: string) => <div className="text-md font-bold" style={{ color: '#ffffff' }}>{name}</div>
  }
];

const VotingPage = () => {
  const router = useRouter();
  const [maxSelected, setMaxSelected] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [codeId, setCodeId] = useState('');
  const [electionId, setElectionId] = useState('');
  const [isValidPage, setIsValidPage] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidates, setCandidates]: [any, any] = useState([]);
  const [electionTitle, setElectionTitle] = useState('');

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    if (isSubmitting || isSubmitted) {
      return;
    }

    setIsSubmitting(true);
    const selectedCandidateIds = selectedRowKeys.map(
      (rowKey) => candidates[rowKey].id
    );

    createVotes(electionId, codeId, selectedCandidateIds)
      .then((result) => {
        if (result?.errors && result.errors.length > 0) {
          message.error('Không thể gửi phiếu bầu cử');
          setIsSubmitting(false);
          setIsModalOpen(false);
          return;
        }
        setIsSubmitting(false);
        setIsSubmitted(true);
        setIsModalOpen(false);
      })
      .catch((error) => {
        message.error('Không thể gửi phiếu bầu cử');
        setIsSubmitting(false);
        setIsModalOpen(false);
      });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 18 }} spin />;

  useEffect(() => {
    localStorage.setItem('guest', 'true');
  }, []);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const query: any = router.query || {};

    const election: string = query.election?.toString() || '';
    const code: string = query.code?.toString() || '';

    if (!election || !code) {
      setIsValidPage(false);
    }

    checkCode(election as string, code).then((data) => {
      if (data.checkCode?.isValid) {
        setElectionId(election);
        setCodeId(code);
      }

      setIsValidPage(!!data.checkCode?.isValid);

      getVotingCandidates(election, code)
        .then((data) => {
          const newCandidates = (data?.getVotingCandidates || []).map(
            (code: any, index: number) => ({
              index: index + 1,
              key: index,
              ...code
            })
          );
          setCandidates(newCandidates);
        })
        .catch((error: Error) => {
          console.log(error);
          setIsValidPage(false);
        });

      getMaxSelectedCandidate(election, code)
        .then((data) => {
          if (data?.getMaxSelectedCandidate?.maxSelected) {
            setMaxSelected(data.getMaxSelectedCandidate?.maxSelected);
          }
        })
        .catch((error: Error) => console.log(error));

      getElectionTitle(election)
        .then((data) => {
          if (data?.getElectionTitle?.title) {
            setElectionTitle(data.getElectionTitle?.title);
          }
        })
        .catch((error: Error) => console.log(error));
    });
  }, [router.isReady]);

  const onSelectChange = (newSelectedRowKeys: any) => {
    if (newSelectedRowKeys.length > maxSelected) {
      message.error(`Bạn được chọn chỉ ${maxSelected} ứng viên!`);
    } else {
      setSelectedRowKeys(newSelectedRowKeys);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  const handleRowClick = (record: any) => {
    const key = record.key;
    const currentIndex = selectedRowKeys.indexOf(key);
    let newSelectedKeys = [...selectedRowKeys];

    if (currentIndex >= 0) {
      // Row is already selected, remove it
      newSelectedKeys.splice(currentIndex, 1);
    } else {
      // Row is not selected, add it
      if (newSelectedKeys.length >= maxSelected) {
        message.error(`Bạn được chọn chỉ ${maxSelected} ứng viên!`);
        return;
      }
      newSelectedKeys.push(key);
    }

    setSelectedRowKeys(newSelectedKeys);
  };

  const hasSelected = selectedRowKeys.length > 0;
  return (
    <>
      <style jsx global>{`
        .dark-modal .ant-modal-content {
          background-color: #15181a !important;
          border: 1px solid #3a4044 !important;
        }
        .dark-modal .ant-modal-header {
          background-color: #15181a !important;
          border-bottom: 1px solid #3a4044 !important;
        }
        .dark-modal .ant-modal-title {
          color: #ffffff !important;
        }
        .dark-modal .ant-modal-body {
          background-color: #15181a !important;
          color: #ffffff !important;
        }
        .dark-modal .ant-modal-footer {
          background-color: #15181a !important;
          border-top: 1px solid #3a4044 !important;
        }
        .dark-modal .ant-modal-close-x {
          color: #ffffff !important;
        }
        .dark-modal .ant-modal-close:hover {
          background-color: #3a4044 !important;
        }
      `}</style>
      {isSubmitted && isValidPage && (
        <div className='min-h-screen bg-[#15181a] flex items-center justify-center'>
          <Result
            style={{ marginTop: '-100px' }}
            className="px-2 lg:px-32 py-0"
            status="success"
            title="Bạn đã gửi phiếu bầu thành công!"
          />
        </div>
      )}

      {!isValidPage && (
        <div className='min-h-screen bg-[#15181a] flex items-center justify-center'>

          <Result
            style={{ marginTop: '-100px' }}
            status="warning"
            className="px-2 lg:px-32 pt-0"
            title="Mã bầu cử đã được sử dụng, không hợp lệ hoặc bầu cử đã kết thúc."
          />

        </div>
      )}

      {!isSubmitted && isValidPage && (
        <div className="px-2 lg:px-32 mb-10" style={{ backgroundColor: '#15181a', minHeight: '100vh' }}>
          <div className="flex flex-col justify-center items-center py-1">
            {/*<div>*/}
            {/*  <Image*/}
            {/*    src="https://election-v1.s3.ap-southeast-1.amazonaws.com/static/LEC_Logo.png"*/}
            {/*    width={60}*/}
            {/*    height={60}*/}
            {/*  />*/}
            {/*</div>*/}

            {/*<div className="font-bold text-xl mt-2">BẦU CỬ CHẤP SỰ</div>*/}
            {/*<div className="font-bold text-lg">Nhiệm Kỳ 2023-2025</div>*/}
            <div className="font-bold text-lg text-white">{electionTitle || 'N/A'}</div>
          </div>

          <div className="w-fit mt-2">
            <Alert
              message={`Bạn có thể chọn tối đa ${maxSelected} ứng cử viên!`}
              type="warning"
              showIcon
              className='font-bold'
            />
          </div>

          <div className='py-3'>
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={candidates}
              className="dark-pagination"
              pagination={candidates.length > 10 ? undefined : false}
              onRow={(record) => ({
                onClick: () => handleRowClick(record),
                style: { cursor: 'pointer' }
              })}
            />
            <div className='mt-3'>
              <div className="mb-3 flex justify-center">
                <Tag className="py-1 px-4" style={{ backgroundColor: '#fcbb1d', color: '#15181a', border: 'none' }}>
                  Bạn đã chọn {selectedRowKeys.length}/{maxSelected} ứng viên
                </Tag>
              </div>

              <div className="flex justify-center items-center my-6">
                <Button
                  className="font-bold px-10 py-6 rounded text-xl disabled:opacity-50 flex items-center justify-center bg-[#fcbb1d] text-[#15181a] border-none hover:bg-[#fcbb1d] hover:bg-opacity-75 hover:opacity-75 hover:text-[#15181a] focus:bg-[#fcbb1d] focus:text-[#15181a]"
                  onClick={() => showModal()}
                  disabled={selectedRowKeys.length !== maxSelected}
                >
                  GỬI PHIẾU BẦU
                </Button>
              </div>
            </div>
          </div>
          <Modal
            title={<span style={{ color: '#ffffff' }}>Xác nhận gửi phiếu bầu</span>}
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            className="dark-modal"
            style={{
              border: '1px solid #3a4044'
            }}
            bodyStyle={{
              backgroundColor: '#15181a',
              color: '#ffffff'
            }}
            footer={[
              <Button key="back" onClick={handleCancel} style={{ backgroundColor: '#3a4044', borderColor: '#3a4044', color: '#ffffff' }}>
                Trở lại
              </Button>,
              <Button
                form="CreateCandidateForm"
                key="submit"
                htmlType="submit"
                onClick={handleOk}
                className="font-bold px-4 rounded bg-[#fcbb1d] text-[#15181a] border-none hover:bg-[#fcbb1d] hover:bg-opacity-75 hover:opacity-75 hover:text-[#15181a] focus:bg-[#fcbb1d] focus:text-[#15181a]"
              >
                {isSubmitting && <Spin indicator={antIcon} />}
                {!isSubmitting && 'Xác Nhận'}
              </Button>
            ]}
          >
            <div className="text-lg font-bold italic" style={{ color: '#fcbb1d' }}>
              Bạn sẽ bầu cho các ứng cử viên sau
            </div>

            {selectedRowKeys
              .sort((a, b) => a - b)
              .map((selectedRow, index) => {
                return (
                  <div
                    className="my-2 font-bold text-lg mt-5"
                    style={{ color: '#ffffff' }}
                    key={index}
                  >
                    {index + 1}. {candidates[selectedRow]?.name || 'N/A'}
                  </div>
                );
              })}
          </Modal>
        </div>
      )}
    </>
  );
};

export default VotingPage;
