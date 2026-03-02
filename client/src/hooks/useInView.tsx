import { useEffect, useState, useRef } from 'react';

type InViewOptions = {
    rootMargin?: string;
    threshold?: number | number[];
    once?: boolean;
};

export function useInView(options: InViewOptions = {}) {
    const { rootMargin = '0px', threshold = 0.1, once = false } = options;
    const [isInView, setIsInView] = useState(false);
    const ref = useRef<any>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                const isIntersecting = entry.isIntersecting;
                setIsInView(isIntersecting);
                if (isIntersecting && once && ref.current) {
                    observer.unobserve(ref.current);
                }
            },
            { rootMargin, threshold }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [rootMargin, threshold, once]);

    return { ref, isInView };
}
