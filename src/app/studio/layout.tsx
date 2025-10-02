'use client';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Home, Package, ShoppingCart, PanelLeft, LayoutDashboard, Tag, Gift, Percent } from "lucide-react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/icons";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    
    const navItems = [
        { href: '/studio', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { href: '/studio/homepage', label: 'Homepage', icon: Home },
        { href: '/studio/categories', label: 'Categories', icon: Tag },
        { href: '/studio/products', label: 'Products', icon: Package },
        { href: '/studio/bundles', label: 'Bundles', icon: Gift },
        { href: '/studio/pricing', label: 'Pricing', icon: Percent },
        { href: '/studio/orders', label: 'Orders', icon: ShoppingCart },
    ];

    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-muted/40">
                <Sidebar>
                    <SidebarContent>
                        <SidebarHeader className="border-b">
                            <Logo />
                        </SidebarHeader>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton 
                                        isActive={item.exact ? pathname === item.href : pathname.startsWith(item.href)} 
                                        asChild
                                    >
                                        <a href={item.href}>
                                            <item.icon className="h-4 w-4" />
                                            <span className="font-body">{item.label}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <a href="/">
                                        <Home className="h-4 w-4" />
                                        <span className="font-body">Back to Store</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>
                </Sidebar>
                <div className="flex-1 flex flex-col">
                    <main className="p-4 sm:p-6 flex-1">{children}</main>
                </div>
            </div>
        </SidebarProvider>
    );
}