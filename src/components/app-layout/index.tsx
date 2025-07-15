import { Button, Layout } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';

const { Header, Footer } = Layout;

type Props = {
  children: JSX.Element;
};

const AppLayout = ({ children }: Props) => {
  const router = useRouter();
  
  const handleLogout = () => {
    localStorage.clear(); 
    window.location.href = '/login';
  };

  const isHomepage = router.pathname === '/';

  return (
    <Layout>
      <Header
        className="px-2 lg:px-32 font-bold text-2xl cursor-pointer flex"
        style={{ justifyContent: 'space-between', paddingTop: '12px' }}
      >
        <Link href="/">
          <a className="text-white text-3xl hover:opacity-70 hover:text-white">Bầu Cử</a>
        </Link>
        {isHomepage && (
          <div>
            <Button
              className="font-bold px-4 rounded bg-[#fcbb1d] text-[#15181a] border-none hover:bg-[#fcbb1d] hover:bg-opacity-70 hover:text-[#15181a]"
              onClick={handleLogout}
            >
              Đăng Xuất
            </Button>
          </div>
        )}
      </Header>

      <div className="px-2 lg:px-32 min-h-full text-white" style={{ backgroundColor: '#15181a', minHeight: '84vh' }}>
        {children}
      </div>

      <Footer className="px-2 lg:px-32 text-white" style={{ backgroundColor: '#15181a' }}>© {new Date().getFullYear()} - Bản quyền thuộc về LEC</Footer>
    </Layout>
  );
};

export default AppLayout;
