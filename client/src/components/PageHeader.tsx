import React, { ReactNode } from 'react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/TranslationContext';
import { ClipboardCheck } from 'lucide-react';

// Standard button class for PageHeader action buttons
export const headerButtonClass = "w-full md:w-auto bg-white hover:bg-white/90 text-[#E51636] flex items-center justify-center gap-2 py-2 px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm border border-white/20";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  showBackButton?: boolean;
  className?: string;
  containerClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  actionsClassName?: string;
  icon?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  showBackButton = false,
  className,
  containerClassName,
  titleClassName,
  subtitleClassName,
  actionsClassName,
  icon = <ClipboardCheck className="h-5 w-5" />
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className={cn(
      'bg-gradient-to-br from-[#E51636] to-[#D01530] rounded-[20px] p-4 md:p-6 text-white shadow-md',
      className
    )}>
      <div className={cn(
        'flex flex-col md:flex-row md:items-center md:justify-between gap-4',
        containerClassName
      )}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner">
            {icon}
          </div>
          <div>
            <h1 className={cn(
              'text-xl md:text-2xl font-bold tracking-tight',
              titleClassName
            )}>
              {title}
            </h1>
            {subtitle && (
              <div className={cn(
                'text-white/90 text-sm md:text-base',
                subtitleClassName
              )}>
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {(showBackButton || actions) && (
          <div className="w-full md:w-auto flex flex-col md:flex-row gap-2">
            {showBackButton && (
              <Button
                className={headerButtonClass}
                onClick={() => navigate(-1)}
              >
                {t('common.back')}
              </Button>
            )}
            
            {actions && (
              <div className={cn(
                'w-full md:w-auto',
                actionsClassName
              )}>
                {actions}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;