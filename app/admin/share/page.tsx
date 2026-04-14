'use client';
import {useEffect, useState, useRef} from 'react';

interface Share {
    id: string;
    title: string;
    description: string;
    link: string;
    image: string;
    position: 'top' | 'middle';
    status: 'active' | 'inactive';
    startDate: string;
    endDate: string;
    views: number;
}

interface LayuiTable {
    render: (options: {
        elem: string;
        url: string;
        page: boolean;
        limits: number[];
        limit: number;
        cols: unknown[][];
        parseData?: (res: { code: number; msg: string; count: number; data: Share[] }) => {
            code: number;
            msg: string;
            count: number;
            data: Share[];
        };
        done?: (res: { data: Share[] }) => void;
    }) => {
        reload: () => void;
    };
}

interface Layui {
    use: (modules: string[], callback: (table: LayuiTable) => void) => void;
    table: {
        on: (event: string, callback: (obj: { data: Share; event: string }) => void) => void;
    };
    laydate: {
        render: (options: {
            elem: string;
            type: string;
            format: string;
            value?: string;
            done: (value: string) => void;
        }) => void;
    };
}

export default function Share() {
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<Share | null>(null);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        link: '',
        image: '',
        position: 'top' as 'top' | 'middle',
        status: 'active' as 'active' | 'inactive',
        startDate: '',
        endDate: ''
    });
    const tableRef = useRef<LayuiTable['render']['return'] | null>(null);

    useEffect(() => {
        const checkLayui = setInterval(() => {
            const layui = (window as unknown as { layui?: Layui }).layui;
            if (layui) {
                clearInterval(checkLayui);
                initTable();
            }
        }, 100);

        return () => clearInterval(checkLayui);
    }, []);

    const initTable = () => {
        const layui = (window as unknown as { layui?: Layui }).layui;
        if (!layui) return;

        layui.use(['table'], function(table: LayuiTable) {
            tableRef.current = table.render({
                elem: '#shareTable',
                url: '/api/share',
                page: true,
                limits: [10, 20, 30, 50],
                limit: 10,
                cols: [[
                    {field: 'id', title: 'ID', width: 60},
                    {field: 'title', title: '标题'},
                    {field: 'description', title: '描述', width: 200},
                    {
                        field: 'position',
                        title: '位置',
                        width: 100,
                        align: 'center',
                        templet: function(d: Share) {
                            const position = d.position || 'top';
                            const bgClass = position === 'top' ? 'layui-bg-blue' : 'layui-bg-orange';
                            const text = position === 'top' ? '顶部' : '通栏';
                            return `<span class="layui-badge ${bgClass}">${text}</span>`;
                        }
                    },
                    {
                        field: 'status',
                        title: '状态',
                        width: 100,
                        align: 'center',
                        templet: function(d: Share) {
                            const status = d.status || 'inactive';
                            const bgClass = status === 'active' ? 'layui-bg-green' : 'layui-bg-gray';
                            const text = status === 'active' ? '启用' : '禁用';
                            return `<span class="layui-badge ${bgClass}">${text}</span>`;
                        }
                    },
                    {field: 'views', title: '浏览', width: 80, align: 'center'},
                    {
                        fixed: 'right',
                        title: '操作',
                        width: 180,
                        align: 'center',
                        templet: function(d: Share) {
                            return `<a class="layui-btn layui-btn-xs" lay-event="edit"><i class="layui-icon layui-icon-edit"></i> 编辑</a> ` +
                                   `<a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="del"><i class="layui-icon layui-icon-delete"></i> 删除</a>`;
                        }
                    }
                ]],
                parseData: function(res: { code: number; msg: string; count: number; data: Share[] }) {
                    return {
                        code: res.code,
                        msg: res.msg,
                        count: res.count,
                        data: res.data
                    };
                }
            });

            layui.table.on('tool(shareTable)', function(obj: { data: Share; event: string }) {
                if (obj.event === 'edit') {
                    handleEdit(obj.data);
                } else if (obj.event === 'del') {
                    if (confirm('确定要删除这个分享吗？')) {
                        fetch(`/api/share?id=${obj.data.id}`, {method: 'DELETE'})
                            .then(() => tableRef.current?.reload());
                    }
                }
            });
        });
    };

    const handleFileUpload = async (file: File) => {
        setUploading(true);
        const fd = new FormData();
        fd.append('file', file);

        try {
            const res = await fetch('/api/upload', {method: 'POST', body: fd});
            const data = await res.json() as { url: string };
            setFormData({...formData, image: data.url});
        } catch {
            alert('上传失败');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            alert('请输入分享标题');
            return;
        }

        try {
            await fetch('/api/share', {
                method: editItem ? 'PUT' : 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(editItem ? {...formData, id: editItem.id} : formData)
            });

            setShowModal(false);
            resetForm();
            tableRef.current?.reload();
        } catch {
            alert('操作失败');
        }
    };

    const handleEdit = (item: Share) => {
        setEditItem(item);
        setFormData({
            title: item.title || '',
            description: item.description || '',
            link: item.link || '',
            image: item.image || '',
            position: item.position || 'top',
            status: item.status || 'active',
            startDate: item.startDate || '',
            endDate: item.endDate || ''
        });
        setShowModal(true);

        setTimeout(() => {
            const layui = (window as unknown as { layui?: Layui }).layui;
            if (!layui) return;

            layui.use(['laydate'], (laydate: Layui['laydate']) => {
                laydate.render({
                    elem: '#startDateInput',
                    type: 'date',
                    format: 'yyyy-MM-dd',
                    value: item.startDate,
                    done: (value: string) => {
                        setFormData(prev => ({...prev, startDate: value}));
                    }
                });
                laydate.render({
                    elem: '#endDateInput',
                    type: 'date',
                    format: 'yyyy-MM-dd',
                    value: item.endDate,
                    done: (value: string) => {
                        setFormData(prev => ({...prev, endDate: value}));
                    }
                });
            });
        }, 100);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            link: '',
            image: '',
            position: 'top',
            status: 'active',
            startDate: '',
            endDate: ''
        });
        setEditItem(null);
    };

    const initDatePickers = () => {
        setTimeout(() => {
            const layui = (window as unknown as { layui?: Layui }).layui;
            if (!layui) return;

            layui.use(['laydate'], (laydate: Layui['laydate']) => {
                laydate.render({
                    elem: '#startDateInput',
                    type: 'date',
                    format: 'yyyy-MM-dd',
                    done: (value: string) => {
                        setFormData(prev => ({...prev, startDate: value}));
                    }
                });
                laydate.render({
                    elem: '#endDateInput',
                    type: 'date',
                    format: 'yyyy-MM-dd',
                    done: (value: string) => {
                        setFormData(prev => ({...prev, endDate: value}));
                    }
                });
            });
        }, 100);
    };

    return (
        <div className="layui-fluid">
            <div className="layui-card">
                <div className="layui-card-header">分享管理</div>
                <div className="layui-card-body">
                    <div style={{marginBottom: 15}}>
                        <button className="layui-btn" onClick={() => {
                            setFormData({
                                title: '',
                                description: '',
                                link: '',
                                image: '',
                                position: 'top',
                                status: 'active',
                                startDate: '',
                                endDate: ''
                            });
                            setEditItem(null);
                            setShowModal(true);
                            initDatePickers();
                        }}>
                            <i className="layui-icon layui-icon-add-1"></i> 添加分享
                        </button>
                        <button className="layui-btn layui-btn-primary" onClick={() => tableRef.current?.reload()}>
                            <i className="layui-icon layui-icon-refresh"></i> 刷新
                        </button>
                    </div>

                    <table id="shareTable" lay-filter="shareTable"></table>
                </div>
            </div>

            {showModal && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: '#fff',
                    borderRadius: 4,
                    width: '90%',
                    maxWidth: 600,
                    maxHeight: '80vh',
                    overflow: 'auto',
                    zIndex: 10000,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}>
                    <div style={{
                        padding: '15px 20px',
                        borderBottom: '1px solid #e6e6e6',
                        fontSize: 16,
                        fontWeight: 500
                    }}>{editItem ? '编辑分享' : '添加分享'}</div>
                    <div style={{padding: 20}}>
                        <form className="layui-form">
                            <div className="layui-form-item">
                                <label className="layui-form-label">分享标题 <span style={{color: 'red'}}>*</span></label>
                                <div className="layui-input-block">
                                    <input
                                        className="layui-input"
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                        placeholder="请输入分享标题"
                                    />
                                </div>
                            </div>

                            <div className="layui-form-item">
                                <label className="layui-form-label">分享描述</label>
                                <div className="layui-input-block">
                                    <textarea
                                        className="layui-textarea"
                                        value={formData.description}
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                        placeholder="请输入分享描述"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="layui-form-item">
                                <label className="layui-form-label">跳转链接</label>
                                <div className="layui-input-block">
                                    <input
                                        className="layui-input"
                                        value={formData.link}
                                        onChange={e => setFormData({...formData, link: e.target.value})}
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>

                            <div className="layui-form-item">
                                <label className="layui-form-label">分享图片</label>
                                <div className="layui-input-block">
                                    <button
                                        type="button"
                                        className="layui-btn"
                                        onClick={() => {
                                            const input = document.getElementById('shareImageUpload') as HTMLInputElement;
                                            input?.click();
                                        }}
                                        disabled={uploading}
                                    >
                                        <i className="layui-icon layui-icon-upload-drag"></i> {uploading ? '上传中...' : '上传图片'}
                                    </button>
                                    <input
                                        id="shareImageUpload"
                                        type="file"
                                        accept="image/*"
                                        style={{display: 'none'}}
                                        onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) handleFileUpload(file);
                                        }}
                                    />
                                    <input
                                        className="layui-input"
                                        placeholder="或输入图片 URL 地址"
                                        value={formData.image}
                                        onChange={e => setFormData({...formData, image: e.target.value})}
                                        style={{marginTop: 10}}
                                    />
                                    {formData.image && (
                                        <div style={{marginTop: 10}}>
                                            <img src={formData.image} alt="" width="200" height="100"/>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="layui-form-item">
                                <div className="layui-inline">
                                    <label className="layui-form-label">显示位置</label>
                                    <div className="layui-input-inline">
                                        <select
                                            style={{minWidth: 150, height: 38, padding: '0 12px', border: '1px solid #e6e6e6', borderRadius: 4, fontSize: 14, backgroundColor: '#fff', cursor: 'pointer', boxSizing: 'border-box'}}
                                            value={formData.position || 'top'}
                                            onChange={e => setFormData({...formData, position: e.target.value as 'top' | 'middle'})}
                                        >
                                            <option value="">请选择位置</option>
                                            <option value="top">顶部通栏</option>
                                            <option value="middle">中间横幅</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="layui-inline">
                                    <label className="layui-form-label">状态</label>
                                    <div className="layui-input-inline" style={{lineHeight: '38px'}}>
                                        <label style={{marginRight: 16}}>
                                            <input
                                                type="radio"
                                                name="status"
                                                value="active"
                                                checked={formData.status === 'active'}
                                                onChange={e => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}
                                                style={{marginRight: 4}}
                                            />
                                            启用
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name="status"
                                                value="inactive"
                                                checked={formData.status === 'inactive'}
                                                onChange={e => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}
                                                style={{marginRight: 4}}
                                            />
                                            禁用
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="layui-form-item">
                                <div className="layui-inline">
                                    <label className="layui-form-label">开始日期</label>
                                    <div className="layui-input-inline">
                                        <input
                                            id="startDateInput"
                                            className="layui-input"
                                            placeholder="请选择开始日期"
                                            value={formData.startDate}
                                            readOnly
                                        />
                                    </div>
                                </div>
                                <div className="layui-inline">
                                    <label className="layui-form-label">结束日期</label>
                                    <div className="layui-input-inline">
                                        <input
                                            id="endDateInput"
                                            className="layui-input"
                                            placeholder="请选择结束日期"
                                            value={formData.endDate}
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div style={{
                        padding: '10px 20px',
                        borderTop: '1px solid #e6e6e6',
                        textAlign: 'right'
                    }}>
                        <button className="layui-btn layui-btn-sm" onClick={handleSubmit}>确定</button>
                        <button className="layui-btn layui-btn-primary layui-btn-sm" onClick={() => {
                            setShowModal(false);
                            resetForm();
                        }}>取消</button>
                    </div>
                </div>
            )}
            {showModal && <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 9999
            }} onClick={() => setShowModal(false)}></div>}
        </div>
    );
}
