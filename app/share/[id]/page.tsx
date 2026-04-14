'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Footer from '@/components/Footer';

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

export default function ShareDetail() {
    const params = useParams();
    const [share, setShare] = useState<Share | null>(null);
    const [loading, setLoading] = useState(true);
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        const loadShare = async () => {
            try {
                const res = await fetch('/api/share', { cache: 'no-store' });
                const shares: Share[] = await res.json();
                const found = shares.find((s: Share) => s.id === params.id);

                if (found && found.status === 'active') {
                    setShare(found);
                    // 增加浏览量
                    await fetch(`/api/share/${found.id}/view`, { method: 'POST' });
                }
            } catch (error) {
                console.error('Failed to load share:', error);
            } finally {
                setLoading(false);
            }
        };

        loadShare();
    }, [params.id]);

    useEffect(() => {
        if (share?.link && countdown > 0) {
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        window.open(share.link, '_blank');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [share, countdown]);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                fontSize: 16,
                color: '#999'
            }}>
                <i className="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop"
                   style={{fontSize: 40, color: '#00d2ff', marginRight: 10}}></i>
                加载中...
            </div>
        );
    }

    if (!share) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                padding: 20
            }}>
                <i className="layui-icon layui-icon-face-cry" style={{
                    fontSize: 80,
                    color: '#ccc',
                    marginBottom: 20
                }}></i>
                <h2 style={{color: '#666', marginBottom: 15}}>内容不存在或已下架</h2>
                <a href="/" style={{
                    padding: '10px 30px',
                    background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                    color: '#fff',
                    borderRadius: 25,
                    textDecoration: 'none'
                }}>
                    返回首页
                </a>
            </div>
        );
    }

    return (
        <div style={{
            height: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: '40px 20px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto'
        }}>
            <div className="layui-container" style={{maxWidth: 500}}>
                <div className="layui-card" style={{
                    borderRadius: 16,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    border: 'none'
                }}>
                    {/* 头部图片 */}
                    {share.image ? (
                        <div style={{
                            width: '100%',
                            height: 200,
                            overflow: 'hidden',
                            background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <img
                                src={share.image}
                                alt={share.title}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        </div>
                    ) : (
                        <div style={{
                            width: '100%',
                            height: 180,
                            background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <i className="layui-icon layui-icon-template-1" style={{
                                fontSize: 60,
                                color: 'rgba(255,255,255,0.3)'
                            }}></i>
                        </div>
                    )}

                    {/* 内容区域 */}
                    <div className="layui-card-body" style={{padding: '30px 25px'}}>
                        <h1 style={{
                            margin: '0 0 15px',
                            fontSize: 22,
                            fontWeight: 600,
                            color: '#333'
                        }}>
                            {share.title}
                        </h1>

                        {share.description && (
                            <p style={{
                                margin: '0 0 25px',
                                fontSize: 14,
                                color: '#666',
                                lineHeight: 1.6
                            }}>
                                {share.description}
                            </p>
                        )}

                        {/* 倒计时 */}
                        <div style={{
                            background: '#e3f2fd',
                            borderRadius: 10,
                            padding: '20px',
                            textAlign: 'center',
                            marginBottom: 25,
                            border: '1px solid #bbdefb'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 15,
                                marginBottom: 10
                            }}>
                                <div style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: '50%',
                                    background: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}>
                                    <span style={{
                                        fontSize: 24,
                                        fontWeight: 700,
                                        color: '#00d2ff'
                                    }}>{countdown}</span>
                                </div>
                                <div style={{textAlign: 'left'}}>
                                    <div style={{
                                        fontSize: 15,
                                        fontWeight: 500,
                                        color: '#333',
                                        marginBottom: 2
                                    }}>自动跳转中</div>
                                    <div style={{
                                        fontSize: 12,
                                        color: '#666'
                                    }}>秒后打开目标页面</div>
                                </div>
                            </div>
                            <p style={{
                                margin: 0,
                                fontSize: 13,
                                color: '#666'
                            }}>
                                如未自动跳转，请点击下方按钮
                            </p>
                        </div>

                        {/* 按钮组 */}
                        <div className="layui-btn-container" style={{marginTop: 20}}>
                            <a
                                href={share.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="layui-btn layui-btn-fluid"
                                style={{
                                    background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                                    height: 45,
                                    lineHeight: '45px',
                                    fontSize: 15,
                                    border: 'none',
                                    borderRadius: 6
                                }}
                            >
                                <i className="layui-icon layui-icon-release" style={{marginRight: 5}}></i>
                                立即访问
                            </a>
                            <a
                                href="/"
                                className="layui-btn layui-btn-fluid layui-btn-primary"
                                style={{
                                    height: 42,
                                    lineHeight: '42px',
                                    fontSize: 14,
                                    borderRadius: 6,
                                    marginTop: 10
                                }}
                            >
                                <i className="layui-icon layui-icon-return" style={{marginRight: 5}}></i>
                                返回首页
                            </a>
                        </div>
                    </div>

                    {/* 底部信息 */}
                    <div style={{
                        padding: '15px 25px',
                        borderTop: '1px solid #f0f0f0',
                        background: '#fafafa',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 30,
                        fontSize: 13,
                        color: '#999'
                    }}>
                        <span>
                            <i className="layui-icon layui-icon-rate-solid" style={{color: '#00d2ff'}}></i>
                            {' '}{share.views || 0} 次浏览
                        </span>
                        <span>
                            <i className="layui-icon layui-icon-ok-circle" style={{color: '#52c41a'}}></i>
                            {' '}{share.position === 'top' ? '顶部推荐' : '横幅推荐'}
                        </span>
                    </div>
                </div>

                {/* 占据剩余空间 */}
                <div style={{flex: 1}}></div>

                {/* 版权信息 */}
                <Footer />
            </div>
        </div>
    );
}
