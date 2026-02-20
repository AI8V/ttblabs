'use strict';

var COURSE_DATA = (function () {

  function deepFreeze(o) {
    if (o === null || typeof o !== 'object') return o;
    Object.freeze(o);
    Object.getOwnPropertyNames(o).forEach(function (p) {
      var v = o[p];
      if (v !== null && typeof v === 'object' && !Object.isFrozen(v)) deepFreeze(v);
    });
    return o;
  }

  var sharedObjectives = [
    "Understand core concepts and foundational principles",
    "Apply practical techniques through hands-on exercises",
    "Build real-world projects from scratch",
    "Master industry-standard tools and workflows",
    "Develop problem-solving skills for complex scenarios",
    "Prepare for professional certification exams"
  ];

  var sharedCurriculum = [
    {
      title: "Getting Started",
      lessons: [
        { title: "Course Introduction & Overview", duration: "05:30", preview: true },
        { title: "Setting Up Your Environment",    duration: "12:00", preview: true },
        { title: "Understanding Key Terminology",  duration: "08:45", preview: false }
      ]
    },
    {
      title: "Core Concepts",
      lessons: [
        { title: "Fundamental Principles Explained",      duration: "15:20", preview: false },
        { title: "Working with Essential Tools",          duration: "18:00", preview: false },
        { title: "Practical Application Exercise",        duration: "22:10", preview: false },
        { title: "Common Mistakes and How to Avoid Them", duration: "10:30", preview: false }
      ]
    },
    {
      title: "Advanced Techniques",
      lessons: [
        { title: "Deep Dive into Advanced Features", duration: "20:00", preview: false },
        { title: "Real-World Case Study",            duration: "25:15", preview: false },
        { title: "Performance Optimization Tips",    duration: "14:40", preview: false }
      ]
    },
    {
      title: "Final Project & Wrap-Up",
      lessons: [
        { title: "Project Requirements & Planning", duration: "08:00", preview: false },
        { title: "Building the Final Project",      duration: "35:00", preview: false },
        { title: "Course Summary & Next Steps",     duration: "06:20", preview: true  }
      ]
    }
  ];

  var sharedFaq = [
    {
      question: "Do I need prior experience to take this course?",
      answer: "This depends on the course level. Beginner courses require no prior experience, while Intermediate and Advanced courses assume foundational knowledge in the subject area."
    },
    {
      question: "How long do I have access to the course materials?",
      answer: "Once purchased, you have lifetime access to all course materials including future updates and additions."
    },
    {
      question: "Is there a certificate upon completion?",
      answer: "Yes, you will receive a certificate of completion that you can share on your professional profiles."
    },
    {
      question: "Can I get a refund if I'm not satisfied?",
      answer: "We offer a 30-day money-back guarantee. If you're not satisfied with the course, contact us via WhatsApp for a full refund."
    },
    {
      question: "How do I access the course after purchase?",
      answer: "After confirming your payment via WhatsApp, you will receive access credentials to use on the course page."
    }
  ];

  var courses = [
    {
      id: 1,
      title: "Introduction LearnPress - LMS Complete Guide",
      category: "Business",
      level: "Beginner",
      price: 500.00,
      students: 333,
      lessons: 13,
      rating: 4.5,
      date: "2025-08-01",
      description: "Learn the fundamentals of LearnPress LMS and how to create engaging online courses.",
      image: "example.png",
      instructor: "John Doe",
      tags: ["lms", "wordpress", "education"],
      driveUrl: "",          // paid — URL lives in Worker secret only
      learningObjectives: sharedObjectives,
      curriculum: sharedCurriculum,
      faq: sharedFaq
    },
    {
      id: 2,
      title: "Health Foundations - Complete Wellness Guide",
      category: "Health",
      level: "Beginner",
      price: 49.00,
      students: 510,
      lessons: 13,
      rating: 5,
      date: "2025-07-15",
      description: "Master the basics of health and wellness with practical tips and strategies.",
      image: "example.png",
      instructor: "Dr. Sarah Wilson",
      tags: ["health", "wellness", "nutrition"],
      driveUrl: "",          // paid
      learningObjectives: sharedObjectives,
      curriculum: sharedCurriculum,
      faq: sharedFaq
    },
    {
      id: 3,
      title: "Nutrition Basics - Healthy Living Made Simple",
      category: "Health",
      level: "Intermediate",
      price: 19.99,
      students: 120,
      lessons: 13,
      rating: 3,
      date: "2025-05-03",
      description: "Understand nutrition principles and create healthy meal plans.",
      image: "example.png",
      instructor: "Maria Garcia",
      tags: ["nutrition", "diet", "health"],
      driveUrl: "",          // paid
      learningObjectives: sharedObjectives,
      curriculum: sharedCurriculum,
      faq: sharedFaq
    },
    {
      id: 4,
      title: "Network Mastery - Advanced IT Skills",
      category: "IT",
      level: "Advanced",
      price: 99.00,
      students: 800,
      lessons: 13,
      rating: 4,
      date: "2025-03-18",
      description: "Master advanced networking concepts and become an IT professional.",
      image: "example.png",
      instructor: "Michael Chen",
      tags: ["networking", "it", "technology"],
      driveUrl: "",          // paid
      learningObjectives: sharedObjectives,
      curriculum: sharedCurriculum,
      faq: sharedFaq
    },
    {
      id: 5,
      title: "Digital Marketing Fundamentals",
      category: "Marketing",
      level: "Beginner",
      price: 0.00,
      students: 60,
      lessons: 13,
      rating: 2,
      date: "2024-12-01",
      description: "Learn the basics of digital marketing and online advertising.",
      image: "example.png",
      instructor: "Alex Johnson",
      tags: ["marketing", "digital", "advertising"],
      // free course — URL stays here, opens directly
      driveUrl: "https://docs.google.com/document/d/1uq6g64ZqdSfhB5kldtXjT6_vuI30BPYdJK4-ceQqWeA/edit?usp=drive_link",
      learningObjectives: sharedObjectives,
      curriculum: sharedCurriculum,
      faq: sharedFaq
    },
    {
      id: 6,
      title: "Mobile Photography Masterclass",
      category: "Photography",
      level: "Beginner",
      price: 39.00,
      students: 1200,
      lessons: 13,
      rating: 5,
      date: "2025-08-05",
      description: "Create stunning photos with just your smartphone.",
      image: "example.png",
      instructor: "Lisa Park",
      tags: ["photography", "mobile", "creativity"],
      driveUrl: "",          // paid
      learningObjectives: sharedObjectives,
      curriculum: sharedCurriculum,
      faq: sharedFaq
    },
    {
      id: 7,
      title: "Color Theory for Designers",
      category: "Design",
      level: "Beginner",
      price: 9.00,
      students: 20,
      lessons: 13,
      rating: 1,
      date: "2024-10-11",
      description: "Understand color principles and create harmonious designs.",
      image: "example.png",
      instructor: "David Kim",
      tags: ["design", "color", "theory"],
      driveUrl: "",          // paid
      learningObjectives: sharedObjectives,
      curriculum: sharedCurriculum,
      faq: sharedFaq
    },
    {
      id: 8,
      title: "JavaScript Essentials - Modern Development",
      category: "Developer",
      level: "Intermediate",
      price: 29.00,
      students: 340,
      lessons: 13,
      rating: 4,
      date: "2025-01-22",
      description: "Master JavaScript fundamentals and modern ES6+ features.",
      image: "example.png",
      instructor: "Emma Watson",
      tags: ["javascript", "programming", "web-development"],
      driveUrl: "",          // paid
      learningObjectives: sharedObjectives,
      curriculum: sharedCurriculum,
      faq: sharedFaq
    }
  ];

  var categories = {
    "Business":     { color: "emerald" },
    "Health":       { color: "teal"    },
    "IT":           { color: "cyan"    },
    "Marketing":    { color: "emerald" },
    "Photography":  { color: "teal"    },
    "Design":       { color: "cyan"    },
    "Developer":    { color: "emerald" }
  };

  var WHATSAPP_NUMBER = "201556450850";
  var BRAND_NAME      = "Ai8V | Mind & Machine";
  var DOMAIN          = "ttblabs.com";

return deepFreeze({
  courses:         courses,
  categories:      categories,
  WHATSAPP_NUMBER: WHATSAPP_NUMBER,
  BRAND_NAME:      BRAND_NAME,
  DOMAIN:          DOMAIN,

  /* ── SEO / White-Label Meta ── */
  META: {
    /* Short tagline — used in titles and OG */
    tagline: 'Learn. Build. Grow.',

    /* Platform description — used in meta description + JSON-LD */
    description: 'Expert-led online courses in Development, Design, Health, ' +
                 'Marketing, Photography and more. Learn at your own pace ' +
                 'with lifetime access and dedicated support.',

    /* Short description for catalog/legal pages */
    descriptionShort: 'Expert-led online courses with lifetime access ' +
                      'and personal support.',

    /* OG image — absolute path from root */
    ogImage: '/assets/img/og-image.png',

    /* Contact */
    supportEmail: 'support@ttblabs.com',

    /* Year platform was founded — for JSON-LD */
    foundingYear: '2026'
  }
});
})();

if (typeof window !== 'undefined') window.COURSE_DATA = COURSE_DATA;
