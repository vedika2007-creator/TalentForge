-- TALENTFORGE seed data (SQLite)
-- Ported from talentforge_database.sql and enriched with the remaining frontend
-- mock data (project highlights, verifiers, recruiter/admin accounts, jobs).
-- Seeded row ids reuse the frontend's stable ids (std_aarav, proj_1, ...).
-- Demo passwords are set by database.py (see DEMO_PASSWORD).

-- =========================
-- USERS
-- =========================
INSERT INTO users
(id,external_id,name,email,role,avatar_url,college,department,batch_year,location,bio,headline,github_username,target_role,overall_score,available_for_hire,created_at)
VALUES
('std_aarav','std_aarav','Aarav Mehta','aarav@talentforge.dev','student','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80','Apex Institute of Technology','B.Tech Computer Science (Sem 7)',2026,'Bengaluru, India (Open to Remote)','Computer Science senior focused on production-ready React, Python, and microservice architectures. Built high-concurrency campus services with verified faculty reviews.','Full Stack & Distributed Systems Engineer','aarav-mehta-dev','Python Backend Developer',92,1,'2026-08-04T09:00:00Z'),
('std_priya','std_priya','Priya Sharma','priya@talentforge.dev','student','https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80','National Institute of Engineering','B.Tech AI & Data Science (Sem 7)',2026,'Hyderabad, India (Hybrid)','Specializing in computer vision models, convolutional neural networks, and edge ML deployment. Winner of National Inter-College ML Hackathon 2026.','AI / Machine Learning Researcher & Developer','priya-sharma-ml','Machine Learning Engineer',89,1,'2026-08-06T09:00:00Z'),
('std_rohan','std_rohan','Rohan Patel','rohan@talentforge.dev','student','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80','St. Xavier College of Technology','B.Tech Information Technology (Sem 7)',2026,'Pune, India','Kubernetes, Docker, and Terraform automation specialist. Maintained cloud infrastructure pipelines for 3 open-source student platforms.','Cloud Systems & DevOps Practitioner','rohan-devops','DevOps / Cloud Engineer',87,1,'2026-08-11T09:00:00Z'),
('std_sneha','std_sneha','Sneha Verma','sneha@talentforge.dev','student','https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80','Metro Design & Technology School','B.Tech Computer Science (Sem 5)',2027,'Mumbai, India','Bridges design systems and accessible React interfaces. Designed 12+ enterprise SaaS components with zero accessibility violations.','Modern UI/UX Designer & Frontend Engineer','sneha-ux','Frontend & UI Systems Engineer',91,1,'2026-09-02T09:00:00Z'),
('teacher_ramesh','teacher_ramesh','Prof. Ramesh Kulkarni','ramesh@talentforge.dev','teacher',NULL,'Apex Institute of Technology','Computer Science',NULL,NULL,NULL,'Dept. Head, CS',NULL,NULL,0,0,'2025-01-10T09:00:00Z'),
('teacher_sunita','teacher_sunita','Dr. Sunita Rao','sunita@talentforge.dev','teacher',NULL,'Apex Institute of Technology','Cybersecurity',NULL,NULL,NULL,'Cybersecurity Chair',NULL,NULL,0,0,'2025-02-14T09:00:00Z'),
('teacher_arvind','teacher_arvind','Dr. Arvind Swaminathan','arvind@talentforge.dev','teacher',NULL,'National Institute of Engineering','AgriTech Lab',NULL,NULL,NULL,'AgriTech Lab',NULL,NULL,0,0,'2025-03-03T09:00:00Z'),
('teacher_sandeep','teacher_sandeep','Prof. Sandeep Joshi','sandeep@talentforge.dev','teacher',NULL,'St. Xavier College of Technology','Networks & Distributed Systems',NULL,NULL,NULL,'Networks & Distributed Systems',NULL,NULL,0,0,'2025-04-21T09:00:00Z'),
('teacher_neha','teacher_neha','Prof. Neha Deshmukh','neha@talentforge.dev','teacher',NULL,'Metro Design & Technology School','Design Systems',NULL,NULL,NULL,'Design Systems',NULL,NULL,0,0,'2025-05-19T09:00:00Z'),
('rec_ananya','rec_ananya','Ananya Iyer','recruiter@talentforge.dev','recruiter',NULL,'TechRecruit Global','Talent Acquisition',NULL,'Bengaluru, India',NULL,'Senior Technical Recruiter',NULL,NULL,0,0,'2026-07-08T09:00:00Z'),
('rec_cloudscale','rec_cloudscale','CloudScale Partners','hiring@cloudscale.co','recruiter',NULL,'CloudScale Partners','Hiring',NULL,'Remote',NULL,NULL,NULL,NULL,0,0,'2026-09-12T09:00:00Z'),
('admin_root','admin_root','Platform Admin','admin@talentforge.dev','admin',NULL,'TalentForge','Operations',NULL,NULL,NULL,'Institutional Operations',NULL,NULL,0,0,'2025-01-01T09:00:00Z');

