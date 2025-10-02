'use client';

import React, { useActionState, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save, Trash2, PlusCircle, Loader2, Percent, IndianRupee, Gift, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { PricingRule, Coupon } from '@/lib/types';

// Import actions directly
import { 
  createPricingRuleAction, 
  updatePricingRuleAction, 
  deletePricingRuleAction,
  createCouponAction,
  updateCouponAction,
  deleteCouponAction
} from '../../lib/actions-pricing';

interface PricingManagementClientProps {
    initialPricingRules: PricingRule[];
    initialCoupons: Coupon[];
}

function SubmitButton({ label = 'Save Changes', isLoading = false }: { label?: string; isLoading?: boolean }) {
    return (
        <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isLoading ? 'Saving...' : label}
        </Button>
    )
}

const pricingRuleSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    ruleType: z.enum(['percentage_discount', 'fixed_amount', 'buy_x_get_y', 'free_shipping']),
    value: z.coerce.number().optional(),
    targetType: z.enum(['cart', 'product', 'category', 'bundle']),
    targetValue: z.string().optional(),
    minOrderValue: z.coerce.number().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isActive: z.boolean(),
    sortOrder: z.coerce.number().optional(),
});

const couponSchema = z.object({
    id: z.string().optional(),
    code: z.string().min(1, "Coupon code is required"),
    description: z.string().optional(),
    discountType: z.enum(['percentage', 'fixed_amount']),
    discountValue: z.coerce.number().min(0, "Discount value must be positive"),
    minOrderValue: z.coerce.number().optional(),
    usageLimit: z.coerce.number().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isActive: z.boolean(),
});

