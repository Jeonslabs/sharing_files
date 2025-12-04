'use client';

import { useEffect, useState } from 'react';
import api from '../utils/api';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns';

export default function Dashboard() {
    const [stats, setStats] = useState({ thisMonth: 0, nextMonth: 0, total: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch all items for simplicity in MVP
                // Ideally backend should provide summary endpoint
                const res = await api.get('/items');
                const items = res.data;

                const now = new Date();
                const thisMonthStart = startOfMonth(now);
                const thisMonthEnd = endOfMonth(now);
                const nextMonthStart = startOfMonth(addMonths(now, 1));
                const nextMonthEnd = endOfMonth(addMonths(now, 1));

                const thisMonthCount = items.filter((i: any) => {
                    const d = new Date(i.due_date);
                    return d >= thisMonthStart && d <= thisMonthEnd;
                }).length;

                const nextMonthCount = items.filter((i: any) => {
                    const d = new Date(i.due_date);
                    return d >= nextMonthStart && d <= nextMonthEnd;
                }).length;

                setStats({
                    thisMonth: thisMonthCount,
                    nextMonth: nextMonthCount,
                    total: items.length
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">대시보드</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-gray-500 text-sm font-medium">이번 달 만기 예정</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{stats.thisMonth}건</p>
                </div>
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-gray-500 text-sm font-medium">다음 달 만기 예정</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">{stats.nextMonth}건</p>
                </div>
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-gray-500 text-sm font-medium">전체 관리 항목</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}건</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded shadow">
                <h2 className="text-lg font-bold mb-4">빠른 바로가기</h2>
                <div className="flex gap-4">
                    <Link href="/items/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        + 새 항목 등록
                    </Link>
                    <Link href="/items" className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200">
                        목록 보기
                    </Link>
                    <Link href="/calendar" className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200">
                        캘린더 보기
                    </Link>
                </div>
            </div>
        </div>
    );
}
