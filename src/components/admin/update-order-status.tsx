
'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateOrderStatus } from '@/lib/actions';
import type { OrderStatus } from '@/lib/types';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const availableStatuses: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export function UpdateOrderStatus({ orderId, currentStatus }: { orderId: string, currentStatus: OrderStatus }) {
    const [status, setStatus] = useState(currentStatus);
    const [isUpdating, setIsUpdating] = useState(false);
    const { toast } = useToast();

    const handleUpdate = async () => {
        setIsUpdating(true);
        const result = await updateOrderStatus(orderId, status);
        setIsUpdating(false);

        if (result.success) {
            toast({
                title: "Status Updated",
                description: result.message,
            });
        } else {
             toast({
                variant: 'destructive',
                title: "Update Failed",
                description: result.error,
            });
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Update status..." />
                </SelectTrigger>
                <SelectContent>
                    {availableStatuses.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button onClick={handleUpdate} disabled={isUpdating || status === currentStatus}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update
            </Button>
        </div>
    )
}
