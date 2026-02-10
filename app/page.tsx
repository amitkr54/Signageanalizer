import { AnalysisFlow } from "@/components/AnalysisFlow";

export default function HomePage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        🏗️ Signage Analyzer
                    </h1>
                    <p className="text-xl text-gray-600">
                        AI-Powered Fire Safety Signage Requirements Generator
                    </p>
                </div>

                <AnalysisFlow />

                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-3xl mb-3">📄</div>
                        <h3 className="font-semibold mb-2">Upload PDF</h3>
                        <p className="text-sm text-gray-600">Upload your floor plan in PDF format</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-3xl mb-3">🤖</div>
                        <h3 className="font-semibold mb-2">AI Analysis</h3>
                        <p className="text-sm text-gray-600">AI detects rooms, exits, and elements</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="text-3xl mb-3">📊</div>
                        <h3 className="font-semibold mb-2">Get Report</h3>
                        <p className="text-sm text-gray-600">Download signage requirements report</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
