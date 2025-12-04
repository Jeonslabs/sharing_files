import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Sidebar from '../components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Contract Management',
    description: 'Internal app for recurring contracts',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ko">
            <body className={inter.className}>
                <div className="flex min-h-screen bg-gray-100">
                    {/* Sidebar */}
                    <Sidebar />

                    {/* Main Content Area */}
                    <div className="flex-1 ml-64 flex flex-col transition-all duration-300">
                        {/* Top Header */}
                        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8">
                            <h2 className="text-lg font-semibold text-gray-800">계약 관리 시스템</h2>
                            <div className="flex items-center space-x-4">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                                    A
                                </div>
                                <span className="text-sm text-gray-600">Admin</span>
                            </div>
                        </header>

                        {/* Page Content */}
                        <main className="flex-grow p-8 overflow-y-auto">
                            {children}
                        </main>
                    </div>
                </div>
            </body>
        </html>
    )
}
