import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { UserSettings } from './types';
import { LangCode } from './i18n';
import { tr_fn } from './i18n';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/* ------------------------------------------------------------------ */
/* Notification message banks (18 languages)                          */
/* Categories:                                                         */
/*   morning  – wake → mid-morning (3 msgs)                            */
/*   day      – mid-morning → late afternoon (5 msgs)                  */
/*   evening  – evening → bedtime (3 msgs)                             */
/*   task     – daily mission kickoff (used at wake) (3 msgs)          */
/*   progress – 25/50/75/100/champion milestones (5 msgs)              */
/* ------------------------------------------------------------------ */

type Bucket = 'morning' | 'day' | 'evening' | 'task';
type ProgressKey = 'p25' | 'p50' | 'p75' | 'p100' | 'champion';

interface LangMessages {
  morning: string[];
  day: string[];
  evening: string[];
  task: string[];
  progress: Record<ProgressKey, string>;
}

const MESSAGES: Record<LangCode, LangMessages> = {
  en: {
    morning: [
      'Good morning! Start your day with a glass of water 💧',
      'Rise and hydrate! Your body needs water after sleep 🌅',
      'Morning check-in: Have you had your first glass? ☀️',
    ],
    day: [
      'Time for a water break! 💧',
      'Don\'t forget to hydrate! Your body will thank you 😊',
      'Quick reminder: Drink a glass of water right now 🚰',
      'Halfway through the day — how\'s your hydration? 💪',
      'A glass of water keeps the fatigue away! ⚡',
    ],
    evening: [
      'Evening check: Did you reach your water goal today? 🌙',
      'Wind down with a glass of water 💧',
      'Almost bedtime — one last glass! 😴',
    ],
    task: [
      'Did you drink water today? 💧 Start now!',
      'Your daily hydration mission awaits! 🎯',
      'New day, new hydration goals! Let\'s go 🚀',
    ],
    progress: {
      p25: 'You\'re 25% to your daily goal! Keep it up 🌊',
      p50: 'Halfway there! Keep drinking 💧',
      p75: 'Almost done! Just a little more 🎯',
      p100: 'You completed your daily water goal! Amazing 🎉',
      champion: 'Goal achieved! You\'re a hydration champion 🏆',
    },
  },
  tr: {
    morning: [
      'Günaydın! Güne bir bardak suyla başla 💧',
      'Uyandın, şimdi hidrate ol! Vücudun uykudan sonra suya ihtiyaç duyar 🌅',
      'Sabah kontrolü: İlk bardağını içtin mi? ☀️',
    ],
    day: [
      'Su molası zamanı! 💧',
      'Hidrate olmayı unutma! Vücudun sana teşekkür edecek 😊',
      'Kısa hatırlatma: Şu an bir bardak su iç 🚰',
      'Günün yarısı geçti — hidrasyonun nasıl? 💪',
      'Bir bardak su yorgunluğu uzak tutar! ⚡',
    ],
    evening: [
      'Akşam kontrolü: Bugün su hedefine ulaştın mı? 🌙',
      'Bir bardak suyla günü kapat 💧',
      'Yatma vakti yaklaştı — son bir bardak! 😴',
    ],
    task: [
      'Bugün su içtin mi? 💧 Hemen başla!',
      'Günlük hidrasyon görevin seni bekliyor! 🎯',
      'Yeni gün, yeni hidrasyon hedefleri! Hadi 🚀',
    ],
    progress: {
      p25: 'Günlük hedefinin %25’indesin! Devam et 🌊',
      p50: 'Yarı yoldasın! İçmeye devam 💧',
      p75: 'Az kaldı! Birazcık daha 🎯',
      p100: 'Günlük su hedefini tamamladın! Harika 🎉',
      champion: 'Hedef aşıldı! Sen bir hidrasyon şampiyonusun 🏆',
    },
  },
  de: {
    morning: [
      'Guten Morgen! Starte den Tag mit einem Glas Wasser 💧',
      'Aufstehen und hydrieren! Dein Körper braucht Wasser nach dem Schlaf 🌅',
      'Morgen-Check: Hattest du schon dein erstes Glas? ☀️',
    ],
    day: [
      'Zeit für eine Wasserpause! 💧',
      'Vergiss nicht zu trinken! Dein Körper wird es dir danken 😊',
      'Kurze Erinnerung: Trink jetzt ein Glas Wasser 🚰',
      'Halbzeit — wie steht\'s mit deiner Hydration? 💪',
      'Ein Glas Wasser hält die Müdigkeit fern! ⚡',
    ],
    evening: [
      'Abend-Check: Hast du dein Wasserziel heute erreicht? 🌙',
      'Lass den Tag mit einem Glas Wasser ausklingen 💧',
      'Fast Schlafenszeit — ein letztes Glas! 😴',
    ],
    task: [
      'Hast du heute Wasser getrunken? 💧 Fang jetzt an!',
      'Deine tägliche Hydrations-Mission wartet! 🎯',
      'Neuer Tag, neue Hydrationsziele! Los geht\'s 🚀',
    ],
    progress: {
      p25: 'Du bist bei 25% deines Tagesziels! Weiter so 🌊',
      p50: 'Halbzeit! Weiter trinken 💧',
      p75: 'Fast geschafft! Nur noch ein wenig 🎯',
      p100: 'Du hast dein tägliches Wasserziel erreicht! Großartig 🎉',
      champion: 'Ziel erreicht! Du bist ein Hydrations-Champion 🏆',
    },
  },
  fr: {
    morning: [
      'Bonjour ! Commence la journée par un verre d\'eau 💧',
      'Lève-toi et hydrate-toi ! Ton corps en a besoin après le sommeil 🌅',
      'Check du matin : as-tu pris ton premier verre ? ☀️',
    ],
    day: [
      'C\'est l\'heure d\'une pause eau ! 💧',
      'N\'oublie pas de t\'hydrater ! Ton corps te remerciera 😊',
      'Petit rappel : bois un verre d\'eau maintenant 🚰',
      'À mi-journée — comment va ton hydratation ? 💪',
      'Un verre d\'eau éloigne la fatigue ! ⚡',
    ],
    evening: [
      'Check du soir : as-tu atteint ton objectif aujourd\'hui ? 🌙',
      'Termine la journée avec un verre d\'eau 💧',
      'Bientôt l\'heure de dormir — un dernier verre ! 😴',
    ],
    task: [
      'As-tu bu de l\'eau aujourd\'hui ? 💧 Commence maintenant !',
      'Ta mission hydratation quotidienne t\'attend ! 🎯',
      'Nouveau jour, nouveaux objectifs ! Allons-y 🚀',
    ],
    progress: {
      p25: 'Tu es à 25% de ton objectif ! Continue 🌊',
      p50: 'À mi-chemin ! Continue à boire 💧',
      p75: 'Presque fini ! Juste un peu plus 🎯',
      p100: 'Tu as atteint ton objectif d\'eau ! Génial 🎉',
      champion: 'Objectif dépassé ! Tu es un champion de l\'hydratation 🏆',
    },
  },
  es: {
    morning: [
      '¡Buenos días! Empieza el día con un vaso de agua 💧',
      '¡Despierta e hidrátate! Tu cuerpo necesita agua tras dormir 🌅',
      'Check matutino: ¿ya tomaste tu primer vaso? ☀️',
    ],
    day: [
      '¡Hora de una pausa de agua! 💧',
      '¡No olvides hidratarte! Tu cuerpo te lo agradecerá 😊',
      'Recordatorio rápido: bebe un vaso de agua ahora 🚰',
      'Mitad del día — ¿cómo va tu hidratación? 💪',
      '¡Un vaso de agua mantiene el cansancio lejos! ⚡',
    ],
    evening: [
      'Check de la tarde: ¿alcanzaste tu meta de agua hoy? 🌙',
      'Cierra el día con un vaso de agua 💧',
      'Casi hora de dormir — ¡un último vaso! 😴',
    ],
    task: [
      '¿Bebiste agua hoy? 💧 ¡Comienza ya!',
      '¡Tu misión diaria de hidratación te espera! 🎯',
      '¡Nuevo día, nuevas metas! Vamos 🚀',
    ],
    progress: {
      p25: '¡Estás al 25% de tu meta diaria! Sigue así 🌊',
      p50: '¡A mitad de camino! Sigue bebiendo 💧',
      p75: '¡Casi listo! Solo un poco más 🎯',
      p100: '¡Completaste tu meta de agua! Increíble 🎉',
      champion: '¡Meta alcanzada! Eres un campeón de la hidratación 🏆',
    },
  },
  it: {
    morning: [
      'Buongiorno! Inizia la giornata con un bicchiere d\'acqua 💧',
      'Svegliati e idratati! Il tuo corpo ha bisogno d\'acqua dopo il sonno 🌅',
      'Check del mattino: hai bevuto il primo bicchiere? ☀️',
    ],
    day: [
      'È l\'ora di una pausa acqua! 💧',
      'Non dimenticare di idratarti! Il tuo corpo ti ringrazierà 😊',
      'Promemoria veloce: bevi un bicchiere d\'acqua ora 🚰',
      'A metà giornata — come va l\'idratazione? 💪',
      'Un bicchiere d\'acqua tiene lontana la stanchezza! ⚡',
    ],
    evening: [
      'Check serale: hai raggiunto il tuo obiettivo oggi? 🌙',
      'Chiudi la giornata con un bicchiere d\'acqua 💧',
      'Quasi ora di dormire — un ultimo bicchiere! 😴',
    ],
    task: [
      'Hai bevuto acqua oggi? 💧 Inizia subito!',
      'La tua missione idratazione ti aspetta! 🎯',
      'Nuovo giorno, nuovi obiettivi! Andiamo 🚀',
    ],
    progress: {
      p25: 'Sei al 25% del tuo obiettivo! Continua così 🌊',
      p50: 'A metà strada! Continua a bere 💧',
      p75: 'Quasi finito! Ancora un pochino 🎯',
      p100: 'Hai completato il tuo obiettivo! Fantastico 🎉',
      champion: 'Obiettivo superato! Sei un campione dell\'idratazione 🏆',
    },
  },
  pt: {
    morning: [
      'Bom dia! Comece o dia com um copo de água 💧',
      'Acorde e hidrate-se! Seu corpo precisa de água após dormir 🌅',
      'Check matinal: já tomou seu primeiro copo? ☀️',
    ],
    day: [
      'Hora de uma pausa para água! 💧',
      'Não esqueça de se hidratar! Seu corpo agradece 😊',
      'Lembrete rápido: beba um copo de água agora 🚰',
      'Metade do dia — como está sua hidratação? 💪',
      'Um copo de água mantém o cansaço longe! ⚡',
    ],
    evening: [
      'Check da noite: alcançou sua meta de água hoje? 🌙',
      'Finalize o dia com um copo de água 💧',
      'Quase hora de dormir — mais um copo! 😴',
    ],
    task: [
      'Bebeu água hoje? 💧 Comece agora!',
      'Sua missão diária de hidratação espera por você! 🎯',
      'Novo dia, novas metas de hidratação! Vamos 🚀',
    ],
    progress: {
      p25: 'Você está a 25% da sua meta diária! Continue 🌊',
      p50: 'Na metade do caminho! Continue bebendo 💧',
      p75: 'Quase lá! Só um pouco mais 🎯',
      p100: 'Você completou sua meta de água! Incrível 🎉',
      champion: 'Meta superada! Você é um campeão da hidratação 🏆',
    },
  },
  ru: {
    morning: [
      'Доброе утро! Начни день со стакана воды 💧',
      'Просыпайся и пей! После сна организму нужна вода 🌅',
      'Утренняя проверка: уже выпил первый стакан? ☀️',
    ],
    day: [
      'Время сделать водный перерыв! 💧',
      'Не забывай пить воду! Тело скажет спасибо 😊',
      'Короткое напоминание: выпей стакан воды прямо сейчас 🚰',
      'Половина дня позади — как с гидратацией? 💪',
      'Стакан воды прогоняет усталость! ⚡',
    ],
    evening: [
      'Вечерняя проверка: достиг ли ты цели сегодня? 🌙',
      'Завершай день стаканом воды 💧',
      'Скоро спать — ещё один стакан! 😴',
    ],
    task: [
      'Ты пил воду сегодня? 💧 Начни прямо сейчас!',
      'Твоя ежедневная миссия по гидратации ждёт! 🎯',
      'Новый день — новые цели! Поехали 🚀',
    ],
    progress: {
      p25: 'Ты прошёл 25% дневной цели! Продолжай 🌊',
      p50: 'Половина пути! Продолжай пить 💧',
      p75: 'Почти готово! Ещё чуть-чуть 🎯',
      p100: 'Ты выполнил дневную цель! Молодец 🎉',
      champion: 'Цель достигнута! Ты чемпион гидратации 🏆',
    },
  },
  ja: {
    morning: [
      'おはようございます！コップ一杯の水で一日を始めよう 💧',
      '起きて水分補給を！睡眠後の体は水を求めています 🌅',
      '朝のチェック：最初の一杯は飲みましたか？☀️',
    ],
    day: [
      '水休憩の時間です！💧',
      '水分補給を忘れずに！体が感謝します 😊',
      'クイックリマインダー：今すぐコップ一杯の水を 🚰',
      '一日の折り返し — 水分補給はどう？💪',
      'コップ一杯の水で疲れを遠ざけよう！⚡',
    ],
    evening: [
      '夜のチェック：今日の水目標は達成した？🌙',
      'コップ一杯の水で一日を締めくくろう 💧',
      'もうすぐ就寝時間 — 最後の一杯！😴',
    ],
    task: [
      '今日水を飲みましたか？💧 今始めよう！',
      '今日のハイドレーションミッションが待っています！🎯',
      '新しい日、新しい水分補給目標！行こう 🚀',
    ],
    progress: {
      p25: '一日の目標の25%達成！この調子で 🌊',
      p50: '半分まで来た！飲み続けよう 💧',
      p75: 'もうすぐ達成！あと少し 🎯',
      p100: '今日の水目標を達成しました！素晴らしい 🎉',
      champion: '目標達成！あなたはハイドレーションチャンピオン 🏆',
    },
  },
  ko: {
    morning: [
      '좋은 아침! 물 한 잔으로 하루를 시작하세요 💧',
      '일어나서 수분 보충! 잠 후엔 몸이 물을 필요로 합니다 🌅',
      '아침 체크: 첫 잔은 드셨나요? ☀️',
    ],
    day: [
      '물 한잔할 시간! 💧',
      '수분 보충 잊지 마세요! 몸이 고마워할 거예요 😊',
      '빠른 알림: 지금 물 한 잔 드세요 🚰',
      '하루의 절반 — 수분 보충은 어떠세요? 💪',
      '물 한 잔이 피로를 멀리합니다! ⚡',
    ],
    evening: [
      '저녁 체크: 오늘 물 목표 달성하셨나요? 🌙',
      '물 한 잔으로 하루를 마무리하세요 💧',
      '잘 시간이 다가옵니다 — 마지막 한 잔! 😴',
    ],
    task: [
      '오늘 물 드셨나요? 💧 지금 시작하세요!',
      '오늘의 수분 미션이 기다립니다! 🎯',
      '새로운 날, 새로운 목표! 가봅시다 🚀',
    ],
    progress: {
      p25: '하루 목표의 25% 달성! 계속 화이팅 🌊',
      p50: '절반 달성! 계속 마셔요 💧',
      p75: '거의 다 왔어요! 조금만 더 🎯',
      p100: '오늘의 물 목표 달성! 멋져요 🎉',
      champion: '목표 초과 달성! 당신은 수분 보충 챔피언 🏆',
    },
  },
  zh: {
    morning: [
      '早上好！用一杯水开始你的一天 💧',
      '起床补水！睡眠后身体需要水 🌅',
      '早晨打卡：第一杯水喝了吗？☀️',
    ],
    day: [
      '该喝水休息一下了！💧',
      '别忘了补水！你的身体会感谢你 😊',
      '快速提醒：现在喝一杯水吧 🚰',
      '一天过半——你的补水情况怎样？💪',
      '一杯水让疲劳远离你！⚡',
    ],
    evening: [
      '晚间打卡：今天达到喝水目标了吗？🌙',
      '用一杯水结束这一天 💧',
      '快到睡觉时间——最后一杯！😴',
    ],
    task: [
      '今天喝水了吗？💧 立刻开始！',
      '你的每日补水任务在等你！🎯',
      '新的一天，新的补水目标！出发 🚀',
    ],
    progress: {
      p25: '已完成每日目标的25%！加油 🌊',
      p50: '已过半！继续喝 💧',
      p75: '快达成了！再来一点 🎯',
      p100: '你已完成今日喝水目标！太棒了 🎉',
      champion: '目标达成！你是补水冠军 🏆',
    },
  },
  ar: {
    morning: [
      'صباح الخير! ابدأ يومك بكوب من الماء 💧',
      'استيقظ ورطّب جسمك! جسمك يحتاج الماء بعد النوم 🌅',
      'تذكير الصباح: هل شربت كوبك الأول؟ ☀️',
    ],
    day: [
      'حان وقت استراحة الماء! 💧',
      'لا تنسَ شرب الماء! جسمك سيشكرك 😊',
      'تذكير سريع: اشرب كوب ماء الآن 🚰',
      'منتصف اليوم — كيف ترطيبك؟ 💪',
      'كوب ماء يُبعد التعب! ⚡',
    ],
    evening: [
      'تذكير المساء: هل وصلت لهدفك اليوم؟ 🌙',
      'اختم يومك بكوب من الماء 💧',
      'اقترب موعد النوم — كوب أخير! 😴',
    ],
    task: [
      'هل شربت الماء اليوم؟ 💧 ابدأ الآن!',
      'مهمة الترطيب اليومية بانتظارك! 🎯',
      'يوم جديد، أهداف ترطيب جديدة! هيا 🚀',
    ],
    progress: {
      p25: 'وصلت إلى 25٪ من هدفك اليومي! استمر 🌊',
      p50: 'في منتصف الطريق! استمر في الشرب 💧',
      p75: 'اقتربت! القليل بعد 🎯',
      p100: 'أكملت هدفك اليومي! رائع 🎉',
      champion: 'تم تجاوز الهدف! أنت بطل الترطيب 🏆',
    },
  },
  nl: {
    morning: [
      'Goedemorgen! Begin je dag met een glas water 💧',
      'Sta op en hydrateer! Je lichaam heeft water nodig na de slaap 🌅',
      'Ochtend-check: heb je al je eerste glas gehad? ☀️',
    ],
    day: [
      'Tijd voor een waterpauze! 💧',
      'Vergeet niet te hydrateren! Je lichaam zal je dankbaar zijn 😊',
      'Snelle reminder: drink nu een glas water 🚰',
      'Halverwege de dag — hoe gaat je hydratatie? 💪',
      'Een glas water houdt vermoeidheid weg! ⚡',
    ],
    evening: [
      'Avond-check: heb je je waterdoel vandaag gehaald? 🌙',
      'Sluit de dag af met een glas water 💧',
      'Bijna bedtijd — nog één glas! 😴',
    ],
    task: [
      'Heb je vandaag water gedronken? 💧 Begin nu!',
      'Je dagelijkse hydratatiemissie wacht! 🎯',
      'Nieuwe dag, nieuwe doelen! Daar gaan we 🚀',
    ],
    progress: {
      p25: 'Je bent op 25% van je dagdoel! Ga zo door 🌊',
      p50: 'Halverwege! Blijf drinken 💧',
      p75: 'Bijna klaar! Nog een beetje 🎯',
      p100: 'Je hebt je waterdoel bereikt! Geweldig 🎉',
      champion: 'Doel overtroffen! Jij bent een hydratatie-kampioen 🏆',
    },
  },
  pl: {
    morning: [
      'Dzień dobry! Zacznij dzień od szklanki wody 💧',
      'Wstań i nawodnij się! Twoje ciało potrzebuje wody po śnie 🌅',
      'Poranna kontrola: wypiłeś już pierwszą szklankę? ☀️',
    ],
    day: [
      'Czas na przerwę na wodę! 💧',
      'Pamiętaj o nawadnianiu! Twoje ciało Ci podziękuje 😊',
      'Szybkie przypomnienie: wypij teraz szklankę wody 🚰',
      'Połowa dnia za nami — jak Twoje nawodnienie? 💪',
      'Szklanka wody trzyma zmęczenie z daleka! ⚡',
    ],
    evening: [
      'Wieczorna kontrola: czy osiągnąłeś dzisiejszy cel? 🌙',
      'Zakończ dzień szklanką wody 💧',
      'Już prawie czas spać — ostatnia szklanka! 😴',
    ],
    task: [
      'Piłeś dziś wodę? 💧 Zacznij już teraz!',
      'Twoja codzienna misja nawadniania czeka! 🎯',
      'Nowy dzień, nowe cele! Do dzieła 🚀',
    ],
    progress: {
      p25: 'Masz już 25% dziennego celu! Tak trzymaj 🌊',
      p50: 'W połowie drogi! Pij dalej 💧',
      p75: 'Prawie gotowe! Jeszcze trochę 🎯',
      p100: 'Osiągnąłeś dzienny cel! Świetnie 🎉',
      champion: 'Cel przekroczony! Jesteś mistrzem nawadniania 🏆',
    },
  },
  sv: {
    morning: [
      'God morgon! Starta dagen med ett glas vatten 💧',
      'Vakna och hydrera! Kroppen behöver vatten efter sömnen 🌅',
      'Morgon-check: har du tagit ditt första glas? ☀️',
    ],
    day: [
      'Dags för en vattenpaus! 💧',
      'Glöm inte att hydrera! Kroppen tackar dig 😊',
      'Snabb påminnelse: drick ett glas vatten nu 🚰',
      'Halvvägs genom dagen — hur är hydreringen? 💪',
      'Ett glas vatten håller tröttheten borta! ⚡',
    ],
    evening: [
      'Kvälls-check: nådde du ditt vattenmål idag? 🌙',
      'Avsluta dagen med ett glas vatten 💧',
      'Nästan dags att sova — ett sista glas! 😴',
    ],
    task: [
      'Har du druckit vatten idag? 💧 Börja nu!',
      'Ditt dagliga hydreringsuppdrag väntar! 🎯',
      'Ny dag, nya mål! Kör 🚀',
    ],
    progress: {
      p25: 'Du är 25% till ditt mål! Fortsätt så 🌊',
      p50: 'Halvvägs! Fortsätt dricka 💧',
      p75: 'Nästan klar! Bara lite till 🎯',
      p100: 'Du nådde ditt dagliga mål! Fantastiskt 🎉',
      champion: 'Mål uppnått! Du är en hydreringsmästare 🏆',
    },
  },
  hi: {
    morning: [
      'सुप्रभात! एक गिलास पानी से दिन शुरू करें 💧',
      'जागो और हाइड्रेट हो जाओ! नींद के बाद शरीर को पानी चाहिए 🌅',
      'सुबह की जाँच: क्या पहला गिलास पिया? ☀️',
    ],
    day: [
      'पानी ब्रेक का समय! 💧',
      'हाइड्रेशन मत भूलो! शरीर आभारी होगा 😊',
      'त्वरित अनुस्मारक: अभी एक गिलास पानी पियें 🚰',
      'दिन का आधा बीत गया — हाइड्रेशन कैसी है? 💪',
      'एक गिलास पानी थकान को दूर रखता है! ⚡',
    ],
    evening: [
      'शाम की जाँच: क्या आज पानी का लक्ष्य पूरा हुआ? 🌙',
      'एक गिलास पानी के साथ दिन समाप्त करें 💧',
      'सोने का समय करीब — एक आखिरी गिलास! 😴',
    ],
    task: [
      'आज पानी पिया? 💧 अभी शुरू करें!',
      'आपका रोज़ का हाइड्रेशन मिशन इंतज़ार कर रहा है! 🎯',
      'नया दिन, नए लक्ष्य! चलो 🚀',
    ],
    progress: {
      p25: 'आप दैनिक लक्ष्य के 25% पर हैं! जारी रखें 🌊',
      p50: 'आधा रास्ता! पीते रहो 💧',
      p75: 'लगभग पूरा! बस थोड़ा और 🎯',
      p100: 'आपने अपना दैनिक लक्ष्य पूरा कर लिया! शानदार 🎉',
      champion: 'लक्ष्य पार! आप हाइड्रेशन चैंपियन हैं 🏆',
    },
  },
  id: {
    morning: [
      'Selamat pagi! Mulai harimu dengan segelas air 💧',
      'Bangun dan minum air! Tubuhmu butuh air setelah tidur 🌅',
      'Cek pagi: sudah minum gelas pertama? ☀️',
    ],
    day: [
      'Waktunya istirahat minum air! 💧',
      'Jangan lupa minum air! Tubuhmu akan berterima kasih 😊',
      'Pengingat singkat: minum segelas air sekarang 🚰',
      'Tengah hari — bagaimana hidrasimu? 💪',
      'Segelas air menjauhkan rasa lelah! ⚡',
    ],
    evening: [
      'Cek malam: sudah capai target air hari ini? 🌙',
      'Akhiri hari dengan segelas air 💧',
      'Hampir tidur — satu gelas terakhir! 😴',
    ],
    task: [
      'Sudah minum air hari ini? 💧 Mulai sekarang!',
      'Misi hidrasi harianmu menunggu! 🎯',
      'Hari baru, target hidrasi baru! Ayo 🚀',
    ],
    progress: {
      p25: 'Kamu sudah 25% target harian! Lanjutkan 🌊',
      p50: 'Setengah jalan! Terus minum 💧',
      p75: 'Hampir selesai! Sedikit lagi 🎯',
      p100: 'Kamu menyelesaikan target harian! Hebat 🎉',
      champion: 'Target tercapai! Kamu juara hidrasi 🏆',
    },
  },
  vi: {
    morning: [
      'Chào buổi sáng! Bắt đầu ngày mới với một ly nước 💧',
      'Thức dậy và bổ sung nước! Cơ thể cần nước sau giấc ngủ 🌅',
      'Kiểm tra buổi sáng: bạn đã uống ly đầu chưa? ☀️',
    ],
    day: [
      'Đã đến lúc nghỉ uống nước! 💧',
      'Đừng quên cấp nước! Cơ thể sẽ cảm ơn bạn 😊',
      'Nhắc nhẹ: uống một ly nước ngay bây giờ 🚰',
      'Nửa ngày đã qua — tình trạng cấp nước thế nào? 💪',
      'Một ly nước đẩy lùi mệt mỏi! ⚡',
    ],
    evening: [
      'Kiểm tra buổi tối: bạn đã đạt mục tiêu hôm nay chưa? 🌙',
      'Kết thúc ngày với một ly nước 💧',
      'Sắp đến giờ đi ngủ — một ly cuối cùng! 😴',
    ],
    task: [
      'Hôm nay bạn đã uống nước chưa? 💧 Bắt đầu ngay!',
      'Nhiệm vụ cấp nước hàng ngày đang chờ! 🎯',
      'Ngày mới, mục tiêu mới! Nào đi 🚀',
    ],
    progress: {
      p25: 'Bạn đã đạt 25% mục tiêu hôm nay! Tiếp tục 🌊',
      p50: 'Đã đi được nửa đường! Tiếp tục uống 💧',
      p75: 'Sắp xong rồi! Chỉ cần một chút nữa 🎯',
      p100: 'Bạn đã hoàn thành mục tiêu hôm nay! Tuyệt vời 🎉',
      champion: 'Vượt mục tiêu! Bạn là nhà vô địch cấp nước 🏆',
    },
  },
};

