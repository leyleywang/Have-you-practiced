// ==================== 数据存储模块 ====================
const Storage = {
    KEYS: {
        USER: 'fitness_user',
        PLAN: 'fitness_plan',
        WORKOUTS: 'fitness_workouts',
        DIARIES: 'fitness_diaries',
        SETTINGS: 'fitness_settings',
        WEIGHT_HISTORY: 'fitness_weight_history',
        LAST_WORKOUT_DATE: 'fitness_last_workout'
    },

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Storage get error:', e);
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },

    remove(key) {
        localStorage.removeItem(key);
    },

    clearAll() {
        Object.values(this.KEYS).forEach(key => localStorage.removeItem(key));
    }
};

// ==================== 数据模型模块 ====================
const Models = {
    createUser(data) {
        return {
            id: Date.now().toString(),
            name: '健身爱好者',
            avatar: null,
            height: parseInt(data.height) || 175,
            initialWeight: parseInt(data.weight) || 70,
            goal: data.goal || 'maintain',
            weeklyDays: data.weeklyDays || 3,
            injuries: data.injuries || [],
            createdAt: new Date().toISOString()
        };
    },

    createPlan(user) {
        const stages = this.generateStages(user);
        return {
            userId: user.id,
            currentStage: 0,
            intensity: 'medium',
            autoIntensity: true,
            stages: stages,
            createdAt: new Date().toISOString()
        };
    },

    generateStages(user) {
        const stages = [];
        const stageCount = 4;
        const workoutTemplates = this.getWorkoutTemplates(user);

        for (let i = 0; i < stageCount; i++) {
            const stage = {
                id: i,
                name: this.getStageName(i, user.goal),
                description: this.getStageDescription(i, user.goal),
                intensity: this.getStageIntensity(i),
                workouts: [],
                status: i === 0 ? 'current' : 'pending',
                startDate: i === 0 ? new Date().toISOString() : null,
                endDate: null
            };

            const workoutsPerStage = Math.max(6, user.weeklyDays * 2);
            for (let j = 0; j < workoutsPerStage; j++) {
                const template = workoutTemplates[i % workoutTemplates.length];
                stage.workouts.push({
                    id: `${i}-${j}`,
                    name: template.name,
                    duration: this.calculateDuration(i, user.goal),
                    exercises: template.exercises,
                    targetWeight: user.initialWeight,
                    completed: false,
                    completedAt: null
                });
            }

            stages.push(stage);
        }

        return stages;
    },

    getStageName(index, goal) {
        const names = {
            lose: ['适应期', '燃脂期', '塑形期', '巩固期'],
            gain: ['入门期', '增肌期', '强化期', '塑形期'],
            maintain: ['适应期', '提升期', '进阶期', '巩固期'],
            strength: ['基础期', '进阶期', '强化期', '突破期']
        };
        return names[goal]?.[index] || `阶段 ${index + 1}`;
    },

    getStageDescription(index, goal) {
        const descriptions = {
            lose: [
                '让身体适应运动节奏，培养运动习惯',
                '增加有氧运动比例，加速脂肪燃烧',
                '结合力量训练，塑造紧致身材',
                '巩固训练成果，养成健康生活方式'
            ],
            gain: [
                '学习正确动作，建立运动基础',
                '增加训练强度，刺激肌肉生长',
                '优化训练计划，突破增肌瓶颈',
                '精细化训练，塑造完美体型'
            ],
            maintain: [
                '建立规律的运动习惯',
                '提升体能水平',
                '尝试更多运动形式',
                '保持健康生活状态'
            ],
            strength: [
                '掌握基础动作模式',
                '逐步增加负重',
                '提升最大力量',
                '突破力量极限'
            ]
        };
        return descriptions[goal]?.[index] || '持续训练，不断进步';
    },

    getStageIntensity(index) {
        const intensities = ['low', 'medium', 'high', 'very-high'];
        return intensities[Math.min(index, intensities.length - 1)];
    },

    getWorkoutTemplates(user) {
        const templates = {
            lose: [
                {
                    name: '全身燃脂训练',
                    exercises: [
                        { name: '开合跳', sets: 3, reps: '30秒', rest: '30秒' },
                        { name: '高抬腿', sets: 3, reps: '30秒', rest: '30秒' },
                        { name: '深蹲', sets: 3, reps: '15次', rest: '45秒' },
                        { name: '俯卧撑', sets: 3, reps: '10次', rest: '45秒' },
                        { name: '平板支撑', sets: 3, reps: '30秒', rest: '30秒' }
                    ]
                },
                {
                    name: '有氧训练',
                    exercises: [
                        { name: '快走/慢跑', sets: 1, reps: '20分钟', rest: '0秒' },
                        { name: '跳绳', sets: 3, reps: '1分钟', rest: '1分钟' },
                        { name: '登山跑', sets: 3, reps: '30秒', rest: '30秒' }
                    ]
                },
                {
                    name: '核心训练',
                    exercises: [
                        { name: '卷腹', sets: 3, reps: '15次', rest: '30秒' },
                        { name: '俄罗斯转体', sets: 3, reps: '20次', rest: '30秒' },
                        { name: '腿举', sets: 3, reps: '15次', rest: '30秒' },
                        { name: '超人式', sets: 3, reps: '10次', rest: '30秒' }
                    ]
                }
            ],
            gain: [
                {
                    name: '胸部训练',
                    exercises: [
                        { name: '俯卧撑', sets: 4, reps: '12次', rest: '60秒' },
                        { name: '上斜俯卧撑', sets: 3, reps: '12次', rest: '60秒' },
                        { name: '下斜俯卧撑', sets: 3, reps: '10次', rest: '60秒' },
                        { name: '钻石俯卧撑', sets: 3, reps: '10次', rest: '60秒' }
                    ]
                },
                {
                    name: '背部训练',
                    exercises: [
                        { name: '引体向上(辅助)', sets: 4, reps: '8次', rest: '60秒' },
                        { name: '划船', sets: 4, reps: '12次', rest: '60秒' },
                        { name: '超人式', sets: 3, reps: '12次', rest: '45秒' },
                        { name: '鸟狗式', sets: 3, reps: '10次/侧', rest: '45秒' }
                    ]
                },
                {
                    name: '腿部训练',
                    exercises: [
                        { name: '深蹲', sets: 4, reps: '15次', rest: '60秒' },
                        { name: '箭步蹲', sets: 3, reps: '12次/侧', rest: '60秒' },
                        { name: '保加利亚分腿蹲', sets: 3, reps: '10次/侧', rest: '60秒' },
                        { name: '提踵', sets: 3, reps: '20次', rest: '30秒' }
                    ]
                }
            ],
            maintain: [
                {
                    name: '全身综合训练',
                    exercises: [
                        { name: '深蹲', sets: 3, reps: '15次', rest: '45秒' },
                        { name: '俯卧撑', sets: 3, reps: '12次', rest: '45秒' },
                        { name: '划船', sets: 3, reps: '12次', rest: '45秒' },
                        { name: '平板支撑', sets: 3, reps: '45秒', rest: '30秒' },
                        { name: '卷腹', sets: 3, reps: '15次', rest: '30秒' }
                    ]
                },
                {
                    name: '有氧+力量',
                    exercises: [
                        { name: '快走/慢跑', sets: 1, reps: '15分钟', rest: '0秒' },
                        { name: '深蹲', sets: 3, reps: '12次', rest: '45秒' },
                        { name: '俯卧撑', sets: 3, reps: '10次', rest: '45秒' },
                        { name: '弓步蹲', sets: 3, reps: '10次/侧', rest: '45秒' }
                    ]
                }
            ],
            strength: [
                {
                    name: '下肢力量',
                    exercises: [
                        { name: '深蹲', sets: 5, reps: '5次', rest: '90秒' },
                        { name: '罗马尼亚硬拉', sets: 4, reps: '8次', rest: '90秒' },
                        { name: '箭步蹲', sets: 3, reps: '10次/侧', rest: '60秒' },
                        { name: '提踵', sets: 4, reps: '15次', rest: '45秒' }
                    ]
                },
                {
                    name: '上肢力量',
                    exercises: [
                        { name: '俯卧撑', sets: 5, reps: '8-10次', rest: '90秒' },
                        { name: '引体向上', sets: 5, reps: '5-8次', rest: '90秒' },
                        { name: '臂屈伸', sets: 4, reps: '10次', rest: '60秒' },
                        { name: '弯举', sets: 4, reps: '12次', rest: '60秒' }
                    ]
                }
            ]
        };

        return templates[user.goal] || templates.maintain;
    },

    calculateDuration(stageIndex, goal) {
        const baseDuration = 30;
        const stageBonus = stageIndex * 5;
        const goalBonus = goal === 'lose' ? 10 : 0;
        return baseDuration + stageBonus + goalBonus;
    },

    createDiary(workout, completed, date = new Date()) {
        return {
            id: Date.now().toString(),
            workoutId: workout.id,
            stageId: workout.stageId,
            name: workout.name,
            duration: workout.duration,
            targetWeight: workout.targetWeight,
            actualWeight: null,
            completed: completed,
            completedAt: date.toISOString(),
            notes: ''
        };
    },

    createWeightRecord(weight, date = new Date()) {
        return {
            id: Date.now().toString(),
            weight: parseFloat(weight),
            date: date.toISOString()
        };
    }
};

