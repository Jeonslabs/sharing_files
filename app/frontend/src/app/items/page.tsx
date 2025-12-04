'use client';

import { useEffect, useState } from 'react';
import api from '../../utils/api';
import Link from 'next/link';
import { format } from 'date-fns';

export default function ItemsPage() {
    const [items, setItems] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [assignees, setAssignees] = useState<any[]>([]);
    const [filters, setFilters] = useState({ category_id: '', status: '' });
    const [loading, setLoading] = useState(true);

    const [renewTarget, setRenewTarget] = useState<any | null>(null);
    const [renewForm, setRenewForm] = useState<{ due_date: string; assignee_id: string; reason: string }>({
        due_date: '',
        assignee_id: '',
        reason: '',
    });

    useEffect(() => {
        fetchCategories();
        fetchAssignees();
        fetchItems();
    }, []);

    useEffect(() => {
        fetchItems();
    }, [filters]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAssignees = async () => {
        try {
            const res = await api.get('/users');
            setAssignees(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchItems = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.category_id) params.append('category_id', filters.category_id);
            if (filters.status) params.append('status', filters.status);

            const res = await api.get(`/items?${params.toString()}`);
            setItems(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const openRenewModal = (item: any) => {
        setRenewTarget(item);
        setRenewForm({
            due_date: item.due_date ? format(new Date(item.due_date), 'yyyy-MM-dd') : '',
            assignee_id: item.assignee_id || '',
            reason: '',
        });
    };

    const closeRenewModal = () => {
        setRenewTarget(null);
        setRenewForm({ due_date: '', assignee_id: '', reason: '' });
    };

    const handleRenewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!renewTarget) return;
        if (!renewForm.due_date) {
            alert('연장할 만기일을 선택해 주세요.');
            return;
        }
        try {
            await api.post(`/items/${renewTarget.id}/renew`, {
                due_date: renewForm.due_date,
                assignee_id: renewForm.assignee_id || null,
                reason: renewForm.reason || undefined,
            });
            await fetchItems();
            closeRenewModal();
            alert('갱신이 완료되었습니다.');
        } catch (err) {
            console.error(err);
            alert('갱신 중 오류가 발생했습니다.');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">항목 관리</h1>
                <Link href="/items/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    + 등록
                </Link>
            </div>

            <div className="bg-white p-4 rounded shadow mb-6 flex gap-4">
                <select
                    name="category_id"
                    value={filters.category_id}
                    onChange={handleFilterChange}
                    className="border p-2 rounded"
                >
                    <option value="">모든 카테고리</option>
                    {categories.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="border p-2 rounded"
                >
                    <option value="">모든 상태</option>
                    <option value="PLANNED">예정 (PLANNED)</option>
                    <option value="IN_PROGRESS">진행중 (IN_PROGRESS)</option>
                    <option value="DONE">완료 (DONE)</option>
                    <option value="CANCELED">취소 (CANCELED)</option>
                </select>
            </div>

            <div className="bg-white rounded shadow overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="p-4 font-medium text-gray-600">제목</th>
                            <th className="p-4 font-medium text-gray-600">카테고리</th>
                            <th className="p-4 font-medium text-gray-600">만기일</th>
                            <th className="p-4 font-medium text-gray-600 text-right">금액</th>
                            <th className="p-4 font-medium text-gray-600">상태</th>
                            <th className="p-4 font-medium text-gray-600">담당자</th>
                            <th className="p-4 font-medium text-gray-600">관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item: any) => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                                <td className="p-4">{item.title}</td>
                                <td className="p-4">
                                    <span className="bg-gray-100 px-2 py-1 rounded text-sm">{item.category?.name}</span>
                                </td>
                                <td className="p-4">{format(new Date(item.due_date), 'yyyy-MM-dd')}</td>
                                <td className="p-4 text-right text-sm text-gray-700">
                                    {item.amount != null
                                        ? Number(item.amount).toLocaleString('ko-KR')
                                        : '-'}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-sm ${item.status === 'DONE' ? 'bg-green-100 text-green-800' :
                                            item.status === 'PLANNED' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-gray-600">{item.assignee?.username || '-'}</td>
                                <td className="p-4 space-x-3">
                                    <Link href={`/items/${item.id}`} className="text-blue-600 hover:underline">
                                        상세/수정
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => openRenewModal(item)}
                                        className="text-sm text-emerald-600 hover:underline"
                                    >
                                        갱신
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {items.length === 0 && !loading && (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-gray-500">데이터가 없습니다.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 갱신 모달 */}
            {renewTarget && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">항목 갱신 - {renewTarget.title}</h2>
                        <form onSubmit={handleRenewSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">새 만기일</label>
                                    <input
                                        type="date"
                                        value={renewForm.due_date}
                                        onChange={(e) => setRenewForm({ ...renewForm, due_date: e.target.value })}
                                        className="w-full border rounded px-3 py-2 text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">담당자</label>
                                    <select
                                        value={renewForm.assignee_id}
                                        onChange={(e) => setRenewForm({ ...renewForm, assignee_id: e.target.value })}
                                        className="w-full border rounded px-3 py-2 text-sm"
                                    >
                                        <option value="">선택 안 함</option>
                                        {assignees.map((u: any) => (
                                            <option key={u.id} value={u.id}>
                                                {u.username}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">갱신 사유</label>
                                <textarea
                                    value={renewForm.reason}
                                    onChange={(e) => setRenewForm({ ...renewForm, reason: e.target.value })}
                                    className="w-full border rounded px-3 py-2 text-sm h-24"
                                    placeholder="예: 보험료 인상, 계약 조건 변경 등"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeRenewModal}
                                    className="px-4 py-2 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                                >
                                    갱신 저장
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
