"use client";
import React from "react";

interface Block {
    key: string;
    name: string;
    icon: string;
    color: string;
    halls: string[];
    filled?: number;
    total?: number;
}

interface BlockCardsProps {
    blocks: Block[];
    activeBlock: string | null;
    onBlockSelect: (key: string) => void;
}

export default function BlockCards({ blocks, activeBlock, onBlockSelect }: BlockCardsProps) {
    return (
        <div className="mb-6">
            <div className="text-xs font-semibold uppercase tracking-widest mb-3 text-[var(--accent-primary)]">
                Select Block
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {blocks.map((block) => {
                    const pct = block.total ? Math.round((block.filled || 0) / block.total * 100) : 0;
                    const isActive = activeBlock === block.key;

                    return (
                        <div
                            key={block.key}
                            onClick={() => onBlockSelect(block.key)}
                            className={`block-card rounded-xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 relative overflow-hidden border-2 ${isActive ? "border-[#ffd700] block-card-active" : "border-white/10"
                                }`}
                        >
                            {/* Top color bar */}
                            <div className={`block-color-bar bg-${block.color || 'cyan'}-500`} />

                            <div className="text-2xl mb-2">{block.icon}</div>
                            <div className="font-semibold text-sm">{block.name}</div>
                            <div className="text-xs text-[var(--text-muted)] mt-1">
                                {block.halls?.length || 0} Halls
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-[var(--text-muted)]">
                                    {block.filled || 0}/{block.total || 0}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${pct > 50 ? 'block-pct-high' : 'block-pct-low'}`}>
                                    {pct}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
