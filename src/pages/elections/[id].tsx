import { Button, message, Table, Tabs } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/app-layout';
import { getCandidates, getCodes } from '../../operation/election.query';
import { useRouter } from 'next/router';
import { generateCodes } from '../../operation/election.mutation';

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

const onChange: TableProps<DataType>['onChange'] = (
  pagination,
  filters,
  sorter,
  extra
) => {
  console.log('params', pagination, filters, sorter, extra);
};

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
      children: <Table columns={columns} dataSource={candidates} onChange={onChange}/>
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
