import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ResumeContext = createContext();

export const useResume = () => {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};

export const ResumeProvider = ({ children }) => {
  const [resumes, setResumes] = useState([]);
  const [currentResume, setCurrentResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/templates');
      setTemplates(response.data.templates);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/resumes');
      setResumes(response.data.resumes);
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const createResume = async (resumeData) => {
    try {
      const response = await axios.post('/api/resumes', resumeData);
      const newResume = response.data.resume;
      setResumes(prev => [newResume, ...prev]);
      setCurrentResume(newResume);
      toast.success('Resume created successfully!');
      return { success: true, resume: newResume };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to create resume';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateResume = async (id, resumeData) => {
    try {
      const response = await axios.put(`/api/resumes/${id}`, resumeData);
      const updatedResume = response.data.resume;
      
      setResumes(prev => 
        prev.map(resume => 
          resume._id === id ? updatedResume : resume
        )
      );
      
      if (currentResume?._id === id) {
        setCurrentResume(updatedResume);
      }
      
      toast.success('Resume updated successfully!');
      return { success: true, resume: updatedResume };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update resume';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const deleteResume = async (id) => {
    try {
      await axios.delete(`/api/resumes/${id}`);
      setResumes(prev => prev.filter(resume => resume._id !== id));
      
      if (currentResume?._id === id) {
        setCurrentResume(null);
      }
      
      toast.success('Resume deleted successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete resume';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const duplicateResume = async (id) => {
    try {
      const response = await axios.post(`/api/resumes/${id}/duplicate`);
      const duplicatedResume = response.data.resume;
      setResumes(prev => [duplicatedResume, ...prev]);
      toast.success('Resume duplicated successfully!');
      return { success: true, resume: duplicatedResume };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to duplicate resume';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const getResume = async (id) => {
    try {
      const response = await axios.get(`/api/resumes/${id}`);
      const resume = response.data.resume;
      setCurrentResume(resume);
      return { success: true, resume };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch resume';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const clearCurrentResume = () => {
    setCurrentResume(null);
  };

  const value = {
    resumes,
    currentResume,
    loading,
    templates,
    fetchResumes,
    createResume,
    updateResume,
    deleteResume,
    duplicateResume,
    getResume,
    clearCurrentResume,
    setCurrentResume
  };

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  );
};
