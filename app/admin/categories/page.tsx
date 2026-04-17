'use client';
import {useEffect, useRef} from 'react';

interface Category {
    id: string;
    name: string;
}

export default function Categories() {
    const tableRef = useRef<any>(null);

    useEffect(() => {
        initTable();
    }, []);

    const initTable = () => {
        const layui = window.layui;
        if (!layui) return;

        layui.use(['table', 'layer'], function(table: any, layer: any) {
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
                        templet: function() {
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

            table.on('edit(categoryTable)', function(obj: any) {
                const value = obj.value || '';
                const data = obj.data;

                if (!value.trim()) {
                    layer.msg('分类名称不能为空', {icon: 2});
                    tableRef.current?.reload();
                    return;
                }

                fetch('/api/categories', {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({id: data.id, name: value.trim()})
                }).then(res => res.json()).then((result: { code: number }) => {
                    if (result.code === 0) {
                        layer.msg('修改成功', {icon: 1, time: 1000});
                    } else {
                        layer.msg('修改失败', {icon: 2});
                        tableRef.current?.reload();
                    }
                }).catch(() => {
                    layer.msg('修改失败', {icon: 2});
                    tableRef.current?.reload();
                });
            });

            table.on('tool(categoryTable)', function(obj: any) {
                if (obj.event === 'del') {
                    layer.confirm('确定要删除这个分类吗？', {icon: 3, title: '提示'}, function(index: any) {
                        fetch(`/api/categories?id=${obj.data.id}`, {method: 'DELETE'})
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
                }
            });
        });
    };

    const addCategory = () => {
        const layui = window.layui;
        if (!layui) return;

        layui.use(['layer'], function(layer: any) {
            layer.prompt({title: '请输入分类名称', formType: 0}, function(value: string, index: number) {
                if (!value.trim()) {
                    layer.msg('分类名称不能为空', {icon: 2});
                    return;
                }

                fetch('/api/categories', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({name: value.trim()})
                }).then(res => res.json()).then((result: { code: number }) => {
                    if (result.code === 0) {
                        layer.msg('添加成功', {icon: 1, time: 1000});
                        layer.close(index);
                        tableRef.current?.reload();
                    } else {
                        layer.msg('添加失败', {icon: 2});
                    }
                }).catch(() => {
                    layer.msg('添加失败', {icon: 2});
                });
            });
        });
    };

    return (
        <div className="layui-fluid">
            <div className="layui-card">
                <div className="layui-card-header">分类管理</div>
                <div className="layui-card-body">
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
