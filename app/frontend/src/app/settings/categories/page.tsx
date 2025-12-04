'use client';

import { useState, useEffect } from 'react';
import api from '../../../utils/api';

type FieldType = 'text' | 'number' | 'date' | 'select' | 'checkbox';

interface CategoryFieldConfig {
    key: string;
    label: string;
    type: FieldType;
    required: boolean;
    options?: string[];
}

interface Category {
    id: string;
    name: string;
    description?: string;
    color_code?: string;
    fields?: CategoryFieldConfig[];
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState({ name: '', description: '', color_code: '#3B82F6' });

    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [editingFields, setEditingFields] = useState<CategoryFieldConfig[]>([]);
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [fieldDraft, setFieldDraft] = useState<{ key: string; label: string; type: FieldType; required: boolean; options: string }>({
        key: '',
        label: '',
        type: 'text',
        required: false,
        options: '',
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data);

            if (selectedCategoryId) {
                const current = res.data.find((c: Category) => String(c.id) === String(selectedCategoryId));
                if (current) {
                    setEditingFields(current.fields || []);
                }
            }
        } catch (err) {
            console.error('Failed to fetch categories', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/categories', newCategory);
            setNewCategory({ name: '', description: '', color_code: '#3B82F6' });
            fetchCategories();
            alert('카테고리가 추가되었습니다.');
        } catch (err) {
            console.error(err);
            alert('카테고리 추가 실패');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            await api.delete(`/categories/${id}`);
            fetchCategories();
        } catch (err) {
            console.error(err);
            alert('삭제 실패');
        }
    };

    const handleSelectCategoryForFields = (id: string) => {
        setSelectedCategoryId(id);
        const cat = categories.find((c) => String(c.id) === String(id));
        setEditingFields(cat?.fields || []);
        setEditingKey(null);
        setFieldDraft({ key: '', label: '', type: 'text', required: false, options: '' });
    };

    const handleSaveField = () => {
        if (!selectedCategoryId) {
            alert('먼저 카테고리를 선택해 주세요.');
            return;
        }
        if (!fieldDraft.key || !fieldDraft.label) {
            alert('필드 키와 라벨을 입력해 주세요.');
            return;
        }
        if (!editingKey) {
            const exists = editingFields.some((f) => f.key === fieldDraft.key);
            if (exists) {
                alert('이미 존재하는 필드 키입니다.');
                return;
            }
        }
        const optionsArray = fieldDraft.options
            ? fieldDraft.options.split(',').map((o) => o.trim()).filter(Boolean)
            : undefined;
        const newField: CategoryFieldConfig = {
            key: fieldDraft.key,
            label: fieldDraft.label,
            type: fieldDraft.type,
            required: fieldDraft.required,
            options: optionsArray,
        };

        let next: CategoryFieldConfig[];
        if (editingKey) {
            next = editingFields.map((f) => (f.key === editingKey ? newField : f));
        } else {
            next = [...editingFields, newField];
        }
        setEditingFields(next);
        setEditingKey(null);
        setFieldDraft({ key: '', label: '', type: 'text', required: false, options: '' });
    };

    const handleRemoveField = (key: string) => {
        const next = editingFields.filter((f) => f.key !== key);
        setEditingFields(next);
        if (editingKey === key) {
            setEditingKey(null);
            setFieldDraft({ key: '', label: '', type: 'text', required: false, options: '' });
        }
    };

    const handleEditField = (field: CategoryFieldConfig) => {
        setEditingKey(field.key);
        setFieldDraft({
            key: field.key,
            label: field.label,
            type: field.type,
            required: field.required,
            options: field.options?.join(', ') || '',
        });
    };

