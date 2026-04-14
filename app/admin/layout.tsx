'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Footer from '@/components/Footer';

type Theme = 'default' | 'dark' | 'blue' | 'green' | 'orange' | 'purple';

interface ThemeConfig {
    name: string;
    primary: string;
    header: string;
    side: string;
    body: string;
}

interface MenuItem {
    id: string;
    name: string;
    icon: string;
    path: string;
}

interface User {
    username: string;
}

const themes: Record<Theme, ThemeConfig> = {
    default: {
        name: '默认',
        primary: '#009688',
        header: '#393D49',
        side: '#20222A',
        body: '#f2f2f2'
    },
    dark: {
        name: '暗黑',
        primary: '#009688',
        header: '#1a1a1a',
        side: '#0f0f0f',
        body: '#f2f2f2'
    },
    blue: {
        name: '科技蓝',
        primary: '#1E9FFF',
        header: '#1E9FFF',
        side: '#20222A',
        body: '#f2f2f2'
    },
    green: {
        name: '清新绿',
        primary: '#5FB878',
        header: '#5FB878',
        side: '#20222A',
        body: '#f2f2f2'
    },
    orange: {
        name: '活力橙',
        primary: '#FFB800',
        header: '#FFB800',
        side: '#20222A',
        body: '#f2f2f2'
    },
    purple: {
        name: '优雅紫',
        primary: '#9588ff',
        header: '#9588ff',
        side: '#20222A',
        body: '#f2f2f2'
    }
};

