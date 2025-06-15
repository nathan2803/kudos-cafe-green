import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { FileText, Save, Eye } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface LegalDocument {
  id: string
  document_type: string
  title: string
  content: string
  last_updated: string
}

export function LegalDocumentsEditor() {
  const [documents, setDocuments] = useState<LegalDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [editingDoc, setEditingDoc] = useState<LegalDocument | null>(null)
  const [previewMode, setPreviewMode] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .order('document_type')

      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      console.error('Error fetching legal documents:', error)
      toast({
        title: "Error",
        description: "Failed to load legal documents",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (doc: LegalDocument) => {
    setEditingDoc({ ...doc })
    setPreviewMode(null)
  }

  const handleSave = async () => {
    if (!editingDoc) return

    setSaving(editingDoc.id)
    try {
      const { error } = await supabase
        .from('legal_documents')
        .update({
          title: editingDoc.title,
          content: editingDoc.content,
          last_updated: new Date().toISOString()
        })
        .eq('id', editingDoc.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Legal document updated successfully"
      })

      await fetchDocuments()
      setEditingDoc(null)
    } catch (error) {
      console.error('Error updating document:', error)
      toast({
        title: "Error",
        description: "Failed to update document",
        variant: "destructive"
      })
    } finally {
      setSaving(null)
    }
  }

  const handleCancel = () => {
    setEditingDoc(null)
    setPreviewMode(null)
  }

  const togglePreview = (docId: string) => {
    setPreviewMode(previewMode === docId ? null : docId)
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'privacy_policy':
        return 'Privacy Policy'
      case 'terms_of_service':
        return 'Terms of Service'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Legal Documents</h3>
      </div>

      {editingDoc ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit {getDocumentTypeLabel(editingDoc.document_type)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editingDoc.title}
                onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content (Markdown supported)</Label>
              <Textarea
                id="content"
                value={editingDoc.content}
                onChange={(e) => setEditingDoc({ ...editingDoc, content: e.target.value })}
                className="min-h-[400px] font-mono text-sm"
                placeholder="Enter document content using Markdown formatting..."
              />
              <p className="text-xs text-muted-foreground">
                Use Markdown syntax: # for headers, ** for bold, * for italic, - for lists
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving === editingDoc.id}>
                <Save className="w-4 h-4 mr-2" />
                {saving === editingDoc.id ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => togglePreview(editingDoc.id)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {previewMode === editingDoc.id ? 'Hide Preview' : 'Show Preview'}
              </Button>
            </div>

            {previewMode === editingDoc.id && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
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
                      {editingDoc.content}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{doc.title}</CardTitle>
                  <Badge variant="secondary">
                    {getDocumentTypeLabel(doc.document_type)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date(doc.last_updated).toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button onClick={() => handleEdit(doc)} size="sm">
                    Edit Document
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePreview(doc.id)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {previewMode === doc.id ? 'Hide' : 'Preview'}
                  </Button>
                </div>

                {previewMode === doc.id && (
                  <div className="mt-4 p-4 border rounded-lg bg-muted/50 max-h-60 overflow-y-auto">
                    <div className="prose prose-sm prose-gray max-w-none dark:prose-invert">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => <h1 className="text-lg font-bold text-foreground mb-2">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-semibold text-foreground mt-4 mb-2">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-medium text-foreground mt-3 mb-1">{children}</h3>,
                          p: ({ children }) => <p className="text-muted-foreground mb-2 text-sm leading-relaxed">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 text-muted-foreground text-sm">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 text-muted-foreground text-sm">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                        }}
                      >
                        {doc.content.substring(0, 500) + (doc.content.length > 500 ? '...' : '')}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}