    const handleMoveField = (key: string, direction: 'up' | 'down') => {
        const idx = editingFields.findIndex((f) => f.key === key);
        if (idx === -1) return;
        const targetIndex = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIndex < 0 || targetIndex >= editingFields.length) return;
        const next = [...editingFields];
        const temp = next[idx];
        next[idx] = next[targetIndex];
        next[targetIndex] = temp;
        setEditingFields(next);
    };

    const handleSaveFields = async () => {
        if (!selectedCategoryId) return;
        try {
            await api.patch(`/categories/${selectedCategoryId}`, { fields: editingFields });
            await fetchCategories();
            alert('필드 구성이 저장되었습니다.');
        } catch (err) {
            console.error(err);
            alert('필드 저장에 실패했습니다.');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">카테고리 관리</h2>
            
            {/* Create Form */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-100">
                <h3 className="font-semibold mb-4 text-gray-800">새 카테고리 추가</h3>
                <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                        <input 
                            type="text" 
                            value={newCategory.name}
                            onChange={e => setNewCategory({...newCategory, name: e.target.value})}
                            className="border border-gray-300 rounded px-3 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            placeholder="예: 공과금"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                        <input 
                            type="text" 
                            value={newCategory.description}
                            onChange={e => setNewCategory({...newCategory, description: e.target.value})}
                            className="border border-gray-300 rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="간단한 설명"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">색상</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="color" 
                                value={newCategory.color_code}
                                onChange={e => setNewCategory({...newCategory, color_code: e.target.value})}
                                className="h-10 w-16 border border-gray-300 rounded p-1 cursor-pointer"
                            />
                            <span className="text-xs text-gray-500">{newCategory.color_code}</span>
                        </div>
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-5 py-2.5 rounded hover:bg-blue-700 transition-colors font-medium">
                        추가하기
                    </button>
                </form>
            </div>

            {/* List */}
            {loading ? <div className="text-center py-8 text-gray-500">목록을 불러오는 중...</div> : (
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-left text-sm">
                        <thead>
                            <tr className="bg-gray-100 border-b border-gray-200">
                                <th className="p-4 font-semibold text-gray-600 w-20 text-center">색상</th>
                                <th className="p-4 font-semibold text-gray-600">이름</th>
                                <th className="p-4 font-semibold text-gray-600">설명</th>
                                <th className="p-4 font-semibold text-gray-600 text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(cat => (
                                <tr key={cat.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-center">
                                        <div 
                                            className="w-6 h-6 rounded-full mx-auto shadow-sm ring-1 ring-gray-200" 
                                            style={{ backgroundColor: cat.color_code }}
                                        ></div>
                                    </td>
                                    <td className="p-4 font-medium text-gray-800">{cat.name}</td>
                                    <td className="p-4 text-gray-500">{cat.description || '-'}</td>
                                    <td className="p-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleSelectCategoryForFields(cat.id)}
                                            className="text-blue-600 hover:text-blue-800 text-xs px-3 py-1.5 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                                        >
                                            필드 설정
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat.id)}
                                            className="text-red-600 hover:text-red-800 text-xs px-3 py-1.5 border border-red-200 rounded hover:bg-red-50 transition-colors"
                                        >
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-gray-500 bg-gray-50 rounded-b-lg">
                                        등록된 카테고리가 없습니다. 새 카테고리를 추가해주세요.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Form Builder for selected category */}
            <div className="mt-10 p-6 bg-gray-50 border border-gray-100 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">카테고리별 항목 폼 설정</h3>

                <div className="mb-4 flex items-center gap-4">
                    <label className="text-sm text-gray-700">카테고리 선택</label>
                    <select
                        value={selectedCategoryId}
                        onChange={(e) => handleSelectCategoryForFields(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 text-sm"
                    >
                        <option value="">카테고리를 선택하세요</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                {selectedCategoryId && (
                    <>
                        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">필드 키 (영문/숫자)</label>
                                <input
                                    type="text"
                                    value={fieldDraft.key}
                                    onChange={(e) => setFieldDraft({ ...fieldDraft, key: e.target.value })}
                                    className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                                    placeholder="amount"
                                    disabled={!!editingKey}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">라벨</label>
                                <input
                                    type="text"
                                    value={fieldDraft.label}
                                    onChange={(e) => setFieldDraft({ ...fieldDraft, label: e.target.value })}
                                    className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                                    placeholder="금액"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">타입</label>
                                <select
                                    value={fieldDraft.type}
                                    onChange={(e) => setFieldDraft({ ...fieldDraft, type: e.target.value as FieldType })}
                                    className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                                >
                                    <option value="text">텍스트</option>
                                    <option value="number">숫자</option>
                                    <option value="date">날짜</option>
                                    <option value="select">선택(드롭다운)</option>
                                    <option value="checkbox">체크박스</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">옵션 (콤마 구분)</label>
                                <input
                                    type="text"
                                    value={fieldDraft.options}
                                    onChange={(e) => setFieldDraft({ ...fieldDraft, options: e.target.value })}
                                    className="border border-gray-300 rounded px-3 py-2 w-full text-sm"
                                    placeholder="예: 예,아니오"
                                    disabled={fieldDraft.type !== 'select'}
                                />
                                <label className="inline-flex items-center text-xs text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={fieldDraft.required}
                                        onChange={(e) => setFieldDraft({ ...fieldDraft, required: e.target.checked })}
                                        className="mr-2"
                                    />
                                    필수 입력
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-4">
                            <button
                                type="button"
                                onClick={handleSaveField}
                                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                            >
                                {editingKey ? '필드 수정' : '필드 추가'}
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveFields}
                                className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-black"
                            >
                                전체 저장
                            </button>
                        </div>

                        <div className="bg-white border border-gray-200 rounded">
                            <table className="min-w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="px-4 py-2 font-semibold text-gray-600">키</th>
                                        <th className="px-4 py-2 font-semibold text-gray-600">라벨</th>
                                        <th className="px-4 py-2 font-semibold text-gray-600">타입</th>
                                        <th className="px-4 py-2 font-semibold text-gray-600">필수</th>
                                        <th className="px-4 py-2 font-semibold text-gray-600">옵션</th>
                                        <th className="px-4 py-2 font-semibold text-gray-600 text-right">관리</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {editingFields.map((f) => (
                                        <tr key={f.key} className="border-b last:border-b-0">
                                            <td className="px-4 py-2 font-mono text-[11px] text-gray-800">{f.key}</td>
                                            <td className="px-4 py-2 text-gray-800">{f.label}</td>
                                            <td className="px-4 py-2 text-gray-600">{f.type}</td>
                                            <td className="px-4 py-2 text-gray-600">{f.required ? '예' : '아니오'}</td>
                                            <td className="px-4 py-2 text-gray-500 text-[11px]">
                                                {f.options?.join(', ') || '-'}
                                            </td>
                                            <td className="px-4 py-2 text-right space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveField(f.key, 'up')}
                                                    className="text-xs text-gray-500 hover:text-gray-800"
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleMoveField(f.key, 'down')}
                                                    className="text-xs text-gray-500 hover:text-gray-800"
                                                >
                                                    ↓
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditField(f)}
                                                    className="text-xs text-blue-600 hover:text-blue-800 ml-1"
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveField(f.key)}
                                                    className="text-xs text-red-600 hover:text-red-800 ml-1"
                                                >
                                                    삭제
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {editingFields.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-6 text-center text-gray-500 text-xs">
                                                아직 설정된 필드가 없습니다. 위에서 필드를 추가해 보세요.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

