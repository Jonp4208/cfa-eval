// File: src/pages/Settings/components/MobileNavigationSettings.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Save, RotateCcw, ChevronUp, ChevronDown, Menu } from "lucide-react";
import { useTranslation } from '@/contexts/TranslationContext';
import { MobileNavigationItem, UIPreferences } from '@/lib/services/userPreferences';

// Define all available navigation items
// This should match the keys in ALL_NAV_ITEMS in MobileNav.tsx
const ALL_NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { key: 'home', label: 'Home', icon: 'Home' },
  { key: 'foh', label: 'FOH Tasks', icon: 'CheckSquare' },
  { key: 'documentation', label: 'Documentation', icon: 'FileText' },
  { key: 'kitchen', label: 'Kitchen', icon: 'ChefHat' },
  { key: 'training', label: 'Training', icon: 'GraduationCap' },
  { key: 'setupSheet', label: 'Setup Sheet', icon: 'CalendarDays' },
  { key: 'evaluations', label: 'Evaluations', icon: 'ClipboardList' },
  { key: 'leadership', label: 'Leadership', icon: 'TrendingUp' },
  { key: 'teamSurveys', label: 'Team Surveys', icon: 'MessageSquare' },
  { key: 'analytics', label: 'Analytics', icon: 'BarChart' },
  { key: 'users', label: 'Team Members', icon: 'Users' }
];

interface MobileNavigationSettingsProps {
  preferences?: UIPreferences;
  onUpdate: (data: Partial<UIPreferences>) => void;
  isUpdating: boolean;
}

