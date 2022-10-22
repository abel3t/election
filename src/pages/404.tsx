import React from "react";
import { Button, Result } from "antd";
import Link from "next/link";

const BackHomeLink = () => (
  <Link href={"/"}>
    <Button type="primary">Trở về trang chính</Button>
  </Link>
);

const FourZeroFourPage: React.FC = () => (
  <Result
    status="404"
    title="404"
    subTitle="Thành thật xin lỗi, trang này không tồn tại."
    extra={<BackHomeLink />}
  />
);

export default FourZeroFourPage;
