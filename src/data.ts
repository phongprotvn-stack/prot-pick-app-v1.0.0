import { Student, CurriculumSkill, LessonPlan, Session, NotificationItem, CoachProfile } from './types';

export const initialSkills: CurriculumSkill[] = [
  { id: '1', name: 'Forehand', category: 'BASIC', descriptionVI: 'Đánh thuận tay cơ bản từ vạch cuối sân', descriptionEN: 'Baseline forehand basic drive and stroke' },
  { id: '2', name: 'Backhand', category: 'BASIC', descriptionVI: 'Đánh trái tay, kiểm soát lực và hướng', descriptionEN: 'Baseline backhand defense and spin stroke' },
  { id: '3', name: 'Serve', category: 'BASIC', descriptionVI: 'Giao bóng sâu xuống cuối sân, tạo xoáy', descriptionEN: 'Deep serve to baseline with spin options' },
  { id: '4', name: 'Return', category: 'BASIC', descriptionVI: 'Trả giao bóng sâu, di chuyển lên lưới nhanh', descriptionEN: 'Deep return of serve while advancing to kitchen' },
  { id: '5', name: 'Block', category: 'ADVANCEDS', descriptionVI: 'Chặn các cú đánh mạnh từ đối thủ ngay tại lưới', descriptionEN: 'Blocking powerful drives right at the kitchen line' },
  { id: '6', name: 'Dink', category: 'ADVANCEDS', descriptionVI: 'Thả bóng nhỏ bền bỉ, an toàn trong ô bếp', descriptionEN: 'Consistent soft placement within the kitchen' },
  { id: '7', name: 'Volley', category: 'ADVANCEDS', descriptionVI: 'Bắt bóng sống trên không chủ động ghi điểm', descriptionEN: 'Air volley punch for active point pressure' },
  { id: '8', name: 'Drop', category: 'ADVANCEDS', descriptionVI: 'Thả bóng chậm từ biên để tiến sân (Third Shot Drop)', descriptionEN: 'Soft defensive drop from baseline to transition' },
  { id: '9', name: 'Reset', category: 'ADVANCEDS', descriptionVI: 'Đưa trái bóng bay nhanh về nhịp dink chậm an toàn', descriptionEN: 'Neutralize fast balls back into the kitchen' },
  { id: '10', name: 'Flick', category: 'ADVANCEDS', descriptionVI: 'Kỹ thuật gõ bóng cổ tay đột ngột tăng tốc lực', descriptionEN: 'Sudden wrist flick to catch opponent off guard' },
  { id: '11', name: 'Roll', category: 'ADVANCEDS', descriptionVI: 'Gạt bóng xoáy lên từ dưới kitchen lên', descriptionEN: 'Topspin roll from below or near kitchen height' },
  { id: '12', name: 'Lob', category: 'ADVANCEDS', descriptionVI: 'Cú đưa bóng bổng qua đầu ép đối thủ lùi sân', descriptionEN: 'Tactical defensive or offensive high lob overhead' },
  { id: '13', name: 'Smash', category: 'ADVANCEDS', descriptionVI: 'Cú đập đè uy lực khi đối thủ trả bóng bổng', descriptionEN: 'Powerful downward smash on high feedback' },
  { id: '14', name: 'Footwork', category: 'TACTICS', descriptionVI: 'Bộ chân di chuyển ngang dọc sân nhanh nhạy', descriptionEN: 'Agile steps and recovery around the court' },
  { id: '15', name: 'Transition Zone', category: 'TACTICS', descriptionVI: 'Lối chơi xử lý bóng ở khu vực trung tâm', descriptionEN: 'Handling tricky balls between baseline and kitchen' },
  { id: '16', name: 'Strategy', category: 'TACTICS', descriptionVI: 'Chiến thuật phối hợp đôi, di chuyển bọc lót', descriptionEN: 'Doubles partner sync, rotation and shot choice' }
];

