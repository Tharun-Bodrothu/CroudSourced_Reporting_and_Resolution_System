import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { issuesAPI } from "../services/api";
import "./ReportIssuePage.css";

function ReportIssuePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [descriptionText, setDescriptionText] = useState("");
  const [issueCategory, setIssueCategory] = useState("");
  const [issueType, setIssueType] = useState("");
  const [department, setDepartment] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const validate = () => {
    if (!descriptionText.trim()) return "Description is required";
    if (!title.trim()) return "Title is required";
    if (!issueCategory) return "Please select a category";
    if (!issueType) return "Please select issue type";
    if (!department.trim()) return "Department is required";
    if (title.length > 120) return "Title must be 120 characters or less";
    if (descriptionText.length < 20) return "Description must be at least 20 characters";
    return null;
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        return;
      }
      setPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPhoto(null);
      setPreviewUrl(null);
    }
  };

  const removePhoto = () => {
    setPhoto(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("title", title);
      form.append("descriptionText", descriptionText);
      form.append("issueCategory", issueCategory);
      form.append("issueType", issueType);
      form.append("department", department);
      form.append("severity", severity);

      // Location fields as the backend expects nested keys
      form.append("location[area]", "User reported area");
      form.append("location[address]", "Not specified");
      form.append("location[coordinates][lat]", 17.6868);
      form.append("location[coordinates][lng]", 83.2185);

      if (photo) form.append("photo", photo);

      await issuesAPI.createIssue(form);

      // show success briefly and navigate
      navigate("/issues");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to report issue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-page">
      <div className="report-wrapper">
        <div className="report-left">
          <h2>Report an Issue</h2>
          <p className="muted">Tell us what happened—provide clear details and a photo if possible.</p>

          {error && <div className="error-message">{error}</div>}

          <form className="report-form" onSubmit={handleSubmit}>
            <label className="label">Title</label>
            <input
              className="input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="Short descriptive title"
              required
            />

            <label className="label">Description</label>
            <textarea
              className="textarea"
              value={descriptionText}
              onChange={(e) => setDescriptionText(e.target.value)}
              rows={6}
              placeholder="Describe the issue in detail (what, where, who it affects)."
              required
            />
            <div className="hint">{descriptionText.length} characters</div>

            <div className="row">
              <div className="col">
                <label className="label">Category</label>
                <select className="select" value={issueCategory} onChange={(e) => setIssueCategory(e.target.value)} required>
                  <option value="">Select category</option>
                  <option>Infrastructure</option>
                  <option>Safety</option>
                  <option>Sanitation</option>
                  <option>Transportation</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="col">
                <label className="label">Type</label>
                <select className="select" value={issueType} onChange={(e) => setIssueType(e.target.value)} required>
                  <option value="">Select type</option>
                  <option>Road Damage</option>
                  <option>Pothole</option>
                  <option>Street Light</option>
                  <option>Garbage</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <label className="label">Department</label>
            <input className="input" type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g., Public Works" required />

            <label className="label">Severity</label>
            <select className="select" value={severity} onChange={(e) => setSeverity(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <div className="label">Photo (optional)</div>
            <div className="photo-controls">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} />
              {previewUrl && (
                <div className="preview">
                  <img src={previewUrl} alt="preview" />
                  <button type="button" className="remove-btn" onClick={removePhoto}>Remove</button>
                </div>
              )}
            </div>

            <button className="submit-btn" type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Report'}</button>
          </form>
        </div>

        <aside className="report-right">
          <div className="info-card">
            <h3>Tips for a useful report</h3>
            <ul>
              <li>Provide a concise title and a detailed description (20+ chars).</li>
              <li>Add a clear photo showing the issue and its surroundings.</li>
              <li>Select an accurate category and department to speed up resolution.</li>
              <li>We use this information to prioritize issues—be concise and factual.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ReportIssuePage;