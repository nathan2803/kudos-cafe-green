import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Star, Plus } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { ImageUpload } from './ImageUpload'

interface ReviewFormProps {
  onReviewSubmitted: () => void
  orders: any[]
  menuItems?: any[]
}

export const ReviewForm = ({ onReviewSubmitted, orders, menuItems = [] }: ReviewFormProps) => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    order_id: '',
    menu_item_id: ''
  })
  const [images, setImages] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || formData.rating === 0 || !formData.comment.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a rating and comment",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const reviewData = {
        user_id: user.id,
        rating: formData.rating,
        comment: formData.comment.trim(),
        order_id: formData.order_id || null,
        menu_item_id: formData.menu_item_id || null,
        images: images
      }

      const { error } = await supabase
        .from('reviews')
        .insert([reviewData])

      if (error) throw error

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!"
      })

      setFormData({ rating: 0, comment: '', order_id: '', menu_item_id: '' })
      setImages([])
      setIsOpen(false)
      onReviewSubmitted()
    } catch (error) {
      console.error('Error submitting review:', error)
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const completedOrders = orders.filter(order => order.status === 'delivered')

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Write Review
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                  className="p-1"
                >
                  <Star 
                    className={`w-6 h-6 ${
                      star <= formData.rating 
                        ? 'text-primary fill-primary' 
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {completedOrders.length > 0 && (
            <div className="space-y-2">
              <Label>Order (Optional)</Label>
              <Select 
                value={formData.order_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, order_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an order" />
                </SelectTrigger>
                <SelectContent>
                  {completedOrders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      Order #{order.order_number} - {new Date(order.created_at).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {menuItems.length > 0 && (
            <div className="space-y-2">
              <Label>Menu Item (Optional)</Label>
              <Select 
                value={formData.menu_item_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, menu_item_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a menu item" />
                </SelectTrigger>
                <SelectContent>
                  {menuItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Share your dining experience..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Photos (Optional)</Label>
            <ImageUpload
              images={images}
              onImagesChange={setImages}
              maxImages={5}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || formData.rating === 0}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}