-- =========================
-- SKILLS
-- =========================
INSERT INTO skills(id,name,category) VALUES
('sk_python','Python','Backend'),
('sk_django','Django & REST APIs','Backend'),
('sk_react_ts','React & TypeScript','Frontend'),
('sk_postgres','PostgreSQL','Database'),
('sk_ml','Machine Learning','AI/ML'),
('sk_tf','TensorFlow & PyTorch','AI/ML'),
('sk_pandas','Pandas & NumPy','AI/ML'),
('sk_dl','Deep Learning','AI/ML'),
('sk_docker','Docker & Kubernetes','DevOps'),
('sk_cicd','CI/CD Pipelines (GitHub Actions)','DevOps'),
('sk_tailwind','Tailwind CSS & Design Systems','Frontend'),
('sk_next','React & Next.js','Frontend'),
('sk_fastapi','FastAPI','Backend'),
('sk_opencv','OpenCV','AI/ML'),
('sk_flutter','Flutter','Mobile'),
('sk_go','Go','Backend'),
('sk_prometheus','Prometheus','DevOps'),
('sk_grafana','Grafana','DevOps'),
('sk_crypto','Cryptography','Backend'),
('sk_redis','Redis','Backend'),
('sk_sqlite','SQLite','Database');

-- =========================
-- PROJECTS
-- =========================
INSERT INTO projects
(id,external_id,title,tagline,description,domain,github_url,demo_url,is_faculty_verified,verified_by,verification_date,stars,commits,contributors,created_at)
VALUES
('proj_1','proj_1','Smart City Traffic Intelligence','Real-time adaptive signal control using camera feed edge computing','An intelligent traffic management system that processes streaming CCTV video frames at intersections using YOLOv8, detects congestion density, and automatically updates signal phase timings through a FastAPI microservice backend.','AI & Machine Learning','https://github.com/talentforge/smart-traffic-intel','https://traffic-demo.talentforge.dev',1,'teacher_ramesh','2026-08-18',124,142,3,'2026-08-10T09:00:00Z'),
('proj_2','proj_2','AI-Based Crop Disease Detection','Lightweight MobileNet classifier detecting 26 plant leaf pathologies','Developed an offline-first computer vision model that identifies fungal and bacterial crop diseases from smartphone camera snaps, generating localized treatment recommendations in 6 vernacular languages.','AI & Machine Learning','https://github.com/talentforge/crop-disease-vision','https://crop-guard.talentforge.dev',1,'teacher_arvind','2026-07-24',89,98,2,'2026-07-15T09:00:00Z'),
('proj_3','proj_3','Decentralized Academic Credential Vault','Tamper-proof verifiable credentials protocol for university transcripts','An open protocol standard enabling educational boards to issue cryptographically signed, self-sovereign digital diplomas and transcripts verifiable in sub-second time without central database reliance.','Cloud & Systems','https://github.com/talentforge/credential-vault',NULL,1,'teacher_sunita','2026-06-12',76,112,2,'2026-06-01T09:00:00Z'),
('proj_4','proj_4','Neural Health Diagnostic Assistant','Multi-modal EHR summarization and lab biomarker risk prediction','Clinical decision-support prototype parsing electronic health records, lab blood panels, and patient medical history to highlight contraindications and cardiovascular risk signals.','AI & Machine Learning','https://github.com/talentforge/neural-health-diagnostics',NULL,0,NULL,NULL,62,77,3,'2026-05-20T09:00:00Z'),
('proj_5','proj_5','Multi-Cluster Microservice Orchestrator','Zero-downtime deployment engine with automated health rollbacks','Lightweight internal developer platform running automated canary deployments, traffic splitting, and telemetry metric scrapers across Kubernetes worker nodes.','Cloud & Systems','https://github.com/talentforge/cluster-orchestrator',NULL,1,'teacher_sandeep','2026-08-02',108,135,1,'2026-07-25T09:00:00Z');

