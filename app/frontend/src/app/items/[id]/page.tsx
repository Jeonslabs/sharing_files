'use client';

import { useEffect, useState } from 'react';
import api from '../../../utils/api';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function ItemDetailPage({ params }: { params: { id: string } }) {
    const isNew = params.id === 'new';
    const router = useRouter();

    const [formData, setFormData] = useState<{
        title: string;
        category_id: string;
        description: string;
        due_date: string;
        status: string;
        amount: number;
        repeat_unit: string;
        repeat_interval: number;
        assignee_id?: string | null;
    }>({
        title: '',
        category_id: '',
        description: '',
        due_date: '',
        status: 'PLANNED',
        amount: 0,
        repeat_unit: 'NONE',
        repeat_interval: 0,
        assignee_id: null,
    });

    const [amountDisplay, setAmountDisplay] = useState<string>('');
    const [categories, setCategories] = useState<any[]>([]);
    const [assignees, setAssignees] = useState<any[]>([]);
    const [extraData, setExtraData] = useState<Record<string, any>>({});
    const [attachments, setAttachments] = useState([]);
    const [history, setHistory] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchCategories();
        fetchAssignees();
        if (!isNew) {
            fetchItem();
            fetchAttachments();
            fetchHistory();
        }
    }, []);

    const fetchCategories = async () => {
        const res = await api.get('/categories');
        setCategories(res.data);
    };

    const fetchAssignees = async () => {
        try {
            const res = await api.get('/users');
            setAssignees(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchItem = async () => {
        const res = await api.get(`/items/${params.id}`);
        const item = res.data;
        const amountNum = item.amount || 0;
        setFormData({
            title: item.title,
            category_id: item.category_id,
            description: item.description || '',
            due_date: item.due_date,
            status: item.status,
            amount: amountNum,
            repeat_unit: item.repeat_unit,
            repeat_interval: item.repeat_interval || 0,
            assignee_id: item.assignee_id || null,
        });
        setAmountDisplay(
            amountNum ? Number(amountNum).toLocaleString('ko-KR') : ''
        );
        setExtraData(item.extra_data || {});
    };

    const fetchAttachments = async () => {
        const res = await api.get(`/items/${params.id}/attachments`);
        setAttachments(res.data);
    };

    const fetchHistory = async () => {
        try {
            const res = await api.get(`/items/${params.id}/histories`);
            setHistory(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...formData, extra_data: extraData };
            if (isNew) {
                const res = await api.post('/items', payload);
                router.push(`/items/${res.data.id}`);
            } else {
                await api.patch(`/items/${params.id}`, payload);
                alert('저장되었습니다.');
            }
        } catch (err) {
            console.error(err);
            alert('저장 실패');
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];
        const data = new FormData();
        data.append('file', file);

        setUploading(true);
        try {
            await api.post(`/items/${params.id}/attachments`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchAttachments();
        } catch (err) {
            console.error(err);
            alert('업로드 실패');
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (attachmentId: string, fileName: string) => {
        try {
            const res = await api.get(`/attachments/${attachmentId}/download`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            console.error(err);
            alert('다운로드 실패');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{isNew ? '새 항목 등록' : '항목 수정'}</h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-8 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">제목</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="mt-1 block w-full border p-2 rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">카테고리</label>
                        <select
                            value={formData.category_id}
                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                            className="mt-1 block w-full border p-2 rounded"
                            required
                        >
                            <option value="">선택하세요</option>
                            {categories.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">만기일</label>
                        <input
                            type="date"
                            value={formData.due_date}
                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                            className="mt-1 block w-full border p-2 rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">상태</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="mt-1 block w-full border p-2 rounded"
                        >
                            <option value="PLANNED">예정</option>
                            <option value="IN_PROGRESS">진행중</option>
                            <option value="DONE">완료</option>
                            <option value="CANCELED">취소</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">담당자</label>
                        <select
                            value={formData.assignee_id || ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    assignee_id: e.target.value || null,
                                })
                            }
                            className="mt-1 block w-full border p-2 rounded"
                        >
                            <option value="">선택 안 함</option>
                            {assignees.map((u: any) => (
                                <option key={u.id} value={u.id}>
                                    {u.username}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">금액</label>
                        <input
                            type="text"
                            value={amountDisplay}
                            onChange={(e) => {
                                const raw = e.target.value.replace(/,/g, '');
                                if (raw === '') {
                                    setAmountDisplay('');
                                    setFormData({ ...formData, amount: 0 });
                                    return;
                                }
                                const num = Number(raw);
                                if (isNaN(num)) {
                                    // 숫자가 아니면 입력만 유지
                                    setAmountDisplay(e.target.value);
                                    return;
                                }
                                setAmountDisplay(num.toLocaleString('ko-KR'));
                                setFormData({ ...formData, amount: num });
                            }}
                            className="mt-1 block w-full border p-2 rounded"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">설명</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1 block w-full border p-2 rounded h-24"
                    />
                </div>

                {/* Dynamic fields from category (폼빌더) */}
                {formData.category_id && (
                    <div className="border-t pt-4 mt-4">
                        <h2 className="text-sm font-semibold text-gray-700 mb-3">카테고리별 추가 정보</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {categories
                                .find((c) => String(c.id) === String(formData.category_id))
                                ?.fields?.map((field: any) => {
                                    const value = extraData[field.key] ?? '';

                                    const commonProps = {
                                        id: field.key,
                                        className: 'mt-1 block w-full border p-2 rounded text-sm',
                                    };

                                    const onChange = (e: any) => {
                                        const v =
                                            field.type === 'number'
                                                ? (e.target.value === '' ? null : Number(e.target.value))
                                                : field.type === 'checkbox'
                                                    ? e.target.checked
                                                    : e.target.value;
                                        setExtraData((prev) => ({ ...prev, [field.key]: v }));
                                    };

                                    return (
                                        <div key={field.key}>
                                            <label htmlFor={field.key} className="block text-sm font-medium text-gray-700">
                                                {field.label}
                                                {field.required && <span className="text-red-500 ml-1">*</span>}
                                            </label>
                                            {field.type === 'text' && (
                                                <input type="text" value={value ?? ''} onChange={onChange} {...commonProps} />
                                            )}
                                            {field.type === 'number' && (
                                                <input type="number" value={value ?? ''} onChange={onChange} {...commonProps} />
                                            )}
                                            {field.type === 'date' && (
                                                <input type="date" value={value ?? ''} onChange={onChange} {...commonProps} />
                                            )}
                                            {field.type === 'select' && (
                                                <select value={value ?? ''} onChange={onChange} {...commonProps}>
                                                    <option value="">선택하세요</option>
                                                    {(field.options || []).map((opt: string) => (
                                                        <option key={opt} value={opt}>
                                                            {opt}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                            {field.type === 'checkbox' && (
                                                <div className="mt-2 flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(value)}
                                                        onChange={onChange}
                                                        className="mr-2"
                                                    />
                                                    <span className="text-xs text-gray-600">선택</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}

                <div className="flex justify-end">
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                        저장
                    </button>
                </div>
            </form>

            {!isNew && (
                <div className="space-y-6">
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-lg font-bold mb-4">첨부파일</h2>
                    <div className="mb-4">
                        <input type="file" onChange={handleFileUpload} disabled={uploading} />
                        {uploading && <span className="ml-2 text-sm text-gray-500">업로드 중...</span>}
                    </div>

                    <ul className="divide-y">
                        {attachments.map((file: any) => (
                            <li key={file.id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{file.file_name}</p>
                                    <p className="text-xs text-gray-500">{format(new Date(file.uploaded_at), 'yyyy-MM-dd HH:mm')}</p>
                                </div>
                                <button
                                    onClick={() => handleDownload(file.id, file.file_name)}
                                    className="text-blue-600 text-sm hover:underline"
                                >
                                    다운로드
                                </button>
                            </li>
                        ))}
                        {attachments.length === 0 && <li className="py-3 text-gray-500 text-sm">첨부된 파일이 없습니다.</li>}
                    </ul>
                    </div>

                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-lg font-bold mb-4">변경 이력</h2>
                        {history.length === 0 ? (
                            <p className="text-sm text-gray-500">저장된 이력이 없습니다.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b">
                                            <th className="p-3 text-gray-700 font-medium">시각</th>
                                            <th className="p-3 text-gray-700 font-medium text-right">금액</th>
                                            <th className="p-3 text-gray-700 font-medium">상태</th>
                                            <th className="p-3 text-gray-700 font-medium">담당자</th>
                                            <th className="p-3 text-gray-700 font-medium">사유</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map((h) => (
                                            <tr key={h.id} className="border-b last:border-b-0">
                                                <td className="p-3 text-xs text-gray-600">
                                                    {format(new Date(h.snapshot_at), 'yyyy-MM-dd HH:mm')}
                                                </td>
                                                <td className="p-3 text-right text-sm text-gray-800">
                                                    {h.amount != null ? Number(h.amount).toLocaleString('ko-KR') : '-'}
                                                </td>
                                                <td className="p-3 text-sm text-gray-700">{h.status}</td>
                                                <td className="p-3 text-sm text-gray-700">{h.assignee?.username || '-'}</td>
                                                <td className="p-3 text-xs text-gray-600 max-w-xs break-words">
                                                    {h.reason || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
