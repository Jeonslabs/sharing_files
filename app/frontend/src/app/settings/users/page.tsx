'use client';

import { useEffect, useState } from 'react';
import api from '../../../utils/api';

interface User {
    id: string;
    username: string;
    email?: string;
    role: string;
    is_active: boolean;
}

export default function UsersSettingsPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ username: '', email: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.username.trim()) {
            alert('사용자 이름을 입력해 주세요.');
            return;
        }
        try {
            await api.post('/users', {
                username: form.username.trim(),
                email: form.email.trim() || undefined,
            });
            setForm({ username: '', email: '' });
            await fetchUsers();
            alert('담당자가 추가되었습니다. (초기 비밀번호: 1234)');
        } catch (err: any) {
            console.error(err);
            alert(err?.response?.data?.message || '담당자 추가 실패');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">담당자 관리</h2>

            <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-100">
                <h3 className="font-semibold mb-4 text-gray-800">새 담당자 추가</h3>
                <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">사용자 이름</label>
                        <input
                            type="text"
                            value={form.username}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            placeholder="예: hong_gildong"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">이메일 (선택)</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="user@example.com"
                        />
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                        초기 비밀번호는 <span className="font-semibold">1234</span> 로 설정됩니다.
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-5 py-2.5 rounded hover:bg-blue-700 transition-colors font-medium"
                    >
                        추가하기
                    </button>
                </form>
            </div>

            {loading ? (
                <div className="text-center py-8 text-gray-500">목록을 불러오는 중...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-left text-sm">
                        <thead>
                            <tr className="bg-gray-100 border-b border-gray-200">
                                <th className="p-3 font-semibold text-gray-600">이름</th>
                                <th className="p-3 font-semibold text-gray-600">이메일</th>
                                <th className="p-3 font-semibold text-gray-600">역할</th>
                                <th className="p-3 font-semibold text-gray-600">활성</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id} className="border-b border-gray-100">
                                    <td className="p-3 text-gray-800">{u.username}</td>
                                    <td className="p-3 text-gray-600">{u.email || '-'}</td>
                                    <td className="p-3 text-gray-600">{u.role}</td>
                                    <td className="p-3 text-gray-600">{u.is_active ? '예' : '아니오'}</td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500">
                                        등록된 담당자가 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}




