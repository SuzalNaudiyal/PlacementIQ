import urllib.parse
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional


def format_whatsapp_drive_alert(student: Dict[str, Any], drive: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format a high-conversion, professional WhatsApp broadcast notification
    for campus placement drives, with direct deep links for single-click sharing.
    """
    name = student.get("name", "Student").split()[0]
    company = drive.get("company_name", "Target Company")
    role = drive.get("job_role", "Software Engineer")
    ctc = drive.get("ctc_lpa", 10.0)
    location = drive.get("location", "Pan-India")
    deadline = drive.get("application_deadline", "Rolling")
    min_cgpa = drive.get("min_cgpa", 7.0)
    cgpa = student.get("cgpa", 7.0)

    is_eligible = cgpa >= min_cgpa and student.get("backlogs", 0) <= drive.get("max_backlogs", 0)
    eligibility_tag = "✅ *ELIGIBLE & RECOMMENDED*" if is_eligible else "⚠️ *CHECK ELIGIBILITY*"

    text = (
        f"🚀 *CAMPUS RECRUITMENT DRIVE ALERT* | *HireMatrix AI*\n"
        f"--------------------------------------------------\n"
        f"Hey *{name}*, a new verified placement drive has opened on your university portal:\n\n"
        f"🏢 *Company*: {company}\n"
        f"💼 *Role*: {role}\n"
        f"💰 *Package (CTC)*: ₹{ctc} LPA\n"
        f"📍 *Location*: {location}\n"
        f"🎓 *Status*: {eligibility_tag} (Your CGPA: {cgpa:.2f} | Cutoff: {min_cgpa})\n"
        f"⏳ *Apply By*: {deadline}\n"
        f"--------------------------------------------------\n"
        f"⚡ *Quick Action*: Apply via 1-Click ATS Verified Profile on HireMatrix.\n"
        f"🔗 *Apply Here*: https://hirematrix.ai/student/drives/{drive.get('drive_id', 'drive')}\n\n"
        f"— *University Training & Placement Cell (TPO)*"
    )

    encoded = urllib.parse.quote(text)
    whatsapp_url = f"https://api.whatsapp.com/send?text={encoded}"

    return {
        "text": text,
        "whatsapp_url": whatsapp_url,
        "recipient_name": name,
        "company_name": company,
        "is_eligible": is_eligible,
    }


def format_email_drive_alert(student: Dict[str, Any], drive: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format a responsive HTML and text email alert for placement drives.
    """
    name = student.get("name", "Student")
    company = drive.get("company_name", "Target Company")
    role = drive.get("job_role", "Software Engineer")
    ctc = drive.get("ctc_lpa", 10.0)
    location = drive.get("location", "Pan-India")
    deadline = drive.get("application_deadline", "Upcoming")
    min_cgpa = drive.get("min_cgpa", 7.0)
    cgpa = student.get("cgpa", 7.0)
    drive_id = drive.get("drive_id", "drive")

    subject = f"🎯 [Campus Drive] {company} is hiring for {role} (₹{ctc} LPA) - Apply by {deadline}"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }}
        .card {{ background-color: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; max-width: 580px; margin: 0 auto; }}
        .badge {{ background-color: #065f46; color: #34d399; font-weight: 700; font-size: 11px; padding: 4px 10px; border-radius: 9999px; display: inline-block; text-transform: uppercase; }}
        h1 {{ font-size: 20px; font-weight: 800; color: #ffffff; margin-top: 12px; margin-bottom: 8px; }}
        .meta-grid {{ background-color: #0f172a; border-radius: 12px; padding: 16px; margin: 20px 0; }}
        .meta-row {{ display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #1e293b; font-size: 13px; }}
        .meta-row:last-child {{ border-bottom: none; }}
        .meta-label {{ color: #94a3b8; font-weight: 500; }}
        .meta-value {{ color: #f8fafc; font-weight: 700; }}
        .btn {{ display: inline-block; background: linear-gradient(135deg, #4f46e5, #06b6d4); color: #ffffff; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 10px; text-align: center; margin-top: 16px; }}
        .footer {{ font-size: 11px; color: #64748b; margin-top: 24px; text-align: center; }}
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">Verified Campus Drive</span>
        <h1>{company} is Recruiting: {role}</h1>
        <p style="color: #cbd5e1; font-size: 13px; line-height: 1.5;">
          Hello <strong>{name}</strong>, your academic credentials match the initial eligibility criteria for the upcoming recruitment drive.
        </p>
        
        <div class="meta-grid">
          <div class="meta-row">
            <span class="meta-label">Annual CTC Package:</span>
            <span class="meta-value" style="color: #38bdf8;">₹{ctc} LPA</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Primary Location:</span>
            <span class="meta-value">{location}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">CGPA Cutoff:</span>
            <span class="meta-value">{min_cgpa} (Your CGPA: {cgpa:.2f})</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">Application Deadline:</span>
            <span class="meta-value" style="color: #f59e0b;">{deadline}</span>
          </div>
        </div>

        <p style="color: #94a3b8; font-size: 12px;">
          Make sure your verified GitHub, LeetCode, and 1-Click ATS Resume are up to date on HireMatrix before applying.
        </p>

        <a href="https://hirematrix.ai/student/drives/{drive_id}" class="btn">
          View Drive & 1-Click Apply
        </a>

        <div class="footer">
          HireMatrix AI • University Training & Placement System (TPO) • Automated Notification
        </div>
      </div>
    </body>
    </html>
    """

    return {
        "subject": subject,
        "html_content": html_content,
        "recipient_email": student.get("email", "student@example.com"),
    }

