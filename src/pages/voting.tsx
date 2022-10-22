import { Alert, Button, message, Modal, Result, Spin, Table, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  checkCode,
  getMaxSelectedCandidate,
  getVotingCandidates
} from '../operation/vote.query';
import { createVotes } from '../operation/vote.mutation';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { LoadingOutlined } from '@ant-design/icons';

const columns = [
  {
    title: 'STT',
    dataIndex: 'index',
    width: '10%',
    render: (index: string) => <div className="text-xl font-bold">{index}</div>
  },
  {
    title: 'Ảnh',
    width: '30%',
    dataIndex: 'imageUrl',
    render: (url: string) => (
      <Image src={url} alt={'N/A'} width={80} height={80} />
    )
  },
  {
    title: 'Họ và Tên',
    dataIndex: 'name',
    width: '40%',
    render: (name: string) => <div className="text-xl font-bold">{name}</div>
  }
];

const VotingPage = () => {
  const router = useRouter();
  const [maxSelected, setMaxSelected] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [codeId, setCodeId] = useState('');
  const [electionId, setElectionId] = useState('');
  const [isValidPage, setIsValidPage] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidates, setCandidates]: [any, any] = useState([]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsSubmitting(true);
    const selectedCandidateIds = selectedRowKeys.map(
      (rowKey) => candidates[rowKey].id
    );

    createVotes(electionId, codeId, selectedCandidateIds)
      .then((data) => {
        setIsSubmitting(false);
        setIsSubmitted(true);
        setIsModalOpen(false);
        console.log(data);
      })
      .catch((error) => {
        console.log(error);
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
        .catch((error: Error) => message.error(error.message));

      getMaxSelectedCandidate(election, code)
        .then((data) => {
          if (data?.getMaxSelectedCandidate?.maxSelected) {
            setMaxSelected(data.getMaxSelectedCandidate?.maxSelected);
          }
        })
        .catch((error: Error) => message.error(error.message));
    });
  }, [router.isReady]);

  const onSelectChange = (newSelectedRowKeys: any) => {
    if (newSelectedRowKeys.length > maxSelected) {
      message.error(`Bạn chỉ có thể chọn tối đa ${maxSelected} người!`);
    } else {
      setSelectedRowKeys(newSelectedRowKeys);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };
  const hasSelected = selectedRowKeys.length > 0;
  return (
    <>
      {isSubmitted && isValidPage && (
        <Result status="success" title="Bạn đã gửi phiếu bầu thành công!" />
      )}

      {!isValidPage && (
        <Result
          status="warning"
          className="px-2 lg:px-32"
          title="Mã bầu cử chưa đúng hoặc đã sử dụng."
          subTitle="Liên hệ với Nhân Sự để lấy mã bầu cử mới nhé!"
        />
      )}

      {!isSubmitted && isValidPage && (
        <div className="px-2 lg:px-32">
          <div className="flex justify-center py-5">
            <p className="font-bold text-4xl">Bầu Cử</p>
          </div>

          <div className="w-fit">
            <Alert
              message={`Bạn có thể chọn tối đa ${maxSelected} ứng cử viên!`}
              type="warning"
              showIcon
            />
          </div>

          <div className="flex my-2">
            <Button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded"
              onClick={() => showModal()}
              disabled={
                selectedRowKeys.length <= 0 ||
                selectedRowKeys.length > maxSelected
              }
            >
              Gửi phiếu bầu
            </Button>

            <Modal
              title="Xác nhận gửi phiếu bầu"
              open={isModalOpen}
              onOk={handleOk}
              onCancel={handleCancel}
              footer={[
                <Button key="back" onClick={handleCancel}>
                  Trỏ lại
                </Button>,
                <Button
                  form="CreateCandidateForm"
                  key="submit"
                  htmlType="submit"
                  onClick={handleOk}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded"
                >
                  {isSubmitting && <Spin indicator={antIcon} />}
                  {!isSubmitting && 'Xác Nhận'}
                </Button>
              ]}
            >
              <div className="text-lg font-bold text-yellow-500 italic">
                Bạn sẽ bầu cho các ứng cử viên sau
              </div>

              {selectedRowKeys.map((selectedRow, index) => {
                return (
                  <p className="my-2 text-lg text-gray-700" key={index}>
                    {index + 1}. {candidates[selectedRow]?.name || 'N/A'}
                  </p>
                );
              })}
            </Modal>

            {hasSelected && (
              <Tag className="ml-2 align-middle" color="blue">Bạn đã chọn {selectedRowKeys.length} người</Tag>
            )}
          </div>

          <div></div>
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={candidates}
          />
        </div>
      )}
    </>
  );
};

export default VotingPage;
