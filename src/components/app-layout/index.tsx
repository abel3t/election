      <style jsx global>{`
        .ant-dropdown-menu-dark {
          border: 1px solid #333 !important;
        }
      `}</style>
import { Button, Layout, Avatar, Dropdown, Menu } from 'antd';
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
        className="flex items-center justify-between gap-4"
        style={{
          padding: '0',
          minHeight: 48,
          height: 56,
          background: 'rgba(21,24,26,0.95)',
          borderBottom: '1.5px solid #23272f',
          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 100,
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0
        }}
      >
        {/* Home button only on non-home pages */}
        <div className="flex items-center gap-4" style={{ minWidth: 40, marginLeft: 16, marginRight: 0 }}>
          {!isHomepage ? (
            <Link href="/" passHref>
              <button
                className="rounded-full bg-[#23272f] hover:bg-[#4aa8ff] hover:bg-opacity-90 transition-colors shadow-md flex items-center justify-center border border-[#23272f] hover:border-[#4aa8ff]"
                style={{ width: 40, height: 40, transition: 'border 0.2s, background 0.2s', padding: 0 }}
                aria-label="Trang chủ"
              >
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                  width={24}
                  height={24}
                  viewBox="0 0 29.8242 26.2207"
                  style={{ color: '#fff', display: 'block' }}
                >
                  <g>
                    <title>home</title>
                    <rect height="26.2207" opacity="0" width="29.8242" x="0" y="0" />
                    <path
                      d="M11.1133 25.1074L18.3496 25.1074L18.3496 16.9238C18.3496 16.377 17.998 16.0254 17.4512 16.0254L12.0215 16.0254C11.4746 16.0254 11.1133 16.377 11.1133 16.9238ZM0.927734 13.0176C1.2207 13.0176 1.46484 12.8613 1.67969 12.6758L14.2578 2.11914C14.4043 1.99219 14.5703 1.93359 14.7266 1.93359C14.8926 1.93359 15.0586 1.99219 15.2051 2.11914L27.7832 12.6758C27.998 12.8613 28.2324 13.0176 28.5352 13.0176C29.1113 13.0176 29.4629 12.5977 29.4629 12.168C29.4629 11.9043 29.3555 11.6504 29.1113 11.4453L16.1426 0.566406C15.6934 0.185547 15.2148 0 14.7266 0C14.248 0 13.7695 0.185547 13.3203 0.566406L0.351562 11.4453C0.107422 11.6504 0 11.9043 0 12.168C0 12.5977 0.341797 13.0176 0.927734 13.0176ZM23.0566 6.9043L25.9277 9.32617L25.9277 3.76953C25.9277 3.28125 25.6055 2.96875 25.1172 2.96875L23.877 2.96875C23.3887 2.96875 23.0566 3.28125 23.0566 3.76953ZM6.23047 26.2012L23.2324 26.2012C24.9512 26.2012 25.9277 25.2344 25.9277 23.5449L25.9277 9.61914L24.1992 8.41797L24.1992 23.125C24.1992 24.0137 23.75 24.4727 22.8613 24.4727L6.5918 24.4727C5.71289 24.4727 5.26367 24.0137 5.26367 23.125L5.26367 8.4375L3.53516 9.61914L3.53516 23.5449C3.53516 25.2441 4.51172 26.2012 6.23047 26.2012Z"
                      fill="currentColor"
                      fillOpacity="0.85"
                    />
                  </g>
                </svg>
              </button>
            </Link>
          ) : (
            <div style={{ width: 44 }} />
          )}
        </div>

        <div className="flex items-center gap-4" style={{ minWidth: 40, marginRight: 16, marginLeft: 0 }}>
          <Dropdown
            overlay={
              <Menu theme="dark">
                <Menu.Item key="logout" onClick={handleLogout} style={{ textAlign: 'center' }}>
                  Đăng Xuất
                </Menu.Item>
              </Menu>
            }
            placement="bottomRight"
            trigger={["click"]}
          >
            <div className='hover:opacity-75' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 40, width: 40 }}>
              <Avatar
                style={{ backgroundColor: '#4aa8ff', color: '#15181a', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px 0 rgba(252,187,29,0.15)' }}
                size={40}
              >
                {/* Modern user icon SVG, now 24x24 */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: 'auto' }}>
                  <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.314 0-10 1.657-10 5v3h20v-3c0-3.343-6.686-5-10-5z" fill="#15181a" fillOpacity="0.85"/>
                </svg>
              </Avatar>
            </div>
          </Dropdown>
        </div>
      </Header>

      <div className="px-2 lg:px-32 min-h-full text-white pb-3" style={{ backgroundColor: '#15181a', minHeight: '84vh' }}>
        {children}
      </div>

      <Footer className="px-2 lg:px-32 text-white" style={{ backgroundColor: '#15181a' }}>© {new Date().getFullYear()} - Bản quyền thuộc về LEC</Footer>
    </Layout>
  );
};

export default AppLayout;
