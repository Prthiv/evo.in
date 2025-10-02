import { getAllPricingRules, getAllCoupons } from "@/lib/data-async";
import { PricingManagementClient } from "@//components/admin/pricing-management-client";

export default async function StudioPricingPage() {
    const pricingRules = await getAllPricingRules();
    const coupons = await getAllCoupons();

    return (
        <PricingManagementClient 
            initialPricingRules={pricingRules}
            initialCoupons={coupons}
        />
    );
}