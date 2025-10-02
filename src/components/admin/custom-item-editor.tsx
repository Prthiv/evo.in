
'use client';

import { useFormContext } from 'react-hook-form';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { POSTER_SIZES, FRAME_OPTIONS } from '@/lib/constants';
import { UploadCloud, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

const customItemSchema = z.object({
  image: z.any().refine(file => file, 'Please upload an image.'),
  preview: z.string().min(1, 'Please upload an image.'),
  productType: z.enum(['poster', 'framed']),
  size: z.enum(['A4', 'A3']),
});

const customOrderSchema = z.object({
  items: z.array(customItemSchema).min(1, "Please configure at least one item."),
});

type CustomOrderValues = z.infer<typeof customOrderSchema>;

export function CustomItemEditor({ 
    index,
    totalItems,
    onBack,
    onNavigate
}: { 
    index: number, 
    totalItems: number,
    onBack?: () => void,
    onNavigate: (newIndex: number) => void
}) {
    const { control, setValue, watch, trigger } = useFormContext<CustomOrderValues>();
    const item = watch(`items.${index}`);
    const isMobile = useIsMobile();

    const onDrop = (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setValue(`items.${index}.image`, file, { shouldValidate: true, shouldDirty: true });
            setValue(`items.${index}.preview`, previewUrl, { shouldValidate: true, shouldDirty: true });
            trigger(`items.${index}.preview`);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1,
    });
    
    const removeImage = () => {
        const currentPreview = watch(`items.${index}.preview`);
        if (currentPreview) {
            URL.revokeObjectURL(currentPreview);
        }
        setValue(`items.${index}.image`, null, { shouldValidate: true });
        setValue(`items.${index}.preview`, '', { shouldValidate: true });
    };

    const calculatePrice = () => {
        if (!item?.size) return 0;
        let price = POSTER_SIZES[item.size].price;
        if (item.productType === 'framed') {
            const frame = FRAME_OPTIONS.find(f => f.size === item.size);
            price += frame?.price || 0;
        }
        return price;
    }
    
    const handleNext = async () => {
        const isValid = await trigger(`items.${index}`);
        if(isValid) {
            onNavigate(index + 1);
        }
    }
    
    const EditorContent = (
        <div className='flex flex-col h-full'>
            {isMobile && onBack && (
                 <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" size="icon" onClick={onBack} type="button">
                        <ArrowLeft />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-headline">Editing Item #{index + 1}</h2>
                    </div>
                </div>
            )}
            <ScrollArea className="flex-1 pr-6 -mr-6">
                <div className={cn("grid gap-8 pr-1", isMobile ? "grid-cols-1" : "grid-cols-2")}>
                    <div className='w-full'>
                        <FormField
                        control={control}
                        name={`items.${index}.preview`}
                        render={() => (
                            <FormItem>
                            <FormLabel>Upload Image</FormLabel>
                            <FormControl>
                                {item.preview ? (
                                <div className="relative aspect-square w-full rounded-md border overflow-hidden">
                                    <Image 
                                       src={item.preview} 
                                       alt={`Preview ${index + 1}`} 
                                       fill 
                                       sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                       className="object-contain" 
                                     />
                                    <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-8 w-8"
                                    onClick={removeImage}
                                    >
                                    <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                ) : (
                                <div
                                    {...getRootProps()}
                                    className={cn(
                                    'aspect-square w-full rounded-md border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition-colors',
                                    isDragActive && 'border-primary bg-primary/10'
                                    )}
                                >
                                    <input {...getInputProps()} />
                                    <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p>Drag & drop or click to select</p>
                                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP</p>
                                </div>
                                )}
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                    <div className="space-y-6 w-full">
                        <FormField
                            control={control}
                            name={`items.${index}.productType`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Product Type</FormLabel>
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-4">
                                    <FormItem>
                                        <FormControl>
                                            <RadioGroupItem value="poster" id={`type-poster-${index}`} className="sr-only" />
                                        </FormControl>
                                        <Label 
                                            htmlFor={`type-poster-${index}`} 
                                            className="border rounded-md p-4 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-primary has-[:checked]:shadow-lg"
                                        >
                                            <span className="font-bold">Poster Only</span>
                                        </Label>
                                    </FormItem>
                                    <FormItem>
                                        <FormControl>
                                            <RadioGroupItem value="framed" id={`type-framed-${index}`} className="sr-only" />
                                        </FormControl>
                                        <Label 
                                            htmlFor={`type-framed-${index}`} 
                                            className="border rounded-md p-4 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-primary has-[:checked]:shadow-lg"
                                        >
                                            <span className="font-bold">Poster + Frame</span>
                                        </Label>
                                    </FormItem>
                                </RadioGroup>
                                <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                        control={control}
                        name={`items.${index}.size`}
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Size</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a size" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                <SelectItem value="A4">A4</SelectItem>
                                <SelectItem value="A3">A3</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage/>
                            </FormItem>
                        )}
                        />
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Item Price</p>
                            <p className="font-bold text-xl">₹{calculatePrice().toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );

    const EditorFooter = (
        <div className="mt-auto pt-6 border-t flex-row justify-between sm:justify-between flex items-center">
            <Button type="button" variant="outline" onClick={() => onNavigate(index - 1)} disabled={index === 0}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            
            {index < totalItems - 1 ? (
                <Button type="button" onClick={handleNext}>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            ) : (
                <Button type="button" onClick={() => onNavigate(-1)}>Done</Button>
            )}
        </div>
    );
    
    if (isMobile) {
        return (
            <div className="h-full flex flex-col">
                {EditorContent}
                {EditorFooter}
            </div>
        )
    }

    // Desktop Dialog Layout - Footer is now handled in the parent component
    return EditorContent;
}
