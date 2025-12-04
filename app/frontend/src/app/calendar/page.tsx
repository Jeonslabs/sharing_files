'use client';

import { useEffect, useState } from 'react';
import api from '../../utils/api';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, startOfWeek, addDays } from 'date-fns';
import Link from 'next/link';

type ViewMode = 'month' | 'week';

export default function CalendarPage() {
    const [items, setItems] = useState<any[]>([]);
    const [date, setDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('month');

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await api.get('/items');
            setItems(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const getTileContent = ({ date, view }: { date: Date; view: string }) => {
        if (view === 'month') {
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayItems = items.filter((i: any) => i.due_date === dateStr);

            if (dayItems.length > 0) {
                return (
                    <div className="text-[11px] mt-1 space-y-0.5">
                        {dayItems.map((i: any) => (
                            <div
                                key={i.id}
                                className="truncate bg-blue-100 text-blue-800 rounded px-1.5 py-0.5"
                                title={i.title}
                            >
                                {i.title}
                            </div>
                        ))}
                    </div>
                );
            }
        }
        return null;
    };

    const selectedItems = items.filter((i: any) => i.due_date === format(date, 'yyyy-MM-dd'));

    const renderWeekView = () => {
        const start = startOfWeek(date, { weekStartsOn: 1 }); // 월요일 시작
        const days = Array.from({ length: 7 }, (_, idx) => addDays(start, idx));

        return (
            <div className="w-full overflow-x-auto">
                <div className="min-w-[980px]">
                    <div className="flex border-b bg-gray-50 text-xs text-gray-600">
                        {days.map((d) => (
                            <div key={d.toISOString()} className="flex-1 px-3 py-2 border-l last:border-r">
                                <div className="flex justify-between items-center">
                                    <span>{format(d, 'EEE')}</span>
                                    <span className="font-semibold">{format(d, 'd')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex min-h-[480px] text-xs">
                        {days.map((d) => {
                            const dateStr = format(d, 'yyyy-MM-dd');
                            const dayItems = items.filter((i: any) => i.due_date === dateStr);
                            const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;
                            return (
                                <div
                                    key={d.toISOString()}
                                    className={`flex-1 border-l last:border-r p-1.5 align-top ${
                                        isToday ? 'bg-blue-50' : 'bg-white'
                                    }`}
                                >
                                    <div className="space-y-1">
                                        {dayItems.map((item: any) => (
                                            <Link
                                                key={item.id}
                                                href={`/items/${item.id}`}
                                                className="block rounded px-1.5 py-1 bg-amber-100 text-amber-900 truncate hover:bg-amber-200"
                                                title={item.title}
                                            >
                                                {item.title}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">일정 목록</h1>
                <div className="inline-flex rounded-md border border-gray-200 bg-white text-sm overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setViewMode('month')}
                        className={`px-4 py-1.5 ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                        월간
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('week')}
                        className={`px-4 py-1.5 border-l border-gray-200 ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                        주간
                    </button>
                </div>
            </div>

            <div className="bg-white rounded shadow p-6">
                {viewMode === 'month' ? (
                    <div className="space-y-6">
                        <div className="w-full big-calendar mx-auto">
                            <Calendar
                                onChange={(value) => setDate(value as Date)}
                                value={date}
                                tileContent={getTileContent}
                                className="w-full"
                            />
                        </div>

                        <div className="w-full max-w-3xl mx-auto bg-gray-50 border border-gray-100 rounded p-4">
                            <h2 className="text-lg font-bold mb-4">
                                {format(date, 'yyyy-MM-dd')} 일정
                            </h2>
                            <div className="space-y-3 max-h-[260px] overflow-y-auto">
                                {selectedItems.map((item: any) => (
                                    <Link
                                        key={item.id}
                                        href={`/items/${item.id}`}
                                        className="block border border-gray-200 p-3 rounded hover:bg-white transition-colors"
                                    >
                                        <p className="font-medium truncate">{item.title}</p>
                                        <p className="text-xs text-gray-500 mb-1 truncate">{item.category?.name}</p>
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded ${item.status === 'DONE'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-blue-100 text-blue-800'
                                                }`}
                                        >
                                            {item.status}
                                        </span>
                                    </Link>
                                ))}
                                {selectedItems.length === 0 && (
                                    <p className="text-gray-500 text-sm">일정이 없습니다.</p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    renderWeekView()
                )}
            </div>
        </div>
    );
}
