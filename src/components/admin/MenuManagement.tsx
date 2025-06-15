import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, ImageIcon } from 'lucide-react'
import { TagManagement } from './TagManagement'
import { MenuHeroManagement } from './MenuHeroManagement'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  image_url: string | null
  is_available: boolean
  is_popular: boolean
  is_new: boolean
  dietary_tags: string[] | null
}

interface MenuTag {
  id: string
  name: string
  category: string
  color: string
  description: string | null
  is_active: boolean
}

export const MenuManagement = () => {
  const { user, userProfile } = useAuth()
  const { toast } = useToast()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [menuTags, setMenuTags] = useState<MenuTag[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('menu-items')

  // Predefined food categories
  const foodCategories = [
    'Appetizers',
    'Soups & Salads',
    'Main Course',
    'Pasta',
    'Pizza',
    'Desserts',
    'Drinks',
    'Beverages'
  ]

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    is_available: true,
    is_popular: false,
    is_new: false,
    dietary_tags: [] as string[]
  })

  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    fetchMenuItems()
    fetchMenuTags()
  }, [])

  // Refetch tags when returning from tags tab
  useEffect(() => {
    if (activeTab === 'menu-items') {
      fetchMenuTags()
    }
  }, [activeTab])

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('category, name')

      if (error) throw error
      setMenuItems(data || [])
    } catch (error: any) {
      console.error('Error fetching menu items:', error)
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive"
      })
    }
  }

  const fetchMenuTags = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_tags')
        .select('*')
        .eq('is_active', true)
        .order('category, name')

      if (error) throw error
      setMenuTags(data || [])
    } catch (error: any) {
      console.error('Error fetching menu tags:', error)
      toast({
        title: "Error",
        description: "Failed to load menu tags",
        variant: "destructive"
      })
    }
  }

  const fetchMenuItemTags = async (menuItemId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('menu_item_tags')
        .select('tag_id, menu_tags(name)')
        .eq('menu_item_id', menuItemId)

      if (error) throw error
      return data?.map(item => (item.menu_tags as any)?.name).filter(Boolean) || []
    } catch (error: any) {
      console.error('Error fetching menu item tags:', error)
      return []
    }
  }

  const saveMenuItemTags = async (menuItemId: string, tagNames: string[]) => {
    try {
      // First, get tag IDs from names
      const tagIds: string[] = []
      for (const tagName of tagNames) {
        const tag = menuTags.find(t => t.name === tagName)
        if (tag) {
          tagIds.push(tag.id)
        }
      }

      // Delete existing tags
      await supabase
        .from('menu_item_tags')
        .delete()
        .eq('menu_item_id', menuItemId)

      // Insert new tags
      if (tagIds.length > 0) {
        const { error } = await supabase
          .from('menu_item_tags')
          .insert(tagIds.map(tagId => ({
            menu_item_id: menuItemId,
            tag_id: tagId
          })))

        if (error) throw error
      }
    } catch (error: any) {
      console.error('Error saving menu item tags:', error)
      throw error
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
      const filePath = `menu-items/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      })
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const saveMenuItem = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      let imageUrl = editingItem?.image_url || null

      // Upload new image if selected
      if (selectedImage) {
        const uploadedUrl = await uploadImage(selectedImage)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        }
      }

      const itemData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        category: formData.category,
        image_url: imageUrl,
        is_available: formData.is_available,
        is_popular: formData.is_popular,
        is_new: formData.is_new,
        dietary_tags: formData.dietary_tags.length > 0 ? formData.dietary_tags : null
      }

      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('menu_items')
          .update(itemData)
          .eq('id', editingItem.id)

        if (error) throw error
      } else {
        // Create new item
        const { error } = await supabase
          .from('menu_items')
          .insert([itemData])

        if (error) throw error
      }

      await fetchMenuItems()
      resetForm()
      setIsEditDialogOpen(false)

      toast({
        title: "Success",
        description: editingItem ? "Menu item updated" : "Menu item created",
      })
    } catch (error: any) {
      console.error('Error saving menu item:', error)
      toast({
        title: "Error",
        description: "Failed to save menu item",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteMenuItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return

    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchMenuItems()
      toast({
        title: "Success",
        description: "Menu item deleted",
      })
    } catch (error: any) {
      console.error('Error deleting menu item:', error)
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive"
      })
    }
  }

  const openEditDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price.toString(),
        category: item.category,
        is_available: item.is_available,
        is_popular: item.is_popular,
        is_new: item.is_new,
        dietary_tags: item.dietary_tags || []
      })
      setImagePreview(item.image_url)
    } else {
      setEditingItem(null)
      resetForm()
    }
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      is_available: true,
      is_popular: false,
      is_new: false,
      dietary_tags: []
    })
    setSelectedImage(null)
    setImagePreview(null)
  }

  const toggleDietaryTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      dietary_tags: prev.dietary_tags.includes(tag)
        ? prev.dietary_tags.filter(t => t !== tag)
        : [...prev.dietary_tags, tag]
    }))
  }

  const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Spicy', 'Halal', 'Kosher']

  // Group menu items by category
  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as { [key: string]: MenuItem[] })

  // Sort categories by predefined order, with popular items first within each category
  const sortedCategories = foodCategories.filter(cat => groupedMenuItems[cat])
  const otherCategories = Object.keys(groupedMenuItems).filter(cat => !foodCategories.includes(cat))

  if (!userProfile?.is_admin) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Menu Management</h2>

      <Tabs 
        defaultValue="menu-items" 
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="menu-items">Menu Items</TabsTrigger>
          <TabsTrigger value="hero-section">Hero Section</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="menu-items" className="space-y-6">
          <div className="flex justify-end">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openEditDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Menu Item
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>

          {/* Display menu items grouped by category */}
          {[...sortedCategories, ...otherCategories].map((category) => {
            const categoryItems = groupedMenuItems[category].sort((a, b) => {
              // Sort by popular first, then by name
              if (a.is_popular && !b.is_popular) return -1
              if (!a.is_popular && b.is_popular) return 1
              return a.name.localeCompare(b.name)
            })

            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{category}</span>
                    <Badge variant="secondary">{categoryItems.length} items</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryItems.map((item) => (
                      <div key={item.id} className="border rounded-lg overflow-hidden">
                        <div className="aspect-video bg-muted flex items-center justify-center">
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-12 h-12 text-muted-foreground" />
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{item.name}</h4>
                            <span className="font-bold">${item.price}</span>
                          </div>
                          
                          {item.description && (
                            <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-1 mb-3">
                            {!item.is_available && <Badge variant="destructive">Unavailable</Badge>}
                            {item.is_popular && <Badge variant="default">Popular</Badge>}
                            {item.is_new && <Badge className="bg-green-500">New</Badge>}
                            {item.dietary_tags?.map(tag => (
                              <Badge key={tag} variant="outline">{tag}</Badge>
                            ))}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(item)}
                              className="flex-1"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteMenuItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {menuItems.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No menu items found. Add your first menu item to get started.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="hero-section">
          <MenuHeroManagement />
        </TabsContent>

        <TabsContent value="tags">
          <TagManagement />
        </TabsContent>
      </Tabs>

      {/* Menu Item Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Image</Label>
            <div className="flex gap-4">
              <div className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="mb-2"
                />
                {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Item name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Item description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Food Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select food category" />
              </SelectTrigger>
              <SelectContent>
                {foodCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Status</Label>
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_available: checked }))}
                />
                <Label htmlFor="available">Available</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="popular"
                  checked={formData.is_popular}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_popular: checked }))}
                />
                <Label htmlFor="popular">Popular</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="new"
                  checked={formData.is_new}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_new: checked }))}
                />
                <Label htmlFor="new">New</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            {menuTags.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tags available. Create tags in the Tags tab first.
              </p>
            ) : (
              <div className="space-y-3">
                {Object.entries(
                  menuTags.reduce((acc, tag) => {
                    if (!acc[tag.category]) acc[tag.category] = []
                    acc[tag.category].push(tag)
                    return acc
                  }, {} as { [key: string]: MenuTag[] })
                ).map(([category, tags]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-sm font-medium capitalize">{category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          variant={formData.dietary_tags.includes(tag.name) ? "default" : "outline"}
                          className="cursor-pointer flex items-center gap-1"
                          onClick={() => toggleDietaryTag(tag.name)}
                          style={{ 
                            backgroundColor: formData.dietary_tags.includes(tag.name) ? tag.color : 'transparent',
                            borderColor: tag.color,
                            color: formData.dietary_tags.includes(tag.name) ? 'white' : tag.color
                          }}
                        >
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={saveMenuItem}
              disabled={loading || uploading}
              className="flex-1"
            >
              {loading ? 'Saving...' : editingItem ? 'Update Item' : 'Create Item'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}