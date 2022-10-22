import React from 'react';
import { Button, Result } from 'antd';
import Link from 'next/link';

const BackHomeLink = () => (
  <Link href={'/'}>
    <Button type="primary">Trở về trang chính</Button>
  </Link>
);

const FourZeroThreePage: React.FC = () => (
  <Result
    status="403"
    title="403"
    subTitle="Rất tiếc! Bạn không có quyền truy cập vào trang này."
    extra={<BackHomeLink />}
  />
);

export default FourZeroThreePage;
