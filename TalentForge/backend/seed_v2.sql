-- TALENTFORGE seed data for schema v2 (profiles, recruitment workflow, messaging, notifications).
-- INSERT OR IGNORE keeps it safe to apply to an upgraded database.

-- Job details
UPDATE jobs SET location='Bengaluru, India', description='Build and scale payment APIs used by millions of merchants. You will own backend services end to end, from schema design to production monitoring.' WHERE id='job_stripe';
UPDATE jobs SET location='Bengaluru, India', description='Work on the platform team that powers Razorpay''s internal developer tooling, caching layers and service mesh.' WHERE id='job_razorpay';
UPDATE jobs SET location='Remote (India)', description='Help build the telemetry pipeline that ingests trillions of metrics per day. Strong Go and container fundamentals required.' WHERE id='job_datadog';
UPDATE jobs SET location='Pune, India', description='Research and ship computer-vision models for edge devices with the Applied ML group.' WHERE id='job_nvidia';
UPDATE jobs SET location='Remote', description='Extend Figma''s design-system tooling and component libraries used by millions of designers.' WHERE id='job_figma';

-- Education
INSERT OR IGNORE INTO student_education(id,student_id,institution,degree,field_of_study,start_year,end_year,grade) VALUES
('edu_aarav_1','std_aarav','Apex Institute of Technology','B.Tech','Computer Science',2022,2026,'CGPA 9.1'),
('edu_aarav_2','std_aarav','Delhi Public School, Bengaluru','Class XII','Science (PCM)',2020,2022,'96%'),
('edu_priya_1','std_priya','National Institute of Engineering','B.Tech','AI & Data Science',2022,2026,'CGPA 9.3'),
('edu_rohan_1','std_rohan','St. Xavier College of Technology','B.Tech','Information Technology',2022,2026,'CGPA 8.6'),
('edu_sneha_1','std_sneha','Metro Design & Technology School','B.Tech','Computer Science',2023,2027,'CGPA 9.0');

-- Achievements
INSERT OR IGNORE INTO student_achievements(id,student_id,title,description,achieved_on) VALUES
('ach_aarav_1','std_aarav','Smart India Hackathon — Winner','Built an adaptive traffic-signal controller with a team of 6.','2025-12-10'),
('ach_aarav_2','std_aarav','Google Summer of Code Contributor','Contributed async task scheduling to an open-source Python framework.','2025-08-30'),
('ach_priya_1','std_priya','National Inter-College ML Hackathon — 1st Place','Crop disease detection model deployed to 40 farmers.','2026-02-15'),
('ach_rohan_1','std_rohan','CNCF Kubestronaut Program','Completed all five Kubernetes certifications.','2026-04-01'),
('ach_sneha_1','std_sneha','Adobe Design Challenge — Finalist','Accessible design-system component library.','2026-03-20');

-- Certificates (evidence)
INSERT OR IGNORE INTO certificates(id,student_id,title,issuer,certificate_url,issued_date,verification_status,skill_id) VALUES
('cert_aarav_1','std_aarav','AWS Certified Developer – Associate','Amazon Web Services','https://aws.amazon.com/certification/','2026-03-12','verified','sk_python'),
('cert_aarav_2','std_aarav','PostgreSQL Performance Tuning','EDB Academy','https://www.enterprisedb.com/training','2026-06-02','pending','sk_postgres'),
('cert_priya_1','std_priya','TensorFlow Developer Certificate','Google','https://www.tensorflow.org/certificate','2026-01-20','verified','sk_tf'),
('cert_rohan_1','std_rohan','Certified Kubernetes Administrator','CNCF','https://www.cncf.io/certification/cka/','2026-02-08','verified','sk_docker');

INSERT OR IGNORE INTO verification_requests(id,external_id,student_id,certificate_id,title,verification_type,submitted_at,status,notes) VALUES
('req_cert_aarav_2','req_cert_aarav_2','std_aarav','cert_aarav_2','Certificate: PostgreSQL Performance Tuning (EDB Academy)','certificate',strftime('%Y-%m-%dT%H:%M:%SZ','now','-6 hours'),'pending','Certificate from the EDB Academy advanced tuning course.');
INSERT OR IGNORE INTO verification_evidence(request_id,certificate_issuer,demo_url) VALUES
('req_cert_aarav_2','EDB Academy','https://www.enterprisedb.com/training');

