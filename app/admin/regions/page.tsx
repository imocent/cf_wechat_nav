'use client';
import React, {useEffect, useState, useRef} from 'react';

declare global {
    interface Window {
        layui: any;
    }
}

interface Country {
    id: string;
    name: string;
    code: string;
}

interface Province {
    id: string;
    countryId: string;
    name: string;
    zipCode: string;
}

interface City {
    id: string;
    provinceId: string;
    name: string;
    zipCode: string;
}

interface TreeNode {
    id: string;
    name: string;
    code?: string;
    zipCode?: string;
    type: 'country' | 'province' | 'city';
    parentId?: string;
    children?: TreeNode[];
}

export default function Regions() {
    const [regions, setRegions] = useState<{
        countries: Country[];
        provinces: Province[];
        cities: City[];
    }>({countries: [], provinces: [], cities: []});

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'add' | 'edit'>('add');
    const [editItem, setEditItem] = useState<TreeNode | null>(null);
    const [selectedParent, setSelectedParent] = useState<{
        id: string;
        name: string;
        type: 'country' | 'province' | 'city' | null;
    }>({id: '', name: '', type: null});
    const [formData, setFormData] = useState({name: '', code: '', zipCode: ''});
    const tableRef = useRef<any>(null);

    useEffect(() => {
        loadRegions().then((data) => {
            if (data) {
                initTable(data);
            }
        });
    }, []);

    const buildTreeDataFromRaw = (data: { countries: Country[]; provinces: Province[]; cities: City[] }): TreeNode[] => {
        const tree: TreeNode[] = [];

        if (!data || !data.countries) return tree;

        data.countries.forEach((country: Country) => {
            const countryNode: TreeNode = {
                id: country.id,
                name: country.name,
                code: country.code,
                type: 'country',
                children: []
            };

            const provinces = data.provinces.filter((p: Province) => p.countryId === country.id);
            provinces.forEach((province: Province) => {
                const provinceNode: TreeNode = {
                    id: province.id,
                    name: province.name,
                    zipCode: province.zipCode,
                    type: 'province',
                    parentId: country.id,
                    children: []
                };

                const cities = data.cities.filter((c: City) => c.provinceId === province.id);
                cities.forEach((city: City) => {
                    provinceNode.children!.push({
                        id: city.id,
                        name: city.name,
                        zipCode: city.zipCode,
                        type: 'city',
                        parentId: province.id
                    });
                });

                countryNode.children!.push(provinceNode);
            });

            tree.push(countryNode);
        });

        return tree;
    };

    const loadRegions = async (): Promise<{ countries: Country[]; provinces: Province[]; cities: City[] } | null> => {
        try {
            const res = await fetch('/api/regions');
            const data = await res.json() as { countries: Country[]; provinces: Province[]; cities: City[] };
            setRegions(data);
            return data;
        } catch {
            alert('加载区域数据失败');
            return null;
        }
    };

    const reloadTable = (data?: { countries: Country[]; provinces: Province[]; cities: City[] }) => {
        const regs = data || regions;
        const treeData = buildTreeDataFromRaw(regs);

        if (tableRef.current?.reloadData) {
            tableRef.current.reloadData({data: treeData});
        } else if (tableRef.current?.reload) {
            tableRef.current.reload({data: treeData});
        }
    };

    const initTable = (initialData?: { countries: Country[]; provinces: Province[]; cities: City[] }) => {
        const layui = window.layui;
        if (!layui) return;

        layui.use(['treeTable', 'table'], function(treeTable: any, table: any) {
            const treeData = buildTreeDataFromRaw(initialData || {countries: [], provinces: [], cities: []});

            tableRef.current = treeTable.render({
                elem: '#regionTable',
                data: treeData,
                tree: {
                    customName: {
                        children: 'children'
                    },
                    view: {
                        expandAll: true,
                        showIcon: false,
                        indent: 20
                    }
                },
                cols: [[
                    {field: 'name', title: '名称', minWidth: 250},
                    {
                        field: 'code',
                        title: '国家代码',
                        width: 120,
                        templet: function(d: any) {
                            const node = d.data || d;
                            return node.type === 'country' ? (node.code || '-') : '-';
                        }
                    },
                    {
                        field: 'zipCode',
                        title: '邮编',
                        width: 120,
                        templet: function(d: any) {
                            const node = d.data || d;
                            return node.type === 'city' || node.type === 'province' ? (node.zipCode || '-') : '-';
                        }
                    },
                    {
                        field: 'type',
                        title: '类型',
                        width: 100,
                        templet: function(d: any) {
                            const node = d.data || d;
                            const types = {country: '国家级', province: '省/州级', city: '城市级'};
                            const color = node.type === 'country' ? 'blue' : node.type === 'province' ? 'green' : 'orange';
                            return `<span class="layui-badge layui-bg-${color}">${types[node.type]}</span>`;
                        }
                    },
                    {
                        fixed: 'right',
                        title: '操作',
                        align: 'center',
                        templet: function(d: any) {
                            const node = d.data || d;
                            return `
                                <a class="layui-btn layui-btn-xs" lay-event="edit" data-id="${node.id}">编辑</a>
                                <a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="del" data-id="${node.id}">删除</a>
                            `;
                        }
                    }
                ]],
                style: 'margin-bottom: 20px;'
            });

            table.on('tool(regionTable)', function(obj: any) {
                const node = obj.data?.data || obj.data;
                if (obj.event === 'edit') {
                    handleEdit(node);
                } else if (obj.event === 'del') {
                    handleDelete(node);
                }
            });
        });
    };

    const initSelectTree = async (initParentId?: string) => {
        const elem = document.getElementById('parentTreeSelect');
        if (!elem) return;

        const oldSelectDiv = elem.parentElement?.querySelector('.layui-form-select');
        const oldCardDiv = elem.parentElement?.querySelector('.dtree-select');
        if (oldSelectDiv) oldSelectDiv.remove();
        if (oldCardDiv) oldCardDiv.remove();

        elem.innerHTML = '';
        elem.className = 'dtree';

        const layui = window.layui;
        if (!layui) return;

        layui.use(['dtree'], function(dtree: any) {
            fetch('/api/regions/dtree')
                .then(res => res.json())
                .then((apiData: { data: unknown[] }) => {
                    const DTree = dtree.renderSelect({
                        elem: '#parentTreeSelect',
                        data: apiData.data,
                        selectTips: '请选择父级区域',
                        done: function() {
                            if (initParentId) {
                                DTree.dataInit(initParentId);
                                DTree.selectVal(initParentId);
                            } else {
                                DTree.dataInit('0');
                                DTree.selectVal('0');
                            }
                        }
                    });

                    dtree.on('node("parentTreeSelect")', function(param: any) {
                        const nodeData = param?.param || param;
                        const nodeId = String(nodeData?.nodeId || nodeData?.id || '');

                        if (nodeId === '0') {
                            setSelectedParent({id: '', name: '', type: null});
                            return;
                        }

                        const nodeName = nodeData?.context || nodeData?.title || '';
                        const nodeType = regions.countries.find(c => c.id === nodeId) ? 'country' : 'province';
                        setSelectedParent({
                            id: nodeId,
                            name: nodeName,
                            type: nodeType
                        });
                    });
                });
        });
    };

    const cleanupDTree = () => {
        const elem = document.getElementById('parentTreeSelect');
        if (!elem) return;

        const oldSelectDiv = elem.parentElement?.querySelector('.layui-form-select');
        const oldCardDiv = elem.parentElement?.querySelector('.dtree-select');
        if (oldSelectDiv) oldSelectDiv.remove();
        if (oldCardDiv) oldCardDiv.remove();

        elem.innerHTML = '';
        elem.className = 'dtree';
    };

    const handleEdit = (node: TreeNode) => {
        setModalType('edit');
        setEditItem(node);

        if (node.type === 'country') {
            setFormData({name: node.name, code: node.code || '', zipCode: ''});
            setSelectedParent({id: '', name: '', type: null});
        } else if (node.type === 'province') {
            setFormData({name: node.name, code: '', zipCode: node.zipCode || ''});
            const parentCountry = regions.countries.find((c: Country) => c.id === node.parentId);
            setSelectedParent(parentCountry ? {id: parentCountry.id, name: parentCountry.name, type: 'country'} : {id: '', name: '', type: null});
        } else if (node.type === 'city') {
            setFormData({name: node.name, code: '', zipCode: node.zipCode || ''});
            const parentProvince = regions.provinces.find((p: Province) => p.id === node.parentId);
            setSelectedParent(parentProvince ? {id: parentProvince.id, name: parentProvince.name, type: 'province'} : {id: '', name: '', type: null});
        }

        setShowModal(true);
        initSelectTree(node.parentId);
    };

    const handleAdd = () => {
        setModalType('add');
        setSelectedParent({id: '', name: '', type: null});
        setEditItem(null);
        setFormData({name: '', code: '', zipCode: ''});
        setShowModal(true);
        initSelectTree();
    };

    const handleDelete = async (node: TreeNode) => {
        const warning = node.type === 'country'
            ? '删除国家会同时删除其下属所有省份和城市！'
            : '删除省份会同时删除其下属所有城市！';

        if (!confirm(`确定要删除"${node.name}"吗？\n${warning}`)) return;

        try {
            await fetch(`/api/regions?type=${node.type}&id=${node.id}`, {method: 'DELETE'});
            const data = await loadRegions();
            if (data) {
                reloadTable(data);
            }
        } catch {
            alert('删除失败');
        }
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            alert('请输入名称');
            return;
        }

        try {
            if (modalType === 'add') {
                if (selectedParent.type === 'country') {
                    if (!formData.zipCode) {
                        alert('请输入邮编');
                        return;
                    }
                    await fetch('/api/regions', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            type: 'province',
                            name: formData.name,
                            zipCode: formData.zipCode,
                            parentId: selectedParent.id
                        })
                    });
                } else if (selectedParent.type === 'province') {
                    if (!formData.zipCode) {
                        alert('请输入邮编');
                        return;
                    }
                    await fetch('/api/regions', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            type: 'city',
                            name: formData.name,
                            zipCode: formData.zipCode,
                            parentId: selectedParent.id
                        })
                    });
                } else {
                    if (!formData.code) {
                        alert('请输入国家代码');
                        return;
                    }
                    await fetch('/api/regions', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            type: 'country',
                            name: formData.name,
                            code: formData.code
                        })
                    });
                }
            } else {
                const updateData: {
                    type: string;
                    id: string;
                    name: string;
                    code?: string;
                    zipCode?: string;
                    parentId?: string;
                } = {
                    type: editItem?.type || '',
                    id: editItem?.id || '',
                    name: formData.name,
                    code: formData.code,
                    zipCode: formData.zipCode
                };

                if (selectedParent.type && editItem?.parentId !== selectedParent.id) {
                    if (editItem?.type === 'province' && selectedParent.type === 'country') {
                        updateData.parentId = selectedParent.id;
                    } else if (editItem?.type === 'city' && selectedParent.type === 'province') {
                        updateData.parentId = selectedParent.id;
                    }
                }

                await fetch('/api/regions', {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(updateData)
                });
            }

            setShowModal(false);
            setFormData({name: '', code: '', zipCode: ''});
            setSelectedParent({id: '', name: '', type: null});
            setEditItem(null);
            cleanupDTree();
            const data = await loadRegions();
            if (data) {
                reloadTable(data);
            }
        } catch {
            alert('操作失败');
        }
    };

    const getModalTitle = () => {
        if (modalType === 'edit') {
            if (editItem?.type === 'country') {
                return `编辑国家（${editItem.name}）`;
            }
            if (editItem?.type === 'province') {
                return `编辑省份（${editItem.name}）`;
            }
            if (editItem?.type === 'city') {
                return `编辑城市（${editItem.name}）`;
            }
        }

        if (selectedParent.type === 'country') {
            return `添加省份（父级：${selectedParent.name}）`;
        }
        if (selectedParent.type === 'province') {
            return `添加城市（父级：${selectedParent.name}）`;
        }
        return '添加国家';
    };

    const getAddTypeHint = () => {
        if (selectedParent.type === 'country') return '省份';
        if (selectedParent.type === 'province') return '城市';
        return '国家';
    };

    return (
        <div className="layui-fluid">
            <div className="layui-card">
                <div className="layui-card-header">区域管理</div>
                <div className="layui-card-body">
                    <div style={{marginBottom: 15}}>
                        <button className="layui-btn" onClick={handleAdd}>
                            <i className="layui-icon layui-icon-add-circle"></i> 添加
                        </button>
                        <span style={{marginLeft: 10, color: '#999', fontSize: 12}}>
                            可添加国家、省份或城市
                        </span>
                    </div>

                    <table id="regionTable" lay-filter="regionTable"></table>
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
                    maxWidth: modalType === 'add' ? 600 : 500,
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
                        <form className="layui-form" lay-filter="regionForm">
                            {(modalType === 'add' || (modalType === 'edit' && editItem?.type !== 'country')) && (
                                <div className="layui-form-item">
                                    <label className="layui-form-label">选择父级</label>
                                    <div className="layui-input-block">
                                        <ul id="parentTreeSelect" style={{width: '100%'}}></ul>
                                        <div style={{marginTop: 8, fontSize: 12, color: '#999'}}>
                                            {selectedParent.name
                                                ? `已选择：${selectedParent.name} (${selectedParent.type === 'country' ? '国家' : '省份'})`
                                                : modalType === 'add' ? '未选择父级，将添加为国家' : '未改变父级'}
                                        </div>
                                        {selectedParent.name && (
                                            <a
                                                style={{fontSize: 12, color: '#009688', cursor: 'pointer'}}
                                                onClick={() => setSelectedParent({id: '', name: '', type: null})}
                                            >
                                                清除选择
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {modalType === 'edit' && editItem?.type === 'country' && (
                                <div className="layui-form-item">
                                    <label className="layui-form-label">所属区域</label>
                                    <div className="layui-input-block">
                                        <input
                                            type="text"
                                            className="layui-input layui-disabled"
                                            disabled={true}
                                            value="（根节点）"
                                            style={{cursor: 'not-allowed'}}
                                        />
                                        <div style={{marginTop: 8, fontSize: 12, color: '#999'}}>
                                            此节点为根节点（国家级）
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="layui-form-item">
                                <label className="layui-form-label">{modalType === 'add' ? `${getAddTypeHint()}名称` : '名称'}</label>
                                <div className="layui-input-block">
                                    <input
                                        type="text"
                                        name="name"
                                        className="layui-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder={modalType === 'add' ? `请输入${getAddTypeHint()}名称` : '请输入名称'}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>

                            {(modalType === 'add' && !selectedParent.type) || (modalType === 'edit' && editItem?.type === 'country') ? (
                                <div className="layui-form-item">
                                    <label className="layui-form-label">国家代码</label>
                                    <div className="layui-input-block">
                                        <input
                                            type="text"
                                            name="code"
                                            className="layui-input"
                                            value={formData.code}
                                            onChange={(e) => setFormData({...formData, code: e.target.value})}
                                            placeholder="请输入国家代码，如 CN、US"
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                            ) : null}

                            {(modalType === 'add' && selectedParent.type) || (modalType === 'edit' && (editItem?.type === 'province' || editItem?.type === 'city')) ? (
                                <div className="layui-form-item">
                                    <label className="layui-form-label">邮编</label>
                                    <div className="layui-input-block">
                                        <input
                                            type="text"
                                            name="zipCode"
                                            className="layui-input"
                                            value={formData.zipCode}
                                            onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                                            placeholder="请输入邮政编码"
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                            ) : null}
                        </form>
                    </div>
                    <div style={{
                        padding: '10px 20px',
                        borderTop: '1px solid #e6e6e6',
                        textAlign: 'right'
                    }}>
                        <button type="button" className="layui-btn layui-btn-sm" onClick={handleSubmit}>
                            确定
                        </button>
                        <button
                            type="button"
                            className="layui-btn layui-btn-primary layui-btn-sm"
                            onClick={() => {
                                setShowModal(false);
                                setFormData({name: '', code: '', zipCode: ''});
                                setSelectedParent({id: '', name: '', type: null});
                                setEditItem(null);
                                cleanupDTree();
                            }}
                        >
                            取消
                        </button>
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
            }} onClick={() => {
                setShowModal(false);
                cleanupDTree();
            }}></div>}

            <style jsx global>{`
                .layui-table tbody tr {
                    background-color: transparent !important;
                }
                .layui-table tbody tr:hover {
                    background-color: #f2f2f2 !important;
                }
                .layui-tree-table-line {
                    background-color: transparent !important;
                }
                .layui-table-main {
                    background-color: transparent !important;
                }
                .dtree-select {
                    background: #fff !important;
                }
                .dtree-select-item {
                    background: #fff !important;
                }
                .dtree-select-input {
                    background: #fff !important;
                }
                .layui-table[lay-filter="regionTable"] tr {
                    background-color: transparent !important;
                }
                .layui-table[lay-filter="regionTable"] tr.layui-table-hover {
                    background-color: #f8f8f8 !important;
                }
                .layui-table-cell {
                    background-color: transparent !important;
                }
            `}</style>
        </div>
    );
}