const TIMEZONE_FALLBACK: LangCode = 'en';

function getBucketForHour(hour: number, wakeH: number, sleepH: number): Bucket {
  // 4-hour morning window from wake → wake+4, then day until wake+9, then evening until sleep
  if (hour < (wakeH + 4) % 24 || (wakeH + 4 >= 24 && hour < (wakeH + 4) % 24)) return 'morning';
  if (hour >= (wakeH + 4) % 24 && hour < Math.max(sleepH - 3, wakeH + 5)) return 'day';
  return 'evening';
}

function pickFromBucket(lang: LangCode, bucket: Bucket, rotationIdx: number): string {
  const m = MESSAGES[lang] || MESSAGES[TIMEZONE_FALLBACK];
  const arr = m[bucket];
  if (!arr || arr.length === 0) return '';
  return arr[rotationIdx % arr.length];
}

/** Public helper — returns the right progress text based on current progress %. */
export function getProgressNotificationBody(lang: LangCode, progressPercent: number): string {
  const m = MESSAGES[lang] || MESSAGES[TIMEZONE_FALLBACK];
  if (progressPercent >= 110) return m.progress.champion;
  if (progressPercent >= 100) return m.progress.p100;
  if (progressPercent >= 75) return m.progress.p75;
  if (progressPercent >= 50) return m.progress.p50;
  if (progressPercent >= 25) return m.progress.p25;
  return '';
}

