import { Button, Result } from 'antd';
import Link from 'next/link';

const BackHomeLink = () => (
  <Link href={'/'}>
    <Button type="primary" style={{ backgroundColor: '#fcbb1d', borderColor: '#fcbb1d', color: '#15181a' }}>
      Trở về trang chính
    </Button>
  </Link>
);

const FourZeroThreePage: React.FC = () => (
  <div style={{ backgroundColor: '#15181a', minHeight: '100vh', color: '#ffffff' }}>
    <Result
      status="403"
      title="403"
      subTitle="Rất tiếc! Bạn không có quyền truy cập vào trang này."
      extra={<BackHomeLink />}
    />
  </div>
);

export default FourZeroThreePage;