const MobileNavigationSettings: React.FC<MobileNavigationSettingsProps> = ({
  preferences,
  onUpdate,
  isUpdating
}) => {
  const { t } = useTranslation();
  const [navItems, setNavItems] = useState<MobileNavigationItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const maxItems = preferences?.mobileNavigation?.maxItems || 5;

  // Initialize state from props
  useEffect(() => {
    console.log('MobileNavigationSettings received preferences:', preferences?.mobileNavigation);

    if (preferences?.mobileNavigation?.items) {
      console.log('Setting nav items from preferences:', preferences.mobileNavigation.items);
      setNavItems(preferences.mobileNavigation.items);
    } else {
      console.log('Using default nav items');
      // Default items if none are set
      setNavItems([
        { key: 'dashboard', show: true },
        { key: 'foh', show: true },
        { key: 'documentation', show: true },
        { key: 'evaluations', show: true },
        { key: 'users', show: true }
      ]);
    }
  }, [preferences]);

  // Move item up in the list
  const moveItemUp = (index: number) => {
    if (index === 0) return; // Already at the top

    const items = Array.from(navItems);
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;

    setNavItems(items);
  };

  // Move item down in the list
  const moveItemDown = (index: number) => {
    if (index === navItems.length - 1) return; // Already at the bottom

    const items = Array.from(navItems);
    const temp = items[index];
    items[index] = items[index + 1];
    items[index + 1] = temp;

    setNavItems(items);
  };

  // Toggle item visibility
  const toggleItemVisibility = (key: string) => {
    setNavItems(prevItems =>
      prevItems.map(item =>
        item.key === key ? { ...item, show: !item.show } : item
      )
    );
  };

  // Count visible items
  const visibleItemsCount = navItems.filter(item => item.show).length;

  // Save changes
  const handleSave = () => {
    if (visibleItemsCount > maxItems) {
      setError(`You can only have up to ${maxItems} visible items in the mobile navigation.`);
      return;
    }

    setError(null);

    try {
      // Ensure visible items are at the beginning of the array to maintain order
      const visibleItems = navItems.filter(item => item.show);
      const hiddenItems = navItems.filter(item => !item.show);

      // Start with ordered visible items followed by hidden items
      const orderedItems = [...visibleItems, ...hiddenItems];

      // Make sure we have all the items from ALL_NAV_ITEMS in our navItems array
      const completeNavItems = [...orderedItems];

      // Add any missing items from ALL_NAV_ITEMS
      ALL_NAV_ITEMS.forEach(navItemInfo => {
        const exists = completeNavItems.some(item => item.key === navItemInfo.key);
        if (!exists) {
          completeNavItems.push({ key: navItemInfo.key, show: false });
        }
      });

      console.log('Complete nav items to save:', completeNavItems);

      const updateData = {
        mobileNavigation: {
          items: completeNavItems,
          maxItems
        }
      };

      console.log('Saving mobile navigation settings to server:', updateData);
      onUpdate(updateData);

      // Show success message
      setError(null);

      // Force a reload of the page to ensure the changes take effect
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error saving navigation settings:', error);
      setError('An error occurred while saving your navigation settings. Please try again.');
    }
  };

  // Reset to defaults
  const handleReset = () => {
    try {
      const defaultItems = [
        { key: 'dashboard', show: true },
        { key: 'foh', show: true },
        { key: 'documentation', show: true },
        { key: 'evaluations', show: true },
        { key: 'users', show: true }
      ];

      // Update local state immediately for better UX
      setNavItems(defaultItems);

      // Make a direct API call to reset user preferences
      fetch('/api/user-preferences/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to reset preferences');
        }
        return response.json();
      })
      .then(data => {
        console.log('Successfully reset preferences:', data);

        // Clear any errors
        setError(null);

        // Force a reload after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      })
      .catch(error => {
        console.error('Error resetting preferences:', error);
        setError('Failed to reset preferences. Please try again.');

        // Fallback: update through the regular update method
        onUpdate({
          mobileNavigation: {
            items: defaultItems,
            maxItems
          }
        });
      });
    } catch (error) {
      console.error('Error in reset handler:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mobile Navigation</CardTitle>
        <CardDescription>
          Customize which items appear in the bottom navigation bar on mobile devices.
          Toggle items on/off to show or hide them. You can have up to {maxItems} visible items.
          Use the up/down arrows to change the order of visible items.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Visible Items: {visibleItemsCount}/{maxItems}</h3>
              <p className="text-sm text-muted-foreground">
                {visibleItemsCount > maxItems ?
                  `Please hide ${visibleItemsCount - maxItems} more item(s)` :
                  visibleItemsCount > 0 ?
                    'Toggle switches to show/hide items. Use arrows below to reorder.' :
                    'Toggle switches to show items in your mobile menu.'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {/* Show all available navigation items, not just the current ones */}
            {ALL_NAV_ITEMS.map((navItemInfo) => {
              // Find if this item exists in the user's current navigation items
              const existingItem = navItems.find(item => item.key === navItemInfo.key);
              const isInNavItems = !!existingItem;

              return (
                <div
                  key={navItemInfo.key}
                  className="flex items-center justify-between p-3 bg-white border rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{navItemInfo.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Switch
                      id={`show-${navItemInfo.key}`}
                      checked={isInNavItems ? existingItem.show : false}
                      onCheckedChange={() => {
                        if (isInNavItems) {
                          // Toggle visibility if it exists
                          toggleItemVisibility(navItemInfo.key);
                        } else {
                          // Add to navigation items if it doesn't exist
                          setNavItems(prev => [...prev, { key: navItemInfo.key, show: true }]);
                        }
                      }}
                    />
                    <Label htmlFor={`show-${navItemInfo.key}`} className="ml-2">
                      {isInNavItems && existingItem.show ? 'Visible' : 'Hidden'}
                    </Label>
                  </div>
                </div>
              );
            })}

            {/* Show reordering UI only for items that are in the navigation */}
            {visibleItemsCount > 0 && (
              <div className="mt-8 border-t pt-4">
                <h3 className="text-sm font-medium mb-2">
                  Reorder Visible Items
                </h3>

                <div className="space-y-2">
                  {navItems.filter(item => item.show).map((item, index) => {
                    const navItemInfo = ALL_NAV_ITEMS.find(i => i.key === item.key) ||
                                      { label: item.key, icon: 'Circle' };

                    const itemIndex = navItems.findIndex(i => i.key === item.key);

                    return (
                      <div
                        key={`order-${item.key}`}
                        className="flex items-center justify-between p-3 bg-white border rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 flex items-center">
                            <Menu className="w-5 h-5 text-gray-400 mr-1" />
                            <div className="flex flex-col">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => moveItemUp(itemIndex)}
                                disabled={index === 0}
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => moveItemDown(itemIndex)}
                                disabled={index === navItems.filter(item => item.show).length - 1}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <p className="font-medium">{navItemInfo.label}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isUpdating}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
          <Button
            onClick={handleSave}
            disabled={isUpdating || visibleItemsCount > maxItems}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileNavigationSettings;
