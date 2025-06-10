import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  Package,
  Utensils,
  Coffee,
  Flame,
  Circle,
  Minus,
  MoreHorizontal,
  AlertTriangle
} from 'lucide-react';
import { kitchenService } from '@/services/kitchenService';
import { FoodItem, FoodItemCategory } from '@/types/kitchen';
import { cn } from "@/lib/utils";

const FoodItemsManagement: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<FoodItemCategory[]>([]);
  const [editingItem, setEditingItem] = useState<Partial<FoodItem> | null>(null);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<FoodItem | null>(null);

  const iconMap = {
    sandwich: Utensils,
    circle: Circle,
    minus: Minus,
    utensils: Utensils,
    flame: Flame,
    plus: Plus,
    coffee: Coffee,
    'more-horizontal': MoreHorizontal
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsData, categoriesData] = await Promise.all([
        kitchenService.getFoodItems(),
        kitchenService.getFoodItemCategories()
      ]);
      setFoodItems(itemsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading food items:', error);
      enqueueSnackbar('Failed to load food items', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setEditingItem({
      key: '',
      name: '',
      description: '',
      category: 'other',
      icon: 'utensils',
      isDefault: false
    });
    setShowItemDialog(true);
  };

  const handleEditItem = (item: FoodItem) => {
    if (item.isDefault) {
      enqueueSnackbar('Cannot edit default food items', { variant: 'warning' });
      return;
    }
    setEditingItem({ ...item });
    setShowItemDialog(true);
  };

  const handleSaveItem = async () => {
    if (!editingItem || !editingItem.name || !editingItem.key) {
      enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
      return;
    }

    try {
      setSaving(true);
      
      if (editingItem._id) {
        // Update existing item
        await kitchenService.updateFoodItem(editingItem._id, editingItem);
        enqueueSnackbar('Food item updated successfully!', { variant: 'success' });
      } else {
        // Create new item
        await kitchenService.createFoodItem(editingItem as Omit<FoodItem, '_id' | 'store' | 'createdBy' | 'isActive' | 'createdAt' | 'updatedAt'>);
        enqueueSnackbar('Food item created successfully!', { variant: 'success' });
      }
      
      setShowItemDialog(false);
      setEditingItem(null);
      loadData();
    } catch (error: any) {
      console.error('Error saving food item:', error);
      const message = error.response?.data?.message || 'Failed to save food item';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (item: FoodItem) => {
    if (item.isDefault) {
      enqueueSnackbar('Cannot delete default food items', { variant: 'warning' });
      return;
    }
    setDeleteConfirmItem(item);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmItem) return;

    try {
      await kitchenService.deleteFoodItem(deleteConfirmItem._id!);
      enqueueSnackbar('Food item deleted successfully!', { variant: 'success' });
      setDeleteConfirmItem(null);
      loadData();
    } catch (error) {
      console.error('Error deleting food item:', error);
      enqueueSnackbar('Failed to delete food item', { variant: 'error' });
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Utensils;
    return <IconComponent className="h-5 w-5" />;
  };

  const generateKeyFromName = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .trim();
  };

  const groupedItems = foodItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, FoodItem[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-600"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
        <div className="relative px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute -inset-3 bg-white/30 rounded-3xl blur-xl"></div>
                <div className="relative p-4 bg-white/20 rounded-3xl backdrop-blur-sm border border-white/30">
                  <Package className="h-12 w-12 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-black text-white mb-2">
                  🍽️ Food Items
                </h1>
                <p className="text-xl text-white/90 font-medium">
                  Manage your custom food items for quality evaluation
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2 text-white/80">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                    <span className="text-sm font-medium">Live Management</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Package className="h-4 w-4" />
                    <span className="text-sm font-medium">{foodItems.length} Items</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleAddItem}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm rounded-2xl px-6 py-3 font-semibold border-2"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Food Item
              </Button>
              <Button
                onClick={() => navigate('/kitchen/food-quality')}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm rounded-2xl px-6 py-3 font-semibold"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Quality
              </Button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading food items...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map(category => {
            const items = groupedItems[category.value] || [];
            if (items.length === 0) return null;

            return (
              <Card key={category.value} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      {getIcon(category.icon)}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{category.label}</CardTitle>
                      <p className="text-gray-600 text-sm">{items.length} items</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(item => (
                      <Card key={item._id} className="border border-gray-200 hover:border-blue-300 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                {getIcon(item.icon)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {item.name}
                                </h3>
                                <p className="text-xs text-gray-500 font-mono">
                                  {item.key}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {item.isDefault && (
                                <Badge variant="secondary" className="text-xs">
                                  Default
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {category.label}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditItem(item)}
                                disabled={item.isDefault}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteItem(item)}
                                disabled={item.isDefault}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Item Dialog */}
      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem?._id ? 'Edit Food Item' : 'Add New Food Item'}
            </DialogTitle>
            <DialogDescription>
              {editingItem?._id ? 'Update the food item details' : 'Create a new food item for quality evaluation'}
            </DialogDescription>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Item Name *</Label>
                  <Input
                    placeholder="e.g., Medium Fries"
                    value={editingItem.name || ''}
                    onChange={(e) => {
                      const name = e.target.value;
                      setEditingItem({
                        ...editingItem,
                        name,
                        key: editingItem._id ? editingItem.key : generateKeyFromName(name)
                      });
                    }}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Key *</Label>
                  <Input
                    placeholder="e.g., fries_medium"
                    value={editingItem.key || ''}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
                    })}
                    disabled={!!editingItem._id} // Don't allow editing key for existing items
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Unique identifier (lowercase, numbers, underscores only)
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Description</Label>
                <Textarea
                  placeholder="Describe this food item..."
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    description: e.target.value
                  })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Category</Label>
                  <Select
                    value={editingItem.category}
                    onValueChange={(value) => setEditingItem({
                      ...editingItem,
                      category: value as any
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            {getIcon(category.icon)}
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Icon</Label>
                  <Select
                    value={editingItem.icon}
                    onValueChange={(value) => setEditingItem({
                      ...editingItem,
                      icon: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(iconMap).map(([key, IconComponent]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {key}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowItemDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveItem}
              disabled={saving || !editingItem?.name || !editingItem?.key}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {editingItem?._id ? 'Update Item' : 'Create Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmItem} onOpenChange={() => setDeleteConfirmItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Food Item
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteConfirmItem?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmItem(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FoodItemsManagement;