INSERT INTO project_members(project_id,student_id,role,is_featured) VALUES
('proj_1','std_aarav','Lead Backend & Algorithm Architect',1),
('proj_1','std_sneha','UI Systems Engineer',0),
('proj_2','std_priya','ML Researcher & Model Architect',1),
('proj_3','std_aarav','Systems Architect',1),
('proj_4','std_priya','Data Science Lead',1),
('proj_5','std_rohan','Infrastructure Engineer',1);

INSERT INTO project_technologies(project_id,skill_id)
SELECT 'proj_1',id FROM skills WHERE name IN ('React & TypeScript','Python','FastAPI','Machine Learning','Docker & Kubernetes','PostgreSQL');
INSERT INTO project_technologies(project_id,skill_id)
SELECT 'proj_2',id FROM skills WHERE name IN ('Python','TensorFlow & PyTorch','OpenCV','FastAPI','Flutter');
INSERT INTO project_technologies(project_id,skill_id)
SELECT 'proj_3',id FROM skills WHERE name IN ('Python','Django & REST APIs','PostgreSQL','Cryptography','Redis');
INSERT INTO project_technologies(project_id,skill_id)
SELECT 'proj_4',id FROM skills WHERE name IN ('Python','TensorFlow & PyTorch','Pandas & NumPy','FastAPI','React & TypeScript');
INSERT INTO project_technologies(project_id,skill_id)
SELECT 'proj_5',id FROM skills WHERE name IN ('Go','Docker & Kubernetes','Prometheus','Grafana');

INSERT INTO project_highlights(project_id,highlight,display_order) VALUES
('proj_1','Processed 30 FPS video feed with sub-80ms edge latency',1),
('proj_1','Reduced simulated urban traffic queue time by 28%',2),
('proj_1','Faculty validated code invariants and test coverage (>91%)',3),
('proj_2','Quantized INT8 model size under 4.2 MB for low-tier phones',1),
('proj_2','Achieved 94.6% top-1 accuracy across 18,000 lab-tested sample leaves',2),
('proj_2','Field-tested with 40 farmers in collaboration with local Agri University',3),
('proj_3','Zero-knowledge proof verification preventing unauthorized data disclosure',1),
('proj_3','RFC-compliant credential schema adopted in departmental trial',2),
('proj_4','Structured extraction from unstructured medical PDF reports',1),
('proj_4','Pending faculty validation of clinical benchmark accuracy',2),
('proj_5','Automated rollback triggered under 4 seconds upon latency spikes',1),
('proj_5','Deployed live on campus high-performance computing cluster',2);

-- =========================
-- SKILL EVIDENCE
-- =========================
INSERT INTO student_skills(student_id,skill_id,confidence_score,status,projects_count,github_contributions,assessments_completed,certificates_count,faculty_verified,verifier_id,verified_at,projects_weight,github_weight,assessment_weight,faculty_weight) VALUES
('std_aarav','sk_python',94,'verified',6,320,4,2,1,'teacher_ramesh','2026-08-01',35,30,15,20),
('std_aarav','sk_django',92,'verified',4,180,3,1,1,'teacher_ramesh','2026-09-01',40,25,15,20),
('std_aarav','sk_react_ts',88,'verified',5,210,2,1,1,'teacher_sunita','2026-07-01',35,25,20,20),
('std_aarav','sk_postgres',90,'verified',4,95,3,1,1,'teacher_ramesh','2026-08-01',30,20,25,25),
('std_priya','sk_ml',93,'verified',5,280,4,3,1,'teacher_arvind','2026-08-01',40,20,20,20),
('std_priya','sk_tf',90,'verified',4,190,3,2,1,'teacher_arvind','2026-08-01',35,25,20,20),
('std_priya','sk_pandas',95,'verified',6,310,5,2,1,'teacher_arvind','2026-06-01',30,30,20,20),
('std_priya','sk_dl',78,'pending',2,90,1,1,0,NULL,NULL,30,30,20,20),
('std_rohan','sk_docker',89,'verified',4,180,2,2,1,'teacher_sandeep','2026-07-01',35,25,20,20),
('std_rohan','sk_cicd',86,'verified',5,140,2,1,1,'teacher_sandeep','2026-08-01',35,25,20,20),
('std_sneha','sk_tailwind',96,'verified',7,240,4,2,1,'teacher_neha','2026-07-01',40,20,20,20),
('std_sneha','sk_next',92,'verified',5,210,3,2,1,'teacher_neha','2026-08-01',35,25,20,20);

