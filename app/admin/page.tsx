'use client';
import { useEffect, useState } from 'react';

interface DashboardStats {
    totalGroups: number;
    totalCategories: number;
    totalRegions: number;
    totalAds: number;
    totalViews: number;
    newGroupsToday: number;
    serverTime: string;
}

interface RecentGroup {
    id: string;
    name: string;
    createdAt: string;
}

export default function Admin() {
    const [stats, setStats] = useState<DashboardStats>({
        totalGroups: 0,
        totalCategories: 0,
        totalRegions: 0,
        totalAds: 0,
        totalViews: 0,
        newGroupsToday: 0,
        serverTime: ''
    });
    const [recentGroups, setRecentGroups] = useState<RecentGroup[]>([]);

    useEffect(() => {
        fetchStats();
        updateServerTime();
        const timeInterval = setInterval(updateServerTime, 1000);
        return () => clearInterval(timeInterval);
    }, []);

    const updateServerTime = () => {
        const now = new Date();
        const timeStr = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        setStats(prev => ({ ...prev, serverTime: timeStr }));
    };

    const fetchStats = async () => {
        try {
            const [groupsRes, catsRes, regionsRes, adsRes] = await Promise.all([
                fetch('/api/groups'),
                fetch('/api/categories'),
                fetch('/api/regions'),
                fetch('/api/share')
            ]);

            const groupsData = await groupsRes.json() as { code: number; data?: { views?: number; createdAt?: string; id: string; name: string }[] };
            const catsData = await catsRes.json() as { code: number; data?: unknown[] } | unknown[];
            const regionsData = await regionsRes.json() as { countries?: unknown[]; provinces?: unknown[]; cities?: unknown[] };
            const adsData = await adsRes.json() as { code: number; data?: unknown[] } | unknown[];

            // 处理群组数据 - 可能是分页格式
            const groups = Array.isArray(groupsData) ? groupsData : (groupsData.data || []);

            // 处理分类数据
            const categories = Array.isArray(catsData) ? catsData : (catsData.data || []);

            // 处理分享数据
            const ads = Array.isArray(adsData) ? adsData : (adsData.data || []);

            const totalViews = groups.reduce((sum, g) => sum + (g.views || 0), 0);

            const today = new Date().toDateString();
            const newGroupsToday = groups.filter(g => {
                const createdDate = new Date(g.createdAt || g.id).toDateString();
                return createdDate === today;
            }).length;

            const sortedGroups = [...groups]
                .sort((a, b) => parseInt(b.id) - parseInt(a.id))
                .slice(0, 5)
                .map(g => ({
                    id: g.id,
                    name: g.name,
                    createdAt: g.createdAt || new Date().toISOString()
                }));

            const totalCountries = regionsData.countries?.length || 0;
            const totalProvinces = regionsData.provinces?.length || 0;
            const totalCities = regionsData.cities?.length || 0;

            setStats({
                totalGroups: groups.length,
                totalCategories: categories.length,
                totalRegions: totalCountries + totalProvinces + totalCities,
                totalAds: ads.length,
                totalViews,
                newGroupsToday,
                serverTime: stats.serverTime
            });
            setRecentGroups(sortedGroups);
        } catch {
            alert('加载数据失败');
        }
    };

    return (
        <div className="layui-fluid">
            <fieldset className="layui-elem-field">
                <legend>仪表盘</legend>
                <div className="layui-field-box">
                    <p>欢迎使用微信群导航后台管理系统</p>
                </div>
            </fieldset>

            <div className="layui-card">
                <div className="layui-card-header">服务器信息</div>
                <div className="layui-card-body">
                    <blockquote className="layui-elem-quote layui-quote-nm">
                        服务器时间: {stats.serverTime} &nbsp;&nbsp;
                        系统: Next.js 15 &nbsp;&nbsp;
                        运行环境: Node.js
                        <button className="layui-btn layui-btn-sm" style={{float: 'right'}} onClick={fetchStats}>
                            <i className="layui-icon layui-icon-refresh"></i> 刷新
                        </button>
                    </blockquote>
                </div>
            </div>

            <div className="layui-row layui-col-space15">
                <div className="layui-col-md3">
                    <div className="layui-card">
                        <div className="layui-card-header">
                            <i className="layui-icon layui-icon-group"></i> 群组总数
                        </div>
                        <div className="layui-card-body">
                            <h1 style={{fontSize: 36, color: '#009688', margin: 0}}>{stats.totalGroups}</h1>
                            <p style={{color: '#999', marginTop: 10}}>今日新增: +{stats.newGroupsToday}</p>
                        </div>
                    </div>
                </div>

                <div className="layui-col-md3">
                    <div className="layui-card">
                        <div className="layui-card-header">
                            <i className="layui-icon layui-icon-list"></i> 分类总数
                        </div>
                        <div className="layui-card-body">
                            <h1 style={{fontSize: 36, color: '#1E9FFF', margin: 0}}>{stats.totalCategories}</h1>
                            <p style={{color: '#999', marginTop: 10}}>个分类</p>
                        </div>
                    </div>
                </div>

                <div className="layui-col-md3">
                    <div className="layui-card">
                        <div className="layui-card-header">
                            <i className="layui-icon layui-icon-location"></i> 区域总数
                        </div>
                        <div className="layui-card-body">
                            <h1 style={{fontSize: 36, color: '#FFB800', margin: 0}}>{stats.totalRegions}</h1>
                            <p style={{color: '#999', marginTop: 10}}>国家/省/市</p>
                        </div>
                    </div>
                </div>

                <div className="layui-col-md3">
                    <div className="layui-card">
                        <div className="layui-card-header">
                            <i className="layui-icon layui-icon-chart"></i> 总浏览量
                        </div>
                        <div className="layui-card-body">
                            <h1 style={{fontSize: 36, color: '#FF5722', margin: 0}}>{stats.totalViews}</h1>
                            <p style={{color: '#999', marginTop: 10}}>次访问</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="layui-row layui-col-space15" style={{marginTop: 15}}>
                <div className="layui-col-md6">
                    <div className="layui-card">
                        <div className="layui-card-header">
                            <i className="layui-icon layui-icon-template-1"></i> 最近添加的群组
                        </div>
                        <div className="layui-card-body">
                            <table className="layui-table">
                                <thead>
                                    <tr>
                                        <th width="60">ID</th>
                                        <th>群组名称</th>
                                        <th width="150">添加时间</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentGroups.length > 0 ? recentGroups.map(group => (
                                        <tr key={group.id}>
                                            <td>{group.id}</td>
                                            <td>{group.name}</td>
                                            <td style={{fontSize: 12, color: '#666'}}>
                                                {new Date(group.createdAt).toLocaleString('zh-CN', {
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3}>暂无数据</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="layui-col-md6">
                    <div className="layui-card">
                        <div className="layui-card-header">
                            <i className="layui-icon layui-icon-util"></i> 快捷操作
                        </div>
                        <div className="layui-card-body">
                            <div className="layui-btn-container">
                                <a href="/admin/groups" className="layui-btn layui-btn-normal">
                                    <i className="layui-icon layui-icon-group"></i> 管理群组
                                </a>
                                <a href="/admin/categories" className="layui-btn layui-btn-warm">
                                    <i className="layui-icon layui-icon-list"></i> 管理分类
                                </a>
                                <a href="/admin/regions" className="layui-btn layui-btn-cyan">
                                    <i className="layui-icon layui-icon-location"></i> 管理区域
                                </a>
                                <a href="/admin/share" className="layui-btn">
                                    <i className="layui-icon layui-icon-template-1"></i> 分享管理
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