-- Applications across the pipeline
INSERT OR IGNORE INTO applications(id,job_id,student_id,status,cover_note,recruiter_note,created_at,updated_at) VALUES
('app_aarav_stripe','job_stripe','std_aarav','shortlisted','I have built high-throughput Python/PostgreSQL services and would love to work on payments infrastructure.','Strong verified backend evidence.',strftime('%Y-%m-%dT%H:%M:%SZ','now','-4 days'),strftime('%Y-%m-%dT%H:%M:%SZ','now','-2 days')),
('app_aarav_razorpay','job_razorpay','std_aarav','applied','Excited about platform engineering and caching at scale.',NULL,strftime('%Y-%m-%dT%H:%M:%SZ','now','-1 days'),strftime('%Y-%m-%dT%H:%M:%SZ','now','-1 days')),
('app_priya_nvidia','job_nvidia','std_priya','interview','My crop-disease model runs on low-end phones; edge ML is exactly what I want to do.',NULL,strftime('%Y-%m-%dT%H:%M:%SZ','now','-6 days'),strftime('%Y-%m-%dT%H:%M:%SZ','now','-1 days')),
('app_sneha_figma','job_figma','std_sneha','applied','Design systems are my passion — I maintain an accessible React component library.',NULL,strftime('%Y-%m-%dT%H:%M:%SZ','now','-2 days'),strftime('%Y-%m-%dT%H:%M:%SZ','now','-2 days')),
('app_rohan_datadog','job_datadog','std_rohan','applied','Kubernetes and observability are my focus; I run Prometheus/Grafana on our campus cluster.',NULL,strftime('%Y-%m-%dT%H:%M:%SZ','now','-3 days'),strftime('%Y-%m-%dT%H:%M:%SZ','now','-3 days'));

INSERT OR IGNORE INTO interviews(id,application_id,scheduled_at,duration_minutes,mode,location,notes) VALUES
('int_priya_nvidia','app_priya_nvidia',strftime('%Y-%m-%dT10:00:00Z','now','+3 days'),45,'Online','https://meet.google.com/tlf-demo-int','Technical round: model optimisation and deployment.');

INSERT OR IGNORE INTO messages(id,application_id,sender_id,body,created_at,read_at) VALUES
('msg_1','app_aarav_stripe','rec_ananya','Hi Aarav, your verified Python and PostgreSQL evidence stood out. Are you available for a chat next week?',strftime('%Y-%m-%dT%H:%M:%SZ','now','-2 days'),strftime('%Y-%m-%dT%H:%M:%SZ','now','-2 days')),
('msg_2','app_aarav_stripe','std_aarav','Thank you! Yes, I am free Tuesday or Wednesday afternoon.',strftime('%Y-%m-%dT%H:%M:%SZ','now','-1 days'),NULL),
('msg_3','app_priya_nvidia','rec_cloudscale','Hi Priya, looking forward to the interview. Please bring a short demo of your quantised model.',strftime('%Y-%m-%dT%H:%M:%SZ','now','-1 days'),NULL);

INSERT OR IGNORE INTO notifications(id,user_id,type,title,body,link,created_at) VALUES
('ntf_1','std_aarav','application','You were shortlisted by Stripe','Backend Engineering Intern — the recruiter wants to talk to you.','/student/applications',strftime('%Y-%m-%dT%H:%M:%SZ','now','-2 days')),
('ntf_2','std_aarav','verification','Skill verified: Django & REST APIs','Prof. Ramesh Kulkarni verified your evidence.','/student/skills',strftime('%Y-%m-%dT%H:%M:%SZ','now','-3 days')),
('ntf_3','std_priya','interview','Interview scheduled with NVIDIA','Applied ML Research Intern — Online interview.','/student/applications',strftime('%Y-%m-%dT%H:%M:%SZ','now','-1 days')),
('ntf_4','rec_ananya','application','New application: Aarav Mehta','Platform Systems Associate at Razorpay','/recruiter/applications',strftime('%Y-%m-%dT%H:%M:%SZ','now','-1 days')),
('ntf_5','rec_ananya','message','New message from Aarav Mehta','Thank you! Yes, I am free Tuesday or Wednesday afternoon.','/messages',strftime('%Y-%m-%dT%H:%M:%SZ','now','-1 days')),
('ntf_6','teacher_ramesh','verification','New certificate to review','Aarav Mehta submitted PostgreSQL Performance Tuning.','/teacher',strftime('%Y-%m-%dT%H:%M:%SZ','now','-6 hours'));

-- Pending collaboration join requests (the team creator decides)
INSERT OR IGNORE INTO collaboration_requests(id,post_id,user_id,message,created_at) VALUES
('creq_1','collab_1','std_rohan','I can own the deployment pipeline and offline sync backend.',strftime('%Y-%m-%dT%H:%M:%SZ','now','-5 hours')),
('creq_2','collab_2','std_aarav','Happy to build the FastAPI telemetry service and dashboard APIs.',strftime('%Y-%m-%dT%H:%M:%SZ','now','-1 days'));
INSERT OR IGNORE INTO notifications(id,user_id,type,title,body,link,created_at) VALUES
('ntf_c1','std_priya','collaboration','Rohan Patel wants to join “AI Healthcare Assistant for Primary Clinics”','I can own the deployment pipeline and offline sync backend.','/collaborate',strftime('%Y-%m-%dT%H:%M:%SZ','now','-5 hours'));
