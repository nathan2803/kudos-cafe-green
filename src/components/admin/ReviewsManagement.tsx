import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Star, MessageSquare, Eye, EyeOff, Award, TrendingUp, Users } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Review {
  id: string
  user_id: string
  order_id?: string
  menu_item_id?: string
  rating: number
  comment: string
  is_approved: boolean
  is_featured: boolean
  admin_response?: string
  created_at: string
  profiles?: {
    full_name: string
    email: string
  }
  orders?: {
    order_number: string
  }
  menu_items?: {
    name: string
  }
}

interface ReviewStats {
  total_reviews: number
  average_rating: number
  rating_distribution: { [key: number]: number }
  recent_reviews: number
}

export const ReviewsManagement = () => {
  const { toast } = useToast()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterRating, setFilterRating] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [responding, setResponding] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')

  useEffect(() => {
    fetchReviews()
    fetchStats()
  }, [])

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (full_name, email),
          orders:order_id (order_number),
          menu_items:menu_item_id (name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReviews(data as any || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const { data: reviewData, error } = await supabase
        .from('reviews')
        .select('rating, created_at')
        .eq('is_approved', true)

      if (error) throw error

      const total = reviewData?.length || 0
      const average = total > 0 
        ? reviewData.reduce((sum, review) => sum + review.rating, 0) / total 
        : 0

      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      reviewData?.forEach(review => {
        distribution[review.rating as keyof typeof distribution]++
      })

      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const recent = reviewData?.filter(review => 
        new Date(review.created_at) > oneWeekAgo
      ).length || 0

      setStats({
        total_reviews: total,
        average_rating: average,
        rating_distribution: distribution,
        recent_reviews: recent
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleApprovalToggle = async (reviewId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: !currentStatus })
        .eq('id', reviewId)

      if (error) throw error

      toast({
        title: "Review Updated",
        description: `Review ${!currentStatus ? 'approved' : 'hidden'}`
      })
      fetchReviews()
      fetchStats()
    } catch (error) {
      console.error('Error updating review:', error)
      toast({
        title: "Error",
        description: "Failed to update review",
        variant: "destructive"
      })
    }
  }

  const handleFeatureToggle = async (reviewId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_featured: !currentStatus })
        .eq('id', reviewId)

      if (error) throw error

      toast({
        title: "Review Updated",
        description: `Review ${!currentStatus ? 'featured' : 'unfeatured'}`
      })
      fetchReviews()
    } catch (error) {
      console.error('Error updating review:', error)
      toast({
        title: "Error",
        description: "Failed to update review",
        variant: "destructive"
      })
    }
  }

  const handleResponse = async (reviewId: string) => {
    if (!responseText.trim()) return

    try {
      const { error } = await supabase
        .from('reviews')
        .update({ admin_response: responseText.trim() })
        .eq('id', reviewId)

      if (error) throw error

      toast({
        title: "Response Added",
        description: "Your response has been posted"
      })
      setResponding(null)
      setResponseText('')
      fetchReviews()
    } catch (error) {
      console.error('Error adding response:', error)
      toast({
        title: "Error",
        description: "Failed to add response",
        variant: "destructive"
      })
    }
  }

  const filteredReviews = reviews.filter(review => {
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'approved' && review.is_approved) ||
      (filterStatus === 'pending' && !review.is_approved) ||
      (filterStatus === 'featured' && review.is_featured)
    
    const matchesRating = filterRating === 'all' || 
      review.rating.toString() === filterRating
    
    const matchesSearch = searchTerm === '' ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.menu_items?.name.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesStatus && matchesRating && matchesSearch
  })

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
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                  <p className="text-2xl font-bold">{stats.total_reviews}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                  <p className="text-2xl font-bold">{stats.average_rating.toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">{stats.recent_reviews}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">5-Star Reviews</p>
                  <p className="text-2xl font-bold">{stats.rating_distribution[5]}</p>
                </div>
                <Award className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sm:max-w-sm"
            />
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No reviews found matching your filters</p>
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review.id} className="border-primary/20">
              <CardHeader>
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
                        {review.is_approved ? "Approved" : "Pending"}
                      </Badge>
                      {review.is_featured && (
                        <Badge variant="outline" className="border-primary text-primary">
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <p><strong>Customer:</strong> {review.profiles?.full_name} ({review.profiles?.email})</p>
                      <p><strong>Date:</strong> {formatDate(review.created_at)}</p>
                      {review.orders?.order_number && (
                        <p><strong>Order:</strong> #{review.orders.order_number}</p>
                      )}
                      {review.menu_items?.name && (
                        <p><strong>Item:</strong> {review.menu_items.name}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant={review.is_approved ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleApprovalToggle(review.id, review.is_approved)}
                    >
                      {review.is_approved ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    
                    <Button
                      variant={review.is_featured ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFeatureToggle(review.id, review.is_featured)}
                    >
                      <Award className="w-4 h-4" />
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Respond to Review</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="bg-muted p-3 rounded">
                            <p className="text-sm">{review.comment}</p>
                          </div>
                          <Textarea
                            placeholder="Write your response..."
                            value={responding === review.id ? responseText : review.admin_response || ''}
                            onChange={(e) => {
                              setResponseText(e.target.value)
                              setResponding(review.id)
                            }}
                            rows={4}
                          />
                          <Button 
                            onClick={() => handleResponse(review.id)}
                            disabled={!responseText.trim()}
                          >
                            {review.admin_response ? 'Update Response' : 'Add Response'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-foreground mb-3">{review.comment}</p>
                
                {review.admin_response && (
                  <div className="bg-primary/10 rounded-lg p-3 border-l-4 border-primary">
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">Your Response</span>
                    </div>
                    <p className="text-sm">{review.admin_response}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}