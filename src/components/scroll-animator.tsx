'use client'

import { useRef, useEffect, useState, Children, cloneElement, isValidElement } from "react";
import { cn } from "@/lib/utils";

interface ScrollAnimatorProps {
    children: React.ReactNode;
}

export function ScrollAnimator({ children }: ScrollAnimatorProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            {
                threshold: 0.1, // Trigger when 10% of the element is visible
            }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);
    
    const addAnimationToTree = (node: React.ReactNode, index: number = 0): React.ReactNode => {
        return Children.map(node, (child, childIndex) => {
            if (isValidElement(child)) {
                // Ensure we don't override the component's own animation logic
                if (child.props.className?.includes('fade-in-up')) {
                    return child;
                }

                let newClassName = child.props.className || '';
                let newStyle = child.props.style || {};

                // Check if the element is a candidate for animation
                const isAnimatable = typeof child.type === 'string' && (
                    ['h1', 'h2', 'h3', 'p', 'div'].includes(child.type) || 
                    child.props.className?.includes('grid') || 
                    child.props.className?.includes('group')
                );

                 if (isAnimatable) {
                     newClassName = cn(child.props.className, 'fade-in-up');
                     // Stagger animations for direct children
                     newStyle = { ...child.props.style, animationDelay: `${index * 100 + childIndex * 50}ms` };
                }

                // If it has children, recurse
                if (child.props.children) {
                    const newChildren = addAnimationToTree(child.props.children, childIndex);
                    return cloneElement(child, { className: newClassName, style: newStyle }, newChildren);
                }
                
                return cloneElement(child, { className: newClassName, style: newStyle });
            }
            return child;
        });
    };

    return (
        <div ref={ref} className={cn('transition-opacity duration-500', isVisible ? 'opacity-100' : 'opacity-0')}>
            {isVisible ? addAnimationToTree(children) : children}
        </div>
    );
}
