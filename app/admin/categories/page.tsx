'use client';
import {useEffect, useState, useRef} from 'react';

interface Category {
    id: string;
    name: string;
}

interface LayuiTable {
    render: (options: {
        elem: string;
        url: string;
        page: boolean;
        limits: number[];
        limit: number;
        cols: unknown[][];
        parseData?: (res: { code: number; msg: string; count: number; data: Category[] }) => {
            code: number;
            msg: string;
            count: number;
            data: Category[];
        };
    }) => {
        reload: () => void;
    };
}

interface Layui {
    use: <T extends unknown[]>(modules: string[], callback: (...args: T) => void) => void;
    table: {
        on: (event: string, callback: (obj: { data: Category; event: string; value?: string }) => void) => void;
    };
    layer: {
        prompt: (options: { title: string; formType: number }, callback: (value: string, index: number) => void) => void;
        msg: (msg: string, options?: { icon?: number; time?: number }) => void;
        close: (index: number) => void;
    };
}

export default function Categories() {
    const tableRef = useRef<ReturnType<LayuiTable['render']> | null>(null);
    const [layuiReady, setLayuiReady] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let attempts = 0;
        const checkLayui = setInterval(() => {
            attempts++;
            const layui = (window as unknown as { layui?: Layui }).layui;
            if (layui) {
                clearInterval(checkLayui);
                setLayuiReady(true);
                setLoading(false);
                initTable();
            } else if (attempts > 50) {
                clearInterval(checkLayui);
                setLoading(false);
                alert('Layui 加载失败，请刷新页面重试');
            }
        }, 100);

        return () => clearInterval(checkLayui);
    }, []);

    const initTable = () => {
        const layui = (window as unknown as { layui?: Layui }).layui;
        if (!layui) return;

        layui.use(['table'], function(table: LayuiTable) {
            tableRef.current = table.render({
                elem: '#categoryTable',
                url: '/api/categories',
                page: true,
                limits: [10, 20, 30, 50],
                limit: 10,
                cols: [[
                    {field: 'id', title: 'ID', width: 80},
                    {field: 'name', title: '分类名称', edit: 'text'},
                    {
                        fixed: 'right',
                        title: '操作',
                        width: 120,
                        align: 'center',
                        templet: function(d: Category) {
                            return `<a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="del"><i class="layui-icon layui-icon-delete"></i> 删除</a>`;
                        }
                    }
                ]],
                parseData: function(res: { code: number; msg: string; count: number; data: Category[] }) {
                    return {
                        code: res.code,
                        msg: res.msg,
                        count: res.count,
                        data: res.data
                    };
                }
            });

            layui.table.on('edit(categoryTable)', function(obj: { data: Category; event: string; value?: string }) {
                const value = obj.value || '';
                const data = obj.data;

                if (!value.trim()) {
                    alert('分类名称不能为空');
                    tableRef.current?.reload();
                    return;
                }

                fetch('/api/categories', {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({id: data.id, name: value.trim()})
                }).then(res => res.json()).then((result: { code: number }) => {
                    if (result.code === 0) {
                        layui.layer.msg('修改成功', {icon: 1, time: 1000});
                    } else {
                        layui.layer.msg('修改失败', {icon: 2});
                        tableRef.current?.reload();
                    }
                }).catch(() => {
                    layui.layer.msg('修改失败', {icon: 2});
                    tableRef.current?.reload();
                });
            });

            layui.table.on('tool(categoryTable)', function(obj: { data: Category; event: string }) {
                if (obj.event === 'del') {
                    if (confirm('确定要删除这个分类吗？')) {
                        fetch(`/api/categories?id=${obj.data.id}`, {method: 'DELETE'})
                            .then(() => tableRef.current?.reload());
                    }
                }
            });
        });
    };

    const addCategory = () => {
        const layui = (window as unknown as { layui?: Layui }).layui;
        if (!layui) return;

        layui.use(['layer'], function() {
            layui.layer.prompt({title: '请输入分类名称', formType: 0}, function(value: string, index: number) {
                if (!value.trim()) {
                    layui.layer.msg('分类名称不能为空', {icon: 2});
                    return;
                }

                fetch('/api/categories', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({name: value.trim()})
                }).then(res => res.json()).then((result: { code: number }) => {
                    if (result.code === 0) {
                        layui.layer.msg('添加成功', {icon: 1, time: 1000});
                        layui.layer.close(index);
                        tableRef.current?.reload();
                    } else {
                        layui.layer.msg('添加失败', {icon: 2});
                    }
                }).catch(() => {
                    layui.layer.msg('添加失败', {icon: 2});
                });
            });
        });
    };

    return (
        <div className="layui-fluid">
            <div className="layui-card">
                <div className="layui-card-header">分类管理</div>
                <div className="layui-card-body">
                    {loading && <div className="layui-layer-load">加载中...</div>}

                    <div style={{marginBottom: 15}}>
                        <button className="layui-btn" onClick={addCategory}>
                            <i className="layui-icon layui-icon-add-1"></i> 新增分类
                        </button>
                        <button className="layui-btn layui-btn-primary" onClick={() => tableRef.current?.reload()}>
                            <i className="layui-icon layui-icon-refresh"></i> 刷新
                        </button>
                    </div>

                    <table id="categoryTable" lay-filter="categoryTable"></table>
                </div>
            </div>
        </div>
    );
}
