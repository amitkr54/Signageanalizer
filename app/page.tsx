import { AnalysisFlow } from "@/components/AnalysisFlow";
import { Shield, Zap, FileText, Settings, LayoutDashboard, Database } from "lucide-react";

export default function HomePage() {
    return (
        <main className="min-h-screen relative overflow-hidden flex flex-col">
            {/* Background elements */}
            <div className="fixed inset-0 blueprint-grid pointer-events-none opacity-20" />
            <div className="fixed inset-0 bg-gradient-to-t from-charcoal-900 to-transparent pointer-events-none" />

            {/* Header / Nav */}
            <header className="relative z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl px-6 py-4">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-hazard-orange rounded-xl flex items-center justify-center shadow-lg shadow-hazard-orange/20 animate-pulse-slow">
                            <Shield className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-white">FIRE SAFETY</h1>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-hazard-orange font-bold">Signage Analyzer</p>
                        </div>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        {[
                            { icon: LayoutDashboard, label: 'Dashboard' },
                            { icon: Database, label: 'Projects' },
                            { icon: Zap, label: 'Quick Analysis' },
                            { icon: Settings, label: 'Settings' }
                        ].map((item, i) => (
                            <a key={i} href="#" className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors group">
                                <item.icon className="w-4 h-4 group-hover:text-hazard-orange transition-colors" />
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-400">
                            JD
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 relative z-10 container mx-auto px-4 py-12 flex flex-col items-center">
                <div className="text-center mb-16 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hazard-orange/10 border border-hazard-orange/20 text-hazard-orange text-[10px] font-bold uppercase tracking-widest mb-4">
                        <Zap className="w-3 h-3" /> AI Engine Integrated
                    </div>
                    <h2 className="text-5xl font-extrabold text-white mb-6 leading-tight">
                        Compliance Analysis for <span className="text-transparent bg-clip-text bg-gradient-to-r from-hazard-orange to-amber-400">Modern Architecture</span>
                    </h2>
                    <p className="text-lg text-slate-400 leading-relaxed">
                        Precision-engineered AI for detecting room types, egress paths, and safety compliance in architectural PDF floor plans.
                    </p>
                </div>

                <div className="w-full max-w-5xl">
                    <AnalysisFlow />
                </div>

                {/* Quick Info Grid */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
                    {[
                        { icon: FileText, title: "Intelligent PDF Parsing", desc: "Automated extraction of structural layers and room annotations." },
                        { icon: Shield, title: "NBC Compliance", desc: "Logic mapped directly to National Building Code 2016 safety standards." },
                        { icon: Zap, title: "Real-time Estimates", desc: "Neural networks process layouts and generate audits in seconds." }
                    ].map((feature, i) => (
                        <div key={i} className="glass-dark p-8 rounded-3xl group hover:border-hazard-orange/50 transition-all duration-500">
                            <div className="w-12 h-12 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                                <feature.icon className="w-6 h-6 text-hazard-orange" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-3 group-hover:text-hazard-orange transition-colors">{feature.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <footer className="relative z-10 mt-20 border-t border-white/5 py-10 px-6 bg-black/40 backdrop-blur-md">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-slate-500 text-xs font-medium tracking-wider uppercase">
                        &copy; 2026 SIGNAGEWORKS.IN • ARCHITECTURAL SAFETY DIVISION
                    </div>
                    <div className="flex gap-8 text-slate-400 text-xs font-semibold">
                        <a href="#" className="hover:text-white transition-colors">Privacy Protocols</a>
                        <a href="#" className="hover:text-white transition-colors">Compliance Standards</a>
                        <a href="#" className="hover:text-white transition-colors">AI Research</a>
                    </div>
                </div>
            </footer>
        </main>
    );
}
