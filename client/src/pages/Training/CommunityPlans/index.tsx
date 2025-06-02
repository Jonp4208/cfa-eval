import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { 
  Search, 
  Share2, 
  Download, 
  Eye, 
  Users, 
  GraduationCap, 
  Clock, 
  Star,
  TrendingUp,
  Award,
  Globe,
  Heart,
  Copy,
  CheckCircle2,
  Building2,
  MapPin,
  Filter
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/lib/axios'
import { toast } from '@/components/ui/use-toast'

interface CommunityPlan {
  _id: string
  name: string
  description: string
  department: string
  position: string
  type: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  rating: number
  downloads: number
  likes: number
  isLiked: boolean
  tags: string[]
  store: {
    name: string
    location: string
    id: string
  }
  author: {
    name: string
    position: string
  }
  createdAt: string
  days: any[]
  isShared: boolean
}

interface User {
  _id: string
  name: string
  email: string
  position: string
  department: string
  store: {
    name: string
    location: string
  }
}

export default function CommunityPlans() {
  const navigate = useNavigate()
  const { user } = useAuth() as { user: User | null }
  const [loading, setLoading] = useState(true)
  const [communityPlans, setCommunityPlans] = useState<CommunityPlan[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [sortBy, setSortBy] = useState('popular') // popular, newest, rating
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<CommunityPlan | null>(null)

  useEffect(() => {
    fetchCommunityPlans()
  }, [sortBy])

  const fetchCommunityPlans = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/training/community-plans', {
        params: { sortBy }
      })
      setCommunityPlans(response.data)
    } catch (error) {
      console.error('Failed to fetch community plans:', error)
      // For now, set empty array since API doesn't exist yet
      setCommunityPlans([])
      // Don't show error toast since this is expected during development
    } finally {
      setLoading(false)
    }
  }

  const handleLikePlan = async (planId: string) => {
    try {
      await api.post(`/api/training/community-plans/${planId}/like`)
      setCommunityPlans(plans => 
        plans.map(plan => 
          plan._id === planId 
            ? { ...plan, isLiked: !plan.isLiked, likes: plan.isLiked ? plan.likes - 1 : plan.likes + 1 }
            : plan
        )
      )
    } catch (error) {
      console.error('Failed to like plan:', error)
      toast({
        title: 'Error',
        description: 'Failed to like plan',
        variant: 'destructive',
      })
    }
  }

  const handleAddToStore = async (plan: CommunityPlan) => {
    try {
      const response = await api.post(`/api/training/community-plans/${plan._id}/add-to-store`)
      setCommunityPlans(plans =>
        plans.map(p =>
          p._id === plan._id
            ? { ...p, downloads: response.data.downloadCount }
            : p
        )
      )
      toast({
        title: 'Success',
        description: `"${plan.name}" has been added to your training plans`,
      })
    } catch (error: any) {
      console.error('Failed to add plan to store:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add plan to your store',
        variant: 'destructive',
      })
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20'
      case 'Intermediate':
        return 'bg-[#FDB022]/10 text-[#FDB022] border-[#FDB022]/20'
      case 'Advanced':
        return 'bg-[#E51636]/10 text-[#E51636] border-[#E51636]/20'
      default:
        return 'bg-[#004F71]/10 text-[#004F71] border-[#004F71]/20'
    }
  }

  const filteredPlans = communityPlans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plan.store.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = !departmentFilter || departmentFilter === 'all' || plan.department === departmentFilter
    const matchesDifficulty = !difficultyFilter || difficultyFilter === 'all' || plan.difficulty === difficultyFilter

    return matchesSearch && matchesDepartment && matchesDifficulty
  })

  // Calculate stats
  const totalPlans = communityPlans.length
  const totalDownloads = communityPlans.reduce((sum, plan) => sum + plan.downloads, 0)
  const averageRating = communityPlans.length > 0 
    ? (communityPlans.reduce((sum, plan) => sum + plan.rating, 0) / communityPlans.length).toFixed(1)
    : '0.0'
  const uniqueStores = new Set(communityPlans.map(plan => plan.store.id)).size

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E51636]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {/* Total Plans Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#004F71] to-[#0066A1] text-white rounded-[24px] hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group">
          <CardContent className="p-4 md:p-8 relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-white/80 font-medium text-sm uppercase tracking-wide">Community Plans</p>
                <h3 className="text-4xl font-bold text-white">{totalPlans}</h3>
                <div className="flex items-center gap-2 text-white/90">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">Shared by stores</span>
                </div>
              </div>
              <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Card>

        {/* Total Downloads Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#16A34A] to-[#15803D] text-white rounded-[24px] hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group">
          <CardContent className="p-4 md:p-8 relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-white/80 font-medium text-sm uppercase tracking-wide">Total Downloads</p>
                <h3 className="text-4xl font-bold text-white">{totalDownloads}</h3>
                <div className="flex items-center gap-2 text-white/90">
                  <Download className="h-4 w-4" />
                  <span className="text-sm">Plans downloaded</span>
                </div>
              </div>
              <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Card>

        {/* Average Rating Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#FDB022] to-[#F39C12] text-white rounded-[24px] hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group">
          <CardContent className="p-4 md:p-8 relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-white/80 font-medium text-sm uppercase tracking-wide">Avg. Rating</p>
                <h3 className="text-4xl font-bold text-white">{averageRating}</h3>
                <div className="flex items-center gap-2 text-white/90">
                  <Star className="h-4 w-4" />
                  <span className="text-sm">Community rating</span>
                </div>
              </div>
              <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                <Award className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Card>

        {/* Contributing Stores Card */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#E51636] to-[#DD1A21] text-white rounded-[24px] hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 group">
          <CardContent className="p-4 md:p-8 relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-white/80 font-medium text-sm uppercase tracking-wide">Contributing Stores</p>
                <h3 className="text-4xl font-bold text-white">{uniqueStores}</h3>
                <div className="flex items-center gap-2 text-white/90">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm">Active contributors</span>
                </div>
              </div>
              <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Card>
      </div>

      {/* Enhanced Search and Filters Section */}
      <Card className="bg-white rounded-[20px] border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#27251F]/40" />
                <Input
                  placeholder="Search plans, stores, or descriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full border-gray-200 focus:border-[#E51636] focus:ring-[#E51636]/20 rounded-xl"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-[140px] rounded-xl border-gray-200">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="FOH">Front of House</SelectItem>
                    <SelectItem value="BOH">Back of House</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="w-[120px] rounded-xl border-gray-200">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] rounded-xl border-gray-200">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="downloads">Most Downloaded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Community Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlans.map((plan) => (
          <Card key={plan._id} className="bg-white rounded-[20px] border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Plan Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-gradient-to-br from-[#E51636] to-[#DD1A21] rounded-2xl flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-[#27251F] group-hover:text-[#E51636] transition-colors duration-200 line-clamp-1">
                          {plan.name}
                        </h3>
                        <p className="text-[#27251F]/60 text-sm line-clamp-1">{plan.description}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Plan Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs text-[#27251F]/60 uppercase tracking-wide font-medium">Department</p>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-[#E51636] rounded-full"></div>
                      <p className="font-medium text-[#27251F] text-sm">{plan.department}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-[#27251F]/60 uppercase tracking-wide font-medium">Duration</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#FDB022]" />
                      <p className="font-medium text-[#27251F] text-sm">{plan.duration}</p>
                    </div>
                  </div>
                </div>

                {/* Store Info */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-[#004F71]" />
                      <div>
                        <p className="font-medium text-[#27251F] text-sm">{plan.store.name}</p>
                        <p className="text-xs text-[#27251F]/60">{plan.store.location}</p>
                      </div>
                    </div>
                    <Badge className={`${getDifficultyColor(plan.difficulty)} border text-xs`}>
                      {plan.difficulty}
                    </Badge>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-[#FDB022] fill-current" />
                      <span className="font-medium text-[#27251F]">{plan.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4 text-[#004F71]" />
                      <span className="font-medium text-[#27251F]">{plan.downloads}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className={`h-4 w-4 ${plan.isLiked ? 'text-[#E51636] fill-current' : 'text-[#27251F]/40'}`} />
                      <span className="font-medium text-[#27251F]">{plan.likes}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/training/community-plans/${plan._id}`)}
                    className="flex-1 gap-2 border-[#004F71]/20 text-[#004F71] hover:bg-[#004F71]/5 hover:border-[#004F71] rounded-xl transition-all duration-200 font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    onClick={() => handleAddToStore(plan)}
                    className="flex-1 gap-2 bg-gradient-to-r from-[#E51636] to-[#DD1A21] hover:from-[#DD1A21] hover:to-[#E51636] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
                  >
                    <Download className="h-4 w-4" />
                    Add to Store
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleLikePlan(plan._id)}
                    className={`rounded-xl transition-all duration-200 ${
                      plan.isLiked
                        ? 'text-[#E51636] hover:bg-[#E51636]/5'
                        : 'text-[#27251F]/40 hover:text-[#E51636] hover:bg-[#E51636]/5'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${plan.isLiked ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredPlans.length === 0 && !loading && (
        <Card className="bg-white rounded-[20px] border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="h-20 w-20 bg-gradient-to-br from-[#004F71]/10 to-[#0066A1]/10 rounded-3xl flex items-center justify-center">
                <Globe className="h-10 w-10 text-[#004F71]" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-xl text-[#27251F]">No Community Plans Found</h3>
                <p className="text-[#27251F]/60 max-w-md">
                  {searchQuery || (departmentFilter && departmentFilter !== 'all') || (difficultyFilter && difficultyFilter !== 'all')
                    ? 'No plans match your current search criteria. Try adjusting your filters or search terms.'
                    : 'Be the first to share a training plan with the community! Help other stores by sharing your successful training programs.'
                  }
                </p>
              </div>
              {(!searchQuery && (!departmentFilter || departmentFilter === 'all') && (!difficultyFilter || difficultyFilter === 'all')) && (
                <Button
                  onClick={() => navigate('/training/plans')}
                  className="gap-2 bg-gradient-to-r from-[#E51636] to-[#DD1A21] hover:from-[#DD1A21] hover:to-[#E51636] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 px-8"
                >
                  <Share2 className="h-4 w-4" />
                  Share Your First Plan
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
