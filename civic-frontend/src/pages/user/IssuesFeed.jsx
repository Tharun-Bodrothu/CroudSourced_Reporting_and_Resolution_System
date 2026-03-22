import React, { useEffect, useState } from "react";
import axios from "axios";

export default function IssuesFeed() {
  const [issues, setIssues] = useState([]);
  const [comments, setComments] = useState({});

  const token = localStorage.getItem("token");

  // Fetch issues
  const fetchIssues = async () => {
    try {
      const res = await issuesAPI.getAllIssues(); // ✅ correct API
      setIssues(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  // Upvote
  const handleUpvote = async (id) => {
    try {
      await axios.post(
        `http://localhost:5000/api/issues/${id}/upvote`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchIssues(); // refresh
    } catch (err) {
      console.error(err);
    }
  };

  // Comment
  const handleComment = async (id) => {
    try {
      if (!comments[id]) return;

      await axios.post(
        `http://localhost:5000/api/issues/${id}/comment`,
        { text: comments[id] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments({ ...comments, [id]: "" });
      fetchIssues();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Issues Feed</h2>

      {issues.map((issue) => (
        <div
          key={issue._id}
          style={{
            border: "1px solid #ccc",
            padding: 15,
            marginBottom: 15,
            borderRadius: 10,
          }}
        >
          <h3>{issue.title}</h3>

          <p>{issue.aiSummary}</p>

          <p>
            <strong>Department:</strong>{" "}
            {typeof issue.department === "string"
              ? issue.department
              : issue.department?.name}
          </p>

          <p>
            <strong>Status:</strong> {issue.status}
          </p>

          <p>
            <strong>Upvotes:</strong> {issue.upvoteCount || 0}
          </p>

          {/* Upvote Button */}
          <button onClick={() => handleUpvote(issue._id)}>
            👍 Upvote
          </button>

          {/* Comment Input */}
          <div style={{ marginTop: 10 }}>
            <input
              type="text"
              placeholder="Write a comment..."
              value={comments[issue._id] || ""}
              onChange={(e) =>
                setComments({
                  ...comments,
                  [issue._id]: e.target.value,
                })
              }
            />
            <button onClick={() => handleComment(issue._id)}>
              Comment
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}