import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { 
  Edit3, 
  Plus, 
  Save, 
  X, 
  GripVertical, 
  Eye, 
  EyeOff,
  Image as ImageIcon,
  Upload
} from 'lucide-react'

interface AboutUsSection {
  id: string
  section_key: string
  title: string
  content: string
  image_url?: string
  order_index: number
  is_active: boolean
}

export const AboutUsManagement = () => {
  const [sections, setSections] = useState<AboutUsSection[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSection, setEditingSection] = useState<AboutUsSection | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchSections()
  }, [])

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('about_us_sections')
        .select('*')
        .order('order_index')

      if (error) throw error
      setSections(data || [])
    } catch (error) {
      console.error('Error fetching sections:', error)
      toast({
        title: "Error",
        description: "Failed to fetch About Us sections",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (section: AboutUsSection) => {
    try {
      const { error } = await supabase
        .from('about_us_sections')
        .upsert(section)

      if (error) throw error

      await fetchSections()
      setEditingSection(null)
      setIsDialogOpen(false)
      
      toast({
        title: "Success",
        description: "Section updated successfully"
      })
    } catch (error) {
      console.error('Error saving section:', error)
      toast({
        title: "Error",
        description: "Failed to save section",
        variant: "destructive"
      })
    }
  }

  const toggleVisibility = async (section: AboutUsSection) => {
    try {
      const { error } = await supabase
        .from('about_us_sections')
        .update({ is_active: !section.is_active })
        .eq('id', section.id)

      if (error) throw error
      await fetchSections()
      
      toast({
        title: "Success",
        description: `Section ${section.is_active ? 'hidden' : 'shown'}`
      })
    } catch (error) {
      console.error('Error toggling visibility:', error)
      toast({
        title: "Error",
        description: "Failed to update visibility",
        variant: "destructive"
      })
    }
  }

  const EditDialog = ({ section, isNew = false }: { section: AboutUsSection, isNew?: boolean }) => {
    const [formData, setFormData] = useState(section)
    const [uploading, setUploading] = useState(false)
    const { user } = useAuth()

    const uploadImage = async (file: File): Promise<string | null> => {
      if (!user) return null

      try {
        // Validate file
        if (!file.type.startsWith('image/')) {
          throw new Error('Please select an image file')
        }
        
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Image must be less than 5MB')
        }

        // Create unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `about-us/${fileName}`

        // Upload to Supabase storage
        const { data, error } = await supabase.storage
          .from('gallery-hero-images')
          .upload(filePath, file)

        if (error) throw error

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('gallery-hero-images')
          .getPublicUrl(data.path)

        return publicUrl
      } catch (error) {
        console.error('Error uploading image:', error)
        throw error
      }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || !user) return

      setUploading(true)
      try {
        const imageUrl = await uploadImage(file)
        if (imageUrl) {
          setFormData({ ...formData, image_url: imageUrl })
          toast({
            title: "Success",
            description: "Image uploaded successfully"
          })
        }
      } catch (error) {
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Failed to upload image",
          variant: "destructive"
        })
      } finally {
        setUploading(false)
      }
    }

    return (
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Add New Section' : 'Edit Section'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Section title"
            />
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Section content"
              rows={6}
            />
          </div>

          <div>
            <Label>Image</Label>
            <Tabs defaultValue="url" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url">Image URL</TabsTrigger>
                <TabsTrigger value="upload">Upload Image</TabsTrigger>
              </TabsList>
              
              <TabsContent value="url" className="space-y-2">
                <Input
                  value={formData.image_url || ''}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </TabsContent>
              
              <TabsContent value="upload" className="space-y-2">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {uploading ? 'Uploading...' : 'Click to upload image'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, WebP up to 5MB
                    </p>
                  </label>
                </div>
              </TabsContent>
            </Tabs>
            
            {formData.image_url && (
              <div className="mt-2">
                <img 
                  src={formData.image_url} 
                  alt="Preview"
                  className="w-32 h-20 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="order_index">Order</Label>
            <Input
              id="order_index"
              type="number"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleSave(formData)} disabled={uploading}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    )
  }

  if (loading) {
    return <div className="text-center py-8">Loading sections...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">About Us Content</h2>
          <p className="text-muted-foreground">Manage the content sections on your About Us page</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingSection({
                  id: '',
                  section_key: `section_${Date.now()}`,
                  title: '',
                  content: '',
                  image_url: '',
                  order_index: sections.length + 1,
                  is_active: true
                })
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button>
          </DialogTrigger>
          {editingSection && (
            <EditDialog 
              section={editingSection} 
              isNew={!editingSection.id}
            />
          )}
        </Dialog>
      </div>

      <div className="grid gap-4">
        {sections.map((section) => (
          <Card key={section.id} className="border-primary/20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline">{section.section_key}</Badge>
                      <Badge variant={section.is_active ? "default" : "secondary"}>
                        {section.is_active ? "Active" : "Hidden"}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleVisibility(section)}
                  >
                    {section.is_active ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingSection(section)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    {editingSection && editingSection.id === section.id && (
                      <EditDialog section={editingSection} />
                    )}
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {section.content}
                  </p>
                </div>
                
                {section.image_url && (
                  <div className="flex justify-center lg:justify-end">
                    <img 
                      src={section.image_url} 
                      alt={section.title}
                      className="w-24 h-16 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sections.length === 0 && (
        <Card className="p-8 text-center">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No sections yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first About Us section to get started
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Section
          </Button>
        </Card>
      )}
    </div>
  )
}