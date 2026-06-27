export interface Student {
  id: string;
  name: string;
  avatar: string;
  level: string;
  joiningDate: string;
  isPublic: boolean;
  skills: { [key: string]: number };
  targetGoal: string;
  notes: string;
  phone: string;
  email: string;
  nationality: string;
  dominantHand: string;
}

export interface CurriculumSkill {
  id: string;
  name: string;
  category: string;
  descriptionVI: string;
  descriptionEN: string;
}

export interface LessonPlan {
  id: string;
  titleVI: string;
  titleEN: string;
  descriptionVI: string;
  descriptionEN: string;
  skillsFocused: string[];
  durationMin: number;
  isPublic: boolean;
}

export interface Session {
  id: string;
  studentId: string;
  date: string;
  lessonPlanId: string;
  title: string;
  durationMin: number;
  notes: string;
  status: 'Completed' | 'Scheduled' | 'Cancelled';
  skillScores: { [skillName: string]: number };
  isPublic: boolean;
  coachFeedbackVI?: string;
  coachFeedbackEN?: string;
}

export interface NotificationItem {
  id: string;
  titleVI: string;
  titleEN: string;
  contentVI: string;
  contentEN: string;
  date: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isPublic: boolean;
}

export interface CoachProfile {
  name: string;
  avatar: string;
  slogan: string;
  aboutVI: string;
  aboutEN: string;
  coursesVI: { title: string; desc: string; price: string }[];
  coursesEN: { title: string; desc: string; price: string }[];
  youtubeYoutIds: string[];
  photos: string[];
}

