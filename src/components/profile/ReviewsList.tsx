import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Star, Edit2, Trash2, Clock, Package, MessageSquare, Images } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { ImageGallery } from '@/components/ui/image-gallery'

interface Review {
  id: string
  user_id: string
  order_id?: string
  menu_item_id?: string
  rating: number
  comment: string
  is_approved: boolean
  admin_response?: string
  images?: string[]
  created_at: string
  updated_at: string
  orders?: {
    order_number: string
  }
  menu_items?: {
    name: string
  }
}

interface ReviewsListProps {
  reviews: Review[]
  loading: boolean
  onRefresh: () => void
}

export const ReviewsList = ({ reviews, loading, onRefresh }: ReviewsListProps) => {
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDeleteReview = async (reviewId: string) => {
    setDeletingId(reviewId)
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

      if (error) throw error

      toast({
        title: "Review Deleted",
        description: "Your review has been removed"
      })
      onRefresh()
    } catch (error) {
      console.error('Error deleting review:', error)
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive"
      })
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Reviews Yet</h3>
        <p className="text-muted-foreground">Share your dining experience with a review!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating ? 'text-primary fill-primary' : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <Badge variant={review.is_approved ? "default" : "secondary"}>
                    {review.is_approved ? "Published" : "Pending Approval"}
                  </Badge>
                </div>
                
                 <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                   <div className="flex items-center space-x-1">
                     <Clock className="w-3 h-3" />
                     <span>{formatDate(review.created_at)}</span>
                   </div>
                   
                   {review.orders?.order_number && (
                     <div className="flex items-center space-x-1">
                       <Package className="w-3 h-3" />
                       <span>Order #{review.orders.order_number}</span>
                     </div>
                   )}
                   
                   {review.menu_items?.name && (
                     <Badge variant="outline" className="text-xs">
                       {review.menu_items.name}
                     </Badge>
                   )}

                   {review.images && review.images.length > 0 && (
                     <div className="flex items-center space-x-1">
                       <Images className="w-3 h-3" />
                       <span>{review.images.length} photo{review.images.length > 1 ? 's' : ''}</span>
                     </div>
                   )}
                 </div>
              </div>
              
              <div className="flex space-x-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      disabled={deletingId === review.id}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Review</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this review? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteReview(review.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          
           <CardContent className="space-y-3">
             <p className="text-foreground leading-relaxed">{review.comment}</p>
             
             {/* Review Images */}
             {review.images && review.images.length > 0 && (
               <div className="mt-4">
                 <ImageGallery 
                   images={review.images} 
                   alt="Review images"
                   className="grid-cols-3 max-w-md"
                 />
               </div>
             )}
             
             {review.admin_response && (
               <div className="bg-muted/50 rounded-lg p-3 border-l-4 border-primary">
                 <div className="flex items-center space-x-2 mb-2">
                   <MessageSquare className="w-4 h-4 text-primary" />
                   <span className="text-sm font-medium text-primary">Restaurant Response</span>
                 </div>
                 <p className="text-sm text-muted-foreground">{review.admin_response}</p>
               </div>
             )}
           </CardContent>
        </Card>
      ))}
    </div>
  )
}