INSERT INTO github_activity(student_id,username,repository_count,total_commits,contributions,last_synced_at) VALUES
('std_aarav','aarav-mehta-dev',14,482,482,strftime('%Y-%m-%dT%H:%M:%SZ','now')),
('std_priya','priya-sharma-ml',11,395,395,strftime('%Y-%m-%dT%H:%M:%SZ','now')),
('std_rohan','rohan-devops',9,310,310,strftime('%Y-%m-%dT%H:%M:%SZ','now')),
('std_sneha','sneha-ux',12,290,290,strftime('%Y-%m-%dT%H:%M:%SZ','now'));

-- =========================
-- VERIFICATION REQUESTS
-- =========================
INSERT INTO verification_requests(id,external_id,student_id,project_id,title,verification_type,submitted_at,status,reviewed_by,reviewed_at,notes) VALUES
('req_1','req_1','std_priya','proj_2','AI-Based Crop Disease Detection','project',strftime('%Y-%m-%dT%H:%M:%SZ','now','-3 hours'),'pending',NULL,NULL,'Submitted updated confusion matrix and INT8 quantization benchmarks following feedback in last week''s lab.'),
('req_2','req_2','std_aarav',NULL,'Advanced PostgreSQL Database Indexing Assessment','skill_assessment',strftime('%Y-%m-%dT%H:%M:%SZ','now','-1 day'),'approved','teacher_ramesh',strftime('%Y-%m-%dT%H:%M:%SZ','now','-20 hours'),'Completed live SQL query optimization trial on 10M record dataset.'),
('req_3','req_3','std_rohan','proj_5','Kubernetes Multi-Cluster Orchestration','project',strftime('%Y-%m-%dT%H:%M:%SZ','now','-2 days'),'pending',NULL,NULL,'Demonstrated automated rollback in network laboratory.'),
('req_4','req_4','std_priya','proj_4','Neural Health Diagnostic Assistant','project',strftime('%Y-%m-%dT%H:%M:%SZ','now','-4 days'),'pending',NULL,NULL,'Benchmark accuracy report attached for clinical dataset v2.');

INSERT INTO verification_evidence(request_id,github_repo_url,project_report_url,demo_url,certificate_issuer,assessment_score) VALUES
('req_1','https://github.com/talentforge/crop-disease-vision','https://talentforge.dev/reports/priya-crop-disease-v2.pdf','https://crop-guard.talentforge.dev','National Agri-Tech Symposium Finalist',NULL),
('req_2',NULL,NULL,NULL,'TalentForge Verified Sandbox Exam #492',96),
('req_3','https://github.com/talentforge/cluster-orchestrator',NULL,'https://k8s-cluster.campus.edu',NULL,NULL),
('req_4','https://github.com/talentforge/neural-health-diagnostics','https://talentforge.dev/reports/priya-neural-health.pdf',NULL,NULL,NULL);

