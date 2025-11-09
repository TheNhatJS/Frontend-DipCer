'use client'

import React, { useState, useEffect } from 'react'
import { toast, Toaster } from 'sonner'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import axiosInstance from '@/lib/axios'
import axios from 'axios'
import { batchMintDiplomas, getCurrentWalletAddress } from '@/lib/contract'
import { DiplomaDraft, StepType } from '@/types/diploma-draft'

// Components
import UploadExcelStep from '@/components/diploma-issuance/UploadExcelStep'
import DraftsTableStep from '@/components/diploma-issuance/DraftsTableStep'
import UploadImagesStep from '@/components/diploma-issuance/UploadImagesStep'

export default function IssueCertificatePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // State management
  const [currentStep, setCurrentStep] = useState<StepType>('drafts')
  const [drafts, setDrafts] = useState<DiplomaDraft[]>([])
  const [selectedDrafts, setSelectedDrafts] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showWalletMismatchModal, setShowWalletMismatchModal] = useState(false)
  const [walletMismatchInfo, setWalletMismatchInfo] = useState<{
    registered: string
    current: string
  } | null>(null)

  // Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Vui lòng đăng nhập để tiếp tục.')
      router.push('/auth/login')
    }

    if (status === 'authenticated') {
      const role = session?.user?.role

      if (role !== 'ISSUER' && role !== 'DELEGATE') {
        toast.error('Bạn không có quyền truy cập trang này!')
        router.push('/')
      }
    }
  }, [status, session, router])

  // Load drafts on mount and when step changes
  useEffect(() => {
    if (session) {
      loadDrafts()
    }
  }, [session, currentStep])

  // Load all drafts
  const loadDrafts = async () => {
    try {
      const res = await axiosInstance.get('/diploma-drafts')
      setDrafts(res.data)
    } catch (error: any) {
      console.error('Error loading drafts:', error)
      toast.error('Không thể tải danh sách bản nháp')
    }
  }

  // Step 1: Upload Excel
  const handleUploadExcel = async (file: File) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await axiosInstance.post('/diploma-drafts/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success(`✅ Đã import ${res.data.imported} bản nháp thành công!`)
      
      if (res.data.skipped > 0) {
        toast.warning(`⚠️ Đã bỏ qua ${res.data.skipped} bản nháp trùng lặp`)
      }
      
      if (res.data.failed > 0) {
        toast.error(`❌ ${res.data.failed} bản nháp lỗi`)
      }

      // Reload drafts and close modal
      await loadDrafts()
      setShowUploadModal(false)
    } catch (error: any) {
      console.error('Error uploading Excel:', error)
      toast.error(error.response?.data?.message || 'Lỗi khi upload Excel')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Edit Draft
  const handleEditDraft = async (id: number, data: Partial<DiplomaDraft>) => {
    await axiosInstance.patch(`/diploma-drafts/${id}`, data)
  }

  // Step 2: Delete Draft
  const handleDeleteDraft = async (id: number) => {
    await axiosInstance.delete(`/diploma-drafts/${id}`)
  }

  // Step 3: Upload Images
  const handleUploadImages = async (files: File[], draftIds: number[]) => {
    setLoading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      
      // Add all image files
      files.forEach(file => {
        formData.append('files', file)
      })
      
      // Add draft IDs
      formData.append('draftIds', JSON.stringify(draftIds))

      const res = await axiosInstance.post('/diploma-drafts/upload-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          )
          setUploadProgress(percentCompleted)
        },
      })

      toast.success(`✅ Đã upload ${res.data.success} ảnh thành công!`)
      
      if (res.data.failed > 0) {
        toast.warning(`⚠️ ${res.data.failed} ảnh thất bại`)
        
        // Show detailed errors
        const failedResults = res.data.results?.filter((r: any) => !r.success)
        if (failedResults && failedResults.length > 0) {
          failedResults.forEach((result: any) => {
            toast.error(
              `❌ ${result.studentId || result.serialNumber}: ${result.error}`,
              { duration: 8000 }
            )
          })
        }
      }

      // Reload drafts
      await loadDrafts()
      
      // Only proceed if at least some uploads succeeded
      if (res.data.success > 0) {
        setCurrentStep('review')
      }
      
      setUploadProgress(0)
    } catch (error: any) {
      console.error('Error uploading images:', error)
      toast.error(error.response?.data?.message || 'Lỗi khi upload ảnh')
    } finally {
      setLoading(false)
    }
  }

  // Step 4: Approve Drafts
  const handleApproveDrafts = async () => {
    if (selectedDrafts.length === 0) {
      toast.error('Vui lòng chọn ít nhất một bản nháp!')
      return
    }

    setLoading(true)
    try {
      const res = await axiosInstance.post('/diploma-drafts/approve', {
        ids: selectedDrafts,
      })

      toast.success(`✅ Đã phê duyệt ${res.data.count} bản nháp!`)
      
      // Reload drafts
      await loadDrafts()
      setCurrentStep('mint')
      setSelectedDrafts([])
    } catch (error: any) {
      console.error('Error approving drafts:', error)
      toast.error(error.response?.data?.message || 'Lỗi khi phê duyệt')
    } finally {
      setLoading(false)
    }
  }

  // Step 5: Batch Mint
  const handleBatchMint = async () => {
    const approvedDrafts = drafts.filter(d => d.isApproved && !d.isMinted && d.imageCID)
    
    if (approvedDrafts.length === 0) {
      toast.error('Không có bản nháp nào đã được phê duyệt!')
      return
    }

    setLoading(true)
    try {
      // Kiểm tra có institution code và wallet address trong session
      if (!session?.user?.code || !session?.user?.address) {
        toast.error('Không tìm thấy thông tin trường hoặc địa chỉ ví trong session')
        setLoading(false)
        return
      }

      // Bước 1: Kiểm tra địa chỉ ví hiện tại khớp với session
      toast.info('🔍 Đang kiểm tra địa chỉ ví...')
      const currentWallet = await getCurrentWalletAddress()
      
      if (!currentWallet) {
        toast.error('Không thể lấy địa chỉ ví. Vui lòng kết nối MetaMask')
        setLoading(false)
        return
      }

      // So sánh địa chỉ ví (case-insensitive)
      if (currentWallet.toLowerCase() !== session.user.address.toLowerCase()) {
        toast.error(
          `Địa chỉ ví không khớp!\nVí hiện tại: ${currentWallet}\nVí trong hệ thống: ${session.user.address}\nVui lòng chuyển sang đúng ví trong MetaMask`,
          { duration: 8000 }
        )
        setLoading(false)
        return
      }

      toast.success(`✅ Xác thực ví thành công!`)

      // Prepare batch data for blockchain
      const batchData = approvedDrafts.map(draft => ({
        studentAddress: draft.studentAddress,
        serialNumber: draft.serialNumber,
        tokenURI: '', // Will be generated from metadata
        issueDate: Math.floor(Date.now() / 1000),
      }))

      toast.info('📤 Đang upload metadata lên IPFS...')

      // ✅ Lấy thông tin trường - hoạt động cho cả ISSUER và DELEGATE
      const schoolResponse = await axiosInstance.get(`/dip-issuer/me/info`)
      const schoolData = schoolResponse.data
      
      console.log('📚 School data from API:', schoolData)
      console.log('📚 Institution name:', schoolData.schoolName)

      // Upload metadata for each draft
      const metadataPromises = approvedDrafts.map(async (draft) => {
        const metadata = {
          name: `Diploma - ${draft.faculty}`,
          description: 'Bằng cấp đại học',
          studentID: draft.studentId,
          studentName: draft.studentName,
          gpa: draft.GPA,
          faculty: draft.faculty,
          class: draft.studentClass,
          issueDate: new Date().toISOString().split('T')[0],
          institutionName: schoolData.schoolName || 'Unknown', // ✅ Luôn lấy từ schoolData
          institutionCode: schoolData.code || session?.user?.code || 'UNKNOWN',
          image: draft.imageCID,
        }

        console.log('📝 Metadata to upload:', metadata)

        const res = await axios.post('/api/upload/metadata', metadata, {
          headers: { 'Content-Type': 'application/json' },
        })

        return res.data.pinataURL
      })

      const tokenURIs = await Promise.all(metadataPromises)
      
      // Update batch data with tokenURIs
      batchData.forEach((item, index) => {
        item.tokenURI = tokenURIs[index]
      })

      toast.info('⛓️ Đang mint văn bằng lên blockchain...')

      // Get institution code from session
      const institutionCode = session?.user?.code || 'UNKNOWN'
      
      // Mint on blockchain
      const blockchainResult = await batchMintDiplomas(batchData, institutionCode)

      if (!blockchainResult.success || !blockchainResult.tokenIds) {
        toast.error(`❌ ${blockchainResult.error || 'Lỗi không xác định'}`)
        return
      }

      const { tokenIds, txHash } = blockchainResult
      toast.success(`✅ Đã mint ${tokenIds.length} văn bằng thành công!`)

      toast.info('💾 Đang lưu vào database...')

      // Lấy issueDate từ blockchain cho mỗi diploma
      const { getDiplomaFromBlockchain } = await import('@/lib/contract')
      
      console.log('🔍 Đang lấy issueDate từ blockchain...')
      const diplomasWithIssueDate = await Promise.all(
        tokenIds.map(async (tokenId) => {
          try {
            const blockchainDiploma = await getDiplomaFromBlockchain(tokenId)
            return {
              tokenId,
              issueDate: blockchainDiploma.issueDate ? new Date(Number(blockchainDiploma.issueDate) * 1000).toISOString() : new Date().toISOString()
            }
          } catch (error) {
            console.error(`Error getting diploma ${tokenId}:`, error)
            return {
              tokenId,
              issueDate: new Date().toISOString() // fallback
            }
          }
        })
      )
      
      console.log('✅ Đã lấy issueDate từ blockchain:', diplomasWithIssueDate)

      // Prepare diploma data for batch creation
      const diplomaData = approvedDrafts.map((draft, index) => ({
        id: tokenIds[index],
        serialNumber: draft.serialNumber,
        studentId: draft.studentId,
        studentName: draft.studentName,
        studentEmail: draft.studentEmail,
        studentDayOfBirth: draft.studentDayOfBirth,
        studentGender: draft.studentGender,
        studentPhone: draft.studentPhone,
        studentAddress: draft.studentAddress,
        studentClass: draft.studentClass,
        faculty: draft.faculty,
        tokenURI: tokenURIs[index],
        GPA: draft.GPA,
        issuedAt: diplomasWithIssueDate[index].issueDate, // ✅ Thêm issueDate từ blockchain
      }))

      // Save all diplomas to database using batch endpoint
      await axiosInstance.post('/diplomas/batch', {
        diplomas: diplomaData,
      })

      // Mark all drafts as minted
      await axiosInstance.post('/diploma-drafts/mark-many-as-minted', {
        draftIds: approvedDrafts.map(d => d.id),
        diplomaIds: tokenIds,
      })

      toast.success(`🎉 Hoàn tất! Đã cấp phát ${tokenIds.length} văn bằng thành công!`)
      
      // Reload drafts
      await loadDrafts()
      setCurrentStep('drafts')
    } catch (error: any) {
      console.error('Error batch minting:', error)
      toast.error(error.response?.data?.message || error.message || 'Lỗi khi mint hàng loạt')
    } finally {
      setLoading(false)
    }
  }

  // Toggle draft selection
  const toggleDraftSelection = (id: number) => {
    setSelectedDrafts(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  // Select all drafts (only unapproved drafts with images)
  const selectAllDrafts = () => {
    const availableDrafts = drafts.filter(d => !d.isMinted && !d.isApproved && d.imageCID)
    if (selectedDrafts.length === availableDrafts.length) {
      setSelectedDrafts([])
    } else {
      setSelectedDrafts(availableDrafts.map(d => d.id))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white px-4 py-8">
      <Toaster position="top-right" richColors />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
            Cấp phát văn bằng hàng loạt
          </h1>
          <p className="text-gray-400">
            Quy trình tối ưu hóa cấp phát văn bằng với batch processing
          </p>
          
          {/* Upload Excel Button */}
          <div className="mt-4">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-semibold transition-all shadow-lg inline-flex items-center gap-2"
            >
              <span>Tải lên Excel mới</span>
            </button>
          </div>
        </div>

        {/* Progress Steps - Updated */}
        <div className="flex justify-center mb-8 overflow-x-auto pb-4">
          <div className="flex items-center gap-4">
            {[
              { id: 'drafts', label: '1. Quản lý' },
              { id: 'images', label: '2. Upload Ảnh' },
              { id: 'review', label: '3. Phê duyệt' },
              { id: 'mint', label: '4. Mint NFT' },
            ].map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                    currentStep === step.id
                      ? 'bg-blue-600 text-white scale-105'
                      : 'bg-white/5 text-gray-400'
                  }`}
                >
                  {step.label}
                </div>
                {index < 3 && (
                  <div className="w-8 h-0.5 bg-gray-600 mx-2"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white/5 border border-white/10 rounded-2xl shadow-lg backdrop-blur-md p-8">
          
          {/* Step 1: Manage Drafts Table */}
          {currentStep === 'drafts' && (
            <DraftsTableStep
              drafts={drafts}
              loading={loading}
              onEdit={handleEditDraft}
              onDelete={handleDeleteDraft}
              onNext={() => setCurrentStep('images')}
              onBack={() => setCurrentStep('drafts')}
              onRefresh={loadDrafts}
            />
          )}

          {/* Step 2: Upload Images */}
          {currentStep === 'images' && (
            <UploadImagesStep
              drafts={drafts}
              loading={loading}
              uploadProgress={uploadProgress}
              onUpload={handleUploadImages}
              onNext={() => setCurrentStep('review')}
              onBack={() => setCurrentStep('drafts')}
            />
          )}

          {/* Step 3: Review & Approve */}
          {currentStep === 'review' && (
            <ReviewApproveStep
              drafts={drafts}
              selectedDrafts={selectedDrafts}
              loading={loading}
              onToggleSelection={toggleDraftSelection}
              onSelectAll={selectAllDrafts}
              onApprove={handleApproveDrafts}
              onNext={() => setCurrentStep('mint')}
              onBack={() => setCurrentStep('images')}
            />
          )}

          {/* Step 4: Batch Mint */}
          {currentStep === 'mint' && (
            <BatchMintStep
              drafts={drafts}
              loading={loading}
              onMint={handleBatchMint}
              onBack={() => setCurrentStep('review')}
            />
          )}
        </div>
      </div>

      {/* Upload Excel Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">Upload Excel</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>
            
            <UploadExcelStep
              onUploadSuccess={loadDrafts}
              onUpload={handleUploadExcel}
              loading={loading}
            />
            
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Mismatch Modal */}
      {showWalletMismatchModal && walletMismatchInfo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-red-500/50 rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-red-400 mb-2">Địa chỉ ví không khớp!</h2>
              <p className="text-gray-400">
                Bạn đang sử dụng ví khác với ví đã đăng ký
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-sm text-green-400 mb-1">✅ Ví đã đăng ký:</p>
                <p className="font-mono text-white break-all">{walletMismatchInfo.registered}</p>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-sm text-red-400 mb-1">❌ Ví hiện tại (MetaMask):</p>
                <p className="font-mono text-white break-all">{walletMismatchInfo.current}</p>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-300 font-semibold mb-2">Hướng dẫn:</p>
              <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                <li>Mở MetaMask</li>
                <li>Click vào icon tài khoản (góc trên bên phải)</li>
                <li>Chọn tài khoản có địa chỉ: <span className="text-green-400 font-mono">{walletMismatchInfo.registered.slice(0, 10)}...</span></li>
                <li>Quay lại trang này và thử lại</li>
              </ol>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowWalletMismatchModal(false)
                  setWalletMismatchInfo(null)
                }}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl font-semibold transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setShowWalletMismatchModal(false)
                  setWalletMismatchInfo(null)
                  // Thử lại sau khi đóng modal
                  setTimeout(() => {
                    handleBatchMint()
                  }, 500)
                }}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-colors"
              >
                Đã chuyển ví, thử lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Review & Approve Step Component
function ReviewApproveStep({
  drafts,
  selectedDrafts,
  loading,
  onToggleSelection,
  onSelectAll,
  onApprove,
  onNext,
  onBack,
}: any) {
  const [previewDraft, setPreviewDraft] = React.useState<DiplomaDraft | null>(null)
  
  // Check if all drafts with images are approved
  const draftsWithImages = drafts.filter((d: DiplomaDraft) => !d.isMinted && d.imageCID)
  const unapprovedDrafts = draftsWithImages.filter((d: DiplomaDraft) => !d.isApproved)
  const allApproved = draftsWithImages.length > 0 && unapprovedDrafts.length === 0

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">✅ Bước 3: Phê Duyệt Bản Nháp</h2>
        <p className="text-gray-400 mb-6">
          Kiểm tra và phê duyệt các bản nháp trước khi mint
        </p>
      </div>

      {/* All Approved State */}
      {allApproved ? (
        <div className="space-y-6">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-semibold mb-2 text-green-400">
              Tất cả bản nháp đã được phê duyệt!
            </h3>
            <p className="text-gray-400 mb-4">
              Có {draftsWithImages.length} bản nháp đã sẵn sàng để mint
            </p>
          </div>

          {/* Preview Approved Drafts */}
          <div>
            <h3 className="text-lg font-semibold mb-4">📋 Danh sách bản nháp đã phê duyệt:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {draftsWithImages.map((draft: DiplomaDraft) => (
                <div
                  key={draft.id}
                  className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-all cursor-pointer"
                  onClick={() => setPreviewDraft(draft)}
                >
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    {draft.imageCID && (
                      <img
                        src={draft.imageCID}
                        alt={draft.studentName}
                        className="w-20 h-20 object-cover rounded-lg border border-green-500/50"
                      />
                    )}
                    
                    {/* Info */}
                    <div className="flex-1">
                      <p className="font-semibold text-white">{draft.studentName}</p>
                      <p className="text-sm text-gray-400">MSSV: {draft.studentId}</p>
                      <p className="text-sm text-gray-400">Serial: {draft.serialNumber}</p>
                      <p className="text-sm text-green-400">GPA: {draft.GPA} - {draft.classification}</p>
                    </div>
                    
                    {/* Badge */}
                    <div className="text-green-400 text-xl">✓</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-400 mt-2 text-center">
              💡 Click vào bản nháp để xem chi tiết
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={onBack}
              className="px-8 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl text-lg font-semibold transition-colors"
            >
              ⬅️ Quay lại
            </button>
            <button
              onClick={onNext}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 px-8 py-3 rounded-xl text-lg font-semibold transition-transform"
            >
              Tiếp theo ➡️
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Draft List - Need Approval */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Chọn bản nháp để phê duyệt</h3>
              <button
                onClick={onSelectAll}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm"
              >
                {selectedDrafts.length === unapprovedDrafts.length
                  ? '❌ Bỏ chọn tất cả'
                  : '✅ Chọn tất cả'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {drafts.filter((d: DiplomaDraft) => !d.isMinted).map((draft: DiplomaDraft) => (
                <div
                  key={draft.id}
                  onClick={() => !draft.isApproved && draft.imageCID && onToggleSelection(draft.id)}
                  className={`p-4 rounded-lg border transition-all ${
                    draft.isApproved
                      ? 'bg-green-500/10 border-green-500/50 cursor-default'
                      : !draft.imageCID
                      ? 'bg-red-500/10 border-red-500/50 cursor-not-allowed opacity-50'
                      : selectedDrafts.includes(draft.id)
                      ? 'bg-blue-500/20 border-blue-500 cursor-pointer'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    {draft.imageCID ? (
                      <img
                        src={draft.imageCID}
                        alt={draft.studentName}
                        className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform"
                        onClick={(e) => {
                          e.stopPropagation()
                          setPreviewDraft(draft)
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center text-gray-500">
                        ❌
                      </div>
                    )}
                    
                    {/* Info */}
                    <div className="flex-1">
                      <p className="font-semibold">{draft.studentName}</p>
                      <p className="text-sm text-gray-400">
                        MSSV: {draft.studentId}
                      </p>
                      <p className="text-sm text-gray-400">
                        GPA: {draft.GPA} | {draft.classification}
                      </p>
                      <div className="mt-1 space-y-1">
                        {draft.imageCID ? (
                          <span className="text-green-400 text-xs">✅ Có ảnh</span>
                        ) : (
                          <span className="text-red-400 text-xs">❌ Chưa có ảnh</span>
                        )}
                        {draft.isApproved && (
                          <span className="text-green-400 text-xs block">🎯 Đã phê duyệt</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-400 mt-2">
              Đã chọn: {selectedDrafts.length} bản nháp | 
              Chưa phê duyệt: {unapprovedDrafts.length} | 
              Đã phê duyệt: {draftsWithImages.length - unapprovedDrafts.length}
            </p>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={onBack}
              className="px-8 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl text-lg font-semibold transition-colors"
            >
              ⬅️ Quay lại
            </button>
            <button
              onClick={onApprove}
              disabled={selectedDrafts.length === 0 || loading}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-105 px-8 py-3 rounded-xl text-lg font-semibold transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Đang xử lý...' : `✅ Phê duyệt (${selectedDrafts.length})`}
            </button>
          </div>
        </>
      )}

      {/* Preview Modal */}
      {previewDraft && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewDraft(null)}
        >
          <div 
            className="bg-slate-800 border border-white/10 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold">🎓 Chi tiết văn bằng</h2>
              <button
                onClick={() => setPreviewDraft(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Image Preview */}
              {previewDraft.imageCID && (
                <div className="text-center">
                  <img
                    src={previewDraft.imageCID}
                    alt={previewDraft.studentName}
                    className="max-w-full max-h-96 mx-auto rounded-lg border border-white/20 shadow-lg"
                  />
                </div>
              )}

              {/* Student Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400">Họ và tên</label>
                    <p className="text-lg font-semibold">{previewDraft.studentName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">MSSV</label>
                    <p className="font-mono">{previewDraft.studentId}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <p className="text-sm">{previewDraft.studentEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Số điện thoại</label>
                    <p>{previewDraft.studentPhone}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Ngày sinh</label>
                    <p>{new Date(previewDraft.studentDayOfBirth).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400">Số serial</label>
                    <p className="font-mono">{previewDraft.serialNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Lớp</label>
                    <p>{previewDraft.studentClass}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Khoa</label>
                    <p>{previewDraft.faculty}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">GPA</label>
                    <p className="text-xl font-bold text-blue-400">{previewDraft.GPA}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Xếp loại</label>
                    <p className="text-lg font-semibold text-green-400">{previewDraft.classification}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-sm text-gray-400">Địa chỉ</label>
                <p>{previewDraft.studentAddress}</p>
              </div>

              {/* Status */}
              <div className="flex gap-4 pt-4 border-t border-white/10">
                {previewDraft.imageCID && (
                  <span className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg">
                    ✅ Đã có ảnh
                  </span>
                )}
                {previewDraft.isApproved && (
                  <span className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg">
                    🎯 Đã phê duyệt
                  </span>
                )}
                {previewDraft.isMinted && (
                  <span className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg">
                    ⛓️ Đã mint
                  </span>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 text-center">
              <button
                onClick={() => setPreviewDraft(null)}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Batch Mint Step Component
function BatchMintStep({ drafts, loading, onMint, onBack }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">⛓️ Bước 4: Mint NFT Hàng Loạt</h2>
        <p className="text-gray-400 mb-6">
          Cấp phát văn bằng lên blockchain với batch minting
        </p>
      </div>

      {/* Approved Drafts Summary */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Tổng quan</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-400">
              {drafts.filter((d: DiplomaDraft) => d.isApproved && !d.isMinted).length}
            </p>
            <p className="text-sm text-gray-400">Đã phê duyệt</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">
              {drafts.filter((d: DiplomaDraft) => d.isMinted).length}
            </p>
            <p className="text-sm text-gray-400">Đã mint</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-400">
              {drafts.filter((d: DiplomaDraft) => !d.isApproved && !d.isMinted).length}
            </p>
            <p className="text-sm text-gray-400">Chưa phê duyệt</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-400">
              {drafts.length}
            </p>
            <p className="text-sm text-gray-400">Tổng cộng</p>
          </div>
        </div>
      </div>

      {/* Approved Drafts List */}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {drafts.filter((d: DiplomaDraft) => d.isApproved && !d.isMinted).map((draft: DiplomaDraft) => (
          <div
            key={draft.id}
            className="p-4 rounded-lg bg-green-500/10 border border-green-500/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold">{draft.studentName}</p>
                <p className="text-sm text-gray-400">
                  MSSV: {draft.studentId} | Serial: {draft.serialNumber}
                </p>
                <p className="text-sm text-gray-400">
                  GPA: {draft.GPA} | {draft.classification}
                </p>
              </div>
              <div className="text-right">
                <span className="text-green-400">🎯 Sẵn sàng mint</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={onBack}
          className="px-8 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl text-lg font-semibold transition-colors"
        >
          ⬅️ Quay lại
        </button>
        <button
          onClick={onMint}
          disabled={drafts.filter((d: DiplomaDraft) => d.isApproved && !d.isMinted).length === 0 || loading}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:scale-105 px-8 py-3 rounded-xl text-lg font-semibold transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '⏳ Đang mint...' : `⛓️ Mint ${drafts.filter((d: DiplomaDraft) => d.isApproved && !d.isMinted).length} văn bằng`}
        </button>
      </div>

      {/* Warning */}
      <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <p className="text-sm text-amber-300">
          ⚠️ <strong>Lưu ý:</strong> Quá trình mint sẽ:
          <br />• Upload metadata lên IPFS
          <br />• Thực hiện batch mint trên blockchain (cần MetaMask)
          <br />• Lưu thông tin vào database
          <br />• Đánh dấu các bản nháp là đã mint
        </p>
      </div>
    </div>
  )
}
