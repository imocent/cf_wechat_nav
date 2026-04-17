'use client';
import {useEffect, useState, useRef} from 'react';

interface Group {
    id: string;
    name: string;
    categoryId: string;
    qrcode: string;
    views: number;
    countryId: string;
    provinceId: string;
    cityId: string;
    status: 'pending' | 'approved' | 'rejected';
}

interface Category {
    id: string;
    name: string;
}

interface Country {
    id: string;
    name: string;
}

interface Province {
    id: string;
    countryId: string;
    name: string;
}

interface City {
    id: string;
    provinceId: string;
    name: string;
}

export default function Groups() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [regions, setRegions] = useState<{
        countries: Country[];
        provinces: Province[];
        cities: City[];
    }>({countries: [], provinces: [], cities: []});
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'add' | 'edit'>('add');
    const [editItem, setEditItem] = useState<Group | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        qrcode: '',
        countryId: '',
        provinceId: '',
        cityId: '',
        status: 'pending' as 'pending' | 'approved' | 'rejected'
    });
    const [uploading, setUploading] = useState(false);
    const tableRef = useRef<any>(null);
    const categoriesRef = useRef<Category[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [catsRes, regsRes] = await Promise.all([
                fetch('/api/categories').then(r => r.json()),
                fetch('/api/regions').then(r => r.json())
            ]);

            const cats = catsRes.data && Array.isArray(catsRes.data) ? catsRes.data : Array.isArray(catsRes) ? catsRes : [];
            const regs = regsRes;

            setCategories(cats);
            categoriesRef.current = cats;
            setRegions(regs);
            initTable();
        } catch {
            alert('加载数据失败');
        }
    };

    const initTable = () => {
        const layui = window.layui;
        if (!layui) return;

        layui.use(['table', 'layer'], function(table: any, layer: any) {
            tableRef.current = table.render({
                elem: '#groupTable',
                url: '/api/groups',
                page: true,
                limits: [10, 20, 30, 50],
                limit: 10,
                cols: [[
                    {field: 'id', title: 'ID', width: 60},
                    {field: 'name', title: '群名称'},
                    {
                        field: 'categoryId',
                        title: '分类',
                        width: 120,
                        templet: function(d: Group) {
                            const cat = categoriesRef.current.find(c => c.id === d.categoryId);
                            return cat?.name || '-';
                        }
                    },
                    {
                        field: 'status',
                        title: '状态',
                        width: 100,
                        templet: function(d: Group) {
                            const statusMap = {
                                'pending': '<span class="layui-badge layui-bg-orange">待审核</span>',
                                'approved': '<span class="layui-badge layui-bg-green">已通过</span>',
                                'rejected': '<span class="layui-badge layui-bg-gray">已拒绝</span>'
                            };
                            return statusMap[d.status] || statusMap['pending'];
                        }
                    },
                    {field: 'views', title: '浏览量', width: 100},
                    {
                        field: 'qrcode',
                        title: '二维码',
                        width: 100,
                        templet: function(d: Group) {
                            return d.qrcode ? `<img src="${d.qrcode}" width="40" height="40" />` : '-';
                        }
                    },
                    {
                        fixed: 'right',
                        title: '操作',
                        width: 250,
                        align: 'center',
                        templet: function(d: Group) {
                            let buttons = '';
                            if (d.status === 'pending') {
                                buttons += `<a class="layui-btn layui-btn-xs" lay-event="approve"><i class="layui-icon layui-icon-ok"></i> 通过</a>`;
                                buttons += `<a class="layui-btn layui-btn-warm layui-btn-xs" lay-event="reject"><i class="layui-icon layui-icon-close"></i> 拒绝</a>`;
                            }
                            buttons += `<a class="layui-btn layui-btn-xs" lay-event="edit"><i class="layui-icon layui-icon-edit"></i> 编辑</a>`;
                            buttons += `<a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="del"><i class="layui-icon layui-icon-delete"></i> 删除</a>`;
                            return buttons;
                        }
                    }
                ]],
                parseData: function(res: { code: number; msg: string; count: number; data: Group[] }) {
                    return {
                        code: res.code,
                        msg: res.msg,
                        count: res.count,
                        data: res.data
                    };
                }
            });

            table.on('tool(groupTable)', function(obj: any) {
                if (obj.event === 'edit') {
                    handleEdit(obj.data);
                } else if (obj.event === 'del') {
                    layer.confirm('确定要删除这个群组吗？', {icon: 3, title: '提示'}, function(index: any) {
                        fetch(`/api/groups?id=${obj.data.id}`, {method: 'DELETE'})
                            .then(res => res.json())
                            .then((result: { code: number }) => {
                                if (result.code === 0) {
                                    layer.msg('删除成功', {icon: 1});
                                    tableRef.current?.reload();
                                } else {
                                    layer.msg('删除失败', {icon: 2});
                                }
                                layer.close(index);
                            });
                    });
                } else if (obj.event === 'approve') {
                    layer.confirm(`确定通过群组"${obj.data.name}"的审核吗？`, {icon: 3, title: '提示'}, function(index: any) {
                        fetch('/api/groups', {
                            method: 'PUT',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({id: obj.data.id, action: 'approve'})
                        }).then(() => {
                            layer.msg('审核通过', {icon: 1});
                            tableRef.current?.reload();
                            layer.close(index);
                        });
                    });
                } else if (obj.event === 'reject') {
                    layer.confirm(`确定拒绝群组"${obj.data.name}"吗？`, {icon: 3, title: '提示'}, function(index: any) {
                        fetch('/api/groups', {
                            method: 'PUT',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({id: obj.data.id, action: 'reject'})
                        }).then(() => {
                            layer.msg('已拒绝', {icon: 1});
                            tableRef.current?.reload();
                            layer.close(index);
                        });
                    });
                }
            });
        });
    };

    const handleEdit = async (item: Group) => {
        setModalType('edit');
        setEditItem(item);

        try {
            const [catsRes, regsRes] = await Promise.all([
                fetch('/api/categories').then(r => r.json()),
                fetch('/api/regions').then(r => r.json())
            ]);

            const cats = catsRes.data || catsRes;
            const regs = regsRes;

            setCategories(Array.isArray(cats) ? cats : []);
            setRegions(regs);
            categoriesRef.current = Array.isArray(cats) ? cats : [];

            setFormData({
                name: item.name,
                categoryId: item.categoryId || '',
                qrcode: item.qrcode || '',
                countryId: item.countryId || '',
                provinceId: item.provinceId || '',
                cityId: item.cityId || '',
                status: item.status || 'pending'
            });
            setShowModal(true);
        } catch {
            alert('加载数据失败');
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.categoryId) {
            alert('请填写完整信息');
            return;
        }

        try {
            if (modalType === 'add') {
                await fetch('/api/groups', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(formData)
                });
            } else {
                await fetch('/api/groups', {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        id: editItem?.id,
                        ...formData
                    })
                });
            }

            setShowModal(false);
            resetForm();
            tableRef.current?.reload();
        } catch {
            alert('操作失败');
        }
    };

    const resetForm = () => {
        setFormData({name: '', categoryId: '', qrcode: '', countryId: '', provinceId: '', cityId: '', status: 'pending'});
        setEditItem(null);
        setModalType('add');
    };

    const filteredProvinces = regions.provinces.filter(p => p.countryId === formData.countryId);
    const filteredCities = regions.cities.filter(c => c.provinceId === formData.provinceId);

    const getModalTitle = () => {
        return modalType === 'add' ? '新增群组' : '编辑群组';
    };

    return (
        <div className="layui-fluid">
            <div className="layui-card">
                <div className="layui-card-header">群组管理</div>
                <div className="layui-card-body">
                    <div style={{marginBottom: 15}}>
                        <button className="layui-btn" onClick={async () => {
                            try {
                                const [catsRes, regsRes] = await Promise.all([
                                    fetch('/api/categories').then(r => r.json()),
                                    fetch('/api/regions').then(r => r.json())
                                ]);

                                const cats = catsRes.data || catsRes;
                                const regs = regsRes;

                                setCategories(Array.isArray(cats) ? cats : []);
                                setRegions(regs);
                                categoriesRef.current = Array.isArray(cats) ? cats : [];

                                resetForm();
                                setShowModal(true);
                            } catch {
                                alert('加载数据失败');
                            }
                        }}>
                            <i className="layui-icon layui-icon-add-1"></i> 新增群组
                        </button>
                    </div>

                    <table id="groupTable" lay-filter="groupTable"></table>
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
                    }}>{getModalTitle()}</div>
                    <div style={{padding: 20}}>
                        <form className="layui-form">
                            <div className="layui-form-item">
                                <label className="layui-form-label">群名称</label>
                                <div className="layui-input-block">
                                    <input
                                        className="layui-input"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        placeholder="请输入群名称"
                                    />
                                </div>
                            </div>

                            <div className="layui-form-item">
                                <label className="layui-form-label">分类</label>
                                <div className="layui-input-block">
                                    <select
                                        style={{width: '100%', height: 38, padding: '0 12px', border: '1px solid #e6e6e6', borderRadius: 4, fontSize: 14, backgroundColor: '#fff', cursor: 'pointer', boxSizing: 'border-box'}}
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                                    >
                                        <option value="">请选择分类</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="layui-form-item">
                                <label className="layui-form-label">所在区域</label>
                                <div className="layui-input-block" style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                                    <select
                                        style={{flex: '1 1 120px', maxWidth: 180, height: 38, padding: '0 12px', border: '1px solid #e6e6e6', borderRadius: 4, fontSize: 14, backgroundColor: '#fff', cursor: 'pointer', boxSizing: 'border-box', minWidth: 120}}
                                        value={formData.countryId}
                                        onChange={(e) => setFormData({...formData, countryId: e.target.value, provinceId: '', cityId: ''})}
                                    >
                                        <option value="">选择国家</option>
                                        {regions.countries.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <select
                                        style={{flex: '1 1 120px', maxWidth: 180, height: 38, padding: '0 12px', border: '1px solid #e6e6e6', borderRadius: 4, fontSize: 14, backgroundColor: '#fff', cursor: 'pointer', boxSizing: 'border-box', minWidth: 120}}
                                        value={formData.provinceId}
                                        onChange={(e) => setFormData({...formData, provinceId: e.target.value, cityId: ''})}
                                        disabled={!formData.countryId}
                                    >
                                        <option value="">选择省份</option>
                                        {filteredProvinces.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    <select
                                        style={{flex: '1 1 120px', maxWidth: 180, height: 38, padding: '0 12px', border: '1px solid #e6e6e6', borderRadius: 4, fontSize: 14, backgroundColor: '#fff', cursor: 'pointer', boxSizing: 'border-box', minWidth: 120}}
                                        value={formData.cityId}
                                        onChange={(e) => setFormData({...formData, cityId: e.target.value})}
                                        disabled={!formData.provinceId}
                                    >
                                        <option value="">选择城市</option>
                                        {filteredCities.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="layui-form-item">
                                <label className="layui-form-label">状态</label>
                                <div className="layui-input-block" style={{lineHeight: '38px'}}>
                                    <label style={{marginRight: 16}}>
                                        <input
                                            type="radio"
                                            name="status"
                                            value="pending"
                                            checked={formData.status === 'pending'}
                                            onChange={e => setFormData({...formData, status: e.target.value as 'pending' | 'approved' | 'rejected'})}
                                            style={{marginRight: 4}}
                                        />
                                        待审核
                                    </label>
                                    <label style={{marginRight: 16}}>
                                        <input
                                            type="radio"
                                            name="status"
                                            value="approved"
                                            checked={formData.status === 'approved'}
                                            onChange={e => setFormData({...formData, status: e.target.value as 'pending' | 'approved' | 'rejected'})}
                                            style={{marginRight: 4}}
                                        />
                                        已通过
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="status"
                                            value="rejected"
                                            checked={formData.status === 'rejected'}
                                            onChange={e => setFormData({...formData, status: e.target.value as 'pending' | 'approved' | 'rejected'})}
                                            style={{marginRight: 4}}
                                        />
                                        已拒绝
                                    </label>
                                </div>
                            </div>

                            <div className="layui-form-item">
                                <label className="layui-form-label">二维码</label>
                                <div className="layui-input-block">
                                    <button
                                        type="button"
                                        className="layui-btn"
                                        onClick={() => {
                                            const input = document.getElementById('qrcodeUpload') as HTMLInputElement;
                                            input?.click();
                                        }}
                                        disabled={uploading}
                                    >
                                        <i className="layui-icon layui-icon-upload-drag"></i> {uploading ? '上传中...' : '上传图片'}
                                    </button>
                                    <input
                                        id="qrcodeUpload"
                                        type="file"
                                        accept="image/*"
                                        style={{display: 'none'}}
                                        onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setUploading(true);
                                                const fd = new FormData();
                                                fd.append('file', file);
                                                fetch('/api/upload', {method: 'POST', body: fd})
                                                    .then(res => res.json())
                                                    .then((data: { url: string }) => {
                                                        setFormData({...formData, qrcode: data.url});
                                                        setUploading(false);
                                                    })
                                                    .catch(() => {
                                                        alert('上传失败');
                                                        setUploading(false);
                                                    });
                                            }
                                        }}
                                    />
                                    <input
                                        type="text"
                                        className="layui-input"
                                        placeholder="或输入图片 URL 地址"
                                        value={formData.qrcode}
                                        onChange={e => setFormData({...formData, qrcode: e.target.value})}
                                        style={{marginTop: 10}}
                                    />
                                    {formData.qrcode && (
                                        <div style={{marginTop: 10}}>
                                            <img src={formData.qrcode} alt="" width="120" height="120"/>
                                        </div>
                                    )}
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