export const initialStudents: Student[] = [
  {
    id: 's1',
    name: 'Trần Đình Phúc',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    level: '3.0',
    joiningDate: '2026-03-10',
    isPublic: true,
    skills: {
      'Forehand': 4,
      'Backhand': 2,
      'Serve': 3,
      'Return': 3,
      'Block': 2,
      'Dink': 4,
      'Volley': 4,
      'Drop': 3,
      'Flick': 3,
      'Roll': 2,
      'Reset': 2,
      'Lob': 3,
      'Smash': 5,
      'Footwork': 3,
      'Transition Zone': 2,
      'Strategy': 3
    },
    targetGoal: 'Nâng lên trình 3.5 để thi đấu giải phủi miền Bắc.',
    notes: 'Phúc có cú đập Smash (5 điểm) rất uy lực và quả Forehand ổn định. Điểm yếu lớn nhất là Backhand và khả năng Reset bóng trong vùng Transition Zone.',
    phone: '0912345678',
    email: 'trandinhphuc@gmail.com',
    nationality: 'Việt Nam',
    dominantHand: 'Phải'
  },
  {
    id: 's2',
    name: 'Phạm Thu Trang (Trang Dinky)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    level: '2.5',
    joiningDate: '2026-05-01',
    isPublic: true,
    skills: {
      'Forehand': 3,
      'Backhand': 3,
      'Serve': 4,
      'Return': 4,
      'Block': 2,
      'Dink': 3,
      'Volley': 2,
      'Drop': 2,
      'Flick': 1,
      'Roll': 2,
      'Reset': 1,
      'Lob': 2,
      'Smash': 1,
      'Footwork': 3,
      'Transition Zone': 2,
      'Strategy': 2
    },
    targetGoal: 'Vượt qua giai đoạn dợt bóng dạo, nắm vững dink kitchen.',
    notes: 'Trang dink khá bền bỉ, thích bóng nhỏ nhưng phản xạ Block sát lưới còn chậm. Cần tập thêm Smash và cú lốp bóng.',
    phone: '0987654321',
    email: 'thutrang.pickle@gmail.com',
    nationality: 'Việt Nam',
    dominantHand: 'Phải'
  },
  {
    id: 's3',
    name: 'Hoàng Anh Kiệt (Kiệt Sát Thủ)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    level: '3.5',
    joiningDate: '2026-02-15',
    isPublic: true,
    skills: {
      'Forehand': 4,
      'Backhand': 4,
      'Serve': 4,
      'Return': 4,
      'Block': 3,
      'Dink': 3,
      'Volley': 4,
      'Drop': 4,
      'Flick': 4,
      'Roll': 3,
      'Reset': 3,
      'Lob': 4,
      'Smash': 4,
      'Footwork': 4,
      'Transition Zone': 3,
      'Strategy': 4
    },
    targetGoal: 'Chinh phục level 4.0 nâng cao, hoàn thiện dink kiên nhẫn.',
    notes: 'Chỉ số đồng đều, mạnh ở lối chơi tấn công nhanh. Cần tăng tính kiên nhẫn khi dính bóng dink, tránh nôn nóng giật flick hỏng.',
    phone: '0901234567',
    email: 'kietpro.combat@yahoo.com',
    nationality: 'Việt Nam',
    dominantHand: 'Trái'
  }
];

export const initialLessonPlans: LessonPlan[] = [
  {
    id: 'lp1',
    titleVI: 'Kỹ Thuật Dink Nhẫn Nại Tại Bếp',
    titleEN: 'Patient Kitchen Dink Mastery',
    descriptionVI: 'Rèn luyện khả năng kiểm soát bóng mềm trong khu vực ô bếp. Ép đối thủ kiên nhẫn hoặc đánh bóng lỗi bổng để tấn công.',
    descriptionEN: 'Training soft-spin kitchen control. Forcing opponent into dink endurance, capitalizing on high return errors.',
    skillsFocused: ['Dink', 'Block', 'Reset'],
    durationMin: 60,
    isPublic: true
  },
  {
    id: 'lp2',
    titleVI: 'Chiến Thuật Tiếp Cận Lưới Từ Sâu Sân (Third-Shot Drop)',
    titleEN: 'Third-Shot Drop & Advance Strategy',
    descriptionVI: 'Dạy học viên cú thả bóng thứ ba (3rd shot drop) hoàn hảo giúp đồng đội dâng lên chiếm lĩnh vạch bếp an toàn.',
    descriptionEN: 'Coaching standard 3rd shot drop curves, assisting partner in transitioning smoothly to kitchen line.',
    skillsFocused: ['Drop', 'Transition Zone', 'Footwork'],
    durationMin: 90,
    isPublic: true
  },
  {
    id: 'lp3',
    titleVI: 'Gia Tăng Uy Lực Giao Bóng & Trả Bóng',
    titleEN: 'Devious Serves & Deep Returns',
    descriptionVI: 'Xây dựng cảm giác bóng phục vụ quả giao bóng xoáy sâu góc chữ T và trả giao bóng căng sát chân đối thủ.',
    descriptionEN: 'Building powerful spin serves down the T-line and deep aggressive returns forcing deep baseline retreats.',
    skillsFocused: ['Serve', 'Return', 'Forehand'],
    durationMin: 60,
    isPublic: true
  }
];

