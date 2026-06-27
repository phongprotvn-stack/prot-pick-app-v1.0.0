import { Student, CurriculumSkill, LessonPlan, Session, NotificationItem, CoachProfile } from './types';

export const initialSkills: CurriculumSkill[] = [
  { id: '1', name: 'Forehand', category: 'BASIC', descriptionVI: 'Đánh thuận tay cơ bản từ vạch cuối sân', descriptionEN: 'Baseline forehand basic drive and stroke' },
  { id: '2', name: 'Backhand', category: 'BASIC', descriptionVI: 'Đánh trái tay, kiểm soát lực và hướng', descriptionEN: 'Baseline backhand defense and spin stroke' },
  { id: '3', name: 'Serve', category: 'BASIC', descriptionVI: 'Giao bóng sâu xuống cuối sân, tạo xoáy', descriptionEN: 'Deep serve to baseline with spin options' },
  { id: '4', name: 'Return', category: 'BASIC', descriptionVI: 'Trả giao bóng sâu, di chuyển lên lưới nhanh', descriptionEN: 'Deep return of serve while advancing to kitchen' },
  { id: '5', name: 'Block', category: 'ADVANCED', descriptionVI: 'Chặn các cú đánh mạnh từ đối thủ ngay tại lưới', descriptionEN: 'Blocking powerful drives right at the kitchen line' },
  { id: '6', name: 'Dink', category: 'ADVANCED', descriptionVI: 'Thả bóng nhỏ bền bỉ, an toàn trong ô bếp', descriptionEN: 'Consistent soft placement within the kitchen' },
  { id: '7', name: 'Volley', category: 'ADVANCED', descriptionVI: 'Bắt bóng sống trên không chủ động ghi điểm', descriptionEN: 'Air volley punch for active point pressure' },
  { id: '8', name: 'Drop', category: 'ADVANCED', descriptionVI: 'Thả bóng chậm từ biên để tiến sân (Third Shot Drop)', descriptionEN: 'Soft defensive drop from baseline to transition' },
  { id: '9', name: 'Reset', category: 'ADVANCED', descriptionVI: 'Đưa trái bóng bay nhanh về nhịp dink chậm an toàn', descriptionEN: 'Neutralize fast balls back into the kitchen' },
  { id: '10', name: 'Flick', category: 'ADVANCED', descriptionVI: 'Kỹ thuật gõ bóng cổ tay đột ngột tăng tốc lực', descriptionEN: 'Sudden wrist flick to catch opponent off guard' },
  { id: '11', name: 'Roll', category: 'ADVANCED', descriptionVI: 'Gạt bóng xoáy lên từ dưới kitchen lên', descriptionEN: 'Topspin roll from below or near kitchen height' },
  { id: '12', name: 'Lob', category: 'ADVANCED', descriptionVI: 'Cú đưa bóng bổng qua đầu ép đối thủ lùi sân', descriptionEN: 'Tactical defensive or offensive high lob overhead' },
  { id: '13', name: 'Smash', category: 'ADVANCED', descriptionVI: 'Cú đập đè uy lực khi đối thủ trả bóng bổng', descriptionEN: 'Powerful downward smash on high feedback' },
  { id: '14', name: 'Footwork', category: 'TACTICS', descriptionVI: 'Bộ chân di chuyển ngang dọc sân nhanh nhạy', descriptionEN: 'Agile steps and recovery around the court' },
  { id: '15', name: 'Transition Zone', category: 'TACTICS', descriptionVI: 'Lối chơi xử lý bóng ở khu vực trung tâm', descriptionEN: 'Handling tricky balls between baseline and kitchen' },
  { id: '16', name: 'Strategy', category: 'TACTICS', descriptionVI: 'Chiến thuật phối hợp đôi, di chuyển bọc lót', descriptionEN: 'Doubles partner sync, rotation and shot choice' }
];

export const initialStudents: Student[] = [];

export const initialLessonPlans: LessonPlan[] = [];

export const initialSessions: Session[] = [];

export const initialNotifications: NotificationItem[] = [];

export const defaultCoach: CoachProfile = {
  name: 'Phongprot',
  avatar: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=200&auto=format&fit=crop&q=80',
  slogan: 'Combat never ends',
  aboutVI: 'Phongprot là HLV chuyên nghiệp tận tụy, đam mê Pickleball từ những năm đầu du nhập. Anh xây dựng hệ thống huấn luyện khoa học dựa trên số liệu thực tế, theo sát tỉ mỉ từng buổi học để bảo đảm học viên phát triển toàn diện 16 kỹ năng dink, smash, reset một cách vững vàng nhất.',
  aboutEN: 'Phongprot is a highly dedicated professional Pickleball trainer. He designs bespoke statistical-oriented programs that optimize your attributes from kitchen dinks to baseline drives, ensuring every player shapes a distinctive style.',
  coursesVI: [
    { title: 'Khóa Học Nhập Môn Phong Thần (1.0 - 2.5)', desc: 'Huấn luyện di chuyển chân, cách cầm vợt Continental, luật chơi dink & giao bóng cơ bản trong 10 buổi.', price: '3,500,000 VND' },
    { title: 'Khóa Chiến Đấu Đương Đầu (2.5 - 3.5)', desc: 'Sâu sát kỹ thuật 3rd Shot Drop, Flick tốc độ cao tại bếp, dink kéo bền và chiến thuật bọc lót đồng đội.', price: '5,000,000 VND' },
    { title: 'Khóa Cao Thủ Phản Đòn (Trình 3.5 - 4.0+)', desc: 'Lối chơi nhanh, gõ bóng Roll xoáy, đập Smash uy lực, cách bẻ góc bóng, khắc phục dồn ép góc chết.', price: '7,000,000 VND' }
  ],
  coursesEN: [
    { title: 'Deity Initiation Class (Level 1.0 - 2.5)', desc: '10 lessons covering master footsteps, native Continental grip, kitchen boundaries and simple baseline drives.', price: '150 USD' },
    { title: 'Combat Engagement Class (Level 2.5 - 3.5)', desc: 'Focusing heavily on 3rd shot drop arcs, transition resets, patience kitchen patience, and pairing rotation.', price: '220 USD' },
    { title: 'Immortal Defender Pro (Level 3.5 - 4.0+)', desc: 'High-speed roll spin angles, lethal wrist speedups, dink-flick transition traps and aggressive partner coverage.', price: '300 USD' }
  ],
  youtubeYoutIds: ['F8Y9R8UovRE', 'A62lY0_9P3g', 'mO-hO4m3bTo'], // standard awesome pickleball plays
  photos: [
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=600&auto=format&fit=crop&q=80'
  ],
  courts: 'Cụm sân Pickleball HN & Sài Gòn',
  courtsVI: 'Cụm sân Pickleball HN & Sài Gòn',
  courtsEN: 'Pickleball courts in Hanoi & Saigon',
  courseSpecialsVI: [
    'Sử dụng hệ thống PROT PICK chấm điểm kỹ năng chuẩn hóa chuyên nghiệp.',
    'Xem biểu đồ Radar FM-style, nhận bài tập về nhà sau mỗi buổi học.',
    'Giao dịch/Giao lưu trận đánh có quay video phân tích lỗi di chuyển và tư vấn thiết bị.'
  ],
  courseSpecialsEN: [
    'Professional standardized skill matrix updates using PROT PICK.',
    'Access interactive FM Radar stats card and tailored homework recommendations.',
    'Video analysis of custom play matches and precise equipment advisory.'
  ]
};