const defaultMenu: MenuItem[] = [
    { id: 'dashboard', name: '控制台', icon: 'layui-icon-home', path: '/admin' },
    { id: 'groups', name: '群组管理', icon: 'layui-icon-group', path: '/admin/groups' },
    { id: 'categories', name: '分类管理', icon: 'layui-icon-list', path: '/admin/categories' },
    { id: 'regions', name: '区域管理', icon: 'layui-icon-location', path: '/admin/regions' },
    { id: 'share', name: '分享管理', icon: 'layui-icon-template-1', path: '/admin/share' }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [sidebarCollapse, setSidebarCollapse] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [currentTheme, setCurrentTheme] = useState<Theme>('default');
    const [showThemePanel, setShowThemePanel] = useState(false);
    const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenu);

    const applyTheme = (theme: Theme) => {
        const config = themes[theme];
        document.documentElement.style.setProperty('--theme-primary', config.primary);
        document.documentElement.style.setProperty('--theme-header', config.header);
        document.documentElement.style.setProperty('--theme-side', config.side);
        document.documentElement.style.setProperty('--theme-body', config.body);
        document.documentElement.style.setProperty('--header-text', '#fff');
    };

    const loadMenu = async () => {
        try {
            const res = await fetch('/api/menu');
            const menu = await res.json() as MenuItem[];
            setMenuItems(menu);
        } catch {
            // 使用默认菜单
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
            router.push('/login');
            return;
        }

        try {
            setUser(JSON.parse(userStr) as User);
        } catch {
            router.push('/login');
        }

        const savedTheme = localStorage.getItem('admin-theme') as Theme;
        if (savedTheme && themes[savedTheme]) {
            setCurrentTheme(savedTheme);
            applyTheme(savedTheme);
        }

        loadMenu();
    }, [router]);

    const handleThemeChange = (theme: Theme) => {
        setCurrentTheme(theme);
        localStorage.setItem('admin-theme', theme);
        applyTheme(theme);
        setShowThemePanel(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const toggleSidebar = () => {
        setSidebarCollapse(!sidebarCollapse);
        const side = document.querySelector('.layui-side') as HTMLElement;
        const body = document.querySelector('.layui-body') as HTMLElement;
        const footer = document.querySelector('.layui-footer') as HTMLElement;
        const logo = document.querySelector('.layui-logo') as HTMLElement;
        const layoutLeft = document.querySelector('.layui-layout-left') as HTMLElement;

        if (sidebarCollapse) {
            side?.classList.remove('layui-side-collapse');
            body?.classList.remove('layui-body-collapse');
            footer?.classList.remove('layui-footer-collapse');
            logo?.classList.remove('layui-logo-collapse');
            layoutLeft?.classList.remove('layui-layout-left-collapse');
        } else {
            side?.classList.add('layui-side-collapse');
            body?.classList.add('layui-body-collapse');
            footer?.classList.add('layui-footer-collapse');
            logo?.classList.add('layui-logo-collapse');
            layoutLeft?.classList.add('layui-layout-left-collapse');
        }
    };

    const handleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setFullscreen(true);
        } else {
            document.exitFullscreen();
            setFullscreen(false);
        }
    };

    const refresh = () => {
        window.location.reload();
    };

    if (!user) {
        return null;
    }

    return (
        <div className="layui-layout layui-layout-admin">
            <div className="layui-header" id="adminHeader">
                <div className="layui-logo">
                    <i className="layui-icon layui-icon-group"></i>
                    <span className="logo-text" style={{fontWeight: 500, letterSpacing: 0.5}}>微信群后台系统</span>
                </div>

                <ul className="layui-nav layui-layout-left" id="adminLayoutLeft">
                    <li className="layui-nav-item" lay-unselect="true">
                        <a href="javascript:;" onClick={toggleSidebar}>
                            <i className={`layui-icon ${sidebarCollapse ? 'layui-icon-spread-left' : 'layui-icon-shrink-right'}`}></i>
                        </a>
                    </li>
                    <li className="layui-nav-item" lay-unselect="true">
                        <a href="/" target="_blank">
                            <i className="layui-icon layui-icon-website"></i>
                        </a>
                    </li>
                </ul>

                <ul className="layui-nav layui-layout-right">
                    <li className="layui-nav-item" lay-unselect="true">
                        <a href="javascript:;" onClick={refresh}>
                            <i className="layui-icon layui-icon-refresh-3"></i>
                        </a>
                    </li>
                    <li className="layui-nav-item" lay-unselect="true">
                        <a href="javascript:;" onClick={() => setShowThemePanel(!showThemePanel)}>
                            <i className="layui-icon layui-icon-theme"></i>
                        </a>
                    </li>
                    <li className="layui-nav-item" lay-unselect="true">
                        <a href="javascript:;" onClick={handleFullscreen}>
                            <i className={`layui-icon ${fullscreen ? 'layui-icon-screen-restore' : 'layui-icon-screen-full'}`}></i>
                        </a>
                    </li>
                    <li className="layui-nav-item">
                        <a href="javascript:;">
                            <i className="layui-icon layui-icon-username"></i> {user.username}
                        </a>
                    </li>
                    <li className="layui-nav-item">
                        <a href="javascript:;" onClick={handleLogout}>
                            <i className="layui-icon layui-icon-logout"></i> 退出
                        </a>
                    </li>
                </ul>
            </div>

            {showThemePanel && (
                <div className="theme-panel-overlay" onClick={() => setShowThemePanel(false)}>
                    <div className="theme-panel" onClick={(e) => e.stopPropagation()}>
                        <div style={{padding: '10px 15px'}}>
                            <div style={{marginBottom: 8, fontSize: 12, color: '#666'}}>主题配色</div>
                            {Object.entries(themes).map(([key, config]) => (
                                <div
                                    key={key}
                                    onClick={() => handleThemeChange(key as Theme)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '8px 10px',
                                        cursor: 'pointer',
                                        borderRadius: 4,
                                        marginBottom: 4,
                                        background: currentTheme === key ? '#f5f5f5' : 'transparent'
                                    }}
                                >
                                    <div style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: 4,
                                        background: config.primary,
                                        marginRight: 10,
                                        border: '1px solid #e6e6e6'
                                    }}></div>
                                    <span style={{fontSize: 13, flex: 1}}>{config.name}</span>
                                    {currentTheme === key && (
                                        <i className="layui-icon layui-icon-ok" style={{color: config.primary}}></i>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="layui-side layui-bg-black" id="adminSide">
                <div className="layui-side-scroll">
                    <ul className="layui-nav layui-nav-tree" lay-filter="adminNav">
                        {menuItems.map((item) => (
                            <li
                                key={item.id}
                                className={`layui-nav-item ${pathname === item.path ? 'layui-this' : ''}`}
                            >
                                <a href={item.path}>
                                    <i className={`layui-icon ${item.icon}`}></i>
                                    <cite>{item.name}</cite>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="layui-body" id="adminBody">
                <div style={{padding: 15}}>
                    {children}
                </div>
            </div>

            <div className="layui-footer">
                <Footer isAdmin={true} />
            </div>

            <style jsx global>{`
                .layui-layout-left {
                    position: absolute !important;
                    left: 200px;
                    top: 0;
                    transition: left 0.3s ease;
                }
                .layui-layout-left-collapse {
                    left: 60px !important;
                }
                .layui-side {
                    transition: width 0.3s ease !important;
                }
                .layui-logo {
                    transition: width 0.3s ease !important;
                    white-space: nowrap;
                    overflow: hidden;
                    color: #fff !important;
                }
                .layui-logo .logo-text {
                    transition: opacity 0.2s ease;
                    font-weight: 500;
                    letter-spacing: 0.5px;
                }
                .layui-logo i {
                    color: var(--header-text, #fff) !important;
                }
                .layui-logo {
                    color: var(--header-text, #fff) !important;
                }
                #adminHeader .layui-nav a {
                    color: var(--header-text, #fff) !important;
                }
                #adminHeader .layui-nav-item a {
                    color: var(--header-text, #fff) !important;
                }
                .layui-body {
                    transition: left 0.3s ease !important;
                }
                .layui-footer {
                    transition: left 0.3s ease !important;
                }
                .layui-side-collapse {
                    width: 60px !important;
                }
                .layui-side-collapse .layui-nav-item {
                    padding: 0 5px;
                }
                .layui-side-collapse .layui-nav-item cite {
                    display: none;
                }
                .layui-side-collapse .layui-nav-more {
                    display: none !important;
                }
                .layui-body-collapse {
                    left: 60px !important;
                }
                .layui-footer-collapse {
                    left: 60px !important;
                }
                .layui-logo-collapse {
                    width: 60px !important;
                }
                .layui-logo-collapse .logo-text {
                    display: none;
                }
                .layui-logo-collapse i {
                    margin-right: 0 !important;
                }
                .theme-panel-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 999;
                }
                .theme-panel {
                    position: absolute;
                    right: 10px;
                    top: 60px;
                    background: #fff;
                    border-radius: 4px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.15);
                    min-width: 200px;
                    z-index: 1000;
                }
                #adminSide .layui-nav-tree .layui-nav-item a i {
                    margin-right: 5px;
                    width: 16px;
                    text-align: center;
                    display: inline-block;
                }
                #adminSide .layui-nav-tree .layui-nav-item.layui-this a {
                    background-color: var(--theme-primary, #009688) !important;
                }
                #adminSide .layui-nav-tree .layui-nav-item.layui-this a cite {
                    color: #fff;
                }
                .layui-btn-primary {
                    border-color: var(--theme-primary, #009688) !important;
                    color: var(--theme-primary, #009688) !important;
                }
                .layui-btn-primary:hover {
                    border-color: var(--theme-primary, #009688) !important;
                    background: var(--theme-primary, #009688) !important;
                    color: #fff !important;
                }
                #adminHeader {
                    background: var(--theme-header, #393D49);
                }
                #adminSide {
                    background: var(--theme-side, #20222A);
                }
                #adminBody {
                    background: #fff !important;
                }
            `}</style>
        </div>
    );
}
