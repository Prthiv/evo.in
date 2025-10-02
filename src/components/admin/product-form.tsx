
'use client'

import { useActionState, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { upsertProduct } from '@/lib/actions-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Product } from '@/lib/types';
import { CATEGORIES } from '@/lib/constants';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Wand2, Loader2, Save, UploadCloud, X } from 'lucide-react';
import { generatePosterDescription } from '@/ai/flows/generate-poster-descriptions';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';

// Convert Category enum to string array for Zod enum validation
const CATEGORIES_LIST = CATEGORIES.map(category => category) as [string, ...string[]];

const productFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  category: z.enum(CATEGORIES_LIST),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  tags: z.string().optional(),
  isTrending: z.boolean().default(false),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
      {pending ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Product')}
    </Button>
  );
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState<any, FormData>(upsertProduct, { errors: {} });
  const [isGenerating, setIsGenerating] = useState(false);
  const isEditing = !!product;
  
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(product?.images.map(img => img.url) || []);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      id: product?.id,
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      category: product?.category || CATEGORIES[0],
      stock: product?.stock || 0,
      tags: product?.tags?.join(', ') || '',
      isTrending: product?.isTrending || false,
    },
  });

  useEffect(() => {
    if (state?.errors) {
      const validFields = ['id', 'name', 'description', 'category', 'price', 'stock', 'tags', 'isTrending'];
      
      Object.keys(state.errors).forEach((key) => {
        // Skip newImages and form errors as they're handled separately
        if (key === 'newImages' || key === 'form') return;
        
        // Only process valid field names
        if (validFields.includes(key)) {
          const messages = state.errors[key];
          if (messages && messages.length > 0) {
            form.setError(key as keyof ProductFormValues, { type: 'manual', message: messages[0] });
          }
        }
      });
    }
  }, [state, form]);

  const onDrop = (acceptedFiles: File[]) => {
    const combinedFiles = [...imageFiles, ...acceptedFiles];
    const uniqueFiles = Array.from(new Set(combinedFiles.map(f => f.name))).map(name => {
        return combinedFiles.find(f => f.name === name)!;
    });

    setImageFiles(uniqueFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
  });

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  }
  
  const removeExistingImage = (url: string) => {
    setExistingImageUrls(prev => prev.filter(u => u !== url));
  }

  const handleGenerateDescription = async () => {
    const { name, category, tags } = form.getValues();
    if (!name || !category) {
        form.setError("description", { type: "manual", message: "Please provide a name and category first."});
        return;
    }
    
    setIsGenerating(true);
    form.setValue("description", "Generating description with AI...");
    try {
        const result = await generatePosterDescription({
            title: name,
            category: category,
            keywords: tags || '',
        });
        form.setValue("description", result.description);
        form.clearErrors("description");
    } catch (error) {
        console.error("Failed to generate description:", error);
        form.setValue("description", product?.description || '');
        form.setError("description", { type: "manual", message: "Failed to generate description. Please try again."});
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-8">
        <input type="hidden" name="id" value={product?.id || ''} />
        {existingImageUrls.map((url) => (
            <input type="hidden" key={url} name="existingImages" value={url} />
        ))}
        
        <div className="grid md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Cosmic Drift JDM" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <FormItem>
            <FormLabel>Product Images</FormLabel>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                     {existingImageUrls.map((url) => (
                        <div key={url} className="relative aspect-square group">
                            <Image 
                              src={url} 
                              alt="Product image" 
                              fill 
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                              className="object-cover rounded-md border" 
                            />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeExistingImage(url)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                     ))}
                     {imageFiles.map((file, index) => (
                        <div key={file.name} className="relative aspect-square group">
                            <Image 
                              src={URL.createObjectURL(file)} 
                              alt="Product image" 
                              fill 
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                              className="object-cover rounded-md border" 
                            />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeNewImage(index)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                     ))}
                     <div
                        {...getRootProps()}
                        className={cn(
                        'aspect-square w-full rounded-md border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition-colors',
                        isDragActive && 'border-primary bg-primary/10'
                        )}
                    >
                        <input {...getInputProps({ name: 'newImages' })} />
                        <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm">Add images</p>
                    </div>
                </div>
                {state?.errors?.newImages && Array.isArray(state.errors.newImages) && state.errors.newImages.length > 0 && (
                  <p className="text-sm font-medium text-destructive">{state.errors.newImages[0]}</p>
                )}

        </FormItem>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
                <div className="flex items-center justify-between">
                    <FormLabel>Description</FormLabel>
                    <Button type="button" variant="ghost" size="sm" onClick={handleGenerateDescription} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Generate with AI
                    </Button>
                </div>
              <FormControl>
                <Textarea placeholder="A stunning visual of a classic JDM car..." className="min-h-[120px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid md:grid-cols-2 gap-8">
             <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (Base)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="79" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
             <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input placeholder="jdm, car, space, drift" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
            control={form.control}
            name="isTrending"
            render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">
                            Trending Product
                        </FormLabel>
                         <p className="text-sm text-muted-foreground">
                            Feature this product on the homepage.
                        </p>
                    </div>
                    <FormControl>
                       <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        name="isTrending"
                        />
                    </FormControl>
                </FormItem>
            )}
        />

        <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <SubmitButton isEditing={isEditing} />
        </div>
      </form>
    </Form>
  );
}
