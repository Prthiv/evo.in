
'use client'

import * as React from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye } from 'lucide-react';
import type { Order, OrderStatus } from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';


const statusStyles: Record<OrderStatus, string> = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Processing: "bg-blue-100 text-blue-800 border-blue-200",
    Shipped: "bg-green-100 text-green-800 border-green-200",
    Delivered: "bg-primary/20 text-primary border-primary/30",
    Cancelled: "bg-red-100 text-red-800 border-red-200",
}

interface OrdersTableProps {
  data: Order[];
}


export function OrdersTable({ data }: OrdersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium text-primary">{order.id}</TableCell>
            <TableCell>{order.customerEmail}</TableCell>
            <TableCell>
              {format(new Date(order.createdAt), 'MMM d, yyyy')}
            </TableCell>
            <TableCell>
              <Badge variant="outline" className={cn("capitalize", statusStyles[order.status])}>
                {order.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">₹{order.total.toFixed(2)}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href={`/studio/orders/${order.id}`}><Eye className="mr-2 h-4 w-4" />View Details</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
