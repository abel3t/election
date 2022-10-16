import { Button, message, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { getVotingCandidates } from '../operation/vote.query';
import { createVotes } from '../operation/vote.mutation';

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
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [candidates, setCandidates]: [any, any] = useState([]);

  useEffect(() => {
    getVotingCandidates('cl8af12c500218moi076khipf', 'cl8af25rp00828moinx9a4w3i')
      .then((data) => {
        const newCandidates = (data?.getCandidates || []).map(
          (code: any, index: number) => ({ index: index + 1, key: index, ...code }));
        console.log(newCandidates);
        setCandidates(newCandidates);
      }).catch((error: Error) => message.error(error.message));
  }, []);

  const onSelectChange = (newSelectedRowKeys: any) => {
    if (newSelectedRowKeys.length > 2) {
      message.error('Bạn chỉ có thể chọn tối đa 2 người!');
    } else {
      setSelectedRowKeys(newSelectedRowKeys);
    }
  };

  const onSubmitData = () => {
    const selectedCandidateIds = selectedRowKeys.map(rowKey => candidates[rowKey].id);

    createVotes('cl8af12c500218moi076khipf', 'cl8af25rp00828moinx9a4w3i', selectedCandidateIds)
      .then(data => console.log(data))
      .catch(error => console.log(error));
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };
  const hasSelected = selectedRowKeys.length > 0;
  return (
    <div>
      <Button onClick={onSubmitData} disabled={selectedRowKeys.length!==2}>Gửi phiếu bầu</Button>
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
  );
};

export default VotingPage;