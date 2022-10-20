import { Button, message, Result, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { checkCode, getMaxSelectedCandidate, getVotingCandidates } from '../operation/vote.query';
import { createVotes } from '../operation/vote.mutation';
import { useRouter } from 'next/router';

const columns = [
  {
    title: 'STT',
    dataIndex: 'index'
  },
  {
    title: 'Ảnh',
    dataIndex: 'imageUrl',
    render: (url: string) => <img src={url} alt={'N/A'} width={80} height={80}/>
  },
  {
    title: 'Tên',
    dataIndex: 'name'
  }
];

const VotingPage = () => {
  const router = useRouter();
  const [maxSelected, setMaxSelected] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [codeId, setCodeId] = useState('');
  const [electionId, setElectionId] = useState('');
  const [isValidPage, setIsValidPage] = useState(true);

  const [candidates, setCandidates]: [any, any] = useState([]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const election: string = `${router.query?.election || ''}`;
    const code: string = `${router.query?.code || ''}`;

    if (!election || !code) {
      setIsValidPage(false);
    }

    checkCode(election as string, code)
      .then(data => {
        if (data.checkCode?.isValid) {
          setElectionId(election);
          setCodeId(code);
        }

        setIsValidPage(!!data.checkCode?.isValid);

        getVotingCandidates(election, code)
          .then((data) => {
            const newCandidates = (data?.getVotingCandidates || []).map(
              (code: any, index: number) => ({ index: index + 1, key: index, ...code }));
            setCandidates(newCandidates);
          }).catch((error: Error) => message.error(error.message));

        getMaxSelectedCandidate(election, code)
          .then((data) => {
            if (data.getMaxSelectedCandidate?.maxSelected) {
              setMaxSelected(data.getMaxSelectedCandidate?.maxSelected);
            }
          }).catch((error: Error) => message.error(error.message));
      });


  }, [router.isReady]);

  const onSelectChange = (newSelectedRowKeys: any) => {
    if (newSelectedRowKeys.length > maxSelected) {
      message.error(`Bạn chỉ có thể chọn tối đa ${maxSelected} người!`);
    } else {
      setSelectedRowKeys(newSelectedRowKeys);
    }
  };

  const onSubmitData = () => {
    const selectedCandidateIds = selectedRowKeys.map(rowKey => candidates[rowKey].id);

    createVotes(electionId, codeId, selectedCandidateIds)
      .then(data => console.log(data))
      .catch(error => console.log(error));
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };
  const hasSelected = selectedRowKeys.length > 0;
  return (
    <>
      {
        !isValidPage && <Result
          status="warning"
          title="Có vẻ như mã bầu cử của bạn chưa đúng hoặc đã được sử dụng. Liên hệ với Nhân sự để lấy mã bầu cử mới nhé!"
        />
      }

      {
        isValidPage && <div>
          <Button onClick={onSubmitData} disabled={selectedRowKeys.length !== 2}>Gửi phiếu bầu</Button>
          <div
            style={{
              marginBottom: 16
            }}
          >
        <span
          style={{
            marginLeft: 8
          }}
        >
          {hasSelected ? `Bạn đã bầu cho ${selectedRowKeys.length} người` : ''}
        </span>
          </div>
          <Table rowSelection={rowSelection} columns={columns} dataSource={candidates}/>
        </div>
      }


    </>

  );
};

export default VotingPage;