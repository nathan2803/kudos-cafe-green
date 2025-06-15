import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import ReactMarkdown from 'react-markdown'

export default function PrivacyPolicy() {
  const [document, setDocument] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchDocument()
  }, [])

  const fetchDocument = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('document_type', 'privacy_policy')
        .single()

      if (error) throw error
      setDocument(data)
    } catch (error) {
      console.error('Error fetching privacy policy:', error)
      toast({
        title: "Error",
        description: "Failed to load privacy policy",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Privacy policy not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl text-foreground">{document.title}</CardTitle>
            <p className="text-muted-foreground">
              Last updated: {new Date(document.last_updated).toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent>
            <div className="prose prose-gray max-w-none dark:prose-invert">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-2xl font-bold text-foreground mb-4">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-xl font-semibold text-foreground mt-6 mb-3">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-lg font-medium text-foreground mt-4 mb-2">{children}</h3>,
                  p: ({ children }) => <p className="text-muted-foreground mb-4 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-6 mb-4 text-muted-foreground">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 text-muted-foreground">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                }}
              >
                {document.content}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}