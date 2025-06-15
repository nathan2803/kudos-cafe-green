import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, MessageSquare, Images } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { ImageGallery } from '@/components/ui/image-gallery'

interface ReviewWithDetails {
  id: string
  rating: number
  comment: string
  images?: string[]
  created_at: string
  customer_name?: string
  menu_item_name?: string
  admin_response?: string
}

interface ReviewsDisplayProps {
  featured?: boolean
  menuItemId?: string
  limit?: number
  className?: string
}

export const ReviewsDisplay = ({ 
  featured = false, 
  menuItemId, 
  limit = 6,
  className = ""
}: ReviewsDisplayProps) => {
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [featured, menuItemId, limit])

  const fetchReviews = async () => {
    try {
      let query = supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })

      if (featured) {
        query = query.eq('is_featured', true)
      }

      if (menuItemId) {
        query = query.eq('menu_item_id', menuItemId)
      }

      if (limit) {
        query = query.limit(limit)
      }

      const { data: reviewsData, error } = await query

      if (error) throw error

      if (!reviewsData || reviewsData.length === 0) {
        setReviews([])
        setLoading(false)
        return
      }

      // Get related data
      const userIds = [...new Set(reviewsData.map(r => r.user_id))]
      const menuItemIds = [...new Set(reviewsData.map(r => r.menu_item_id).filter(Boolean))]

      const [profilesResponse, menuItemsResponse] = await Promise.all([
        supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds),
        menuItemIds.length > 0 
          ? supabase
              .from('menu_items')
              .select('id, name')
              .in('id', menuItemIds)
          : Promise.resolve({ data: [] })
      ])

      const reviewsWithDetails: ReviewWithDetails[] = reviewsData.map(review => {
        const profile = profilesResponse.data?.find(p => p.user_id === review.user_id)
        const menuItem = menuItemsResponse.data?.find(m => m.id === review.menu_item_id)

        return {
          ...review,
          images: Array.isArray(review.images) 
            ? (review.images as string[]) 
            : (review.images ? [review.images as string] : []),
          customer_name: profile?.full_name,
          menu_item_name: menuItem?.name
        }
      })

      setReviews(reviewsWithDetails)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No reviews yet</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {reviews.map((review) => (
        <Card key={review.id} className="border-primary/20">
          <CardContent className="p-6">
            <div className="space-y-4">
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
                    {review.menu_item_name && (
                      <Badge variant="outline" className="text-xs">
                        {review.menu_item_name}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <span>{review.customer_name || 'Anonymous'}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(review.created_at)}</span>
                    {review.images && review.images.length > 0 && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="flex items-center space-x-1 inline-flex">
                          <Images className="w-3 h-3" />
                          <span>{review.images.length} photo{review.images.length > 1 ? 's' : ''}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}