export const initialSessions: Session[] = [
  {
    id: 'se1',
    studentId: 's1',
    date: '2026-06-18',
    lessonPlanId: 'lp1',
    title: 'Dink Bếp Thực Chiến & Block Phản Xạ',
    durationMin: 60,
    notes: 'Hải búa đã cải thiện dink bên cánh tay thuận (Forehand dink ổn), nhưng quả dink trái tay vẫn thỉnh thoảng nảy cao quá mức. Smash vẫn cực tốt.',
    status: 'Completed',
    skillScores: {
      'Dink': 4,
      'Block': 3,
      'Reset': 2
    },
    isPublic: true,
    coachFeedbackVI: 'Em tập rất tốt quả dink phải tay. Hôm sau tập trung sửa quả dink trái tay (Backhand dink) nhé Hải.',
    coachFeedbackEN: 'Excellent progress on forehand dinks. Next time we will focus on improving your backhand dink heights.'
  },
  {
    id: 'se2',
    studentId: 's2',
    date: '2026-06-19',
    lessonPlanId: 'lp2',
    title: 'Tập Luyện Tấn Công 3rd Shot Drop',
    durationMin: 90,
    notes: 'Trang dinky di chuyển bị chậm bước (Footwork chưa bám sát). Cú thả lò xo (Drop) đạt tỷ lệ qua lưới là 50%.',
    status: 'Completed',
    skillScores: {
      'Drop': 3,
      'Transition Zone': 2,
      'Footwork': 3
    },
    isPublic: true,
    coachFeedbackVI: 'Giai đoạn chuyển tiếp chạy còn vấp. Hãy tập trung nhón gót di chuyển linh hoạt nhẹ nhàng.',
    coachFeedbackEN: 'Good dropping efforts, but transition steps are still heavy. Lean on your toes for lighter footwork.'
  },
  {
    id: 'se3',
    studentId: 's1',
    date: '2026-06-25',
    lessonPlanId: 'lp2',
    title: 'Transition Zone Combat - HLV Phongprot',
    durationMin: 60,
    notes: 'Nội dung bổ trợ khả năng bọc lót chiến thuật đôi thực tế.',
    status: 'Scheduled',
    skillScores: {},
    isPublic: true,
    coachFeedbackVI: 'Nhớ mang giày đế rộng bám sân để di chuyển ngang vùng chuyển tiếp.',
    coachFeedbackEN: 'Remember to wear high-grip court shoes for quick lateral transitions.'
  },
  {
    id: 'se4',
    studentId: 's3',
    date: '2026-06-20',
    lessonPlanId: 'lp1',
    title: 'Flick & Roll Kiên Nhẫn',
    durationMin: 60,
    notes: 'Kiệt tập các cú Roll bóng xoáy cực mượt. Quả Flick tốc độ cao gõ bóng cổ tay chuẩn xác.',
    status: 'Completed',
    skillScores: {
      'Dink': 4,
      'Flick': 5,
      'Roll': 4,
      'Block': 4
    },
    isPublic: true,
    coachFeedbackVI: 'Cực kỳ bùng nổ! Quả Flick hôm nay đạt level 5 cực sát thương. Chúc mừng Kiệt.',
    coachFeedbackEN: 'An absolute masterpiece performance! Your wrist flicks are lethal at level 5 weapon tier now.'
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'n1',
    titleVI: '🏆 GIẢI ĐẤU GIAO LƯU NỘI BỘ PROT PICK 2026',
    titleEN: '🏆 INTERNAL PROT PICK TOURNAMENT 2026',
    contentVI: 'Chúc mừng anh em học viên đã hăng say chuẩn bị. Giải đấu sẽ diễn ra vào sáng Chủ Nhật này (28/06/2026) tại cụm sân Pickleball Phongprot. Slogan: Combat never ends! Toàn bộ điểm thi đấu sẽ được hệ thống phân tích cập nhật trực tiếp vào thẻ chỉ số học viên.',
    contentEN: 'Exciting news! Our internal club tournament fires up this coming Sunday morning (June 28, 2026) at Phongprot courts stadium. Slogan: Combat never ends! Match ratings will sync directly with FM Player profile cards.',
    date: '2026-06-21',
    type: 'success',
    isPublic: true
  },
  {
    id: 'n2',
    titleVI: '💡 Chia sẻ tài liệu về cách cầm vợt Continental Grip',
    titleEN: '💡 Technical Resource: Continental Grip Hold',
    contentVI: 'Cách cầm vợt tối ưu để có thể vừa Dink mềm vừa Volley/Reset hiệu quả mà HLV Phongprot rèn giũa. Anh em lưu ý giữ lỏng tay từ 3-4/10 để có cảm giác bóng tốt nhất.',
    contentEN: 'Universal racquet grip to handle both soft dinks and quick reaction volleys. Keep your grip tension loose (3-4 out of 10 score index) for absolute soft hand dinks.',
    date: '2026-06-15',
    type: 'info',
    isPublic: true
  }
];

