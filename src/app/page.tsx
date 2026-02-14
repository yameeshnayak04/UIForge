'use client';

import React, { useState, useEffect } from 'react';
import { ChatPanel, Message } from '@/ui/ide/ChatPanel';
import { CodePanel } from '@/ui/ide/CodePanel';
import { PreviewPanel } from '@/ui/ide/PreviewPanel';
import { VersionPanel } from '@/ui/ide/VersionPanel';
import { ResizablePanel } from '@/ui/ide/ResizablePanel';
import { VersionManager, Version } from '@/lib/storage/versions';
import { AgentRequest, AgentResponse } from '@/types';
import styles from './page.module.css';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentAST, setCurrentAST] = useState<any>(null);
  const [currentCode, setCurrentCode] = useState('');
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [currentExplanation, setCurrentExplanation] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null);
  const [versionManager] = useState(() => new VersionManager());
  
  // ✅ Fixed: Load panel sizes after mount to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [leftPanelSize, setLeftPanelSize] = useState(35);
  const [codePanelSize, setCodePanelSize] = useState(50);

  // Load from localStorage only on client
  useEffect(() => {
    setMounted(true);
    setVersions(versionManager.getAll());
    
    // Load saved panel sizes
    const savedLeftSize = localStorage.getItem('leftPanelSize');
    const savedCodeSize = localStorage.getItem('codePanelSize');
    
    if (savedLeftSize) setLeftPanelSize(Number(savedLeftSize));
    if (savedCodeSize) setCodePanelSize(Number(savedCodeSize));
  }, [versionManager]);

  // Save panel sizes when they change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('leftPanelSize', leftPanelSize.toString());
    }
  }, [leftPanelSize, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('codePanelSize', codePanelSize.toString());
    }
  }, [codePanelSize, mounted]);

  const handleGenerate = async (
    intent: string,
    action: 'generate' | 'modify' | 'regenerate'
  ) => {
    setMessages((prev) => [...prev, { role: 'user', content: intent }]);
    setLoading(true);
    setError(undefined);

    try {
      const request: AgentRequest = {
        action,
        intent,
        currentAST: action === 'modify' ? currentAST : undefined,
        currentCode: action === 'modify' ? currentCode : undefined,
      };

      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data: AgentResponse = await response.json();

      if (data.success && data.ast) {
        setCurrentAST(data.ast);
        setCurrentCode(data.code || '');
        setCurrentPlan(data.plan);
        setCurrentExplanation(data.explanation || '');

        const version = versionManager.add(data.ast, data.code || '', intent);
        setVersions(versionManager.getAll());
        setCurrentVersionId(version.id);

        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.explanation || 'UI generated successfully!' },
        ]);
      } else {
        const errorMsg = data.error || 'Failed to generate UI';
        setError(errorMsg);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Error: ${errorMsg}` },
        ]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${errorMsg}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (versionId: string) => {
    const version = versionManager.get(versionId);
    if (version) {
      setCurrentAST(version.ast);
      setCurrentCode(version.code);
      setCurrentVersionId(versionId);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Restored version ${versionId}` },
      ]);
    }
  };

  // ✅ Show loading state until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className={styles.loadingShell}>
        <div className={styles.loadingCard}>
          <h2>UIForge</h2>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <ResizablePanel 
        direction="horizontal" 
        defaultSize={leftPanelSize} 
        minSize={25} 
        maxSize={60}
      >
        {/* LEFT SIDE: Chat + Version History */}
        <div className={styles.leftColumn}>
          <div className={styles.chatArea}>
            <ChatPanel messages={messages} onGenerate={handleGenerate} loading={loading} />
          </div>
          <div className={styles.versionsArea}>
            <VersionPanel
              versions={versions}
              currentVersion={currentVersionId}
              onRestore={handleRestore}
            />
          </div>
        </div>

        {/* RIGHT SIDE: Code + Preview */}
        <ResizablePanel 
          direction="vertical" 
          defaultSize={codePanelSize} 
          minSize={30} 
          maxSize={70}
        >
          {/* Code Panel (Top) */}
          <div className={styles.panelFill}>
            <CodePanel
              ast={currentAST}
              plan={currentPlan}
              code={currentCode}
              explanation={currentExplanation}
            />
          </div>

          {/* Preview Panel (Bottom) */}
          <div className={styles.panelFill}>
            <PreviewPanel ast={currentAST?.tree || null} error={error} />
          </div>
        </ResizablePanel>
      </ResizablePanel>
    </div>
  );
}
