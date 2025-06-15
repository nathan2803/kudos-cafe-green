import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { LegalDocumentsEditor } from '@/components/admin/LegalDocumentsEditor'
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Shield, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Mail,
  Phone,
  Calendar,
  Activity,
  MoreHorizontal,
  Users,
  FileText
} from 'lucide-react'

interface User {
  id: string
  user_id: string
  email: string
  full_name: string
  phone?: string
  is_admin: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}

interface UserManagementProps {
  users: User[]
  onUserUpdate: (updatedUser: User) => void
  onUserDelete: (userId: string) => void
}

export const UserManagement = ({ users, onUserUpdate, onUserDelete }: UserManagementProps) => {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.phone && user.phone.includes(searchTerm))
    
    const matchesRole = roleFilter === 'all' || 
                       (roleFilter === 'admin' && user.is_admin) ||
                       (roleFilter === 'customer' && !user.is_admin)
    
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'verified' && user.is_verified) ||
                         (statusFilter === 'unverified' && !user.is_verified)
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const updateUserRole = async (userId: string, isAdmin: boolean) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: isAdmin })
        .eq('user_id', userId)

      if (error) throw error

      const updatedUser = users.find(u => u.user_id === userId)
      if (updatedUser) {
        onUserUpdate({ ...updatedUser, is_admin: isAdmin })
      }

      toast({
        title: "User Role Updated",
        description: `User ${isAdmin ? 'promoted to admin' : 'demoted to customer'}`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateUserVerification = async (userId: string, isVerified: boolean) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: isVerified })
        .eq('user_id', userId)

      if (error) throw error

      const updatedUser = users.find(u => u.user_id === userId)
      if (updatedUser) {
        onUserUpdate({ ...updatedUser, is_verified: isVerified })
      }

      toast({
        title: "User Verification Updated",
        description: `User ${isVerified ? 'verified' : 'unverified'}`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user verification",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateUserProfile = async (user: User, updates: Partial<User>) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.user_id)

      if (error) throw error

      onUserUpdate({ ...user, ...updates })
      setEditingUser(null)

      toast({
        title: "User Profile Updated",
        description: "User information has been updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user profile",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId: string) => {
    setLoading(true)
    try {
      // Note: This will only delete the profile, not the auth user
      // To delete auth users, you'd need admin privileges
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId)

      if (error) throw error

      onUserDelete(userId)

      toast({
        title: "User Profile Deleted",
        description: "User profile has been removed from the system",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <Tabs defaultValue="users" className="space-y-6">
      <TabsList>
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          User Management
        </TabsTrigger>
        <TabsTrigger value="legal" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Legal Documents
        </TabsTrigger>
      </TabsList>

      <TabsContent value="users" className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{user.full_name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>User Details - {user.full_name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">Full Name</Label>
                            <p className="text-sm">{user.full_name}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">Email</Label>
                            <p className="text-sm">{user.email}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">Phone</Label>
                            <p className="text-sm">{user.phone || 'Not provided'}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">Role</Label>
                            <div className="mt-1">
                              <Badge variant={user.is_admin ? "default" : "secondary"}>
                                {user.is_admin ? "Admin" : "Customer"}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                            <div className="mt-1">
                              <Badge variant={user.is_verified ? "default" : "destructive"}>
                                {user.is_verified ? "Verified" : "Unverified"}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">Joined</Label>
                            <p className="text-sm">{formatDate(user.created_at)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-4 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>

                        <Button
                          size="sm"
                          variant={user.is_admin ? "destructive" : "default"}
                          onClick={() => updateUserRole(user.user_id, !user.is_admin)}
                          disabled={loading}
                        >
                          {user.is_admin ? (
                            <>
                              <Shield className="w-4 h-4 mr-2" />
                              Demote to Customer
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4 mr-2" />
                              Promote to Admin
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant={user.is_verified ? "destructive" : "default"}
                          onClick={() => updateUserVerification(user.user_id, !user.is_verified)}
                          disabled={loading}
                        >
                          {user.is_verified ? (
                            <>
                              <UserX className="w-4 h-4 mr-2" />
                              Unverify
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Verify
                            </>
                          )}
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User Profile</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {user.full_name}'s profile? This action cannot be undone.
                                Note: This will only delete the profile data, not the authentication account.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteUser(user.user_id)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete Profile
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Role</span>
                  <Badge variant={user.is_admin ? "default" : "secondary"} className="text-xs">
                    {user.is_admin ? "Admin" : "Customer"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <Badge variant={user.is_verified ? "default" : "destructive"} className="text-xs">
                    {user.is_verified ? "Verified" : "Unverified"}
                  </Badge>
                </div>

                {user.phone && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Phone className="w-3 h-3 mr-1" />
                    {user.phone}
                  </div>
                )}

                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3 mr-1" />
                  Joined {formatDate(user.created_at)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={editingUser.full_name}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={editingUser.phone || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_admin"
                  checked={editingUser.is_admin}
                  onCheckedChange={(checked) => setEditingUser({ ...editingUser, is_admin: checked })}
                />
                <Label htmlFor="is_admin">Admin privileges</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_verified"
                  checked={editingUser.is_verified}
                  onCheckedChange={(checked) => setEditingUser({ ...editingUser, is_verified: checked })}
                />
                <Label htmlFor="is_verified">Verified user</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setEditingUser(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => updateUserProfile(users.find(u => u.id === editingUser.id)!, editingUser)}
                  disabled={loading}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No users found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try adjusting your search criteria' : 'No users match the current filters'}
          </p>
        </div>
      )}
      </TabsContent>

      <TabsContent value="legal">
        <LegalDocumentsEditor />
      </TabsContent>
    </Tabs>
  )
}

export default UserManagement