export const initialSkills: CurriculumSkill[] = [
  {
    id: "sk1",
    name: "Forehand",
    category: "Cơ Bản (Basics)",
    descriptionVI: "Kỹ thuật đánh bóng thuận tay, tạo độ xoáy cuộn và kiểm soát quỹ đạo sâu bóng.",
    descriptionEN: "Basic forehand drive control, deep baseline impact curves."
  },
  {
    id: "sk2",
    name: "Backhand",
    category: "Cơ Bản (Basics)",
    descriptionVI: "Đánh bóng trái tay ổn định, hạn chế lực bật bổng tạo cơ hội cho đối thủ smash.",
    descriptionEN: "Defensive and flat backhand strikes, minimizing high pop-ups."
  },
  {
    id: "sk3",
    name: "Serve",
    category: "Cơ Bản (Basics)",
    descriptionVI: "Giao bóng chuẩn xác, tăng độ xoáy sâu sát vạch baseline gây khó dễ trả bóng.",
    descriptionEN: "Accurate starting service, driving depths near base boundaries."
  },
  {
    id: "sk4",
    name: "Return",
    category: "Cơ Bản (Basics)",
    descriptionVI: "Cú trả giao bóng sâu, sâu sát chân đối phương giúp đồng đội chủ động tràn lưới.",
    descriptionEN: "Aggressive deep return of serve driving back baseline players."
  },
  {
    id: "sk5",
    name: "Block",
    category: "Phản Xạ (Volleys)",
    descriptionVI: "Chặn các cú đánh mạnh từ đối thủ ngay tại lưới",
    descriptionEN: "Absorbing high speed smashes at kitchen lines to slow down speed."
  },
  {
    id: "sk6",
    name: "Dink",
    category: "Tinh Tế (Soft Game)",
    descriptionVI: "Rớt bóng mềm mại vào ô bếp đối phương (kitchen), thử thách sự kiên nhẫn.",
    descriptionEN: "Soft precision dinks inside opponent kitchen boundaries."
  },
  {
    id: "sk7",
    name: "Volley",
    category: "Phản Xạ (Volleys)",
    descriptionVI: "Tấn công bóng trên không tốc độ cao ngay sát lưới, áp đảo cự ly gần.",
    descriptionEN: "Fast air strikes before bounce (drives, punch volleys) near net."
  },
  {
    id: "sk8",
    name: "Drop",
    category: "Tinh Tế (Soft Game)",
    descriptionVI: "Cú thả bóng mềm mại từ cuối sân rơi gọn vào bếp (3rd shot drop chi phối trận đấu).",
    descriptionEN: "Commanding 3rd shot drops landing gently inside opponent kitchen area."
  },
  {
    id: "sk9",
    name: "Flick",
    category: "Nâng Cao (Advanced)",
    descriptionVI: "Cú quất cổ tay tăng tốc bóng đột ngột ngay từ vị trí dink thấp tại bếp để ghi điểm.",
    descriptionEN: "Explosive wrist acceleration from low kitchen bounce to trigger traps."
  },
  {
    id: "sk10",
    name: "Roll",
    category: "Nâng Cao (Advanced)",
    descriptionVI: "Cuộn bóng xoáy lên (top-spin volley) ngay trên không sát vạch bếp đầy uy lực.",
    descriptionEN: "Aggressive topspin rolling motion volley near kitchen line boundaries."
  },
  {
    id: "sk11",
    name: "Reset",
    category: "Tinh Tế (Soft Game)",
    descriptionVI: "Hóa giải loạt đọ bóng nhanh của đối thủ bằng cú chạm mềm rớt bóng nhẹ nằm gọn vào bếp.",
    descriptionEN: "Halting rapid fire battles with ultra soft resets returning to kitchen."
  },
  {
    id: "sk12",
    name: "Lob",
    category: "Nâng Cao (Advanced)",
    descriptionVI: "Cú đưa bóng bổng qua đầu ép đối thủ lùi sân",
    descriptionEN: "High clear lobs overhead targeting backtracking kitchen players."
  },
  {
    id: "sk13",
    name: "Smash",
    category: "Nâng Cao (Advanced)",
    descriptionVI: "Đập bóng búa bổ từ vị trí trên cao dứt điểm pha bóng không cơ hội cản phá.",
    descriptionEN: "Downward heavy strike scoring final points without reaction windows."
  },
  {
    id: "sk14",
    name: "Footwork",
    category: "Thể Chất (Physical)",
    descriptionVI: "Di chuyển bộ chân linh hoạt ngang vạch bếp, giữ thăng bằng tối ưu khi dink.",
    descriptionEN: "Responsive lateral footsteps at kitchen keeping balanced frames."
  },
  {
    id: "sk15",
    name: "Transition Zone",
    category: "Thể Chất (Physical)",
    descriptionVI: "Kỹ năng chiến đấu ở vùng chuyển tiếp (nửa sân giữa), phòng ngự thăng tiến lên bếp.",
    descriptionEN: "Handling half-court mid-zone defense while stepping forward to kitchen."
  },
  {
    id: "sk16",
    name: "Strategy",
    category: "Nâng Cao (Advanced)",
    descriptionVI: "Đọc trận đấu, bọc lót đồng đội, giăng bẫy đối phương và chiếm lĩnh lưới.",
    descriptionEN: "Court reads, pairing rotation, setup triggers and net control."
  }
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
      'Block': 3,
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
    name: 'Trịnh Thu Trang (Trang Dinky)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    level: '2.5',
    joiningDate: '2026-04-02',
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
    { title: 'Khóa Học Nhập Môn Phong Thần (1.0 - 2.5)', desc: 'Huấn luyện di chuyển chân, cách cầm vợt Continental, luật chơi dink & giao bóng cơ bản trong 10 buổi.', price: '3,500,000 VND' },
    { title: 'Khóa Chiến Đấu Đương Đầu (2.5 - 3.5)', desc: 'Sâu sát kỹ thuật 3rd Shot Drop, Flick tốc độ cao tại bếp, dink kéo bền và chiến thuật bọc lót đồng đội.', price: '5,000,000 VND' },
    { title: 'Khóa Cao Thủ Phản Đòn (Trình 3.5 - 4.0+)', desc: 'Lối chơi nhanh, gõ bóng Roll xoáy, đập Smash uy lực, cách bẻ góc bóng, khắc phục dồn ép góc chết.', price: '7,000,000 VND' }
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
  ]
};
