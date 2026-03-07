<form onSubmit={handleSubmit}>

  <div className="form-group">
    <label>Title</label>
    <input
      type="text"
      name="title"
      value={formData.title}
      onChange={handleChange}
      placeholder="Short descriptive title"
      required
    />
  </div>

  <div className="form-group">
    <label>Description</label>
    <textarea
      name="descriptionText"
      value={formData.descriptionText}
      onChange={handleChange}
      placeholder="Describe the issue in detail..."
      required
    />
  </div>

  <div className="form-row">
    <div className="form-group">
      <label>Category</label>
      <select
        name="issueCategory"
        value={formData.issueCategory}
        onChange={handleChange}
      >
        <option value="">Select category</option>
        <option value="Infrastructure">Infrastructure</option>
        <option value="Sanitation">Sanitation</option>
        <option value="Safety">Safety</option>
      </select>
    </div>

    <div className="form-group">
      <label>Type</label>
      <select
        name="issueType"
        value={formData.issueType}
        onChange={handleChange}
      >
        <option value="">Select type</option>
        <option value="Road Damage">Road Damage</option>
        <option value="Garbage">Garbage</option>
      </select>
    </div>
  </div>

  <div className="form-row">
    <div className="form-group">
      <label>Department</label>
      <input
        type="text"
        name="department"
        value={formData.department}
        onChange={handleChange}
        placeholder="Public Works"
      />
    </div>

    <div className="form-group">
      <label>Severity</label>
      <select
        name="severity"
        value={formData.severity}
        onChange={handleChange}
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </div>
  </div>

  <div className="form-group">
    <label>Upload Image</label>
    <input type="file" />
  </div>

  <button type="submit" className="submit-btn">
    Submit Report
  </button>

</form>