export const defaultCoach: CoachProfile = {
  name: 'Phongprot',
  avatar: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=200&auto=format&fit=crop&q=80',
  slogan: 'Combat never ends',
  aboutVI: 'Phongprot là HLV chuyên nghiệp tận tụy, đam mê Pickleball từ những năm đầu du nhập. Anh xây dựng hệ thống huấn luyện khoa học dựa trên số liệu thực tế, theo sát tỉ mỉ từng buổi học để bảo đảm học viên phát triển toàn diện 16 kỹ năng dink, smash, reset một cách vững vàng nhất.',
  aboutEN: 'Phongprot is a highly dedicated professional Pickleball trainer. He designs bespoke statistical-oriented programs that optimize your attributes from kitchen dinks to baseline drives, ensuring every player shapes a distinctive style.',
  coursesVI: [
    { title: 'Khóa Học Nhập Môn Phong Thần (1.0 - 2.5)', desc: 'Huấn luyện di chuyển chân, cách cầm vợt Continental, luật chơi dink & giao bóng cơ bản trong 10 buổi.', price: '3,500,000 VND / Khóa' },
    { title: 'Khóa Chiến Đấu Đương Đầu (2.5 - 3.5)', desc: 'Sâu sát kỹ thuật 3rd Shot Drop, Flick tốc độ cao tại bếp, dink kéo bền và chiến thuật bọc lót đồng đội.', price: '5,000,000 VND / Khóa' },
    { title: 'Khóa Cao Thủ Phản Đòn (Trình 3.5 - 4.0+)', desc: 'Lối chơi nhanh, gõ bóng Roll xoáy, đập Smash uy lực, cách bẻ góc bóng, khắc phục dồn ép góc chết.', price: '7,000,000 VND / Khóa' }
  ],
  coursesEN: [
    { title: 'Deity Initiation Class (Level 1.0 - 2.5)', desc: '10 lessons covering master footsteps, native Continental grip, kitchen boundaries and simple baseline drives.', price: '150 USD / Package' },
    { title: 'Combat Engagement Class (Level 2.5 - 3.5)', desc: 'Focusing heavily on 3rd shot drop arcs, transition resets, patience kitchen patience, and pairing rotation.', price: '220 USD / Package' },
    { title: 'Immortal Defender Pro (Level 3.5 - 4.0+)', desc: 'High-speed roll spin angles, lethal wrist speedups, dink-flick transition traps and aggressive partner coverage.', price: '300 USD / Package' }
  ],
  youtubeYoutIds: ['F8Y9R8UovRE', 'A62lY0_9P3g', 'mO-hO4m3bTo'], // standard awesome pickleball plays
  photos: [
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=600&auto=format&fit=crop&q=80'
  ],
  courts: 'Cụm sân Pickleball HN & Sài Gòn'
};

