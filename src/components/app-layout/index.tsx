import { Button, Layout } from 'antd';
import Link from 'next/link';

const { Header, Footer } = Layout;

type Props = {
  children: JSX.Element;
};

const AppLayout = ({ children }: Props) => {
  const handleLogout = () => {
    localStorage.clear(); 
    window.location.href = '/login';
  };

  return (
    <Layout>
      <Header
        className="px-2 lg:px-32 font-bold text-2xl cursor-pointer flex"
        style={{ justifyContent: 'space-between', paddingTop: '12px' }}
      >
        <Link href="/">
          <a className="text-white text-3xl">Bầu Cử</a>
        </Link>
        <div>
          <Button
            style={{ backgroundColor: '#fcbb1d', borderColor: '#fcbb1d', color: '#15181a' }}
            className="font-bold px-4 rounded"
            onClick={handleLogout}
          >
            Đăng Xuất
          </Button>
        </div>
      </Header>

      <div className="px-2 lg:px-32 min-h-full text-white" style={{ backgroundColor: '#15181a', minHeight: '84vh' }}>
        {children}
      </div>

      <Footer className="px-2 lg:px-32 text-white" style={{ backgroundColor: '#15181a' }}>© {new Date().getFullYear()} - Bản quyền thuộc về LEC</Footer>
    </Layout>
  );
};

export default AppLayout;
