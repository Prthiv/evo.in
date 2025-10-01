
'use client';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Home, Package, ShoppingCart, PanelLeft, LayoutDashboard } from "lucide-react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/icons";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    
    const navItems = [
        { href: '/studio', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { href: '/studio/homepage', label: 'Homepage', icon: Home },
        { href: '/studio/products', label: 'Products', icon: Package },
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
                                        href={item.href} 
                                        isActive={item.exact ? pathname === item.href : pathname.startsWith(item.href)} 
                                        asChild
                                        disabled={item.disabled}
                                    >
                                        <a >
                                            <item.icon className="h-4 w-4" />
                                            <span className="font-body">{item.label}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            <SidebarMenuItem>
                                <SidebarMenuButton href="/" asChild>
                                    <a>
                                        <Home className="h-4 w-4" />
                                        <span className="font-body">Back to Store</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>
                </Sidebar>
                <div className="flex-1 flex flex-col">
                    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
                        <SidebarTrigger variant="outline" size="icon" className="shrink-0 md:hidden">
                            <PanelLeft className="h-5 w-5" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </SidebarTrigger>
                        <div className="flex-1">
                            <h1 className="font-headline text-lg">Studio</h1>
                        </div>
                    </header>
                    <main className="p-4 sm:p-6 flex-1">{children}</main>
                </div>
            </div>
        </SidebarProvider>
    );
}
