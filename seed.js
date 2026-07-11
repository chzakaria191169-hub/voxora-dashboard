import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pocijnvpsxivxvvzfiev.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvY2lqbnZwc3hpdnh2dnpmaWV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU2Njc3NSwiZXhwIjoyMDk4MTQyNzc1fQ.SYZASZn6MPMIZ8jJpa3_dNLOIoHi_Uqp7snii9RWjIM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Starting dummy data injection...');

  const { data: campaign, error: cErr } = await supabase
    .from('scraping_jobs')
    .insert({
      url: 'Voxora Global Outreach - Q3',
      niche_tag: 'Technology',
      is_active: true
    })
    .select()
    .single();

  if (cErr) {
    console.error('Error inserting campaign:', cErr);
    // fallback, just get first campaign ID if insert fails
    const { data: existing } = await supabase.from('scraping_jobs').select('id').limit(1);
    if (!existing || existing.length === 0) return;
    var cid = existing[0].id;
  } else {
    var cid = campaign.id;
  }
  
  console.log(`Created/Using Campaign ID: ${cid}`);

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
  const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString();

  // 2. Insert Leads
  const leads = [
    {
      campaign_id: cid,
      email: 'john.smith@techflow.io',
      first_name: 'John',
      company_name: 'TechFlow',
      website: 'techflow.io',
      job_title: 'CEO',
      niche_tag: 'SaaS Software',
      target_client: 'B2B Enterprise',
      industry_pain: 'High customer churn rate and poor onboarding',
      status: 'cold_email_sent',
      cold_email_subject: 'Quick question about TechFlow onboarding',
      cold_email_body: 'Hi John,\n\nI noticed TechFlow is scaling fast, but many B2B SaaS companies struggle with onboarding churn. At Voxora, we built an AI system that automates the first 30 days of user engagement.\n\nOpen to a quick chat next week?',
      cold_email_sender: 'zakaria@voxora.io',
      cold_email_sent_at: oneDayAgo,
    },
    {
      campaign_id: cid,
      email: 'sarah.j@elevatemarketing.com',
      first_name: 'Sarah',
      company_name: 'Elevate Marketing',
      website: 'https://elevatemarketing.com',
      job_title: 'VP of Marketing',
      niche_tag: 'Digital Agency',
      target_client: 'E-commerce Brands',
      industry_pain: 'Struggling to track exact ROI for client ad spend',
      status: 'follow_up_1_sent',
      cold_email_subject: 'Elevate Marketing x ROI Tracking',
      cold_email_body: 'Hi Sarah,\n\nI saw your recent post about scaling e-commerce brands. How are you currently proving exact ROI to your clients?',
      cold_email_sender: 'zakaria@voxora.io',
      cold_email_sent_at: threeDaysAgo,
      follow_up_1_body: 'Hey Sarah,\n\nJust bubbling this up. If you are struggling with client retention due to reporting, we have a white-label dashboard solution that might help.',
      follow_up_1_sender: 'zakaria@voxora.io',
      follow_up_1_sent_at: oneDayAgo,
    },
    {
      campaign_id: cid,
      email: 'm.chen@logisticsplus.net',
      first_name: 'Michael',
      company_name: 'Logistics Plus',
      website: 'logisticsplus.net',
      job_title: 'Operations Director',
      niche_tag: 'Supply Chain',
      target_client: 'Retail Chains',
      industry_pain: 'Delays in last-mile delivery tracking',
      status: 'follow_up_2_sent',
      cold_email_subject: 'Last-mile delivery tech',
      cold_email_body: 'Hi Michael,\n\nSupply chain logistics is brutal right now...',
      cold_email_sender: 'zakaria@voxora.io',
      cold_email_sent_at: threeDaysAgo,
      follow_up_1_body: 'Hey Michael, any thoughts on my previous email?',
      follow_up_1_sender: 'zakaria@voxora.io',
      follow_up_1_sent_at: twoDaysAgo,
      follow_up_2_body: 'Michael,\n\nI know Operations Directors are incredibly busy. I will leave you with this quick 2-min case study on how we reduced tracking delays by 40%.',
      follow_up_2_sender: 'zakaria@voxora.io',
      follow_up_2_sent_at: oneDayAgo,
    },
    {
      campaign_id: cid,
      email: 'emily.r@medtechinnovations.com',
      first_name: 'Emily',
      company_name: 'MedTech Innovations',
      website: 'medtechinnovations.com',
      job_title: 'Founder',
      niche_tag: 'Healthcare Tech',
      target_client: 'Private Clinics',
      industry_pain: 'Compliance and patient data security overhead',
      status: 'replied',
      cold_email_subject: 'HIPAA compliance without the headache',
      cold_email_body: 'Hi Emily,\n\nBuilding health tech is hard enough without worrying about HIPAA audits.',
      cold_email_sender: 'zakaria@voxora.io',
      cold_email_sent_at: twoDaysAgo,
      replied_at: oneDayAgo,
    },
    {
      campaign_id: cid,
      email: 'contact@ghostcompany.xyz',
      first_name: null,
      company_name: 'Ghost Co',
      website: null,
      job_title: null,
      niche_tag: 'Unknown',
      target_client: 'Unknown',
      industry_pain: 'Unknown',
      status: 'bounced',
      cold_email_subject: 'Partnership opportunity',
      cold_email_body: 'Hi there,\n\nWould you be open to a partnership?',
      cold_email_sender: 'zakaria@voxora.io',
      cold_email_sent_at: oneDayAgo,
    }
  ];

  const { data: inserted, error: lErr } = await supabase
    .from('scraped_leads')
    .insert(leads);

  if (lErr) {
    console.error('Error inserting leads:', lErr);
  } else {
    console.log('Successfully inserted 5 dummy leads!');
  }
}

seed();