// ==================== 应用状态管理 ====================
const AppState = {
    currentPage: 'home',
    user: null,
    plan: null,
    diaries: [],
    weightHistory: [],
    settings: {
        reminderEnabled: false,
        reminderTime: '18:00',
        dndEnabled: false,
        dndStart: '22:00',
        dndEnd: '08:00',
        autoIntensity: true
    },

    init() {
        this.user = Storage.get(Storage.KEYS.USER);
        this.plan = Storage.get(Storage.KEYS.PLAN);
        this.diaries = Storage.get(Storage.KEYS.DIARIES) || [];
        this.weightHistory = Storage.get(Storage.KEYS.WEIGHT_HISTORY) || [];
        
        const savedSettings = Storage.get(Storage.KEYS.SETTINGS);
        if (savedSettings) {
            this.settings = { ...this.settings, ...savedSettings };
        }
    },

    save() {
        if (this.user) Storage.set(Storage.KEYS.USER, this.user);
        if (this.plan) Storage.set(Storage.KEYS.PLAN, this.plan);
        Storage.set(Storage.KEYS.DIARIES, this.diaries);
        Storage.set(Storage.KEYS.WEIGHT_HISTORY, this.weightHistory);
        Storage.set(Storage.KEYS.SETTINGS, this.settings);
    },

    isNewUser() {
        return !this.user;
    }
};

