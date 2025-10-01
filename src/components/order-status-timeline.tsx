
'use client'

import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";
import { CheckCircle, Circle, Package, Truck, Home } from "lucide-react";

const statuses: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const statusIcons = {
    Pending: Circle,
    Processing: Package,
    Shipped: Truck,
    Delivered: Home
};

export function OrderStatusTimeline({ currentStatus }: { currentStatus: OrderStatus }) {
    const currentIndex = statuses.indexOf(currentStatus);

    return (
        <div className="w-full">
            <div className="flex justify-between items-center relative">
                <div className="absolute left-0 top-1/2 w-full h-0.5 bg-muted -translate-y-1/2" />
                <div className="absolute left-0 top-1/2 h-0.5 bg-primary -translate-y-1/2 transition-all duration-500" style={{width: `${(currentIndex / (statuses.length - 1)) * 100}%`}} />

                {statuses.map((status, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const Icon = statusIcons[status];

                    return (
                        <div key={status} className="z-10 text-center">
                            <div className={cn(
                                "mx-auto w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                isCompleted ? "bg-primary border-primary text-primary-foreground" :
                                isCurrent ? "bg-primary/20 border-primary text-primary" :
                                "bg-muted border-border text-muted-foreground"
                            )}>
                                {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6"/>}
                            </div>
                            <p className={cn(
                                "text-xs md:text-sm mt-2 font-medium",
                                isCurrent || isCompleted ? "text-foreground" : "text-muted-foreground"
                            )}>
                                {status}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
