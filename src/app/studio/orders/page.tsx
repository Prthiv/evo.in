
import { getAllOrders } from "@/lib/data";
import { OrdersTable } from "@/components/admin/orders-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function StudioOrdersPage() {
  const orders = getAllOrders();

  return (
    <Card>
      <CardHeader>
        <div>
            <CardTitle>Orders</CardTitle>
            <CardDescription>
              View and manage all customer orders.
            </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <OrdersTable data={orders} />
      </CardContent>
    </Card>
  );
}
