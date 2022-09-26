import React from 'react';
import { Pagination } from 'antd';

type IPaginationProps = {
  currentPage: number,
  total: number
}

const PaginationCard = ({ currentPage, total }: IPaginationProps) => {
  return <Pagination defaultCurrent={currentPage} total={total}/>;
};

export default PaginationCard;