'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Footer from '@/components/Footer';

interface Group {
    id: string;
    name: string;
    categoryId: string;
    qrcode: string;
    views: number;
    countryId?: string;
    provinceId?: string;
    cityId?: string;
    description?: string;
}

interface Category {
    id: string;
    name: string;
}

interface RegionData {
    countries: Array<{id: string; name: string}>;
    provinces: Array<{id: string; name: string; countryId: string}>;
    cities: Array<{id: string; name: string; provinceId: string}>;
}

export default function GroupDetail() {
    const params = useParams();
    const [group, setGroup] = useState<Group | null>(null);
    const [category, setCategory] = useState<Category | null>(null);
    const [regionName, setRegionName] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadGroup = async () => {
            try {
                const res = await fetch('/api/groups');
                const groups: Group[] = await res.json();
                const found = groups.find((g: Group) => g.id === params.id);

                if (found) {
                    setGroup(found);

                    // 加载分类信息
                    const catRes = await fetch('/api/categories');
                    const categories: Category[] = await catRes.json();
                    const cat = categories.find((c: Category) => c.id === found.categoryId);
                    if (cat) setCategory(cat);

                    // 加载区域信息
                    if (found.countryId) {
                        const regionRes = await fetch('/api/regions');
                        const regions: RegionData = await regionRes.json();
                        let location = '';

                        const country = regions.countries.find((c: any) => c.id === found.countryId);
                        if (country) location += country.name;

                        if (found.provinceId) {
                            const province = regions.provinces.find((p: any) => p.id === found.provinceId);
                            if (province) location += ' / ' + province.name;
                        }

                        if (found.cityId) {
                            const city = regions.cities.find((c: any) => c.id === found.cityId);
                            if (city) location += ' / ' + city.name;
                        }

                        setRegionName(location);

                        // 增加浏览量
                        await fetch(`/api/groups/${found.id}/view`, { method: 'POST' });
                    }
                }
            } catch (error) {
                console.error('Failed to load group:', error);
            } finally {
                setLoading(false);
            }
        };

        loadGroup();
    }, [params.id]);

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
                加载中...
            </div>
        );
    }

    if (!group) {
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
                <h2 style={{color: '#666', marginBottom: 15}}>群组不存在</h2>
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
            <div className="layui-container" style={{maxWidth: 600}}>
                <div style={{
                    background: '#fff',
                    borderRadius: 16,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                }}>
                    {/* 头部 */}
                    <div style={{
                        background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                        padding: '30px 20px',
                        textAlign: 'center',
                        color: '#fff'
                    }}>
                        <i className="layui-icon layui-icon-group" style={{
                            fontSize: 50,
                            opacity: 0.9,
                            marginBottom: 15
                        }}></i>
                        <h1 style={{
                            margin: 0,
                            fontSize: 24,
                            fontWeight: 600,
                            marginBottom: 10
                        }}>
                            {group.name}
                        </h1>
                        {category && (
                            <span style={{
                                background: 'rgba(255,255,255,0.2)',
                                padding: '5px 15px',
                                borderRadius: 20,
                                fontSize: 14
                            }}>
                                {category.name}
                            </span>
                        )}
                    </div>

                    {/* 内容区域 */}
                    <div style={{padding: '30px 20px'}}>
                        {/* 二维码 */}
                        <div style={{
                            textAlign: 'center',
                            marginBottom: 30
                        }}>
                            <div style={{
                                display: 'inline-block',
                                padding: 15,
                                background: '#f8f9fa',
                                borderRadius: 12,
                                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                            }}>
                                <img
                                    src={group.qrcode}
                                    alt={group.name}
                                    style={{
                                        width: 200,
                                        height: 200,
                                        borderRadius: 8
                                    }}
                                />
                            </div>
                            <p style={{
                                marginTop: 15,
                                fontSize: 14,
                                color: '#666'
                            }}>
                                长按识别二维码加入群聊
                            </p>
                        </div>

                        {/* 信息列表 */}
                        <div style={{
                            background: '#f8f9fa',
                            borderRadius: 12,
                            padding: 20
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: 15
                            }}>
                                <i className="layui-icon layui-icon-location" style={{
                                    fontSize: 18,
                                    color: '#00d2ff',
                                    marginRight: 10,
                                    width: 20
                                }}></i>
                                <span style={{color: '#666', fontSize: 14}}>
                                    所在区域：{regionName || '不限'}
                                </span>
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: 15
                            }}>
                                <i className="layui-icon layui-icon-rate-solid" style={{
                                    fontSize: 18,
                                    color: '#00d2ff',
                                    marginRight: 10,
                                    width: 20
                                }}></i>
                                <span style={{color: '#666', fontSize: 14}}>
                                    浏览量：{(group.views || 0) + 1}
                                </span>
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <i className="layui-icon layui-icon-group" style={{
                                    fontSize: 18,
                                    color: '#00d2ff',
                                    marginRight: 10,
                                    width: 20
                                }}></i>
                                <span style={{color: '#666', fontSize: 14}}>
                                    群组类型：{category?.name || '未分类'}
                                </span>
                            </div>
                        </div>

                        {/* 温馨提示 */}
                        <div style={{
                            marginTop: 25,
                            padding: 15,
                            background: '#fff3e0',
                            borderRadius: 8,
                            borderLeft: '4px solid #ff9800'
                        }}>
                            <h4 style={{
                                margin: '0 0 8px',
                                fontSize: 14,
                                color: '#e65100',
                                fontWeight: 600
                            }}>
                                <i className="layui-icon layui-icon-tips" style={{marginRight: 5}}></i>
                                温馨提示
                            </h4>
                            <ul style={{
                                margin: 0,
                                paddingLeft: 20,
                                fontSize: 13,
                                color: '#666',
                                lineHeight: '1.8'
                            }}>
                                <li>请确保二维码图片清晰可辨</li>
                                <li>如群满员请联系群主或等待空位</li>
                                <li>请注意辨别群内信息，谨防诈骗</li>
                            </ul>
                        </div>
                    </div>

                    {/* 底部按钮 */}
                    <div style={{
                        padding: '20px',
                        borderTop: '1px solid #f0f0f0',
                        display: 'flex',
                        gap: 10
                    }}>
                        <a
                            href="/"
                            style={{
                                flex: 1,
                                display: 'block',
                                textAlign: 'center',
                                padding: '12px',
                                background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                                color: '#fff',
                                borderRadius: 25,
                                textDecoration: 'none',
                                fontSize: 15
                            }}
                        >
                            <i className="layui-icon layui-icon-return" style={{marginRight: 5}}></i>
                            返回首页
                        </a>
                        <button
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: group.name,
                                        text: `加入群组：${group.name}`,
                                        url: window.location.href
                                    });
                                } else {
                                    // 复制链接
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('链接已复制到剪贴板');
                                }
                            }}
                            style={{
                                flex: 1,
                                padding: '12px',
                                background: '#fff',
                                color: '#3a7bd5',
                                border: '1px solid #3a7bd5',
                                borderRadius: 25,
                                fontSize: 15,
                                cursor: 'pointer'
                            }}
                        >
                            <i className="layui-icon layui-icon-share" style={{marginRight: 5}}></i>
                            分享群组
                        </button>
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
