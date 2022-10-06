import React from 'react';
import { Col, Row, Space } from 'antd';
import styled from 'styled-components';
import Link from 'next/link';

type IElectionProps = {
  title: string,
  href: string
}

const StyledSpace = styled.div`
  display: flex;
  min-width: 100%;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 8px 0 rgb(153 166 166 / 30%);
  cursor: pointer;
  margin-bottom: 10px;
`;

const ElectionCard = ({ title, href }: IElectionProps) => {
  return (
    <Link href={href}>
      <StyledSpace>
        <Row>
          <Col flex={2}>{title}</Col>
        </Row>
      </StyledSpace>
    </Link>
  )
};

export default ElectionCard;