-- =========================
-- RECRUITER JOBS & SHORTLIST
-- =========================
INSERT INTO jobs(id,recruiter_id,company,title,department,min_confidence,preferred_projects,require_faculty_verification,location_type,created_at) VALUES
('job_stripe','rec_ananya','Stripe','Backend Engineering Intern','Payments Infrastructure',85,2,1,'Hybrid',strftime('%Y-%m-%dT%H:%M:%SZ','now','-5 days')),
('job_razorpay','rec_ananya','Razorpay','Platform Systems Associate','Platform',80,1,0,'Onsite',strftime('%Y-%m-%dT%H:%M:%SZ','now','-4 days')),
('job_datadog','rec_ananya','Datadog','Telemetry Infrastructure Co-Op','Observability',80,1,1,'Remote',strftime('%Y-%m-%dT%H:%M:%SZ','now','-3 days')),
('job_nvidia','rec_cloudscale','NVIDIA','Applied ML Research Intern','AI Research',85,2,1,'Hybrid',strftime('%Y-%m-%dT%H:%M:%SZ','now','-2 days')),
('job_figma','rec_cloudscale','Figma','Design Systems Engineer','Product Engineering',85,2,0,'Remote',strftime('%Y-%m-%dT%H:%M:%SZ','now','-1 days'));

INSERT INTO job_required_skills(job_id,skill_id) VALUES
('job_stripe','sk_python'),('job_stripe','sk_postgres'),('job_stripe','sk_django'),
('job_razorpay','sk_django'),('job_razorpay','sk_redis'),('job_razorpay','sk_python'),
('job_datadog','sk_go'),('job_datadog','sk_docker'),('job_datadog','sk_prometheus'),
('job_nvidia','sk_ml'),('job_nvidia','sk_tf'),('job_nvidia','sk_pandas'),
('job_figma','sk_tailwind'),('job_figma','sk_next'),('job_figma','sk_react_ts');

INSERT INTO recruiter_shortlists(recruiter_id,student_id,job_id) VALUES
('rec_ananya','std_aarav',NULL),
('rec_ananya','std_priya',NULL);

-- =========================
-- COLLABORATION
-- =========================
INSERT INTO collaboration_posts(id,external_id,creator_id,title,description,domain,max_members,posted_at) VALUES
('collab_1','collab_1','std_priya','AI Healthcare Assistant for Primary Clinics','Building a multi-lingual symptom triage tool designed for rural health workers with intermittent cellular connectivity.','Healthcare AI',4,strftime('%Y-%m-%dT%H:%M:%SZ','now','-1 day')),
('collab_2','collab_2','std_rohan','Autonomous Solar Microgrid Power Allocator','IoT telemetry aggregator balancing rooftop solar feed-in tariffs across residential college dorms.','CleanTech & IoT',3,strftime('%Y-%m-%dT%H:%M:%SZ','now','-3 days')),
('collab_3','collab_3','std_aarav','Open Source College Exam Timetable Optimizer','Constraint satisfaction solver using genetic algorithms to schedule 120+ courses without classroom or faculty conflicts.','Operations Research & Web',5,strftime('%Y-%m-%dT%H:%M:%SZ','now','-4 days'));

INSERT INTO collaboration_members(post_id,user_id) VALUES
('collab_1','std_priya'),('collab_1','std_sneha'),
('collab_2','std_rohan'),
('collab_3','std_aarav'),('collab_3','std_rohan'),('collab_3','std_sneha');

INSERT INTO collaboration_roles(post_id,role_name) VALUES
('collab_1','ML Developer (Edge ML)'),
('collab_1','UI/UX Designer'),
('collab_1','Backend Developer (FastAPI)'),
('collab_2','Embedded Firmware Dev'),
('collab_2','Full Stack Dashboard Lead'),
('collab_3','Frontend Engineer (Tailwind/React)'),
('collab_3','QA / Test Lead');

INSERT INTO collaboration_tags(post_id,tag) VALUES
('collab_1','Python'),('collab_1','FastAPI'),('collab_1','React'),('collab_1','Offline-First'),
('collab_2','Go'),('collab_2','Docker'),('collab_2','Time-Series DB'),('collab_2','Hardware'),
('collab_3','Python'),('collab_3','Django'),('collab_3','React'),('collab_3','Algorithms');

-- =========================
-- ANALYTICS SNAPSHOT (platform-wide marketing numbers)
-- =========================
INSERT INTO analytics_snapshots
(total_students,verified_projects,hiring_companies,match_accuracy,pending_verifications,active_teachers,total_skills_verified,weekly_growth_rate)
VALUES (10450,5280,2150,95.4,42,380,14890,14.8);
