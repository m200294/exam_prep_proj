"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AddSessionModal from "./AddSessionModal";
import AppHeader from "./AppHeader";
import OverviewPanel from "./OverviewPanel";
import SubjectDashboard from "./SubjectDashboard";
import { SUBJECTS } from "../lib/subjects";
import { addSession, deleteSession, fetchSessions, groupBySubject, updateSession } from "../lib/supabase";

const EMPTY_SESSIONS = Object.fromEntries(Object.keys(SUBJECTS).map((key) => [key, []]));

export default function StudyTracker() {
  const [activeTab, setActiveTab] = useState("overview");
  const [allSessions, setAllSessions] = useState(EMPTY_SESSIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  const loadSessions = async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    }

    try {
      const rawSessions = await fetchSessions();
      setAllSessions(groupBySubject(rawSessions));
      setError(null);
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleAdd = async (session) => {
    try {
      await addSession(session);
      await loadSessions({ silent: true });
      toast.success("Session added");
    } catch (caughtError) {
      toast.error(`Failed to add session: ${caughtError.message || "Unknown error"}`);
      throw caughtError;
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      await updateSession(id, updates);
      await loadSessions({ silent: true });
      setEditingSession(null);
      toast.success("Session updated.");
    } catch (caughtError) {
      toast.error(`Failed to update session: ${caughtError.message || "Unknown error"}`);
      throw caughtError;
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSession(id);
      await loadSessions({ silent: true });
      toast.success("Session deleted.");
    } catch (caughtError) {
      toast.error(`Failed to delete session: ${caughtError.message || "Unknown error"}`);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base px-6">
        <div className="text-sm text-zinc-500">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base text-zinc-100">
      <AppHeader activeTab={activeTab} onTabChange={setActiveTab} onAddSession={() => setShowAddModal(true)} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {error ? (
          <div className="mb-6 rounded-2xl border border-accent-red/25 bg-accent-red/10 px-4 py-3 text-sm text-accent-red">
            Error: {error}
          </div>
        ) : null}

        {activeTab === "overview" ? (
          <OverviewPanel allSessions={allSessions} />
        ) : (
          <SubjectDashboard
            subject={activeTab}
            sessions={allSessions[activeTab] || []}
            onDelete={handleDelete}
            onEdit={setEditingSession}
          />
        )}
      </main>

      {showAddModal ? <AddSessionModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} onUpdate={handleUpdate} /> : null}
      {editingSession ? (
        <AddSessionModal
          editSession={editingSession}
          onClose={() => setEditingSession(null)}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
        />
      ) : null}
    </div>
  );
}