/** Public helper — pick a random message from any bucket (fallback for ad-hoc use). */
export function getRandomReminderBody(lang: LangCode): string {
  const m = MESSAGES[lang] || MESSAGES[TIMEZONE_FALLBACK];
  const pool = [...m.morning, ...m.day, ...m.evening];
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let final = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      final = status;
    }
    return final === 'granted';
  } catch {
    return false;
  }
}

/**
 * Schedules hourly daily reminders (1 per hour) from wake → sleep.
 * Each notification picks the right message bucket (morning/day/evening) and
 * a rotating message within that bucket so the same text is rarely repeated.
 * The first scheduled hour also uses a "task kickoff" message.
 */
export async function scheduleReminders(settings: UserSettings): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!settings.remindersEnabled) return;

    const [wakeH, wakeM] = settings.wakeTime.split(':').map(Number);
    const [sleepH, sleepM] = settings.sleepTime.split(':').map(Number);
    // Fixed 1-hour cadence per the latest product spec.
    const intervalMin = 60;

    const wakeMinutes = wakeH * 60 + wakeM;
    let sleepMinutes = sleepH * 60 + sleepM;
    if (sleepMinutes <= wakeMinutes) sleepMinutes += 24 * 60;

    const lang: LangCode = settings.language as LangCode;
    const msgs = MESSAGES[lang] || MESSAGES[TIMEZONE_FALLBACK];

    let cur = wakeMinutes;
    let idx = 0;
    // Schedule up to 18 hourly slots per day (more than enough for any wake/sleep window)
    let morningRot = 0;
    let dayRot = 0;
    let eveningRot = 0;
    let taskUsed = false;

    while (cur < sleepMinutes && idx < 18) {
      const h = Math.floor(cur / 60) % 24;
      const m = cur % 60;
      let body: string;

      if (!taskUsed && idx === 0) {
        // First notification of the day = task kickoff
        body = msgs.task[Math.floor(Math.random() * msgs.task.length)];
        taskUsed = true;
      } else {
        const bucket = getBucketForHour(h, wakeH, sleepH);
        if (bucket === 'morning') {
          body = pickFromBucket(lang, 'morning', morningRot++);
        } else if (bucket === 'day') {
          body = pickFromBucket(lang, 'day', dayRot++);
        } else {
          body = pickFromBucket(lang, 'evening', eveningRot++);
        }
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: tr_fn(lang, 'app_name'),
          body,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: h,
          minute: m,
        } as any,
      });
      cur += intervalMin;
      idx++;
    }
  } catch (e) {
    console.warn('Failed to schedule reminders', e);
  }
}

export async function cancelAllReminders(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}

/**
 * Fires an immediate local notification for goal-progress milestones.
 * Call this from your "log water" action after the percent crosses a threshold.
 */
export async function sendProgressNotification(lang: LangCode, progressPercent: number): Promise<void> {
  if (Platform.OS === 'web') return;
  const body = getProgressNotificationBody(lang, progressPercent);
  if (!body) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: tr_fn(lang, 'app_name'),
        body,
        sound: true,
      },
      trigger: null, // immediate
    });
  } catch (e) {
    console.warn('Failed to send progress notification', e);
  }
}
