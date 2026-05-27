const THINKER_CONFIGS = {
  "Socrates": {
    name: "Socrates 🏛️",
    title: "The Socratic Thinker",
    description: "Challenges your assumptions, asks probing questions, and pushes you to define concepts precisely.",
    signature: "— Socrates, Greek Philosopher",
    pitch: 0.9,
    rate: 0.85,
    style: "analytical"
  },
  "Steve Jobs": {
    name: "Steve Jobs ",
    title: "The Visionary Innovator",
    description: "Demands simplicity, clarity, and extreme focus. Highlights world-changing potential and design detail.",
    signature: "— Steve Jobs, Think Different",
    pitch: 1.0,
    rate: 1.05,
    style: "inspiring"
  },
  "Albert Einstein": {
    name: "Albert Einstein 🔬",
    title: "The Empirical Physicist",
    description: "Guided by deep wonder, scientific analogies, and curiosity. Encourages imagination over mere knowledge.",
    signature: "— Albert Einstein, Theory of Relativity",
    pitch: 1.15,
    rate: 0.9,
    style: "curious"
  },
  "Marcus Aurelius": {
    name: "Marcus Aurelius 🏛️",
    title: "The Stoic Emperor",
    description: "Focuses on self-discipline, mental resilience, and accepting what is outside your control with grace.",
    signature: "— Marcus Aurelius, Meditations",
    pitch: 0.8,
    rate: 0.9,
    style: "stoic"
  }
};

const mentorService = {
  getMentors() {
    return Object.keys(THINKER_CONFIGS).map(key => ({
      key,
      ...THINKER_CONFIGS[key]
    }));
  },

  getMentor() {
    const saved = localStorage.getItem('active_mentor');
    return saved ? saved : 'Socrates';
  },

  setMentor(mentorName) {
    if (mentorName && mentorName.trim()) {
      localStorage.setItem('active_mentor', mentorName.trim());
      window.dispatchEvent(new Event('mentor_changed'));
    }
  },

  getMentorConfig(mentorName = null) {
    const active = mentorName || this.getMentor();
    if (THINKER_CONFIGS[active]) {
      return THINKER_CONFIGS[active];
    }
    return {
      name: active,
      title: "Steered Thinker",
      description: `Steering AI responses and quotes using the philosophy of ${active}.`,
      signature: `— ${active}`,
      style: "stoic"
    };
  },

  adaptText(text, mentorName = null) {
    const config = this.getMentorConfig(mentorName);
    
    if (config.style === 'stoic') {
      return `You have power over your mind - not outside events. Realize this, and you will find strength. ${text} Waste no more time arguing about what a good man should be. Be one.`;
    }
    
    if (config.style === 'inspiring') {
      return `Design is not just what it looks like and feels like. Design is how it works. Let's make a dent in the universe. ${text} Stay hungry, stay foolish!`;
    }
    
    if (config.style === 'curious') {
      return `The important thing is not to stop questioning. Curiosity has its own reason for existing. ${text} Imagination is more important than knowledge.`;
    }
    
    // Default Socrates
    return `Let us examine this claim together. Is it truly as it appears? ${text} What is the essential definition here?`;
  }
};

export default mentorService;
