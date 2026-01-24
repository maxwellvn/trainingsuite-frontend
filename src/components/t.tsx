"use client";

import { useTranslation } from '@/contexts/translation-context';
import { ElementType } from 'react';

interface TProps<C extends ElementType = 'span'> {
  children: string;
  as?: C;
  className?: string;
}

/**
 * Translation component - wraps text for automatic translation
 * 
 * Usage:
 *   <T>Welcome to our platform</T>
 *   <T as="h1" className="text-2xl">Page Title</T>
 */
export function T<C extends ElementType = 'span'>({ 
  children, 
  as, 
  className 
}: TProps<C>) {
  // Include translationVersion to force re-render when translations arrive
  const { t, translationVersion } = useTranslation();
  const Component = as || 'span';
  
  // The translationVersion is used implicitly to trigger re-renders
  // when new translations are fetched from the API
  return <Component className={className} data-tv={translationVersion}>{t(children)}</Component>;
}

/**
 * Hook for translating text with automatic re-renders
 * Use this when you need to translate text in JSX attributes or variables
 * 
 * Usage:
 *   const { translate } = useT();
 *   return <img alt={translate("Profile picture")} />
 */
export function useT() {
  const { t, translationVersion, isTranslating, language } = useTranslation();
  
  // Return translate function and useful state
  // Components using this hook will re-render when translationVersion changes
  return {
    translate: t,
    t, // alias
    isTranslating,
    language,
    translationVersion,
  };
}

/**
 * Hook for translating multiple texts at once
 * Useful for translating page content on load
 */
export { useTranslation, usePageTranslation } from '@/contexts/translation-context';
