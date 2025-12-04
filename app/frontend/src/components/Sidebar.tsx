'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

    const menuItems = [
        { name: '대시보드', path: '/' },
        { name: '항목 관리', path: '/items' },
        { name: '캘린더', path: '/calendar' },
    ];

    const settingItems = [
        { name: '카테고리 관리', path: '/settings/categories' },
        { name: '담당자 관리', path: '/settings/users' },
    ];

    const isActive = (path: string) => pathname === path;

    return (
        <div className="w-64 bg-white h-screen shadow-md flex flex-col fixed left-0 top-0 z-10">
            <div className="p-6 border-b">
                <h1 className="text-xl font-bold text-blue-600">계약 관리</h1>
            </div>
            
            <nav className="flex-grow p-4 overflow-y-auto">
                <div className="mb-6">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-3 px-2">메뉴</p>
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link 
                                    href={item.path} 
                                    className={`block px-4 py-2 rounded-lg transition-colors ${
                                        isActive(item.path) 
                                            ? 'bg-blue-50 text-blue-600 font-medium' 
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-3 px-2">설정</p>
                    <ul className="space-y-2">
                        {settingItems.map((item) => (
                            <li key={item.path}>
                                <Link 
                                    href={item.path} 
                                    className={`block px-4 py-2 rounded-lg transition-colors ${
                                        isActive(item.path) 
                                            ? 'bg-blue-50 text-blue-600 font-medium' 
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            <div className="p-4 border-t text-xs text-gray-500 text-center">
                &copy; 2025 Company Name
            </div>
        </div>
    );
}