export function PricingManagementClient({ initialPricingRules, initialCoupons }: PricingManagementClientProps) {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('rules');
    const [isLoading, setIsLoading] = useState(false);
    const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

    // --- Pricing Rules Form ---
    const [rulesState, rulesAction] = useActionState(createPricingRuleAction, { success: false, errors: {} });
    const rulesForm = useForm<z.infer<typeof pricingRuleSchema>>({
        resolver: zodResolver(pricingRuleSchema),
        defaultValues: {
            id: '',
            name: '',
            description: '',
            ruleType: 'percentage_discount',
            value: undefined,
            targetType: 'cart',
            targetValue: '',
            minOrderValue: undefined,
            startDate: '',
            endDate: '',
            isActive: true,
            sortOrder: 0,
        }
    });

    // Reset form when editing rule changes
    useEffect(() => {
        if (editingRule) {
            rulesForm.reset({
                id: editingRule.id,
                name: editingRule.name || '',
                description: editingRule.description || '',
                ruleType: editingRule.ruleType || 'percentage_discount',
                value: editingRule.value,
                targetType: editingRule.targetType || 'cart',
                targetValue: editingRule.targetValue ? editingRule.targetValue.join(',') : '',
                minOrderValue: editingRule.minOrderValue,
                startDate: editingRule.startDate || '',
                endDate: editingRule.endDate || '',
                isActive: editingRule.isActive,
                sortOrder: editingRule.sortOrder || 0,
            });
        } else {
            rulesForm.reset({
                id: '',
                name: '',
                description: '',
                ruleType: 'percentage_discount',
                value: undefined,
                targetType: 'cart',
                targetValue: '',
                minOrderValue: undefined,
                startDate: '',
                endDate: '',
                isActive: true,
                sortOrder: 0,
            });
        }
    }, [editingRule, rulesForm]);

    useEffect(() => {
        if (rulesState.success) {
            toast({ title: editingRule ? "Pricing Rule Updated!" : "Pricing Rule Saved!", description: "Your changes have been saved." });
            rulesForm.reset({
                id: '',
                name: '',
                description: '',
                ruleType: 'percentage_discount',
                value: undefined,
                targetType: 'cart',
                targetValue: '',
                minOrderValue: undefined,
                startDate: '',
                endDate: '',
                isActive: true,
                sortOrder: 0,
            });
            setEditingRule(null);
        }
    }, [rulesState, toast, rulesForm, editingRule]);

    const onRulesSubmit = (data: z.infer<typeof pricingRuleSchema>) => {
        const formData = new FormData();
        if (data.id) formData.append('id', data.id);
        formData.append('name', data.name);
        if (data.description) formData.append('description', data.description);
        formData.append('ruleType', data.ruleType);
        if (data.value !== undefined) formData.append('value', data.value.toString());
        formData.append('targetType', data.targetType);
        if (data.targetValue) formData.append('targetValue', data.targetValue);
        if (data.minOrderValue !== undefined) formData.append('minOrderValue', data.minOrderValue.toString());
        if (data.startDate) formData.append('startDate', data.startDate);
        if (data.endDate) formData.append('endDate', data.endDate);
        formData.append('isActive', data.isActive ? 'on' : 'off');
        if (data.sortOrder !== undefined) formData.append('sortOrder', data.sortOrder.toString());
        
        rulesAction(formData);
    };

    // --- Coupons Form ---
    const [couponsState, couponsAction] = useActionState(createCouponAction, { success: false, errors: {} });
    const couponsForm = useForm<z.infer<typeof couponSchema>>({
        resolver: zodResolver(couponSchema),
        defaultValues: {
            id: '',
            code: '',
            description: '',
            discountType: 'percentage',
            discountValue: 0,
            minOrderValue: undefined,
            usageLimit: undefined,
            startDate: '',
            endDate: '',
            isActive: true,
        }
    });

    // Reset form when editing coupon changes
    useEffect(() => {
        if (editingCoupon) {
            couponsForm.reset({
                id: editingCoupon.id,
                code: editingCoupon.code || '',
                description: editingCoupon.description || '',
                discountType: editingCoupon.discountType || 'percentage',
                discountValue: editingCoupon.discountValue || 0,
                minOrderValue: editingCoupon.minOrderValue,
                usageLimit: editingCoupon.usageLimit,
                startDate: editingCoupon.startDate || '',
                endDate: editingCoupon.endDate || '',
                isActive: editingCoupon.isActive,
            });
        } else {
            couponsForm.reset({
                id: '',
                code: '',
                description: '',
                discountType: 'percentage',
                discountValue: 0,
                minOrderValue: undefined,
                usageLimit: undefined,
                startDate: '',
                endDate: '',
                isActive: true,
            });
        }
    }, [editingCoupon, couponsForm]);

    useEffect(() => {
        if (couponsState.success) {
            toast({ title: editingCoupon ? "Coupon Updated!" : "Coupon Saved!", description: "Your changes have been saved." });
            couponsForm.reset({
                id: '',
                code: '',
                description: '',
                discountType: 'percentage',
                discountValue: 0,
                minOrderValue: undefined,
                usageLimit: undefined,
                startDate: '',
                endDate: '',
                isActive: true,
            });
            setEditingCoupon(null);
        }
    }, [couponsState, toast, couponsForm, editingCoupon]);

    const onCouponsSubmit = (data: z.infer<typeof couponSchema>) => {
        const formData = new FormData();
        if (data.id) formData.append('id', data.id);
        formData.append('code', data.code);
        if (data.description) formData.append('description', data.description);
        formData.append('discountType', data.discountType);
        formData.append('discountValue', data.discountValue.toString());
        if (data.minOrderValue !== undefined) formData.append('minOrderValue', data.minOrderValue.toString());
        if (data.usageLimit !== undefined) formData.append('usageLimit', data.usageLimit.toString());
        if (data.startDate) formData.append('startDate', data.startDate);
        if (data.endDate) formData.append('endDate', data.endDate);
        formData.append('isActive', data.isActive ? 'on' : 'off');
        
        couponsAction(formData);
    };

    // --- Delete Actions ---
    const handleDeleteRule = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this pricing rule?')) {
            try {
                const result = await deletePricingRuleAction(id);
                if (result.success) {
                    toast({ title: "Pricing Rule Deleted!", description: "The pricing rule has been deleted." });
                } else {
                    toast({ title: "Error", description: result.error || "Failed to delete pricing rule.", variant: "destructive" });
                }
            } catch (error) {
                toast({ title: "Error", description: "Failed to delete pricing rule.", variant: "destructive" });
            }
        }
    };

    const handleDeleteCoupon = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            try {
                const result = await deleteCouponAction(id);
                if (result.success) {
                    toast({ title: "Coupon Deleted!", description: "The coupon has been deleted." });
                } else {
                    toast({ title: "Error", description: result.error || "Failed to delete coupon.", variant: "destructive" });
                }
            } catch (error) {
                toast({ title: "Error", description: "Failed to delete coupon.", variant: "destructive" });
            }
        }
    };

    // Get icons for rule types
    const getRuleTypeIcon = (ruleType: string) => {
        switch (ruleType) {
            case 'percentage_discount': return <Percent className="h-4 w-4" />;
            case 'fixed_amount': return <IndianRupee className="h-4 w-4" />;
            case 'buy_x_get_y': return <Gift className="h-4 w-4" />;
            case 'free_shipping': return <Truck className="h-4 w-4" />;
            default: return null;
        }
    };

    // Get display name for rule types
    const getRuleTypeName = (ruleType: string) => {
        switch (ruleType) {
            case 'percentage_discount': return 'Percentage Discount';
            case 'fixed_amount': return 'Fixed Amount Discount';
            case 'buy_x_get_y': return 'Buy X Get Y';
            case 'free_shipping': return 'Free Shipping';
            default: return ruleType;
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Pricing & Promotions</h1>
                    <p className="text-muted-foreground">Manage pricing rules and promotional coupons.</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                <Button
                    variant={activeTab === 'rules' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab('rules')}
                    className="flex-1"
                >
                    <Percent className="mr-2 h-4 w-4" />
                    Pricing Rules
                </Button>
                <Button
                    variant={activeTab === 'coupons' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab('coupons')}
                    className="flex-1"
                >
                    <Gift className="mr-2 h-4 w-4" />
                    Coupons
                </Button>
            </div>

            {/* Pricing Rules Section */}
            {activeTab === 'rules' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>{editingRule ? 'Edit Pricing Rule' : 'Create Pricing Rule'}</CardTitle>
                            <CardDescription>Set up dynamic pricing rules for your store.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...rulesForm}>
                                <form onSubmit={rulesForm.handleSubmit(onRulesSubmit)} className="space-y-4">
                                    {editingRule && (
                                        <input type="hidden" {...rulesForm.register('id')} />
                                    )}
                                    <FormField
                                        control={rulesForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., 10% Off Orders Over ₹1000" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    
                                    <FormField
                                        control={rulesForm.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Describe this pricing rule" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={rulesForm.control}
                                            name="ruleType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Rule Type</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value || 'percentage_discount'}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select rule type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="percentage_discount">Percentage Discount</SelectItem>
                                                            <SelectItem value="fixed_amount">Fixed Amount Discount</SelectItem>
                                                            <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
                                                            <SelectItem value="free_shipping">Free Shipping</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        
                                        <FormField
                                            control={rulesForm.control}
                                            name="targetType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Target Type</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value || 'cart'}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select target type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="cart">Cart</SelectItem>
                                                            <SelectItem value="product">Product</SelectItem>
                                                            <SelectItem value="category">Category</SelectItem>
                                                            <SelectItem value="bundle">Bundle</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    
                                    {(rulesForm.watch('ruleType') === 'percentage_discount' || 
                                      rulesForm.watch('ruleType') === 'fixed_amount' ||
                                      rulesForm.watch('ruleType') === 'buy_x_get_y') && (
                                        <FormField
                                            control={rulesForm.control}
                                            name="value"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        {rulesForm.watch('ruleType') === 'percentage_discount' ? 'Discount Percentage' : 
                                                         rulesForm.watch('ruleType') === 'fixed_amount' ? 'Discount Amount' : 
                                                         'Items to Get Free'}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                    
                                    {rulesForm.watch('ruleType') === 'buy_x_get_y' && (
                                        <FormField
                                            control={rulesForm.control}
                                            name="targetValue"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Number of Items to Buy</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="e.g., 3" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                    
                                    <FormField
                                        control={rulesForm.control}
                                        name="minOrderValue"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Minimum Order Value</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="e.g., 1000" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={rulesForm.control}
                                            name="startDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Start Date</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        
                                        <FormField
                                            control={rulesForm.control}
                                            name="endDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>End Date</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <FormField
                                            control={rulesForm.control}
                                            name="isActive"
                                            render={({ field }) => (
                                                <FormItem className="flex items-center space-x-2">
                                                    <FormControl>
                                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                    <FormLabel>Active</FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                        
                                        <FormField
                                            control={rulesForm.control}
                                            name="sortOrder"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Sort Order</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} value={field.value || 0} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <Button type="submit" className="flex-1">
                                            {editingRule ? (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Update Pricing Rule
                                                </>
                                            ) : (
                                                <>
                                                    <PlusCircle className="mr-2 h-4 w-4" />
                                                    Create Pricing Rule
                                                </>
                                            )}
                                        </Button>
                                        {editingRule && (
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => {
                                                    setEditingRule(null);
                                                    rulesForm.reset({
                                                        id: '',
                                                        name: '',
                                                        description: '',
                                                        ruleType: 'percentage_discount',
                                                        value: undefined,
                                                        targetType: 'cart',
                                                        targetValue: '',
                                                        minOrderValue: undefined,
                                                        startDate: '',
                                                        endDate: '',
                                                        isActive: true,
                                                        sortOrder: 0,
                                                    });
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Existing Pricing Rules</CardTitle>
                            <CardDescription>Manage your current pricing rules.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {initialPricingRules.map((rule) => (
                                    <Card key={rule.id} className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    {getRuleTypeIcon(rule.ruleType)}
                                                    <h3 className="font-semibold">{rule.name}</h3>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                                        {getRuleTypeName(rule.ruleType)}
                                                    </span>
                                                    {rule.minOrderValue && (
                                                        <span className="inline-flex items-center rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                                                            Min: ₹{rule.minOrderValue}
                                                        </span>
                                                    )}
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${rule.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {rule.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => setEditingRule(rule)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button 
                                                    variant="destructive" 
                                                    size="sm" 
                                                    onClick={() => handleDeleteRule(rule.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                                
                                {initialPricingRules.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No pricing rules found. Create your first rule!
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Coupons Section */}
            {activeTab === 'coupons' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</CardTitle>
                            <CardDescription>Set up promotional coupons for your customers.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...couponsForm}>
                                <form onSubmit={couponsForm.handleSubmit(onCouponsSubmit)} className="space-y-4">
                                    {editingCoupon && (
                                        <input type="hidden" {...couponsForm.register('id')} />
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={couponsForm.control}
                                            name="code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Coupon Code</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., WELCOME10" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        
                                        <FormField
                                            control={couponsForm.control}
                                            name="discountType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Discount Type</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value || 'percentage'}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select discount type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="percentage">Percentage</SelectItem>
                                                            <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    
                                    <FormField
                                        control={couponsForm.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Describe this coupon" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    
                                    <FormField
                                        control={couponsForm.control}
                                        name="discountValue"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {couponsForm.watch('discountType') === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} value={field.value || 0} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={couponsForm.control}
                                            name="minOrderValue"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Minimum Order Value</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="e.g., 500" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        
                                        <FormField
                                            control={couponsForm.control}
                                            name="usageLimit"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Usage Limit</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="e.g., 100" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={couponsForm.control}
                                            name="startDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Start Date</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        
                                        <FormField
                                            control={couponsForm.control}
                                            name="endDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>End Date</FormLabel>
                                                    <FormControl>
                                                        <Input type="date" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    
                                    <FormField
                                        control={couponsForm.control}
                                        name="isActive"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2">
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <FormLabel>Active</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    
                                    <div className="flex gap-2">
                                        <Button type="submit" className="flex-1">
                                            {editingCoupon ? (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Update Coupon
                                                </>
                                            ) : (
                                                <>
                                                    <PlusCircle className="mr-2 h-4 w-4" />
                                                    Create Coupon
                                                </>
                                            )}
                                        </Button>
                                        {editingCoupon && (
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => {
                                                    setEditingCoupon(null);
                                                    couponsForm.reset({
                                                        id: '',
                                                        code: '',
                                                        description: '',
                                                        discountType: 'percentage',
                                                        discountValue: 0,
                                                        minOrderValue: undefined,
                                                        usageLimit: undefined,
                                                        startDate: '',
                                                        endDate: '',
                                                        isActive: true,
                                                    });
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Existing Coupons</CardTitle>
                            <CardDescription>Manage your current promotional coupons.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {initialCoupons.map((coupon) => (
                                    <Card key={coupon.id} className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-lg bg-muted px-2 py-1 rounded">{coupon.code}</span>
                                                    <h3 className="font-semibold">{coupon.description}</h3>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : `₹${coupon.discountValue} off`}
                                                    </span>
                                                    {coupon.minOrderValue && (
                                                        <span className="inline-flex items-center rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                                                            Min: ₹{coupon.minOrderValue}
                                                        </span>
                                                    )}
                                                    {coupon.usageLimit && (
                                                        <span className="inline-flex items-center rounded-full bg-info/10 px-2.5 py-0.5 text-xs font-medium text-info-foreground">
                                                            {coupon.usedCount}/{coupon.usageLimit} used
                                                        </span>
                                                    )}
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {coupon.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => setEditingCoupon(coupon)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button 
                                                    variant="destructive" 
                                                    size="sm" 
                                                    onClick={() => handleDeleteCoupon(coupon.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                                
                                {initialCoupons.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No coupons found. Create your first coupon!
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}