import { Layout, Table, Tabs } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import React from 'react';
import AppLayout from '../../components/app-layout';

interface DataType {
  key: React.Key;
  name: string;
  age: number;
  address: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: 'Name',
    dataIndex: 'name',
    filters: [
      {
        text: 'Joe',
        value: 'Joe'
      },
      {
        text: 'Category 1',
        value: 'Category 1',
        children: [
          {
            text: 'Yellow',
            value: 'Yellow'
          },
          {
            text: 'Pink',
            value: 'Pink'
          }
        ]
      },
      {
        text: 'Category 2',
        value: 'Category 2',
        children: [
          {
            text: 'Green',
            value: 'Green'
          },
          {
            text: 'Black',
            value: 'Black'
          }
        ]
      }
    ],
    filterMode: 'tree',
    filterSearch: true,
    onFilter: (value: string, record) => record.name.includes(value),
    width: '30%'
  },
  {
    title: 'Age',
    dataIndex: 'age',
    sorter: (a, b) => a.age - b.age
  },
  {
    title: 'Address',
    dataIndex: 'address',
    filters: [
      {
        text: 'London',
        value: 'London'
      },
      {
        text: 'New York',
        value: 'New York'
      }
    ],
    onFilter: (value: string, record) => record.address.startsWith(value),
    filterSearch: true,
    width: '40%'
  }
];

const data: DataType[] = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'New York No. 1 Lake Park'
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'London No. 1 Lake Park'
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'Sidney No. 1 Lake Park'
  },
  {
    key: '4',
    name: 'Jim Red',
    age: 32,
    address: 'London No. 2 Lake Park'
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

const { Header, Footer, Content } = Layout;

const App: React.FC = () => (

  <AppLayout>
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="Người ứng cử" key="1">
        <Table columns={columns} dataSource={data} onChange={onChange}/>
      </Tabs.TabPane>
      <Tabs.TabPane tab="Mã bầu cử" key="2">
        Content of Tab Pane 2
      </Tabs.TabPane>
      <Tabs.TabPane tab="Kết quả" key="3">
        Content of Tab Pane 3
      </Tabs.TabPane>
    </Tabs>
  </AppLayout>
);

export default App;
