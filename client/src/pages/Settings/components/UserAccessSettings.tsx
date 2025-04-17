// File: src/pages/Settings/components/UserAccessSettings.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from '@/contexts/TranslationContext';

interface UserAccessSettingsProps {
  settings: any;
  onUpdate: (section: string, settings: any) => void;
  isUpdating: boolean;
}

const UserAccessSettings = ({ settings, onUpdate, isUpdating }: UserAccessSettingsProps) => {
  const { t } = useTranslation();
  
  return (
    <Card className="bg-white rounded-[20px] shadow-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg text-[#27251F]">{t('settings.userAccess')}</CardTitle>
            <CardDescription className="text-[#27251F]/60">{t('settings.roleManagement')}</CardDescription>
          </div>
          <Button 
            variant="outline" 
            className="h-9 px-4 border-[#E51636] text-[#E51636] hover:bg-[#E51636] hover:text-white"
            onClick={() => onUpdate('resetToDefault', true)}
            disabled={isUpdating}
          >
            {t('settings.resetToDefault')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-[#FEF3F2] rounded-lg border border-[#FEE4E2]">
          <p className="text-sm text-[#B42318]">
            {t('settings.validationError')}
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full space-y-4">
          {/* Password Policy */}
          <AccordionItem value="password" className="border-b-0">
            <AccordionTrigger className="hover:no-underline py-4 text-[#27251F]">
              <div className="flex flex-col items-start gap-1">
                <span className="font-medium">{t('auth.password')}</span>
                <span className="text-sm font-normal text-[#27251F]/60">{t('settings.passwordRequirements')}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-sm font-medium text-[#27251F]">{t('auth.passwordMinLength')}</label>
                    <p className="text-sm text-[#27251F]/60">{t('auth.passwordLength')}</p>
                  </div>
                  <Select 
                    defaultValue={settings?.userAccess?.passwordPolicy?.minLength?.toString()}
                    onValueChange={(value) => 
                      onUpdate('passwordPolicy', { minLength: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="w-[180px] h-12 rounded-xl border-gray-200">
                      <SelectValue placeholder={t('settings.minLength')} />
                    </SelectTrigger>
                    <SelectContent>
                      {[8, 10, 12, 14, 16].map((length) => (
                        <SelectItem key={length} value={length.toString()}>
                          {length} {t('settings.characters')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-sm font-medium text-[#27251F]">{t('settings.requireNumbers')}</label>
                    <p className="text-sm text-[#27251F]/60">{t('settings.requireNumbersDescription')}</p>
                  </div>
                  <Switch 
                    checked={settings?.userAccess?.passwordPolicy?.requireNumbers}
                    onCheckedChange={(checked) => 
                      onUpdate('passwordPolicy', { requireNumbers: checked })
                    }
                    className="data-[state=checked]:bg-[#E51636]"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-sm font-medium text-[#27251F]">{t('settings.requireSpecialChars')}</label>
                    <p className="text-sm text-[#27251F]/60">{t('settings.requireSpecialCharsDescription')}</p>
                  </div>
                  <Switch 
                    checked={settings?.userAccess?.passwordPolicy?.requireSpecialChars}
                    onCheckedChange={(checked) => 
                      onUpdate('passwordPolicy', { requireSpecialChars: checked })
                    }
                    className="data-[state=checked]:bg-[#E51636]"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Account Security */}
          <AccordionItem value="security" className="border-b-0">
            <AccordionTrigger className="hover:no-underline py-4 text-[#27251F]">
              <div className="flex flex-col items-start gap-1">
                <span className="font-medium">{t('settings.security')}</span>
                <span className="text-sm font-normal text-[#27251F]/60">{t('settings.securityDescription')}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-sm font-medium text-[#27251F]">{t('settings.sessionTimeout')}</label>
                    <p className="text-sm text-[#27251F]/60">{t('settings.sessionTimeoutDescription')}</p>
                  </div>
                  <Select 
                    defaultValue={settings?.userAccess?.accountSecurity?.sessionTimeout?.toString()}
                    onValueChange={(value) => 
                      onUpdate('accountSecurity', { sessionTimeout: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="w-[180px] h-12 rounded-xl border-gray-200">
                      <SelectValue placeholder={t('settings.selectTimeout')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 {t('settings.minutes')}</SelectItem>
                      <SelectItem value="30">30 {t('settings.minutes')}</SelectItem>
                      <SelectItem value="60">1 {t('settings.hour')}</SelectItem>
                      <SelectItem value="120">2 {t('settings.hours')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-sm font-medium text-[#27251F]">{t('settings.maxLoginAttempts')}</label>
                    <p className="text-sm text-[#27251F]/60">{t('settings.maxLoginAttemptsDescription')}</p>
                  </div>
                  <Select 
                    defaultValue={settings?.userAccess?.accountSecurity?.maxLoginAttempts?.toString()}
                    onValueChange={(value) => 
                      onUpdate('accountSecurity', { maxLoginAttempts: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="w-[180px] h-12 rounded-xl border-gray-200">
                      <SelectValue placeholder={t('settings.selectAttempts')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 {t('settings.attempts')}</SelectItem>
                      <SelectItem value="5">5 {t('settings.attempts')}</SelectItem>
                      <SelectItem value="10">10 {t('settings.attempts')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Role Management */}
          <AccordionItem value="roles" className="border-b-0">
            <AccordionTrigger className="hover:no-underline py-4 text-[#27251F]">
              <div className="flex flex-col items-start gap-1">
                <span className="font-medium">{t('settings.roleManagement')}</span>
                <span className="text-sm font-normal text-[#27251F]/60">{t('settings.roleManagementDescription')}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-sm font-medium text-[#27251F]">{t('settings.storeDirectorAccess')}</label>
                    <p className="text-sm text-[#27251F]/60">{t('settings.storeDirectorAccessDescription')}</p>
                  </div>
                  <Switch 
                    checked={settings?.userAccess?.roleManagement?.storeDirectorAccess}
                    onCheckedChange={(checked) => 
                      onUpdate('roleManagement', { storeDirectorAccess: checked })
                    }
                    className="data-[state=checked]:bg-[#E51636]"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-sm font-medium text-[#27251F]">{t('settings.kitchenDirectorAccess')}</label>
                    <p className="text-sm text-[#27251F]/60">{t('settings.kitchenDirectorAccessDescription')}</p>
                  </div>
                  <Switch 
                    checked={settings?.userAccess?.roleManagement?.kitchenDirectorAccess}
                    onCheckedChange={(checked) => 
                      onUpdate('roleManagement', { kitchenDirectorAccess: checked })
                    }
                    className="data-[state=checked]:bg-[#E51636]"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-sm font-medium text-[#27251F]">{t('settings.serviceDirectorAccess')}</label>
                    <p className="text-sm text-[#27251F]/60">{t('settings.serviceDirectorAccessDescription')}</p>
                  </div>
                  <Switch 
                    checked={settings?.userAccess?.roleManagement?.serviceDirectorAccess}
                    onCheckedChange={(checked) => 
                      onUpdate('roleManagement', { serviceDirectorAccess: checked })
                    }
                    className="data-[state=checked]:bg-[#E51636]"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-sm font-medium text-[#27251F]">{t('settings.storeLeaderAccess')}</label>
                    <p className="text-sm text-[#27251F]/60">{t('settings.storeLeaderAccessDescription')}</p>
                  </div>
                  <Switch 
                    checked={settings?.userAccess?.roleManagement?.storeLeaderAccess}
                    onCheckedChange={(checked) => 
                      onUpdate('roleManagement', { storeLeaderAccess: checked })
                    }
                    className="data-[state=checked]:bg-[#E51636]"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-sm font-medium text-[#27251F]">{t('settings.trainingLeaderAccess')}</label>
                    <p className="text-sm text-[#27251F]/60">{t('settings.trainingLeaderAccessDescription')}</p>
                  </div>
                  <Switch 
                    checked={settings?.userAccess?.roleManagement?.trainingLeaderAccess}
                    onCheckedChange={(checked) => 
                      onUpdate('roleManagement', { trainingLeaderAccess: checked })
                    }
                    className="data-[state=checked]:bg-[#E51636]"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-sm font-medium text-[#27251F]">{t('settings.shiftLeaderAccess')}</label>
                    <p className="text-sm text-[#27251F]/60">{t('settings.shiftLeaderAccessDescription')}</p>
                  </div>
                  <Switch 
                    checked={settings?.userAccess?.roleManagement?.shiftLeaderAccess}
                    onCheckedChange={(checked) => 
                      onUpdate('roleManagement', { shiftLeaderAccess: checked })
                    }
                    className="data-[state=checked]:bg-[#E51636]"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-sm font-medium text-[#27251F]">{t('settings.fohLeaderAccess')}</label>
                    <p className="text-sm text-[#27251F]/60">{t('settings.fohLeaderAccessDescription')}</p>
                  </div>
                  <Switch 
                    checked={settings?.userAccess?.roleManagement?.fohLeaderAccess}
                    onCheckedChange={(checked) => 
                      onUpdate('roleManagement', { fohLeaderAccess: checked })
                    }
                    className="data-[state=checked]:bg-[#E51636]"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-sm font-medium text-[#27251F]">{t('settings.bohLeaderAccess')}</label>
                    <p className="text-sm text-[#27251F]/60">{t('settings.bohLeaderAccessDescription')}</p>
                  </div>
                  <Switch 
                    checked={settings?.userAccess?.roleManagement?.bohLeaderAccess}
                    onCheckedChange={(checked) => 
                      onUpdate('roleManagement', { bohLeaderAccess: checked })
                    }
                    className="data-[state=checked]:bg-[#E51636]"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-sm font-medium text-[#27251F]">{t('settings.dtLeaderAccess')}</label>
                    <p className="text-sm text-[#27251F]/60">{t('settings.dtLeaderAccessDescription')}</p>
                  </div>
                  <Switch 
                    checked={settings?.userAccess?.roleManagement?.dtLeaderAccess}
                    onCheckedChange={(checked) => 
                      onUpdate('roleManagement', { dtLeaderAccess: checked })
                    }
                    className="data-[state=checked]:bg-[#E51636]"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Evaluation Access */}
          <AccordionItem value="evaluation" className="border-b-0">
            <AccordionTrigger className="hover:no-underline py-4 text-[#27251F]">
              <div className="flex flex-col items-start gap-1">
                <span className="font-medium">{t('settings.evaluation')}</span>
                <span className="text-sm font-normal text-[#27251F]/60">{t('settings.evaluationDescription')}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-6">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-sm font-medium text-[#27251F]">{t('settings.departmentRestriction')}</label>
                    <p className="text-sm text-[#27251F]/60">{t('settings.departmentRestrictionDescription')}</p>
                  </div>
                  <Switch 
                    checked={settings?.userAccess?.evaluation?.departmentRestriction}
                    onCheckedChange={(checked) => 
                      onUpdate('evaluation', { departmentRestriction: checked })
                    }
                    className="data-[state=checked]:bg-[#E51636]"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-sm font-medium text-[#27251F]">{t('settings.requireStoreLeaderReview')}</label>
                    <p className="text-sm text-[#27251F]/60">{t('settings.storeLeaderReviewDescription')}</p>
                  </div>
                  <Switch 
                    checked={settings?.userAccess?.evaluation?.requireStoreLeaderReview}
                    onCheckedChange={(checked) => 
                      onUpdate('evaluation', { requireStoreLeaderReview: checked })
                    }
                    className="data-[state=checked]:bg-[#E51636]"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-sm font-medium text-[#27251F]">{t('settings.requireDirectorApproval')}</label>
                    <p className="text-sm text-[#27251F]/60">{t('settings.directorApprovalDescription')}</p>
                  </div>
                  <Switch 
                    checked={settings?.userAccess?.evaluation?.requireDirectorApproval}
                    onCheckedChange={(checked) => 
                      onUpdate('evaluation', { requireDirectorApproval: checked })
                    }
                    className="data-[state=checked]:bg-[#E51636]"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-sm font-medium text-[#27251F]">{t('settings.workflowType')}</label>
                    <p className="text-sm text-[#27251F]/60">{t('settings.workflowTypeDescription')}</p>
                  </div>
                  <Select 
                    defaultValue={settings?.userAccess?.evaluation?.workflowType}
                    onValueChange={(value) => 
                      onUpdate('evaluation', { workflowType: value })
                    }
                  >
                    <SelectTrigger className="w-[180px] h-12 rounded-xl border-gray-200">
                      <SelectValue placeholder={t('settings.selectWorkflow')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">{t('settings.workflowSimple')}</SelectItem>
                      <SelectItem value="standard">{t('settings.workflowStandard')}</SelectItem>
                      <SelectItem value="strict">{t('settings.workflowStrict')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-sm font-medium text-[#27251F]">{t('settings.trainingAccess')}</label>
                    <p className="text-sm text-[#27251F]/60">{t('settings.trainingAccessDescription')}</p>
                  </div>
                  <Switch 
                    checked={settings?.userAccess?.evaluation?.trainingAccess}
                    onCheckedChange={(checked) => 
                      onUpdate('evaluation', { trainingAccess: checked })
                    }
                    className="data-[state=checked]:bg-[#E51636]"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-sm font-medium text-[#27251F]">{t('settings.certificationApproval')}</label>
                    <p className="text-sm text-[#27251F]/60">{t('settings.certificationApprovalDescription')}</p>
                  </div>
                  <Switch 
                    checked={settings?.userAccess?.evaluation?.certificationApproval}
                    onCheckedChange={(checked) => 
                      onUpdate('evaluation', { certificationApproval: checked })
                    }
                    className="data-[state=checked]:bg-[#E51636]"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-sm font-medium text-[#27251F]">{t('settings.metricsAccess')}</label>
                    <p className="text-sm text-[#27251F]/60">{t('settings.metricsAccessDescription')}</p>
                  </div>
                  <Switch 
                    checked={settings?.userAccess?.evaluation?.metricsAccess}
                    onCheckedChange={(checked) => 
                      onUpdate('evaluation', { metricsAccess: checked })
                    }
                    className="data-[state=checked]:bg-[#E51636]"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default UserAccessSettings;