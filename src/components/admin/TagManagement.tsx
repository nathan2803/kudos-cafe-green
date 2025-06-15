import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Plus, Edit, Trash2, Tag } from 'lucide-react'

interface MenuTag {
  id: string
  name: string
  category: string
  color: string
  description: string | null
  is_active: boolean
}

interface TagFormData {
  name: string
  category: string
  color: string
  description: string
  is_active: boolean
}

export const TagManagement = () => {
  const { toast } = useToast()
  const [tags, setTags] = useState<MenuTag[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<MenuTag | null>(null)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<TagFormData>({
    name: '',
    category: 'dietary',
    color: '#3B82F6',
    description: '',
    is_active: true
  })

  const categoryOptions = [
    { value: 'dietary', label: 'Dietary' },
    { value: 'allergen', label: 'Allergen' },
    { value: 'flavor', label: 'Flavor' },
    { value: 'promotional', label: 'Promotional' },
    { value: 'preparation', label: 'Preparation' },
    { value: 'custom', label: 'Custom' }
  ]

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_tags')
        .select('*')
        .order('category, name')

      if (error) throw error
      setTags(data || [])
    } catch (error: any) {
      console.error('Error fetching tags:', error)
      toast({
        title: "Error",
        description: "Failed to load tags",
        variant: "destructive"
      })
    }
  }

  const saveTag = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Tag name is required",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const tagData = {
        name: formData.name.trim(),
        category: formData.category,
        color: formData.color,
        description: formData.description.trim() || null,
        is_active: formData.is_active
      }

      if (editingTag) {
        const { error } = await supabase
          .from('menu_tags')
          .update(tagData)
          .eq('id', editingTag.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('menu_tags')
          .insert([tagData])

        if (error) throw error
      }

      await fetchTags()
      resetForm()
      setIsDialogOpen(false)

      toast({
        title: "Success",
        description: editingTag ? "Tag updated" : "Tag created"
      })
    } catch (error: any) {
      console.error('Error saving tag:', error)
      toast({
        title: "Error",
        description: error.message?.includes('duplicate') 
          ? "A tag with this name already exists"
          : "Failed to save tag",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteTag = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tag? This will remove it from all menu items.')) return

    try {
      const { error } = await supabase
        .from('menu_tags')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchTags()
      toast({
        title: "Success",
        description: "Tag deleted"
      })
    } catch (error: any) {
      console.error('Error deleting tag:', error)
      toast({
        title: "Error",
        description: "Failed to delete tag",
        variant: "destructive"
      })
    }
  }

  const openDialog = (tag?: MenuTag) => {
    if (tag) {
      setEditingTag(tag)
      setFormData({
        name: tag.name,
        category: tag.category,
        color: tag.color,
        description: tag.description || '',
        is_active: tag.is_active
      })
    } else {
      setEditingTag(null)
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'dietary',
      color: '#3B82F6',
      description: '',
      is_active: true
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      dietary: 'bg-green-100 text-green-800',
      allergen: 'bg-red-100 text-red-800',
      flavor: 'bg-orange-100 text-orange-800',
      promotional: 'bg-purple-100 text-purple-800',
      preparation: 'bg-blue-100 text-blue-800',
      custom: 'bg-gray-100 text-gray-800'
    }
    return colors[category] || colors.custom
  }

  const groupedTags = tags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = []
    }
    acc[tag.category].push(tag)
    return acc
  }, {} as { [key: string]: MenuTag[] })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Tag Management</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Tag
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {Object.entries(groupedTags).map(([category, categoryTags]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge className={getCategoryColor(category)}>
                {categoryOptions.find(opt => opt.value === category)?.label || category}
              </Badge>
              <span className="text-sm text-muted-foreground">
                ({categoryTags.length} tags)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categoryTags.map((tag) => (
                <div key={tag.id} className="flex items-center gap-2 p-2 border rounded-lg">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <Badge 
                    variant={tag.is_active ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {tag.name}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDialog(tag)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTag(tag.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Tag Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTag ? 'Edit Tag' : 'Add New Tag'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tagName">Name *</Label>
              <Input
                id="tagName"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Tag name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagCategory">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagColor">Color</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="tagColor"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-16 h-10"
                />
                <span className="text-sm text-muted-foreground">{formData.color}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagDescription">Description</Label>
              <Textarea
                id="tagDescription"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description"
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="tagActive"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="tagActive">Active</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={saveTag}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Saving...' : editingTag ? 'Update Tag' : 'Create Tag'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
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