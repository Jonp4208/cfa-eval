import React, { ReactNode } from 'react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/TranslationContext';
import { ClipboardCheck } from 'lucide-react';

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
      'bg-gradient-to-br from-[#E51636] to-[#D01530] rounded-[20px] p-3 md:p-6 text-white shadow-md',
      className
    )}>
      <div className={cn(
        'flex flex-col gap-2 sm:gap-4',
        containerClassName
      )}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner">
              {icon}
            </div>
            <div>
              <h1 className={cn(
                'text-lg md:text-2xl font-bold tracking-tight',
                titleClassName
              )}>
                {title}
              </h1>
              {subtitle && (
                <p className={cn(
                  'text-white/90 text-sm md:text-base',
                  subtitleClassName
                )}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {showBackButton && (
            <Button
              className="bg-white hover:bg-white/90 text-[#E51636] flex items-center justify-center gap-2 py-2 px-3 sm:px-4 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm border border-white/20"
              onClick={() => navigate(-1)}
            >
              {t('common.back')}
            </Button>
          )}
          
          {actions && (
            <div className={cn(
              'flex items-center gap-2',
              actionsClassName
            )}>
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;