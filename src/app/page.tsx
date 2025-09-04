"use client";

import React, { useState, useCallback, useEffect, Suspense, useMemo } from "react";
import { ChatInterface } from "./components/ChatInterface/ChatInterface";
import { TasksFilesSidebar } from "./components/TasksFilesSidebar/TasksFilesSidebar";
import { SubAgentPanel } from "./components/SubAgentPanel/SubAgentPanel";
import { FileViewDialog } from "./components/FileViewDialog/FileViewDialog";
import { createClient } from "@/lib/client";
import { useAuthContext } from "@/providers/Auth";
import type { Assistant, SubAgent, FileItem, TodoItem } from "./types/types";
import { getDeployment } from "@/lib/environment/deployments";
import styles from "./page.module.scss";

function HomePageContent() {
  const { session } = useAuthContext();
  const deployment = useMemo(() => getDeployment(), []);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [selectedAssistantId, setSelectedAssistantId] = useState<string>("");
  const [threadIds, setThreadIds] = useState<Record<string, string | null>>({});
  const [selectedSubAgent, setSelectedSubAgent] = useState<SubAgent | null>(
    null,
  );
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [files, setFiles] = useState<Record<string, string>>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoadingThreadState, setIsLoadingThreadState] = useState(false);

  const threadId = selectedAssistantId ? threadIds[selectedAssistantId] ?? null : null;

  const setThreadId = useCallback(
    (
      value: string | ((old: string | null) => string | null) | null,
    ) => {
      if (!selectedAssistantId) return;
      setThreadIds((prev) => {
        const current = prev[selectedAssistantId] ?? null;
        const newVal =
          typeof value === "function" ? value(current) : value;
        return { ...prev, [selectedAssistantId]: newVal };
      });
    },
    [selectedAssistantId],
  );

  useEffect(() => {
    const fetchAssistants = async () => {
      if (!session?.accessToken) return;
      try {
        const client = createClient(session.accessToken);
        const list = await client.assistants.search({ limit: 100 });
        const mapped: Assistant[] = Array.isArray(list)
          ? list.map((a: any) => ({
              id: a.assistant_id || a.id,
              name: a.name || a.assistant_id || a.id,
            }))
          : [];
        setAssistants(mapped);
        // Choose default assistant:
        // 1) If NEXT_PUBLIC_AGENT_ID matches an assistant ID (case-insensitive), use it
        // 2) Else if it matches an assistant NAME (case-insensitive), use that assistant's ID
        // 3) Else fallback to the first assistant
        const desired = (deployment.defaultAgentId || "").trim();
        const matchById = desired
          ? mapped.find((a) => a.id.toLowerCase() === desired.toLowerCase())
          : undefined;
        const matchByName = !matchById && desired
          ? mapped.find(
              (a) => (a.name || "").toLowerCase() === desired.toLowerCase(),
            )
          : undefined;
        const defaultId = matchById?.id || matchByName?.id || mapped[0]?.id;
        if (defaultId) {
          setSelectedAssistantId(defaultId);
        }
      } catch (e) {
        console.error("Failed to fetch assistants:", e);
      }
    };
    fetchAssistants();
  }, [session?.accessToken, deployment.defaultAgentId]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  // When the threadId changes, grab the thread state from the graph server
  useEffect(() => {
    const fetchThreadState = async () => {
      if (!threadId || !session?.accessToken) {
        setTodos([]);
        setFiles({});
        setIsLoadingThreadState(false);
        return;
      }
      setIsLoadingThreadState(true);
      try {
        const client = createClient(session.accessToken);
        const state = await client.threads.getState(threadId);

        if (state.values) {
          const currentState = state.values as {
            todos?: TodoItem[];
            files?: Record<string, string>;
          };
          setTodos(currentState.todos || []);
          setFiles(currentState.files || {});
        }
      } catch (error) {
        console.error("Failed to fetch thread state:", error);
        setTodos([]);
        setFiles({});
      } finally {
        setIsLoadingThreadState(false);
      }
    };
    fetchThreadState();
  }, [threadId, session?.accessToken]);

  const handleNewThread = useCallback(() => {
    setThreadId(null);
    setSelectedSubAgent(null);
    setTodos([]);
    setFiles({});
  }, [setThreadId]);

  const handleSelectAssistant = useCallback((id: string) => {
    setSelectedAssistantId(id);
  }, []);

  // Avoid mounting ChatInterface until an assistant is selected to prevent
  // an early error from useChat throwing "No agent ID selected".
  if (!selectedAssistantId) {
    return (
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <div style={{ padding: 16 }}>Loading assistants...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <TasksFilesSidebar
        todos={todos}
        files={files}
        onFileClick={setSelectedFile}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />
      <div className={styles.mainContent}>
        <ChatInterface
          threadId={threadId}
          selectedSubAgent={selectedSubAgent}
          setThreadId={setThreadId}
          onSelectSubAgent={setSelectedSubAgent}
          onTodosUpdate={setTodos}
          onFilesUpdate={setFiles}
          onNewThread={handleNewThread}
          isLoadingThreadState={isLoadingThreadState}
          assistants={assistants}
          selectedAssistantId={selectedAssistantId}
          onSelectAssistant={handleSelectAssistant}
        />
        {selectedSubAgent && (
          <SubAgentPanel
            subAgent={selectedSubAgent}
            onClose={() => setSelectedSubAgent(null)}
          />
        )}
      </div>
      {selectedFile && (
        <FileViewDialog
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
