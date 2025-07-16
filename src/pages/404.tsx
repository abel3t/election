import { Button, Result } from 'antd';
import Link from 'next/link';

const BackHomeLink = () => (
  <Link href={'/'}>
    <Button type="primary" style={{ backgroundColor: '#4aa8ff', borderColor: '#4aa8ff', color: '#15181a' }}>
      Trở về trang chính
    </Button>
  </Link>
);

const FourZeroFourPage: React.FC = () => (
  <div style={{ backgroundColor: '#15181a', minHeight: '100vh', color: '#ffffff' }}>
    <Result
      status="404"
      title="404"
      subTitle="Thành thật xin lỗi, trang này không tồn tại."
      extra={<BackHomeLink />}
    />
  </div>
);

export default FourZeroFourPage;