// ==================== 工具函数 ====================
const Utils = {
    formatDate(date) {
        const d = new Date(date);
        return `${d.getMonth() + 1}月${d.getDate()}日`;
    },

    formatDateFull(date) {
        const d = new Date(date);
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${weekDays[d.getDay()]}`;
    },

    getWeekDays() {
        const today = new Date();
        const weekDays = [];
        const dayOfWeek = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            weekDays.push({
                date: date,
                dayName: ['一', '二', '三', '四', '五', '六', '日'][i],
                dayNumber: date.getDate(),
                isToday: this.isSameDay(date, today)
            });
        }
        return weekDays;
    },

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    },

    daysBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        d1.setHours(0, 0, 0, 0);
        d2.setHours(0, 0, 0, 0);
        return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
    },

    getIntensityLabel(intensity) {
        const labels = {
            'low': '低强度',
            'medium': '中等',
            'high': '高强度',
            'very-high': '极高'
        };
        return labels[intensity] || '中等';
    },

    getGoalLabel(goal) {
        const labels = {
            'lose': '减脂减重',
            'gain': '增肌塑形',
            'maintain': '保持健康',
            'strength': '力量提升'
        };
        return labels[goal] || '保持健康';
    }
};

// ==================== UI 渲染模块 ====================
const UI = {
    show(element) {
        element.classList.remove('hidden');
    },

    hide(element) {
        element.classList.add('hidden');
    },

    switchPage(pageName) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === pageName);
        });

        const pages = ['home', 'plan', 'diary', 'profile'];
        pages.forEach(page => {
            const pageEl = document.getElementById(`${page}-page`);
            if (page === pageName) {
                this.show(pageEl);
            } else {
                this.hide(pageEl);
            }
        });

        AppState.currentPage = pageName;
        this.renderCurrentPage();
    },

    renderCurrentPage() {
        switch (AppState.currentPage) {
            case 'home':
                this.renderHomePage();
                break;
            case 'plan':
                this.renderPlanPage();
                break;
            case 'diary':
                this.renderDiaryPage();
                break;
            case 'profile':
                this.renderProfilePage();
                break;
        }
    },

    showOnboarding() {
        this.show(document.getElementById('onboarding-page'));
        this.hide(document.getElementById('main-app'));
    },

    showMainApp() {
        this.hide(document.getElementById('onboarding-page'));
        this.show(document.getElementById('main-app'));
        this.renderCurrentPage();
    },

    // 首页渲染
    renderHomePage() {
        this.renderCurrentDate();
        this.renderTodayWorkout();
        this.renderCalendarStrip();
        this.renderWeightChart();
        this.renderWeeklyReport();
    },

    renderCurrentDate() {
        const dateEl = document.getElementById('current-date');
        if (dateEl) {
            dateEl.textContent = Utils.formatDateFull(new Date());
        }
    },

    renderTodayWorkout() {
        const contentEl = document.getElementById('today-workout-content');
        const stageEl = document.getElementById('current-stage');
        
        if (!AppState.plan || !contentEl) return;

        const currentStage = AppState.plan.stages[AppState.plan.currentStage];
        if (!currentStage) return;

        stageEl.textContent = currentStage.name;

        const pendingWorkouts = currentStage.workouts.filter(w => !w.completed);
        const todayWorkout = pendingWorkouts[0] || currentStage.workouts[currentStage.workouts.length - 1];

        if (todayWorkout) {
            contentEl.innerHTML = `
                <div class="workout-item">
                    <span class="workout-name">${todayWorkout.name}</span>
                    <span class="workout-duration">${todayWorkout.duration} 分钟</span>
                </div>
                <div style="font-size: 12px; opacity: 0.9; margin-top: 8px;">
                    目标体重: ${todayWorkout.targetWeight} kg
                </div>
            `;
        }
    },

    renderCalendarStrip() {
        const container = document.getElementById('calendar-strip');
        if (!container) return;

        const weekDays = Utils.getWeekDays();
        const completedDates = this.getCompletedDates();

        container.innerHTML = weekDays.map(day => {
            let status = '';
            const dateStr = day.date.toISOString().split('T')[0];
            
            if (day.isToday) {
                status = 'today';
            } else if (completedDates.has(dateStr)) {
                status = 'completed';
            } else if (day.date < new Date()) {
                status = 'missed';
            }

            return `
                <div class="calendar-day ${status}" data-date="${dateStr}">
                    <span class="calendar-day-name">${day.dayName}</span>
                    <span class="calendar-day-number">${day.dayNumber}</span>
                </div>
            `;
        }).join('');
    },

    getCompletedDates() {
        const dates = new Set();
        AppState.diaries.forEach(diary => {
            if (diary.completed) {
                const dateStr = new Date(diary.completedAt).toISOString().split('T')[0];
                dates.add(dateStr);
            }
        });
        return dates;
    },

    renderWeightChart() {
        const canvas = document.getElementById('weight-chart');
        if (!canvas || AppState.weightHistory.length === 0) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        
        canvas.width = width * 2;
        canvas.height = height * 2;
        ctx.scale(2, 2);

        const weights = AppState.weightHistory.slice(-7);
        const minWeight = Math.min(...weights.map(w => w.weight)) - 2;
        const maxWeight = Math.max(...weights.map(w => w.weight)) + 2;
        const range = maxWeight - minWeight;

        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        ctx.clearRect(0, 0, width, height);

        ctx.strokeStyle = '#E0E0E0';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding + (chartHeight / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.strokeStyle = '#FF6B6B';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';

        weights.forEach((record, i) => {
            const x = padding + (chartWidth / (weights.length - 1 || 1)) * i;
            const y = padding + chartHeight - ((record.weight - minWeight) / range) * chartHeight;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        ctx.fillStyle = '#FF6B6B';
        weights.forEach((record, i) => {
            const x = padding + (chartWidth / (weights.length - 1 || 1)) * i;
            const y = padding + chartHeight - ((record.weight - minWeight) / range) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.fillStyle = '#666';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        weights.forEach((record, i) => {
            const x = padding + (chartWidth / (weights.length - 1 || 1)) * i;
            const date = new Date(record.date);
            ctx.fillText(`${date.getMonth() + 1}/${date.getDate()}`, x, height - 15);
        });
    },

    renderWeeklyReport() {
        const weekEl = document.getElementById('report-week');
        const contentEl = document.getElementById('report-content');
        
        if (!weekEl || !contentEl) return;

        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
        
        weekEl.textContent = `${weekStart.getMonth() + 1}/${weekStart.getDate()} - ${today.getMonth() + 1}/${today.getDate()}`;

        const weekDiaries = AppState.diaries.filter(d => {
            const diaryDate = new Date(d.completedAt);
            return diaryDate >= weekStart && diaryDate <= today;
        });

        const completedCount = weekDiaries.filter(d => d.completed).length;
        const totalDuration = weekDiaries.reduce((sum, d) => sum + (d.completed ? d.duration : 0), 0);
        const totalDays = Math.min(AppState.user?.weeklyDays || 3, 7);
        const completionRate = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

        contentEl.innerHTML = `
            <div class="report-summary">
                <div class="report-summary-item">
                    <div class="report-summary-value">${completedCount}/${totalDays}</div>
                    <div class="report-summary-label">训练天数</div>
                </div>
                <div class="report-summary-item">
                    <div class="report-summary-value">${Math.round(totalDuration / 60)}h</div>
                    <div class="report-summary-label">训练时长</div>
                </div>
                <div class="report-summary-item">
                    <div class="report-summary-value">${completionRate}%</div>
                    <div class="report-summary-label">完成率</div>
                </div>
                <div class="report-summary-item">
                    <div class="report-summary-value">${this.getStreak()}</div>
                    <div class="report-summary-label">连续打卡</div>
                </div>
            </div>
        `;
    },

    getStreak() {
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sortedDiaries = [...AppState.diaries]
            .filter(d => d.completed)
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

        for (let i = 0; i < sortedDiaries.length; i++) {
            const diaryDate = new Date(sortedDiaries[i].completedAt);
            diaryDate.setHours(0, 0, 0, 0);
            
            const daysDiff = Math.floor((today - diaryDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === i || daysDiff === i + 1) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    },

    // 计划页面渲染
    renderPlanPage() {
        const noPlanState = document.getElementById('no-plan-state');
        const planContent = document.getElementById('plan-content');
        
        if (!AppState.plan) {
            if (noPlanState) noPlanState.classList.remove('hidden');
            if (planContent) planContent.classList.add('hidden');
            return;
        }

        if (noPlanState) noPlanState.classList.add('hidden');
        if (planContent) planContent.classList.remove('hidden');

        const intensityEl = document.getElementById('current-intensity');
        const progressTextEl = document.getElementById('stage-progress-text');
        const progressPercentEl = document.getElementById('stage-progress-percent');
        const progressFillEl = document.getElementById('stage-progress-fill');
        const stagesContainer = document.getElementById('plan-stages');

        const currentStageIndex = AppState.plan.currentStage;
        const totalStages = AppState.plan.stages.length;
        const progress = ((currentStageIndex + 1) / totalStages) * 100;

        intensityEl.textContent = `强度: ${Utils.getIntensityLabel(AppState.plan.intensity)}`;
        progressTextEl.textContent = `阶段 ${currentStageIndex + 1} / ${totalStages}`;
        progressPercentEl.textContent = `${Math.round(progress)}%`;
        progressFillEl.style.width = `${progress}%`;

        stagesContainer.innerHTML = AppState.plan.stages.map((stage, index) => {
            const completedWorkouts = stage.workouts.filter(w => w.completed).length;
            const totalWorkouts = stage.workouts.length;
            let status = 'pending';
            
            if (index < currentStageIndex) {
                status = 'completed';
            } else if (index === currentStageIndex) {
                status = 'current';
            }

            const statusClass = status === 'current' ? 'current' : status === 'completed' ? 'completed' : '';
            const statusLabel = status === 'current' ? '进行中' : status === 'completed' ? '已完成' : '待开始';

            return `
                <div class="stage-card ${statusClass}" data-stage="${index}">
                    <div class="stage-card-header">
                        <div>
                            <h4 class="stage-title">${stage.name}</h4>
                            <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">${stage.description}</p>
                        </div>
                        <span class="stage-status ${status}">${statusLabel}</span>
                    </div>
                    <div class="stage-workouts">
                        ${stage.workouts.slice(0, 3).map(workout => `
                            <div class="stage-workout-item" onclick="editWorkout(${index}, '${workout.id}')">
                                <div class="workout-info">
                                    <h4>${workout.name}</h4>
                                    <p>目标体重: ${workout.targetWeight} kg</p>
                                </div>
                                <div class="workout-meta">
                                    <div class="workout-duration">${workout.duration} 分钟</div>
                                    <div class="workout-weight">${workout.completed ? '✓ 已完成' : '待完成'}</div>
                                </div>
                            </div>
                        `).join('')}
                        ${stage.workouts.length > 3 ? `
                            <div style="text-align: center; padding: 8px; color: var(--primary-color); cursor: pointer;" onclick="showStageDetail(${index})">
                                查看全部 ${totalWorkouts} 个训练 →
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    },

    // 日记页面渲染
    renderDiaryPage(filter = 'all') {
        const listEl = document.getElementById('diary-list');
        const emptyEl = document.getElementById('diary-empty');
        
        if (!listEl || !emptyEl) return;

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        let diaries = [...AppState.diaries];
        
        if (filter === 'completed') {
            diaries = diaries.filter(d => d.completed);
        } else if (filter === 'missed') {
            diaries = diaries.filter(d => !d.completed);
        }

        diaries.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

        if (AppState.diaries.length === 0) {
            this.hide(listEl);
            this.show(emptyEl);
            return;
        }

        if (diaries.length === 0) {
            this.hide(listEl);
            this.hide(emptyEl);
            return;
        }

        this.show(listEl);
        this.hide(emptyEl);

        const grouped = {};
        diaries.forEach(diary => {
            const dateStr = new Date(diary.completedAt).toISOString().split('T')[0];
            if (!grouped[dateStr]) {
                grouped[dateStr] = [];
            }
            grouped[dateStr].push(diary);
        });

        listEl.innerHTML = Object.entries(grouped).map(([dateStr, dayDiaries]) => {
            const completedCount = dayDiaries.filter(d => d.completed).length;
            const totalCount = dayDiaries.length;
            let completionStatus = 'partial';
            if (completedCount === totalCount) completionStatus = 'completed';
            else if (completedCount === 0) completionStatus = 'missed';

            const statusText = completionStatus === 'completed' ? '全部完成' : 
                              completionStatus === 'missed' ? '未完成' : 
                              `完成 ${completedCount}/${totalCount}`;

            return `
                <div class="diary-date-group">
                    <div class="diary-date-header">
                        <span class="diary-date">${Utils.formatDate(dateStr)}</span>
                        <span class="diary-completion ${completionStatus}">${statusText}</span>
                    </div>
                    ${dayDiaries.map(diary => `
                        <div class="diary-item ${diary.completed ? 'completed' : 'missed'}">
                            <div class="diary-stage">${diary.name}</div>
                            <div class="diary-name">${diary.name}</div>
                            <div class="diary-details">
                                <div class="diary-detail-item">⏱️ ${diary.duration}分钟</div>
                                <div class="diary-detail-item">⚖️ ${diary.targetWeight}kg</div>
                                <div class="diary-detail-item">${diary.completed ? '✅ 已完成' : '❌ 未完成'}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }).join('');
    },

    // 我的页面渲染
    renderProfilePage() {
        if (!AppState.user) return;

        const nameEl = document.getElementById('user-name');
        const statsEl = document.getElementById('user-stats');
        const avatarTextEl = document.getElementById('avatar-text');
        const reminderStatusEl = document.getElementById('reminder-status');
        const dndStatusEl = document.getElementById('dnd-status');
        const intensityStatusEl = document.getElementById('intensity-status');
        const intensityAutoEl = document.getElementById('intensity-auto');

        const totalDays = AppState.diaries.filter(d => d.completed).length;
        const totalHours = Math.round(AppState.diaries.reduce((sum, d) => sum + (d.completed ? d.duration : 0), 0) / 60);
        const streak = this.getStreak();
        
        const totalPlanned = AppState.plan ? AppState.plan.stages.reduce((sum, s) => sum + s.workouts.length, 0) : 0;
        const completionRate = totalPlanned > 0 ? Math.round((totalDays / totalPlanned) * 100) : 0;

        nameEl.textContent = AppState.user.name || '健身爱好者';
        statsEl.textContent = `身高: ${AppState.user.height} cm | 体重: ${AppState.user.initialWeight} kg`;
        avatarTextEl.textContent = AppState.user.name ? AppState.user.name.charAt(0) : '练';

        reminderStatusEl.textContent = AppState.settings.reminderEnabled ? 
            `${AppState.settings.reminderTime} 提醒` : '已关闭';
        dndStatusEl.textContent = AppState.settings.dndEnabled ? 
            `${AppState.settings.dndStart} - ${AppState.settings.dndEnd}` : '未设置';
        intensityStatusEl.textContent = Utils.getIntensityLabel(AppState.plan?.intensity || 'medium');
        intensityAutoEl.checked = AppState.settings.autoIntensity;

        document.getElementById('stat-total-days').textContent = totalDays;
        document.getElementById('stat-current-streak').textContent = streak;
        document.getElementById('stat-total-hours').textContent = totalHours;
        document.getElementById('stat-completion-rate').textContent = `${completionRate}%`;
    },

    // 模态框
    showModal(content) {
        const overlay = document.getElementById('modal-overlay');
        const modalContent = document.getElementById('modal-content');
        modalContent.innerHTML = content;
        this.show(overlay);
    },

    hideModal() {
        const overlay = document.getElementById('modal-overlay');
        this.hide(overlay);
    },

    // 通知
    showNotification(title, message, icon = '💡') {
        const notification = document.getElementById('notification');
        document.getElementById('notification-icon').textContent = icon;
        document.getElementById('notification-title').textContent = title;
        document.getElementById('notification-message').textContent = message;
        
        this.show(notification);
        
        setTimeout(() => {
            this.hideNotification();
        }, 5000);
    },

    hideNotification() {
        const notification = document.getElementById('notification');
        this.hide(notification);
    }
};

// ==================== 引导流程 ====================
const Onboarding = {
    currentStep: 1,
    tempData: {
        goal: null,
        weeklyDays: null,
        injuries: []
    },

    nextStep(currentStep) {
        if (currentStep === 1) {
            const height = document.getElementById('height').value;
            const weight = document.getElementById('weight').value;
            
            if (!height || !weight) {
                UI.showNotification('提示', '请填写身高和体重', '⚠️');
                return;
            }
            
            this.tempData.height = height;
            this.tempData.weight = weight;
        } else if (currentStep === 2) {
            if (!this.tempData.goal) {
                UI.showNotification('提示', '请选择健身目标', '⚠️');
                return;
            }
        } else if (currentStep === 3) {
            if (!this.tempData.weeklyDays) {
                UI.showNotification('提示', '请选择每周训练天数', '⚠️');
                return;
            }
        }

        this.showStep(currentStep + 1);
    },

    prevStep(currentStep) {
        this.showStep(currentStep - 1);
    },

    showStep(step) {
        for (let i = 1; i <= 4; i++) {
            const stepEl = document.getElementById(`step-${i}`);
            if (i === step) {
                UI.show(stepEl);
                stepEl.classList.add('active');
            } else {
                UI.hide(stepEl);
                stepEl.classList.remove('active');
            }
        }
        this.currentStep = step;
    },

    selectGoal(goal) {
        this.tempData.goal = goal;
        document.querySelectorAll('.goal-option').forEach(el => {
            el.classList.toggle('selected', el.dataset.goal === goal);
        });
    },

    selectDays(days) {
        this.tempData.weeklyDays = days;
        document.querySelectorAll('.day-option').forEach(el => {
            el.classList.toggle('selected', parseInt(el.dataset.days) === days);
        });
    },

    getSelectedInjuries() {
        const injuries = [];
        document.querySelectorAll('.injury-option input:checked').forEach(input => {
            injuries.push(input.dataset.injury);
        });
        return injuries;
    },

    complete() {
        this.tempData.injuries = this.getSelectedInjuries();
        
        const user = Models.createUser(this.tempData);
        const plan = Models.createPlan(user);
        
        const weightRecord = Models.createWeightRecord(user.initialWeight);
        
        AppState.user = user;
        AppState.plan = plan;
        AppState.weightHistory = [weightRecord];
        AppState.save();

        UI.showMainApp();
        UI.showNotification('欢迎加入！', '已根据您的情况生成训练计划', '🎉');
    }
};

// ==================== 训练计划管理 ====================
const PlanManager = {
    getTodayWorkout() {
        if (!AppState.plan) return null;
        
        const stage = AppState.plan.stages[AppState.plan.currentStage];
        if (!stage) return null;

        const pending = stage.workouts.filter(w => !w.completed);
        return pending[0] || stage.workouts[stage.workouts.length - 1];
    },

    completeWorkout(workoutId) {
        if (!AppState.plan) return;

        const stage = AppState.plan.stages[AppState.plan.currentStage];
        if (!stage) return;

        const workout = stage.workouts.find(w => w.id === workoutId);
        if (workout) {
            workout.completed = true;
            workout.completedAt = new Date().toISOString();

            const diary = Models.createDiary({
                ...workout,
                stageId: AppState.plan.currentStage
            }, true);
            AppState.diaries.push(diary);

            Storage.set(Storage.KEYS.LAST_WORKOUT_DATE, new Date().toISOString());

            this.checkStageCompletion(stage);
            AppState.save();
            UI.renderCurrentPage();
            UI.showNotification('太棒了！', '训练已完成，继续保持！', '🎉');
        }
    },

    checkStageCompletion(stage) {
        const allCompleted = stage.workouts.every(w => w.completed);
        if (allCompleted) {
            stage.status = 'completed';
            stage.endDate = new Date().toISOString();

            const nextStageIndex = AppState.plan.currentStage + 1;
            if (nextStageIndex < AppState.plan.stages.length) {
                AppState.plan.currentStage = nextStageIndex;
                AppState.plan.stages[nextStageIndex].status = 'current';
                AppState.plan.stages[nextStageIndex].startDate = new Date().toISOString();

                UI.showNotification('恭喜！', `已完成${stage.name}，进入下一阶段`, '🎊');
            } else {
                UI.showNotification('完美！', '恭喜您完成所有训练阶段！', '🏆');
            }
        }
    },

    updateIntensity(newIntensity) {
        if (AppState.plan) {
            AppState.plan.intensity = newIntensity;
            AppState.save();
            UI.renderPlanPage();
        }
    },

    editWorkout(stageIndex, workoutId) {
        const stage = AppState.plan.stages[stageIndex];
        const workout = stage?.workouts.find(w => w.id === workoutId);
        
        if (!workout) return;

        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">编辑训练</h3>
                <button class="modal-close" onclick="UI.hideModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>训练名称</label>
                    <input type="text" id="edit-workout-name" value="${workout.name}">
                </div>
                <div class="form-group">
                    <label>训练时长 (分钟)</label>
                    <input type="number" id="edit-workout-duration" value="${workout.duration}" min="5" max="120">
                </div>
                <div class="form-group">
                    <label>目标体重 (kg)</label>
                    <input type="number" id="edit-workout-weight" value="${workout.targetWeight}" min="30" max="300" step="0.1">
                </div>
            </div>
            <div class="modal-footer">
                <div class="btn-group">
                    <button class="btn btn-secondary" onclick="UI.hideModal()">取消</button>
                    <button class="btn btn-primary" onclick="saveWorkoutEdit(${stageIndex}, '${workoutId}')">保存</button>
                </div>
            </div>
        `;

        UI.showModal(modalContent);
    },

    saveWorkoutEdit(stageIndex, workoutId) {
        const name = document.getElementById('edit-workout-name').value;
        const duration = parseInt(document.getElementById('edit-workout-duration').value);
        const weight = parseFloat(document.getElementById('edit-workout-weight').value);

        const stage = AppState.plan.stages[stageIndex];
        const workout = stage?.workouts.find(w => w.id === workoutId);

        if (workout && name && duration && weight) {
            workout.name = name;
            workout.duration = duration;
            workout.targetWeight = weight;
            AppState.save();
            UI.hideModal();
            UI.renderCurrentPage();
            UI.showNotification('已保存', '训练计划已更新', '✓');
        }
    },

    checkMissedWorkouts() {
        const lastWorkoutDate = Storage.get(Storage.KEYS.LAST_WORKOUT_DATE);
        if (!lastWorkoutDate) return;

        const daysSinceLastWorkout = Utils.daysBetween(new Date(lastWorkoutDate), new Date());
        
        if (daysSinceLastWorkout >= 3 && AppState.settings.autoIntensity) {
            this.adjustIntensityDown();
            this.showMissedNotification(daysSinceLastWorkout);
        }
    },

    adjustIntensityDown() {
        const intensityOrder = ['very-high', 'high', 'medium', 'low'];
        const currentIndex = intensityOrder.indexOf(AppState.plan.intensity);
        
        if (currentIndex > 0) {
            AppState.plan.intensity = intensityOrder[currentIndex - 1];
            AppState.save();
        }
    },

    showMissedNotification(days) {
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">好久不见</h3>
                <button class="modal-close" onclick="UI.hideModal()">×</button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 16px;">您已经 ${days} 天没有训练了，是什么原因呢？</p>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button class="btn btn-secondary" onclick="handleMissedReason('busy')">最近太忙了</button>
                    <button class="btn btn-secondary" onclick="handleMissedReason('tired')">身体疲劳</button>
                    <button class="btn btn-secondary" onclick="handleMissedReason('injury')">受伤/不适</button>
                    <button class="btn btn-secondary" onclick="handleMissedReason('other')">其他原因</button>
                </div>
            </div>
        `;

        UI.showModal(modalContent);
    }
};

// ==================== 设置管理 ====================
const SettingsManager = {
    showEditProfile() {
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">编辑资料</h3>
                <button class="modal-close" onclick="UI.hideModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>用户名</label>
                    <input type="text" id="edit-name" value="${AppState.user.name || ''}" placeholder="请输入用户名">
                </div>
                <div class="form-group">
                    <label>身高 (cm)</label>
                    <input type="number" id="edit-height" value="${AppState.user.height}" min="100" max="250">
                </div>
                <div class="form-group">
                    <label>当前体重 (kg)</label>
                    <input type="number" id="edit-weight" value="${AppState.user.initialWeight}" min="30" max="300" step="0.1">
                </div>
                <div class="form-group">
                    <label>健身目标</label>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
                        ${['lose', 'gain', 'maintain', 'strength'].map(goal => `
                            <div class="goal-option ${AppState.user.goal === goal ? 'selected' : ''}" 
                                 data-goal="${goal}" 
                                 onclick="selectProfileGoal('${goal}')">
                                <span class="goal-icon">${goal === 'lose' ? '🔥' : goal === 'gain' ? '💪' : goal === 'maintain' ? '⚖️' : '🏋️'}</span>
                                <span class="goal-text">${Utils.getGoalLabel(goal)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <div class="btn-group">
                    <button class="btn btn-secondary" onclick="UI.hideModal()">取消</button>
                    <button class="btn btn-primary" onclick="saveProfile()">保存</button>
                </div>
            </div>
        `;

        UI.showModal(modalContent);
    },

    showTrainingSettings() {
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">训练提醒</h3>
                <button class="modal-close" onclick="UI.hideModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="setting-item" style="margin-bottom: 16px;">
                    <div class="setting-info">
                        <span class="setting-title">开启训练提醒</span>
                    </div>
                    <div class="setting-toggle">
                        <input type="checkbox" id="reminder-toggle" ${AppState.settings.reminderEnabled ? 'checked' : ''}>
                    </div>
                </div>
                <div class="form-group">
                    <label>提醒时间</label>
                    <div style="padding: 14px 16px; border: 2px solid var(--border-color); border-radius: var(--radius-md); cursor: pointer; background: var(--bg-primary);" 
                         onclick="openTimePickerForReminder()">
                        <span id="reminder-time-display" style="font-size: 16px; font-weight: 500;">${AppState.settings.reminderTime}</span>
                        <span style="float: right; color: var(--text-light);">›</span>
                    </div>
                </div>
                <p class="help-text">开启后，将在设定时间提醒您进行训练</p>
            </div>
            <div class="modal-footer">
                <div class="btn-group">
                    <button class="btn btn-secondary" onclick="UI.hideModal()">取消</button>
                    <button class="btn btn-primary" onclick="saveReminderSettings()">保存</button>
                </div>
            </div>
        `;

        UI.showModal(modalContent);
    },

    showDNDSettings() {
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">免打扰时段</h3>
                <button class="modal-close" onclick="UI.hideModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="setting-item" style="margin-bottom: 16px;">
                    <div class="setting-info">
                        <span class="setting-title">开启免打扰</span>
                    </div>
                    <div class="setting-toggle">
                        <input type="checkbox" id="dnd-toggle" ${AppState.settings.dndEnabled ? 'checked' : ''}>
                    </div>
                </div>
                <div class="form-group">
                    <label>开始时间</label>
                    <div style="padding: 14px 16px; border: 2px solid var(--border-color); border-radius: var(--radius-md); cursor: pointer; background: var(--bg-primary);" 
                         onclick="openTimePickerForDndStart()">
                        <span id="dnd-start-display" style="font-size: 16px; font-weight: 500;">${AppState.settings.dndStart}</span>
                        <span style="float: right; color: var(--text-light);">›</span>
                    </div>
                </div>
                <div class="form-group">
                    <label>结束时间</label>
                    <div style="padding: 14px 16px; border: 2px solid var(--border-color); border-radius: var(--radius-md); cursor: pointer; background: var(--bg-primary);" 
                         onclick="openTimePickerForDndEnd()">
                        <span id="dnd-end-display" style="font-size: 16px; font-weight: 500;">${AppState.settings.dndEnd}</span>
                        <span style="float: right; color: var(--text-light);">›</span>
                    </div>
                </div>
                <p class="help-text">在免打扰时段内，将不会发送训练提醒</p>
            </div>
            <div class="modal-footer">
                <div class="btn-group">
                    <button class="btn btn-secondary" onclick="UI.hideModal()">取消</button>
                    <button class="btn btn-primary" onclick="saveDNDSettings()">保存</button>
                </div>
            </div>
        `;

        UI.showModal(modalContent);
    }
};

// ==================== 全局函数（供HTML调用） ====================

function nextStep(currentStep) {
    Onboarding.nextStep(currentStep);
}

function prevStep(currentStep) {
    Onboarding.prevStep(currentStep);
}

function selectGoal(goal) {
    Onboarding.selectGoal(goal);
}

function selectDays(days) {
    Onboarding.selectDays(days);
}

function completeOnboarding() {
    Onboarding.complete();
}

function switchPage(pageName) {
    UI.switchPage(pageName);
}

function startTodayWorkout() {
    const workout = PlanManager.getTodayWorkout();
    if (workout) {
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">${workout.name}</h3>
                <button class="modal-close" onclick="UI.hideModal()">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 16px;">
                    <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">预计时长</p>
                    <p style="font-size: 24px; font-weight: 700; color: var(--primary-color);">${workout.duration} 分钟</p>
                </div>
                <div style="margin-bottom: 16px;">
                    <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">目标体重</p>
                    <p style="font-size: 24px; font-weight: 700; color: var(--primary-color);">${workout.targetWeight} kg</p>
                </div>
                <h4 style="margin-bottom: 12px;">训练内容</h4>
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    ${workout.exercises.map((ex, i) => `
                        <div style="padding: 12px; background: var(--bg-secondary); border-radius: var(--radius-md);">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-weight: 500;">${i + 1}. ${ex.name}</span>
                                <span style="color: var(--text-secondary); font-size: 13px;">${ex.sets}组 × ${ex.reps}</span>
                            </div>
                            <p style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">休息: ${ex.rest}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="modal-footer">
                <div class="btn-group">
                    <button class="btn btn-secondary" onclick="UI.hideModal()">取消</button>
                    <button class="btn btn-primary" onclick="completeTodayWorkout('${workout.id}')">完成训练</button>
                </div>
            </div>
        `;

        UI.showModal(modalContent);
    }
}

function completeTodayWorkout(workoutId) {
    PlanManager.completeWorkout(workoutId);
    UI.hideModal();
}

function viewAllHistory() {
    switchPage('diary');
}

function showPlanSettings() {
    const currentIntensity = AppState.plan?.intensity || 'medium';
    const modalContent = `
        <div class="modal-header">
            <h3 class="modal-title">计划设置</h3>
            <button class="modal-close" onclick="UI.hideModal()">×</button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label>训练强度</label>
                <div style="display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap;">
                    ${['low', 'medium', 'high', 'very-high'].map(intensity => `
                        <div class="day-option ${currentIntensity === intensity ? 'selected' : ''}" 
                             onclick="selectPlanIntensity('${intensity}')">
                            <span style="font-size: 14px; font-weight: 500;">${Utils.getIntensityLabel(intensity)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="setting-item" style="margin-top: 16px;">
                <div class="setting-info">
                    <span class="setting-title">自动调整强度</span>
                    <span class="setting-subtitle">根据训练情况自动调整</span>
                </div>
                <div class="setting-toggle">
                    <input type="checkbox" id="auto-intensity-toggle" ${AppState.settings.autoIntensity ? 'checked' : ''} onchange="toggleAutoIntensity()">
                </div>
            </div>
        </div>
    `;

    UI.showModal(modalContent);
}

function selectPlanIntensity(intensity) {
    PlanManager.updateIntensity(intensity);
    showPlanSettings();
}

function toggleAutoIntensity() {
    AppState.settings.autoIntensity = !AppState.settings.autoIntensity;
    AppState.save();
}

function editWorkout(stageIndex, workoutId) {
    PlanManager.editWorkout(stageIndex, workoutId);
}

function saveWorkoutEdit(stageIndex, workoutId) {
    PlanManager.saveWorkoutEdit(stageIndex, workoutId);
}

function showStageDetail(stageIndex) {
    const stage = AppState.plan.stages[stageIndex];
    if (!stage) return;

    const modalContent = `
        <div class="modal-header">
            <h3 class="modal-title">${stage.name}</h3>
            <button class="modal-close" onclick="UI.hideModal()">×</button>
        </div>
        <div class="modal-body">
            <p style="color: var(--text-secondary); margin-bottom: 16px;">${stage.description}</p>
            <h4 style="margin-bottom: 12px;">训练列表</h4>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${stage.workouts.map(workout => `
                    <div class="stage-workout-item" style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 12px; cursor: pointer;" onclick="editWorkout(${stageIndex}, '${workout.id}')">
                        <div class="workout-info">
                            <h4>${workout.name}</h4>
                            <p>目标体重: ${workout.targetWeight} kg</p>
                        </div>
                        <div class="workout-meta">
                            <div class="workout-duration">${workout.duration} 分钟</div>
                            <div class="workout-weight">${workout.completed ? '✓ 已完成' : '待完成'}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    UI.showModal(modalContent);
}

function filterDiary(filter) {
    UI.renderDiaryPage(filter);
}

function showEditProfile() {
    SettingsManager.showEditProfile();
}

function selectProfileGoal(goal) {
    AppState.user.goal = goal;
    document.querySelectorAll('.goal-option').forEach(el => {
        el.classList.toggle('selected', el.dataset.goal === goal);
    });
}

function saveProfile() {
    const name = document.getElementById('edit-name').value;
    const height = parseInt(document.getElementById('edit-height').value);
    const weight = parseFloat(document.getElementById('edit-weight').value);

    if (name) AppState.user.name = name;
    if (height) AppState.user.height = height;
    if (weight) {
        const oldWeight = AppState.user.initialWeight;
        AppState.user.initialWeight = weight;
        
        if (weight !== oldWeight) {
            const weightRecord = Models.createWeightRecord(weight);
            AppState.weightHistory.push(weightRecord);
        }
    }

    AppState.save();
    UI.hideModal();
    UI.renderCurrentPage();
    UI.showNotification('已保存', '个人资料已更新', '✓');
}

function showTrainingSettings() {
    SettingsManager.showTrainingSettings();
}

let tempReminderTime = null;
let tempDndStartTime = null;
let tempDndEndTime = null;

function openTimePickerForReminder() {
    const currentTime = AppState.settings.reminderTime;
    const [hour, minute] = currentTime.split(':').map(Number);
    TimePicker.selectedHour = hour;
    TimePicker.selectedMinute = minute;
    TimePicker.show('reminder', '选择提醒时间');
}

function openTimePickerForDndStart() {
    const currentTime = AppState.settings.dndStart;
    const [hour, minute] = currentTime.split(':').map(Number);
    TimePicker.selectedHour = hour;
    TimePicker.selectedMinute = minute;
    TimePicker.show('dnd-start', '选择开始时间');
}

function openTimePickerForDndEnd() {
    const currentTime = AppState.settings.dndEnd;
    const [hour, minute] = currentTime.split(':').map(Number);
    TimePicker.selectedHour = hour;
    TimePicker.selectedMinute = minute;
    TimePicker.show('dnd-end', '选择结束时间');
}

function saveReminderSettings() {
    const enabled = document.getElementById('reminder-toggle').checked;
    const timeDisplay = document.getElementById('reminder-time-display');
    const time = timeDisplay ? timeDisplay.textContent : AppState.settings.reminderTime;

    AppState.settings.reminderEnabled = enabled;
    AppState.settings.reminderTime = time;
    AppState.save();

    UI.hideModal();
    UI.renderCurrentPage();
    UI.showNotification('已保存', enabled ? `将在 ${time} 提醒您训练` : '训练提醒已关闭', '✓');
}

function showDNDSettings() {
    SettingsManager.showDNDSettings();
}

function saveDNDSettings() {
    const enabled = document.getElementById('dnd-toggle').checked;
    const startDisplay = document.getElementById('dnd-start-display');
    const endDisplay = document.getElementById('dnd-end-display');
    const start = startDisplay ? startDisplay.textContent : AppState.settings.dndStart;
    const end = endDisplay ? endDisplay.textContent : AppState.settings.dndEnd;

    AppState.settings.dndEnabled = enabled;
    AppState.settings.dndStart = start;
    AppState.settings.dndEnd = end;
    AppState.save();

    UI.hideModal();
    UI.renderCurrentPage();
    UI.showNotification('已保存', enabled ? `免打扰时段: ${start} - ${end}` : '免打扰已关闭', '✓');
}

function handleMissedReason(reason) {
    UI.hideModal();
    
    let message = '';
    switch (reason) {
        case 'busy':
            message = '理解！已为您降低训练强度，建议从轻松的训练开始恢复。';
            break;
        case 'tired':
            message = '身体需要休息！已为您调整计划，请确保充足睡眠后再开始训练。';
            break;
        case 'injury':
            message = '请务必注意身体！建议咨询医生后再继续训练，已为您降低强度。';
            break;
        default:
            message = '已为您调整训练计划，慢慢恢复训练节奏。';
    }

    UI.showNotification('计划已调整', message, '⚙️');
}

function exportData() {
    const data = {
        user: AppState.user,
        plan: AppState.plan,
        diaries: AppState.diaries,
        weightHistory: AppState.weightHistory,
        settings: AppState.settings,
        exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `练了么数据_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    UI.showNotification('导出成功', '数据已导出到本地', '📤');
}

function confirmResetData() {
    const modalContent = `
        <div class="modal-header">
            <h3 class="modal-title">确认重置</h3>
            <button class="modal-close" onclick="UI.hideModal()">×</button>
        </div>
        <div class="modal-body">
            <p style="margin-bottom: 16px;">确定要重置所有数据吗？此操作不可恢复。</p>
            <p style="color: var(--danger-color); font-size: 14px;">⚠️ 所有训练记录、计划和设置将被清除</p>
        </div>
        <div class="modal-footer">
            <div class="btn-group">
                <button class="btn btn-secondary" onclick="UI.hideModal()">取消</button>
                <button class="btn btn-primary" style="background: var(--danger-color);" onclick="resetData()">确认重置</button>
            </div>
        </div>
    `;

    UI.showModal(modalContent);
}

function resetData() {
    Storage.clearAll();
    AppState.init();
    UI.hideModal();
    UI.showOnboarding();
}

// ==================== 强制引导弹窗管理 ====================
const ForcedOnboarding = {
    currentStep: 1,
    tempData: {
        goal: null,
        weeklyDays: null,
        injuries: []
    },

    show() {
        const overlay = document.getElementById('forced-onboarding-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
        this.showStep(1);
    },

    hide() {
        const overlay = document.getElementById('forced-onboarding-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    },

    showStep(step) {
        for (let i = 1; i <= 4; i++) {
            const stepEl = document.getElementById(`forced-step-${i}`);
            if (stepEl) {
                if (i === step) {
                    stepEl.classList.remove('hidden');
                } else {
                    stepEl.classList.add('hidden');
                }
            }
        }
        this.currentStep = step;
        this.updateStepIndicator();
    },

    updateStepIndicator() {
        const dots = document.querySelectorAll('.forced-step-dot');
        dots.forEach((dot, index) => {
            dot.classList.remove('active', 'completed');
            if (index + 1 < this.currentStep) {
                dot.classList.add('completed');
            } else if (index + 1 === this.currentStep) {
                dot.classList.add('active');
            }
        });
    },

    nextStep(currentStep) {
        if (currentStep === 1) {
            const height = document.getElementById('forced-height').value;
            const weight = document.getElementById('forced-weight').value;
            
            if (!height || !weight) {
                UI.showNotification('提示', '请填写身高和体重', '⚠️');
                return;
            }
            
            this.tempData.height = height;
            this.tempData.weight = weight;
        } else if (currentStep === 2) {
            if (!this.tempData.goal) {
                UI.showNotification('提示', '请选择健身目标', '⚠️');
                return;
            }
        } else if (currentStep === 3) {
            if (!this.tempData.weeklyDays) {
                UI.showNotification('提示', '请选择每周训练天数', '⚠️');
                return;
            }
        }

        this.showStep(currentStep + 1);
    },

    prevStep(currentStep) {
        this.showStep(currentStep - 1);
    },

    selectGoal(goal) {
        this.tempData.goal = goal;
        const options = document.querySelectorAll('#forced-step-2 .goal-option');
        options.forEach(el => {
            el.classList.toggle('selected', el.dataset.goal === goal);
        });
    },

    selectDays(days) {
        this.tempData.weeklyDays = days;
        const options = document.querySelectorAll('#forced-step-3 .day-option');
        options.forEach(el => {
            el.classList.toggle('selected', parseInt(el.dataset.days) === days);
        });
    },

    getSelectedInjuries() {
        const injuries = [];
        const inputs = document.querySelectorAll('#forced-step-4 .injury-option input:checked');
        inputs.forEach(input => {
            injuries.push(input.dataset.injury);
        });
        return injuries;
    },

    complete() {
        this.tempData.injuries = this.getSelectedInjuries();
        
        const user = Models.createUser(this.tempData);
        const plan = Models.createPlan(user);
        const weightRecord = Models.createWeightRecord(user.initialWeight);
        
        AppState.user = user;
        AppState.plan = plan;
        AppState.weightHistory = [weightRecord];
        AppState.save();

        this.hide();
        UI.showMainApp();
        UI.showNotification('欢迎加入！', '已根据您的情况生成训练计划', '🎉');
    }
};

// ==================== 时间选择器管理 ====================
const TimePicker = {
    currentField: null,
    selectedHour: 18,
    selectedMinute: 0,

    show(fieldId, title = '选择时间') {
        this.currentField = fieldId;
        
        const overlay = document.getElementById('time-picker-overlay');
        const titleEl = document.getElementById('time-picker-title');
        
        if (titleEl) {
            titleEl.textContent = title;
        }
        
        this.initWheels();
        
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    },

    hide() {
        const overlay = document.getElementById('time-picker-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    },

    initWheels() {
        const hourWheel = document.getElementById('hour-wheel');
        const minuteWheel = document.getElementById('minute-wheel');
        
        if (hourWheel) {
            hourWheel.innerHTML = '';
            for (let i = 0; i < 24; i++) {
                const item = document.createElement('div');
                item.className = `time-wheel-item ${i === this.selectedHour ? 'selected' : ''}`;
                item.textContent = i.toString().padStart(2, '0');
                item.dataset.value = i;
                item.addEventListener('click', () => this.selectHour(i));
                hourWheel.appendChild(item);
            }
            this.scrollToSelected(hourWheel, this.selectedHour);
        }
        
        if (minuteWheel) {
            minuteWheel.innerHTML = '';
            for (let i = 0; i < 60; i += 5) {
                const item = document.createElement('div');
                item.className = `time-wheel-item ${i === this.selectedMinute ? 'selected' : ''}`;
                item.textContent = i.toString().padStart(2, '0');
                item.dataset.value = i;
                item.addEventListener('click', () => this.selectMinute(i));
                minuteWheel.appendChild(item);
            }
            this.scrollToSelected(minuteWheel, this.selectedMinute / 5);
        }
    },

    scrollToSelected(wheel, index) {
        const itemHeight = 50;
        wheel.scrollTop = index * itemHeight - wheel.offsetHeight / 2 + itemHeight / 2;
    },

    selectHour(hour) {
        this.selectedHour = hour;
        const items = document.querySelectorAll('#hour-wheel .time-wheel-item');
        items.forEach(item => {
            item.classList.toggle('selected', parseInt(item.dataset.value) === hour);
        });
    },

    selectMinute(minute) {
        this.selectedMinute = minute;
        const items = document.querySelectorAll('#minute-wheel .time-wheel-item');
        items.forEach(item => {
            item.classList.toggle('selected', parseInt(item.dataset.value) === minute);
        });
    },

    confirm() {
        const timeStr = `${this.selectedHour.toString().padStart(2, '0')}:${this.selectedMinute.toString().padStart(2, '0')}`;
        
        if (this.currentField === 'reminder') {
            AppState.settings.reminderTime = timeStr;
            const displayEl = document.getElementById('reminder-time-display');
            if (displayEl) {
                displayEl.textContent = timeStr;
            }
        } else if (this.currentField === 'dnd-start') {
            AppState.settings.dndStart = timeStr;
            const displayEl = document.getElementById('dnd-start-display');
            if (displayEl) {
                displayEl.textContent = timeStr;
            }
        } else if (this.currentField === 'dnd-end') {
            AppState.settings.dndEnd = timeStr;
            const displayEl = document.getElementById('dnd-end-display');
            if (displayEl) {
                displayEl.textContent = timeStr;
            }
        }
        
        AppState.save();
        this.hide();
        
        return timeStr;
    }
};

// ==================== 头像选择管理 ====================
const AvatarManager = {
    selectedAvatar: 1,
    avatarChars: ['练', '健', '身', '动', '力', '强', '酷', '帅'],

    showPicker() {
        const modalContent = `
            <div class="modal-header">
                <h3 class="modal-title">选择头像</h3>
                <button class="modal-close" onclick="UI.hideModal()">×</button>
            </div>
            <div class="modal-body">
                <div class="avatar-options">
                    ${[1, 2, 3, 4, 5, 6, 7, 8].map(num => `
                        <div class="avatar-option avatar-${num} ${this.selectedAvatar === num ? 'selected' : ''}" 
                             onclick="AvatarManager.select(${num})">
                            ${this.avatarChars[num - 1]}
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="modal-footer">
                <div class="btn-group">
                    <button class="btn btn-secondary" onclick="UI.hideModal()">取消</button>
                    <button class="btn btn-primary" onclick="AvatarManager.confirm()">确定</button>
                </div>
            </div>
        `;
        
        UI.showModal(modalContent);
    },

    select(num) {
        this.selectedAvatar = num;
        document.querySelectorAll('.avatar-option').forEach(el => {
            el.classList.toggle('selected', el.classList.contains(`avatar-${num}`));
        });
    },

    confirm() {
        if (!AppState.user) {
            AppState.user = {};
        }
        AppState.user.avatarIndex = this.selectedAvatar;
        AppState.user.avatarChar = this.avatarChars[this.selectedAvatar - 1];
        AppState.save();
        
        this.updateDisplay();
        UI.hideModal();
        UI.showNotification('已保存', '头像已更新', '✓');
    },

    updateDisplay() {
        const avatarEl = document.getElementById('user-avatar');
        const avatarTextEl = document.getElementById('avatar-text');
        
        if (AppState.user && AppState.user.avatarIndex) {
            const avatarIndex = AppState.user.avatarIndex;
            if (avatarEl) {
                avatarEl.className = `avatar avatar-${avatarIndex}`;
            }
            if (avatarTextEl && AppState.user.avatarChar) {
                avatarTextEl.textContent = AppState.user.avatarChar;
            }
        }
    }
};

// ==================== 页面增强功能 ====================
function showForcedOnboarding() {
    ForcedOnboarding.show();
}

function forcedNextStep(step) {
    ForcedOnboarding.nextStep(step);
}

function forcedPrevStep(step) {
    ForcedOnboarding.prevStep(step);
}

function selectForcedGoal(goal) {
    ForcedOnboarding.selectGoal(goal);
}

function selectForcedDays(days) {
    ForcedOnboarding.selectDays(days);
}

function completeForcedOnboarding() {
    ForcedOnboarding.complete();
}

function openTimePicker(fieldId, title) {
    TimePicker.show(fieldId, title);
}

function closeTimePicker() {
    TimePicker.hide();
}

function confirmTimePicker() {
    const timeStr = TimePicker.confirm();
    if (TimePicker.currentField === 'reminder') {
        const reminderTimeEl = document.getElementById('reminder-time');
        if (reminderTimeEl) {
            reminderTimeEl.value = timeStr;
        }
    } else if (TimePicker.currentField === 'dnd-start') {
        const dndStartEl = document.getElementById('dnd-start');
        if (dndStartEl) {
            dndStartEl.value = timeStr;
        }
    } else if (TimePicker.currentField === 'dnd-end') {
        const dndEndEl = document.getElementById('dnd-end');
        if (dndEndEl) {
            dndEndEl.value = timeStr;
        }
    }
}

function showAvatarPicker() {
    if (AppState.user && AppState.user.avatarIndex) {
        AvatarManager.selectedAvatar = AppState.user.avatarIndex;
    }
    AvatarManager.showPicker();
}

// ==================== 应用初始化（修改版） ====================
document.addEventListener('DOMContentLoaded', function() {
    AppState.init();

    if (AppState.isNewUser()) {
        UI.showMainApp();
        setTimeout(() => {
            ForcedOnboarding.show();
        }, 100);
    } else {
        UI.showMainApp();
        PlanManager.checkMissedWorkouts();
        AvatarManager.updateDisplay();
    }

    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                UI.hideModal();
            }
        });
    }

    const notificationClose = document.querySelector('.notification-close');
    if (notificationClose) {
        notificationClose.addEventListener('click', UI.hideNotification);
    }

    const timePickerOverlay = document.getElementById('time-picker-overlay');
    if (timePickerOverlay) {
        timePickerOverlay.addEventListener('click', function(e) {
            if (e.target === timePickerOverlay) {
                TimePicker.hide();
            }
        });
    }
});

// ==================== 简单图表绘制（备用） ====================
function drawSimpleChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const padding = 30;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const values = data.map(d => d.value);
    const min = Math.min(...values) - 5;
    const max = Math.max(...values) + 5;
    const range = max - min;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }

    if (values.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#FF6B6B';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';

        values.forEach((value, i) => {
            const x = padding + (chartWidth / (values.length - 1)) * i;
            const y = padding + chartHeight - ((value - min) / range) * chartHeight;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        ctx.fillStyle = '#FF6B6B';
        values.forEach((value, i) => {
            const x = padding + (chartWidth / (values.length - 1)) * i;
            const y = padding + chartHeight - ((value - min) / range) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    ctx.fillStyle = '#666';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    data.forEach((d, i) => {
        const x = padding + (chartWidth / (Math.max(data.length - 1, 1))) * i;
        ctx.fillText(d.label, x, height - 10);
    });
}
