import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NewPlaybook() {
  const navigate = useNavigate();

  useEffect(() => {
    // Immediately redirect to the simple editor
    navigate('/leadership/playbooks/new/simple-edit');
  }, [navigate]);

  return null; // Component will redirect immediately
}
