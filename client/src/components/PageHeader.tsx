import React, { ReactNode } from 'react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/TranslationContext';

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
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  showBackButton = true,
  className,
  containerClassName,
  titleClassName,
  subtitleClassName,
  actionsClassName
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className={cn(
      'bg-gradient-to-r from-[#E51636] to-[#DD0031] rounded-[20px] p-6 md:p-8 shadow-xl relative overflow-hidden',
      className
    )}>
      <div className={cn(
        'relative flex flex-col gap-4 md:gap-6',
        containerClassName
      )}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className={cn(
              'text-3xl md:text-[40px] font-bold text-white leading-tight',
              titleClassName
            )}>
              {title}
            </h1>
            {subtitle && (
              <p className={cn(
                'text-white/80 mt-2 text-base md:text-lg',
                subtitleClassName
              )}>
                {subtitle}
              </p>
            )}
          </div>
          {showBackButton && (
            <Button
              className="bg-white/10 text-white hover:bg-white/20 h-10 px-4 rounded-xl"
              onClick={() => navigate(-1)}
            >
              {t('common.back')}
            </Button>
          )}
        </div>
        {actions && (
          <div className={cn(
            'flex flex-col sm:flex-row gap-3 sm:gap-4',
            actionsClassName
          )}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;