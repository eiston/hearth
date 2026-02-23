"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface SlideToAcceptProps {
    onAccept: () => void;
    label?: string;
}

export function SlideToAccept({ onAccept, label = "Slide to Accept &rarr;" }: SlideToAcceptProps) {
    const [isSliding, setIsSliding] = useState(false);
    const [progress, setProgress] = useState(0);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        setIsSliding(true);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isSliding) return;
        const rect = e.currentTarget.parentElement?.getBoundingClientRect();
        if (!rect) return;

        let newProgress = ((e.clientX - rect.left) / rect.width) * 100;
        newProgress = Math.max(10, Math.min(newProgress, 100)); // clamp between thumb width and 100%
        setProgress(newProgress);

        if (newProgress > 95) {
            setIsSliding(false);
            onAccept();
        }
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        setIsSliding(false);
        if (progress <= 95) {
            setProgress(0); // Snap back if not completed
        }
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    return (
        <div className="relative bg-muted/60 h-14 rounded-full overflow-hidden border select-none group touch-none">
            <div
                className="absolute inset-y-0 left-0 bg-primary/20 transition-all"
                style={{ width: `${Math.max(progress, 0)}%`, transitionDuration: isSliding ? "0ms" : "300ms" }}
            />
            <div className="absolute inset-0 flex items-center justify-center font-medium pointer-events-none text-muted-foreground z-10 transition-colors group-hover:text-foreground">
                <span dangerouslySetInnerHTML={{ __html: label }} />
            </div>
            <div
                className={cn(
                    "absolute inset-y-1 left-1 bg-primary text-primary-foreground rounded-full w-12 flex items-center justify-center cursor-grab active:cursor-grabbing z-20 shadow-sm transition-all",
                    !isSliding && "duration-300"
                )}
                style={{ left: progress > 0 ? `calc(${progress}% - 3rem - 4px)` : "4px" }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
            >
                &rarr;
            </div>
        </div>
    );
}
