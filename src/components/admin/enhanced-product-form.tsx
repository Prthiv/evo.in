'use client'

import { useActionState, useState, useEffect, useTransition } from 'react';
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
import { Wand2, Loader2, Save, UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import { generatePosterDescription } from '@/ai/flows/generate-poster-descriptions';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

// Define type for action state
interface ActionState {
  errors?: Record<string, string[]>;
}

// Define CATEGORIES type
const CATEGORIES_LIST = CATEGORIES as [string, ...string[]];

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

interface EnhancedProductFormProps {
  product?: Product;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
      {pending ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Product')}
    </Button>
  );
}

export function EnhancedProductForm({ product }: EnhancedProductFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState<ActionState, FormData>(upsertProduct, { errors: {} });
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [isPending, startTransition] = useTransition();
  const isEditing = !!product;

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(product?.images?.map(img => img.url) || []);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

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

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      previewImages.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewImages]);

  // Handle server-side errors
  useEffect(() => {
    if (state.errors) {
      Object.entries(state.errors).forEach(([key, errors]) => {
        const field = key as keyof ProductFormValues;
        if (errors?.[0]) {
          form.setError(field, { type: 'manual', message: errors[0] });
        }
      });
    }
  }, [state.errors, form]);

  const onDrop = (acceptedFiles: File[]) => {
    // Filter files by size (5MB limit) and limit to 5 images
    const validFiles = acceptedFiles
      .filter(file => file.size < 5 * 1024 * 1024)
      .slice(0, 5 - (imageFiles.length + existingImageUrls.length));

    if (validFiles.length === 0) {
      form.setError('root', { type: 'manual', message: 'No valid images selected or limit reached (max 5 images)' });
      return;
    }

    // Combine with existing files and ensure uniqueness
    const combinedFiles = [...imageFiles, ...validFiles];
    const uniqueFiles = Array.from(new Map(combinedFiles.map(f => [f.name, f])).values());

    setImageFiles(uniqueFiles);

    // Create preview URLs safely
    try {
      const newPreviews = validFiles.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...newPreviews]);
    } catch (error) {
      console.error('Error creating preview URLs:', error);
      form.setError('root', { type: 'manual', message: 'Failed to create image previews' });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
    maxFiles: 5,
  });

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]);
      return newPreviews.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (url: string) => {
    setExistingImageUrls(prev => prev.filter(item => item !== url));
  };

  const handleGenerateDescription = async () => {
    const { name, category, tags } = form.getValues();
    if (!name || !category) {
      form.setError('description', { type: 'manual', message: 'Please provide a name and category first.' });
      return;
    }

    setIsGenerating(true);
    form.setValue('description', 'Generating description with AI...');

    try {
      const result = await generatePosterDescription({
        title: name,
        category: category,
        keywords: tags || '',
      });
      form.setValue('description', result.description);
      form.clearErrors('description');
    } catch (error) {
      console.error('Failed to generate description:', error);
      form.setValue('description', product?.description || '');
      form.setError('description', {
        type: 'manual',
        message: 'Failed to generate description. Please try again or enter manually.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = (data: ProductFormValues) => {
    startTransition(() => {
      const formData = new FormData();
      formData.append('id', data.id || '');
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', data.price.toString());
      formData.append('category', data.category);
      formData.append('stock', data.stock.toString());
      formData.append('tags', data.tags || '');
      formData.append('isTrending', data.isTrending ? 'on' : '');
      existingImageUrls.forEach(url => formData.append('existingImages', url));
      imageFiles.forEach(file => formData.append('newImages', file));

      // Call formAction with formData
      formAction(formData);
    });
  };

  const allImages = [...existingImageUrls, ...previewImages];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </CardTitle>
          <CardDescription>
            {isEditing ? 'Update your product details and images.' : 'Fill in the details below to add a new product to your store.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="images">Images</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
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
                              {CATEGORIES_LIST.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Description</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleGenerateDescription}
                            disabled={isGenerating}
                            aria-label="Generate description with AI"
                          >
                            {isGenerating ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Wand2 className="mr-2 h-4 w-4" />
                            )}
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

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (₹)</FormLabel>
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
                        <FormLabel>Tags (comma-separated)</FormLabel>
                        <FormControl>
                          <Input placeholder="jdm, car, space, drift" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="images" className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormLabel>Product Images</FormLabel>
                      <Badge variant="secondary">{allImages.length} images</Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {existingImageUrls.map((url, index) => (
                        <div key={`existing-${url}`} className="relative aspect-square group">
                          <Image
                            src={url}
                            alt={`Product image ${index + 1}`}
                            width={500}
                            height={500}
                            className="w-full h-full object-cover rounded-md border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeExistingImage(url)}
                            aria-label={`Remove existing image ${index + 1}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Badge className="absolute bottom-2 left-2 text-xs">Existing</Badge>
                        </div>
                      ))}
                      {previewImages.map((url, index) => (
                        <div key={`preview-${url}`} className="relative aspect-square group">
                          <Image
                            src={url}
                            alt={`New product image ${index + 1}`}
                            width={500}
                            height={500}
                            className="w-full h-full object-cover rounded-md border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeNewImage(index)}
                            aria-label={`Remove new image ${index + 1}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Badge className="absolute bottom-2 left-2 text-xs">New</Badge>
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
                        <p className="text-xs text-muted-foreground">Drag & drop or click (max 5)</p>
                      </div>
                    </div>

                    {form.formState.errors.root && (
                      <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>
                    )}
                    {state?.errors?.newImages && (
                      <p className="text-sm font-medium text-destructive">{state.errors.newImages[0]}</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                  <FormField
                    control={form.control}
                    name="isTrending"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Trending Product</FormLabel>
                          <p className="text-sm text-muted-foreground">Feature this product on the homepage.</p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            name="isTrending"
                            aria-label="Toggle trending product"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Product Preview</h4>
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <div className="flex items-center gap-4">
                        {allImages[0] && (
                          <Image
                            src={allImages[0]}
                            alt="Preview"
                            width={60}
                            height={60}
                            className="rounded-md object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium">{form.watch('name') || 'Product Name'}</h3>
                          <p className="text-sm text-muted-foreground">{form.watch('category') || 'Category'}</p>
                          <p className="text-sm font-medium">₹{form.watch('price') || '0'}</p>
                          {form.watch('isTrending') && <Badge className="mt-1">Trending</Badge>}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <SubmitButton isEditing={isEditing} />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}