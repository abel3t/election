import { message, Table, Tabs } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/app-layout';
import { getCandidates, getCodes } from '../../operation/election.query';
import { useRouter } from 'next/router';

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

  const router = useRouter();

  useEffect(() => {
    setElectionId(router.query?.id as any);
  }, []);

  useEffect(() => {
    if (electionId) {
      getCandidates(electionId).then((data) => {
        const newCandidates = (data.getCandidates || []).map((candidate: any, index: number) => ({ index: index + 1, ...candidate }));
        setCandidates(newCandidates);
      }).catch((error: Error) => message.error(error.message));

      getCodes(electionId).then((data) => {
        const newCodes = (data.getCodes || []).map((code: any, index: number) => ({ index: index + 1, ...code }));
        setCodes(newCodes);
      }).catch((error: Error) => message.error(error.message));
    }
  }, [electionId]);


  const items = [
    { label: 'Người ứng cử', key: '1', children: <Table columns={columns} dataSource={candidates} onChange={onChange}/> }, // remember to pass the key prop
    { label: 'Mã bầu cử', key: '2', children: <Table columns={codeColumns} dataSource={codes}/> },
    { label: 'Kết quả', key: '3', children: 'Kết quả  ' },
  ];

  return (<AppLayout>
    <>
      <Tabs items={items} />
    </>
    </AppLayout>)
};

export default ElectionDetailPage;
