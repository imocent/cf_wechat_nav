'use client';
import React, {useEffect, useState} from 'react';
import Footer from '@/components/Footer';

interface Group {
    id: string;
    name: string;
    categoryId: string;
    qrcode: string;
    views: number;
    status: string;
}

interface Category {
    id: string;
    name: string;
}

interface Banner {
    id: string;
    title: string;
    subtitle: string;
    gradient: string;
    icon: string;
}

interface Share {
    id: string;
    title: string;
    description: string;
    link: string;
    image: string;
    position: string;
    status: string;
    startDate: string;
    endDate: string;
    views: number;
}

export default function Home() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [cats, setCats] = useState<Category[]>([]);
    const [kw, setKw] = useState('');
    const [cid, setCid] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [topShare, setTopShare] = useState<Share | null>(null);
    const [loading, setLoading] = useState(true);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [submitForm, setSubmitForm] = useState({
        name: '',
        categoryId: '',
        qrcode: '',
        description: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    const banners: Banner[] = [
        {
            id: '1',
            title: '副业赚钱',
            subtitle: '发现优质副业项目',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            icon: 'layui-icon-rate-solid'
        },
        {
            id: '2',
            title: '技术交流',
            subtitle: '与大神面对面',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            icon: 'layui-icon-engine'
        },
        {
            id: '3',
            title: '资源共享',
            subtitle: '海量资源免费获取',
            gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            icon: 'layui-icon-template-1'
        },
        {
            id: '4',
            title: '创业互助',
            subtitle: '寻找合伙人',
            gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
            icon: 'layui-icon-user'
        }
    ];

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [groupsRes, catsRes, adsRes] = await Promise.all([
                    fetch('/api/groups', { cache: 'no-store' }),
                    fetch('/api/categories', { cache: 'no-store' }),
                    fetch('/api/share', { cache: 'no-store' })
                ]);

                if (!groupsRes.ok || !catsRes.ok || !adsRes.ok) {
                    throw new Error('Failed to fetch data');
                }

                const groupsData = await groupsRes.json();
                const catsData = await catsRes.json();
                const adsData = await adsRes.json();

                // 处理API响应格式（可能是分页格式或直接数组）
                const groupsList = Array.isArray(groupsData) ? groupsData : (groupsData.data || []);
                const catsList = Array.isArray(catsData) ? catsData : (catsData.data || []);
                const adsList = Array.isArray(adsData) ? adsData : (adsData.data || []);

                setGroups(groupsList);
                setCats(catsList);

                // 加载顶部分享/广告
                if (adsList.length > 0) {
                    const activeTop = adsList.find((a: Share) =>
                        a.position === 'top' &&
                        a.status === 'active'
                    );
                    if (activeTop) setTopShare(activeTop);
                }
            } catch (error) {
                console.error('Failed to load data:', error);
                setGroups([]);
                setCats([]);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const list = groups.filter((g: Group) =>
        (!g.status || g.status === 'approved') &&
        (!kw || g.name.includes(kw)) &&
        (!cid || g.categoryId === cid)
    );

    // 最近添加的8个群组（按ID降序），只显示已审核通过的
    const recentGroups = [...groups]
        .filter(g => !g.status || g.status === 'approved')
        .sort((a, b) => parseInt(b.id) - parseInt(a.id))
        .slice(0, 8);

    const handleSubmitGroup = async () => {
        if (!submitForm.name.trim() || !submitForm.categoryId || !submitForm.qrcode.trim()) {
            setSubmitMessage('请填写群组名称、分类和二维码');
            return;
        }

        setSubmitting(true);
        setSubmitMessage('');

        try {
            const res = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitForm)
            });
            const data = await res.json();

            if (data.success) {
                setSubmitMessage('提交成功！我们会尽快审核您的群组。');
                setTimeout(() => {
                    setShowSubmitModal(false);
                    setSubmitForm({name: '', categoryId: '', qrcode: '', description: ''});
                    setSubmitMessage('');
                }, 2000);
            } else {
                setSubmitMessage(data.message || '提交失败，请重试');
            }
        } catch (error) {
            setSubmitMessage('提交失败，请重试');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto'
        }}>
            {/* 顶部导航栏 */}
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                background: '#fff',
                boxShadow: '0 2px 15px rgba(0,0,0,0.08)',
                borderBottom: '1px solid #f0f0f0'
            }}>
                <div className="layui-container" style={{padding: '0 15px'}}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 55}}>
                        {/* 左侧：菜单按钮 + Logo */}
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            {/* 移动端菜单按钮 */}
                            <button
                                style={{
                                    display: 'none',
                                    background: 'none',
                                    border: 'none',
                                    fontSize: 22,
                                    color: '#333',
                                    cursor: 'pointer',
                                    padding: '8px 8px 8px 0',
                                    marginRight: 5
                                }}
                                id="mobileMenuBtn"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                <i className={`layui-icon ${mobileMenuOpen ? 'layui-icon-close' : 'layui-icon-app'}`}></i>
                            </button>

                            <div style={{
                                width: 35,
                                height: 35,
                                background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                                borderRadius: 9,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 10
                            }}>
                                <i className="layui-icon layui-icon-group" style={{
                                    fontSize: 20,
                                    color: '#fff'
                                }}></i>
                            </div>
                            <span style={{
                                color: '#1a1a1a',
                                fontSize: 17,
                                fontWeight: 600,
                                letterSpacing: 0.5
                            }}>微信群导航</span>
                        </div>

                        {/* 桌面端分类导航 */}
                        <ul className="layui-nav" style={{
                            background: 'transparent',
                            borderRadius: 20,
                            padding: 0,
                            display: 'none'
                        }} id="desktopNav">
                            <li className={`layui-nav-item ${cid === '' ? 'layui-this' : ''}`}>
                                <a
                                    href="#"
                                    style={{
                                        color: cid === '' ? '#3a7bd5' : '#666',
                                        padding: '0 15px',
                                        height: 55,
                                        lineHeight: '55px'
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setCid('');
                                    }}
                                >全部</a>
                            </li>
                            {cats.map((c: Category) => (
                                <li
                                    key={c.id}
                                    className={`layui-nav-item ${cid === c.id ? 'layui-this' : ''}`}
                                >
                                    <a
                                        href="#"
                                        style={{
                                            color: cid === c.id ? '#3a7bd5' : '#666',
                                            padding: '0 15px',
                                            height: 55,
                                            lineHeight: '55px'
                                        }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setCid(c.id);
                                        }}
                                    >{c.name}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 移动端分类菜单 */}
                    {mobileMenuOpen && (
                        <div style={{
                            display: 'none',
                            borderTop: '1px solid #f0f0f0',
                            padding: '10px 0'
                        }} id="mobileMenu">
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 10
                            }}>
                                <span
                                    onClick={() => {
                                        setCid('');
                                        setMobileMenuOpen(false);
                                    }}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: 20,
                                        background: cid === '' ? '#3a7bd5' : '#f5f5f5',
                                        color: cid === '' ? '#fff' : '#666',
                                        fontSize: 14,
                                        cursor: 'pointer'
                                    }}
                                >
                                    全部
                                </span>
                                {cats.map((c: Category) => (
                                    <span
                                        key={c.id}
                                        onClick={() => {
                                            setCid(c.id);
                                            setMobileMenuOpen(false);
                                        }}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: 20,
                                            background: cid === c.id ? '#3a7bd5' : '#f5f5f5',
                                            color: cid === c.id ? '#fff' : '#666',
                                            fontSize: 14,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {c.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* 搜索区域 */}
            <div style={{
                background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                padding: '40px 15px 60px',
                textAlign: 'center'
            }}>
                <div style={{color: '#fff', marginBottom: 25}}>
                    <h1 style={{
                        fontSize: 'clamp(24px, 5vw, 38px)',
                        fontWeight: 300,
                        margin: 0,
                        marginBottom: 8
                    }}>
                        发现优质社群
                    </h1>
                    <p style={{fontSize: 14, opacity: 0.9}}>连接每一个有趣的灵魂</p>
                </div>

                <div style={{maxWidth: 500, margin: '0 auto'}}>
                    <div style={{
                        position: 'relative',
                        borderRadius: 25,
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                        height: 48,
                        overflow: 'hidden'
                    }}>
                        {/* 白色背景区域 */}
                        <div style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            right: 85,
                            background: '#fff',
                            borderTopLeftRadius: 25,
                            borderBottomLeftRadius: 25
                        }}>
                            <div style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: 45,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#999'
                            }}>
                                <i className="layui-icon layui-icon-search" style={{fontSize: 17}}></i>
                            </div>
                            <input
                                type="text"
                                placeholder="搜索你感兴趣的群组..."
                                style={{
                                    position: 'absolute',
                                    left: 45,
                                    right: 10,
                                    top: 0,
                                    bottom: 0,
                                    height: 48,
                                    fontSize: 15,
                                    border: 'none',
                                    outline: 'none',
                                    background: 'transparent',
                                    padding: '0 10px'
                                }}
                                value={kw}
                                onChange={e => setKw(e.target.value)}
                            />
                        </div>
                        {/* 搜索按钮 */}
                        <button
                            style={{
                                position: 'absolute',
                                right: -1,
                                top: 0,
                                bottom: 0,
                                width: 86,
                                border: 'none',
                                outline: 'none',
                                background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                                color: '#fff',
                                fontSize: 15,
                                cursor: 'pointer',
                                borderTopRightRadius: 25,
                                borderBottomRightRadius: 25
                            }}
                        >
                            搜索
                        </button>
                    </div>

                    <div style={{marginTop: 15, color: '#fff', fontSize: 12, opacity: 0.85, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 15}}>
                        <span>
                            热门：
                            {['副业', 'AI技术', '资源分享', '创业'].map((tag, i) => (
                                <span
                                    key={i}
                                    style={{
                                        margin: '0 5px',
                                        cursor: 'pointer',
                                        opacity: 0.9,
                                        display: 'inline-block'
                                    }}
                                    onClick={() => setKw(tag)}
                                >
                                    {tag}
                                </span>
                            ))}
                        </span>
                        <span style={{marginLeft: 10}}>或</span>
                        <button
                            onClick={() => setShowSubmitModal(true)}
                            style={{
                                background: '#fff',
                                color: '#3a7bd5',
                                border: 'none',
                                padding: '6px 15px',
                                borderRadius: 15,
                                fontSize: 12,
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            <i className="layui-icon layui-icon-add-circle" style={{marginRight: 3}}></i>
                            提交群组
                        </button>
                    </div>
                </div>
            </div>

            {/* Banner 区域 */}
            <div className="layui-container" style={{marginTop: -40}}>
                <div className="layui-row layui-col-space10">
                    {banners.map((banner) => (
                        <div key={banner.id} className="layui-col-md3 layui-col-sm6 layui-col-xs6">
                            <div style={{
                                background: banner.gradient,
                                borderRadius: 12,
                                padding: '15px',
                                color: '#fff',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                minHeight: 100
                            }}>
                                <i className={`layui-icon ${banner.icon}`} style={{
                                    fontSize: 28,
                                    opacity: 0.9,
                                    marginBottom: 8
                                }}></i>
                                <h3 style={{
                                    margin: 0,
                                    fontSize: 16,
                                    fontWeight: 500,
                                    marginBottom: 4
                                }}>{banner.title}</h3>
                                <p style={{
                                    margin: 0,
                                    fontSize: 12,
                                    opacity: 0.85
                                }}>{banner.subtitle}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 通栏广告位 */}
            {topShare && (
                <div className="layui-container" style={{marginTop: 20}}>
                    <a
                        href={`/share/${topShare.id}`}
                        style={{
                            display: 'block',
                            textDecoration: 'none'
                        }}
                    >
                        <div style={{
                            background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                            borderRadius: 12,
                            padding: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                            flexWrap: 'wrap',
                            gap: 15,
                            cursor: 'pointer',
                            transition: 'transform 0.3s',
                        }}
                             onMouseEnter={(e) => {
                                 e.currentTarget.style.transform = 'translateY(-3px)';
                             }}
                             onMouseLeave={(e) => {
                                 e.currentTarget.style.transform = 'translateY(0)';
                             }}
                        >
                            <div style={{flex: 1, minWidth: 200}}>
                                <span style={{
                                    background: '#ff6b6b',
                                    color: '#fff',
                                    padding: '3px 10px',
                                    borderRadius: 20,
                                    fontSize: 11,
                                    fontWeight: 500
                                }}>推荐</span>
                                <h3 style={{
                                    margin: '8px 0 4px',
                                    fontSize: 17,
                                    color: '#333',
                                    fontWeight: 600
                                }}>{topShare.title}</h3>
                                <p style={{margin: 0, fontSize: 13, color: '#666'}}>
                                    {topShare.description || '点击了解更多详情'}
                                </p>
                            </div>
                            <button style={{
                                background: '#fff',
                                color: '#ff6b6b',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: 25,
                                fontSize: 14,
                                fontWeight: 500,
                                cursor: 'pointer',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                whiteSpace: 'nowrap'
                            }}>
                                立即查看
                            </button>
                        </div>
                    </a>
                </div>
            )}

            {/* 最近添加的群组 */}
            <div className="layui-container" style={{marginTop: 25}}>
                <div style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: '#333',
                    marginBottom: 15
                }}>最近添加</div>

                <div className="layui-row layui-col-space15">
                    {recentGroups.map((g: Group) => (
                        <div key={g.id} className="layui-col-md3 layui-col-sm6 layui-col-xs6">
                            <a
                                href={`/group/${g.id}`}
                                style={{textDecoration: 'none', display: 'block'}}
                            >
                                <div className="layui-card" style={{
                                    borderRadius: 8,
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    border: '2px solid transparent',
                                    background: 'linear-gradient(135deg, #fff5f5 0%, #fff 100%)'
                                }}
                                     onMouseEnter={(e) => {
                                         e.currentTarget.style.transform = 'translateY(-5px)';
                                         e.currentTarget.style.boxShadow = '0 8px 25px rgba(255,107,149,0.2)';
                                         e.currentTarget.style.borderColor = '#ff6b95';
                                     }}
                                     onMouseLeave={(e) => {
                                         e.currentTarget.style.transform = 'translateY(0)';
                                         e.currentTarget.style.boxShadow = 'none';
                                         e.currentTarget.style.borderColor = 'transparent';
                                     }}
                                >
                                    <div className="layui-card-header" style={{
                                        background: 'transparent',
                                        border: 'none',
                                        padding: '12px'
                                    }}>
                                        <span style={{
                                            color: '#333',
                                            fontSize: 14,
                                            fontWeight: 500,
                                            display: 'block',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {g.name}
                                        </span>
                                    </div>
                                    <div className="layui-card-body" style={{textAlign: 'center', padding: 15}}>
                                        <img
                                            src={g.qrcode}
                                            alt={g.name}
                                            style={{
                                                width: '100%',
                                                maxWidth: 150,
                                                borderRadius: 8,
                                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <div style={{marginTop: 12}}>
                                            <span className="layui-badge" style={{
                                                fontSize: 11,
                                                background: 'linear-gradient(135deg, #ff9a56 0%, #ff6b95 100%)'
                                            }}>
                                                👁 {g.views || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>
            </div>

            {/* 群组列表 */}
            <div className="layui-container" style={{marginTop: 30}}>
                <div style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: '#333',
                    marginBottom: 15
                }}>全部群组</div>
                {!loading && list.length > 0 && (
                    <div className="layui-row layui-col-space15">
                        {list.map((g: Group) => (
                        <div key={g.id} className="layui-col-md3 layui-col-sm6 layui-col-xs6">
                            <a
                                href={`/group/${g.id}`}
                                style={{textDecoration: 'none', display: 'block'}}
                            >
                                <div className="layui-card" style={{
                                    borderRadius: 8,
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'transform 0.3s'
                                }}
                                     onMouseEnter={(e) => {
                                         e.currentTarget.style.transform = 'translateY(-5px)';
                                         e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                                     }}
                                     onMouseLeave={(e) => {
                                         e.currentTarget.style.transform = 'translateY(0)';
                                         e.currentTarget.style.boxShadow = 'none';
                                     }}
                                >
                                    <div className="layui-card-header" style={{
                                        background: 'linear-gradient(to right, #f8f9fa, #fff)',
                                        border: 'none',
                                        padding: '12px'
                                    }}>
                                        <span style={{
                                            color: '#333',
                                            fontSize: 14,
                                            fontWeight: 500,
                                            display: 'block',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {g.name}
                                        </span>
                                    </div>
                                    <div className="layui-card-body" style={{textAlign: 'center', padding: 15}}>
                                        <img
                                            src={g.qrcode}
                                            alt={g.name}
                                            style={{
                                                width: '100%',
                                                maxWidth: 150,
                                                borderRadius: 8,
                                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <div style={{marginTop: 12}}>
                                            <span className="layui-badge layui-bg-blue" style={{fontSize: 11}}>
                                                👁 {g.views || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </div>
                    ))}
                    </div>
                )}

                {!loading && list.length === 0 && (
                    <div style={{textAlign: 'center', padding: 60}}>
                        <i className="layui-icon layui-icon-face-cry" style={{fontSize: 50, color: '#ccc'}}></i>
                        <p style={{color: '#999', marginTop: 12, fontSize: 14}}>暂无相关群组，换个关键词试试吧~</p>
                    </div>
                )}

                {loading && (
                    <div style={{textAlign: 'center', padding: 60}}>
                        <i className="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop" style={{fontSize: 40, color: '#00d2ff'}}></i>
                        <p style={{color: '#999', marginTop: 12, fontSize: 14}}>加载中...</p>
                    </div>
                )}
            </div>

            {/* 占据剩余空间，将 footer 推到底部 */}
            <div style={{flex: 1}}></div>

            {/* 底部 */}
            <Footer />

            {/* 提交群组弹窗 */}
            {showSubmitModal && (
                <>
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 9999
                    }} onClick={() => !submitting && setShowSubmitModal(false)}></div>
                    <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: '#fff',
                        borderRadius: 12,
                        padding: 25,
                        width: '90%',
                        maxWidth: 450,
                        zIndex: 10000,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                    }}>
                        <h3 style={{margin: '0 0 20px', fontSize: 18, color: '#333'}}>提交群组</h3>
                        <div style={{marginBottom: 15}}>
                            <label style={{display: 'block', marginBottom: 8, fontSize: 13, color: '#666'}}>群组名称 *</label>
                            <input
                                type="text"
                                value={submitForm.name}
                                onChange={e => setSubmitForm({...submitForm, name: e.target.value})}
                                placeholder="请输入群组名称"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #e6e6e6',
                                    borderRadius: 6,
                                    fontSize: 14,
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        <div style={{marginBottom: 15}}>
                            <label style={{display: 'block', marginBottom: 8, fontSize: 13, color: '#666'}}>分类 *</label>
                            <select
                                value={submitForm.categoryId}
                                onChange={e => setSubmitForm({...submitForm, categoryId: e.target.value})}
                                style={{
                                    width: '100%',
                                    height: 40,
                                    padding: '0 12px',
                                    border: '1px solid #e6e6e6',
                                    borderRadius: 6,
                                    fontSize: 14,
                                    backgroundColor: '#fff',
                                    cursor: 'pointer',
                                    boxSizing: 'border-box'
                                }}
                            >
                                <option value="">请选择分类</option>
                                {cats.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{marginBottom: 15}}>
                            <label style={{display: 'block', marginBottom: 8, fontSize: 13, color: '#666'}}>二维码链接 *</label>
                            <input
                                type="text"
                                value={submitForm.qrcode}
                                onChange={e => setSubmitForm({...submitForm, qrcode: e.target.value})}
                                placeholder="请输入二维码图片URL"
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #e6e6e6',
                                    borderRadius: 6,
                                    fontSize: 14,
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        <div style={{marginBottom: 15}}>
                            <label style={{display: 'block', marginBottom: 8, fontSize: 13, color: '#666'}}>描述</label>
                            <textarea
                                value={submitForm.description}
                                onChange={e => setSubmitForm({...submitForm, description: e.target.value})}
                                placeholder="请输入群组描述（可选）"
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #e6e6e6',
                                    borderRadius: 6,
                                    fontSize: 14,
                                    resize: 'vertical',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                        {submitMessage && (
                            <div style={{
                                padding: '10px',
                                marginBottom: 15,
                                borderRadius: 6,
                                fontSize: 13,
                                background: submitMessage.includes('成功') ? '#d4edda' : '#f8d7da',
                                color: submitMessage.includes('成功') ? '#155724' : '#721c24'
                            }}>
                                {submitMessage}
                            </div>
                        )}
                        <div style={{display: 'flex', gap: 10, justifyContent: 'flex-end'}}>
                            <button
                                onClick={() => setShowSubmitModal(false)}
                                disabled={submitting}
                                style={{
                                    padding: '10px 20px',
                                    border: '1px solid #e6e6e6',
                                    background: '#fff',
                                    borderRadius: 6,
                                    fontSize: 14,
                                    cursor: submitting ? 'not-allowed' : 'pointer'
                                }}
                            >
                                取消
                            </button>
                            <button
                                onClick={handleSubmitGroup}
                                disabled={submitting}
                                style={{
                                    padding: '10px 20px',
                                    border: 'none',
                                    background: '#3a7bd5',
                                    color: '#fff',
                                    borderRadius: 6,
                                    fontSize: 14,
                                    cursor: submitting ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {submitting ? '提交中...' : '提交'}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* 响应式样式 */}
            <style jsx global>{`
                @media (min-width: 768px) {
                    #desktopNav {
                        display: block !important;
                    }
                    #mobileMenuBtn {
                        display: none !important;
                    }
                }
                @media (max-width: 767px) {
                    #mobileMenuBtn {
                        display: block !important;
                    }
                    #mobileMenu {
                        display: block !important;
                    }
                }
            `}</style>
        </div>
    );
}
