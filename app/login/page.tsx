'use client';
import {useState} from 'react';
import Footer from '@/components/Footer';

export default function Login() {
    const [form, setForm] = useState({username: '', password: ''});
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        if (!form.username || !form.password) {
            alert('请输入账号和密码');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();

            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                location.href = '/admin';
            } else {
                alert(data.error || '登录失败');
            }
        } catch (error) {
            alert('登录失败，请重试');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            height: '100vh',
            background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
            display: 'flex',
            flexDirection: 'column',
            padding: 20
        }}>
            {/* 登录卡片 */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    background: '#fff',
                    borderRadius: 12,
                    padding: '40px 30px',
                    width: '100%',
                    maxWidth: 400,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
                }}>
                <h2 style={{
                    textAlign: 'center',
                    margin: '0 0 30px',
                    fontSize: 24,
                    color: '#333',
                    fontWeight: 600
                }}>管理员登录</h2>

                <div style={{marginBottom: 20}}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: '#f5f5f5',
                        borderRadius: 8,
                        padding: '0 15px',
                        border: '1px solid #e0e0e0'
                    }}>
                        <i className="layui-icon layui-icon-username" style={{fontSize: 18, color: '#999'}}></i>
                        <input
                            className="layui-input"
                            placeholder="账号"
                            style={{
                                border: 'none',
                                background: 'transparent',
                                boxShadow: 'none',
                                flex: 1,
                                padding: '12px 10px'
                            }}
                            value={form.username}
                            onChange={e => setForm({...form, username: e.target.value})}
                        />
                    </div>
                </div>

                <div style={{marginBottom: 25}}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: '#f5f5f5',
                        borderRadius: 8,
                        padding: '0 15px',
                        border: '1px solid #e0e0e0'
                    }}>
                        <i className="layui-icon layui-icon-password" style={{fontSize: 18, color: '#999'}}></i>
                        <input
                            className="layui-input"
                            type="password"
                            placeholder="密码"
                            style={{
                                border: 'none',
                                background: 'transparent',
                                boxShadow: 'none',
                                flex: 1,
                                padding: '12px 10px'
                            }}
                            value={form.password}
                            onChange={e => setForm({...form, password: e.target.value})}
                            onKeyPress={e => e.key === 'Enter' && submit()}
                        />
                    </div>
                </div>

                <button
                    className="layui-btn"
                    onClick={submit}
                    disabled={loading}
                    style={{
                        width: '100%',
                        height: 45,
                        fontSize: 16,
                        borderRadius: 8,
                        background: loading ? '#ccc' : 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                        border: 'none'
                    }}
                >
                    {loading ? '登录中...' : '登录'}
                </button>

                <div style={{
                    marginTop: 20,
                    padding: 15,
                    background: '#f8f9fa',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#666'
                }}>
                    <div style={{marginBottom: 8, fontWeight: 500}}>默认账号：</div>
                    <div>账号：admin</div>
                    <div>密码：admin123</div>
                </div>
            </div>
            </div>

            {/* 底部版权 */}
            <Footer style={{color: 'rgba(255,255,255,0.8)'}} />
        </div>
    )
}