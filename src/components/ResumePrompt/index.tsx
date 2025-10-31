import { FaSpinner } from 'react-icons/fa';

interface ResumePromptProps {
  resumeData: {
    email: string;
    schoolName: string;
    code: string;
    emailVerified: boolean;
    dnsVerified: boolean;
    hoursRemaining: number;
  };
  onResume: () => void;
  onStartNew: () => void;
  isLoading?: boolean;
}

export default function ResumePrompt({
  resumeData,
  onResume,
  onStartNew,
  isLoading = false,
}: ResumePromptProps) {
  const getCurrentStepInfo = () => {
    if (resumeData.dnsVerified) {
      return {
        emoji: '🎉',
        status: 'DNS đã xác thực - Còn bước cuối',
        description: 'Bạn chỉ cần tạo mật khẩu để hoàn tất đăng ký',
        color: 'text-green-300',
      };
    }
    if (resumeData.emailVerified) {
      return {
        emoji: '📧',
        status: 'Email đã xác thực - Cần setup DNS',
        description: 'Vui lòng cấu hình DNS để xác thực quyền sở hữu domain',
        color: 'text-blue-300',
      };
    }
    return {
      emoji: '📧',
      status: 'Cần xác thực email',
      description: 'Email xác thực đã được gửi, vui lòng kiểm tra hộp thư',
      color: 'text-yellow-300',
    };
  };

  const stepInfo = getCurrentStepInfo();

  return (
    <div className="mb-6 p-5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-xl shadow-lg backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <div className="text-4xl mt-1">{stepInfo.emoji}</div>
        
        <div className="flex-1">
          <h3 className="font-bold text-yellow-300 mb-2 text-lg">
            ⚠️ Phát hiện quá trình đăng ký chưa hoàn tất
          </h3>
          
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-200">
              Bạn đã bắt đầu đăng ký với email{' '}
              <strong className="text-white">{resumeData.email}</strong> cho trường{' '}
              <strong className="text-white">{resumeData.schoolName}</strong> (
              {resumeData.code}).
            </p>
            
            <div className="bg-black/20 rounded-lg p-3 space-y-1">
              <p className={`text-sm font-medium ${stepInfo.color}`}>
                📍 {stepInfo.status}
              </p>
              <p className="text-xs text-gray-300">{stepInfo.description}</p>
              <p className="text-xs text-gray-400">
                ⏰ Thời gian còn lại:{' '}
                <strong className="text-white">
                  {resumeData.hoursRemaining > 0
                    ? `${resumeData.hoursRemaining} giờ`
                    : 'Sắp hết hạn'}
                </strong>
              </p>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={onResume}
              disabled={isLoading}
              className="px-5 py-2.5 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Đang tải...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Tiếp tục đăng ký</span>
                </>
              )}
            </button>
            
            <button
              onClick={onStartNew}
              disabled={isLoading}
              className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <span>🔄</span>
              <span>Đăng ký mới</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
