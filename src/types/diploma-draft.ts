export interface DiplomaDraft {
  id: number
  serialNumber: string
  studentId: string
  studentName: string
  studentEmail: string
  studentPhone: string
  studentDayOfBirth: string
  studentGender: 'MALE' | 'FEMALE'
  studentAddress: string
  studentClass: string
  faculty: string
  GPA: number
  classification: 'EXCELLENT' | 'GOOD' | 'CREDIT' | 'AVERAGE' | 'FAIL'
  imageCID: string | null
  isApproved: boolean
  isMinted: boolean
  mintedDiplomaId: number | null
  issuerCode: string
  delegateId: string | null
  createdAt: string
  updatedAt: string
}

export type StepType = 'drafts' | 'images' | 'review' | 'mint'

export interface UploadResult {
  message: string
  imported: number
  failed: number
  total: number
  skipped: number
  skippedDetails?: any[]
  errors?: string[]
}

export interface DraftFormData {
  studentName: string
  studentEmail: string
  studentPhone: string
  studentDayOfBirth: string
  studentGender: 'MALE' | 'FEMALE'
  studentAddress: string
  studentClass: string
  faculty: string
  GPA: number
}
