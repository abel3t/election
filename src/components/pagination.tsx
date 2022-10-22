import React from "react";
import { Pagination } from "antd";

type IPaginationProps = {
  currentPage: number;
  total: number;
  itemsPerPage: number;
  onChange: (page: number, pageSize: number) => void;
};

const PaginationCard = ({
  currentPage,
  total,
  itemsPerPage,
  onChange,
}: IPaginationProps) => {
  return (
    <Pagination
      defaultCurrent={currentPage}
      total={total}
      pageSize={itemsPerPage}
      onChange={onChange}
    />
  );
};

export default PaginationCard;
